import { all } from 'redux-saga/effects';
import authPageSaga from "../containers/Auth/sagas";
import headerSaga from "../containers/Header/sagas";
import chatsListNewSaga from "../containers/ChatsList/sagas";
import chatSaga from "../containers/Chat/sagas";
import personalChatSaga from "../containers/PersonalChatDetails/sagas";
import groupChatSaga from "../containers/GroupChatDetails/sagas";
import socketHomeSaga from "../containers/SocketHome/sagas";

export default function* rootSaga() {
    yield all([
        authPageSaga(),
        headerSaga(),
        chatsListNewSaga(),
        chatSaga(),
        personalChatSaga(),
        groupChatSaga(),
        socketHomeSaga(),
    ]);
}
