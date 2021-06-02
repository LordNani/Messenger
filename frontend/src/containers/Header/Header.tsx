import React from "react";
import styles from "./Header.module.sass";
import {ICurrentUser} from "../../api/auth/authModels";
import Modal from "../../components/Modal/Modal";
import ProfileEdit from "../../components/ProfileEdit/ProfileEdit";
import PasswordChange from "../../components/PasswordChange/PasswordChange";
import {ICallback1} from "../../helpers/types.helper";
import {IPasswordChange, IProfileEdit} from "../../api/user/userModels";
import {IAppState} from "../../reducers";
import {changePasswordRoutine, editProfileRoutine} from "./routines";
import {connect} from "react-redux";

interface IPropsFromState {
    editProfileLoading: boolean;
    editProfileError: string | null;
    changePasswordLoading: boolean;
    changePasswordError: string | null;
    currentUser?: ICurrentUser;
}

interface IActions {
    editProfile: ICallback1<IProfileEdit>;
    changePassword: ICallback1<IPasswordChange>;
}

interface IOwnProps {
    logout: () => Promise<void>;
}

interface IState {
    profileShown?: boolean;
}

class Header extends React.Component<IPropsFromState & IActions & IOwnProps, IState> {
    state = {} as IState;

    render() {
        const {
            logout, currentUser, editProfile, changePassword, editProfileError, editProfileLoading,
            changePasswordLoading, changePasswordError
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
                        <span className={styles.link} onClick={logout}>Logout</span>
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
    currentUser: state.auth.data.currentUser
});

const mapDispatchToProps: IActions = {
    editProfile: editProfileRoutine,
    changePassword: changePasswordRoutine
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
