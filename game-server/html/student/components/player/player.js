//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){

  $rootScope.$watch('playerName', function(value){
    $scope.playerName = value;
  });

  $rootScope.$watch('teamName', function(value){
    $scope.teamName = value;
  });

  $rootScope.$watch('ip', function(value){
    $scope.ip = value;
  });

  $scope.editName = function(){
    $rootScope.openNameModal();
  };

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('player', {
  templateUrl: 'student/components/player/player.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//