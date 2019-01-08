//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $uibModal){

  // Open generic modal title and content passed in.

  $rootScope.openModal = function(title, content) {

    var template = $('.modal-template').html();
    template = template.replace('[[name]]', title).replace('[[description]]', content);

    $scope.isSuccess = false;
    if (title === 'Success') {
        $scope.isSuccess = true;
    }
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
        windowClass: 'alert-modal-window',
        size: 'sm',
        backdrop: 'static'
    });

    modalInstance.result.then(function(response) {
    }, function() {});
  };

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('modal', {
  templateUrl: 'student/components/modals/modal.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//