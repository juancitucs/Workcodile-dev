// WorkCodile - Mock Messaging System for Local Development

export const useMessagingMock = () => {
  return {
    messages: [],
    sendMessage: () => console.log('Mock message sent'),
    conversations: [],
    isConnected: false,
    // Sistema de mensajería simulado
  };
};