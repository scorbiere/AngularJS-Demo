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
			return $timeout(function(){ self.someText = ''; }, 1000);
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
  .directive('busyAreaName', ['BusyService',
    function(BusyService) {
      return {
        restrict: 'A',
		/*transclude: true,
        template: '<div ng-transclude></div>',*/
        scope: {
          busyAreaName: '@',
        },
        link: function($scope, $element, $attrs) {
				  var setBusy = function(isBusy) {
					if (isBusy) {
					  $element.block({ message: null, overlayCSS: { backgroundColor: '#707070' } });
					}
					else {
					  $element.unblock();
					}
				  };
				  BusyService.add($scope.busyAreaName, setBusy);
				  $scope.$on('$destroy', function() {
					console.log("destroy");
					BusyService.remove($scope.busyAreaName, $scope.setBusy);
				  });
				}
      };
    }
  ])
  .directive('busyClick', ['BusyService',
    function(BusyService) {
      return {
        restrict: 'A',
        scope: {
          busyName: '@',
          busyClick: '&'
        },
        link: function($scope, $element, $attrs) {
				  var self = this;
				  $scope.isBusy = false;
				  var setBusy = function(isBusy) {
					$scope.isBusy = isBusy;
				  };
				  var onClick = function() {
					  if ($scope.isBusy) return false;

					  BusyService.setBusy($scope.busyName, true);
					  var resultClick = $scope.busyClick();
					  if (angular.isDefined(resultClick) && angular.isFunction(resultClick.then)) {
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
				  $element.bind('click', onClick);
				  $scope.$on('$destroy', function() {
					console.log("destroy");
					BusyService.remove($scope.busyName, $scope.setBusy);
					$element.unbind('click', onClick);
				  });
				}
      };
    }
  ])
  .directive('busyFormName', ['BusyService',
    function(BusyService) {
      return {
        restrict: 'A',
        scope: {
          busyFormName: '@',
          busyFormSubmit: '&'
        },
        link: function($scope, $element, $attrs) {
				  var self = this;
				  $scope.isBusy = false;
				  var setBusy = function(isBusy) {
					$scope.isBusy = isBusy;
				  };
				  var onSubmit = function() {
					  if ($scope.isBusy) return false;

					  BusyService.setBusy($scope.busyFormName, true);
					  var resultSubmit = $scope.busyFormSubmit();
					  if (angular.isDefined(resultSubmit) && angular.isFunction(resultSubmit.then)) {
						resultSubmit.then(function() {
							BusyService.setBusy($scope.busyFormName, false);
						  },
						  function() {
							BusyService.setBusy($scope.busyFormName, false);
						  });
					  }
					}
					
				  BusyService.add($scope.busyFormName, setBusy);
				  $element.bind('submit', onSubmit);
				  $scope.$on('$destroy', function() {
					console.log("destroy");
					BusyService.remove($scope.busyFormName, $scope.setBusy);
				    $element.unbind('submit', onSubmit);
				  });
				}
      };
    }
  ]);