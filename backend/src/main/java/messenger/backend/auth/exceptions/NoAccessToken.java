package messenger.backend.auth.exceptions;

import messenger.backend.utils.exceptions.WebException;
import org.springframework.http.HttpStatus;

public class NoAccessToken extends WebException {
    public NoAccessToken() {
        super("Access token required", HttpStatus.FORBIDDEN);
    }
}
