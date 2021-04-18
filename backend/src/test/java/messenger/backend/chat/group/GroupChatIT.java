package messenger.backend.chat.group;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import lombok.SneakyThrows;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.chat.group.dto.*;
import messenger.backend.utils.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;

import java.util.LinkedHashMap;
import java.util.UUID;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(value = {"/sql/clean.sql", "/sql/init.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
public class GroupChatIT {

    @Autowired
    private ObjectMapper objectMapper;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }

    @Test
    @SneakyThrows
    public void shouldGetGroupChatInfo() {
        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/group/51c07af2-5ed1-4e30-b054-e5a3d51da5a5")
                .then()
                .statusCode(HttpStatus.SC_OK);
    }


    @Test
    @SneakyThrows
    public void shouldCreateGroupChat() {
        CreateGroupChatRequestDto dto = new CreateGroupChatRequestDto();
        dto.setChatName("chatName");
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/create")
                .then()
                .statusCode(HttpStatus.SC_OK);
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
    }

    @Test
    @SneakyThrows
    public void shouldAddMemberToChat() {
        AddMemberToGroupChatRequestDto dto = new AddMemberToGroupChatRequestDto();
        dto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        dto.setTargetUserId(UUID.fromString("fafae9b4-6789-4f03-9520-dc97b0b9470b"));
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/add")
                .then()
                .statusCode(HttpStatus.SC_OK);
    }

    @Test
    @SneakyThrows
    public void shouldRemoveMemberFromChat() {
        RemoveMemberFromGroupChatRequestDto dto = new RemoveMemberFromGroupChatRequestDto();
        dto.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        dto.setTargetUserId(UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"));
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/group/users/remove")
                .then()
                .statusCode(HttpStatus.SC_OK);
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
    }

    @Test
    @SneakyThrows
    public void shouldDowngradeToMember() {
        UpgradeToAdminRequestDto upgrade = new UpgradeToAdminRequestDto();
        upgrade.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        upgrade.setTargetUserId(UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"));
        String upgradeJson = objectMapper.writeValueAsString(upgrade);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(upgradeJson)
                .when()
                .post("/api/chat/group/users/upgrade-to-admin");

        DowngradeToMemberRequestDto downgrade = new DowngradeToMemberRequestDto();
        downgrade.setChatId(UUID.fromString("51c07af2-5ed1-4e30-b054-e5a3d51da5a5"));
        downgrade.setTargetUserId(UUID.fromString("dacee9b4-6789-4f03-9520-dc97b0b9470b"));
        String downgradeJson = objectMapper.writeValueAsString(downgrade);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(downgradeJson)
                .when()
                .post("/api/chat/group/users/downgrade-to-member")
                .then()
                .statusCode(HttpStatus.SC_OK);
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
    }


    public String getAccessToken() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new AuthRequestDto("user", "user")
        );

        Response response = RestAssured
                .given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/auth/login")
                .then()
                .extract()
                .as(Response.class);
        return (String) ((LinkedHashMap)response.getData()).get("accessToken");
    }

}
