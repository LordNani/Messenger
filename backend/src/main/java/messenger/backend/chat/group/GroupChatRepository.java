package messenger.backend.chat.group;

import messenger.backend.chat.GroupChatEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.UUID;

public interface GroupChatRepository extends JpaRepository<GroupChatEntity, UUID> {
    @Query("SELECT c " +
            "FROM GroupChatEntity as c INNER JOIN c.userChats uc " +
            "WHERE c.id=:chatId AND uc.user.id = :userId")
    Optional<GroupChatEntity> findByIdAndUserId(UUID chatId, UUID userId);

}
