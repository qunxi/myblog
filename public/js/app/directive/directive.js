(function(){

	angular.module('app').directive('pagination', pagination);

	function pagination(){
		return {
			restrict: 'E',
			template: '<nav><ul class="pagination pagination-lg">' +
							'<li ng-if="showPrev" ng-click="previous()"><a href="#" aria-label="Previous"><span aria-hidden="true">«</span></a></li>' +
							'<li ng-repeat="i in range" ng-click="setPage(i)" ng-class="{active: currentPage === i}"><a href="#">{{i}}</a></li>' +
							'<li ng-if="showNext" ng-click="next()"><a href="#" aria-label="Next"><span aria-hidden="true">»</span></a></li>' +
					  '</ul></nav>',
			scope:{
				pageSize: '=',
				currentPage: '=',
				totalSize: '=',
				pageChange: '&'
			},

			controller: function($scope){
			},
			link: function(scope, element, attrs){
				scope.totalSize = Math.floor(scope.totalSize);
				function getRange(start, end){
					var range = [];
					for(var i = start > scope.totalSize ? scope.totalSize : start; i <= (end < scope.totalSize ? end : scope.totalSize); ++i){
						range.push(i);
					}
					return range;
				}

				function isShowNext(startOfRange){
					return scope.totalSize > scope.pageSize + startOfRange;
				}

				function isShowPrev(startOfRange){
					return startOfRange > 1; 
				}

				scope.range = getRange(1, scope.pageSize);
				scope.currentPage = 1;
				scope.showNext = isShowNext(1);
				scope.showPrev = isShowPrev(1);
	
				scope.setPage = function(n){
					scope.currentPage = n;

					scope.pageChange({'currentPage': scope.currentPage});
				};

				scope.next = function(){
					scope.setPage(++scope.currentPage);
					scope.range = getRange(scope.currentPage, scope.currentPage + scope.pageSize);
					scope.showNext = isShowNext(scope.currentPage);
					scope.showPrev = isShowPrev(scope.currentPage);
				};

				scope.previous = function(){
					scope.setPage(--scope.currentPage);
					var start = scope.currentPage - scope.pageSize < 1 ? 1 : scope.currentPage - scope.pageSize;
					scope.range = getRange(start, scope.currentPage);
					scope.showPrev = isShowPrev(start);
					scope.showNext = isShowNext(start);
				};
			
			}
		};
	}


	angular.module('app').directive('inputExt', inputExt);
	inputExt.$inject = ['accountService'];
	function inputExt(accountService){
        function verification(type, text, compare) {
            if (type === 'password' && !compare)
                return accountService.checkPassword(text);
            if (type === 'email')
                return accountService.checkEmail(text);
            if (type === 'password' && !!compare)
                return accountService.checkPasswordsEqual(text, compare);
            if (type === 'captcha')
                return accountService.checkCaptcha(text);
        }

        function convertNativeType(type){
        	if(type === 'captcha' || type === 'email')
        		return 'text';   	
        	return type;
        }

		return {
			restrict: 'E',
			template: '<input class="form-control" type="{{nativeType}}" placeholder="{{placeholder}}" ng-model="model"/>',
			scope:{
				placeholder: '@',
				type: '@',
				tip: '@',
				error: '@',
				model: '=',
				compare: '='
			},
			link: function(scope, element, attrs){
				var input = element.find('input');
				scope.nativeType = convertNativeType(scope.type);
                input.on('focus', function(evt) {
                    element.find('span').remove();
                    
                    if (scope.tip) {
                    	
                        input.after('<span style="display: block; padding: 5px; color: #999; flex: 1 220px;">' + scope.tip + '</span>');
                    }
                    input.parent().removeClass('has-success');
                    input.parent().removeClass('has-error');
                });

                input.on('blur', function(evt) {
                    element.find('span').remove();
                    
                    if (!verification(scope.type, scope.model, scope.compare)) {
                    	input.parent().removeClass('has-success');
                    	input.parent().addClass('has-error');
                        input.after('<span style="display: block; padding: 5px; color: #e42012; flex: 1 220px;">' + scope.error + '</span>');
                    }
                    else{
                    	input.parent().removeClass('has-error');
                    	input.parent().addClass('has-success');
                    }
                });
			}
		};
	}

	angular.module('app').directive('sideBar', sideBar);
	sideBar.$inject = ['utilsService'];

	function sideBar(utilsService){
		return {
			restrict: 'E',
			template: '<ul class="nav-menu" ng-mouseenter="mouseIn()", ng-mouseleave="mouseOut()">' +
					  '<li class="menu-item" ng-repeat="menuItem in menuItems"><a ng-class="{active: menuItem.active}" ng-href="{{menuItem.url}}" >{{menuItem.text}}</a></li>' +
					  '</ul>',
			scope:{
				menuItems: '=',
			
			},

			link: function(scope, element, attrs){
				scope.menuItems = [{text: '个人信息', url: '/account', active: true}, 
								   {text: '朋友圈', url: '/#', active: false}, 
								   {text: '修改密码', url: '/changepassword', active: false},
								   {text: '我的订阅', url: '/subscribe', active: false},
								   {text: '我的工作', url: '/#', active: false}];
				
				scope.mouseIn = function(){
					var lis = element.find('ul li');

					for(var i = 0; i < lis.length; ++i){
						var aElement = angular.element(lis[i]).find('a');
						if(aElement.hasClass('active')){
							aElement.removeClass('active');
							break;
						}
					}
				};

				scope.mouseOut = function(){
					var lis = element.find('ul li');
					
					for(var i = 0; i < lis.length; ++i){
						var aElement = angular.element(lis[i]).find('a');
						if(aElement.attr('href') === utilsService.getLocationPath()){
							aElement.addClass('active');
						}

					}
				};
			}
		};
	}



	angular.module('app').directive('postCatelog', postCatelog);
	postCatelog.$inject = [];

	function postCatelog(){

		return {
			restrict: 'E',
			template: '<div class="catelog">' +
					    '<img class="thumb-pic" ng-src="{{catelogData.icon}}"/>' +
					  	'<div class="content">' +
						  '<div class="title">' +
						  	'<a>{{catelogData.title}}</a>' +
						  '</div>' +
						  '<div class="subtitle">' +
						  	'<a>{{catelogData.subtitle}}</a>' +
						  '</div>' +
					  	  '<div class="property">' +
							'<span>{{catelogData.updated}}</span>' +
							'<span>{{catelogData.author}}</span>' +
					  	'</div>' +
					  '</div>',
			scope:{
				catelogData: '='
			},
			link: function(scope, element, attrs){
				console.log(scope.catelogData);
				/*scope.catelog = {
					image: 'http://www.acfun.tv/favicon.ico',
					title: '阿里巴巴 EUD 博客',
					subtitle: 'good boy',
					updateDate: '2015-3-3',
					author: 'wqx'
				};*/
			}		  
		};

	}




})();
