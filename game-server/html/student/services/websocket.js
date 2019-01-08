//-------------------------------------------------------------------------------//
// Service
//
// Web Socket logic for student dashboard.
// ws://game-server.local:8080/player
//-------------------------------------------------------------------------------//

angular.module('gameApp').factory('WebSocketService', function($rootScope){

  let reconnect = true;
  let url       = 'ws://' + window.location.host + '/player'
  let ws        = new WebSocket(url);
  let urlParams = new URLSearchParams(window.location.search);
  let ip        = urlParams.get('ip')
  $rootScope.ip = ip;
  $rootScope.ws = ws;

  let service = {

    connectToWS: function () {

      ws.onopen = function() {

        var name = $rootScope.playerName;

        while (name == null || name == "") {
            name = prompt("Name:");
        }

        $rootScope.playerName = name;

        $rootScope.ws.send(JSON.stringify({
            type: 'login',
            name:  name,
            ip:    ip
        }));

        $rootScope.$applyAsync();
      };

      ws.onclose = function() {
          setTimeout(function() {
            service.connectToWS();
          }, 2000);
          $rootScope.$applyAsync();
      };

      ws.onmessage = function(event) {
          try {

              var msg = JSON.parse(event.data);
              var type = msg['type'];
            
              if (type == 'login') {
                  $rootScope.playerId = msg.id;
                  $rootScope.teamName = null;
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
                $rootScope.$broadcast('ws:scores', msg);
                $rootScope.$broadcast('ws:chatlist', msg);
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
                  var winner = msg['winner'];
                  if ($rootScope.loggedInUser.username == winner) {
                      $rootScope.missionCompleted = true;
                      $rootScope.$applyAsync();
                  } else {
                      $rootScope.otherMissionCompleted = true;
                      $rootScope.$applyAsync();
                  }
              }

          } 
          
          catch (e) {
          
          }

      };

    }

  }
  return service;
});

//-------------------------------------------------------------------------------//