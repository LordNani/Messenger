package messenger.backend.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class DeleteMessageResponseDto {
    private LastMessageResponseDto lastMessage;
    private UUID chatId;
    private UUID messageId;
}
