import React from "react";
import {Redirect, RouteComponentProps, withRouter} from "react-router-dom";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";
import LoaderWrapper from "../../components/LoaderWrapper/LoaderWrapper";
import {ICurrentUser} from "../../api/auth/authModels";
import authService from "../../api/auth/authService";
import Header from "../Header/Header";
import ChatsList from "../ChatsList/ChatsList";
import styles from "./Home.module.sass";
import Chat from "../Chat/Chat";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import {IChatCache} from "../../reducers/chatsList/reducer";
import SockJS from "sockjs-client";
import tokenService from "../../api/token/tokenService";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {env} from "../../env";
import {ICallback1} from "../../helpers/types.helper";
import PersonalChatDetails from "../PersonalChatDetails/PersonalChatDetails";
import GroupChatDetails from "../GroupChatDetails/GroupChatDetails";
import {changeMessagesUsernameRoutine, IChangeMessagesUsernameRoutinePayload} from "../Chat/routines";
import {setCurrentUserRoutine} from "../Auth/routines";
import {
    addChatToListIfAbsentRoutine,
    ISetSeenChatRoutinePayload,
    setSeenChatRoutine,
    updateChatInListRoutine
} from "../ChatsList/routines";
import {
    IReceiveMessageFromSocketRoutinePayload,
    IRemoveChatFromSocketRoutinePayload, receiveMessageFromSocketRoutine,
    removeChatFromSocketRoutine
} from "../SocketHome/routines";

interface IActions {
    updateMessagesUsername: ICallback1<IChangeMessagesUsernameRoutinePayload>;
    setCurrentUser: ICallback1<ICurrentUser>;
    updateChatInList: ICallback1<IChatDetails>;
    addChatToListIfAbsent: ICallback1<IChatDetails>;
    removeChat: ICallback1<IRemoveChatFromSocketRoutinePayload>;
    setChatSeenAt: ICallback1<ISetSeenChatRoutinePayload>;
    receiveMessage: ICallback1<IReceiveMessageFromSocketRoutinePayload>;
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

    private afterSocketConnect = async () => {
        this.stompSubscribe('/topic/messages/', this.props.receiveMessage);
        this.stompSubscribe('/topic/chats/read/', this.props.setChatSeenAt);
        this.stompSubscribe('/topic/chats/create/',this.props.addChatToListIfAbsent);
        this.stompSubscribe('/topic/chats/delete/', this.props.removeChat);
        this.stompSubscribe('/topic/chats/update/', this.props.updateChatInList);
        this.stompSubscribe('/topic/messages/update/username/', this.props.updateMessagesUsername);
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
    removeChat: removeChatFromSocketRoutine.fulfill,
    setChatSeenAt: setSeenChatRoutine.fulfill,
    receiveMessage: receiveMessageFromSocketRoutine,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
