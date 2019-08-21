import json
import logging
import unittest
import yaml

from prance import ResolvingParser

import utils


class integration_tests(unittest.TestCase):
    @classmethod
    def setup(cls, config_path, openapi_path):
        with open(config_path) as config_file:
            config = json.load(config_file)
            cls.base_url = utils.setup_base_url(config)
            cls.session = utils.setup_session(config)
            cls.test_cases = config['test_cases']
            cls.local_test = config['local_test']

        with open(openapi_path) as openapi_file:
            openapi = yaml.load(openapi_file, Loader=yaml.SafeLoader)
            if 'swagger' in openapi:
                backend = 'flex'
            elif 'openapi' in openapi:
                backend = 'openapi-spec-validator'
            else:
                exit('Error: could not determine openapi document version')

        parser = ResolvingParser(openapi_path, backend=backend)
        cls.openapi = parser.specification

    @classmethod
    def tearDownClass(cls):
        cls.session.close()

    def assert_data_returned(self, test_case, response_data):
        error_message = (f'No data returned from server.'
                        f" Check that '{test_case}' in configuration.json"
                        f' contains valid data.')
        self.assertGreater(len(response_data), 0, error_message)

    #   Test case: GET /members
    def test_get_members(self):
        resource = 'MemberResource'
        current_test_case = 'member_nicknames'
        for member_name in self.test_cases[current_test_case]:
            with self.subTest('Test nickname query parameter',
                member_name=member_name):
                params = {'memberNickname' : member_name}
                response = utils.test_endpoint(self,
                                                f'/members',
                                                resource,
                                                200,
                                                query_params=params)
                response_data = response.json()['data']
                for row in response_data:
                    returned_nickname = row['attributes']['memberNickname']
                    self.assertEqual(member_name, returned_nickname)
                self.assert_data_returned(current_test_case, response_data)
        current_test_case = 'member_emails'
        for member_email in self.test_cases[current_test_case]:
            with self.subTest('Test email query parameter',
                member_email=member_email):
                params = {'memberEmail' : member_email}
                response = utils.test_endpoint(self,
                                                f'/members',
                                                resource,
                                                200,
                                                query_params=params)
                response_data = response.json()['data']
                for row in response_data:
                    returned_email = row['attributes']['memberEmail']
                    self.assertEqual(member_email, returned_email)
                self.assert_data_returned(current_test_case, response_data)


    #   Test case: GET /members/{id}

    def test_get_member_by_id(self):
        resource = 'MemberResource'
        current_test_case = 'valid_member_ids'
        for member_id in self.test_cases[current_test_case]:
            with self.subTest('Test Valid member Ids',
                member_id=member_id):
                response = utils.test_endpoint(self,
                                                f'/members/{member_id}',
                                                resource,
                                                200)
                response_data = response.json()['data']
                returned_memeber_id = response_data['id']
                self.assertEqual(returned_memeber_id, member_id)
        current_test_case = 'nonexistent_member_ids'
        for member_id in self.test_cases[current_test_case]:
            with self.subTest('Test valid but nonexistent member Ids',
                member_id=member_id):
                utils.test_endpoint(self,
                                    f'/members/{member_id}',
                                    'ErrorObject',
                                    404)
        current_test_case = 'invalid_member_ids'
        for member_id in self.test_cases[current_test_case]:
            with self.subTest('Test invalid member Ids',
                member_id=member_id):
                utils.test_endpoint(self,
                                    f'/members/{member_id}',
                                    'ErrorObject',
                                    404)

    #   Test case: GET /games/{gameId}

    def test_get_game_by_id(self):
        resource = 'GameResource'
        current_test_case = 'valid_game_ids'
        for game_id in self.test_cases[current_test_case]:
            with self.subTest('Test Valid game Ids',
                game_id=game_id):
                response = utils.test_endpoint(self,
                                                f'/games/{game_id}',
                                                resource,
                                                200)
                response_data = response.json()['data']
                returned_game_id = response_data['id']
                self.assertEqual(returned_game_id, game_id)

        current_test_case = 'nonexistent_game_ids'
        for game_id in self.test_cases[current_test_case]:
            with self.subTest('Test valid but nonexistent game Ids',
                game_id=game_id):
                utils.test_endpoint(self,
                                    f'/games/{game_id}',
                                    'ErrorObject',
                                    404)
        current_test_case = 'invalid_game_ids'
        for game_id in self.test_cases[current_test_case]:
            with self.subTest('Test invalid game Ids',
                game_id=game_id):
                utils.test_endpoint(self,
                                    f'/games/{game_id}',
                                    'ErrorObject',
                                    404)

    #   Test case: GET /games

    def test_get_games(self):
        path = '/games'
        resource = 'GameResource'
        current_test_case = "round_names"
        for game_round in self.test_cases[current_test_case]:
            with self.subTest('Test Valid game rounds',
                game_round=game_round):
                params = {'round' : game_round}
                response = utils.test_endpoint(self,
                                                f'/games',
                                                resource,
                                                200,
                                                query_params=params)
                response_data = response.json()['data']
                for row in response_data:
                    returned_round = row['attributes']['round']
                    self.assertEqual(game_round, returned_round)
                self.assert_data_returned(current_test_case, response_data)

        current_test_case = "invalid_round_names"
        for game_round in self.test_cases[current_test_case]:
            with self.subTest('Test Invalid game rounds',
                game_round=game_round):
                params = {'round' : game_round}
                response = utils.test_endpoint(self,
                                                f'/games',
                                                'ErrorObject',
                                                400,
                                                query_params=params)

    #   Test case: GET /games/{gameId}/players/{playerId}

    def test_get_player_by_id(self):
        resource = 'PlayerResource'
        current_test_case = 'valid_player_game_combination'
        for combination in self.test_cases[current_test_case]:
            with self.subTest('Test Valid game player combinations',
                game_id=combination[0], player_id=combination[1]):
                game_id = combination[0]
                player_id = combination[1]
                response = utils.test_endpoint(self,
                                                f'/games/{game_id}/players/{player_id}',
                                                resource,
                                                200)
                response_data = response.json()['data']
                returned_player_id = response_data['id']
                self.assertEqual(returned_player_id, player_id)

        current_test_case = 'nonexistent_player_game_combination'
        for combination in self.test_cases[current_test_case]:
            with self.subTest('Test valid but nonexistent player and game Id combinations',
                game_id=combination[0], player_id=combination[1]):
                game_id = combination[0]
                player_id = combination[1]
                utils.test_endpoint(self,
                                    f'/games/{game_id}/players/{player_id}',
                                    'ErrorObject',
                                    404)
        current_test_case = 'invalid_player_game_combination'
        for combination in self.test_cases[current_test_case]:
            with self.subTest('Test invalid player and game combination',
                game_id=combination[0], player_id=combination[1]):
                game_id = combination[0]
                player_id = combination[1]
                utils.test_endpoint(self,
                                    f'/games/{game_id}/players/{player_id}',
                                    'ErrorObject',
                                    404)
    #   Test Case: GET /games/{gameId}/players
    def test_get_players_in_game_by_game_id(self):
        resource = 'PlayerResource'
        current_test_case = 'valid_game_ids'
        for game_id in self.test_cases[current_test_case]:
            with self.subTest('Test Valid game Ids',
                game_id=game_id):
                utils.test_endpoint(self,
                                    f'/games/{game_id}/players',
                                    resource,
                                    200)
        current_test_case = 'nonexistent_game_ids'
        for game_id in self.test_cases[current_test_case]:
            with self.subTest('Test nonexistent game rounds',
                game_id=game_id):
                response = utils.test_endpoint(self,
                                                f'/games/{game_id}/players',
                                                'ErrorObject',
                                                404)
        current_test_case = 'invalid_game_ids'
        for game_id in self.test_cases[current_test_case]:
            with self.subTest('Test Invalid game rounds',
                game_id=game_id):
                response = utils.test_endpoint(self,
                                                f'/games/{game_id}/players',
                                                'ErrorObject',
                                                404)

    #   Test case: GET /members/{memberId}/games
    def test_get_games_with_member_by_member_id(self):
        resource = 'GameResource'
        current_test_case = 'valid_member_ids'
        for member_id in self.test_cases[current_test_case]:
            with self.subTest('Test Valid member Ids',
                member_id=member_id):
                utils.test_endpoint(self,
                                    f'/members/{member_id}/games',
                                    resource,
                                    200)
        current_test_case = 'nonexistent_member_ids'
        for member_id in self.test_cases[current_test_case]:
            with self.subTest('Test Valid member Ids',
                member_id=member_id):
                utils.test_endpoint(self,
                                    f'/members/{member_id}/games',
                                    'ErrorObject',
                                    404)
        current_test_case = 'invalid_member_ids'
        for member_id in self.test_cases[current_test_case]:
            with self.subTest('Test Valid member Ids',
                member_id=member_id):
                utils.test_endpoint(self,
                                    f'/members/{member_id}/games',
                                    'ErrorObject',
                                    404)


if __name__ == '__main__':
    arguments, argv = utils.parse_arguments()

    # Setup logging level
    if arguments.debug:
        logging.basicConfig(level=logging.DEBUG)
    else:
        logging.basicConfig(level=logging.INFO)

    integration_tests.setup(arguments.config_path, arguments.openapi_path)
    unittest.main(argv=argv)
