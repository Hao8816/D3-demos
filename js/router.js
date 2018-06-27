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
        when('/vis/share/', {
            templateUrl: 'views/visualization/share.html',
            controller: 'shareCategoryPageController'
        }).
        when('/chart/line/', {
            templateUrl: 'views/chart/line.html',
            controller: 'lineChartCategoryPageController'
        }).
        when('/chart/bar/', {
            templateUrl: 'views/chart/bar.html',
            controller: 'barChartCategoryPageController'
        }).
        when('/chart/pie/', {
            templateUrl: 'views/chart/pie.html',
            controller: 'pieChartCategoryPageController'
        }).
        when('/chart/group/', {
            templateUrl: 'views/chart/group.html',
            controller: 'groupChartCategoryPageController'
        }).
        when('/chart/drag/', {
            templateUrl: 'views/chart/drag.html',
            controller: 'dragChartCategoryPageController'
        }).
        when('/chart/realtime/', {
            templateUrl: 'views/chart/realtime.html',
            controller: 'realtimeChartCategoryPageController'
        }).
        when('/chart/force/', {
            templateUrl: 'views/chart/force.html',
            controller: 'forceChartCategoryPageController'
        }).
        when('/chart/tree/', {
            templateUrl: 'views/chart/tree.html',
            controller: 'treeChartCategoryPageController'
        }).
        when('/chart/relation/', {
            templateUrl: 'views/chart/relation.html',
            controller: 'relationChartCategoryPageController'
        }).

        otherwise({redirectTo: '/vis/category/'});
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
        $scope.charts = [
            {"name":"line","title":"折线图","description":"这是我的折线图"},
            {"name":"bar","title":"柱状图","description":"这是我的柱状图"},
            {"name":"pie","title":"饼状图","description":"这是我的饼状图"},
            {"name":"group","title":"分组柱状图","description":"这是我的分组柱状图"},
            {"name":"drag","title":"可拖动柱状图","description":"这是我的可拖动柱状图"},
            {"name":"realtime","title":"实时监控图","description":"这是我的实时监控图"},
            {"name":"force","title":"力图","description":"这是我的力图"},
            //{"name":"relation","title":"关系图","description":"这是我的关系图"},
            {"name":"tree","title":"树形图","description":"这是我的树形图"},
        ]


    }
);


app.controller(
    'lineChartCategoryPageController',
    function lineChartCategoryPageController($scope, $http, $routeParams, $location, $rootScope) {
        $rootScope.page_name = "折线图";
        $scope.charts = []

        var w = 400;
        var h = 300;
        var padding = 5;
        var margin = 20;

        var monthSales = [
            {'month':1,'sales': 0},
            {'month':2,'sales': 80},
            {'month':3,'sales': 80},
            {'month':4,'sales': 110},
            {'month':5,'sales': 120},
            {'month':6,'sales': 130},
            {'month':7,'sales': 100},
            {'month':8,'sales': 130},
            {'month':9,'sales': 120},
            {'month':10,'sales': 110}

        ];


        var dataset = [5,10,15,20,25,30];


        var xScale = d3.scale.linear()
            .domain([0, d3.max(monthSales,function(d){return d.month})])
            .range([0,w]);
        var yScale =d3.scale.linear()
            .domain([0, d3.max(monthSales,function(d){return d.sales})])
            .range([h,0]);

        var xAxis = d3.svg.axis()
            .orient('bottom')
            .scale(xScale)

        var yAxis = d3.svg.axis()
            .orient('left')
            .scale(yScale)

        var svg = d3.select('#line_chart')
            .append('svg')
            .attr('width',w+2*margin)
            .attr('height',h+2*margin);

        svg.append('g')
            .attr("class", "x axis")
            .attr("transform", "translate("+margin+", "+(h+margin)+")")
            .call(xAxis);

        svg.append('g')
            .attr("class", "y axis")
            .attr("transform", "translate("+margin+", "+margin+")")
            .call(yAxis);

        // 线条
        var line = d3.svg.line()
            .x(function(d){return xScale(d.month)+margin})
            .y(function(d){return yScale(d.sales)+margin});

        var hoverLine = d3.svg.line()
            .x(function(d){return xScale(d.month)+margin})
            .y(function(d){return yScale(d.sales)+margin});

        var path = svg.append('path')
            .datum(monthSales)
            .attr("d", line)
            .attr('stroke','red')
            .attr('stroke-width',2)
            .attr('fill','none');

        var point = svg.selectAll('.point')
            .data(monthSales)
            .enter()
            .append('circle')
            .attr('class','point')
            .attr('cx',function(d){
                return xScale(d.month)+margin
            })
            .attr('cy',function(d){
                return yScale(d.sales)+margin
            })
            .attr('r',4)
            .attr('fill','#dddddd')
            .attr('stroke-opacity','0.2')
            .on('mouseover',function(){
                var point_x = parseFloat(d3.select(this).attr('cx'));
                var point_y = parseFloat(d3.select(this).attr('cy'));
                svg.append('path')
                    .attr('id','hover-line')
                    .attr('d', function(d){
                        var hover = d3.svg.line()
                        return hover([0,point_y],[point_x,point_y],[point_x,0])
                    })
            })
    }
);

