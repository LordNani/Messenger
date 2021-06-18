package messenger.backend.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UpdateMessageResponseDto {
    private MessageResponseDto message;
    private LastMessageResponseDto lastMessage;
}
