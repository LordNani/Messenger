insert into users (id, username, password, full_name, bio, role)
values ('9f6a075e-a4c5-44da-b7c5-5f22bb64b352', 'user', '$2y$12$ixe4Lh4uQVncJDzPJWckfeyTXPMkuVZm55miqLdnn/TjH0FoF8HOq',
        'Full Name', 'My info', 'USER');

insert into refresh_token (id, user_id, created_at)
values ('96810518-56a5-4786-96e2-4f7434dea41b', '9f6a075e-a4c5-44da-b7c5-5f22bb64b352', '2022-01-01 00:00'),
       ('11111111-56a5-4786-96e2-4f7434dea41b', '9f6a075e-a4c5-44da-b7c5-5f22bb64b352', '2000-01-01 00:00');
