package messenger.backend.userChat;


import lombok.*;
import messenger.backend.chat.ChatSuperclass;
import messenger.backend.user.UserEntity;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import javax.persistence.*;
import java.util.Date;
import java.util.UUID;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString

@Entity
public class UserChat {
    public static UserChat generateUserChat(PermissionLevel permLvl, ChatSuperclass chat, UserEntity user) {

        return UserChat.builder()
                .permissionLevel(permLvl)
                .user(user)
                .chat(chat)
                .build();
    }


    public enum PermissionLevel {
        OWNER,
        ADMIN,
        MEMBER
    }

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(
            name = "UUID",
            strategy = "org.hibernate.id.UUIDGenerator"
    )
    @Column(name = "id")
    @Type(type="uuid-char")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REFRESH)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="chat_id", nullable = false)
    private ChatSuperclass chat;

    @Enumerated(EnumType.STRING)
    @Column(name = "permissionLevel", nullable = false)
    private PermissionLevel permissionLevel;

    @Column(name = "seen_time", nullable = false)
    @Builder.Default
    private Date seenAt = new Date(0);

}
