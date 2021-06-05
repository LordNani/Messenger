import React from "react";
import styles from "./Chat.module.sass";
import {IChatCache} from "../../reducers/chatsList/reducer";
import classnames from "classnames";
import ChatHeader from "../../components/ChatHeader/ChatHeader";
import MessagesListWrapper from "../../components/MessagesListWrapper/MessagesListWrapper";
import {ICurrentUser} from "../../api/auth/authModels";
import ChatSender from "../../components/ChatSender/ChatSender";
import Modal from "../../components/Modal/Modal";
import {ChatTypeEnum, IChatDetails} from "../../api/chat/general/generalChatModels";
import PersonalChatDetails from "../../components/PersonalChatDetails/PersonalChatDetails";
import GroupChatDetails from "../../components/GroupChatDetails/GroupChatDetails";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";

interface IPropsFromState {
    currentUser?: ICurrentUser;
    chatsDetailsCached: IChatCache[];
    selectedChatId?: string;
}

interface IActions {
}

interface IOwnProps {
    loadChatDetails: (id: string) => Promise<void>;
    loadChatMessages: (id: string) => Promise<void>;
    sendMessage: (text: string) => Promise<void>;
    deleteChatFromList: (chatId: string) => void;
    readChat: (chatId: string) => Promise<void>;
    updateChatInList: (chat: IChatDetails) => void;
}

interface IState {
    modalShown: boolean;
}

class Chat extends React.Component<IPropsFromState & IActions & IOwnProps, IState> {

    state = {
        modalShown: false,
    } as IState;

    async componentDidUpdate(
        prevProps: Readonly<IPropsFromState & IActions & IOwnProps>,
        prevState: Readonly<{}>,
        snapshot?: any
    ) {
        const {selectedChatId, chatsDetailsCached} = this.props;
        if (
            selectedChatId &&
            prevProps.selectedChatId !== selectedChatId
        ) {
            if (!chatsDetailsCached.find(c => c.details.id === selectedChatId)) {
                await this.props.loadChatDetails(selectedChatId);
                await this.props.loadChatMessages(selectedChatId);
            }
            await this.props.readChat(selectedChatId);
        }
    }

    deleteChatFromList = async (chatId: string) => {
        this.setState({modalShown: false});
        this.props.deleteChatFromList(chatId);
    }

    render() {
        const {chatsDetailsCached, selectedChatId, currentUser, sendMessage, updateChatInList} = this.props;
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
                {modalShown && (
                    <Modal close={() => this.setState({modalShown: false})}>
                        {chatInfo?.details?.type === ChatTypeEnum.PERSONAL && (
                            <PersonalChatDetails
                                chatDetails={chatInfo.details}
                                deleteChatFromList={this.deleteChatFromList}
                            />
                        )}
                        {chatInfo?.details?.type === ChatTypeEnum.GROUP && (
                            <GroupChatDetails
                                chatDetails={chatInfo.details}
                                deleteChatFromList={this.deleteChatFromList}
                                updateChatInList={updateChatInList}
                            />
                        )}
                    </Modal>
                )}
                <ChatHeader
                    chatDetails={chatInfo?.details}
                    openModal={() => this.setState({modalShown: true})}
                />
                <MessagesListWrapper
                    chatInfo={chatInfo}
                    currentUser={currentUser}
                />
                <ChatSender sendMessage={sendMessage}/>
            </div>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    currentUser: state.auth.data.currentUser,
    chatsDetailsCached: state.chat.data.chatsDetailsCached,
    selectedChatId: state.chatsListNew.data.selectedChatId
});

const mapDispatchToProps: IActions = {};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
