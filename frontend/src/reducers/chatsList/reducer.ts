import {ChatsListActions} from "./actions";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {
    APPEND_LOADING_MESSAGE,
    APPEND_READY_MESSAGE,
    REMOVE_CHAT_FROM_LIST,
    SET_FIRST_CHAT_IN_LIST,
    SET_MESSAGE_LOADED,
    SET_SEEN_CHAT,
    SET_SELECTED,
    UPDATE_CHAT_IN_LIST
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
        case SET_SELECTED:
            return {
                ...state,
                selectedId: action.payload,
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
        default:
            return state;
    }
};

export default authReducer;

