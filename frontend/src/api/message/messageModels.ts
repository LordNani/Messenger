export interface IMessage {
    id: string;
    text: string;
    senderName: string;
    senderId: string;
    createdAt: number;
    chatId: string;
}

export interface ILastMessage {
    text: string;
    createdAt: number;
}
