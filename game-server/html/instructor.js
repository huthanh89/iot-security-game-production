//------------------------------------------------------------------------------//
// Acquire application module
//------------------------------------------------------------------------------//

var app = angular.module('gameApp');

//-------------------------------------------------------------------------------//
// Main Controller
//-------------------------------------------------------------------------------//

app.controller('instructorCtrl', function($scope, $rootScope, WebSocketService) {

    /** Initialize scope variables. */
    $rootScope.internetEnabled = false;

    /** Initialize scope variable for update view */
    $rootScope.gameStarted = false;

    /** Function to play beep sound */
    $rootScope.playSound = function() {
      document.getElementById('play').play();
    }

    // Connect to Web Socket.
    
    WebSocketService.connectToWS();
    
    // Refresh grid to recalculate grid item positions.

    $rootScope.refreshGrid = function(){
      if($rootScope.grid){
        $rootScope.grid.refreshItems().layout();
      }
    }

    // Initialize grid when angular has fully loaded.

    angular.element(function () {
      $rootScope.grid = new Muuri('.grid', {
        items: '.item',
        dragEnabled: true,
        dragStartPredicate: {
          handle: '.card-header'
        },
        dragSortPredicate: {
          action: 'swap'
        },
        layout: {
          fillGaps: true,
          horizontal: false,
          alignRight: false,
          alignBottom: false,
          rounding: false
        },
      });
      $rootScope.grid.refreshItems().layout();
    });


    // When game starts, refresh grid system layout.
    // Since angular1 does not offer a callback for when all component are
    // fully loaded, we make due with window's delay function.

    $rootScope.$on('ws:start', function() {
      if($rootScope.grid){
        setTimeout(function(){ 
          $rootScope.refreshGrid();
      }, 2000);
      }
    });

});

//-------------------------------------------------------------------------------//
// Form Controller; Used for user Form logic.
//-------------------------------------------------------------------------------//

app.controller('formCtrl', ['$scope', function($scope) {

    /** Initialize scope variables. */
    $scope.registerUser = false;

    /** Function to show register button */
    $scope.showRegister = function() {
        $scope.registerUser = $scope.registerUser ? false : true;
    }
}])

//------------------------------------------------------------------------------//