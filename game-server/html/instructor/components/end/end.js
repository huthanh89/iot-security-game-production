//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//
function Controller($scope, $rootScope){



  $scope.ok = function() {
    ws.send(JSON.stringify({
      type: 'endGame',
    }));

    $('#reset-game-modal').modal('show')
  }

  $scope.resetGame = function() {
    ws.send(JSON.stringify({
      type: 'resetGame',
    }));
  }




}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('end', {
  templateUrl: 'instructor/components/end/end.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//