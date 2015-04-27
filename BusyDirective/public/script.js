'use strict';
angular.module('testBusyDirective', [])
  .controller('SomeController', ['$http', '$timeout', 'BusyService',
    function($http, $timeout, BusyService) {
      var self = this;
      self.someText = '';
      self.doSomething = function() {
        self.someText = 'click in progress';
		return $http.get('/api/delay').then(function(){
			self.someText = 'click is over';
		});
      };
    }
  ])
  .factory('BusyService', [
    function() {
      var callList = {};
      return {
        add: function(name, func) {
          if (!callList[name]) {
            callList[name] = {
              toCall: []
            };
          }
          callList[name].toCall.push(func);
        },
        remove: function(name, func) {
          if (callList[name]) {
            position = $.inArray(func, callList[name].toCall);
            if (~position)
              callList[name].toCall.splice(position, 1);
          }
        },
        setBusy: function(name, isBusy) {
          if (callList[name]) {
            angular.forEach(callList[name].toCall, function(func) {
              if (func) {
                func(isBusy);
              }
            });
          }
        }
      };
    }
  ])
  .directive('busyArea', ['BusyService',
    function(BusyService) {
      return {
        restrict: 'E',
        transclude: true,
        template: '<div><ng-transclude></ng-transclude><div class="loading" ng-show="isBusy"><span>loading ...</span></div></div>',
        scope: {
          name: '@',
        },
        link: function($scope, $element, $attrs) {
				  $scope.isBusy = false;
				  var setBusy = function(isBusy) {
					$scope.isBusy = isBusy;
				  };
				  BusyService.add($scope.name, setBusy);
				  $scope.$on('$destroy', function() {
					console.log("destroy");
					BusyService.remove($scope.name, $scope.setBusy);
				  });
				}
      };
    }
  ])
    .directive('ngClickBusy', ['BusyService',
    function(BusyService) {
      return {
        restrict: 'A',
        scope: {
          busyName: '@',
          ngClickBusy: '&'
        },
        link: function($scope, $element, $attrs) {
				  var self = this;
				  $scope.isBusy = false;
				  var setBusy = function(isBusy) {
					$scope.isBusy = isBusy;
				  };
				  var onClick = function() {
					  if ($scope.isBusy) return;

					  BusyService.setBusy($scope.busyName, true);
					  var resultClick = $scope.ngClickBusy();
					  if (resultClick && angular.isFunction(resultClick.then)) {
						resultClick.then(function() {
							BusyService.setBusy($scope.busyName, false);
						  },
						  function() {
							BusyService.setBusy($scope.busyName, false);
						  });
					  } else {
						BusyService.setBusy($scope.busyName, false);
					  }
					}
				  BusyService.add($scope.busyName, setBusy);

				  var clickAction = $attrs.ngClickBusy;
				  if (clickAction) {
					$element.bind('click', onClick);
				  }

				  $scope.$on('$destroy', function() {
					console.log("destroy");
					BusyService.remove($scope.busyName, $scope.setBusy);
					if (clickAction) {
					  $element.unbind('click', onClick);
					}
				  });
				}
      };
    }
  ]);