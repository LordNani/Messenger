import { all } from 'redux-saga/effects';
import authPageSaga from "../containers/Auth/sagas";

export default function* rootSaga() {
    yield all([
        authPageSaga(),
    ]);
}
