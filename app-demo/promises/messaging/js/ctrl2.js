angular.module("app").controller("Ctrl2", function($scope, DataService) {
    var vm = this;
    vm.isBusy = false;
    vm.action = "Receive";
    vm.message = "";


    vm.handler = function(message) {
        if (message == null || message.Args == null) {
            return;
        }

        $scope.$apply(function() {
            vm.showMessage(message);
        });
    };

    vm.onAction = function()
    {
        vm.message = "";

        if (vm.action === "Stop") {
            vm.action = "Receive";
            // remove eventlistener
            DataService.removeEventListener("OnGetUserSettings", vm.handler);
        } else {
            vm.action = "Stop";
            // add eventlistener
            DataService.addEventListener("OnGetUserSettings", vm.handler, true);

        }
    };

    vm.showMessage = function(message) {
        message = JSON.parse(JSON.stringify(message));
        vm.message = message;
    };
    
});