package messenger.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> getByUsername(String username);

    @Query("select distinct(uc.user) " +
           "from UserChat as uc " +
           "where uc.user.id <> :userId and uc.chat.id in (select uc2.chat.id " +
                                                          "from UserChat as uc2 " +
                                                          "where uc2.user.id = :userId)")
    List<UserEntity> findAllCompanions(@Param("userId") UUID userId);
}
