/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";
import {IDeleteMessageResponse, IMessage, IUpdateMessageResponse} from "../../api/message/messageModels";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`SOCKET_HOME:${actionName}`);

export const removeChatFromSocketRoutine = createLocalRoutine<IRemoveChatFromSocketRoutinePayload>('REMOVE_CHAT_FROM_SOCKET');
export const receiveMessageFromSocketRoutine = createLocalRoutine<IReceiveMessageFromSocketRoutinePayload>('RECEIVE_MESSAGE_FROM_SOCKET');
export const removeMessageFromSocketRoutine = createLocalRoutine<IDeleteMessageResponse>('REMOVE_MESSAGE_FROM_SOCKET');
export const updateMessageFromSocketRoutine = createLocalRoutine<IUpdateMessageResponse>('UPDATE_MESSAGE_FROM_SOCKET');
export const fetchInitialOnlineRoutine = createLocalRoutine('FETCH_INITIAL_ONLINE');
export const setInitialOnlineRoutine = createLocalRoutine<string[]>('SET_INITIAL_ONLINE');
export const switchOnlineRoutine = createLocalRoutine<string>('SWITCH_ONLINE');
export const switchOfflineRoutine = createLocalRoutine<string>('SWITCH_OFFLINE');
export const setUserTypingRoutine = createLocalRoutine<ISetUserTypingRoutinePayload>('SET_USER_TYPING');

export interface IRemoveChatFromSocketRoutinePayload {
    chatId: string;
}

export interface IReceiveMessageFromSocketRoutinePayload {
    loadingId: string;
    message: IMessage;
}

export interface ISetUserTypingRoutinePayload {
    chatId: string;
    fullName: string;
}

