package messenger.backend.user;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import lombok.SneakyThrows;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.refreshToken.RefreshTokenRepository;
import messenger.backend.user.dto.ChangePasswordRequestDto;
import messenger.backend.user.dto.UpdateProfileRequestDto;
import messenger.backend.user.dto.UserSearchInfoDto;
import messenger.backend.utils.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.jdbc.Sql;

import java.util.LinkedHashMap;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(value = {"/sql/clean.sql", "/sql/user/initUserTests.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class UserControllerIT {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }

    @Test
    @SneakyThrows
    void shouldSearchUser() {
        String jsonResponse = RestAssured
                .given()
                .queryParam("username", "user")
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/users/search")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<UserSearchInfoDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData())
                .isEqualTo(new UserSearchInfoDto(
                        UUID.fromString("9f6a075e-a4c5-44da-b7c5-5f22bb64b352"),
                        "user",
                        "Full Name"));
    }

    @Test
    @SneakyThrows
    void shouldNotSearchUser_UserNotFound() {
        String jsonResponse = RestAssured
                .given()
                .queryParam("username", "ffff")
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/users/search")
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    @Test
    void shouldUpdateProfile() throws JsonProcessingException {
        UpdateProfileRequestDto updateProfileDto = new UpdateProfileRequestDto("name", "bio");
        String json = objectMapper.writeValueAsString(updateProfileDto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/users/update-profile")
                .then()
                .statusCode(HttpStatus.SC_OK);

        UserEntity contextUser = userRepository.getByUsername("user").orElseThrow();
        assertThat(contextUser.getFullName()).isEqualTo(updateProfileDto.getFullName());
        assertThat(contextUser.getBio()).isEqualTo(updateProfileDto.getBio());
    }

    @Test
    @SneakyThrows
    void shouldChangePassword() {
        ChangePasswordRequestDto changePasswordDto = new ChangePasswordRequestDto("user", "pass");
        String json = objectMapper.writeValueAsString(changePasswordDto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/users/change-password")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<AuthResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        validateAuthResponseDto(response.getData());

        UserEntity contextUser = userRepository.getByUsername("user").orElseThrow();
        assert(passwordEncoder.matches(changePasswordDto.getNewPassword(), contextUser.getPassword()));
    }

    @Test
    @SneakyThrows
    void shouldNotChangePassword_IncorrectPassword() {
        ChangePasswordRequestDto changePasswordDto = new ChangePasswordRequestDto("0000", "pass");
        String json = objectMapper.writeValueAsString(changePasswordDto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/users/change-password")
                .then()
                .statusCode(HttpStatus.SC_CONFLICT)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    private String getAccessToken() {
        return getAccessToken("user", "user");
    }

    @SneakyThrows
    private String getAccessToken(String username, String password) {
        String json = objectMapper.writeValueAsString(
                new AuthRequestDto(username, password)
        );

        String jsonResponse = RestAssured
                .given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/auth/login")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<AuthResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});

        return response.getData().getAccessToken();
    }

    @SneakyThrows
    private void assertThatResponseWithMessageAndNoData(String jsonResponse) {
        Response<Void> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNotBlank();
        assertThat(response.getData()).isNull();
    }

    private void validateAuthResponseDto(AuthResponseDto authResponseDto) {
        UUID tokenUserId = refreshTokenRepository
                .findById(authResponseDto.getRefreshToken())
                .orElseThrow()
                .getUserEntity().getId();
        UUID realUserId = userRepository.getByUsername("user").orElseThrow().getId();
        assertThat(tokenUserId).isEqualTo(realUserId);

        RestAssured
                .given()
                .header("Authorization", authResponseDto.getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .when()
                .get("/api/auth/me")
                .then()
                .statusCode(HttpStatus.SC_OK);
    }

}