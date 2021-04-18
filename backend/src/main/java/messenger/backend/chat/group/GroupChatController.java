package messenger.backend.chat.group;


import lombok.RequiredArgsConstructor;
import messenger.backend.chat.general.dto.GeneralChatResponseDto;
import messenger.backend.chat.group.dto.*;
import messenger.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor

@RestController
@RequestMapping("/api/chat/group")
public class GroupChatController {

    private final GroupChatService groupChatService;

    @GetMapping("/{chatId}")
    public Response<GroupChatResponseDto> getGroupChatInfo(@PathVariable UUID chatId) {
        return Response.success(groupChatService.getById(chatId));
    }

    @PostMapping("/create")
    public Response<GeneralChatResponseDto> createGroupChat(@Valid @RequestBody CreateGroupChatRequestDto requestDto) {
        return Response.success(groupChatService.createGroupChat(requestDto));
    }

    @PostMapping("/delete")
    public void deleteGroupChat(@Valid @RequestBody DeleteGroupChatRequestDto requestDto) {
        groupChatService.deleteGroupChat(requestDto);
    }

    @PostMapping("/users/add")
    public void addMemberToChat(@Valid @RequestBody AddMemberToGroupChatRequestDto requestDto) {
        groupChatService.addMemberToChat(requestDto);
    }

    @PostMapping("/users/remove")
    public void removeMemberFromChat(@Valid @RequestBody RemoveMemberFromGroupChatRequestDto requestDto) {
        groupChatService.removeMemberFromChat(requestDto);
    }

    @PostMapping("/leave/{chatId}")
    public void leaveChatById(@PathVariable UUID chatId) {
        groupChatService.leaveChatById(chatId);
    }


    //just for test todo delete this (or no)
    @GetMapping("/users/list")
    public Response<List<GroupChatUserInfoDto>> getChatUsersList(@RequestParam(name = "chatId") UUID chatId) {
        return Response.success(groupChatService.getChatUsersList(chatId));
    }

    @PostMapping("/users/upgrade-to-admin")
    public void upgradeToAdmin(@Valid @RequestBody UpgradeToAdminRequestDto requestDto) {
        groupChatService.upgradeToAdmin(requestDto);
    }

    @PostMapping("/users/downgrade-to-member")
    public void downgradeToMember(@Valid @RequestBody DowngradeToMemberRequestDto requestDto) {
        groupChatService.downgradeToMember(requestDto);
    }

    @PostMapping("/change-info")
    public void changeChatInfo(@Valid @RequestBody ChangeGroupChatNameRequestDto requestDto) {
        groupChatService.changeChatInfo(requestDto);
    }

    @GetMapping("/all") //just for test todo delete this
    public Response<List<Map<String, String>>> getAllChats() {
        return Response.success(groupChatService.getAllChats());
    }

}
