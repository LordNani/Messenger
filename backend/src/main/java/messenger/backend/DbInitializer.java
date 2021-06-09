package messenger.backend;

import lombok.RequiredArgsConstructor;
import messenger.backend.seeds.FakerService;
import messenger.backend.user.UserRepository;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;



@Component
@RequiredArgsConstructor
public class DbInitializer {

    private final UserRepository userRepository;
    private final FakerService fakerService;

    @EventListener
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (userRepository.count() == 0) {
            fakerService.generateRandomData();
        }
    }
}
