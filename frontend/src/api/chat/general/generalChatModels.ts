import {ILastMessage} from "../../message/messageModels";

export enum ChatTypeEnum {
    PERSONAL = "PERSONAL",
    GROUP = "GROUP",
}

export interface IChatDetails {
    id: string;
    type: ChatTypeEnum;
    title: string;
    picture: string;
    lastMessage: ILastMessage | null;
    seenAt?: number;
}

export interface ILastSeen {
    chatId: string;
    seenAt: number;
}
