package messenger.backend.seeds;

import com.github.javafaker.Faker;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import messenger.backend.auth.access_levels.Role;
import messenger.backend.chat.GroupChatEntity;
import messenger.backend.chat.PrivateChatEntity;
import messenger.backend.chat.group.GroupChatRepository;
import messenger.backend.chat.personal.PersonalChatRepository;
import messenger.backend.message.MessageEntity;
import messenger.backend.message.MessageRepository;
import messenger.backend.user.UserEntity;
import messenger.backend.user.UserRepository;
import messenger.backend.userChat.UserChat;
import messenger.backend.userChat.UserChatRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class FakerService {

    private final UserRepository userRepository;
    private final PersonalChatRepository privateChatRepo;
    private final GroupChatRepository groupChatRepository;
    private final MessageRepository messageRepository;
    private final UserChatRepository userChatRepository;
    private final Random random = new Random();

    public static final Faker faker = new Faker();

    @Getter
    @Setter
    private int userCount = 20;
    @Getter
    @Setter
    private int privateChatCount = 100;
    @Getter
    @Setter
    private int groupChatCount = 20;
    @Getter
    @Setter
    private int msgsPerChat = 64;
    @Getter
    @Setter
    private int minUsersInGroupChat = 2;
    @Getter
    @Setter
    private int maxUsersInGroupChat = 17;

    public void generateRandomData() {
        List<UserEntity> users = createUsers();
        createPrivateChats(users);
        createGroupChats(getGroupChatsLists(),users);

    }

    private List<UserEntity> createUsers() {
        //creating users
        List<UserEntity> users =
                Stream
                        .generate(UserEntity::generateUser)
                        .limit(userCount - 2)
                        .collect(Collectors.toList());
        users.add(UserEntity.builder()
                .username("user")
                .fullName("userFullName")
                .password("$2y$12$ixe4Lh4uQVncJDzPJWckfeyTXPMkuVZm55miqLdnn/TjH0FoF8HOq") //user (BCryptPasswordEncoder(12))
                .picture("https://secure.gravatar.com/avatar/36422be80fc5feee38e65c772a8e004e?s=100&d=mm&r=g") //user (BCryptPasswordEncoder(12))
                .role(Role.USER)
                .build()
        );
        users.add(UserEntity.builder()
                .username("user2")
                .fullName("user2FullName")
                .password("$2y$12$ixe4Lh4uQVncJDzPJWckfeyTXPMkuVZm55miqLdnn/TjH0FoF8HOq") //user (BCryptPasswordEncoder(12))
                .role(Role.USER)
                .build()
        );
        userRepository.saveAll(users);

        users.stream().map(UserEntity::getUsername).forEach(log::debug);
        return users;
    }

    private void createPrivateChats(List<UserEntity> users) {
        //creating private chats
        List<PrivateChatEntity> privateChats =
                Stream
                        .generate(() -> PrivateChatEntity.generatePrivateChat())
                        .limit(privateChatCount)
                        .collect(Collectors.toList());

        privateChatRepo.saveAll(privateChats);

        //generating UserChats for private chats
        int privateChatIndex = 0;
        for(Tuple pair : getUserPairs()) {
            //creating one UserChat for each user
            UserChat firstLink = UserChat.generateUserChat(UserChat.PermissionLevel.OWNER, privateChats.get(privateChatIndex), users.get(pair.x));
            UserChat secondLink = UserChat.generateUserChat(UserChat.PermissionLevel.OWNER, privateChats.get(privateChatIndex), users.get(pair.y));

            userChatRepository.save(firstLink);
            userChatRepository.save(secondLink);

            List<MessageEntity> firstUserMessages = Stream
                    .generate(() -> MessageEntity.generateMessage(firstLink))
                    .limit(msgsPerChat/2)
                    .collect(Collectors.toList());

            List<MessageEntity> secondUserMessages = Stream
                    .generate(() -> MessageEntity.generateMessage(secondLink))
                    .limit(msgsPerChat/2)
                    .collect(Collectors.toList());

            messageRepository.saveAll(firstUserMessages);
            messageRepository.saveAll(secondUserMessages);


            ++privateChatIndex;
        }
    }

    private void createGroupChats(HashSet<LinkedHashSet<Integer>> groupChatsLists, List<UserEntity> users) {
        List<GroupChatEntity> groupChats =
                Stream
                        .generate(GroupChatEntity::generateGroupChat)
                        .limit(groupChatCount)
                        .collect(Collectors.toList());

        groupChatRepository.saveAll(groupChats);

        List<UserChat> groupUserChats = new ArrayList<>();
        int groupChatsIndex = 0;

        for(LinkedHashSet<Integer> chatSet : groupChatsLists){
            ArrayList<Integer> chat = new ArrayList<>(chatSet);
            log.debug("HashSet -> ArrayList of chats {}", chat);
            groupUserChats.add(UserChat.generateUserChat(UserChat.PermissionLevel.OWNER,groupChats.get(groupChatsIndex),users.get(chat.get(0))));
            groupUserChats.add(UserChat.generateUserChat(UserChat.PermissionLevel.ADMIN,groupChats.get(groupChatsIndex),users.get(chat.get(1))));
            for (int i = 2; i < chat.size(); i++) {
                groupUserChats.add(UserChat.generateUserChat(UserChat.PermissionLevel.MEMBER,groupChats.get(groupChatsIndex),users.get(chat.get(i))));
            }

            groupChatsIndex++;
        }

        userChatRepository.saveAll(groupUserChats);

        int debugMessagePerUser = 0;
        for(UserChat groupUserChat : groupUserChats){
            List<MessageEntity> userMessages = Stream
                    .generate(() -> MessageEntity.generateGroupChatMessage(groupUserChat))
                    .limit(random.nextInt(msgsPerChat/2 - 2) + 2)
                    .collect(Collectors.toList());

            log.debug("User {} sent {} messages in group chat {}",groupUserChat.getUser().getFullName(),userMessages.size(),groupUserChat.getChat().getId());
            messageRepository.saveAll(userMessages);
        }

    }


    private HashSet<Tuple> getUserPairs() {
        HashSet<Tuple> result = new HashSet<>();
        int first, second;

        while(result.size() < privateChatCount){
            first = random.nextInt(userCount);
            do
                second = random.nextInt(userCount);
            while (first == second);

            result.add(new Tuple(Integer.valueOf(first), Integer.valueOf(second)));
        }


        return result;
    }

    private HashSet<LinkedHashSet<Integer>> getGroupChatsLists(){
        HashSet<LinkedHashSet<Integer>> result = new HashSet<>();
        while(result.size() < groupChatCount){
            LinkedHashSet<Integer> groupChatUserIndices = new LinkedHashSet<>();

            int groupSize = random.nextInt(maxUsersInGroupChat - minUsersInGroupChat) + minUsersInGroupChat;
            log.debug("Desired group size {}", groupSize);

            while(groupChatUserIndices.size() < groupSize){
                groupChatUserIndices.add(random.nextInt(userCount));
            }

            log.debug("Group chat user indices {}", groupChatUserIndices);

            result.add(groupChatUserIndices);
        }

        log.debug("Group Chats count {}", result.size());

        return result;

    }

}
