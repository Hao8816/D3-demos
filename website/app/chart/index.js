//require('./device-list.css')

module.exports = angular.module('chart-list', [

]).config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/chart', {
                template: require('./chart-list.html'),
                controller: 'ChartListCtrl'
            })
        console.log(require('./chart-list.html'))
    }])
    .controller('ChartListCtrl', require('./chart-list-controller'));
