//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//
function Controller($scope, $rootScope){



  $scope.ok = function() {
    ws.send(JSON.stringify({
      type: 'endGame',
    }));

    setTimeout(function(){
        location.reload();
    }, 1000)
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