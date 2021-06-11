/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`SOCKET_HOME:${actionName}`);

export const removeChatFromSocketRoutine = createLocalRoutine<IRemoveChatFromSocketRoutinePayload>('REMOVE_CHAT_FROM_SOCKET');

export interface IRemoveChatFromSocketRoutinePayload {
    chatId: string;
}

