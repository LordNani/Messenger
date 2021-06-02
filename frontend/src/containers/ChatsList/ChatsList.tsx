import React from "react";
import styles from "./ChatsList.module.sass";
import ChatListElement from "../../components/ChatListElement/ChatListElement";
import {IChatDetails} from "../../api/chat/general/generalChatModels";
import LoaderWrapper from "../../components/LoaderWrapper/LoaderWrapper";
import Input from "../../components/FormComponents/Input/Input";
import Icon from "../../components/Icon/Icon";
import Modal from "../../components/Modal/Modal";
import CreatePersonalChat from "../../components/CreatePersonalChat/CreatePersonalChat";
import CreateGroupChat from "../../components/CreateGroupChat/CreateGroupChat";
import {ICallback1} from "../../helpers/types.helper";

interface IOwnProps {
    loadChatsList: () => Promise<void>;
    chatsList?: IChatDetails[];
    selectChat: (el: IChatDetails) => void;
    selectedChatId?: string;
    createPersonalChat: ICallback1<string>;
    createGroupChat: ICallback1<string>;
}

interface IState {
    filter: string;
    modal?: boolean;
}

class ChatsList extends React.Component<IOwnProps, IState> {

    state = {
        filter: ''
    } as IState;

    async componentDidMount() {
        await this.props.loadChatsList();
    }

    render() {
        const {chatsList, selectChat, selectedChatId, createPersonalChat, createGroupChat} = this.props;
        const {filter, modal} = this.state;
        const filteredChatsList = chatsList
            ?.filter(chat => chat.title.toLowerCase().includes(filter.toLowerCase()));

        return (
            <div className={styles.wrapper}>
                {modal && (
                    <Modal close={() => this.setState({modal: false})}>
                        <div className={styles.modalUsername}>
                            Create new chat...
                        </div>
                        <CreatePersonalChat
                            createPersonalChat={createPersonalChat}
                        />
                        <CreateGroupChat
                            createGroupChat={createGroupChat}
                        />
                    </Modal>
                )}
                <LoaderWrapper loading={!chatsList}>
                    <div className={styles.searchWrapper}>
                        <Input
                            value={filter}
                            onChange={(e: any) => this.setState({filter: e.target.value})}
                            placeholder="Search"
                            className={styles.search}
                        />
                    </div>
                    {filteredChatsList
                        ?.map(chat => (
                            <ChatListElement
                                key={chat.id}
                                elementData={chat}
                                onClick={() => selectChat(chat)}
                                selected={selectedChatId === chat.id}
                            />
                        ))
                    }
                    {!filteredChatsList?.length && (
                        <div className={styles.empty}>
                            No chats found.
                        </div>
                    ) }
                </LoaderWrapper>
                <div className={styles.addWrapper}>
                    <Icon
                        iconName="fas fa-plus"
                        onClick={() => this.setState({modal: true})}
                    />
                </div>
            </div>
        );
    }
}

export default ChatsList;
