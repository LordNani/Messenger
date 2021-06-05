import React from "react";
import {Redirect, RouteComponentProps, withRouter} from "react-router-dom";
import {bindActionCreators} from "redux";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";
import LoaderWrapper from "../../components/LoaderWrapper/LoaderWrapper";
import {ICurrentUser} from "../../api/auth/authModels";
import authService from "../../api/auth/authService";
import Header from "../Header/Header";
import ChatsList from "../ChatsList/ChatsList";
import styles from "./Home.module.sass";
import Chat from "../Chat/Chat";
import {chatsListActions} from "../../reducers/chatsList/actions";
import {IChatDetails, ILastSeen} from "../../api/chat/general/generalChatModels";
import generalChatService from "../../api/chat/general/generalChatService";
import {IChatCache} from "../../reducers/chatsList/reducer";
import messageService from "../../api/message/messageService";
import {v4 as uuid} from "uuid";
import {toastr} from 'react-redux-toastr';
import SockJS from "sockjs-client";
import tokenService from "../../api/token/tokenService";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {env} from "../../env";
import {ICallback1} from "../../helpers/types.helper";
import {setCurrentUserRoutine} from "../Auth/routines";
import {addChatToListIfAbsentRoutine} from "../ChatsList/routines";

interface IPropsFromDispatch {
    actions: {
        setCurrentUser: ICallback1<ICurrentUser>;
        setSeenChat: typeof chatsListActions.setSeenChat;
        addChatToList: ICallback1<IChatDetails>;
        updateChatInList: typeof chatsListActions.updateChatInList;
        setFirstChatInList: typeof chatsListActions.setFirstChatInList;
        removeChatFromList: typeof chatsListActions.removeChatFromList;
        removeSelected: typeof chatsListActions.removeSelected;
        appendLoadingMessage: typeof chatsListActions.appendLoadingMessage;
        setMessageLoaded: typeof chatsListActions.setMessageLoaded;
        appendReadyMessage: typeof chatsListActions.appendReadyMessage,
        updateSenderUsername: typeof chatsListActions.updateSenderUsername,
    };
}

interface IPropsFromState {
    currentUser?: ICurrentUser;
    chatsList?: IChatDetails[];
    selectedChatId?: string;
    chatDetailsCached: IChatCache[];
}

interface IState {
    loading: boolean;
}

export interface IChangeMessagesUsername {
    newUsername: string,
    userId: string
}

class Home extends React.Component<RouteComponentProps & IPropsFromDispatch & IPropsFromState, IState> {

    state = {
        loading: false,
    } as IState;

    private socket: WebSocket = new SockJS(`${env.backendProtocol}://${env.backendHost}:${env.backendPort}/ws`);
    private stompClient: CompatClient = Stomp.over(this.socket);

    async componentDidMount() {
        if (authService.isLoggedIn()) {
            const currentUser = await authService.me();
            this.props.actions.setCurrentUser(currentUser);
        }

        this.configureSocket();
        this.connectSocket();
    }

    componentWillUnmount() {
        this.disconnectSocket();
    }

    private configureSocket = () => {
        this.stompClient.debug = () => {
            // empty
        };
        this.stompClient.reconnectDelay = 5000;
        this.stompClient.connectionTimeout = 5000;
    }

    private connectSocket = () => {
        this.stompClient.connect(
            {},
            this.afterSocketConnect,
            (error: any) => console.log(error)
        );
    }

    private disconnectSocket = () => {
        try {
            this.stompClient.disconnect(() => console.log('disconnected'));
        } catch (e) {
            console.log("already disconnected exception:");
        }
    }

    private afterSocketConnect = async (frame: any) => {
        console.log('Connected (my log): ' + frame);
        let accessToken = tokenService.getAccessToken();
        if (accessToken === null) {
            accessToken = '';
        }
        this.stompClient.subscribe(
            '/topic/messages/' + this.props.currentUser?.id,
            this.messageListener,
            {'Authorization': accessToken}
        );
        this.stompClient.subscribe(
            '/topic/chats/read/' + this.props.currentUser?.id,
            this.readChatListener,
            {'Authorization': accessToken}
        );
        this.stompClient.subscribe(
            '/topic/chats/create/' + this.props.currentUser?.id,
            this.createChatListener,
            {'Authorization': accessToken}
        );
        this.stompClient.subscribe(
            '/topic/chats/delete/' + this.props.currentUser?.id,
            this.deleteChatListener,
            {'Authorization': accessToken}
        );
        this.stompClient.subscribe(
            '/topic/chats/update/' + this.props.currentUser?.id,
            this.updateChatListener,
            {'Authorization': accessToken}
            );
        this.stompClient.subscribe(
            '/topic/messages/update/username/' + this.props.currentUser?.id,
            this.updateMessagesUsernameListener,
            {'Authorization': accessToken}
        );
        console.log('END OF Connected');
    }

