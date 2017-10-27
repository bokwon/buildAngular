(function(){
  var app = angular.module("DemoApp", []);
  app.controller("DemoAppController", function($scope, $interval){
    var vm = this;
    vm.watchCollectionCount = 0;
    vm.watchCount = 0;
    vm.friends = [];
    vm.stop;
    
    $scope.$watchCollection(
      //watchFn
      function() {
        return vm.friends;
      },
      //ListenerFn
      function() {
        vm.watchCollectionCount += 1;
      }
    );

    $scope.$watch(
      //watchFn
      function() {
        return vm.friends;
      },
      //ListenerFn
      function() {
        vm.watchCount += 1;
      }
    );

    vm.stop = $interval(function(){
      if (vm.friends.length < 5) {
        vm.friends.push("New Friend" + vm.watchCollectionCount);
      } else {
        vm.stopInterval();
      }
    }, 5000);
    
    vm.stopInterval = function() {
      if (angular.isDefined(vm.stop)) {
        $interval.cancel(vm.stop);
        vm.stop = undefined;
      }
    };
    
    $scope.$on('$destroy', function() {
      vm.stopInterval();
    });
  });
})();