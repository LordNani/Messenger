import React from "react";
import styles from "./PersonalChatDetails.module.sass";
import {IPersonalChatInfo} from "../../api/chat/personal/personalChatModels";
import LoaderWrapper from "../../components/LoaderWrapper/LoaderWrapper";
import UserCard from "../../components/UserCard/UserCard";
import Button from "../../components/FormComponents/Button/Button";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";
import {ICallback1} from "../../helpers/types.helper";
import {deletePersonalChatRoutine, loadPersonalChatInfoRoutine, selectPersonalChatIdRoutine} from "./routines";
import Modal from "../../components/Modal/Modal";

interface IPropsFromState {
    loadInfoLoading: boolean;
    deleteChatLoading: boolean;
    selectedId?: string;
    info?: IPersonalChatInfo;
}

interface IActions {
    loadInfo: ICallback1<string>;
    deleteChat: ICallback1<string>;
    selectId: ICallback1<string | undefined>;
}

class PersonalChatDetails extends React.Component<IPropsFromState & IActions> {

    componentDidUpdate(
        prevProps: Readonly<IPropsFromState & IActions>,
        prevState: Readonly<{}>,
        snapshot?: any
    ) {
        const {selectedId} = this.props;
        if (
            selectedId &&
            prevProps.selectedId !== selectedId
        ) {
            this.props.loadInfo(selectedId);
        }
    }

    render() {
        const {info, selectedId, selectId, loadInfoLoading, deleteChatLoading, deleteChat} = this.props;

        if (!selectedId) {
            return null;
        }

        return (
            <Modal close={() => selectId(undefined)}>
                <LoaderWrapper loading={loadInfoLoading}>
                    {info && (
                        <UserCard user={info?.companion}/>
                    )}
                    <div className={styles.buttonWrapper}>
                        <Button
                            text="Delete conversation"
                            onClick={() => deleteChat(selectedId)}
                            loading={deleteChatLoading}
                        />
                    </div>
                </LoaderWrapper>
            </Modal>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    loadInfoLoading: state.personalChat.requests.loadInfo.loading,
    deleteChatLoading: state.personalChat.requests.deleteChat.loading,
    selectedId: state.personalChat.data.selectedId,
    info: state.personalChat.data.info,
});

const mapDispatchToProps: IActions = {
    loadInfo: loadPersonalChatInfoRoutine,
    selectId: selectPersonalChatIdRoutine.fulfill,
    deleteChat: deletePersonalChatRoutine,
};

export default connect(mapStateToProps, mapDispatchToProps)(PersonalChatDetails);
