package messenger.backend.message;


import lombok.RequiredArgsConstructor;
import messenger.backend.message.dto.DeleteMessageRequestDto;
import messenger.backend.message.dto.MessageResponseDto;
import messenger.backend.message.dto.SendMessageRequestDto;
import messenger.backend.message.dto.UpdateMessageRequestDto;
import messenger.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/chat/{chatId}")
    public Response<List<MessageResponseDto>> getAllByChat(@PathVariable UUID chatId) {
        return Response.success(messageService.getAllByChat(chatId));
    }

    @PostMapping("/chat")
    public Response<MessageResponseDto> sendMessage(@Valid @RequestBody SendMessageRequestDto requestDto) {
        return Response.success(messageService.sendMessage(requestDto));
    }

    @PostMapping("/update")
    public void updateMessage(@Valid @RequestBody UpdateMessageRequestDto requestDto) {
        messageService.updateMessage(requestDto);
    }

    @PostMapping("/delete")
    public void deleteMessage(@Valid @RequestBody DeleteMessageRequestDto requestDto) {
        messageService.deleteMessage(requestDto);
    }
}
