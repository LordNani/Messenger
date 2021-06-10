package messenger.backend.chat.group.exceptions;

import messenger.backend.utils.exceptions.WebException;
import org.springframework.http.HttpStatus;

public class NotEnoughPermissionLevelException extends WebException {
    public NotEnoughPermissionLevelException() {
        super("User has insufficient permission level", HttpStatus.FORBIDDEN);
    }
}
