package messenger.backend.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.auth.dto.RefreshTokenDto;
import messenger.backend.auth.dto.RegisterRequestDto;
import messenger.backend.auth.jwt.JwtTokenService;
import messenger.backend.refreshToken.RefreshTokenRepository;
import messenger.backend.user.UserEntity;
import messenger.backend.user.UserRepository;
import messenger.backend.user.dto.CurrentUserInfoDto;
import messenger.backend.utils.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.jdbc.Sql;

import java.lang.reflect.Field;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthControllerIT {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RefreshTokenRepository refreshTokenRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtTokenService jwtTokenService;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }

    private final String defaultUsername = "user";
    private final String defaultPassword = "user";

    @AfterEach
    void cleanDB(){
        refreshTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @Sql("/sql/addDefaultUser.sql")
    void shouldLogin() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new AuthRequestDto(defaultUsername, defaultPassword)
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

        assertThat(response.getData().getAccessToken()).isNotEmpty();
        assertThat(response.getData().getRefreshToken()).isNotNull();
        validateAuthResponseDto(response.getData());
    }

    @ParameterizedTest
    @Sql({"/sql/clean.sql", "/sql/addDefaultUser.sql"})
    @CsvSource({
            "user, xxxx",
            "xxxx, user",
            "xxxx, xxxx"
    })
    void shouldNotLogin_invalidUsernameOrPassword(String username, String password) throws JsonProcessingException {
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
                    .statusCode(HttpStatus.SC_BAD_REQUEST)
                .extract().asString();

        Response<AuthResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});

        assertThat(response.getMessage()).isNotEmpty();
        assertThat(response.getData()).isNull();
    }

    @Test
    void shouldRegister() throws JsonProcessingException {
        RegisterRequestDto registerRequestDto = new RegisterRequestDto("username", "fullName", "password");
        String json = objectMapper.writeValueAsString(registerRequestDto);

        RestAssured
                .given()
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                    .body(json)
                .when()
                    .post("/api/auth/register")
                .then()
                    .statusCode(HttpStatus.SC_OK);

        UserEntity userEntity = userRepository.getByUsername(registerRequestDto.getUsername()).orElseThrow();
        assertThat(registerRequestDto).usingRecursiveComparison().ignoringFields("password").isEqualTo(userEntity);
        assert(passwordEncoder.matches(registerRequestDto.getPassword(), userEntity.getPassword()));
    }

    @Test
    @Sql("/sql/addDefaultUser.sql")
    void shouldNotRegister_UsernameAlreadyExists() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new RegisterRequestDto(defaultUsername, "Full Name", "pass")
        );

        String jsonResponse = RestAssured
                .given()
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                    .body(json)
                .when()
                    .post("/api/auth/register")
                .then()
                    .statusCode(HttpStatus.SC_BAD_REQUEST)
                .extract().asString();

        Response<AuthResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});

        assertThat(response.getMessage()).isNotEmpty();
        assertThat(response.getData()).isNull();
    }

    @Test
    @Sql("/sql/auth/initLogoutTests.sql")
    void shouldLogout() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new RefreshTokenDto(UUID.fromString("96810518-56a5-4786-96e2-4f7434dea41b"))
        );

        RestAssured
                .given()
                    .header("Authorization", getAccessToken())
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                    .body(json)
                .when()
                    .post("/api/auth/logout")
                .then()
                    .statusCode(HttpStatus.SC_OK);
    }

    @Test
    @Sql("/sql/auth/initLogoutTests.sql")
    void shouldLogout_NoSuchRefreshToken() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new RefreshTokenDto(UUID.fromString("11110111-1101-1111-1101-101111000110"))
        );

        RestAssured
                .given()
                    .header("Authorization", getAccessToken())
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                    .body(json)
                .when()
                    .post("/api/auth/logout")
                .then()
                    .statusCode(HttpStatus.SC_OK);
    }

    @Test
    @Sql("/sql/addDefaultUser.sql")
    void shouldGetMe() throws JsonProcessingException {
        String jsonResponse = RestAssured
                .given()
                    .header("Authorization", getAccessToken())
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                .when()
                    .get("/api/auth/me")
                .then()
                    .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<CurrentUserInfoDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getData()).isNotNull();
        assertThat(response.getMessage()).isNull();

        CurrentUserInfoDto userInfoDto = response.getData();
        UserEntity userEntity = userRepository.getByUsername(defaultUsername).orElseThrow();
        assertThat(userInfoDto).usingRecursiveComparison().isEqualTo(userEntity);
    }

    @Test
    void shouldNotGetMe_UserDoesNotExist() throws JsonProcessingException { // todo decide to remove it or not
        String jsonResponse = RestAssured
                .given()
                    .header("Authorization", jwtTokenService.createToken(UserEntity.generateUser()))
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                .when()
                    .get("/api/auth/me")
                .then()
                    .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();

        Response<CurrentUserInfoDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getData()).isNull();
        assertThat(response.getMessage()).isNotEmpty();
    }

    @Test
    @Sql("/sql/addDefaultUser.sql")
    void shouldNotGetMe_accessTokenExpired() throws NoSuchFieldException, IllegalAccessException, JsonProcessingException {
        Field validityInMilliseconds = jwtTokenService.getClass().getDeclaredField("validityInMilliseconds");
        validityInMilliseconds.setAccessible(true);
        validityInMilliseconds.set(jwtTokenService, 1);

        String jsonResponse = RestAssured
                .given()
                    .header("Authorization", getAccessToken())
                .when()
                    .get("/api/auth/me")
                .then()
                    .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();

        Response<CurrentUserInfoDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getData()).isNull();
        assertThat(response.getMessage()).isNotEmpty();
        validityInMilliseconds.set(jwtTokenService, 100000);
    }

    @Test
    void shouldNotGetMe_invalidAccessToken() throws JsonProcessingException {
        String jsonResponse = RestAssured
                .given()
                    .header("Authorization", "")
                .when()
                    .get("/api/auth/me")
                .then()
                    .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();

        Response<CurrentUserInfoDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getData()).isNull();
        assertThat(response.getMessage()).isNotEmpty();
    }

    @Test
    void shouldNotGetMe_NoAccessToken() {
        RestAssured
                .when()
                    .get("/api/auth/me")
                .then()
                    .statusCode(HttpStatus.SC_FORBIDDEN);
    }

    @Test
    @Sql("/sql/auth/initRefreshTokenTests.sql")
    void shouldRefreshToken() throws JsonProcessingException {
        RefreshTokenDto refreshTokenDto = new RefreshTokenDto(UUID.fromString("96810518-56a5-4786-96e2-4f7434dea41b"));
        String json = objectMapper.writeValueAsString(
                refreshTokenDto
        );

        String jsonResponse = RestAssured
                .given()
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                    .body(json)
                .when()
                    .post("/api/auth/refresh")
                .then()
                    .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<AuthResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getData()).isNotNull();
        assertThat(response.getMessage()).isNull();
        validateAuthResponseDto(response.getData());
        assertThat(refreshTokenRepository.findById(refreshTokenDto.getRefreshToken())).isEmpty();
    }

    @Test
    @Sql("/sql/auth/initRefreshTokenTests.sql")
    void shouldNotRefreshToken_RefreshTokenExpired() throws JsonProcessingException {
        RefreshTokenDto refreshTokenDto = new RefreshTokenDto(UUID.fromString("11111111-56a5-4786-96e2-4f7434dea41b"));
        String json = objectMapper.writeValueAsString(
                refreshTokenDto
        );

        String jsonResponse = RestAssured
                .given()
                    .contentType(MediaType.APPLICATION_JSON_VALUE)
                    .body(json)
                .when()
                    .post("/api/auth/refresh")
                .then()
                    .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();

        Response<AuthResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getData()).isNull();
        assertThat(response.getMessage()).isNotNull();
    }

    private String getAccessToken() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new AuthRequestDto(defaultUsername, defaultPassword)
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

    private void validateAuthResponseDto(AuthResponseDto authResponseDto) {
        UUID tokenUserId = refreshTokenRepository
                .findById(authResponseDto.getRefreshToken())
                .orElseThrow()
                .getUserEntity().getId();
        UUID realUserId = userRepository.getByUsername(defaultUsername).orElseThrow().getId();
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