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
import {IAction} from "../../helpers/types.helper";
import PersonalChatDetails from "../PersonalChatDetails/PersonalChatDetails";
import GroupChatDetails from "../GroupChatDetails/GroupChatDetails";
import {loadCurrentUserRoutine} from "../Auth/routines";
import SocketHome from "../SocketHome/SocketHome";

interface IActions {
    loadCurrentUser: IAction;
}

interface IPropsFromState {
    currentUser?: ICurrentUser;
    currentUserLoading: boolean;
}

class Home extends React.Component<RouteComponentProps & IActions & IPropsFromState> {

    async componentDidMount() {
        if (authService.isLoggedIn()) {
            this.props.loadCurrentUser();
        }
    }

    render() {
        if (!authService.isLoggedIn()) {
            return <Redirect to="/auth"/>;
        }

        const {currentUser, currentUserLoading} = this.props;

        return (
            <LoaderWrapper loading={!currentUser || currentUserLoading}>
                <SocketHome>
                    <Header/>
                    <div className={styles.content}>
                        <ChatsList/>
                        <Chat/>
                    </div>
                    <PersonalChatDetails/>
                    <GroupChatDetails/>
                </SocketHome>
            </LoaderWrapper>
        );
    }
}

const mapStateToProps = (state: IAppState): IPropsFromState => ({
    currentUser: state.auth.data.currentUser,
    currentUserLoading: state.auth.requests.load.loading,
});

const mapDispatchToProps: IActions = {
    loadCurrentUser: loadCurrentUserRoutine,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
