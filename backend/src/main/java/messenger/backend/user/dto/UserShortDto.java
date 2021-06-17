package messenger.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import messenger.backend.userChat.UserChat;

import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserShortDto {
    public static UserShortDto fromEntity(UserChat userChat) {
        return UserShortDto.builder()
                .id(userChat.getUser().getId())
                .fullName(userChat.getUser().getFullName())
                .username(userChat.getUser().getUsername())
                .bio(userChat.getUser().getBio())
                .picture(userChat.getUser().getPicture())
                .permissionLevel(userChat.getPermissionLevel())
                .build();
    }

    private UUID id;
    private String fullName;
    private String username;
    private String bio;
    private String picture;
    private UserChat.PermissionLevel permissionLevel;
}
