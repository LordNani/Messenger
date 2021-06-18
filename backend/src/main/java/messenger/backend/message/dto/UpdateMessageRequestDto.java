package messenger.backend.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class UpdateMessageRequestDto {
    @NotNull
    private UUID messageId;
    @NotBlank
    @Size(min = 1, max = 1024)
    private String newText;
}
