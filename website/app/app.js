require.ensure([], function(require) {
    require('angular');
    require('angular-route');
    require('./main.css');

    var app = angular.module('web', [
        'ngRoute',
        require('./chart').name,
    ]);

    // 配置路由
    app.config(['$routeProvider', function($routeProvider){
        $routeProvider.
            otherwise({redirectTo: '/chart/'});
    }]);
});
