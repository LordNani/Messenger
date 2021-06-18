export interface IMessage {
    id: string;
    text: string;
    senderName: string;
    senderId: string;
    createdAt: number;
    chatId: string;
    isChanged: boolean;
}

export interface IUpdateMessageResponse {
    message: IMessage;
    lastMessage: ILastMessage;
}

export interface ILastMessage {
    text: string;
    createdAt: number;
}

export interface IDeleteMessageResponse {
    lastMessage: ILastMessage;
    chatId: string;
    messageId: string;
}
