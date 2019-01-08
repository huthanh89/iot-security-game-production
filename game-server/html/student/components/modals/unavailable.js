//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  $rootScope.openUnavailableModal = function(title, content) {
    $('#modal-unavailable').modal('show')
  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('unavailable', {
  templateUrl: 'student/components/modals/unavailable.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//