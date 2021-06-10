package messenger.backend.user;

import lombok.RequiredArgsConstructor;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.user.dto.ChangePasswordRequestDto;
import messenger.backend.user.dto.UpdateProfileRequestDto;
import messenger.backend.user.dto.UserSearchInfoDto;
import messenger.backend.utils.Response;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.util.List;

@RequiredArgsConstructor

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/search") //todo @NotEmpty validation
    public Response<UserSearchInfoDto> getUserSearchInfo(@RequestParam(name = "username") @NotBlank String username) {
        return Response.success(userService.getUserSearchInfo(username));
    }

    @PostMapping("/update-profile")
    public void updateProfile(@Valid @RequestBody UpdateProfileRequestDto requestDto) {
        userService.updateProfile(requestDto);
    }

    @PostMapping("/change-password")
    public Response<AuthResponseDto> changeUserPassword(@Valid @RequestBody ChangePasswordRequestDto requestDto) {
        return Response.success(userService.changeUserPassword(requestDto));
    }

}
