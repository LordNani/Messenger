package messenger.backend.user;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.restassured.RestAssured;
import messenger.backend.auth.dto.AuthRequestDto;
import messenger.backend.user.dto.ChangePasswordRequestDto;
import messenger.backend.user.dto.UpdateProfileRequestDto;
import messenger.backend.utils.Response;
import org.apache.http.HttpStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.http.MediaType;
import org.springframework.test.context.jdbc.Sql;

import java.util.LinkedHashMap;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Sql(value = {"/sql/clean.sql", "/sql/init.sql"}, executionPhase = Sql.ExecutionPhase.BEFORE_TEST_METHOD)
class UserControllerIT {

    @Autowired
    private ObjectMapper objectMapper;

    @LocalServerPort
    void setPort(int port) {
        RestAssured.port = port;
    }

    @Test
    void shouldSearchUser() throws JsonProcessingException {
        RestAssured
                .given()
                .queryParam("username", "user")
                .header("Authorization", getAccessToken())
                .when()
                .get("/api/users/search")
                .then()
                .statusCode(HttpStatus.SC_OK);
    }

    @Test
    void shouldUpdateProfile() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new UpdateProfileRequestDto("name", "bio", "picture")
        );

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/users/update-profile")
                .then()
                .statusCode(HttpStatus.SC_OK);
    }

    @Test
    void shouldChangePassword() throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(
                new ChangePasswordRequestDto("user", "pass")
        );

        RestAssured
                .given()
                .header("Authorization", getAccessToken())
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .body(json)
                .when()
                .post("/api/users/change-password")
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