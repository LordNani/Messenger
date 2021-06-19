import React from "react";
import {IAppState} from "../../reducers";
import {connect} from "react-redux";
import {ICurrentUser} from "../../api/auth/authModels";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import SockJS from "sockjs-client";
import tokenService from "../../api/token/tokenService";
import {CompatClient, Stomp} from "@stomp/stompjs";
import {env} from "../../env";
import {IAction, ICallback1} from "../../helpers/types.helper";
import {changeMessagesUsernameRoutine, IChangeMessagesUsernameRoutinePayload} from "../Chat/routines";
import {setCurrentUserRoutine} from "../Auth/routines";
import {
    addChatToListIfAbsentRoutine,
    ISetSeenChatRoutinePayload,
    setSeenChatRoutine,
    updateChatInListRoutine
} from "../ChatsList/routines";
import {
    fetchInitialOnlineRoutine,
    IReceiveMessageFromSocketRoutinePayload,
    IRemoveChatFromSocketRoutinePayload, ISetUserTypingRoutinePayload,
    receiveMessageFromSocketRoutine,
    removeChatFromSocketRoutine,
    removeMessageFromSocketRoutine, setUserTypingRoutine,
    switchOfflineRoutine,
    switchOnlineRoutine,
    updateMessageFromSocketRoutine
} from "./routines";
import {IDeleteMessageResponse, IUpdateMessageResponse} from "../../api/message/messageModels";

interface IOwnProps {
    children: JSX.Element[];
}

interface IActions {
    updateMessagesUsername: ICallback1<IChangeMessagesUsernameRoutinePayload>;
    setCurrentUser: ICallback1<ICurrentUser>;
    updateChatInList: ICallback1<IChatDetails>;
    addChatToListIfAbsent: ICallback1<IChatDetails>;
    removeChat: ICallback1<IRemoveChatFromSocketRoutinePayload>;
    setChatSeenAt: ICallback1<ISetSeenChatRoutinePayload>;
    receiveMessage: ICallback1<IReceiveMessageFromSocketRoutinePayload>;
    removeMessage: ICallback1<IDeleteMessageResponse>;
    updateMessage: ICallback1<IUpdateMessageResponse>;
    fetchInitialOnline: IAction;
    switchOnline: ICallback1<string>;
    switchOffline: ICallback1<string>;
    setTyping: ICallback1<ISetUserTypingRoutinePayload>;
}

interface IPropsFromState {
    currentUser?: ICurrentUser;
}

class SocketHome extends React.Component<IOwnProps & IActions & IPropsFromState> {
    private socket: WebSocket = new SockJS(`${env.backendProtocol}://${env.backendHost}:${env.backendPort}/ws`);
    private stompClient: CompatClient = Stomp.over(this.socket);

    async componentDidMount() {
        this.props.fetchInitialOnline();
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
            {'Authorization': tokenService.getAccessToken() as string},
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
            response => listener(JSON.parse(response.body)),
            {}
        );
    }

    private afterSocketConnect = async () => {
        this.stompSubscribe('/topic/messages/', this.props.receiveMessage);
        this.stompSubscribe('/topic/chats/read/', this.props.setChatSeenAt);
        this.stompSubscribe('/topic/chats/create/',this.props.addChatToListIfAbsent);
        this.stompSubscribe('/topic/chats/delete/', this.props.removeChat);
        this.stompSubscribe('/topic/chats/update/', this.props.updateChatInList);
        this.stompSubscribe('/topic/messages/update/username/', this.props.updateMessagesUsername);
        this.stompSubscribe('/topic/messages/delete/', this.props.removeMessage);
        this.stompSubscribe('/topic/messages/update/text/', this.props.updateMessage);
        this.stompSubscribe('/topic/users/switched-online/', this.props.switchOnline);
        this.stompSubscribe('/topic/users/switched-offline/', this.props.switchOffline);
        this.stompSubscribe('/topic/users/typing/', this.props.setTyping);
    }

    render() {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
}

const mapStateToProps = (state: IAppState) => ({
    currentUser: state.auth.data.currentUser,
});

const mapDispatchToProps: IActions = {
    updateMessagesUsername: changeMessagesUsernameRoutine.fulfill,
    setCurrentUser: setCurrentUserRoutine.fulfill,
    updateChatInList: updateChatInListRoutine.fulfill,
    addChatToListIfAbsent: addChatToListIfAbsentRoutine.fulfill,
    removeChat: removeChatFromSocketRoutine.fulfill,
    setChatSeenAt: setSeenChatRoutine.fulfill,
    receiveMessage: receiveMessageFromSocketRoutine,
    removeMessage: removeMessageFromSocketRoutine.fulfill,
    updateMessage: updateMessageFromSocketRoutine.fulfill,
    fetchInitialOnline: fetchInitialOnlineRoutine,
    switchOnline: switchOnlineRoutine.fulfill,
    switchOffline: switchOfflineRoutine.fulfill,
    setTyping: setUserTypingRoutine.fulfill,
};

export default connect(mapStateToProps, mapDispatchToProps)(SocketHome);
