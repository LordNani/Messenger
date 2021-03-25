package messenger.backend.chat;

import lombok.*;
import lombok.experimental.SuperBuilder;
import messenger.backend.user.UserEntity;

import javax.persistence.*;
import java.util.UUID;


@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString


@Entity
@Table(name = "PrivateChat")
public class PrivateChatEntity extends ChatSuperclass {

    public static PrivateChatEntity generatePrivateChat() {
        return PrivateChatEntity.builder()
                .id(UUID.randomUUID())
                .build();
    }

    @Lob
    @Column(name = "chatPicture")
    private Byte[] chatPicture;
}
