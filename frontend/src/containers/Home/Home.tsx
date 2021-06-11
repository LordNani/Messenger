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
import {toastr} from 'react-redux-toastr';
import SockJS from "sockjs-client";
import tokenService from "../../api/token/tokenService";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {env} from "../../env";
import {ICallback1} from "../../helpers/types.helper";
import PersonalChatDetails from "../PersonalChatDetails/PersonalChatDetails";
import GroupChatDetails from "../GroupChatDetails/GroupChatDetails";
import {changeMessagesUsernameRoutine, IChangeMessagesUsernameRoutinePayload} from "../Chat/routines";
import {setCurrentUserRoutine} from "../Auth/routines";
import {addChatToListIfAbsentRoutine, updateChatInListRoutine} from "../ChatsList/routines";

interface IActions {
    updateMessagesUsername: ICallback1<IChangeMessagesUsernameRoutinePayload>;
    setCurrentUser: ICallback1<ICurrentUser>;
    updateChatInList: ICallback1<IChatDetails>;
    addChatToListIfAbsent: ICallback1<IChatDetails>;
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

class Home extends React.Component<RouteComponentProps & IActions & IPropsFromState, IState> {

    state = {
        loading: false,
    } as IState;

    private socket: WebSocket = new SockJS(`${env.backendProtocol}://${env.backendHost}:${env.backendPort}/ws`);
    private stompClient: CompatClient = Stomp.over(this.socket);

    async componentDidMount() {
        if (authService.isLoggedIn()) {
            const currentUser = await authService.me();
            this.props.setCurrentUser(currentUser);
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

    private stompSubscribe = (prefix: string, listener: ICallback1<any>) => {
        const endpoint = prefix + this.props.currentUser?.id;
        this.stompClient.subscribe(
            endpoint,
            response => {
                console.log(endpoint);
                listener(JSON.parse(response.body));
            },
            {'Authorization': tokenService.getAccessToken() as string}
        );
    }

    private afterSocketConnect = async (frame: any) => {
        this.stompSubscribe('/topic/messages/', this.messageListener);
        this.stompSubscribe('/topic/chats/read/', this.readChatListener);
        this.stompSubscribe('/topic/chats/create/',this.props.addChatToListIfAbsent);
        this.stompSubscribe('/topic/chats/delete/', this.deleteChatListener);
        this.stompSubscribe('/topic/chats/update/', this.props.updateChatInList);
        this.stompSubscribe('/topic/messages/update/username/', this.props.updateMessagesUsername);
    }

    private messageListener = async (dataFromServer: any) => {
        const {loadingId, message: iMessage} = dataFromServer;
        // this.props.actions.appendReadyMessage(iMessage.chatId, iMessage, loadingId);
        const {selectedChatId} = this.props;
        let seenAt;
        if (selectedChatId !== iMessage.chatId && iMessage.senderId !== this.props.currentUser?.id) {
            toastr.success('New message', 'You have received a new message');
        }
        if (selectedChatId === iMessage.chatId) {
            seenAt = await generalChatService.readChat(iMessage.chatId);
        }
        const chat = this.props.chatsList?.find(c => c.id === iMessage.chatId);
        if (chat) { // todo always true?
            // this.props.actions.setFirstChatInList(chat.id);
            // this.props.actions.updateChatInList({
            //     ...chat,
            //     seenAt: seenAt || chat.seenAt,
            //     lastMessage: {text: iMessage.text, createdAt: iMessage.createdAt},
            // });
        }

    }

    private readChatListener = (dataFromServer: any) => {
        const seenDto: ILastSeen = dataFromServer;
        // this.props.actions.setSeenChat(seenDto.chatId, seenDto.seenAt);
    }

    private deleteChatListener = (dataFromServer: any) => {
        const chatId: string = dataFromServer.chatId;
        if (chatId === this.props.selectedChatId) {
            // this.props.actions.removeSelected();
        }
        // this.props.actions.removeChatFromList(chatId);
    }

    render() {
        if (!authService.isLoggedIn()) {
            return <Redirect to="/auth"/>;
        }

        const {currentUser} = this.props;
        const {loading} = this.state;

        return (
            <LoaderWrapper loading={!currentUser || loading}>
                <Header/>
                <div className={styles.content}>
                    <ChatsList/>
                    <Chat/>
                </div>
                <PersonalChatDetails/>
                <GroupChatDetails/>
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

const mapDispatchToProps: IActions = {
    updateMessagesUsername: changeMessagesUsernameRoutine.fulfill,
    setCurrentUser: setCurrentUserRoutine.fulfill,
    updateChatInList: updateChatInListRoutine.fulfill,
    addChatToListIfAbsent: addChatToListIfAbsentRoutine.fulfill,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
