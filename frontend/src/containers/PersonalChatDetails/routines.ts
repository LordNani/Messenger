/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";
import {IPersonalChatInfo} from "../../api/chat/personal/personalChatModels";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`PERSONAL_CHAT:${actionName}`);

export const loadPersonalChatInfoRoutine = createLocalRoutine<string>('LOAD_PERSONAL_CHAT_INFO');
export const setPersonalChatInfoRoutine = createLocalRoutine<IPersonalChatInfo>('SET_PERSONAL_CHAT_INFO');
export const selectPersonalChatIdRoutine = createLocalRoutine<string | undefined>('SELECT_PERSONAL_CHAT_ID');

