//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $uibModal){
  

  $rootScope.$watch('playerName', function(value){
    $scope.playerName = value
  });

  $rootScope.$watch('ip', function(value){
    $scope.ip = value
  });

  $rootScope.$watch('teamName', function(value){
    $scope.teamName = value
  });

  $rootScope.openProfileModal = function() {

    var template = $('#modal-profile-template').html();

    var modalInstance = $uibModal.open({
        animation: true,
        template: template,
        scope: $scope,
        controller: function($uibModalInstance) {
            $ctrl = this;
            $ctrl.ok = function() {
                $ctrl.close();
            };

            $ctrl.cancel = function() {
                $uibModalInstance.dismiss('cancel');
            };

            $ctrl.close = function() {
                $uibModalInstance.close('saved');
            }

        },
        controllerAs: 'ctrl',
        windowClass:  'alert-modal-window',
        size:         'sm',
        backdrop:     'static'
    });

    modalInstance.result.then(function(response) {
    }, function() {});
  };
}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('profile', {
  templateUrl: 'student/components/modals/profile.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//