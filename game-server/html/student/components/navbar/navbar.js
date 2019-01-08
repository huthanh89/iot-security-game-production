//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){

  let tour = new Tour({
    container: "body",
    debug:      false,
    orphan:     true,
    storage:    false,
    backdrop:   true,
    steps: [
      {
        element: "#gameboard",
        title:   "Gameboard",
        content: "This is the main GameBoard. This is where your missions, which are indicated by Circles, will be displayed. To start a mission, click on an unlocked Circle. Unlocked Circles are yellow, locked Circles are gray, and completed Circles are blue. And that's it! Click on the center circle of the rings to begin the game. Good luck and have fun!"
      },
      {
        element: "#chat",
        title:   "Chat",
        content: "In the Chat panel, you can send messages to other players. Several channels are available, such as a global chat and team chat.  You can also send messages directly to specific players or your instructor. Remember to keep your communications civil!"
      },
      {
        element: "#mission",
        title:   "Mission",
        content: "In this Mission panel, you will go through the game level. When you find the flag to complete the mission, you will submit it here."
      },
      {
        element: "#notification",
        title:   "Notification",
        content: "The Notification panel will have important messages from the game server and your instructor. Keep an eye on it!"
      },
      {
        element: "#scoreboard",
        title:   "Scoreboard",
        content: "This is the Scoreboard. Here, you and your team can see how you stack up against the competition."
      },
      {
        element: "#tools",
        title:   "Tools",
        content: "The Tools panel will display the necessary tools to complete the mission. If you are stuck on a particular mission, be sure to check here for hints. It may just lead you to the right path!"
      }
    ]
  });

  // Initialize the tour.

  tour.init();

  // If user requests, restart the tour.
  
  $scope.tour = function(){
    tour.restart();
  };

  // Start initial tour.

  $rootScope.startTour = function(){
    tour.start();
  }

  // Open modal showing player info.

  $scope.player = function(){
    $rootScope.openProfileModal();
  };

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('navbar', {
  templateUrl: 'student/components/navbar/navbar.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//