DROP TABLE PLAYER_CARDS;
DROP TABLE PLAYERS;
DROP TABLE STATUSES;
DROP TABLE TABLE_CARDS;
DROP TABLE GAMES;
DROP TABLE MEMBERS;
DROP TABLE ROUNDS;
DROP TABLE CARDS;
DROP TABLE CARD_NUMBERS;
DROP TABLE CARD_SUITS;


CREATE TABLE CARD_SUITS (
    SUIT_ID VARCHAR2(255 BYTE) NOT NULL,
    SUIT    VARCHAR2(255 BYTE) NOT NULL,
    PRIMARY KEY (SUIT_ID)
);

COMMENT ON TABLE CARD_SUITS IS 'Contains possible values for card suit';
COMMENT ON COLUMN CARD_SUITS.SUIT_ID IS 'ID of suit';
COMMENT ON COLUMN CARD_SUITS.SUIT IS 'Suit name';

INSERT INTO CARD_SUITS (SUIT_ID, SUIT) VALUES ('S','spades');
INSERT INTO CARD_SUITS (SUIT_ID, SUIT) VALUES ('D','diamonds');
INSERT INTO CARD_SUITS (SUIT_ID, SUIT) VALUES ('C','clubs');
INSERT INTO CARD_SUITS (SUIT_ID, SUIT) VALUES ('H','hearts');

CREATE TABLE CARD_NUMBERS (
    CARD_NUMBER_ID NUMBER NOT NULL,
    CARD_NUMBER    VARCHAR2(255 BYTE) NOT NULL,
    PRIMARY KEY (CARD_NUMBER_ID)
);

COMMENT ON TABLE CARD_NUMBERS IS 'Contains possible values for card number';
COMMENT ON COLUMN CARD_NUMBERS.CARD_NUMBER_ID IS 'ID of number';
COMMENT ON COLUMN CARD_NUMBERS.CARD_NUMBER IS 'number name';

INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (1,'A');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (2,'2');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (3,'3');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (4,'4');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (5,'5');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (6,'6');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (7,'7');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (8,'8');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (9,'9');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (10,'10');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (11,'J');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (12,'Q');
INSERT INTO CARD_NUMBERS (CARD_NUMBER_ID, CARD_NUMBER) VALUES (13,'K');

CREATE TABLE CARDS (
    CARD_ID NUMBER NOT NULL,
    CARD_NUMBER_ID NUMBER NOT NULL,
    CARD_SUIT_ID VARCHAR2(255 BYTE) NOT NULL,
    PRIMARY KEY (CARD_ID),
    FOREIGN KEY (CARD_NUMBER_ID) REFERENCES CARD_NUMBERS(CARD_NUMBER_ID),
    FOREIGN KEY (CARD_SUIT_ID) REFERENCES CARD_SUITS(SUIT_ID)
);

COMMENT ON TABLE CARDS IS 'Contains cards that are possible to appear in a game';
COMMENT ON COLUMN CARDS.CARD_ID IS 'ID of card';
COMMENT ON COLUMN CARDS.CARD_NUMBER_ID IS 'Reference to the number of the card';
COMMENT ON COLUMN CARDS.CARD_SUIT_ID IS 'Reference to the suit of the card';

INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (1, 1, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (2, 2, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (3, 3, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (4, 4, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (5, 5, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (6, 6, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (7, 7, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (8, 8, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (9, 9, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (10, 10, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (11, 11, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (12, 12, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (13, 13, 'S');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (14, 1, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (15, 2, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (16, 3, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (17, 4, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (18, 5, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (19, 6, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (20, 7, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (21, 8, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (22, 9, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (23, 10, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (24, 11, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (25, 12, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (26, 13, 'D');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (27, 1, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (28, 2, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (29, 3, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (30, 4, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (31, 5, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (32, 6, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (33, 7, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (34, 8, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (35, 9, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (36, 10, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (37, 11, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (38, 12, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (39, 13, 'C');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (40, 1, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (41, 2, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (42, 3, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (43, 4, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (44, 5, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (45, 6, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (46, 7, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (47, 8, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (48, 9, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (49, 10, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (50, 11, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (51, 12, 'H');
INSERT INTO CARDS (CARD_ID, CARD_NUMBER_ID, CARD_SUIT_ID) VALUES (52, 13, 'H');

CREATE TABLE ROUNDS (
    ROUND_ID VARCHAR2(255 BYTE) NOT NULL,
    ROUND VARCHAR2(255 BYTE) NOT NULL,
    PRIMARY KEY (ROUND_ID)
);

COMMENT ON TABLE ROUNDS IS 'The rounds that are possible to appear in a game';
COMMENT ON COLUMN ROUNDS.ROUND_ID IS 'The ID of the round';
COMMENT ON COLUMN ROUNDS.ROUND IS 'The name of the round';

INSERT INTO ROUNDS (ROUND_ID, ROUND) VALUES ('B', 'blind');
INSERT INTO ROUNDS (ROUND_ID, ROUND) VALUES ('F', 'flop');
INSERT INTO ROUNDS (ROUND_ID, ROUND) VALUES ('T', 'turn');
INSERT INTO ROUNDS (ROUND_ID, ROUND) VALUES ('R', 'river');
INSERT INTO ROUNDS (ROUND_ID, ROUND) VALUES ('S', 'showdown');

CREATE TABLE MEMBERS (
    MEMBER_ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    MEMBER_NICKNAME VARCHAR2(255 BYTE) NOT NULL,
    MEMBER_EMAIL VARCHAR2(255 BYTE) NOT NULL,
    MEMBER_LEVEL NUMBER NOT NULL,
    MEMBER_EXP_OVER_LEVEL NUMBER NOT NULL,
    MEMBER_PASSWORD VARCHAR2(255 BYTE) NOT NULL,
    PRIMARY KEY (MEMBER_ID),
    UNIQUE (MEMBER_EMAIL),
    UNIQUE (MEMBER_NICKNAME)
);

COMMENT ON TABLE MEMBERS IS 'The member in the system';
COMMENT ON COLUMN MEMBERS.MEMBER_ID IS 'The ID of the member';
COMMENT ON COLUMN MEMBERS.MEMBER_NICKNAME IS 'The user name of the member';
COMMENT ON COLUMN MEMBERS.MEMBER_EMAIL IS 'The email address of the member';
COMMENT ON COLUMN MEMBERS.MEMBER_LEVEL IS 'The level of member in the system';
COMMENT ON COLUMN MEMBERS.MEMBER_EXP_OVER_LEVEL IS 'The experience of member that is above the current level';
COMMENT ON COLUMN MEMBERS.MEMBER_PASSWORD IS 'The password of member, which should be stored in hashed form';

INSERT INTO MEMBERS (MEMBER_NICKNAME, MEMBER_EMAIL, MEMBER_LEVEL, MEMBER_EXP_OVER_LEVEL, MEMBER_PASSWORD) VALUES ('guz', 'guz@oregonstate.edu', 123, 10492, 'hunter3');
INSERT INTO MEMBERS (MEMBER_NICKNAME, MEMBER_EMAIL, MEMBER_LEVEL, MEMBER_EXP_OVER_LEVEL, MEMBER_PASSWORD) VALUES ('John Wick', 'wickj@oregonstate.edu', 200, 114514, 'hunter10');
INSERT INTO MEMBERS (MEMBER_NICKNAME, MEMBER_EMAIL, MEMBER_LEVEL, MEMBER_EXP_OVER_LEVEL, MEMBER_PASSWORD) VALUES ('G Man', 'gman@gmail.com', 1, 0, 'hunter100');

CREATE TABLE GAMES (
    GAME_ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    ROUND_ID VARCHAR2(255 BYTE) NOT NULL,
    MINIMUM_BET NUMBER NOT NULL,
    MAXIMUM_BET NUMBER NOT NULL,
    BET_POOL NUMBER NOT NULL,
    PRIMARY KEY (GAME_ID),
    FOREIGN KEY (ROUND_ID) REFERENCES ROUNDS(ROUND_ID)
);

COMMENT ON TABLE GAMES IS 'The games going on in the system';
COMMENT ON COLUMN GAMES.GAME_ID IS 'The ID of the game';
COMMENT ON COLUMN GAMES.ROUND_ID IS 'The current round of the game';
COMMENT ON COLUMN GAMES.MINIMUM_BET IS 'The minimum bet set in the game';
COMMENT ON COLUMN GAMES.MAXIMUM_BET IS 'The maximum bet set in the game';
COMMENT ON COLUMN GAMES.BET_POOL IS 'The total bet from players in the game';

INSERT INTO GAMES (GAME_ID, ROUND_ID, MINIMUM_BET, MAXIMUM_BET, BET_POOL) VALUES (1, 'B', 100, 200, 300);
INSERT INTO GAMES (GAME_ID, ROUND_ID, MINIMUM_BET, MAXIMUM_BET, BET_POOL) VALUES (2, 'R', 1000, 2000, 104000);
INSERT INTO GAMES (GAME_ID, ROUND_ID, MINIMUM_BET, MAXIMUM_BET, BET_POOL) VALUES (3, 'R', 10000, 20000, 1040000);
CREATE TABLE TABLE_CARDS (
    GAME_ID NUMBER NOT NULL,
    CARD_ID NUMBER NOT NULL,
    PRIMARY KEY (GAME_ID, CARD_ID),
    FOREIGN KEY (GAME_ID) REFERENCES GAMES(GAME_ID),
    FOREIGN KEY (CARD_ID) REFERENCES CARDS(CARD_ID)
);

COMMENT ON TABLE TABLE_CARDS IS 'The cards on a certain game"s table';
COMMENT ON COLUMN TABLE_CARDS.GAME_ID IS 'The ID of the game';
COMMENT ON COLUMN TABLE_CARDS.CARD_ID IS 'The ID of the card';

INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (1, 1);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (1, 2);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (1, 3);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (1, 4);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (1, 5);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (2, 21);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (2, 22);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (2, 23);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (2, 24);
INSERT INTO TABLE_CARDS (GAME_ID, CARD_ID) VALUES (2, 25);
CREATE TABLE STATUSES (
    STATUS_ID VARCHAR2 (255 BYTE) NOT NULL,
    STATUS VARCHAR2 (255 BYTE) NOT NULL,
    PRIMARY KEY (STATUS_ID)
);

COMMENT ON TABLE STATUSES IS 'The status of a player';
COMMENT ON COLUMN STATUSES.STATUS_ID IS 'The ID of status';
COMMENT ON COLUMN STATUSES.STATUS IS 'The name of the status';

INSERT INTO STATUSES (STATUS_ID, STATUS) VALUES ('FO','folded');
INSERT INTO STATUSES (STATUS_ID, STATUS) VALUES ('CA','called');
INSERT INTO STATUSES (STATUS_ID, STATUS) VALUES ('RA','raised');
INSERT INTO STATUSES (STATUS_ID, STATUS) VALUES ('CH','checked');


CREATE TABLE PLAYERS (
    PLAYER_ID NUMBER GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) NOT NULL,
    MEMBER_ID NUMBER NOT NULL,
    GAME_ID NUMBER NOT NULL,
    PLAYER_BET NUMBER NOT NULL,
    STATUS_ID VARCHAR2 (255 BYTE) NOT NULL,
    PRIMARY KEY (PLAYER_ID),
    FOREIGN KEY (MEMBER_ID) REFERENCES MEMBERS(MEMBER_ID),
    FOREIGN KEY (STATUS_ID) REFERENCES STATUSES(STATUS_ID),
    FOREIGN KEY (GAME_ID) REFERENCES GAMES(GAME_ID)
);

COMMENT ON TABLE PLAYERS IS 'The players in games';
COMMENT ON COLUMN PLAYERS.PLAYER_ID IS 'The ID of the player';
COMMENT ON COLUMN PLAYERS.MEMBER_ID IS 'The member ID of the player';
COMMENT ON COLUMN PLAYERS.GAME_ID IS 'The game ID of the player';
COMMENT ON COLUMN PLAYERS.PLAYER_BET IS 'The current bet of the player in the game';
COMMENT ON COLUMN PLAYERS.STATUS_ID IS 'The current status of the player in the game';

INSERT INTO PLAYERS (MEMBER_ID, GAME_ID, PLAYER_BET, STATUS_ID) VALUES (1, 1, 100, 'FO');
INSERT INTO PLAYERS (MEMBER_ID, GAME_ID, PLAYER_BET, STATUS_ID) VALUES (2, 1, 300, 'RA');
INSERT INTO PLAYERS (MEMBER_ID, GAME_ID, PLAYER_BET, STATUS_ID) VALUES (3, 1, 300, 'CA');
INSERT INTO PLAYERS (MEMBER_ID, GAME_ID, PLAYER_BET, STATUS_ID) VALUES (2, 2, 3000, 'RA');
INSERT INTO PLAYERS (MEMBER_ID, GAME_ID, PLAYER_BET, STATUS_ID) VALUES (3, 2, 3000, 'CA');


CREATE TABLE PLAYER_CARDS (
    PLAYER_ID NUMBER NOT NULL,
    CARD_ID NUMBER NOT NULL,
    PRIMARY KEY (PLAYER_ID, CARD_ID),
    FOREIGN KEY (PLAYER_ID) REFERENCES PLAYERS(PLAYER_ID),
    FOREIGN KEY (CARD_ID) REFERENCES CARDS(CARD_ID)
);
INSERT INTO PLAYER_CARDS (PLAYER_ID, CARD_ID) VALUES (1, 6);
INSERT INTO PLAYER_CARDS (PLAYER_ID, CARD_ID) VALUES (1, 7);
INSERT INTO PLAYER_CARDS (PLAYER_ID, CARD_ID) VALUES (2, 8);
INSERT INTO PLAYER_CARDS (PLAYER_ID, CARD_ID) VALUES (2, 9);
INSERT INTO PLAYER_CARDS (PLAYER_ID, CARD_ID) VALUES (3, 10);
INSERT INTO PLAYER_CARDS (PLAYER_ID, CARD_ID) VALUES (3, 11);



COMMENT ON TABLE PLAYER_CARDS IS 'The cards that belong to a certain player';
