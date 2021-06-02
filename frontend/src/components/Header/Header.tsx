import React from "react";
import styles from "./Header.module.sass";
import {ICurrentUser} from "../../api/auth/authModels";
import Modal from "../Modal/Modal";
import ProfileEdit from "../ProfileEdit/ProfileEdit";
import PasswordChange from "../PasswordChange/PasswordChange";
import {ICallback1} from "../../helpers/types.helper";
import {IPasswordChange, IProfileEdit} from "../../api/user/userModels";

interface IOwnProps {
    logout: () => Promise<void>;
    currentUser?: ICurrentUser;
    editProfile: ICallback1<IProfileEdit>;
    changePassword: ICallback1<IPasswordChange>;
}

interface IState {
    profileShown?: boolean;
}

class Header extends React.Component<IOwnProps> {
    state = {} as IState;

    render() {
        const {logout, currentUser, editProfile, changePassword} = this.props;
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

export default Header;
