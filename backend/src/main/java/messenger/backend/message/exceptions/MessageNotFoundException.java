package messenger.backend.message.exceptions;

import messenger.backend.utils.exceptions.WebException;
import org.springframework.http.HttpStatus;

public class MessageNotFoundException extends WebException {
    public MessageNotFoundException() {
        super("Message not found", HttpStatus.NOT_FOUND);
    }
}
