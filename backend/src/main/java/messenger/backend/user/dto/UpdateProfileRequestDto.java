package messenger.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequestDto {
    @NotNull
    @Size(min = 4, max = 32)
    private String fullName;
    @NotNull
    private String bio;
    @NotNull
    @Size(min = 5, max = 256)
    private String picture;
}
