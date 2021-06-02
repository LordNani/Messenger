import { all } from 'redux-saga/effects';
import authPageSaga from "../containers/Auth/sagas";
import headerSaga from "../containers/Header/sagas";

export default function* rootSaga() {
    yield all([
        authPageSaga(),
        headerSaga()
    ]);
}
