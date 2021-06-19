import React from "react";
import styles from "./ChatHeader.module.sass";
import LoaderWrapper from "../LoaderWrapper/LoaderWrapper";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import OnlineMark from "../OnlineMark/OnlineMark";

interface IOwnProps {
    chatDetails?: IChatDetails;
    openModal: () => void;
    online?: boolean;
}

class ChatHeader extends React.Component<IOwnProps> {
    render() {
        const {chatDetails, openModal, online} = this.props;
        return (
            <div className={styles.wrapper} onClick={openModal}>
                <LoaderWrapper loading={!chatDetails}>
                    {chatDetails?.title || "-"}
                    {online && <OnlineMark />}
                </LoaderWrapper>
            </div>
        );
    }
}

export default ChatHeader;
