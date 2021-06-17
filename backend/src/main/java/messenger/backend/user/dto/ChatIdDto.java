package messenger.backend.user.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;
import java.util.UUID;

@Data
public class ChatIdDto {
    @NotNull
    private UUID chatId;
}
