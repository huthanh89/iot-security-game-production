//-------------------------------------------------------------------------------//
// Service
//
// Contains Player and Team Data
//-------------------------------------------------------------------------------//

angular.module('gameApp').factory('PlayerData', function($rootScope){

  let service = {

    playerData: {},
    
    teamData: {
      teams:       [],
      players:     [],
      teamPlayers: []
    },

    updatePlayerData: function(player) {

      let oldPlayer = service.playerData[player.id];
  
      if (oldPlayer) {
        for (var i in player)
          oldPlayer[i] = player[i];
        
        angular.forEach(service.teamData.players, function(t, i) { 
          if (t.id == player.id) {
            t = player;
          }
        });
      }

      else {
        service.playerData[player.id] = player;
        service.teamData.players.push(player);
      }

      $rootScope.$broadcast('players', service);
    }
  }
  
  return service;

});

//-------------------------------------------------------------------------------//
