// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, call, put, takeEvery, select} from 'redux-saga/effects';
import {PayloadAction} from "@reduxjs/toolkit";
import {
    addMemberToGroupChatRoutine,
    deleteGroupChatRoutine,
    deleteMemberToGroupChatRoutine,
    IMemberToGroupChatRoutinePayload,
    IToggleMemberRoleGroupChatRoutinePayload,
    leaveGroupChatRoutine,
    loadGroupChatInfoRoutine,
    selectGroupChatIdRoutine,
    setGroupChatInfoRoutine, toggleMemberRoleGroupChatRoutine,
} from "./routines";
import {toastr} from "react-redux-toastr";
import {deleteChatInListRoutine} from "../ChatsList/routines";
import groupChatService from "../../api/chat/group/groupChatService";
import {RoleEnum} from "../../api/chat/group/groupChatModels";
import {IAppState} from "../../reducers";

function* loadGroupChatInfoSaga({payload}: PayloadAction<string>) {
    try {
        const info = yield call(groupChatService.getById, payload);
        yield put(setGroupChatInfoRoutine.fulfill(info));
        yield put(loadGroupChatInfoRoutine.success());
    } catch (e) {
        yield put(loadGroupChatInfoRoutine.failure(e?.message));
        toastr.error("Unexpected error", "Couldn't load group chat info");
    }
}

function* deleteGroupChatSaga({payload}: PayloadAction<string>) {
    try {
        yield call(groupChatService.deleteById, payload);
        yield put(deleteChatInListRoutine.fulfill(payload));
        yield put(selectGroupChatIdRoutine.fulfill(undefined));
        yield put(deleteGroupChatRoutine.success());
    } catch (e) {
        yield put(deleteGroupChatRoutine.failure(e?.message));
        toastr.error("Unexpected error", e?.message);
    }
}

function* leaveGroupChatSaga({payload}: PayloadAction<string>) {
    try {
        yield call(groupChatService.leaveChatById, payload);
        yield put(deleteChatInListRoutine.fulfill(payload));
        yield put(selectGroupChatIdRoutine.fulfill(undefined));
        yield put(leaveGroupChatRoutine.success());
    } catch (e) {
        yield put(leaveGroupChatRoutine.failure(e?.message));
        toastr.error("Unexpected error", e?.message);
    }
}

function* addMemberGroupChatSaga({payload}: PayloadAction<IMemberToGroupChatRoutinePayload>) {
    try {
        yield call(groupChatService.addMember, payload.chatId, payload.userId);
        yield put(addMemberToGroupChatRoutine.success());
        const selectedId = yield select((state: IAppState) => state.groupChat.data.selectedId);
        yield put(loadGroupChatInfoRoutine.trigger(selectedId));
    } catch (e) {
        yield put(addMemberToGroupChatRoutine.failure(e?.message));
        toastr.error("Unexpected error", e?.message);
    }
}

function* deleteMemberGroupChatSaga({payload}: PayloadAction<IMemberToGroupChatRoutinePayload>) {
    try {
        yield call(groupChatService.deleteMember, payload.chatId, payload.userId);
        yield put(deleteMemberToGroupChatRoutine.success());
        const selectedId = yield select((state: IAppState) => state.groupChat.data.selectedId);
        yield put(loadGroupChatInfoRoutine.trigger(selectedId));
    } catch (e) {
        yield put(deleteMemberToGroupChatRoutine.failure(e?.message));
        toastr.error("Unexpected error", e?.message);
    }
}

function* toggleMemberRoleGroupChatSaga({payload}: PayloadAction<IToggleMemberRoleGroupChatRoutinePayload>) {
    try {
        if (payload.currentRole === RoleEnum.ADMIN) {
            yield call(groupChatService.downgradeMember, payload.chatId, payload.userId);
        }
        if (payload.currentRole === RoleEnum.MEMBER) {
            yield call(groupChatService.upgradeMember, payload.chatId, payload.userId);
        }
        yield put(toggleMemberRoleGroupChatRoutine.success());
        const selectedId = yield select((state: IAppState) => state.groupChat.data.selectedId);
        yield put(loadGroupChatInfoRoutine.trigger(selectedId));
    } catch (e) {
        yield put(toggleMemberRoleGroupChatRoutine.failure(e?.message));
        toastr.error("Unexpected error", e?.message);
    }
}

export default function* groupChatSaga() {
    yield all([
        yield takeEvery(loadGroupChatInfoRoutine.TRIGGER, loadGroupChatInfoSaga),
        yield takeEvery(deleteGroupChatRoutine.TRIGGER, deleteGroupChatSaga),
        yield takeEvery(leaveGroupChatRoutine.TRIGGER, leaveGroupChatSaga),
        yield takeEvery(addMemberToGroupChatRoutine.TRIGGER, addMemberGroupChatSaga),
        yield takeEvery(deleteMemberToGroupChatRoutine.TRIGGER, deleteMemberGroupChatSaga),
        yield takeEvery(toggleMemberRoleGroupChatRoutine.TRIGGER, toggleMemberRoleGroupChatSaga),
    ]);
}
