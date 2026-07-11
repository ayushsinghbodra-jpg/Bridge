export interface LoadingState {
  isLoading: boolean;
}

export interface ErrorState {
  error: string | null;
}

export interface AsyncState extends LoadingState, ErrorState {}
