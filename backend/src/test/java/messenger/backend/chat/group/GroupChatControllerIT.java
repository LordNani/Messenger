package messenger.backend.chat.group;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import lombok.SneakyThrows;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.auth.dto.AuthResponseDto;
import messenger.backend.chat.GroupChatEntity;
import messenger.backend.chat.general.dto.GeneralChatResponseDto;
import messenger.backend.chat.group.dto.*;
import messenger.backend.user.dto.UserShortDto;
import messenger.backend.userChat.UserChat;
import messenger.backend.userChat.UserChatRepository;
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

import javax.transaction.Transactional;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(value = {"/sql/clean.sql", "/sql/chat/initGroupChatTests.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
public class GroupChatControllerIT {

    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private GroupChatRepository groupChatRepository;
    @Autowired
    private UserChatRepository userChatRepository;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }

    @Test
    @SneakyThrows
    public void shouldGetGroupChatInfo() {
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/group/51c07af2-5ed1-4e30-b054-e5a3d51da5a5")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();

        Response<GroupChatResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        assertThat(response.getData())
                .isEqualTo(new GroupChatResponseDto(
                        UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"),
                        "GROUP_title",
                        List.of(new UserShortDto(
                                UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"),
                                "Full Name 2",
                                "user2",
                                "My info 2",
                                        null,
                                UserChat.PermissionLevel.MEMBER),
                                new UserShortDto(
                                        UUID.fromString("babae9b4-6789-4f03-9520-dc97b0b9470b"),
                                        "Full Name baba",
                                        "user_baba",
                                        "My info baba",
                                        null,
                                        UserChat.PermissionLevel.ADMIN
                                )
                        ),
                        null,
                        UserChat.PermissionLevel.OWNER
                ));
    }

    @Test
    @SneakyThrows
    public void shouldNotGetGroupChatInfo_ChatNotFound() {
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/group/12345678-5ed1-4e30-b054-e5a3d51da5a5")
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }


    @Test
    @SneakyThrows
    @Transactional
    public void shouldCreateGroupChat() {
        CreateGroupChatRequestDto dto = new CreateGroupChatRequestDto();
        dto.setChatName("newGroupChatName");
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/create")
                .then()
                .statusCode(HttpStatus.SC_OK)
                .extract().asString();
        Response<GeneralChatResponseDto> response = objectMapper.readValue(jsonResponse, new TypeReference<>(){});
        assertThat(response.getMessage()).isNull();
        GeneralChatResponseDto expectedData = new GeneralChatResponseDto(
                null,
                "newGroupChatName",
                "GROUP",
                null,
                null);
        assertThat(response.getData()).usingRecursiveComparison().ignoringFields("id").isEqualTo(expectedData);

        GroupChatEntity groupChatEntity = groupChatRepository
                .findByIdAndUserId(response.getData().getId(), UUID.fromString("9f6a075e-a4c5-44da-b7c5-5f22bb64b352"))
                .orElseThrow();
        assertThat(groupChatEntity.getGroupName()).isEqualTo(expectedData.getTitle());
        assertThat(groupChatEntity.getUserChats().get(0).getPermissionLevel()).isEqualTo(UserChat.PermissionLevel.OWNER);
    }

    @Test
    @SneakyThrows
    public void shouldDeleteGroupChat() {
        DeleteGroupChatRequestDto dto = new DeleteGroupChatRequestDto();
        dto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/delete")
                .then()
                .statusCode(HttpStatus.SC_OK);

        assertThat(groupChatRepository.findById(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"))).isEmpty();
        assertThat(userChatRepository.findById(UUID.fromString("e2c146a4-9e5e-4c0b-b661-4e790e76ea4d"))).isEmpty();
        assertThat(userChatRepository.findById(UUID.fromString("360cdbbf-5433-47b8-a32b-4fe0ab84df73"))).isEmpty();
        assertThat(userChatRepository.findById(UUID.fromString("33333333-e194-4d97-aae5-bfc03ce8767a"))).isEmpty();
    }

    @Test
    @SneakyThrows
    public void shouldNotDeleteGroupChat_ChatNotFound() {
        DeleteGroupChatRequestDto dto = new DeleteGroupChatRequestDto();
        dto.setChatId(UUID.fromString("00000000-0000-0000-0000-00000000000"));
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/delete")
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    @ParameterizedTest
    @SneakyThrows
    @CsvSource({
            "user, user, 12345678-5ed1-4e30-b054-e5a3d51da5a5",
            "user2, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5",
            "user_baba, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5"
    })
    public void shouldNotDeleteGroupChat_UserNotOwnerOfChat(String username, String password, String chatId) {
        DeleteGroupChatRequestDto dto = new DeleteGroupChatRequestDto();
        dto.setChatId(UUID.fromString(chatId));
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/delete")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        assertThat(groupChatRepository.findById(UUID.fromString(chatId))).isNotEmpty();
    }

    @ParameterizedTest
    @SneakyThrows
    @CsvSource({
            "user, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, fafae9b4-6789-4f03-9520-dc97b0b9470b",
            "user_baba, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, fafae9b4-6789-4f03-9520-dc97b0b9470b"
    })
    public void shouldAddMemberToChat(String username, String password, String chatId, String targetUserId) {
        AddMemberToGroupChatRequestDto dto = new AddMemberToGroupChatRequestDto();
        dto.setChatId(UUID.fromString(chatId));
        dto.setTargetUserId(UUID.fromString(targetUserId));
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/add")
                .then()
                .statusCode(HttpStatus.SC_OK);

        assertThat(groupChatRepository.findByIdAndUserId(
                dto.getChatId(),
                dto.getTargetUserId())).isNotEmpty();
        UserChat userChat = userChatRepository.findByUserIdAndChatId(
                dto.getTargetUserId(),
                dto.getChatId()).orElseThrow();
        assertThat(userChat.getPermissionLevel()).isEqualTo(UserChat.PermissionLevel.MEMBER);
    }

    @Test
    @SneakyThrows
    public void shouldNotAddMemberToChat_NotEnoughPermissionLevel() {
        AddMemberToGroupChatRequestDto dto = new AddMemberToGroupChatRequestDto();
        dto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        dto.setTargetUserId(UUID.fromString("fafae9b4-6789-4f03-9520-dc97b0b9470b"));
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken("user2", "user"))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/add")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    @Test
    @SneakyThrows
    public void shouldNotAddMemberToChat_UserAlreadyMemberOfChat() {
        AddMemberToGroupChatRequestDto dto = new AddMemberToGroupChatRequestDto();
        dto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        dto.setTargetUserId(UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"));
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/add")
                .then()
                .statusCode(HttpStatus.SC_CONFLICT)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }


    @Test
    @SneakyThrows
    public void shouldNotAddMemberToChat_ContextUserNotMemberOfChat() {
        AddMemberToGroupChatRequestDto dto = new AddMemberToGroupChatRequestDto();
        dto.setChatId(UUID.fromString("12345678-5ed1-4e30-b054-e5a3d51da5a5"));
        dto.setTargetUserId(UUID.fromString("fafae9b4-6789-4f03-9520-dc97b0b9470b"));
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/add")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);
    }

    @ParameterizedTest
    @SneakyThrows
    @CsvSource({
            "user_baba, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, dacee9b4-6789-4f03-9520-dc97b0b9470b",
            "user, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, dacee9b4-6789-4f03-9520-dc97b0b9470b",
            "user, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, babae9b4-6789-4f03-9520-dc97b0b9470b",
    })
    public void shouldRemoveMemberFromChat(String username, String password, String chatId, String targetUserId) {
        RemoveMemberFromGroupChatRequestDto dto = new RemoveMemberFromGroupChatRequestDto();
        dto.setChatId(UUID.fromString(chatId));
        dto.setTargetUserId(UUID.fromString(targetUserId));
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/remove")
                .then()
                .statusCode(HttpStatus.SC_OK);

        assertThat(groupChatRepository.findByIdAndUserId(dto.getChatId(), dto.getTargetUserId())).isEmpty();
    }

    @ParameterizedTest
    @SneakyThrows
    @Transactional
    @CsvSource({
            "user2, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, dacee9b4-6789-4f03-9520-dc97b0b9470b",
            "user2, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, babae9b4-6789-4f03-9520-dc97b0b9470b",
            "user2, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, 9f6a075e-a4c5-44da-b7c5-5f22bb64b352",
            "user_baba, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, babae9b4-6789-4f03-9520-dc97b0b9470b",
            "user_baba, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, 9f6a075e-a4c5-44da-b7c5-5f22bb64b352",
            "user, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, 9f6a075e-a4c5-44da-b7c5-5f22bb64b352",
    })
    public void shouldNotRemoveMemberFromChat_NotEnoughPermissionLevel(String username, String password, String chatId, String targetUserId) {
        RemoveMemberFromGroupChatRequestDto dto = new RemoveMemberFromGroupChatRequestDto();
        dto.setChatId(UUID.fromString(chatId));
        dto.setTargetUserId(UUID.fromString(targetUserId));
        String json = objectMapper.writeValueAsString(dto);
        GroupChatEntity groupChatBeforeRequest = groupChatRepository.findById(UUID.fromString(chatId)).orElseThrow();

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/remove")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        GroupChatEntity groupChatAfterRequest = groupChatRepository.findById(UUID.fromString(chatId)).orElseThrow();
        assertThat(groupChatBeforeRequest.getUserChats()).isEqualTo(groupChatAfterRequest.getUserChats());
    }

    @Test
    @SneakyThrows
    public void shouldUpgradeToAdmin() {
        UpgradeToAdminRequestDto dto = new UpgradeToAdminRequestDto();
        dto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        dto.setTargetUserId(UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"));
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/upgrade-to-admin")
                .then()
                .statusCode(HttpStatus.SC_OK);

        assertThat(userChatRepository.findByUserIdAndChatId(dto.getTargetUserId(), dto.getChatId())
                .orElseThrow()
                .getPermissionLevel())
                .isEqualTo(UserChat.PermissionLevel.ADMIN);
    }

    @ParameterizedTest
    @SneakyThrows
    @Transactional
    @CsvSource({
            "user2, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, dacee9b4-6789-4f03-9520-dc97b0b9470b",
            "user_baba, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, dacee9b4-6789-4f03-9520-dc97b0b9470b"
    })
    public void shouldNotUpgradeToAdmin_NotEnoughPermissionLevel(String username, String password, String chatId, String targetUserId) {
        UpgradeToAdminRequestDto dto = new UpgradeToAdminRequestDto();
        dto.setChatId(UUID.fromString(chatId));
        dto.setTargetUserId(UUID.fromString(targetUserId));
        String json = objectMapper.writeValueAsString(dto);
        GroupChatEntity groupChatBeforeRequest = groupChatRepository.findById(UUID.fromString(chatId)).orElseThrow();

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/upgrade-to-admin")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        GroupChatEntity groupChatAfterRequest = groupChatRepository.findById(UUID.fromString(chatId)).orElseThrow();
        assertThat(groupChatBeforeRequest.getUserChats()).isEqualTo(groupChatAfterRequest.getUserChats());
    }

    @ParameterizedTest
    @SneakyThrows
    @Transactional
    @CsvSource({
            "user, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, 9f6a075e-a4c5-44da-b7c5-5f22bb64b352",
            "user, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, babae9b4-6789-4f03-9520-dc97b0b9470b"
    })
    public void shouldNotUpgradeToAdmin_InvalidChatOperation(String username, String password, String chatId, String targetUserId) {
        UpgradeToAdminRequestDto dto = new UpgradeToAdminRequestDto();
        dto.setChatId(UUID.fromString(chatId));
        dto.setTargetUserId(UUID.fromString(targetUserId));
        String json = objectMapper.writeValueAsString(dto);
        GroupChatEntity groupChatBeforeRequest = groupChatRepository.findById(UUID.fromString(chatId)).orElseThrow();

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/upgrade-to-admin")
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        GroupChatEntity groupChatAfterRequest = groupChatRepository.findById(UUID.fromString(chatId)).orElseThrow();
        assertThat(groupChatBeforeRequest.getUserChats()).isEqualTo(groupChatAfterRequest.getUserChats());
    }

    @Test
    @SneakyThrows
    public void shouldDowngradeToMember() {
        DowngradeToMemberRequestDto requestDto = new DowngradeToMemberRequestDto();
        requestDto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        requestDto.setTargetUserId(UUID.fromString("babae9b4-6789-4f03-9520-dc97b0b9470b"));
        String downgradeJson = objectMapper.writeValueAsString(requestDto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(downgradeJson)
                .when()
                .post("/api/chat/group/users/downgrade-to-member")
                .then()
                .statusCode(HttpStatus.SC_OK);

        assertThat(userChatRepository.findByUserIdAndChatId(requestDto.getTargetUserId(), requestDto.getChatId())
                .orElseThrow()
                .getPermissionLevel())
                .isEqualTo(UserChat.PermissionLevel.MEMBER);
    }

    @ParameterizedTest
    @SneakyThrows
    @Transactional
    @CsvSource({
            "user2, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, fafae9b4-6789-4f03-9520-dc97b0b9470b",
            "user2, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, babae9b4-6789-4f03-9520-dc97b0b9470b",
            "user_baba, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, fafae9b4-6789-4f03-9520-dc97b0b9470b",
            "user_baba, user, 51c07af2-5ed1-4e30-b054-e5a3d51da5a5, babae9b4-6789-4f03-9520-dc97b0b9470b",
    })
    public void shouldNotDowngradeToMember_NotEnoughPermissionLevel(String username, String password, String chatId, String targetUserId) {
        DowngradeToMemberRequestDto requestDto = new DowngradeToMemberRequestDto();
        requestDto.setChatId(UUID.fromString(chatId));
        requestDto.setTargetUserId(UUID.fromString(targetUserId));
        String downgradeJson = objectMapper.writeValueAsString(requestDto);
        GroupChatEntity groupChatBeforeRequest = groupChatRepository.findById(UUID.fromString(chatId)).orElseThrow();

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken(username, password))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(downgradeJson)
                .when()
                .post("/api/chat/group/users/downgrade-to-member")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        GroupChatEntity groupChatAfterRequest = groupChatRepository.findById(UUID.fromString(chatId)).orElseThrow();
        assertThat(groupChatBeforeRequest.getUserChats()).isEqualTo(groupChatAfterRequest.getUserChats());
    }

    @ParameterizedTest
    @SneakyThrows
    @Transactional
    @CsvSource({
            "9f6a075e-a4c5-44da-b7c5-5f22bb64b352",
            "dacee9b4-6789-4f03-9520-dc97b0b9470b",
    })
    public void shouldNotDowngradeToMember_InvalidChatOperation(String targetUserId) {
        DowngradeToMemberRequestDto requestDto = new DowngradeToMemberRequestDto();
        requestDto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        requestDto.setTargetUserId(UUID.fromString(targetUserId));
        String downgradeJson = objectMapper.writeValueAsString(requestDto);
        GroupChatEntity groupChatBeforeRequest = groupChatRepository.findById(requestDto.getChatId()).orElseThrow();

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(downgradeJson)
                .when()
                .post("/api/chat/group/users/downgrade-to-member")
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        GroupChatEntity groupChatAfterRequest = groupChatRepository.findById(requestDto.getChatId()).orElseThrow();
        assertThat(groupChatBeforeRequest.getUserChats()).isEqualTo(groupChatAfterRequest.getUserChats());
    }


    @Test
    @SneakyThrows
    public void shouldChangeInfo() {
        ChangeGroupChatNameRequestDto dto = new ChangeGroupChatNameRequestDto();
        dto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        dto.setNewChatName("newName");
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/change-info")
                .then()
                .statusCode(HttpStatus.SC_OK);

        assertThat(groupChatRepository.findById(dto.getChatId()).orElseThrow().getGroupName()).isEqualTo(dto.getNewChatName());
    }

    @Test
    @SneakyThrows
    public void shouldNotChangeInfo_NotEnoughPermissionLevel() {
        ChangeGroupChatNameRequestDto dto = new ChangeGroupChatNameRequestDto();
        dto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        dto.setNewChatName("newName");
        String json = objectMapper.writeValueAsString(dto);

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken("user2", "user"))
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/change-info")
                .then()
                .statusCode(HttpStatus.SC_FORBIDDEN)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        assertThat(groupChatRepository.findById(dto.getChatId()).orElseThrow().getGroupName()).isEqualTo("GROUP_title");
    }

    @Test
    @SneakyThrows
    void shouldNotFoundChat() {
        UUID chatId = UUID.fromString("00000000-0000-0000-0000-00000000000");

        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/group/" + chatId.toString())
                .then()
                .statusCode(HttpStatus.SC_NOT_FOUND)
                .extract().asString();
        assertThatResponseWithMessageAndNoData(jsonResponse);

        DeleteGroupChatRequestDto deleteChatRequestDto = new DeleteGroupChatRequestDto();
        deleteChatRequestDto.setChatId(chatId);
        assertThatResponseWithNotFoundCode(objectMapper.writeValueAsString(deleteChatRequestDto), "/delete");

        AddMemberToGroupChatRequestDto addMemberToGroupChatRequestDto = new AddMemberToGroupChatRequestDto();
        addMemberToGroupChatRequestDto.setChatId(chatId);
        addMemberToGroupChatRequestDto.setTargetUserId(UUID.randomUUID());
        assertThatResponseWithNotFoundCode(objectMapper.writeValueAsString(addMemberToGroupChatRequestDto), "/users/add");

        RemoveMemberFromGroupChatRequestDto removeMemberRequestDto = new RemoveMemberFromGroupChatRequestDto();
        removeMemberRequestDto.setChatId(chatId);
        removeMemberRequestDto.setTargetUserId(UUID.randomUUID());
        assertThatResponseWithNotFoundCode(objectMapper.writeValueAsString(removeMemberRequestDto), "/users/remove");

        UpgradeToAdminRequestDto upgradeToAdminDto = new UpgradeToAdminRequestDto();
        upgradeToAdminDto.setChatId(chatId);
        upgradeToAdminDto.setTargetUserId(UUID.randomUUID());
        assertThatResponseWithNotFoundCode(objectMapper.writeValueAsString(upgradeToAdminDto), "/users/upgrade-to-admin");

        DowngradeToMemberRequestDto downgradeToMemberDto = new DowngradeToMemberRequestDto();
        downgradeToMemberDto.setChatId(chatId);
        downgradeToMemberDto.setTargetUserId(UUID.randomUUID());
        assertThatResponseWithNotFoundCode(objectMapper.writeValueAsString(downgradeToMemberDto), "/users/downgrade-to-member");

        ChangeGroupChatNameRequestDto changeGroupRequest = new ChangeGroupChatNameRequestDto();
        changeGroupRequest.setChatId(chatId);
        changeGroupRequest.setNewChatName("00000000");
        assertThatResponseWithNotFoundCode(objectMapper.writeValueAsString(changeGroupRequest), "/change-info");
    }

    private void assertThatResponseWithNotFoundCode(String json, String url) {
        String jsonResponse = RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group" + url)
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
