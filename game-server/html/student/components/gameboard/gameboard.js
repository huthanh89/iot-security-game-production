//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $uibModal){
  
  $scope.gameboard = {
    missions: []
  };

  /** Intialize variables */
  var LOCKED_COLOR      = '#d3d3d3';
  var UNLOCKED_COLOR    = '#ffff00';
  var COMPLETED_COLOR   = '#005073';
  var IN_PROGRESS_COLOR = '#5cb85c';

  $scope.gameboard = {};
  
  /** Function to intialize the game board chart(mx client chart) */
  $scope.initGameboard = function() {

    var container = document.getElementById('gameboardContainer');
      // Checks if the browser is supported
      if (!mxClient.isBrowserSupported()) {
          // Displays an error message if the browser is not supported.
          mxUtils.error('Browser is not supported!', 200, false);
      } else {
          // don't load other languages
          mxResources.loadSpecialBundle = false;

          var graph = new mxGraph(container);
          $scope.gameboardView = graph;
          $scope.gameboardView.data = { missions: {}, levels: {} };
          graph.setEnabled(false);
          graph.setCellsEditable(false);
          graph.setAllowDanglingEdges(false);
          graph.setAllowLoops(false);
          graph.setCellsDeletable(false);
          graph.setCellsCloneable(false);
          graph.setCellsDisconnectable(false);
          graph.setDropEnabled(false);
          graph.setSplitEnabled(false);
          graph.setCellsBendable(false);
          graph.setConnectable(false);
          graph.setPanning(false);
          graph.setHtmlLabels(true);
          graph.convertValueToString = function(cell) {
              if (mxUtils.isNode(cell.value)) {
                  return cell.getAttribute('label', '')
              }
              return cell.value;
          };
          graph.setTooltips(true);
          graph.getTooltipForCell = function(cell) {
              if (cell.getAttribute('mission')) {
                  var missionId = cell.getAttribute('mission');
                  var mission = $scope.gameboard.missions[missionId];
                  if (!mission)
                      return '';
                  var text = 'Mission ' + missionId + ': ' + mission.name + '<br>';
                  if (!mission.unlocked) {
                      text += 'Locked';
                  } else if (mission.done) {
                      text += 'Completed by ' + mission.playerName;
                  } else if (mission.playerName) {
                      text += 'In progress by ' + mission.playerName;
                  } else {
                      text += 'Unlocked';
                  }
                  return text;
              } else if (cell.getAttribute('level')) {
                  return 'Level ' + cell.getAttribute('level');
              }
              return '';
          }
          // Needs to set a flag to check for dynamic style changes,
          // that is, changes to styles on cells where the style was
          // not explicitely changed using mxStyleChange
          graph.getView().updateStyle = true;
          // Overrides mxGraphModel.getStyle to return a specific style
          // for edges that reflects their target terminal (in this case
          // the strokeColor will be equal to the target's fillColor).
          var previous = graph.model.getStyle;
          graph.model.getStyle = function(cell) {
              if (cell != null) {
                  var style = previous.apply(this, arguments);
                  if (cell.extraStyle)
                      style += ';' + cell.extraStyle;
                  return style;
              }
              return null;
          };
          new mxRubberband(graph);
          var parent = graph.getDefaultParent();
          var style = graph.getStylesheet().getDefaultVertexStyle();
          style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
          style[mxConstants.STYLE_PERIMETER] = mxPerimeter.EllipsePerimeter;
          
          graph.addListener(mxEvent.CLICK, function(sender, evt) {
              var e = evt.getProperty('event');
              var cell = evt.getProperty('cell');
              if (cell != null) {
                  var missionId = cell.getAttribute('mission');
                  if (missionId) {
                      $scope.selectMission(missionId);
                  }
                  evt.consume();
              }
          });

          graph.getModel().beginUpdate();
          var xmlFile = "./gameBoard.xml";
          try {
              var doc = mxUtils.load(xmlFile);
              var codec = new mxCodec(doc);
              codec.decode(doc.getDocumentElement(), graph.getModel());
              var cells = graph.getChildVertices();
              for (var i in cells) {
                  var cell = cells[i];
                  if (cell.getAttribute('mission')) {
                      cell.extraStyle = 'fillColor=' + LOCKED_COLOR;
                      graph.data.missions[cell.getAttribute('mission')] = cell;
                  } else if (cell.getAttribute('level')) {
                      cell.extraStyle = 'strokeColor=' + LOCKED_COLOR;
                      graph.data.levels[cell.getAttribute('level')] = cell;
                  }
              }
          } 
          
          finally {
              graph.getModel().endUpdate();
              $('#gameboardContainer > svg').css('width', '');
              $('#gameboardContainer > svg').css('margin', 'auto');
          }
      }
  }

  /** Function to select mission */
  $scope.selectMission = function(missionId) {

    $rootScope.selectedMission = $scope.gameboard.missions[missionId];
    $scope.selectedMission     = $rootScope.selectedMission 

    // Mission not available.

    if (!$rootScope.selectedMission) {
      $rootScope.openUnavailableModal();
      return;
    }

    // Mission is locked.

    if (!$rootScope.selectedMission.unlocked) {
      $rootScope.openLockedModal();
      return;
    }
    
    var showContent = false;
    
    // Send selected mission to the server.
    
    if ($rootScope.selectedMission.playerId) {
      $rootScope.ws.send(JSON.stringify({
          type:   'selectMission',
          mission: missionId
      }));
      showContent = true;
    }

    // Show confirm mission modal.

    else {

      $scope.missionContentShown = true;
      var modalInstance = $uibModal.open({
          animation:   true,
          scope:       $scope,
          templateUrl: './missionModel.html',
          backdrop: true,
          controller: function($uibModalInstance) {

            $ctrl = this;
            $ctrl.showContent = showContent;
            $ctrl.ok = function() {
                $rootScope.ws.send(JSON.stringify({
                    type: 'selectMission',
                    mission: missionId
                }));
                $ctrl.showContent = true;
                $uibModalInstance.dismiss('ok');
                $scope.missionContentShown = false;
            };

            $ctrl.cancel = function() {
                $uibModalInstance.dismiss('cancel');
                $scope.missionContentShown = false;
            };

            $ctrl.close = function() {
                $uibModalInstance.close('saved');
                $scope.missionContentShown = false;
            }

          },
          controllerAs: 'ctrl',
          windowClass:  'mission-modal-window'
      });

      modalInstance.result.then(function(response) {}, function() {});
    }
  };

  // Show Gameboard.

  $rootScope.$on('ws:gameboard', function(event, msg) {

    $scope.gameboard = msg.gameboard[$rootScope.teamName];

    for (var id in $scope.gameboard.missions) {
        var mission = $scope.gameboard.missions[id];
        var missionView = $scope.gameboardView.data.missions[id];
        if (missionView) {
            if (!mission.unlocked) {
                missionView.extraStyle = 'fillColor=' + LOCKED_COLOR;
            } else if (mission.done) {
                missionView.extraStyle = 'fillColor=' + COMPLETED_COLOR;
            } else if (mission.playerName) {
                missionView.extraStyle = 'fillColor=' + IN_PROGRESS_COLOR;
            } else {
                missionView.extraStyle = 'fillColor=' + UNLOCKED_COLOR;
            }
        }
    }
    var levelNum;
    for (levelNum = 0; levelNum < $scope.gameboard.currentRing; levelNum++) {
        $scope.gameboardView.data.levels[levelNum].extraStyle = 'strokeColor=' + COMPLETED_COLOR;
    }
    if ($scope.gameboardView.data.levels[levelNum])
        $scope.gameboardView.data.levels[levelNum].extraStyle = 'strokeColor=' + IN_PROGRESS_COLOR;

    $scope.gameboardView.view.refresh();
    
    $scope.$applyAsync();
    
  });

  // Update selected mission root variable state.

  $rootScope.$on('ws:selectedMission', function(event, msg) {  
    $rootScope.selectedMission = $scope.gameboard.missions[msg.missionId];
  });

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('gameboard', {
  templateUrl: 'student/components/gameboard/gameboard.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//