angular.module("app").controller("Ctrl1", function($scope, DataService) {
    var vm = this;

    vm.isBusy = false;
    vm.action = "Receive";
    vm.message = "";
    vm.toggle = false;

    vm.handler = function(message) {
        if (message == null || message.Args == null) {
            return;
        }

        $scope.$apply(function() {
            vm.showMessage(message);
        });
    };

    vm.onAction = function() {
        vm.actionmessage = "";

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
    
    vm.onRun = function() {
        vm.isBusy = true;
        vm.message = "";
        
        vm.getUserSettings();
    };
    
    vm.showMessage = function(message) {
        message = JSON.parse(JSON.stringify(message));
        vm.message = message;
    };
    
    vm.getUserSettings = function() {
        vm.toggle = !vm.toggle;
        
        DataService.getUserSettings(vm.toggle).then(function(message) {
            $scope.$apply(function() {
                vm.showMessage(message);
                vm.isBusy = false;
            });
        }, function(error) {
            $scope.$apply(function() {
                vm.showMessage(error);
                vm.isbusy = false;
            });
        });
    };
});



