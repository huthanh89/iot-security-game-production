//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $uibModal){
  
  $rootScope.openErrorModal = function(title, content) {

    var template = $('#modal-error-template').html();
    template = template.replace('[[name]]', title).replace('[[description]]', content);

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

angular.module('gameApp').component('error', {
  templateUrl: 'student/components/modals/error.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//