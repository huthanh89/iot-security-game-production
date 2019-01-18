//------------------------------------------------------------------------------//
// Inject angular services to application.
//------------------------------------------------------------------------------//

var app = angular.module('gameApp', [
  'ui.bootstrap', 
  'angular-bind-html-compile',
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

app.controller('studentCtrl', function($scope, $rootScope, WebSocketService) {
    
    // Initialize scope variables

    $rootScope.waiting = true;

    // Function to play beep sound

    $rootScope.playSound = function() {
      $('#play')[0].play().catch(function(error) {});
    }

    // Connect to Web Socket.
    
    WebSocketService.connectToWS();

    // Refresh grid to recalculate grid item positions.

    $rootScope.refreshGrid = function(){

      let refreshCount = 0;

      let done = function(){
        refreshCount++;

        // Start tour when all column fully refreshed.

        if(refreshCount == 3){
          if($rootScope.gameStarted){
            $rootScope.startTour();
          }
        }
      }

      setTimeout(function(){ 
        $rootScope.column1.refreshItems().layout(done);
        $rootScope.column2.refreshItems().layout(done);
        $rootScope.column3.refreshItems().layout(done);
      }, 1000);
    }
    
    // When game starts, refresh grid system layout.
    // Since angular1 does not offer a callback for when all component are
    // fully loaded, we make due with window's delay function.

    $rootScope.$on('ws:started', function() {
      $rootScope.playSound();
      $rootScope.gameStarted = true;
      $rootScope.refreshGrid();
    }); 

    let columnGrids = [];

    // Run the following code when angular has fully loaded.

    angular.element(document).ready(function () {

      // Create drag and drop columns.

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
          item.getElement().style.width = item.getWidth() + 'px';
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

  });

//-------------------------------------------------------------------------------//