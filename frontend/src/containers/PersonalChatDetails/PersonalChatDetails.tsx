import React from "react";
import styles from "./PersonalChatDetails.module.sass";
import {IPersonalChatInfo} from "../../api/chat/personal/personalChatModels";
import personalChatService from "../../api/chat/personal/personalChatService";
import LoaderWrapper from "../../components/LoaderWrapper/LoaderWrapper";
import UserCard from "../../components/UserCard/UserCard";
import Button from "../../components/FormComponents/Button/Button";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";
import {ICallback1} from "../../helpers/types.helper";
import {loadPersonalChatInfoRoutine, selectPersonalChatIdRoutine} from "./routines";
import Modal from "../../components/Modal/Modal";

interface IPropsFromState {
    loadInfoLoading: boolean;
    selectedId?: string;
    info?: IPersonalChatInfo;
}

interface IActions {
    loadInfo: ICallback1<string>;
    selectId: ICallback1<string | undefined>;
}

interface IState {
    deleting: boolean;
}

class PersonalChatDetails extends React.Component<IPropsFromState & IActions, IState> {

    state = {
        deleting: false,
    } as IState;

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

    handleDelete = async () => {
        const id = this.props.selectedId;
        if (id) {
            this.setState({deleting: true});
            await personalChatService.deleteById(id);
            this.setState({deleting: false});
            // this.props.deleteChatFromList(id);
        }
    }

    render() {
        const {deleting} = this.state;
        const {info, selectedId, selectId, loadInfoLoading} = this.props;

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
                        <Button text="Delete conversation" onClick={this.handleDelete} loading={deleting}/>
                    </div>
                </LoaderWrapper>
            </Modal>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    loadInfoLoading: state.personalChat.requests.loadInfo.loading,
    selectedId: state.personalChat.data.selectedId,
    info: state.personalChat.data.info,
});

const mapDispatchToProps: IActions = {
    loadInfo: loadPersonalChatInfoRoutine,
    selectId: selectPersonalChatIdRoutine.fulfill,
};

export default connect(mapStateToProps, mapDispatchToProps)(PersonalChatDetails);
