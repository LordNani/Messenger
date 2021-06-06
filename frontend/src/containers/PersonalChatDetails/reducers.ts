import {combineReducers} from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {loadPersonalChatInfoRoutine, selectPersonalChatIdRoutine, setPersonalChatInfoRoutine} from "./routines";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";
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
    loadInfo: reducerCreator([loadPersonalChatInfoRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
    [selectPersonalChatIdRoutine.FULFILL]: (state, {payload}: PayloadAction<string | undefined>) => {
        state.selectedId = payload;
    },
    [setPersonalChatInfoRoutine.FULFILL]: (state, {payload}: PayloadAction<IPersonalChatInfo>) => {
        state.info = payload;
    },
});

const personalChatReducer = combineReducers({
    requests,
    data
});

export default personalChatReducer;
