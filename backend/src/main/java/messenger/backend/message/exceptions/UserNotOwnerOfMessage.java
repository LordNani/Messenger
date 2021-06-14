package messenger.backend.message.exceptions;

import messenger.backend.utils.exceptions.WebException;
import org.springframework.http.HttpStatus;

public class UserNotOwnerOfMessage extends WebException {
    public UserNotOwnerOfMessage() {
        super("This message does not belong to you", HttpStatus.FORBIDDEN);
    }
}
