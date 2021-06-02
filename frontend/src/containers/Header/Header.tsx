import React from "react";
import styles from "./Header.module.sass";
import {ICurrentUser} from "../../api/auth/authModels";
import Modal from "../../components/Modal/Modal";
import ProfileEdit from "../../components/ProfileEdit/ProfileEdit";
import PasswordChange from "../../components/PasswordChange/PasswordChange";
import {ICallback1} from "../../helpers/types.helper";
import {IPasswordChange, IProfileEdit} from "../../api/user/userModels";
import {IAppState} from "../../reducers";
import {editProfileRoutine} from "./routines";
import {connect} from "react-redux";

interface IPropsFromState {
    editProfileLoading: boolean;
    editProfileError: string | null;
    currentUser?: ICurrentUser;
}

interface IActions {
    editProfile: ICallback1<IProfileEdit>;
}

interface IOwnProps {
    logout: () => Promise<void>;
    changePassword: ICallback1<IPasswordChange>;
}

interface IState {
    profileShown?: boolean;
}

class Header extends React.Component<IPropsFromState & IActions & IOwnProps, IState> {
    state = {} as IState;

    render() {
        const {logout, currentUser, editProfile, changePassword, editProfileError, editProfileLoading} = this.props;
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
    currentUser: state.auth.currentUser
});

const mapDispatchToProps: IActions = {
    editProfile: editProfileRoutine
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
