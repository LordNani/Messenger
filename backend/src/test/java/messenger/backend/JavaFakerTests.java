package messenger.backend;

import com.github.javafaker.Faker;
import org.junit.jupiter.api.Test;

import static messenger.backend.seeds.FakerService.generateRandomData;

public class JavaFakerTests {


    @Test
    public void generateRandomText(){
        Faker faker = new Faker();

//        for (int i = 0; i < 20; i++) {
//            System.out.println(faker.internet().password(2,5));
//        }

        generateRandomData();

    }
}
