package messenger.backend.sockets;

public enum SubscribedOn {
    NEW_MESSAGE("/topic/messages/"),
    READ_CHAT("/topic/chats/read/"),
    CREATE_CHAT("/topic/chats/create/"),
    DELETE_CHAT("/topic/chats/delete/"),
    UPDATE_CHAT("/topic/chats/update/"),
    UPDATE_MESSAGES_USERNAME("/topic/messages/update/username/"),
    UPDATE_MESSAGE_TEXT("/topic/messages/update/text/"),
    DELETE_MESSAGE("/topic/messages/delete/")
    ;

    private final String text;

    SubscribedOn(final String text) {
        this.text = text;
    }

    @Override
    public String toString() {
        return text;
    }
}
