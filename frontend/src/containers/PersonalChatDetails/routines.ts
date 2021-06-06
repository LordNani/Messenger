/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`PERSONAL_CHAT:${actionName}`);

export const loadPersonalChatInfoRoutine = createLocalRoutine('LOAD_PERSONAL_CHAT_INFO');

