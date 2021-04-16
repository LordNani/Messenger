package messenger.backend.user.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
public class ChangePasswordRequestDto {
    @NotNull
    @Size(min = 4, max = 16)
    private String oldPassword;
    @NotNull
    @Size(min = 4, max = 16)
    private String newPassword;
}