    private messageListener = async (dataFromServer: any) => {
        const {loadingId, message: iMessage} = JSON.parse(dataFromServer.body);
        this.props.actions.appendReadyMessage(iMessage.chatId, iMessage, loadingId);
        const {selectedChatId} = this.props;
        let seenAt;
        if(selectedChatId !== iMessage.chatId && iMessage.senderId !== this.props.currentUser?.id) {
            toastr.success('New message', 'You have received a new message');
        }
        if(selectedChatId === iMessage.chatId) {
            seenAt = await generalChatService.readChat(iMessage.chatId);
        }
        const chat = this.props.chatsList?.find(c => c.id === iMessage.chatId);
        if (chat) { // todo always true?
            this.props.actions.setFirstChatInList(chat.id);
            this.props.actions.updateChatInList({
                ...chat,
                seenAt: seenAt || chat.seenAt,
                lastMessage: {text: iMessage.text, createdAt: iMessage.createdAt},
            });
        }

    }

    private readChatListener = (dataFromServer: any) => {
        const seenDto: ILastSeen = JSON.parse(dataFromServer.body);
        this.props.actions.setSeenChat(seenDto.chatId, seenDto.seenAt);
    }

    private createChatListener = (dataFromServer: any) => {
        const iChatDetails: IChatDetails = JSON.parse(dataFromServer.body);
        this.props.actions.addChatToList(iChatDetails);
    }

    private deleteChatListener = (dataFromServer: any) => {
        const chatId: string = JSON.parse(dataFromServer.body).chatId;
        if (chatId === this.props.selectedChatId) {
            this.props.actions.removeSelected();
        }
        this.props.actions.removeChatFromList(chatId);
    }

    private updateChatListener = (dataFromServer: any) => {
        const iChatDetails: IChatDetails = JSON.parse(dataFromServer.body);
        this.props.actions.updateChatInList(iChatDetails);
    }

    private updateMessagesUsernameListener = async (dataFromServer: any) => {
        const iChangeUsername: IChangeMessagesUsername = JSON.parse(dataFromServer.body);
        this.props.actions.updateSenderUsername(iChangeUsername);
    }

    render() {
        if (!authService.isLoggedIn()) {
            return <Redirect to="/auth" />;
        }

        const {currentUser} = this.props;
        const {loading} = this.state;

        return (
            <LoaderWrapper loading={!currentUser || loading}>
                <Header />
                <div className={styles.content}>
                    <ChatsList />
                    <Chat />
                </div>
            </LoaderWrapper>
        );
    }
}

const mapStateToProps = (state: IAppState) => ({
    currentUser: state.auth.data.currentUser,
    chatsList: state.chatsList.chatsList,
    selectedChatId: state.chatsList.selectedId,
    chatDetailsCached: state.chatsList.chatsDetailsCached,
});

const mapDispatchToProps = (dispatch: any) => ({
    actions:
        bindActionCreators<any, any>(
            {
                setCurrentUser: setCurrentUserRoutine.fulfill,
                addChatToList: addChatToListIfAbsentRoutine.fulfill,
                setSeenChat: chatsListActions.setSeenChat,
                removeChatFromList: chatsListActions.removeChatFromList,
                setFirstChatInList: chatsListActions.setFirstChatInList,
                updateChatInList: chatsListActions.updateChatInList,
                removeSelected: chatsListActions.removeSelected,
                appendLoadingMessage: chatsListActions.appendLoadingMessage,
                setMessageLoaded: chatsListActions.setMessageLoaded,
                appendReadyMessage: chatsListActions.appendReadyMessage,
                updateSenderUsername: chatsListActions.updateSenderUsername,
            }, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
