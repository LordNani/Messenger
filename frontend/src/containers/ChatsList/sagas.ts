// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {all, call, put, takeEvery} from 'redux-saga/effects';
import {loadChatsListRoutine, removeChatsListRoutine, setAllSeenAtRoutine, setChatsListRoutine} from "./routines";
import {toastr} from "react-redux-toastr";
import generalChatService from "../../api/chat/general/generalChatService";

function* loadChatsListSaga() {
    try {
        yield put(removeChatsListRoutine.fulfill());
        const list = yield call(generalChatService.getChatsList);
        list.sort((a, b) => {
            if (!a.lastMessage) {
                return -1;
            }
            if (!b.lastMessage) {
                return 1;
            }
            return b.lastMessage.createdAt - a.lastMessage.createdAt;
        });
        yield put(setChatsListRoutine.fulfill(list));
        const seenAtList = yield call(generalChatService.getSeenAt);
        yield put(setAllSeenAtRoutine.fulfill(seenAtList));
        yield put(loadChatsListRoutine.success());
    } catch (e) {
        yield put(loadChatsListRoutine.failure(e?.message));
        toastr.success('Error', 'Unexpected error');
    }
}

export default function* chatsListNewSaga() {
    yield all([
        yield takeEvery(loadChatsListRoutine.TRIGGER, loadChatsListSaga)
    ]);
}
