package messenger.backend.user.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@AllArgsConstructor
@Data
public class UserIsTypingDto {
    private UUID chatId;
    private String fullName;
}
