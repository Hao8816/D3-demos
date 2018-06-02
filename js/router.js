var API_URL = '/api';

// 配置页面路由 'vis'
var app = angular.module('vis' , ['ngRoute']).run(function() {

});


// 配置页面
app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
        when('/index/', {
            templateUrl: 'views/visualization/timeline.html',
            controller: 'timelinePageController'
        }).
        when('/vis/category/', {
            templateUrl: 'views/visualization/category.html',
            controller: 'visCategoryPageController'
        }).

        otherwise({redirectTo: '/index/'});
}]);


// 定义一个 Service ，稍等将会把它作为 Interceptors 的处理函数
app.factory('HttpInterceptor', ['$q','$location', HttpInterceptor]);

function HttpInterceptor($q,$location) {
    return {
        request: function(config){
            return config;
        },
        requestError: function(err){
            console.log(err)
            return $q.reject(err);
        },
        response: function(res){
            return res;
        },
        responseError: function(err){
            return $q.reject(err);
        }
    };
}

app.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
}]);


// 扩展ng-enter指令
app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});


app.controller(
    'timelinePageController',
    function timelinePageController($scope, $http, $routeParams, $location, $rootScope) {
        $rootScope.page_name = "用户登录";


    }
);


app.controller(
    'visCategoryPageController',
    function visCategoryPageController($scope, $http, $routeParams, $location, $rootScope) {
        $rootScope.page_name = "用户登录";


    }
);

