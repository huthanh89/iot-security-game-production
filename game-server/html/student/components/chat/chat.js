//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
    
  /** Intialize scope variables. */
  $scope.chatHistory = '';
  $scope.chatMsg = '';
  $scope.chatToList = [{
      id: 'everyone',
      name: 'Everyone'
  }, {
      id: 'instructor',
      name: 'Instructor'
  }];
  $scope.chatTo = $scope.chatToList[0];

  /** Function to get scores from score board */
  function getScores(scoreboard) {
    var scores = [];
    for (var i in scoreboard) {
        scores.push({
            name: scoreboard[i].name,
            score: scoreboard[i].score
        });
    }
    return scores;
  }

  /** Function to update the chat to the list .*/
  $scope.updateChatToList = function() {
    if ($scope.chatToList.length == 2) {
        for (var t in $scope.scoreBoard) {

            var team = $scope.scoreBoard[t];

            for (var p in team.players) {
                var player = team.players[p];
                if (player.id == $rootScope.playerId) {
                    $rootScope.teamName = team.name;
                    break;
                }
            }
        }

        // Append team members.

        $scope.chatToList.push({ disabled: true, id: '__', name: '--' });
        $scope.chatToList.push({ id: 'team', name: 'My Team' });
        for (var t in $scope.scoreBoard) {
            var team = $scope.scoreBoard[t];
            if (team.name != $rootScope.teamName) {
                $scope.chatToList.push({ id: 'team:' + team.name, name: team.name });
            }
        }

        // Append other team members.

        $scope.chatToList.push({ disabled: true, id: '__', name: '--' });
        for (var t in $scope.scoreBoard) {
            var team = $scope.scoreBoard[t];
            for (var p in team.players) {
                var player = team.players[p];
                if (player.id != $scope.playerId) {
                    $scope.chatToList.push({ id: player.id, name: player.name });
                }
            }
        }
    }
  };

  /** Function to append chat to the chat view */
    
  $scope.appendChat = function(from, to, msg) {
      var chatDiv = $('#chathistory');
      chatDiv.html(chatDiv.html() + '<br>' + from + ' to ' + to + ': ' + msg);
      $('.chat-history').scrollTop(chatDiv[0].scrollHeight);
  }
  
  /** Function to send the chat */
  $scope.sendChat = function() {
    var msg = $scope.chatMsg;
    $scope.chatMsg = '';
    if (!msg)
        return;
    $scope.appendChat('Me', $scope.chatTo.name, msg);
    $rootScope.ws.send(JSON.stringify({
        type: 'chat',
        to: $scope.chatTo.id,
        msg: msg
    }));
  };

  $rootScope.$on('ws:chat', function(event, msg) {
    $scope.appendChat(msg.from, msg.to, msg.msg);
    $rootScope.playSound();
  });

  $rootScope.$on('ws:chatlist', function(event, msg) {
    $scope.scoreBoard = msg.scores;
    $scope.updateChatToList();
  });
}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('chat', {
  templateUrl: 'student/components/chat/chat.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//