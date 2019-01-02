//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){

  $scope.arrangeList = [];

  /** Repeat the for loop for pushing the player data to arrange list */
  for (var i = 0; i < 9; i++) {
    $scope.arrangeList.push({
        playerData:  $scope.playerData,
        missionType: "Webcam",
        device:      "null",
        playerType:  "null"
    });
  }

  /** Function to update the mission
    @param : block is selected mission
  */
  $scope.updatePlayer = function(block) {
      return;
      var missionList = $scope.playerData;
      angular.forEach($scope.arrangeList, function(value, key) {
          if (key != block && $scope.arrangeList[block].missionType == value.missionType) {
              missionList = missionList.filter(function(player) { return value.playerType != player });
          }
      });
      $scope.arrangeList[block].playerData = missionList;
  }

  /** Function to update the player
    @param : block is selected player
   */
  $scope.updatePlayerList = function(block) {
      return;
      var missionList = [];
      angular.forEach($scope.arrangeList, function(value, key) {
          if ($scope.arrangeList[block].missionType == value.missionType) {
              missionList.push(value.playerType);
          }
      });
      angular.forEach($scope.arrangeList, function(value, key) {
          if (key != block && $scope.arrangeList[block].missionType == value.missionType) {
              value.playerData = $scope.playerData.filter(function(player) {
                  return missionList.indexOf(player) == -1 || value.playerType == player;
              });
          }
      });
  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('mission', {
  templateUrl: 'instructor/components/mission/mission.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//