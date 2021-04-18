package messenger.backend.user.dto;


import lombok.Data;
import messenger.backend.user.UserEntity;

import java.util.UUID;

@Data
public class UserSearchInfoDto {
    public static UserSearchInfoDto from(UserEntity userEntity) {
        UserSearchInfoDto responseDto = new UserSearchInfoDto();
        responseDto.setId(userEntity.getId());
        responseDto.setUsername(userEntity.getUsername());
        responseDto.setFullName(userEntity.getUsername());
        responseDto.setPicture(userEntity.getPicture());
        return responseDto;
    }

    private UUID id;
    private String username;
    private String fullName;
    private String picture;
}
