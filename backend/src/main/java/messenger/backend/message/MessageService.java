package messenger.backend.message;

import lombok.RequiredArgsConstructor;
import messenger.backend.auth.jwt.JwtTokenService;
import messenger.backend.chat.exceptions.ChatNotFoundException;
import messenger.backend.chat.exceptions.ContextUserNotMemberOfChatException;
import messenger.backend.message.dto.*;
import messenger.backend.message.exceptions.MessageNotFoundException;
import messenger.backend.message.exceptions.UserNotOwnerOfMessage;
import messenger.backend.sockets.SocketSender;
import messenger.backend.sockets.SubscribedOn;
import messenger.backend.userChat.UserChat;
import messenger.backend.userChat.UserChatRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserChatRepository userChatRepository;
    private final SocketSender socketSender;

    public List<MessageResponseDto> getAllByChat(UUID chatId) {
        var currentUserId = JwtTokenService.getCurrentUserId();
        var chat = userChatRepository
                .findByUserIdAndChatId(currentUserId, chatId)
                .map(UserChat::getChat)
                .orElseThrow(ChatNotFoundException::new);

        return messageRepository.findAllMessagesByChatIdOrderByCreatedAtAsc(chat.getId())
                .stream()
                .map(MessageResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public MessageResponseDto sendMessage(SendMessageRequestDto requestDto) {
        var currentUserId = JwtTokenService.getCurrentUserId();
        var userChat = userChatRepository
                .findByUserIdAndChatId(currentUserId, requestDto.getChatId())
                .orElseThrow(ChatNotFoundException::new);

        var message = MessageEntity.builder()
                .messageBody(requestDto.getText())
                .user(userChat.getUser())
                .chat(userChat.getChat())
                .build();
        messageRepository.save(message);

        MessageResponseDto responseDto = MessageResponseDto.fromEntity(message);
        socketSender.send(
                SubscribedOn.NEW_MESSAGE,
                userChat.getChat().getUserChats().stream().map(chat -> chat.getUser().getId()).collect(Collectors.toList()),
                new MessageSocketResponseDto(requestDto.getLoadingId(), responseDto)
        );

        return responseDto;
    }

    public LastMessageResponseDto getLastMessageByChatId(UUID chatId) {
        return messageRepository
                .findLastByChatId(chatId, PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .map(LastMessageResponseDto::fromEntity)
                .orElse(null);
    }

//    @Transactional
    public void updateMessage(UpdateMessageRequestDto requestDto) {
        UUID currentUserId = JwtTokenService.getCurrentUserId();
        MessageEntity messageEntity = messageRepository.findById(requestDto.getMessageId())
                .orElseThrow(MessageNotFoundException::new);
        if (!messageEntity.getUser().getId().equals(currentUserId)) throw new UserNotOwnerOfMessage();
        if (userChatRepository.findByUserIdAndChatId(currentUserId, messageEntity.getChat().getId()).isEmpty())
            throw new ContextUserNotMemberOfChatException();

        messageEntity.setMessageBody(requestDto.getNewText());
        messageRepository.saveAndFlush(messageEntity);

        socketSender.send(
                SubscribedOn.UPDATE_MESSAGE_TEXT,
                messageEntity.getChat().getUserChats().stream().map(chat -> chat.getUser().getId()).collect(Collectors.toList()),
                new MessageSocketResponseDto(requestDto.getLoadingId(), MessageResponseDto.fromEntity(messageEntity))
        );
    }
}
