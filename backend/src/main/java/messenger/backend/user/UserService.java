package messenger.backend.user;

import lombok.RequiredArgsConstructor;
import messenger.backend.auth.AuthService;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.auth.jwt.JwtTokenService;
import messenger.backend.chat.general.GeneralChatRepository;
import messenger.backend.chat.general.dto.GeneralChatResponseDto;
import messenger.backend.chat.personal.PersonalChatRepository;
import messenger.backend.message.MessageService;
import messenger.backend.refreshToken.RefreshTokenRepository;
import messenger.backend.sockets.SocketSender;
import messenger.backend.sockets.SubscribedOn;
import messenger.backend.user.dto.*;
import messenger.backend.user.exceptions.IncorrectPasswordException;
import messenger.backend.user.exceptions.UserNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PersonalChatRepository personalChatRepository;
    private final GeneralChatRepository generalChatRepository;
    private final MessageService messageService;
    private final SocketSender socketSender;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthService authService;

    public UserSearchInfoDto getUserSearchInfo(String username) {
        return userRepository.getByUsername(username)
                .map(UserSearchInfoDto::from)
                .orElseThrow(UserNotFoundException::new);
    }

    public void updateProfile(UpdateProfileRequestDto requestDto) {
        UserEntity contextUser = JwtTokenService.getContextUser();
        contextUser.setFullName(requestDto.getFullName());
        contextUser.setBio(requestDto.getBio());
        contextUser.setPicture(requestDto.getPicture());
        userRepository.saveAndFlush(contextUser);

        personalChatRepository.findAllByUserId(contextUser.getId())
                .forEach(personalChat -> { // todo optimize?
                    UUID targetUserId = personalChat.getUserChats().stream()
                            .map(c -> c.getUser().getId())
                            .filter(userId -> !userId.equals(contextUser.getId()))
                            .findFirst()
                            .orElseThrow();
                    GeneralChatResponseDto response = GeneralChatResponseDto.fromPrivateEntity(
                            personalChat,
                            messageService.getLastMessageByChatId(personalChat.getId()),
                            targetUserId
                    );
                    socketSender.send(
                            SubscribedOn.UPDATE_CHAT,
                            targetUserId,
                            response
                    );
                });

        generalChatRepository.findAllByMemberId(contextUser.getId()).stream()
                .flatMap(groupChat -> groupChat.getUserChats().stream())
                .map(userChat -> userChat.getUser().getId())
                .distinct()
                .forEach(targetUserId ->
                    socketSender.send(
                            SubscribedOn.UPDATE_MESSAGES_USERNAME,
                            targetUserId,
                            new ChangeUsernameResponseDto(contextUser.getId(), contextUser.getFullName()))
                );
    }

    public AuthResponseDto changeUserPassword(ChangePasswordRequestDto requestDto) {
        UserEntity contextUser = JwtTokenService.getContextUser();
        boolean isPasswordsMatches = passwordEncoder.matches(requestDto.getOldPassword(), contextUser.getPassword());
        if (!isPasswordsMatches) throw new IncorrectPasswordException();

        refreshTokenRepository.deleteAllByUserEntityId(contextUser.getId());
        contextUser.setPassword(passwordEncoder.encode(requestDto.getNewPassword()));
        userRepository.saveAndFlush(contextUser);
        return authService.buildAuthResponse(contextUser);
    }

    public List<UUID> getAllOnlineCompanions() {
        UserEntity contextUser = JwtTokenService.getContextUser();
        return userRepository.findAllCompanions(contextUser.getId()).stream()
                .filter(user -> !user.getSessions().isEmpty())
                .map(UserEntity::getId)
                .collect(Collectors.toList());
    }

    public void userIsTyping(ChatIdDto chatIdDto) {
        socketSender.send(
                SubscribedOn.USER_IS_TYPING,
                getAllOnlineCompanions(),
                new UserIsTypingDto(chatIdDto.getChatId(), JwtTokenService.getCurrentUserId())
        );
    }
}
