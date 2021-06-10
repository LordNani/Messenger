insert into users (id, username, password, full_name, bio, role)
values ('9f6a075e-a4c5-44da-b7c5-5f22bb64b352', 'user', '$2y$12$ixe4Lh4uQVncJDzPJWckfeyTXPMkuVZm55miqLdnn/TjH0FoF8HOq',
        'Full Name', 'My info', 'USER'),
       ('dacee9b4-6789-4f03-9520-dc97b0b9470b', 'user2', '$2y$12$ixe4Lh4uQVncJDzPJWckfeyTXPMkuVZm55miqLdnn/TjH0FoF8HOq',
        'Full Name 2', 'My info 2', 'USER'),
       ('fafae9b4-6789-4f03-9520-dc97b0b9470b', 'user2fa', '$2y$12$ixe4Lh4uQVncJDzPJWckfeyTXPMkuVZm55miqLdnn/TjH0FoF8HOq',
        'Full Name 2', 'My info 2', 'USER'),
       ('babae9b4-6789-4f03-9520-dc97b0b9470b', 'user_baba', '$2y$12$ixe4Lh4uQVncJDzPJWckfeyTXPMkuVZm55miqLdnn/TjH0FoF8HOq',
        'Full Name baba', 'My info baba', 'USER');

insert into group_chat (id, group_name)
values ('51c07af2-5ed1-4e30-b054-e5a3d51da5a5', 'GROUP_title'),
       ('12345678-5ed1-4e30-b054-e5a3d51da5a5', 'one person group');

insert into private_chat (id)
values ('06dfa92e-532d-4b38-bd21-355328bc4270');

insert into user_chat (id, permission_level, seen_time, chat_id, user_id)
values ('e2c146a4-9e5e-4c0b-b661-4e790e76ea4d', 'OWNER', '2019-01-01 00:00', '51c07af2-5ed1-4e30-b054-e5a3d51da5a5',
        '9f6a075e-a4c5-44da-b7c5-5f22bb64b352'),
       ('e9fe386e-e194-4d97-aae5-bfc03ce8767a', 'MEMBER', '2019-01-01 00:00', '06dfa92e-532d-4b38-bd21-355328bc4270',
        '9f6a075e-a4c5-44da-b7c5-5f22bb64b352'),
       ('360cdbbf-5433-47b8-a32b-4fe0ab84df73', 'MEMBER', '2019-01-01 00:00', '51c07af2-5ed1-4e30-b054-e5a3d51da5a5',
        'dacee9b4-6789-4f03-9520-dc97b0b9470b'),
       ('7250ffcd-371e-47d9-a217-393438ce06bd', 'MEMBER', '2019-01-01 00:00', '06dfa92e-532d-4b38-bd21-355328bc4270',
        'dacee9b4-6789-4f03-9520-dc97b0b9470b'),
       ('22222222-e194-4d97-aae5-bfc03ce8767a', 'OWNER', '2019-01-01 00:00', '12345678-5ed1-4e30-b054-e5a3d51da5a5',
        'dacee9b4-6789-4f03-9520-dc97b0b9470b'),
       ('33333333-e194-4d97-aae5-bfc03ce8767a', 'ADMIN', '2019-01-01 00:00', '51c07af2-5ed1-4e30-b054-e5a3d51da5a5',
        'babae9b4-6789-4f03-9520-dc97b0b9470b');

insert into Message (id, created_at, message_body, user_id, chat_id)
values ('ffffa92e-9e5e-4c0b-b661-4e790e76ea4d', '2012-09-17 18:47:52.69', 'some message text', '9f6a075e-a4c5-44da-b7c5-5f22bb64b352',
        '06dfa92e-532d-4b38-bd21-355328bc4270');
