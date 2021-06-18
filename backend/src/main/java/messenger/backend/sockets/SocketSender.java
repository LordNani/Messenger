package messenger.backend.sockets;

import lombok.RequiredArgsConstructor;
import messenger.backend.chat.ChatSuperclass;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor

@Component
public class SocketSender {

    private final SimpMessagingTemplate simpMessagingTemplate;

    public void send(SubscribedOn urlPrefix, List<UUID> uuidList, Object data) {
        uuidList.forEach(uuid -> simpMessagingTemplate.convertAndSend(urlPrefix.toString() + uuid, data));
    }

    public void send(SubscribedOn urlPrefix, UUID uuid, Object data) {
        simpMessagingTemplate.convertAndSend(urlPrefix.toString() + uuid, data);
    }

    public void sendToAllMembersInChat(SubscribedOn subscribedOn, ChatSuperclass chat, Object data) {
        send(
                subscribedOn,
                getUsersByChat(chat),
                data
        );
    }

    public List<UUID> getUsersByChat(ChatSuperclass chat) {
        return chat.getUserChats().stream()
                .map(c -> c.getUser().getId())
                .collect(Collectors.toList());
    }

}
