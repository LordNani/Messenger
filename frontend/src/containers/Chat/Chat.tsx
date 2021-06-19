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
import {
    deleteMessageRoutine, editMessageRoutine, IEditMessageRoutinePayload,
    IRemoveMessageFromChatRoutinePayload,
    ISendMessageRoutinePayload,
    loadFullChatRoutine,
    sendMessageRoutine, setEditingMessageRoutine
} from "./routines";
import {deleteChatInListRoutine, removeSelectedChatIdRoutine, updateChatInListRoutine} from "../ChatsList/routines";
import {selectPersonalChatIdRoutine} from "../PersonalChatDetails/routines";
import {selectGroupChatIdRoutine} from "../GroupChatDetails/routines";
import {IChatCache, IMessageWrapper} from "./models";
import {OnlineUsersObject} from "../SocketHome/reducers";

interface IPropsFromState {
    currentUser?: ICurrentUser;
    chatsDetailsCached: IChatCache[];
    selectedChatId?: string;
    editingMessage?: IMessageWrapper;
    onlineUsers: OnlineUsersObject;
}

interface IActions {
    loadFullChat: ICallback1<string>;
    updateChatInList: ICallback1<IChatDetails>;
    removeSelectedId: IAction;
    deleteChatInList: ICallback1<string>;
    sendMessage: ICallback1<ISendMessageRoutinePayload>;
    selectPersonalChatId: ICallback1<string>;
    selectGroupChatId: ICallback1<string>;
    deleteMessage: ICallback1<IRemoveMessageFromChatRoutinePayload>;
    setEditingMessage: ICallback1<IMessageWrapper | undefined>;
    editMessage: ICallback1<IEditMessageRoutinePayload>;
}

class Chat extends React.Component<IPropsFromState & IActions> {

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

    render() {
        const {
            chatsDetailsCached, selectedChatId, currentUser, sendMessage, editMessage, onlineUsers,
            selectPersonalChatId, selectGroupChatId, deleteMessage, setEditingMessage, editingMessage
        } = this.props;
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
                    online={chatInfo?.details?.companionId && onlineUsers[chatInfo.details.companionId]}
                />
                <MessagesListWrapper
                    chatInfo={chatInfo}
                    currentUser={currentUser}
                    deleteMessage={deleteMessage}
                    setEditingMessage={setEditingMessage}
                    onlineUsers={onlineUsers}
                />
                <ChatSender
                    sendMessage={text => sendMessage({chatId: selectedChatId, text})}
                    editingMessage={editingMessage}
                    setEditingMessage={setEditingMessage}
                    editMessage={editMessage}
                    chatId={selectedChatId}
                />
            </div>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    currentUser: state.auth.data.currentUser,
    chatsDetailsCached: state.chat.data.chatsDetailsCached,
    selectedChatId: state.chatsList.data.selectedChatId,
    editingMessage: state.chat.data.editingMessage,
    onlineUsers: state.socketHome.data.online,
});

const mapDispatchToProps: IActions = {
    loadFullChat: loadFullChatRoutine,
    updateChatInList: updateChatInListRoutine.fulfill,
    removeSelectedId: removeSelectedChatIdRoutine.fulfill,
    deleteChatInList: deleteChatInListRoutine.fulfill,
    sendMessage: sendMessageRoutine,
    selectPersonalChatId: selectPersonalChatIdRoutine.fulfill,
    selectGroupChatId: selectGroupChatIdRoutine.fulfill,
    deleteMessage: deleteMessageRoutine,
    setEditingMessage: setEditingMessageRoutine.fulfill,
    editMessage: editMessageRoutine,
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
