//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  $rootScope.openCompletedModal = function(title, content) {
    $('#modal-completed').modal('show')
  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('completed', {
  templateUrl: 'student/components/modals/completed.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//