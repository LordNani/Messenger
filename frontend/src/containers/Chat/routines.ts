/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {IDeleteMessageResponse, IMessage} from "../../api/message/messageModels";
import {IMessageLoading, IMessageWrapper} from "./models";

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
export const deleteMessageRoutine = createLocalRoutine<IRemoveMessageFromChatRoutinePayload>('DELETE_MESSAGE');
export const removeMessageFromChatRoutine = createLocalRoutine<IRemoveMessageFromChatRoutinePayload>('REMOVE_MESSAGE_FROM_CHAT');
export const setDeletingMessageInChatRoutine = createLocalRoutine<IChatMessageBooleanValueRoutinePayload>('SET_DELETING_MESSAGE_IN_CHAT');
export const setEditingMessageRoutine = createLocalRoutine<IMessageWrapper | undefined>('SET_EDITING_MESSAGE');
export const editMessageRoutine = createLocalRoutine<IEditMessageRoutinePayload>('EDIT_MESSAGE');
export const editMessageInChatRoutine = createLocalRoutine<IMessage>('EDIT_MESSAGE_IN_CHAT');
export const setEditingMessageInChatRoutine = createLocalRoutine<IChatMessageBooleanValueRoutinePayload>('SET_EDITING_MESSAGE_IN_CHAT');

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

export interface IRemoveMessageFromChatRoutinePayload {
    chatId: string;
    messageId: string;
}

export interface IChatMessageBooleanValueRoutinePayload {
    chatId: string;
    messageId: string;
    value?: boolean;
}

export interface IEditMessageRoutinePayload {
    messageId: string;
    chatId: string;
    newText?: string;
}
