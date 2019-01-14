//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $sanitize){

  // Initialize scope variable for chat view.
  
  $scope.chatHistory = '';
  $scope.chatMsg     = '';
  $scope.chatToList  = [{
    id:   'everyone',
    name: 'Everyone'
  }, {
    id:   'instructor',
    name: 'Instructor'
  }];

  $scope.chatTo = $scope.chatToList[0];

  // Function to update the chat to the list.
  
  $scope.updateChatToList = function(teams) {
    
    // Add teams to drop down list selection.

    $scope.chatToList.push({ 
      disabled: true, 
      id:   '__', 
      name: '-- Teams --' 
    });

    for (let index in teams) {
      let team = teams[index];
      $scope.chatToList.push({ 
        id:  `team:${team.name}`,
        name: team.name });
    }

    // Add players to drop down list selection.

    $scope.chatToList.push({ 
      disabled: true, 
      id:   '__', 
      name: '-- Players --' 
    });

    for (let teamIndex in teams) {
      let team = teams[teamIndex];
      for (let playerIndex in team.players) {
        let player = team.players[playerIndex];
        $scope.chatToList.push({ 
          id:   player.id, 
          name: player.name 
        });
      }
    }
      
  };

  // Function to send the new chat message to server.

  $scope.sendChat = function() {

    // Sanitize message
    
    let msg = $sanitize($scope.chatMsg);

    // Reset input box

    $scope.chatMsg = '';

    // If message is empty then exit,
    // else append chat and send msg to server.

    if (!msg) {
      return;
    } 
    else {
      $scope.appendChat('Me', $scope.chatTo.name, msg);
      $rootScope.ws.send(JSON.stringify({
          type: 'chat',
          to:    $scope.chatTo.id,
          msg:   msg
      }));
    }
  };

  // Function to append chat to the chat view.

  $scope.appendChat = function(from, to, msg) {
    let chatDiv = $('#chathistory');
    chatDiv.html(chatDiv.html() + '<br>' + from + ' to ' + to + ': ' + msg);
    $('.chat-history').scrollTop(chatDiv[0].scrollHeight);
  }

  // On start create he drop down list.

  $rootScope.$on('ws:chatlist', function(event, msg) {
    $scope.updateChatToList(msg.scores);
  });

  // Update chat list when new message comes from server.
  
  $rootScope.$on('ws:chat', function(event, msg) {
    $scope.appendChat(msg.from, msg.to, msg.msg);
    $rootScope.playSound();
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