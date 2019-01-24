//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope){
  

  $scope.lastSaveFile = "";
  $scope.files = []

  $scope.cancel = function() {

  }

  $scope.save = function() {
    $rootScope.ws.send(JSON.stringify({
      type:   'save',
      filename: $scope.lastSaveFile
    }));
  }

  $scope.loadMenu = function()
  {
    $rootScope.ws.send(JSON.stringify({
      type:   'getSaveFiles',
    }));

    $('#file-open-modal').modal('show')
  }


  $rootScope.$on('ws:getSaveFiles', function(event, msg) {

    $scope.save_files = msg.save_files;
    $scope.filename = "";
    $("#files").html("");

    var disabled = false;
    if ($scope.save_files.length <= 0) {
      $("#files").append("No save files found.")
      disabled = true;
    }

    $("#file-open-delete").prop('disabled', disabled);
    $("#file-open-load").prop('disabled', disabled);


    for(var i=0; i<$scope.save_files.length; i++)
    {

        var button = $('<button type="button" class="m-1 btn btn-outline-primary btn-lg btn-block" id="'+$scope.save_files[i]+'">'+$scope.save_files[i]+'</button>');
        button.click(function()
        {
          $scope.filename = this.innerHTML;
        });

        button.appendTo($("#files"));
    }

  });


  $scope.load = function() {
    $scope.lastSaveFile = $scope.filename;
    $rootScope.ws.send(JSON.stringify({
      type:   'load',
      filename: $scope.filename
    }));
  }



  $scope.delete = function() {

    // hide the deleted one
    $("#files").find("[id='"+$scope.filename+"']").hide()

    $rootScope.ws.send(JSON.stringify({
      type:   'delete',
      filename: $scope.filename
    }));
  }

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('file', {
  templateUrl: 'instructor/components/file/file.html',
  controller:   Controller
});

//------------------------------------------------------------------------------//