//-------------------------------------------------------------------------------//
// Controller
//-------------------------------------------------------------------------------//

function Controller($scope, $rootScope, $filter){

  $scope.gameboards = {};

  /** Function to update the game board chart based on chart data */
  $scope.updateChart = function() {
    // Create the chart
    Highcharts.chart('chart-container', {

      chart: {

          type: 'column',

            events: {
              load: function(){
                $rootScope.refreshGrid();
              },

            }
        },

        title: {
            text: 'Team Progress'
        },
        xAxis: {
            type: 'category'
        },
        yAxis: {
            title: {
                text: 'Level'
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                borderWidth: 0,
                dataLabels: {
                    enabled: true,
                    format: '{point.y:.1f}'
                }
            }
        },
        
        credits: {
          enabled: false
        },

        tooltip: {
            headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
            pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>Level {point.y:.2f}</b><br/>'
        },
        "series": [{
            "name": "Teams",
            "colorByPoint": true,
            "data": $scope.chartData
        }]
    });
  };

  $rootScope.$on('ws:gameboard', function(event, msg) {

    $scope.gameboards = msg.gameboard;
    $scope.chartData = [];
    for (var teamName in $scope.gameboards) {
        var gameboard = $scope.gameboards[teamName];
        $scope.chartData.push({ name: gameboard.team, y: gameboard.progress });
    }
    $scope.chartData = $filter('orderBy')($scope.chartData, "name");

    $scope.updateChart();
    $scope.$applyAsync();
    
  });
  

}

//------------------------------------------------------------------------------//
// Component
//------------------------------------------------------------------------------//

angular.module('gameApp').component('chart', {
  templateUrl: 'instructor/components/chart/chart.html',
  controller:   Controller,
});

//------------------------------------------------------------------------------//