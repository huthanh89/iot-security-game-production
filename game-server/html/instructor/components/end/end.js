//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//
function Controller($scope, $rootScope){

  $scope.ok = function() {
    $rootScope.ws.send(JSON.stringify({
      type: 'endGame',
    }));

    $('#reset-game-modal').modal('show')
  }

  $scope.resetGame = function() {
    $rootScope.ws.send(JSON.stringify({
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