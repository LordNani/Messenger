package messenger.backend.sockets;

import lombok.RequiredArgsConstructor;
import messenger.backend.chat.personal.PersonalChatService;
import messenger.backend.user.UserEntity;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Objects;

@RequiredArgsConstructor

@Component
public class WebSocketEventListener {

    private final SocketSessionRepository socketSessionRepository;
    private final SocketSender socketSender;
    private final PersonalChatService personalChatService;

    @EventListener
    public void handleSessionConnectedEvent(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = MessageHeaderAccessor.getAccessor(
                Objects.requireNonNull(event.getMessage().getHeaders().get("simpConnectMessage", GenericMessage.class)),
                StompHeaderAccessor.class
        );
        UserEntity contextUser = (UserEntity) headerAccessor.getSessionAttributes().get("contextUser");

        socketSender.send(
                SubscribedOn.SWITCHED_ONLINE,
                personalChatService.getAllPersonalChatsCompanions(contextUser.getId()),
                contextUser.getId());
    }

    @EventListener
    public void handleSessionDisconnectEvent(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        UserEntity contextUser = (UserEntity) headerAccessor.getSessionAttributes().get("contextUser");

        if (contextUser != null && socketSessionRepository.countByUser(contextUser) == 0) {
            socketSender.send(
                    SubscribedOn.SWITCHED_OFFLINE,
                    personalChatService.getAllPersonalChatsCompanions(contextUser.getId()),
                    contextUser.getId());
        }
    }

}
