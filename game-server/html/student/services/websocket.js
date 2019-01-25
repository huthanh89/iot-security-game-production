//-------------------------------------------------------------------------------//
// Service
//
// Web Socket logic for student dashboard.
// ws://game-server.local:8080/player
//-------------------------------------------------------------------------------//

angular.module('gameApp').factory('WebSocketService', function($rootScope, $location, $timeout){

  let service = {
    
    connectToWS: function () {

      let reconnect = true;
      let url       = 'ws://' + window.location.host + '/player'
      let ws        = new WebSocket(url);
      let ip        = $location.search().ip;
      $rootScope.ip = ip;
      $rootScope.ws = ws;
      
      ws.onopen = function() {

        // Use timeout to run code after dom finish rendering.
        
        $timeout(function(){

          let name = sessionStorage.getItem("playername");

          if(name == null) {
            $rootScope.openNameModal();
          }
          else{
            $rootScope.playerName = name;
            $rootScope.ws.send(JSON.stringify({
              type: 'login',
              name:  name,
              ip:    $rootScope.ip
            }));
          }
          
        });
      };

      ws.onclose = function() {
        setTimeout(function() {
          service.connectToWS();
        }, 2000);
        $rootScope.$applyAsync();
      };

      ws.onmessage = function(event) {

        try {

            let msg  = JSON.parse(event.data);
            let type = msg['type'];

            if (type == 'login') {
              $rootScope.playerId = msg.id;
              $rootScope.teamName = null;
              $rootScope.ip       = $rootScope.playerId;
              $rootScope.refreshGrid();
            } 

            else if (type == 'chat') {
              if (msg.to == '__notification__') {
                $rootScope.$broadcast('ws:notification', msg); 
              }
              else {
                $rootScope.$broadcast('ws:chat', msg);
              }          
            } 
            
            else if (type == 'started') {
              $rootScope.waiting = false;
              $rootScope.$applyAsync();
              $rootScope.$broadcast('ws:started', msg);
            } 
            
            else if (type == 'scores') {

              // Set team name.
              
              msg.scores.forEach(function(team){
                team.players.forEach(function(player){
                  if(player.name == $rootScope.playerName){
                    $rootScope.teamName = team.name;
                  }
                })
              })

              // Update views.

              $rootScope.$broadcast('ws:scores', msg);
              $rootScope.$broadcast('ws:chatlist', msg);
              $rootScope.$broadcast('ws:endscores', msg);
              $rootScope.$applyAsync();
            } 
            
            else if (type == 'gameboard') {
              $rootScope.$broadcast('ws:gameboard', msg);
            } 
            
            else if (type == 'stateData') {

              // Update tools list.

              $rootScope.$broadcast('ws:tools', msg);

              // Update mission state.

              $rootScope.$broadcast('ws:selectedMission', msg);

              // Show mission.

              $rootScope.$broadcast('ws:mission', msg);
            } 
            
            else if (type == 'incorrectFlag') {
              $rootScope.openWrongModal();
            } 
            
            else if (type == 'error') {
              $rootScope.openErrorModal("Error", msg.msg);
            } 
            
            else if (type == 'levelsCompleted') {
              $rootScope.openCompletedModal();
            } 
            
            else if (type == 'endgame') {
              $rootScope.openEndGameModal(msg);
            }

            else if (type == "resetGame"){
              location.reload();
            }

        } 
        
        catch (e) {
          console.log(e);
        }

      };

    }

  }
  return service;
});

//-------------------------------------------------------------------------------//
