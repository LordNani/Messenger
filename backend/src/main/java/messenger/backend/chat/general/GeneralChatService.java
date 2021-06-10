package messenger.backend.chat.general;

import lombok.RequiredArgsConstructor;
import messenger.backend.auth.jwt.JwtTokenService;
import messenger.backend.chat.exceptions.ContextUserNotMemberOfChatException;
import messenger.backend.chat.general.dto.GeneralChatResponseDto;
import messenger.backend.chat.general.dto.LastSeenResponseDto;
import messenger.backend.message.MessageService;
import messenger.backend.sockets.SocketSender;
import messenger.backend.sockets.SubscribedOn;
import messenger.backend.user.UserRepository;
import messenger.backend.user.exceptions.UserNotFoundException;
import messenger.backend.userChat.UserChatRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class GeneralChatService {

    private final GeneralChatRepository generalChatRepository;
    private final UserChatRepository userChatRepository;
    private final UserRepository userRepository;
    private final MessageService messageService;
    private final SocketSender socketSender;

    public List<GeneralChatResponseDto> getAll() {
        var currentUserId = JwtTokenService.getCurrentUserId();
        return generalChatRepository
                .findAllByMemberId(currentUserId)
                .stream()
                .map(chat -> GeneralChatResponseDto.fromEntity(
                        chat,
                        messageService.getLastMessageByChatId(chat.getId()),
                        currentUserId)
                )
                .collect(Collectors.toList());
    }

    public List<LastSeenResponseDto> getSeenAt() {
        var currentUserId = JwtTokenService.getCurrentUserId();
        var currentUser = userRepository.findById(currentUserId).orElseThrow(UserNotFoundException::new);
        return currentUser
                .getUserChats()
                .stream()
                .map(LastSeenResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Date read(UUID chatId) {
        var currentUserId = JwtTokenService.getCurrentUserId();
        var userChat = userChatRepository
                .findByUserIdAndChatId(currentUserId, chatId)
                .orElseThrow(ContextUserNotMemberOfChatException::new);
        userChat.setSeenAt(new Date());
        userChatRepository.save(userChat);

        socketSender.send(SubscribedOn.READ_CHAT, currentUserId, LastSeenResponseDto.fromEntity(userChat));

        return userChat.getSeenAt();
    }
}
