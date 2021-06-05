import {createRoutine} from "redux-saga-routines";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {IMessage} from "../../api/message/messageModels";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`CHAT:${actionName}`);

export const loadFullChatRoutine = createLocalRoutine('LOAD_FULL_CHAT');
export const appendDetailsCachedRoutine = createLocalRoutine<IChatDetails>('APPEND_DETAILS_CACHED');
export const setChatMessagesRoutine = createLocalRoutine<ISetChatMessagesRoutinePayload>('SET_CHAT_MESSAGES');
export const setSeenChatRoutine = createLocalRoutine<ISetSeenChatRoutinePayload>('SET_SEEN_CHAT');

export interface ISetChatMessagesRoutinePayload {
    chatId: string;
    messages: IMessage[];
}

export interface ISetSeenChatRoutinePayload {
    chatId: string;
    seen: number;
}
