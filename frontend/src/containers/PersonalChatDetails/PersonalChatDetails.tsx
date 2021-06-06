import React from "react";
import styles from "./PersonalChatDetails.module.sass";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {IPersonalChatInfo} from "../../api/chat/personal/personalChatModels";
import personalChatService from "../../api/chat/personal/personalChatService";
import LoaderWrapper from "../../components/LoaderWrapper/LoaderWrapper";
import UserCard from "../../components/UserCard/UserCard";
import Button from "../../components/FormComponents/Button/Button";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";

interface IPropsFromState {}

interface IActions {}

interface IOwnProps {
    chatDetails: IChatDetails;
    deleteChatFromList: (chatId: string) => void;
}

interface IState {
    info?: IPersonalChatInfo;
    deleting: boolean;
}

class PersonalChatDetails extends React.Component<IPropsFromState & IActions & IOwnProps, IState> {

    state = {
        deleting: false,
    } as IState;

    async componentDidMount() {
        const {chatDetails} = this.props;
        const info: IPersonalChatInfo = await personalChatService.getById(chatDetails.id);
        this.setState({info});
    }

    handleDelete = async () => {
        const id = this.props.chatDetails.id;
        this.setState({deleting: true});
        await personalChatService.deleteById(id);
        this.setState({deleting: false});
        this.props.deleteChatFromList(id);
    }

    render() {
        const {info, deleting} = this.state;

        return (
            <LoaderWrapper loading={!info}>
                {info && (
                    <UserCard user={info?.companion}/>
                )}
                <div className={styles.buttonWrapper}>
                    <Button text="Delete conversation" onClick={this.handleDelete} loading={deleting}/>
                </div>
            </LoaderWrapper>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({});

const mapDispatchToProps: IActions = {};

export default connect(mapStateToProps, mapDispatchToProps)(PersonalChatDetails);
