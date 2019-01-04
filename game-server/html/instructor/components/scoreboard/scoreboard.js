//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){

  // Initialize scope variables.

  $scope.scoreBoard = [];

  /** Function to get scores from score board */
  function getScores(scoreboard) {
    var scores = [];
    for (var i in scoreboard) {
        scores.push({
            name: scoreboard[i].name,
            score: scoreboard[i].score
        });
    }
    return scores;
  }

  $rootScope.$on('ws:scores', function(event, msg) {
    if (JSON.stringify(getScores($scope.scoreBoard)) != JSON.stringify(getScores(msg.scores))) {
      $rootScope.playSound();
    }
    $scope.scoreBoard = msg.scores;

  });
  
}

//------------------------------------------------------------------------------//
// Directive
//
// This directive gets called when component fully renders.
//------------------------------------------------------------------------------//

angular.module('gameApp').directive('scoreboardPopoverDirective', function($rootScope) {
  return function(scope, element, attrs) {
    
    let tableRows = [];
    let players = scope.team.players;

    players.forEach(function(player){
      tableRows.push(`<tr><td>${player.name}</td><td>${player.score}</td></tr>`);
    });

    $(element).popover({
      html: true,
      title: '',
      trigger: 'hover',
      content: 
        `
          <table class="table table-sm">
            <thead>
              <tr>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows.toString()}
            </tbody>
          </table>
        `
    });

    // Refresh grid after ng-repeat.

    $rootScope.refreshGrid();

  };

});

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('scoreboard', {
  templateUrl: 'instructor/components/scoreboard/scoreboard.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//