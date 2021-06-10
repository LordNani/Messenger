package messenger.backend.user.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import messenger.backend.user.UserEntity;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UserSearchInfoDto {
    public static UserSearchInfoDto from(UserEntity userEntity) {
        UserSearchInfoDto responseDto = new UserSearchInfoDto();
        responseDto.setId(userEntity.getId());
        responseDto.setUsername(userEntity.getUsername());
        responseDto.setFullName(userEntity.getFullName());
        return responseDto;
    }

    private UUID id;
    private String username;
    private String fullName;
}
