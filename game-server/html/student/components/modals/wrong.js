//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  
  $rootScope.openWrongModal = function(title, content) {
    $('#modal-wrong').modal('show')
  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('wrong', {
  templateUrl: 'student/components/modals/wrong.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//