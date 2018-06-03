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
        var w = 1000;
        var h = 400;
        var padding = 40;

        var colors = d3.range(100).map(d3.scale.category20())

        var datasets = [
            {'date': new Date(2017,07,01),'sales': 100},
            {'date': new Date(2017,07,02),'sales': 400},
            {'date': new Date(2017,07,03),'sales': 200},
            {'date': new Date(2017,07,04),'sales': 700},
            {'date': new Date(2017,07,10),'sales': 900},
            {'date': new Date(2017,07,15),'sales': 450},
            {'date': new Date(2017,07,18),'sales': 600},
            {'date': new Date(2017,07,20),'sales': 600},
            {'date': new Date(2017,07,22),'sales': 800},
            {'date': new Date(2017,07,25),'sales': 500},
            {'date': new Date(2017,07,27),'sales': 400},
            {'date': new Date(2017,07,31),'sales': 200}
        ];

        // 调用绘制函数
        var min_time = d3.min(datasets,function(d){return d.date})
        var max_time = d3.max(datasets,function(d){return d.date})
        var start_time = new Date(2017,07,01);
        var end_time = new Date(start_time.getTime()+15*24*60*60*1000);

        // 创建画布
        var svg = d3.select('#timeline')
            .append('svg')
            .attr('width', w + 2*padding)
            .attr('height', h + 2*padding);

        // 创建x轴比例尺,以时间为刻度
        var xScale = d3.time.scale()
            .domain([start_time,end_time])
            .range([0,w]);

        // 创建y轴比例尺，线性的刻度
        var yScale = d3.scale.linear()
            .domain([0,d3.max(datasets,function(d){return d.sales})])
            .range([h,0]);

        // 创建x轴坐标
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(d3.time.day, 1)
            .tickSize(10)
            .tickFormat(d3.time.format('%m-%d'));

        // 创建y轴坐标
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');

        // 绘制x轴
        svg.append('g')
            .attr('class','x axis')
            .attr('transform','translate('+padding+','+(h+padding)+')')
            .call(xAxis);

        // 绘制y轴
        svg.append('g')
            .attr('class','y axis')
            .attr('transform','translate('+padding+','+padding+')')
            .call(yAxis);

        var tick_length = d3.selectAll('.x.axis .tick')[0].length
        console.log('刻度长度',tick_length)
        var barWidth = w/tick_length-1;

        // 按照时间的总长度和x轴的长度，求出每单位时间的长度
        var time_range = end_time.getTime() - start_time.getTime();
        var range_length = time_range/w;

        var drag = d3.behavior.drag()
            .origin(function(d){
                var t = d3.select(this);
                return {
                    x: t.attr("x"),
                    y: t.attr("y")
                };
            }).on('drag',function(){
                // 被拖动的对象移动
                d3.select(this).attr('x',d3.event.x);
                d3.select(this).attr('y',0);

                var timestamp = (d3.event.x)*range_length;
                var start = start_time.getTime()-parseFloat(timestamp);
                var end= end_time.getTime()-parseFloat(timestamp);
                // 判断时间的范围
                if (start>min_time.getTime()-24*60*60*1000 && end <max_time.getTime()+24*60*60*1000){
                    // 更新图表
                    updateTimeLine(new Date(start),new Date(end), datasets)
                }
            });

        // 绘制panel
        var panel = svg.append('g')
            .attr('width',w)
            .attr('height',h)
            .attr('class','panel').call(drag);

        // 添加数据组
        var groups = panel.selectAll('.group')
            .data(datasets)
            .enter()
            .append('g')
            .attr('class','group');

        // 添加bar的信息
        groups.append('rect')
            .attr('class','bar')
            .attr('x',function(d,i){
                var local_date = new Date(d.date).setHours(0,0);
                return xScale(local_date)+padding-barWidth/2;
            })
            .attr('y',function(d){
                return yScale(d.sales)+padding;
            })
            .attr('width', function(d,i){
                return barWidth;
            })
            .attr('height', function(d){
                console.log(yScale(d.sales))
                return h-yScale(d.sales)
            })
            .attr('fill',function(d,i){
                return colors[0];
            })
            .on('mouseover', function(d){
                var point_x = parseFloat(d3.select(this).attr('x'));
                var point_y = parseFloat(d3.select(this).attr('y'));
                svg.append('line')
                    .attr('id','horizontal-line')
                    .attr('x1',padding)
                    .attr('x2',point_x)
                    .attr('y1',point_y)
                    .attr('y2',point_y)
            })
            .on('mouseout', function(d){
                d3.select('#horizontal-line').remove();
            });

        // 添加label
        groups.append('text')
            .attr('class','label')
            .attr('x', function(d){
                var local_date = new Date(d.date).setHours(0,0)
                console.log(xScale(local_date))
                return xScale(local_date)+padding-barWidth/2;
            })
            .attr('y',function(d){
                return yScale(d.sales)+padding-5;
            })
            .text(function(d){
                return d.sales+'件';
            })
            .attr('textLength',barWidth)
            .attr('lengthAdjust','spacing');

        // 添加x轴的维度标注
        svg.append("text")
            .attr('class','axis-label')
            .attr('x',w+padding+5)
            .attr('y',h+padding)
            .text('时间轴');

        // 添加y轴的维度标注
        svg.append("text")
            .attr('class','axis-label')
            .attr('x',padding-10)
            .attr('y',padding-20)
            .text('销量');


        // 绘图的核心函数
        function updateTimeLine(start_time, end_time, datasets){
            /*
             * start 开始时间,格式为时间对象
             * end 结束时间,格式为时间对象
             * datasets 数据源
             */

            // 过滤元数据的
            var data_list = []
            datasets.forEach(function(item){
                console.log('数据时间',item['date'])
                console.log('开始时间',start_time)
                console.log('结束时间',end_time)
                if (item['date'] > start_time && item['date'] < end_time){
                    data_list.push(item)
                }
            });

            // 创建x轴比例尺,以时间为刻度
            var xScale = d3.time.scale()
                .domain([start_time,end_time])
                .range([0,w]);

            // 更新X轴
            var xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .ticks(d3.time.day, 1)
                .tickSize(10)
                .tickFormat(d3.time.format('%m-%d'));
            svg.select('.x.axis').call(xAxis);

            console.log(data_list);

            var panel =  svg.select('.panel')
                .call(drag);

            // 添加数据组
            var groups = panel.selectAll('.group')
                .data(data_list);

            groups.exit().remove();

            groups.enter().append('g').attr('class','group').append('rect').attr('class','bar').attr('fill',function(d,i){
                return colors[0];
            });

            // 添加bar的信息
            groups.select('.bar')
                .attr('x',function(d,i){
                    var local_date = new Date(d.date).setHours(0,0);
                    return xScale(local_date)+padding-barWidth/2;
                })
                .attr('y',function(d){
                    return yScale(d.sales)+padding;
                })
                .attr('width', function(d,i){
                    return barWidth;
                })
                .attr('height', function(d){
                    console.log(yScale(d.sales))
                    return h-yScale(d.sales)
                })
                .on('mouseover', function(d){
                    var point_x = parseFloat(d3.select(this).attr('x'));
                    var point_y = parseFloat(d3.select(this).attr('y'));
                    svg.append('line')
                        .attr('id','horizontal-line')
                        .attr('x1',padding)
                        .attr('x2',point_x)
                        .attr('y1',point_y)
                        .attr('y2',point_y)
                })
                .on('mouseout', function(d){
                    d3.select('#horizontal-line').remove();
                });

            // 添加label
            groups.select('.label')
                .attr('x', function(d){
                    var local_date = new Date(d.date).setHours(0,0)
                    return xScale(local_date)+padding-barWidth/2;
                })
                .attr('y',function(d){
                    return yScale(d.sales)+padding-5;
                })
                .text(function(d){
                    return d.sales+'件';
                })
                .attr('textLength',barWidth)
                .attr('lengthAdjust','spacing');
        }


    }
);


app.controller(
    'visCategoryPageController',
    function visCategoryPageController($scope, $http, $routeParams, $location, $rootScope) {
        $rootScope.page_name = "用户登录";
        $scope.charts = []


    }
);

