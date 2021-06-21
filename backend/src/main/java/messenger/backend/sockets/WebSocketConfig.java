package messenger.backend.sockets;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import messenger.backend.auth.exceptions.JwtAuthException;
import messenger.backend.auth.exceptions.NoAccessToken;
import messenger.backend.auth.jwt.JwtTokenService;
import messenger.backend.auth.security.SecurityUser;
import messenger.backend.user.UserEntity;
import messenger.backend.user.UserService;
import messenger.backend.user.exceptions.UserNotFoundException;
import messenger.backend.utils.exceptions.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;
import java.util.UUID;


@RequiredArgsConstructor

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${frontend.url}")
    private String frontendUrl;

    private final JwtTokenService jwtTokenService;
    private final SocketSessionRepository socketSessionRepository;
    private SocketSender socketSender;
    private UserService userService;

    @Autowired
    public void setUserService(@Lazy UserService userService) {
        this.userService = userService;
    }

    @Autowired
    public void setSocketSender(@Lazy SocketSender socketSender) {
        this.socketSender = socketSender;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws").setAllowedOrigins(frontendUrl).withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @SneakyThrows
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor headerAccessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

                if (StompCommand.CONNECT.equals(headerAccessor.getCommand())) {
                    handleConnect(headerAccessor);

                } else if (StompCommand.SUBSCRIBE.equals(headerAccessor.getCommand())) {
                    handleSubscribe(headerAccessor);

                } else if (StompCommand.DISCONNECT.equals(headerAccessor.getCommand())) {
                    handleDisconnect(headerAccessor);
                }
                return message;
            }
        });
    }

    private void handleConnect(StompHeaderAccessor headerAccessor) {
        List<String> authorization = headerAccessor.getNativeHeader(jwtTokenService.getAuthHeader());
        if (authorization == null || authorization.isEmpty()) throw new NoAccessToken();

        String accessToken = authorization.get(0);
        if (accessToken == null || !jwtTokenService.validateToken(accessToken)) throw new JwtAuthException();

        UserEntity contextUser;
        try {
            contextUser = ((SecurityUser) jwtTokenService.getAuthentication(accessToken).getPrincipal()).getUserEntity();
        } catch (UsernameNotFoundException e) {
            throw new UserNotFoundException();
        }
        headerAccessor.getSessionAttributes().put("contextUser", contextUser);
        SocketSessionEntity socketSessionEntity = new SocketSessionEntity(null, contextUser);
        socketSessionRepository.saveAndFlush(socketSessionEntity);
        headerAccessor.getSessionAttributes().put("socketSessionId", socketSessionEntity.getId());

        socketSender.send(
                SubscribedOn.SWITCHED_ONLINE,
                userService.getAllOnlineCompanions(contextUser),
                contextUser.getId());
    }

    private void handleSubscribe(StompHeaderAccessor headerAccessor) {
        UserEntity contextUser = (UserEntity) headerAccessor.getSessionAttributes().get("contextUser");

        String destinationUrl = (String) headerAccessor.getHeader("simpDestination");
        String[] urlParts = destinationUrl.split("/");
        UUID urlUserId = UUID.fromString(urlParts[urlParts.length-1]);

        if (!contextUser.getId().equals(urlUserId))
            throw new ValidationException("Can't subscribe on another user messages");
    }

    private void handleDisconnect(StompHeaderAccessor headerAccessor) throws InterruptedException {
        Long sessionId = null;
        while (sessionId == null) {
            sessionId = (Long) headerAccessor.getSessionAttributes().get("socketSessionId");
            if (sessionId == null) {
                Thread.sleep(2000);
            }
        }

        socketSessionRepository.deleteById(sessionId);

        UserEntity contextUser = (UserEntity) headerAccessor.getSessionAttributes().get("contextUser");
        if (contextUser != null && socketSessionRepository.countByUser(contextUser) == 0) {
            socketSender.send(
                    SubscribedOn.SWITCHED_OFFLINE,
                    userService.getAllOnlineCompanions(contextUser),
                    contextUser.getId());
        }
    }
}
