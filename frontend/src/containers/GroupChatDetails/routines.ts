/* eslint-disable max-len */
import {createRoutine} from "redux-saga-routines";
import {IGroupChatInfo, RoleEnum} from "../../api/chat/group/groupChatModels";

const createLocalRoutine = <T extends unknown>(actionName: string) =>
    createRoutine<T>(`GROUP_CHAT:${actionName}`);

export const loadGroupChatInfoRoutine = createLocalRoutine<string>('LOAD_GROUP_CHAT_INFO');
export const setGroupChatInfoRoutine = createLocalRoutine<IGroupChatInfo>('SET_GROUP_CHAT_INFO');
export const selectGroupChatIdRoutine = createLocalRoutine<string | undefined>('SELECT_GROUP_CHAT_ID');
export const deleteGroupChatRoutine = createLocalRoutine<string>('DELETE_GROUP_CHAT');
export const leaveGroupChatRoutine = createLocalRoutine<string>('LEAVE_GROUP_CHAT');
export const updateGroupChatRoutine = createLocalRoutine<IUpdateGroupChatRoutinePayload>('UPDATE_GROUP_CHAT');
export const addMemberToGroupChatRoutine = createLocalRoutine<IMemberToGroupChatRoutinePayload>('ADD_MEMBER_TO_GROUP_CHAT');
export const deleteMemberToGroupChatRoutine = createLocalRoutine<IMemberToGroupChatRoutinePayload>('DELETE_MEMBER_TO_GROUP_CHAT');
export const toggleMemberRoleGroupChatRoutine = createLocalRoutine<IToggleMemberRoleGroupChatRoutinePayload>('TOGGLE_MEMBER_ROLE_GROUP_CHAT');

export interface IUpdateGroupChatRoutinePayload {
    id: string;
    title: string;
    picture: string;
}

export interface IMemberToGroupChatRoutinePayload {
    chatId: string;
    userId: string;
}

export interface IToggleMemberRoleGroupChatRoutinePayload {
    chatId: string;
    userId: string;
    currentRole: RoleEnum;
}
