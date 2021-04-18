package messenger.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import messenger.backend.user.UserEntity;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
public class CurrentUserInfoDto {
    public static CurrentUserInfoDto from(UserEntity userEntity) {
        return CurrentUserInfoDto.builder()
                .id(userEntity.getId())
                .username(userEntity.getUsername())
                .fullName(userEntity.getFullName())
                .bio(userEntity.getBio())
                .picture(userEntity.getPicture())
                .build();
    }

    private UUID id;
    private String username;
    private String fullName;
    private String bio;
    private String picture;
}
