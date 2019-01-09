//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//
function Controller($scope, $rootScope){



  $scope.ok = function() {
    ws.send(JSON.stringify({
      type: 'endGame',
    }));

    /*
    // should show some stats on the instructor side
    setTimeout(function(){
        location.reload();
    }, 1000)
    */
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