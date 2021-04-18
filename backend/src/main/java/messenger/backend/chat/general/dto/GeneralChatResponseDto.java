package messenger.backend.chat.general.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import messenger.backend.chat.ChatSuperclass;
import messenger.backend.chat.GroupChatEntity;
import messenger.backend.chat.PrivateChatEntity;
import messenger.backend.chat.general.type.ChatType;
import messenger.backend.message.dto.LastMessageResponseDto;
import messenger.backend.user.UserEntity;
import messenger.backend.userChat.UserChat;

import java.util.Optional;
import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class GeneralChatResponseDto {

    public static GeneralChatResponseDto fromEntity(ChatSuperclass chat, LastMessageResponseDto lastMessage, UUID currentUserId) {
        if (chat instanceof GroupChatEntity) {
            return fromGroupEntity((GroupChatEntity) chat, lastMessage);
        } else if (chat instanceof PrivateChatEntity) {
            return fromPrivateEntity((PrivateChatEntity) chat, lastMessage, currentUserId);
        } else {
            throw new RuntimeException();
        }
    }

    public static GeneralChatResponseDto fromGroupEntity(GroupChatEntity chat, LastMessageResponseDto lastMessage) {
        return GeneralChatResponseDto.builder()
                .id(chat.getId())
                .type(ChatType.GROUP.getType())
                .title(chat.getGroupName())
                .picture(Optional.ofNullable(chat.getPicture()))
                .lastMessage(lastMessage)
                .build();
    }

    public static GeneralChatResponseDto fromPrivateEntity(PrivateChatEntity chat, LastMessageResponseDto lastMessage, UUID currentUserId) {
        var companionName = chat.getUserChats()
                .stream()
                .filter(uc -> !uc.getUser().getId().equals(currentUserId))
                .findFirst()
                .map(UserChat::getUser)
                .map(UserEntity::getFullName)
                .orElseThrow(RuntimeException::new);
        var companionPicture = chat.getUserChats()
                .stream()
                .filter(uc -> !uc.getUser().getId().equals(currentUserId))
                .findFirst()
                .map(UserChat::getUser)
                .map(UserEntity::getPicture)
                ;
        return GeneralChatResponseDto.builder()
                .id(chat.getId())
                .type(ChatType.PERSONAL.getType())
                .title(companionName)
                .picture(companionPicture)
                .lastMessage(lastMessage)
                .build();
    }

    private UUID id;
    private String title;
    private String type;
    private Optional<String> picture;
    private LastMessageResponseDto lastMessage;
}
