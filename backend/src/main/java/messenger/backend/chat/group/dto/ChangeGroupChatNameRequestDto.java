package messenger.backend.chat.group.dto;


import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.lang.NonNull;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;
import java.util.UUID;

@Data
@NoArgsConstructor
public class ChangeGroupChatNameRequestDto {
    @NonNull
    private UUID chatId;
    @NotBlank
    @Size(min = 4, max = 32)
    private String newChatName;
    @Size(max=256)
    private String picture;
}
