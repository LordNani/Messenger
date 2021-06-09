package messenger.backend.auth;

import lombok.RequiredArgsConstructor;
import messenger.backend.auth.access_levels.Role;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.auth.dto.RefreshTokenDto;
import messenger.backend.auth.dto.RegisterRequestDto;
import messenger.backend.auth.exceptions.InvalidUsernameOrPasswordException;
import messenger.backend.auth.exceptions.UsernameExistsException;
import messenger.backend.auth.jwt.JwtTokenService;
import messenger.backend.auth.security.SecurityUser;
import messenger.backend.refreshToken.RefreshTokenRepository;
import messenger.backend.refreshToken.RefreshTokenService;
import messenger.backend.user.UserEntity;
import messenger.backend.user.UserRepository;
import messenger.backend.user.dto.CurrentUserInfoDto;
import messenger.backend.user.exceptions.UserNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import static messenger.backend.auth.jwt.JwtTokenService.getCurrentUserId;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final UserRepository userRepository;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthResponseDto login(AuthRequestDto authRequestDto) {
        try {
            var username = authRequestDto.getUsername();
            var password = authRequestDto.getPassword();
            var authentication = authenticationManager
                    .authenticate(new UsernamePasswordAuthenticationToken(username, password));

            var userEntity = ((SecurityUser) authentication.getPrincipal()).getUserEntity();
            return buildAuthResponse(userEntity);
        } catch (BadCredentialsException e) {
            throw new InvalidUsernameOrPasswordException();
        }
    }

    public void register(RegisterRequestDto registerRequestDto) {
        if (userRepository.getByUsername(registerRequestDto.getUsername()).isPresent()) {
            throw new UsernameExistsException();
        }

        var userEntity = UserEntity.builder()
                .username(registerRequestDto.getUsername())
                .fullName(registerRequestDto.getFullName())
                .role(Role.USER)
                .password(passwordEncoder.encode(registerRequestDto.getPassword()))
                .build();
        userRepository.saveAndFlush(userEntity);
    }

    public AuthResponseDto buildAuthResponse(UserEntity userEntity) {
        var refreshTokenEntity = refreshTokenService.createByUserEntity(userEntity);

        var refreshToken = refreshTokenEntity.getId();
        var accessToken = jwtTokenService.createToken(userEntity);

        return AuthResponseDto.of(accessToken, refreshToken);
    }

    public AuthResponseDto refreshToken(RefreshTokenDto refreshTokenDto) {
        var refreshToken = refreshTokenDto.getRefreshToken();
        var refreshTokenEntity = refreshTokenService.getById(refreshToken);
        refreshTokenRepository.deleteById(refreshToken);

        var userEntity = refreshTokenEntity.getUserEntity();
        return buildAuthResponse(userEntity);
    }

    public void logout(RefreshTokenDto refreshTokenDto) {
        var refreshToken = refreshTokenDto.getRefreshToken();
        refreshTokenRepository.deleteById(refreshToken);
    }

    public CurrentUserInfoDto getCurrentUserInfo() {
        var userEntity = userRepository
                .findById(getCurrentUserId())
                .orElseThrow(UserNotFoundException::new);
        return CurrentUserInfoDto.from(userEntity);
    }
}
