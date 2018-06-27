require('angular');
require('angular-route');
require('./main.css');
var app = angular.module('web', ['ngRoute']);

// 配置路由
app.config(['$routeProvider', function($routeProvider){
    $routeProvider.
        when('/index/', {
            templateUrl: './app/views/app.html',
            controller: 'indexPageController'
        }).
        otherwise({redirectTo: '/index/'});

}]);
app.controller("indexPageController",function($scope){
    $scope.names = [1,2,3,4,5,6,7,8,9];
});

