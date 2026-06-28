"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

const VoiceControls = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const toggleDeafen = () => {
    setIsDeafened((prev) => !prev);
  };

  const disconnect = () => {
    console.log("Disconnected from voice channel");
  };

  return (
    <div className="flex gap-3 p-4 bg-gray-900 rounded-lg">
      <Button onClick={toggleMute}>
        {isMuted ? "Unmute" : "Mute"}
      </Button>

      <Button onClick={toggleDeafen}>
        {isDeafened ? "Undeafen" : "Deafen"}
      </Button>

      <Button onClick={disconnect}>
        Disconnect
      </Button>
    </div>
  );
};

export default VoiceControls;