const listeners = new Set<(conversationId: string) => void>();

export const emitGroupMessagesCleared = (conversationId: string) => {
  listeners.forEach((listener) => listener(conversationId));
};

export const subscribeGroupMessagesCleared = (
  listener: (conversationId: string) => void,
) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
