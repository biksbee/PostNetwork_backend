
create TABLE person(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    nick VARCHAR(255),
    email VARCHAR(255),
    passwordHash VARCHAR(255),
    avatarUrl text
);

create TABLE post(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    content VARCHAR(255),
    date_change timestamp,
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES person(id)
);

create Table favoritepost(
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    post_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES person(id),
    FOREIGN KEY (post_id) REFERENCES post(id)
);