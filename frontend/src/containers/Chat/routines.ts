/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {IMessage} from "../../api/message/messageModels";
import {IMessageLoading} from "./models";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`CHAT:${actionName}`);

export const loadFullChatRoutine = createLocalRoutine('LOAD_FULL_CHAT');
export const appendDetailsCachedRoutine = createLocalRoutine<IChatDetails>('APPEND_DETAILS_CACHED');
export const setChatMessagesRoutine = createLocalRoutine<ISetChatMessagesRoutinePayload>('SET_CHAT_MESSAGES');
export const sendMessageRoutine = createLocalRoutine<ISendMessageRoutinePayload>('SEND_MESSAGE');
export const appendLoadingMessageRoutine = createLocalRoutine<IAppendLoadingMessageRoutinePayload>('APPEND_LOADING_MESSAGE');
export const setMessageLoadedRoutine = createLocalRoutine<ISetMessageLoadedRoutinePayload>('SET_MESSAGE_LOADED');
export const changeMessagesUsernameRoutine = createLocalRoutine<IChangeMessagesUsernameRoutinePayload>('CHANGE_MESSAGES_USERNAME');
export const appendReadyMessageIfAbsentRoutine = createLocalRoutine<ISetMessageLoadedRoutinePayload>('APPEND_READY_MESSAGE_IF_ABSENT');

export interface ISetChatMessagesRoutinePayload {
    chatId: string;
    messages: IMessage[];
}

export interface ISendMessageRoutinePayload {
    chatId: string;
    text: string;
}

export interface IAppendLoadingMessageRoutinePayload {
    chatId: string;
    message: IMessageLoading;
}

export interface ISetMessageLoadedRoutinePayload {
    chatId: string;
    loadingId: string;
    message: IMessage;
}

export interface IChangeMessagesUsernameRoutinePayload {
    newUsername: string,
    userId: string
}
