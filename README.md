#   Poker API

 ##  Purpose
The purpose of this project is to learn about RESTful APIs by creating one using Express.

 ##  Description
[Poker](https://en.wikipedia.org/wiki/Poker) is a family of card games that combines gambling, strategy, and skill. All poker variants involve betting as an instrinsic part of play, and determine the winner of each hand according to the combinations of players' cards, at least some of which remain hidden until the end of the hand. In this API project, I will be creating the API for Texas Hold'em variant.

 ##  GET

 ### /games/{id}
Returns game of a specific id number. Parameters include: id, numPlayers, round, and tableCards.

 ### /games/{id}/players
Returns a list of player in a specific game, with each individual player's parameter: id, cards, bet, and status.

 ### /games/{id}/players/{id}
Return a specific player in a specific game, with the parameter described above.

 ##  POST

 ### /games/
Post with a body of the game configuration, such as the total number of players, the minimum and maximum bet of each round, the status of the current round, and other settings.

 Example of a POST body:
```json
{
    "data":{
        "attributes":{
            "players": 5,
            "minimumBet": 1000,
            "maximumBet": 2000
        }
    }
}
```

 ##  PUT

 ### /games/{id}
Update the game by changing its round status. Other information of the game are not supposed to be changed by this endpoint.

 ### /games/{id}/players/{id}
Update the player by changing its bet or status. Other information of the player are not supposed to be changed by this endpoint.

 ### DELETE

 ### /games/{id}
Delete a game with its id.

 ### /games/{id}/player/{id}
Delete a player from a certain game(player leaving the game).