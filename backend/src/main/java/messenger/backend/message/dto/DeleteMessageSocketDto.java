package messenger.backend.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@AllArgsConstructor
@Data
public class DeleteMessageSocketDto {
    private UUID messageId;
}
