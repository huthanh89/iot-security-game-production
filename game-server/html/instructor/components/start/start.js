//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $location, PlayerData){

  // Initialize player and team data.

  $scope.playerData = {};
  $scope.teamData = {
    teams:       [],
    players:     [],
    teamPlayers: []
  };

  $scope.$watch(function(){
    return PlayerData.playerData;
  }, function(newVal, oldVal){
    $scope.playerData = newVal;
  });

  $scope.$watch(function(){
    return PlayerData.teamData;
  }, function(newVal, oldVal){
    $scope.teamData = newVal;
  });

  /** Function to start the game .*/

  $scope.start = function() {
    var data = {
        'type': 'start',
        'piCount': 9,
        'teams': [],
        'otherConfig': {
            'cheat': ($location.search().cheat == true)
        }
    };

    // If no players have been assigned a team,
    // then escape the function and warn the user.
    
    if($scope.teamData.teamPlayers.length == 0){
      alert('Players have not been assigned a team yet.')
      return;
    }
    
    // Send out Websocket request to start game.

    let teams = {}

    angular.forEach($scope.teamData.teamPlayers, function(player) {
        if (teams[player.selectedTeam]) {
            teams[player.selectedTeam].players.push(player.id);
        } else {
            teams[player.selectedTeam] = { name: player.selectedTeam, players: [player.id] }
        }
    });

    for (var team in teams)
        data.teams.push(teams[team]);

    $rootScope.ws.send(JSON.stringify(data));
  }

  $scope.loadAutoSave = function(bResponse) {
    $rootScope.ws.send(JSON.stringify({
      type: 'loadAutoSave',
      response: bResponse
    }));
  }


}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('start', {
  templateUrl: 'instructor/components/start/start.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//