import {createRoutine} from "redux-saga-routines";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`CHATS_LIST:${actionName}`);

export const loadChatsListRoutine = createLocalRoutine('LOAD_CHATS_LIST');
export const removeChatsListRoutine = createLocalRoutine('REMOVE_CHATS_LIST');
export const setChatsListRoutine = createLocalRoutine('SET_CHATS_LIST');
export const setAllSeenAtRoutine = createLocalRoutine('SET_ALL_SEEN_AT');
export const addChatToListIfAbsentRoutine = createLocalRoutine('ADD_CHAT_TO_LIST_IF_ABSENT');
export const createPersonalChatRoutine = createLocalRoutine<string>('CREATE_PERSONAL_CHAT');
export const createGroupChatRoutine = createLocalRoutine<string>('CREATE_GROUP_CHAT');
export const setCreateChatModalShownRoutine = createLocalRoutine<boolean>('SET_CREATE_MODAL_SHOWN');
