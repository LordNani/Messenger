package messenger.backend.message;


import lombok.*;
import messenger.backend.chat.ChatSuperclass;
import messenger.backend.seeds.FakerService;
import messenger.backend.user.UserEntity;
import messenger.backend.userChat.UserChat;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;

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
@Table(name = "Message")
public class MessageEntity {
    public static MessageEntity generateMessage(UserChat userChat) {

        return MessageEntity.builder()
                .user(userChat.getUser())
                .chat(userChat.getChat())
                .messageBody(FakerService.faker.elderScrolls().quote())
                .build();
    }

    public static MessageEntity generateGroupChatMessage(UserChat userChat) {

        return MessageEntity.builder()
                .user(userChat.getUser())
                .chat(userChat.getChat())
                .messageBody(FakerService.faker.book().title())
                .build();
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

    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;

    @Column(name = "message_body",length = 1024, nullable = false)
    private String messageBody;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REFRESH)
    @JoinColumn(name="user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.REFRESH)
    @JoinColumn(name="chat_id", nullable = false)
    private ChatSuperclass chat;
}
