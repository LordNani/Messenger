import {createRoutine} from "redux-saga-routines";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`CHATS_LIST:${actionName}`);

export const createPersonalChatRoutine = createLocalRoutine<string>('CREATE_PERSONAL_CHAT');
