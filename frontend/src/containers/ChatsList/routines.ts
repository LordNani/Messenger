/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {ILastMessage} from "../../api/message/messageModels";

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
export const selectChatIdRoutine = createLocalRoutine<string>('SELECT_CHAT_ID');
export const removeSelectedChatIdRoutine = createLocalRoutine('REMOVE_SELECTED_CHAT_ID');
export const setSeenChatRoutine = createLocalRoutine<ISetSeenChatRoutinePayload>('SET_SEEN_CHAT');
export const updateChatInListRoutine = createLocalRoutine<IChatDetails>('UPDATE_CHAT_IN_LIST');
export const updateChatLastMessageAndReadRoutine = createLocalRoutine<IUpdateChatLastMessageRoutinePayload>('UPDATE_CHAT_LAST_MESSAGE_AND_READ');
export const updateChatLastMessageRoutine = createLocalRoutine<IUpdateChatLastMessageRoutinePayload>('UPDATE_CHAT_LAST_MESSAGE');
export const deleteChatInListRoutine = createLocalRoutine<string>('DELETE_CHAT_IN_LIST');
export const setFirstChatInListRoutine = createLocalRoutine<string>('SET_FIRST_CHAT_IN_LIST');

export interface ISetSeenChatRoutinePayload {
    chatId: string;
    seenAt: number;
}

export interface IUpdateChatLastMessageRoutinePayload {
    chatId: string;
    lastMessage: ILastMessage;
}
