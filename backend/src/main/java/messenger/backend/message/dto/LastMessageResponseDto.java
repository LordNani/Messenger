package messenger.backend.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import messenger.backend.message.MessageEntity;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class LastMessageResponseDto {

    public static LastMessageResponseDto fromEntity(MessageEntity messageEntity) {
        return LastMessageResponseDto.builder()
                .text(messageEntity.getMessageBody())
                .createdAt(messageEntity.getCreatedAt().getTime())
                .build();
    }

    private String text;
    private Long createdAt;
}
