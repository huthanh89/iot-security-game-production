//-------------------------------------------------------------------------------//
// Inject angular services to application.
//-------------------------------------------------------------------------------//

var app = angular.module('gameApp', [
  'ui.bootstrap', 
  'ngSanitize'
]);

//------------------------------------------------------------------------------//
// Configure application.
//------------------------------------------------------------------------------//

app.config(function($locationProvider){
  $locationProvider.html5Mode( {
    enabled:     true,
    requireBase: false
  });
});

// Enable Hammerjs to allow user text selection.

delete Hammer.defaults.cssProps.userSelect;

//-------------------------------------------------------------------------------//
// Main Controller
//-------------------------------------------------------------------------------//

app.controller('instructorCtrl', function($scope, $rootScope, WebSocketService) {

  
  // Initialize scope variables.
  
    $rootScope.VERSION         = VERSION;
    $rootScope.loaded          = false;
    $rootScope.internetEnabled = false;
    $rootScope.gameStarted     = false;

    // Function to play beep sound.

    $rootScope.playSound = function() {
      document.getElementById('play').play();
    }

    // Connect to Web Socket.

    WebSocketService.connectToWS();
    
    // Refresh grid to recalculate grid item positions.

    $rootScope.refreshGrid = function(){
      setTimeout(function(){ 
        $rootScope.column1.refreshItems().layout();
        $rootScope.column2.refreshItems().layout();
        $rootScope.column3.refreshItems().layout();
      }, 1000);
    }

    let columnGrids = [];

    // Initialize grid when angular has fully loaded.

    angular.element(document).ready(function () {

      let createGrid = function(container){

        let grid = new Muuri(container, {
          items:     '.item',
          dragEnabled: true,
          dragStartPredicate: {
            handle: '.card-header'
          },
          dragSort: function () {
            return columnGrids;
          },
        })
        .on('dragStart', function (item) {
          item.getElement().style.width  = item.getWidth()  + 'px';
          item.getElement().style.height = item.getHeight() + 'px';
        })
        .on('dragReleaseEnd', function (item) {
          item.getElement().style.width = '';
          item.getElement().style.height = '';
          columnGrids.forEach(function (grid) {
            grid.refreshItems();
          });
        });

        columnGrids.push(grid);
        return grid;
      }

      $rootScope.column1 = createGrid($('#grid1')[0]);
      $rootScope.column2 = createGrid($('#grid2')[0]);
      $rootScope.column3 = createGrid($('#grid3')[0]);

    });

    // When game starts, refresh grid system layout.
    // Since angular1 does not offer a callback for when all component are
    // fully loaded, we make due with window's delay function.

    $rootScope.$on('ws:connected', function() {

      setTimeout(function(){
        $rootScope.refreshGrid();
        $rootScope.loaded = true;

        // request game state
        $rootScope.ws.send(JSON.stringify({
            type: 'getCurrentGameState',
          }));

      }, 2000);
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