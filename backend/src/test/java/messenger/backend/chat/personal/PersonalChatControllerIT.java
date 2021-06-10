package messenger.backend.chat.personal;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import lombok.SneakyThrows;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.chat.general.dto.GeneralChatResponseDto;
import messenger.backend.chat.personal.dto.CreatePersonalChatRequestDto;
import messenger.backend.chat.personal.dto.DeletePersonalChatRequestDto;
import messenger.backend.chat.personal.dto.PersonalChatResponseDto;
import messenger.backend.user.UserEntity;
import messenger.backend.user.dto.UserShortDto;
import messenger.backend.userChat.UserChat;
import messenger.backend.utils.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(value = {"/sql/clean.sql", "/sql/chat/initPersonalChatTests.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
public class PersonalChatControllerIT {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private PersonalChatRepository personalChatRepository;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }


    @Test
    @SneakyThrows
    public void shouldGetPersonalChatInfo() {
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/personal/06dfa92e-532d-4b38-bd21-355328bc4270")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<PersonalChatResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData())
                .isEqualTo(new PersonalChatResponseDto(
                        UUID.fromString("06dfa92e-532d-4b38-bd21-355328bc4270"),
                        new UserShortDto(
                                UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"),
                                "Full Name 2",
                                "user2",
                                "My info 2",
                                UserChat.PermissionLevel.MEMBER
                        )));
    }

    @Test
    @SneakyThrows
    public void shouldCreatePersonalChat() {
        CreatePersonalChatRequestDto dto = new CreatePersonalChatRequestDto();
        dto.setTargetId(UUID.fromString("fafae9b4-6789-4f03-9520-dc97b0b9470b"));
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/personal/create")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<GeneralChatResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData())
                .usingRecursiveComparison()
                .ignoringFields("id")
                .isEqualTo(new GeneralChatResponseDto(null, "Full Name fa", "PERSONAL", null));
        assertThat(response.getData().getId()).isNotNull();
        assertThat(personalChatRepository.findByMembers(
                UserEntity.builder().id(UUID.fromString("9f6a075e-a4c5-44da-b7c5-5f22bb64b352")).build(),
                UserEntity.builder().id(UUID.fromString("fafae9b4-6789-4f03-9520-dc97b0b9470b")).build())).isNotEmpty();
    }

    @ParameterizedTest
    @SneakyThrows
    @CsvSource({
            "9f6a075e-a4c5-44da-b7c5-5f22bb64b352",
            "dacee9b4-6789-4f03-9520-dc97b0b9470b"
    })
    public void shouldNotCreatePersonalChat_Conflict(String targetUserId) {
        CreatePersonalChatRequestDto dto = new CreatePersonalChatRequestDto();
        dto.setTargetId(UUID.fromString(targetUserId));
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/personal/create")
                .then()
                .statusCode(HttpStatus.SC_CONFLICT)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    @Test
    @SneakyThrows
    public void shouldDeletePersonalChat() {
        DeletePersonalChatRequestDto dto = new DeletePersonalChatRequestDto();
        dto.setChatId(UUID.fromString("06dfa92e-532d-4b38-bd21-355328bc4270"));
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/personal/delete")
                .then()
                .statusCode(HttpStatus.SC_OK);

        assertThat(personalChatRepository.findById(dto.getChatId())).isEmpty();
        assertThat(personalChatRepository.findById(UUID.fromString("e9fe386e-e194-4d97-aae5-bfc03ce8767a"))).isEmpty();
        assertThat(personalChatRepository.findById(UUID.fromString("7250ffcd-371e-47d9-a217-393438ce06bd"))).isEmpty();
    }

    @Test
    @SneakyThrows
    public void shouldNotDeletePersonalChat_UserNotMemberOfChat() {
        DeletePersonalChatRequestDto dto = new DeletePersonalChatRequestDto();
        dto.setChatId(UUID.fromString("06dfa92e-532d-4b38-bd21-355328bc4270"));
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken("user2fa", "user"))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/personal/delete")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    @Test
    @SneakyThrows
    void shouldNotFoundChat() {
        UUID chatId = UUID.fromString("00000000-0000-0000-0000-00000000000");

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/personal/" + chatId.toString())
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        DeletePersonalChatRequestDto dto = new DeletePersonalChatRequestDto();
        dto.setChatId(chatId);
        String json = objectMapper.writeValueAsString(dto);
        jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/personal/delete")
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
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

}
