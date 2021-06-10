package messenger.backend.chat.group.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import messenger.backend.chat.GroupChatEntity;
import messenger.backend.user.dto.UserShortDto;
import messenger.backend.user.exceptions.UserNotFoundException;
import messenger.backend.userChat.UserChat;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class GroupChatResponseDto {

    public static GroupChatResponseDto fromEntity(GroupChatEntity groupChatEntity, UUID currentUserId) {
        var contextUserChat = groupChatEntity
                .getUserChats()
                .stream()
                .filter(u -> u.getUser().getId().equals(currentUserId))
                .findFirst()
                .orElseThrow(UserNotFoundException::new);

        var otherUsers = groupChatEntity
                .getUserChats()
                .stream()
                .filter(u -> !u.getUser().getId().equals(currentUserId))
                .map(UserShortDto::fromEntity)
                .collect(Collectors.toList());

        return GroupChatResponseDto.builder()
                .id(groupChatEntity.getId())
                .title(groupChatEntity.getGroupName())
                .members(otherUsers)
                .picture(groupChatEntity.getPicture())
                .permissionLevel(contextUserChat.getPermissionLevel())
                .build();
    }

    private UUID id;
    private String title;
    private List<UserShortDto> members;
    private String picture;
    private UserChat.PermissionLevel permissionLevel;
}
