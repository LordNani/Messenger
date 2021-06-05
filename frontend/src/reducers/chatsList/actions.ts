import {ActionsUnion, createAction} from "../../helpers/action.helper";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {
    APPEND_LOADING_MESSAGE, APPEND_READY_MESSAGE, REMOVE_CHAT_FROM_LIST,
    SET_FIRST_CHAT_IN_LIST, SET_MESSAGE_LOADED, SET_SEEN_CHAT,
    SET_SELECTED, UPDATE_CHAT_IN_LIST, UPDATE_SENDER_USERNAME
} from "./actionTypes";
import {IMessage} from "../../api/message/messageModels";
import {IMessageLoading} from "./reducer";
import {IChangeMessagesUsername} from "../../containers/Home/Home";

export const chatsListActions = {
    setSeenChat: (chatId: string, seen: number) => createAction(SET_SEEN_CHAT, {chatId, seen}),
    updateChatInList: (chat: IChatDetails) => createAction(UPDATE_CHAT_IN_LIST, chat),
    setFirstChatInList: (chatId: string) => createAction(SET_FIRST_CHAT_IN_LIST, chatId),
    removeChatFromList: (chatId: string) => createAction(REMOVE_CHAT_FROM_LIST, chatId),
    removeSelected: () => createAction(SET_SELECTED, undefined),
    appendLoadingMessage: (chatId: string, message: IMessageLoading) => createAction(
        APPEND_LOADING_MESSAGE, {chatId, message}
    ),
    setMessageLoaded: (chatId: string, loadingId: string, message: IMessage) => createAction(
        SET_MESSAGE_LOADED, {chatId, loadingId, message}
    ),
    appendReadyMessage: (chatId: string, message: IMessage, loadingId: string) => createAction(
        APPEND_READY_MESSAGE, {chatId, message, loadingId}
    ),
    updateSenderUsername: ({newUsername, userId}: IChangeMessagesUsername) => createAction(
        UPDATE_SENDER_USERNAME, {newUsername, userId}
    ),
};

export type ChatsListActions = ActionsUnion<typeof chatsListActions>;
