//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){

  $scope.notifications = [];

  $rootScope.$on('ws:notification', function(event, msg) {

    // Append new message in front.

    $scope.notifications.unshift(
      { date: new Date(), msg: msg.msg }
    );
  
    // Call digest for the view to process the updated array.

    $scope.$digest();

    // Play sound.

    $rootScope.playSound();

  });
  
}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('notification', {
  templateUrl: 'student/components/notification/notification.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//