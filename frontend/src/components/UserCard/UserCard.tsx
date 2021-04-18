import React from "react";
import styles from "./UserCard.module.sass";
import {IUserShortDto} from "../../api/user/userModels";

interface IOwnProps {
    user: IUserShortDto;
}

class UserCard extends React.Component<IOwnProps> {
    render() {
        const defaultUserPicture = 
            'https://www.pngkey.com/png/full/282-2820067_taste-testing-at-baskin-robbins-empty-profile-picture.png';
        const {user} = this.props;
        const pictureStyle = {
            maxWidth: '200px',
            height : '200px',
        };
        const wrapperPicture = {
            display: 'flex',
            justifyContent : 'center',
            padding:'20px',
        };
        return (
            <div className={styles.wrapper}>
                <div style={wrapperPicture}> <img src={user.picture || defaultUserPicture} style={pictureStyle} /></div>
                <div className={styles.fullName}>{user.fullName}</div>
                <div className={styles.username}>@{user.username}</div>
                <div className={styles.bio}>{user.bio}</div>
            </div>
        );
    }
}

export default UserCard;
