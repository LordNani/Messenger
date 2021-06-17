package messenger.backend.sockets;

import messenger.backend.user.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocketSessionRepository extends JpaRepository<SocketSessionEntity, Long> {
    Long countByUser(UserEntity userEntity);
}
