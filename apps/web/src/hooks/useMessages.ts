"use client";


import {useEffect,useCallback} from "react";
import useMessageStore from "@/store/messageStore";
import * as messageService from "@/services/api/message.service";


const useMessages = (channelId : string) => {
    const {
        messages,
        isLoading,
        isLoadingMore,
        error,
        hasMore,
        nextCursor,
        setMessages,
        prependMessages,
        addMessage,
        setLoading,
        setLoadingMore,
        setError,
        clearMessages,
    } = useMessageStore();

    useEffect(() => {
        if(!channelId) return ;
        clearMessages();
        setLoading(true);
        setError(null);

        messageService
            .getMessagae(channelId)
            .then((page) => setMessages(page.messages,page.nextCursor))
            .catch((err) => 
                setError(err instanceof Error ? err.message : "Failed to load message")  
            ).finally(() => setLoading(false));
    },[channelId,setLoading,setMessages,setError,clearMessages]);

    const loadMore = useCallback(async () => {
        if(!hasMore || isLoadingMore || !nextCursor) return;
        setLoadingMore(true);
        try {
            const page = await messageService.getMessagae(channelId,nextCursor);
            prependMessages(page.messages, page.nextCursor);
        }catch (err) {
            setError(err instanceof Error ? err.message : "failed to load more messages")
        } finally {
            setLoading(false);
        }
    }, [channelId, nextCursor, hasMore, isLoadingMore, prependMessages, setLoadingMore, setError]);


    const send = useCallback (
        async ( content : string) => {
            const optimisticMessage = {
                id: `optimistic-${Date.now()}`,
                content,
                channelId,
                createdAt: new Date().toISOString(),
                pending: true,
            } as unknown as import("@bridge/types").Message;

            addMessage(optimisticMessage);

            try {
                const real = await messageService.sendMessage(channelId,content);
                useMessageStore.setState((state) => {
                    const withoutOptimistic = state.messages.filter((m) => m.id !== optimisticMessage.id);
                    const hasEchoMessage = withoutOptimistic.some((m) =>
                        m.id === real.id ||
                        (m.channelId === real.channelId && m.content === real.content && !m.pending)
                    );

                    if (hasEchoMessage) {
                        return { messages: withoutOptimistic };
                    }

                    return {
                        messages: [...withoutOptimistic, real],
                    };
                });
                return real;
            }catch (err) {
                useMessageStore.setState((state) => ({
                messages: state.messages.filter((m) => m.id !== optimisticMessage.id),
                }));
                throw err;
            }
        },
        [channelId,addMessage]        
    );

    return {
    messages,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    send,
  };
};

export default useMessages;
