package messenger.backend.message;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import lombok.SneakyThrows;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.message.dto.DeleteMessageRequestDto;
import messenger.backend.message.dto.MessageResponseDto;
import messenger.backend.message.dto.SendMessageRequestDto;
import messenger.backend.message.dto.UpdateMessageRequestDto;
import messenger.backend.utils.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(value = {"/sql/clean.sql", "/sql/message/initMessageTests.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class MessageControllerIT {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MessageRepository messageRepository;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }

    @ParameterizedTest
    @SneakyThrows
    @MethodSource("getAllMessagesTestProvider")
    void shouldGetAllMessagesByChatId(String chatId, List<MessageResponseDto> expectedMessagesInfo) {
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/messages/chat/" + chatId)
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();
        Response<List<MessageResponseDto>> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData()).usingElementComparatorIgnoringFields("createdAt").isEqualTo(expectedMessagesInfo);
    }

    private static Stream<Arguments> getAllMessagesTestProvider() {
        return Stream.of(
                Arguments.of("06dfa92e-532d-4b38-bd21-355328bc4270",
                        List.of(
                                new MessageResponseDto(
                                        UUID.fromString("ffffa92e-9e5e-4c0b-b661-4e790e76ea4d"),
                                        "message1 personal",
                                        "Full Name",
                                        UUID.fromString("9f6a075e-a4c5-44da-b7c5-5f22bb64b352"),
                                        0L,
                                        false,
                                        UUID.fromString("06dfa92e-532d-4b38-bd21-355328bc4270")),
                                new MessageResponseDto(
                                        UUID.fromString("aaaaa92e-9e5e-4c0b-b661-4e790e76ea4d"),
                                        "message2 personal",
                                        "Full Name 2",
                                        UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"),
                                        0L,
                                        false,
                                        UUID.fromString("06dfa92e-532d-4b38-bd21-355328bc4270"))
                        )),
                Arguments.of("51c07af2-5ed1-4e30-b054-e5a3d51da5a5",
                        List.of(
                                new MessageResponseDto(
                                        UUID.fromString("11111111-9e5e-4c0b-b661-4e790e76ea4d"),
                                        "message1 group",
                                        "Full Name",
                                        UUID.fromString("9f6a075e-a4c5-44da-b7c5-5f22bb64b352"),
                                        0L,
                                        false,
                                        UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5")),
                                new MessageResponseDto(
                                        UUID.fromString("22222222-9e5e-4c0b-b661-4e790e76ea4d"),
                                        "message2 group",
                                        "Full Name 2",
                                        UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"),
                                        0L,
                                        false,
                                        UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5")),
                                new MessageResponseDto(
                                        UUID.fromString("33333333-9e5e-4c0b-b661-4e790e76ea4d"),
                                        "message3 group",
                                        "Full Name 1111",
                                        UUID.fromString("11111111-6789-4f03-9520-dc97b0b9470b"),
                                        0L,
                                        false,
                                        UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"))
                                )
                )
        );
    }

    @ParameterizedTest
    @SneakyThrows
    @MethodSource("sendMessageTestProvider")
    void shouldSendMessage(UUID chatId, String text) {
        SendMessageRequestDto dto = new SendMessageRequestDto();
        dto.setChatId(chatId);
        dto.setText(text);
        dto.setLoadingId(UUID.randomUUID());
        String json = objectMapper.writeValueAsString(dto);
        Date timeBeforeRequest = new Date();

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/messages/chat")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<MessageResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData().getText()).isEqualTo(text);
        assertThat(response.getData().getSenderName()).isEqualTo("Full Name");
        assertThat(response.getData().getSenderId()).isEqualTo(UUID.fromString("9f6a075e-a4c5-44da-b7c5-5f22bb64b352"));
        assertThat(response.getData().getCreatedAt()).isGreaterThan(timeBeforeRequest.getTime());
        assertThat(response.getData().getChatId()).isEqualTo(chatId);

        assertThat(messageRepository.findLastByChatId(chatId, Pageable.unpaged()).get(0).getId())
                .isEqualTo(response.getData().getId());
    }

    private static Stream<Arguments> sendMessageTestProvider() {
        return Stream.of(
                Arguments.of(UUID.fromString("06dfa92e-532d-4b38-bd21-355328bc4270"), "personal text"),
                Arguments.of(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"), "group text")
        );
    }

    @Test
    @SneakyThrows
    void shouldNotFoundChat() {
        UUID chatId = UUID.fromString("00000000-0000-0000-0000-00000000000");

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/messages/chat/" + chatId.toString())
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        SendMessageRequestDto dto = new SendMessageRequestDto();
        dto.setChatId(chatId);
        dto.setText("text");
        dto.setLoadingId(UUID.randomUUID());
        String json = objectMapper.writeValueAsString(dto);

        jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/messages/chat")
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    @Test
    @SneakyThrows
    void shouldUpdateMessage() {
        UpdateMessageRequestDto requestDto = new UpdateMessageRequestDto(UUID.fromString("11111111-9e5e-4c0b-b661-4e790e76ea4d"),
                "new text");
        String json = objectMapper.writeValueAsString(requestDto);
        Date dateBeforeRequest = new Date();

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/messages/update")
                .then()
                .statusCode(HttpStatus.SC_OK);
        MessageEntity messageEntity = messageRepository.findById(requestDto.getMessageId()).orElseThrow();
        assertThat(messageEntity.getMessageBody()).isEqualTo(requestDto.getNewText());
        assertThat(messageEntity.getUpdatedAt()).isAfter(dateBeforeRequest);
    }

    @ParameterizedTest
    @SneakyThrows
    @MethodSource("manageMessageTestProvider")
    void shouldNotUpdateMessage(String username, String password, UUID messageId, int statusCode) {
        UpdateMessageRequestDto requestDto = new UpdateMessageRequestDto(messageId,
                "new text");
        String json = objectMapper.writeValueAsString(requestDto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/messages/update")
                .then()
                .statusCode(statusCode)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    @Test
    @SneakyThrows
    void shouldDeleteMessage() {
        DeleteMessageRequestDto requestDto = new DeleteMessageRequestDto(UUID.fromString("11111111-9e5e-4c0b-b661-4e790e76ea4d"));
        String json = objectMapper.writeValueAsString(requestDto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/messages/delete")
                .then()
                .statusCode(HttpStatus.SC_OK);

        assertThat(messageRepository.findById(requestDto.getMessageId())).isEmpty();
    }

    @ParameterizedTest
    @SneakyThrows
    @MethodSource("manageMessageTestProvider")
    void shouldNotDeleteMessage(String username, String password, UUID messageId, int statusCode) {
        DeleteMessageRequestDto requestDto = new DeleteMessageRequestDto(messageId);
        String json = objectMapper.writeValueAsString(requestDto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/messages/delete")
                .then()
                .statusCode(statusCode)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    private static Stream<Arguments> manageMessageTestProvider() {
        return Stream.of(
                Arguments.of("user", "user", UUID.fromString("00000000-532d-4b38-bd21-355328bc4270"), HttpStatus.SC_NOT_FOUND),
                Arguments.of("user2", "user", UUID.fromString("11111111-9e5e-4c0b-b661-4e790e76ea4d"), HttpStatus.SC_FORBIDDEN),
                Arguments.of("1111", "user", UUID.fromString("33333333-9e5e-4c0b-b661-4e790e76ea4d"), HttpStatus.SC_FORBIDDEN)
        );
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
