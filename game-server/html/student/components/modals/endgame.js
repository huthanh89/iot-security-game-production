//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  $rootScope.openEndGameModal = function(data) {

    let winningTeam = data["scores"][0].name;

    let template = $('#modal-endgame').html();

    if ( $rootScope.teamName == winningTeam ) {
      template = template.replace('[[results_icon]]', "fa-trophy")
          .replace("[[header_color]]", "bg-success")
          .replace("[[message]]", "Your team wins the game!")
          .replace("[[results]]", "Score Results");
    }
    else {
      template = template.replace('[[results_icon]]', "fa-poll")
      .replace("[[header_color]]", "bg-warning")
      .replace("[[message]]", "Your team did not win. Try again next time!")
      .replace("[[results]]", "Score Results");
    }

    // Create player scores html.

    let list = [];

    $scope.scoreBoard.forEach(function(team){

      let players = [];

      team.players.forEach(function(player){
        players.push(`
          <li class="list-group-item endgame-item">
            ${player.name}
            <span class="float-right">
              ${player.score}
            </span>
          </li>
        `);
      })

      list.push(`
        <div class="endgame-list">
          <b class="d-block text-center">
            ${team.name} - ${team.score}
          </b>
          <ul class="list-group">
            ${players.join('')}
          </ul>
        </div>
      `);
    });

    let html = `
      <div id="endgame-scoreboard">
        <h4 class="d-block text-center">
          <u>
            Final Scores
          </u>
        </h4>
        ${list.join('')}
      </div>
    `
    template = template.replace("[[scores]]", html);

    $('#modal-endgame').html(template);
    $('#modal-endgame').modal('show');
    
  }
      
  $rootScope.$on('ws:endscores', function(event, msg) {
    $scope.scoreBoard = msg.scores;
  });
  
}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('endgame', {
  templateUrl: 'student/components/modals/endgame.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//