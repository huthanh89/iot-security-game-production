//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  // Get initial state settings.

  $scope.enableInternet = $rootScope.internetEnabled;
  
  // If cancel, restore settings to initial state.

  $scope.cancel = function() {
    $scope.enableInternet = $rootScope.internetEnabled;
  }

  // Update root scope and send new settings to server. 

  $scope.ok = function() {
    $rootScope.internetEnabled = $scope.enableInternet;
    ws.send(JSON.stringify({
      type: 'internet',
      enable: $scope.enableInternet
    }));
  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('setting', {
  templateUrl: 'instructor/components/setting/setting.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//