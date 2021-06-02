import React from "react";
import styles from "./Header.module.sass";
import {ICurrentUser} from "../../api/auth/authModels";
import Modal from "../../components/Modal/Modal";
import ProfileEdit from "../../components/ProfileEdit/ProfileEdit";
import PasswordChange from "../../components/PasswordChange/PasswordChange";
import {IAction, ICallback1} from "../../helpers/types.helper";
import {IPasswordChange, IProfileEdit} from "../../api/user/userModels";
import {IAppState} from "../../reducers";
import {changePasswordRoutine, editProfileRoutine} from "./routines";
import {connect} from "react-redux";
import {logoutRoutine} from "../Auth/routines";
import Button from "../../components/FormComponents/Button/Button";

interface IPropsFromState {
    editProfileLoading: boolean;
    editProfileError: string | null;
    changePasswordLoading: boolean;
    changePasswordError: string | null;
    logoutLoading: boolean;
    currentUser?: ICurrentUser;
}

interface IActions {
    editProfile: ICallback1<IProfileEdit>;
    changePassword: ICallback1<IPasswordChange>;
    logout: IAction;
}

interface IState {
    profileShown?: boolean;
}

class Header extends React.Component<IPropsFromState & IActions, IState> {
    state = {} as IState;

    render() {
        const {
            logout, currentUser, editProfile, changePassword, editProfileError, editProfileLoading,
            changePasswordLoading, changePasswordError, logoutLoading
        } = this.props;
        const {profileShown} = this.state;

        return (
            <>
                {profileShown && currentUser && (
                    <Modal close={() => this.setState({profileShown: false})}>
                        <div className={styles.modalUsername}>
                            {currentUser?.username}
                        </div>
                        <ProfileEdit
                            currentUser={currentUser}
                            editProfile={editProfile}
                            editProfileError={editProfileError}
                            editProfileLoading={editProfileLoading}
                        />
                        <PasswordChange
                            changePassword={changePassword}
                            changePasswordLoading={changePasswordLoading}
                            changePasswordError={changePasswordError}
                        />
                    </Modal>
                )}
                <div className={styles.header}>
                    <h1>Messenger</h1>
                    <div className={styles.links}>
                        <span
                            className={styles.name}
                            onClick={() => this.setState({profileShown: true})}
                        >
                            {currentUser?.fullName}
                        </span>
                        <Button
                            onClick={logout}
                            loading={logoutLoading}
                            text="Logout"
                        />
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps: (state:IAppState) => IPropsFromState = state => ({
    editProfileError: state.header.requests.editProfile.error,
    editProfileLoading: state.header.requests.editProfile.loading,
    changePasswordError: state.header.requests.changePassword.error,
    changePasswordLoading: state.header.requests.changePassword.loading,
    logoutLoading: state.auth.requests.logout.loading,
    currentUser: state.auth.data.currentUser
});

const mapDispatchToProps: IActions = {
    editProfile: editProfileRoutine,
    changePassword: changePasswordRoutine,
    logout: logoutRoutine
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
