import {combineReducers} from 'redux';
import {reducerCreator} from "../../helpers/reducer.helper";
import {
    addMemberToGroupChatRoutine,
    deleteGroupChatRoutine, deleteMemberToGroupChatRoutine,
    leaveGroupChatRoutine, loadGroupChatInfoRoutine,
    selectGroupChatIdRoutine,
    setGroupChatInfoRoutine,
    toggleMemberRoleGroupChatRoutine, updateGroupChatRoutine
} from "./routines";
import {createReducer, PayloadAction} from "@reduxjs/toolkit";
import {IGroupChatInfo} from "../../api/chat/group/groupChatModels";

export interface IGroupChatState {
    requests: any;
    data: IGroupChatStateData;
}

export interface IGroupChatStateData {
    selectedId?: string;
    info?: IGroupChatInfo;
}

const initialStateData: IGroupChatStateData = {};

const requests = combineReducers({
    loadInfo: reducerCreator([loadGroupChatInfoRoutine.TRIGGER]),
    deleteChat: reducerCreator([deleteGroupChatRoutine.TRIGGER]),
    leaveChat: reducerCreator([leaveGroupChatRoutine.TRIGGER]),
    updateChat: reducerCreator([updateGroupChatRoutine.TRIGGER]),
    addMember: reducerCreator([addMemberToGroupChatRoutine.TRIGGER]),
    deleteMember: reducerCreator([deleteMemberToGroupChatRoutine.TRIGGER]),
    toggleMemberRole: reducerCreator([toggleMemberRoleGroupChatRoutine.TRIGGER]),
});

const data = createReducer(initialStateData, {
    [selectGroupChatIdRoutine.FULFILL]: (state, {payload}: PayloadAction<string | undefined>) => {
        state.selectedId = payload;
    },
    [setGroupChatInfoRoutine.FULFILL]: (state, {payload}: PayloadAction<IGroupChatInfo>) => {
        state.info = payload;
    },
});

const groupChatReducer = combineReducers({
    requests,
    data
});

export default groupChatReducer;
