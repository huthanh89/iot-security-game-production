//------------------------------------------------------------------------------//
// Acquire application module
//------------------------------------------------------------------------------//

var app = angular.module('gameApp', ['ui.bootstrap' , 'angular-bind-html-compile'])

//------------------------------------------------------------------------------//
// Module configurations
//------------------------------------------------------------------------------//

app.config(function($locationProvider){
  $locationProvider.html5Mode( {
    enabled:     true,
    requireBase: false
  });
});

//-------------------------------------------------------------------------------//
// Main Controller
//-------------------------------------------------------------------------------//

app.controller('studentCtrl', function($scope, $rootScope, WebSocketService) {
    
    // Initialize scope variables

    $rootScope.waiting = true;

    // Function to play beep sound

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
        items:     '.item',
        dragEnabled: true,
        dragStartPredicate: {
          handle: '.card-header'
        },
        dragSortPredicate: {
          action: 'swap'
        },
        layout: {
          fillGaps:    true,
          horizontal:  false,
          alignRight:  false,
          alignBottom: false,
          rounding:    false
        }
      });
      $rootScope.grid.refreshItems().layout();
    });

    // When game starts, refresh grid system layout.
    // Since angular1 does not offer a callback for when all component are
    // fully loaded, we make due with window's delay function.

    $rootScope.$on('ws:started', function() {
      setTimeout(function(){ 
        $rootScope.refreshGrid();
        $rootScope.playSound();
        $rootScope.startTour();
        $rootScope.gameStarted = true;
      }, 2000);
    });   
    
  });

//-------------------------------------------------------------------------------//