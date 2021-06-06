/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`PERSONAL_CHAT:${actionName}`);

export const loadPersonalChatInfoRoutine = createLocalRoutine<string>('LOAD_PERSONAL_CHAT_INFO');
export const selectPersonalChatIdRoutine = createLocalRoutine<string | undefined>('SELECT_PERSONAL_CHAT_ID');