app.controller(
    'pieChartCategoryPageController',
    function pieChartCategoryPageController($scope, $http, $routeParams, $location, $rootScope) {

        var width = 500;
        var height = 500;

        var dataset = [
            ['华为','90'],
            ['华为1','30'],
            ['华为2','40'],
            ['华为3','50'],
            ['华为4','60'],
            ['华为5','70'],
            ['华为6','110'],
            ['华为7','30'],
            ['华为21','30'],
            ['华为22','30'],
            ['华为23','30'],
            ['华为24','30'],
            ['华为25','30'],
            ['华为26','30'],
            ['华为27','30'],
            ['华为28','30'],
            ['华为29','30'],
            ['华为30','30'],
            ['华为31','30'],
            ['华为32','30'],
            ['华为8','50'],
            ['华为9','70'],
            ['华为11','60'],
            ['华为12','30'],
        ]

        var colors = d3.range(100).map(d3.scale.category20())

        var outerRadius = width/3
        var innerTadius = 0
        var arc = d3.svg.arc().innerRadius(innerTadius).outerRadius(outerRadius)

        var pie = d3.layout.pie().value(function(d){return d[1]})
        var pie_data = pie(dataset)
        // 清空画布
        var svg = d3.select("#pie_chart").append("svg").attr("width",width).attr("height",height)
        var arcs = svg.selectAll("g")
            .data(pie_data)
            .enter()
            .append("g")
            .attr("transform","translate("+(width/2)+","+(height/2)+")")
            .on("mouseover",function(d,i){
                d3.select(this).attr('fill','red')
            })
            .on("mouseout",function(d,i){
                d3.select(this).transition().duration(500).attr('fill','#666666')
            })
        arcs.append("path").attr("fill",function(d,i){return colors[i]}).attr('d',function(d){return arc(d)})

        var label_points = [];
        arcs.append('text').attr('class','pie-label').text(function(d){
            var x = arc.centroid(d)[0]*2.4
            var y = arc.centroid(d)[1]*2.4
            label_points.push({
                name : d.data[0],
                x : x,
                y : y
            })
        }).attr('fill','#ffffff')

        // 将label_points拆分成两部分， x>0 和 x <0

        var left_points = [];
        var right_points = [];
        label_points.forEach(function(d){
            if (d.x >0){
                right_points.push(d)
            }else{
                left_points.push(d)
            }
        });

        // 排序操作
        left_points.sort(function(a,b){
            return a.y - b.y
        })
        right_points.sort(function(a,b){
            return a.y - b.y
        })

        var point_hash = {}
        // 上下点之间的距离
        left_points.forEach(function(d,index){
            if (index==0){
                point_hash[d.name] = [d.x, d.y]
            }else{
                // 比较
                if (d.y - left_points[index-1].y < 20){
                    d.y = left_points[index-1].y + 20
                }
                point_hash[d.name] = [d.x, d.y]

            }
        })

        right_points.forEach(function(d,index){
            if (index==0){
                point_hash[d.name] = [d.x, d.y]
            }else{
                // 比较
                if (d.y - right_points[index-1].y < 20){
                    d.y = left_points[index-1].y + 20
                }
                // 如果x距离太近，需要调整一下
                point_hash[d.name] = [d.x, d.y]
            }
        })

        arcs.append('text').attr('transform',function(d){
            console.log('xxx',d.data[0])
            var points = point_hash[d.data[0]];
            console.log(points)
            var x = points[0];
            var y = points[1];
            if(x<0){
                if (Math.abs(x)+70>width/2){
                    x = -(width/2)+70
                }
            }else{
                if (Math.abs(x)+80>=width/2){
                    x = width/2-80
                }
            }
            return "translate("+x+","+y+")"

        }).attr('text-anchor',function(d){
            var x = arc.centroid(d)[0]*2.4
            console.log(d)
            if (x>0){
                return 'start'
            }else{
                return 'end'
            }
        }).attr('font-size','12px').text(function(d){
            var percent = Number(d.value)/d3.sum(dataset,function(d){return d[1]})*100
            return d.data[0] + '' + percent.toFixed(1)+'%'
        })

        arcs.append("line").attr('stroke','#666666')
            .attr('x1',function(d){return arc.centroid(d)[0]*2})
            .attr('y1',function(d){return arc.centroid(d)[1]*2})
            .attr('x2',function(d){
                var points = point_hash[d.data[0]];
                console.log(points)
                var x = points[0];
                return x
            })
            .attr('y2',function(d){
                var points = point_hash[d.data[0]];
                console.log(points)
                var y = points[1];

                return y
            })
    }
);


