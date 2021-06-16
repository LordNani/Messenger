package messenger.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordRequestDto {
    @NotNull
    @Size(min = 4, max = 16)
    private String oldPassword;
    @NotNull
    @Size(min = 4, max = 16)
    private String newPassword;
}
