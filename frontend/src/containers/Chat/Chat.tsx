import React from "react";
import styles from "./Chat.module.sass";
import classnames from "classnames";
import ChatHeader from "../../components/ChatHeader/ChatHeader";
import MessagesListWrapper from "../../components/MessagesListWrapper/MessagesListWrapper";
import {ICurrentUser} from "../../api/auth/authModels";
import ChatSender from "../../components/ChatSender/ChatSender";
import {ChatTypeEnum, IChatDetails} from "../../api/chat/general/generalChatModels";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";
import {IAction, ICallback1} from "../../helpers/types.helper";
import {ISendMessageRoutinePayload, loadFullChatRoutine, sendMessageRoutine} from "./routines";
import {deleteChatInListRoutine, removeSelectedChatIdRoutine, updateChatInListRoutine} from "../ChatsList/routines";
import {selectPersonalChatIdRoutine} from "../PersonalChatDetails/routines";
import {selectGroupChatIdRoutine} from "../GroupChatDetails/routines";
import {IChatCache} from "./models";

interface IPropsFromState {
    currentUser?: ICurrentUser;
    chatsDetailsCached: IChatCache[];
    selectedChatId?: string;
}

interface IActions {
    loadFullChat: ICallback1<string>;
    updateChatInList: ICallback1<IChatDetails>;
    removeSelectedId: IAction;
    deleteChatInList: ICallback1<string>;
    sendMessage: ICallback1<ISendMessageRoutinePayload>;
    selectPersonalChatId: ICallback1<string>;
    selectGroupChatId: ICallback1<string>;
}

interface IState {
    modalShown: boolean;
}

class Chat extends React.Component<IPropsFromState & IActions, IState> {

    state = {
        modalShown: false,
    } as IState;

    async componentDidUpdate(
        prevProps: Readonly<IPropsFromState & IActions>,
        prevState: Readonly<{}>,
        snapshot?: any
    ) {
        const {selectedChatId} = this.props;
        if (
            selectedChatId &&
            prevProps.selectedChatId !== selectedChatId
        ) {
            this.props.loadFullChat(selectedChatId);
        }
    }

    deleteHandler = (chatId: string) => {
        this.props.removeSelectedId();
        this.props.deleteChatInList(chatId);
    }

    deleteChatFromList = async (chatId: string) => {
        this.setState({modalShown: false});
        this.deleteHandler(chatId);
    }

    render() {
        const {
            chatsDetailsCached, selectedChatId, currentUser, sendMessage, updateChatInList,
            selectPersonalChatId, selectGroupChatId
        } = this.props;
        const {modalShown} = this.state;
        const chatInfo = chatsDetailsCached.find(c => c.details.id === selectedChatId);

        if (!selectedChatId) {
            return (
                <div className={classnames(styles.wrapper, styles.flexWide)}>
                    Choose your chat
                </div>
            );
        }

        return (
            <div className={styles.wrapper}>
                <ChatHeader
                    chatDetails={chatInfo?.details}
                    openModal={() => {
                        if (chatInfo?.details.type === ChatTypeEnum.PERSONAL) {
                            selectPersonalChatId(chatInfo.details.id);
                        }
                        if (chatInfo?.details.type === ChatTypeEnum.GROUP) {
                            selectGroupChatId(chatInfo.details.id);
                        }
                    }}
                />
                <MessagesListWrapper
                    chatInfo={chatInfo}
                    currentUser={currentUser}
                />
                <ChatSender
                    sendMessage={text => sendMessage({chatId: selectedChatId, text})}
                />
            </div>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    currentUser: state.auth.data.currentUser,
    chatsDetailsCached: state.chat.data.chatsDetailsCached,
    selectedChatId: state.chatsList.data.selectedChatId
});

const mapDispatchToProps: IActions = {
    loadFullChat: loadFullChatRoutine,
    updateChatInList: updateChatInListRoutine.fulfill,
    removeSelectedId: removeSelectedChatIdRoutine.fulfill,
    deleteChatInList: deleteChatInListRoutine.fulfill,
    sendMessage: sendMessageRoutine,
    selectPersonalChatId: selectPersonalChatIdRoutine.fulfill,
    selectGroupChatId: selectGroupChatIdRoutine.fulfill,
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
