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

	function inputExt(){

        function checkPassword(password) {
            var reg = new RegExp('^[\\W\\w]{6,15}$', 'g');
            return reg.test(password) || (password && !password.length);
        }

        function checkPasswordsEqual(password1, password2) {
            return password1 === password2 || (email && !password2.length);
        }

        function checkEmail(email) {
            var reg = new RegExp('^[a-z]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$',
                'g');
            return reg.test(email) || (email && !email.length);
        }

        function checkCaptcha(captcha){
        	var reg = new RegExp('^[A-Za-z0-9]{4}$', 'gi');
            return reg.test(captcha) || (captcha && !captcha.length);
        }

        function verification(type){

        	switch(type){
        		case type === 'password':
        			return checkPassword;
        		case type === 'email':
        			return checkEmail;
        		case type === 'second-password':
        			return checkPasswordsEqual;
        		case type === 'captcha':
        			return checkCaptcha;
        	}

        }

		return {
			restrict: 'E',
			template: '<input class="form-control form-group input-lg" type="{{type}}"" placeholder="{{placeholders}}"/>',
			scope:{
				placeholders: '=',
				type: '=',
				tip: '=',
				error: '='
			},
			link: function(scope, element, attrs){
				console.log(scope.placeholders);
				console.log(scope.type);
				var input = element;
                input.on('focus', function(evt) {

                    element.find('span').remove();

                    if (scope.tip) {
                        input.parent().after('<span class="tip">' + scope.tip + '</span>');
                    }
                });

                input.on('blur', function(evt) {
                    element.find('span').remove();
                    //console.log(scope.checkHandle());
                    if (!verification(scope.type)) {
                        input.parent().after('<span class="error">' + scope.error + '</span>');
                    }
                });
			}
		};
	}




})();
