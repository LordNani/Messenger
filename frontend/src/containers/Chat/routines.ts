import {createRoutine} from "redux-saga-routines";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`CHAT:${actionName}`);

export const loadFullChatRoutine = createLocalRoutine('LOAD_FULL_CHAT');
