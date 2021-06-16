package messenger.backend.chat.general.dto;

import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
public class GeneralResponsePersonalExtensionDto extends GeneralChatResponseDto{
    private UUID companionId;
}
