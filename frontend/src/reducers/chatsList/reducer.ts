import {ChatsListActions} from "./actions";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {
    ADD_CHAT_TO_LIST,
    APPEND_CHAT_DETAILS_CACHED,
    APPEND_LOADING_MESSAGE,
    APPEND_READY_MESSAGE,
    REMOVE_CHAT_FROM_LIST,
    REMOVE_CHATS_LIST,
    SET_CHAT_MESSAGES,
    SET_CHATS_LIST,
    SET_FIRST_CHAT_IN_LIST,
    SET_MESSAGE_LOADED,
    SET_SEEN_CHAT,
    SET_SEEN_LIST,
    SET_SELECTED,
    UPDATE_CHAT_IN_LIST,
    UPDATE_SENDER_USERNAME
} from "./actionTypes";
import {IMessage} from "../../api/message/messageModels";

export interface IMessageLoading {
    id: string;
    text: string;
}

export interface IMessageWrapper {
    info?: IMessage;
    loading?: IMessageLoading;
}

export interface IChatCache {
    details: IChatDetails;
    messages?: IMessageWrapper[];
}

export interface IChatsListState {
    chatsList?: IChatDetails[];
    selectedId?: string;
    chatsDetailsCached: IChatCache[];
}

const initialState: IChatsListState = {
    chatsDetailsCached: [],
};

export const authReducer = (
    state: IChatsListState = initialState,
    action: ChatsListActions
): IChatsListState => {
    switch (action.type) {
        case SET_CHATS_LIST:
            return {
                ...state,
                chatsList: action.payload,
            };
        case SET_SEEN_LIST:
            return {
                ...state,
                chatsList: state.chatsList?.map(chat => ({
                    ...chat,
                    seenAt: action.payload.find(s => s.chatId === chat.id)?.seenAt
                }))
            };
        case SET_SEEN_CHAT:
            return {
                ...state,
                chatsList: state.chatsList?.map(chat => chat.id === action.payload.chatId
                    ? {
                        ...chat,
                        seenAt: action.payload.seen,
                    }
                    : chat
                )
            };
        case ADD_CHAT_TO_LIST:
            return {
                ...state,
                chatsList: state.chatsList?.find(c => c.id === action.payload.id)
                    ? state.chatsList
                    : [action.payload, ...(state.chatsList || [])],
            };
        case SET_FIRST_CHAT_IN_LIST:
            return {
                ...state,
                chatsList: [
                    ...([state.chatsList?.find(c => c.id === action.payload)] || []),
                    ...(state.chatsList?.filter(c => c.id !== action.payload) || [])
                ] as IChatDetails[],
            };
        case UPDATE_CHAT_IN_LIST:
            return {
                ...state,
                chatsList: state.chatsList?.map(c => c.id !== action.payload.id
                    ? c
                    : {
                        ...action.payload,
                        seenAt: c.seenAt
                    }
                ),
                chatsDetailsCached: state.chatsDetailsCached?.map(c => c.details.id !== action.payload.id
                    ? c
                    : {
                        ...c,
                        details: {
                            ...action.payload,
                            seenAt: c.details.seenAt
                        }
                    }
                ),
            };
        case REMOVE_CHAT_FROM_LIST:
            return {
                ...state,
                chatsList: state.chatsList?.filter(c => c.id !== action.payload),
            };
        case REMOVE_CHATS_LIST:
            return {
                ...state,
                chatsList: undefined,
                selectedId: undefined,
                chatsDetailsCached: [],
            };
        case SET_SELECTED:
            return {
                ...state,
                selectedId: action.payload,
            };
        case APPEND_CHAT_DETAILS_CACHED:
            return {
                ...state,
                chatsDetailsCached: [...state.chatsDetailsCached, {details: action.payload}],
            };
        case SET_CHAT_MESSAGES:
            return {
                ...state,
                chatsDetailsCached: state.chatsDetailsCached.map(
                    chat => chat.details.id === action.payload.chatId
                        ? {
                            ...chat,
                            messages: action.payload.messages.map(m => ({info: m}))
                        }
                        : chat
                ),
            };
        case APPEND_LOADING_MESSAGE:
            return {
                ...state,
                chatsDetailsCached: state.chatsDetailsCached.map(
                    chat => chat.details.id === action.payload.chatId
                        ? {
                            ...chat,
                            messages: chat.messages && [...chat.messages, {loading: action.payload.message}],
                        }
                        : chat
                ),
            };
        case SET_MESSAGE_LOADED:
            return {
                ...state,
                chatsDetailsCached: state.chatsDetailsCached.map(
                    chat => chat.details.id === action.payload.chatId
                        ? {
                            ...chat,
                            messages: chat.messages?.find(mw => mw.info?.id === action.payload.message.id)
                                ? chat.messages?.filter(mw => mw.loading?.id !== action.payload.loadingId)
                                : chat.messages?.map(
                                    message => message.loading?.id === action.payload.loadingId
                                    ? {info: action.payload.message}
                                    : message
                                )
                        }
                        : chat
                ),
            };
        case APPEND_READY_MESSAGE:
            return {
                ...state,
                chatsDetailsCached: state.chatsDetailsCached.map(
                    chat => chat.details.id === action.payload.chatId
                        ? {
                            ...chat,
                            messages: chat.messages?.find(
                                mw => mw.info?.id === action.payload.message.id ||
                                    mw.loading?.id === action.payload.loadingId
                            )
                                ? chat.messages
                                : [...(chat.messages || []), {info: action.payload.message}],
                        }
                        : chat
                ),
            };
        case UPDATE_SENDER_USERNAME:
            return {
                ...state,
                chatsDetailsCached: state.chatsDetailsCached.map(chat => (
                        {
                            ...chat,
                            messages: chat.messages?.map(
                                    message => message.info?.senderId === action.payload.userId
                                        ? {
                                            ...message,
                                            info: {
                                                ...message.info,
                                                senderName: action.payload.newUsername
                                            }
                                        }
                                        : message
                                )
                        }
                    )
                ),
            };
        default:
            return state;
    }
};

export default authReducer;

