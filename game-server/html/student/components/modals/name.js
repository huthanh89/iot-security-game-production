//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $uibModal){
  
  $rootScope.openNameModal = function() {
    
    var template = $('#modal-name-template').html();
    
    var modalInstance = $uibModal.open({
      animation: true,
      template:  template,
      scope:    $scope,
      controller: function($uibModalInstance) {

        this.name = $rootScope.playerName;

        $ctrl = this;

        // Update new name in local storage and server.

        $ctrl.ok = function() {
          let name = this.name

          if((name.length) && (name.length < 13)){
            $rootScope.ws.send(JSON.stringify({
              type: 'login',
              name:  this.name,
              ip:    $rootScope.ip
            }));

            sessionStorage.setItem("playername", name);
            
            $rootScope.playerName = name;
          }

          $uibModalInstance.dismiss('cancel');
        };

        // Cancel modal.

        $ctrl.cancel = function() {
          $uibModalInstance.dismiss('cancel');
        };

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

angular.module('gameApp').component('name', {
  templateUrl: 'student/components/modals/name.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//