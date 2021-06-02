import { combineReducers } from "redux";
import {reducer as toastr, ToastrState} from 'react-redux-toastr';
import {Action} from'redux';
import { connectRouter } from 'connected-react-router';
import authReducer, {IAuthState} from "./auth/reducer";
import chatsListReducer, {IChatsListState} from "./chatsList/reducer";
import authPageReducer, {IAuthPageState} from "../containers/Auth/reducers";
import headerReducer, {IHeaderState} from "../containers/Header/reducers";

export interface IAppState {
    toastr: ToastrState;
    auth: IAuthState;
    chatsList: IChatsListState;
    authPage: IAuthPageState;
    header: IHeaderState;
}

export interface IAppAction<T extends string, P> extends Action<T> {
    payload: P;
}

const rootReducers = (history: any) => combineReducers({
    router: connectRouter(history),
    toastr,
    auth: authReducer,
    chatsList: chatsListReducer,
    authPage: authPageReducer,
    header: headerReducer
});

export default rootReducers;
