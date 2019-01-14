//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){

  $scope.notifications = [];

  toastr.options = {
    "closeButton":       true,
    "debug":             false,
    "newestOnTop":       false,
    "progressBar":       true,
    "positionClass":    "toast-top-right",
    "preventDuplicates": false,
    "onclick":           null,
    "showDuration":     "300",
    "hideDuration":     "1000",
    "timeOut":          "5000",
    "extendedTimeOut":  "1000",
    "showEasing":       "swing",
    "hideEasing":       "linear",
    "showMethod":       "fadeIn",
    "hideMethod":       "fadeOut"
  }

  $rootScope.$on('ws:notification', function(event, msg) {

    // Append new message in front.

    $scope.notifications.unshift(
      { date: new Date(), msg: msg.msg }
    );
  
    // Call digest for the view to process the updated array.

    $scope.$digest();

    // Play sound.

    $rootScope.playSound();

    // Play toast.

    toastr.info(msg.msg, 'Notification');
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