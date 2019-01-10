//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $location, PlayerData){

  // Initialize scopes.

  $scope.teamText      = '';
  $scope.editTeamIndex = {};
  $scope.playerData    = PlayerData.playerData; // Data of individual player.
  $scope.teamData      = PlayerData.teamData;   // Teams information.

  $scope.$watch(function(){
    return PlayerData.playerData;
  }, function(value){
    $scope.playerData = value;
  });

  $scope.$watch(function(){
    return PlayerData.teamData;
  }, function(value){
    $scope.teamData = value;
  });
  
  $rootScope.$on('players', function(event, service) {
    $scope.playerData = service.playerData;
    $scope.teamData   = service.teamData;

    // Call scope apply to ensure angular process the new model change.

    $scope.$apply();

    $rootScope.refreshGrid();
  });

  $scope.$watch('playerData', function(){
    $rootScope.refreshGrid();
  }, true);

  $scope.$watch('teamData', function(){
    $rootScope.refreshGrid();
  }, true);

  // Move players to a team.

  $scope.moveLeft = function() {
    var filterList = $scope.teamData.teams.filter(function(t, id) {
        return t.isSelected;
    });
    if (filterList.length > 1) {
        return;
    }
    var selectedList = [];
    var unSelectedList = [];
    angular.forEach($scope.teamData.players, function(team) {
        if (team.isSelected) {
            team.isSelected = false;
            team.selectedTeam = filterList[0].name;
            selectedList.push(team);
        } else {
            unSelectedList.push(team);
        }
    });
    $scope.teamData.players     = unSelectedList;
    $scope.teamData.teamPlayers = $scope.teamData.teamPlayers.concat(selectedList);

  };

  // Move assigned played to unassigned list.

  $scope.moveRight = function() {
      var selectedList = [];
      var unSelectedList = [];
      angular.forEach($scope.teamData.teamPlayers, function(team) {
          if (team.isSelected) {
              team.isSelected = false;
              team.selectedTeam = '';
              selectedList.push(team);

          } else {
              unSelectedList.push(team);
          }
      });
      $scope.teamData.teamPlayers = unSelectedList;
      $scope.teamData.players = $scope.teamData.players.concat(selectedList);

  }

  /** Function to select a player for moving team player list */
  $scope.selectPlayer = function(team) {
      var filterList = $scope.teamData.teams.filter(function(t, id) {
          return t.isSelected;
      });
      if (!team.isSelected && filterList.length != 1) {
          var text = filterList.length > 1 ? "Please select single team to rename" : "Please Select Team";
          alert(text);
      } else {
          team.isSelected = !team.isSelected;
      }
  }

  /** Function to  unselect all teams*/
  $scope.unselectAll = function(team) {
      angular.forEach($scope.teamData.teams, (function(t, id) {
          if (team.name != t.name) {
              t.isSelected = false;
          }
      }));
      if (!team.isSelected) {
          team.isSelected = true;
          $scope.selectedTeam = team.name;
      } else {
          team.isSelected = false;
          $scope.selectedTeam = '';
      }
      $rootScope.refreshGrid();
  }

  /** Function to add team*/
  $scope.addTeam = function() {

    if ($scope.teamText) {

        // Check for duplicate name.
        var filterList = $scope.teamData.teams.filter(function(t) {
            return t.name == $scope.teamText;
        })
        if (filterList.length == 0) {
            $scope.teamData.teams.push({ name: $scope.teamText, id: $scope.teamText });
        } else {
            alert("This Name has already taken Please Enter new Name");
        }

        $scope.teamText = '';
    } 
    
    else {
        alert("Enter Team Name");
    }

    $('#team-add-modal').modal('hide');

  }

  /** Function to update team name*/
  $scope.updateTeamName = function(team, newName) {
    
    if (newName.length < 1) {
      alert("Name cannot be empty.");
      return;
    }

    // Check for duplicate team name.
    // Exit function if true.

    let filterList = $scope.teamData.teams.filter(function(team) {
      return team.name == newName;
    })

    if (filterList.length > 0) {
      alert("Duplicate Team name.");
      return;
    }

    // Update team name in each player data.

    team.id   = newName;
    team.name = newName;

    angular.forEach($scope.teamData.teamPlayers, function(player) {
        if (player.selectedTeam == team.id) {
          player.selectedTeam = team.name;
        }
    });

    $('#team-edit-modal').modal('hide');
  }

  /** Function to remove team */
  $scope.removeTeam = function(team) {

    let index          = $scope.editTeamIndex;
    var selectedList   = [];
    var unSelectedList = [];

    angular.forEach($scope.teamData.teamPlayers, function(tp) {
        if (team.name == tp.selectedTeam) {
            tp.selectedTeam = '';
            selectedList.push(tp);
        } else {
            unSelectedList.push(tp);
        }
    });

    $scope.teamData.teams.splice(index, 1);
    $scope.teamData.teamPlayers = unSelectedList;
    $scope.teamData.players     = $scope.teamData.players.concat(selectedList);
  }

  $scope.clickEditIcon = function(team, index) {
    $scope.teamText      = team.name;
    $scope.team          = team;
    $scope.editTeamIndex = index;
  }
  
  // Append modal to body to fix backdrop issue.

  $scope.showModal = function(type){
    $(`#team-${type}-modal`).appendTo("body");
  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('teams', {
  templateUrl: 'instructor/components/teams/teams.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//