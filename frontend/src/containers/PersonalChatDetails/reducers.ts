import {combineReducers} from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {loadPersonalChatInfoRoutine} from "./routines";
import {createReducer} from "@reduxjs/toolkit";
import {IPersonalChatInfo} from "../../api/chat/personal/personalChatModels";

export interface IPersonalChatState {
    requests: any;
    data: IPersonalChatStateData;
}

export interface IPersonalChatStateData {
    selectedId?: string;
    info?: IPersonalChatInfo;
}

const initialStateData: IPersonalChatStateData = {};

const requests = combineReducers({
    loadPersonalChatInfo: reducerCreator([loadPersonalChatInfoRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
});

const personalChatReducer = combineReducers({
    requests,
    data
});

export default personalChatReducer;
