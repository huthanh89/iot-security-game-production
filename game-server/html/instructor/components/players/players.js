//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, PlayerData){

  $scope.players = _.values(PlayerData.playerData);

  $rootScope.$on('players', function(event, service) {
    $scope.players = _.values(service.playerData);

    // Call scope apply to ensure angular process the new model change.

    $scope.$apply();
  });

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('players', {
  templateUrl: 'instructor/components/players/players.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//