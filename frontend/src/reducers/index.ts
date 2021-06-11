import { combineReducers } from "redux";
import {reducer as toastr, ToastrState} from 'react-redux-toastr';
import {Action} from'redux';
import { connectRouter } from 'connected-react-router';
import authPageReducer, {IAuthState} from "../containers/Auth/reducers";
import headerReducer, {IHeaderState} from "../containers/Header/reducers";
import chatsListNewReducer, {IChatsListNewState} from "../containers/ChatsList/reducers";
import chatReducer, {IChatState} from "../containers/Chat/reducers";
import personalChatReducer, {IPersonalChatState} from "../containers/PersonalChatDetails/reducers";
import groupChatReducer, {IGroupChatState} from "../containers/GroupChatDetails/reducers";

export interface IAppState {
    toastr: ToastrState;
    auth: IAuthState;
    header: IHeaderState;
    chatsList: IChatsListNewState;
    chat: IChatState;
    personalChat: IPersonalChatState;
    groupChat: IGroupChatState;
}

export interface IAppAction<T extends string, P> extends Action<T> {
    payload: P;
}

const rootReducers = (history: any) => combineReducers({
    router: connectRouter(history),
    toastr,
    auth: authPageReducer,
    header: headerReducer,
    chatsList: chatsListNewReducer,
    chat: chatReducer,
    personalChat: personalChatReducer,
    groupChat: groupChatReducer,
});

export default rootReducers;
