/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";
import {IMessage} from "../../api/message/messageModels";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`SOCKET_HOME:${actionName}`);

export const removeChatFromSocketRoutine = createLocalRoutine<IRemoveChatFromSocketRoutinePayload>('REMOVE_CHAT_FROM_SOCKET');
export const receiveMessageFromSocketRoutine = createLocalRoutine<IReceiveMessageFromSocketRoutinePayload>('RECEIVE_MESSAGE_FROM_SOCKET');

export interface IRemoveChatFromSocketRoutinePayload {
    chatId: string;
}

export interface IReceiveMessageFromSocketRoutinePayload {
    loadingId: string;
    message: IMessage;
}

