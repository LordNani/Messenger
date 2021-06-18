import {IMessage} from "../../api/message/messageModels";
import {IChatDetails} from "../../api/chat/general/generalChatModels";

export interface IMessageLoading {
    id: string;
    text: string;
}

export interface IMessageWrapper {
    info?: IMessage;
    loading?: IMessageLoading;
}

export interface IChatCache {
    details: IChatDetails;
    messages?: IMessageWrapper[];
}
