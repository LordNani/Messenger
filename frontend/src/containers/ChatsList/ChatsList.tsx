import React from "react";
import styles from "./ChatsList.module.sass";
import ChatListElement from "../../components/ChatListElement/ChatListElement";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import LoaderWrapper from "../../components/LoaderWrapper/LoaderWrapper";
import Input from "../../components/FormComponents/Input/Input";
import Icon from "../../components/Icon/Icon";
import Modal from "../../components/Modal/Modal";
import CreatePersonalChat from "../../components/CreatePersonalChat/CreatePersonalChat";
import CreateGroupChat from "../../components/CreateGroupChat/CreateGroupChat";
import {IAction, ICallback1} from "../../helpers/types.helper";
import {IAppState} from "../../reducers";
import {
    createGroupChatRoutine,
    createPersonalChatRoutine,
    loadChatsListRoutine, selectChatIdRoutine,
    setCreateChatModalShownRoutine
} from "./routines";
import {connect} from "react-redux";
import {OnlineUsersObject} from "../SocketHome/reducers";

interface IPropsFromState {
    chatsList?: IChatDetails[];
    chatsListLoading: boolean;
    createPersonalChatLoading: boolean;
    createPersonalChatError: string | null;
    createGroupChatLoading: boolean;
    createGroupChatError: string | null;
    createModalShown?: boolean;
    selectedChatId?: string;
    onlineUsers: OnlineUsersObject;
}

interface IActions {
    loadChatsList: IAction;
    createPersonalChat: ICallback1<string>;
    createGroupChat: ICallback1<string>;
    setCreateModalShown: ICallback1<boolean>;
    selectChatId: ICallback1<string>;
}

interface IState {
    filter: string;
}

class ChatsList extends React.Component<IPropsFromState & IActions, IState> {

    state = {
        filter: ''
    } as IState;

    async componentDidMount() {
        this.props.loadChatsList();
    }

    render() {
        const {
            chatsList, chatsListLoading, selectChatId, selectedChatId, createPersonalChat, createGroupChat,
            createPersonalChatError, createPersonalChatLoading, createGroupChatError, createGroupChatLoading,
            createModalShown, setCreateModalShown, onlineUsers
        } = this.props;

        const {filter} = this.state;
        const filteredChatsList = chatsList
            ?.filter(chat => chat.title.toLowerCase().includes(filter.toLowerCase()));

        return (
            <div className={styles.wrapper}>
                {createModalShown && (
                    <Modal close={() => setCreateModalShown(false)}>
                        <div className={styles.modalUsername}>
                            Create new chat...
                        </div>
                        <CreatePersonalChat
                            createPersonalChat={createPersonalChat}
                            createPersonalChatError={createPersonalChatError}
                            createPersonalChatLoading={createPersonalChatLoading}
                        />
                        <CreateGroupChat
                            createGroupChat={createGroupChat}
                            createGroupChatLoading={createGroupChatLoading}
                            createGroupChatError={createGroupChatError}
                        />
                    </Modal>
                )}
                <LoaderWrapper loading={chatsListLoading}>
                    <div className={styles.searchWrapper}>
                        <Input
                            value={filter}
                            onChange={(e: any) => this.setState({filter: e.target.value})}
                            placeholder="Search"
                            className={styles.search}
                        />
                    </div>
                    {filteredChatsList
                        ?.map(chat => (
                            <ChatListElement
                                key={chat.id}
                                elementData={chat}
                                onClick={() => selectChatId(chat.id)}
                                selected={selectedChatId === chat.id}
                                online={chat.companionId && onlineUsers[chat.companionId]}
                            />
                        ))
                    }
                    {!filteredChatsList?.length && (
                        <div className={styles.empty}>
                            No chats found.
                        </div>
                    ) }
                </LoaderWrapper>
                <div className={styles.addWrapper}>
                    <Icon
                        iconName="fas fa-plus"
                        onClick={() => setCreateModalShown(true)}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    chatsList: state.chatsList.data.chatsList,
    chatsListLoading: state.chatsList.requests.loadChatsList.loading,
    createPersonalChatLoading: state.chatsList.requests.createPersonalChat.loading,
    createPersonalChatError: state.chatsList.requests.createPersonalChat.error,
    createGroupChatLoading: state.chatsList.requests.createGroupChat.loading,
    createGroupChatError: state.chatsList.requests.createGroupChat.error,
    createModalShown: state.chatsList.data.createModalShown,
    selectedChatId: state.chatsList.data.selectedChatId,
    onlineUsers: state.socketHome.data.online,
});

const mapDispatchToProps: IActions = {
    loadChatsList: loadChatsListRoutine,
    createGroupChat: createGroupChatRoutine,
    createPersonalChat: createPersonalChatRoutine,
    setCreateModalShown: setCreateChatModalShownRoutine.fulfill,
    selectChatId: selectChatIdRoutine.fulfill
};

export default connect(mapStateToProps, mapDispatchToProps)(ChatsList);
