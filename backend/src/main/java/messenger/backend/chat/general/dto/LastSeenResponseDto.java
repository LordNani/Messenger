package messenger.backend.chat.general.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import messenger.backend.userChat.UserChat;

import java.util.UUID;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class LastSeenResponseDto {

    public static LastSeenResponseDto fromEntity(UserChat userChat) {
        return LastSeenResponseDto.builder()
                .chatId(userChat.getChat().getId())
                .seenAt(userChat.getSeenAt().getTime())
                .build();
    }

    private UUID chatId;
    private Long seenAt;
}
