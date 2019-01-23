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

    update: function(newPlayer) {

      let oldPlayer = service.playerData[newPlayer.id];
  
      if (oldPlayer) {
        for (let index in newPlayer)
          oldPlayer[index] = newPlayer[index];
        
        service.teamData.players.forEach(function(player) { 
          if (player.id == newPlayer.id) {
            player = newPlayer;
          }
        });
      }

      else {
        service.playerData[newPlayer.id] = newPlayer;
        service.teamData.players.push(newPlayer);
      }

      $rootScope.$broadcast('players', service);
    }
  }
  
  return service;

});

//-------------------------------------------------------------------------------//
