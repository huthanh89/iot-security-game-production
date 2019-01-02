//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  $scope.enableInternet = $rootScope.internetEnabled;

  $scope.ok = function() {
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