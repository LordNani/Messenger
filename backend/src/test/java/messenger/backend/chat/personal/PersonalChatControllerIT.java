package messenger.backend.chat.personal;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import lombok.SneakyThrows;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.chat.group.dto.ChangeGroupChatNameRequestDto;
import messenger.backend.chat.personal.dto.CreatePersonalChatRequestDto;
import messenger.backend.chat.personal.dto.DeletePersonalChatRequestDto;
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
public class PersonalChatControllerIT {

    @Autowired
    private ObjectMapper objectMapper;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }


    @Test
    @SneakyThrows
    public void shouldGetPersonalChatInfo() {
        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/chat/personal/06dfa92e-532d-4b38-bd21-355328bc4270")
                .then()
                .statusCode(HttpStatus.SC_OK);
    }

    @Test
    @SneakyThrows
    public void shouldCreatePersonalChat() {
        CreatePersonalChatRequestDto dto = new CreatePersonalChatRequestDto();
        dto.setTargetId(UUID.fromString("fafae9b4-6789-4f03-9520-dc97b0b9470b"));
        String json = objectMapper.writeValueAsString(dto);

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/chat/personal/create")
                .then()
                .statusCode(HttpStatus.SC_OK);
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
