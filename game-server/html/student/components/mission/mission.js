//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $uibModal, $sce, $timeout){

  // Initialize scope.

  $scope.missionContent = '';

  // Handle flag submission.

  $scope.submitFlag = function(flag) {
    if (flag) {
      $rootScope.ws.send(JSON.stringify({
            type: 'flag',
            flag: flag
        }));
    }
  }
    
  // Handle quiz submission.

  $scope.submitQuiz = function(answers) {
    for (var i in answers) {
        var answer = answers[i];
        if (answer && (typeof(answer) == 'object')) {
            var newAnswer = [];
            for (var j in answer) {
                if (answer[j])
                    newAnswer.push(j);
            }
            answers[i] = newAnswer.sort();
        }
    }
    $rootScope.ws.send(JSON.stringify({
        type: 'quiz',
        answers: answers
    }));
  }

  // Show modal

  $rootScope.$on('ws:mission', function(event, msg) {
    $scope.selectedMission = $rootScope.selectedMission;
    $scope.missionName     = $scope.selectedMission.name;
    $scope.missionID       = msg.missionId;
    $scope.missionContent  = msg.text;
    $scope.customHtml      = $sce.trustAsHtml($scope.missionContent);
    $scope.$digest();
  });


}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('mission', {
  templateUrl: 'student/components/mission/mission.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//