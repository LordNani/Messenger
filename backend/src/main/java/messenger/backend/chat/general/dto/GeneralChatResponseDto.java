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
import messenger.backend.userChat.UserChat;

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
                .picture(chat.getPicture())
                .lastMessage(lastMessage)
                .build();
    }

    public static GeneralChatResponseDto fromPrivateEntity(PrivateChatEntity chat, LastMessageResponseDto lastMessage, UUID currentUserId) {
        var companion = chat.getUserChats()
                .stream()
                .filter(uc -> !uc.getUser().getId().equals(currentUserId))
                .findFirst()
                .map(UserChat::getUser)
                .orElseThrow(RuntimeException::new);
        var companionName = companion.getFullName();

        var companionPicture = companion.getPicture();

        GeneralResponsePersonalExtensionDto dto = new GeneralResponsePersonalExtensionDto();
        dto.setId(chat.getId());
        dto.setType(ChatType.PERSONAL.getType());
        dto.setTitle(companionName);
        dto.setPicture(companionPicture);
        dto.setLastMessage(lastMessage);
        dto.setCompanionId(companion.getId());
        return dto;
    }

    private UUID id;
    private String title;
    private String type;
    private String picture;
    private LastMessageResponseDto lastMessage;
}
