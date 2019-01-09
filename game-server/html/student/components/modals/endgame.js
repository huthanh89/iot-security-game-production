//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  $rootScope.openEndGameModal = function(data) {

    console.log(data);
    var winningTeam = data["scores"][0].name;

    var template = $('#modal-endgame').html();

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


    $('#modal-endgame').html(template);
    $('#modal-endgame').modal('show')

  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('endgame', {
  templateUrl: 'student/components/modals/endgame.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//