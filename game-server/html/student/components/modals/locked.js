//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  $rootScope.openLockedModal = function(title, content) {
    $('#modal-locked').modal('show')
  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('locked', {
  templateUrl: 'student/components/modals/locked.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//