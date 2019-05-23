swagger: '2.0'
info:
  title: Poker API
  description: Design for Poker API
  version: v1
  license:
    name: GNU Affero General Public License Version 3
    url: http://www.gnu.org/licenses/agpl-3.0.en.html
  contact:
    name: IS Data Architecture Team
    url: https://is.oregonstate.edu/data-architecture
    email: isdataarchitecture@oregonstate.edu
schemes:
  - https
host: api.oregonstate.edu
basePath: /v1
externalDocs:
  description: GitHub Repository
  url: https://github.com/osu-mist/poker-api
produces:
  - application/json
paths:
  /games:
    post:
      summary: Create a poker game
      tags:
        - games
      consumes:
        - application/json
      operationId: postGames
      parameters:
        - in: body
          name: requestBody
          schema:
            $ref: '#/definitions/GamePostBody'
      responses:
        '201':
          description: Successfully created a game
          schema:
            $ref: '#/definitions/GameResult'
          headers:
            Location:
              type: string
              format: url
              description: Location of the newly created game
        '400':
          description: Invalid game object
          schema:
            $ref: '#/definitions/Errors'
        '500':
          description: Internal server error
          schema:
            $ref: '#/definitions/Errors'
  /games/{gameID}:
    get:
      summary: Info for a specific game
      tags:
        - games
      description: get game by game id
      operationId: getGameByID
      parameters: 
        - $ref: '#/parameters/authorization'
        - name: gameID
          in: path
          description: unique integer
          required: true
          type: integer
      responses:
        '200':
          description: Successful response
          schema:
            $ref: '#/definitions/GameResult'
        '404':
          description: Game not found
          schema:
            $ref: '#/definitions/Errors'
        '500':
          description: Internal server error
          schema:
            $ref: '#/definitions/Errors'
  /players/{playerID}:
    get:
      summary: Info for a specific player in a game
      tags:
        - players
      description: get player by player id
      operationId: getPlayerByID
      parameters: 
        - $ref: '#/parameters/authorization'
        - name: playerID
          in: path
          description: g[int]p[int] where the first int is the ID of the game and the second int is the ID of the player in that game.
          required: true
          type: string
          pattern: '^g[1-9]\d*p[1-9]\d*$'
      responses:
        '200':
          description: Successful response
          schema:
            $ref: '#/definitions/PlayerResult'
        '404':
          description: Game not found
          schema:
            $ref: '#/definitions/Errors'
        '500':
          description: Internal server error
          schema:
            $ref: '#/definitions/Errors'
      
parameters:
  authorization:
    name: Authorization
    in: header
    type: string
    required: true
    description: '"Bearer [token]" where token is your OAuth2 access token'
definitions:
  GameResource:
    properties:
      id:
        $ref: '#/definitions/gameId'
      type:
        $ref: '#/definitions/gameType'
      attributes:
        type: object
        properties:
          round:
            $ref: '#/definitions/round'
          players:
            $ref: '#/definitions/players'
          tableCards:
            $ref: '#/definitions/cards'
      links:
        $ref: '#/definitions/SelfLink'
  players:
    type: array
    items:
      $ref: '#/definitions/player'
  player:
    type: object
    properties:
      cards:
        $ref: '#/definitions/cards'
      bet:
        $ref: '#/definitions/playerBet'
      status:
        $ref: '#/definitions/playerStatus'
  playerBet:
    type: integer
    minimum: 0
    description: Each player's bet
  playerStatus:
    type: string
    enum:
      - "called"
      - "raised"
      - "checked"
      - "folded"
  playerResource:
    properties:
      id:
        $ref: '#/definitions/playerID'
      type:
        $ref: '#/definitions/playerType'
      attributes:
        type: object
        properties:
          players:
            $ref: '#/definitions/players'
  card:
    properties:
      attributes:
        type: object
        properties:
          cardNumber:
            $ref: '#/definitions/cardNumber'
          cardSuit:
            $ref: '#/definitions/cardSuit'
  cardNumber:
    type: string
    enum: 
      - 'A'
      - '2'
      - '3'
      - '4'
      - '5'
      - '6'
      - '7'
      - '8'
      - '9'
      - '10'
      - 'J'
      - 'Q'
      - 'K'
  cardSuit:
    type: string
    enum:
      - 'Diamond'
      - 'Club'
      - 'Spade'
      - 'Heart'
      
  GamePostBody:
    properties:
      data:
        type: object
        properties:
          type:
            $ref: '#/definitions/gameType'
          attributes:
            type: object
            properties:
              playerNum:
                $ref: '#/definitions/playerNum'
              minimumBet:
                $ref: '#/definitions/minimumBet'
              maximumBet:
                $ref: '#/definitions/maximumBet'
            required:
              - playerNum
              - minimumBet
              - maximumBet
            additionalProperties: false
        required: 
          - type
          - attributes
        additionalProperties: false
    required:
      - data
    additionalProperties: false
  gameType:
    type: string
    enum:
      - game
  playerType:
    type: string
    enum:
      - player
  playerID:
    type: string
    example: 'g1p1'
    pattern: '^g[1-9]\d*p[1-9]\d*$'
  gameId:
    type: integer
    minimum: 0
    description: A unique ID of a poker game
  playerNum:
    type: integer
    maximum: 5
    minimum: 2
    description: The number of player in the game
    example: 2
  minimumBet:
    type: integer
    minimum: 0
    description: The minimum bet every player have to place at least each round.
    example: 1000
  maximumBet:
    type: integer
    minimum: 0
    description: The maximum bet every player can place each round.
    example: 2000
  playerLinks:
    type: array
    items:
      $ref: '#/definitions/playerLink'
  playerLink:
    type: string
    format: url
    description: Link to the playerResource
  cards:
    type: array
    items:
      $ref: '#/definitions/card'
  cardLink:
    type: string
    format: url
    description: Link to the cardResource
  GameResult:
    properties:
      links:
        $ref: '#/definitions/SelfLink'
      data:
        $ref: '#/definitions/GameResource'
  PlayerResult:
    properties:
      links:
        $ref: '#/definitions/SelfLink'
      data:
        $ref: '#/definitions/playerResource'
  round:
    type: string
    enum:
      - 'blind'
      - 'flop'
      - 'turn'
      - 'river'
      - 'showdown'
  SelfLink:
    properties:
      self:
        type: string
        format: url
        description: Self-link of current resource
  
  Error:
    properties:
      status:
        type: string
        description: HTTP status code
        example: '123'
      title:
        type: string
        description: A short, user readable summary of the error
        example: Not Found
      code:
        type: string
        description: An application-specific error code
        example: '1234'
      detail:
        type: string
        description: A long description of the error that may contain instance-specific details
      links:
        properties:
          about:
            type: string
            format: url
            description: A link to further information about the error
            example: https://developer.oregonstate.edu/documentation/error-reference#1234
  Errors:
    properties:
      errors:
        type: array
        items:
          $ref: '#/definitions/Error'
              