package messenger.backend.chat.general;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import lombok.SneakyThrows;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.chat.general.dto.GeneralChatResponseDto;
import messenger.backend.chat.general.dto.LastSeenResponseDto;
import messenger.backend.message.MessageRepository;
import messenger.backend.message.dto.LastMessageResponseDto;
import messenger.backend.userChat.UserChatRepository;
import messenger.backend.utils.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(value = {"/sql/clean.sql", "/sql/chat/initGeneralChatTests.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class GeneralChatControllerIT {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private UserChatRepository userChatRepository;
    @Autowired
    private MessageRepository messageRepository;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }

    @Test
    @SneakyThrows
    void shouldGetChatsList() {
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/general/all")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<List<GeneralChatResponseDto>> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData()).containsExactly(
                new GeneralChatResponseDto(
                        UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"),
                        "GROUP_title",
                        "GROUP",
                        null,
                        null),
                new GeneralChatResponseDto(
                        UUID.fromString("06dfa92e-532d-4b38-bd21-355328bc4270"),
                        "Full Name 2",
                        "PERSONAL",
                        null,
                        new LastMessageResponseDto("some message text",
                                messageRepository.findById(UUID.fromString("ffffa92e-9e5e-4c0b-b661-4e790e76ea4d"))
                                        .orElseThrow().getCreatedAt().getTime()))
        );
    }

    @Test
    @SneakyThrows
    void shouldGetSeenList() {
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/general/seen")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<List<LastSeenResponseDto>> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData()).containsExactly(
                new LastSeenResponseDto(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"),
                        userChatRepository.findById(UUID.fromString("e2c146a4-9e5e-4c0b-b661-4e790e76ea4d"))
                                .orElseThrow().getSeenAt().getTime()),
                new LastSeenResponseDto(UUID.fromString("06dfa92e-532d-4b38-bd21-355328bc4270"),
                        userChatRepository.findById(UUID.fromString("e9fe386e-e194-4d97-aae5-bfc03ce8767a"))
                                .orElseThrow().getSeenAt().getTime())
        );
    }

    @Test
    @SneakyThrows
    void shouldRead() {
        Date newDate = new Date();
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .post("/api/chat/general/read/51c07af2-5ed1-4e30-b054-e5a3d51da5a5")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<Date> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData().getTime()).isGreaterThan(newDate.getTime());
        Long newSeenAtTime = userChatRepository.findById(UUID.fromString("e2c146a4-9e5e-4c0b-b661-4e790e76ea4d"))
                .orElseThrow().getSeenAt().getTime();
        assertThat(newSeenAtTime).isGreaterThan(newDate.getTime());
    }

    @Test
    @SneakyThrows
    void shouldNotRead_UserNotInChat() {
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .post("/api/chat/general/read/22222222-e194-4d97-aae5-bfc03ce8767a")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();

        Response<Date> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getData()).isNull();
        assertThat(response.getMessage()).isNotEmpty();
    }

    private String getAccessToken() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new AuthRequestDto("user", "user")
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

}
