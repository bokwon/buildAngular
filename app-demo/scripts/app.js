(function(){
  var app = angular.module("DemoApp", []);
  app.controller("DemoAppController", function($scope, $interval){
     var vm = this;
      vm.watchCollectionCount = 0;
      vm.watchCount = 0;
      vm.friends = [];
    
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
    
      $interval(function(){
        vm.friends.push("New Friend" + vm.watchCollectionCount);
      }, 10000);
  });
})();