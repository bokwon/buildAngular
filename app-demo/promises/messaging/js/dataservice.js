//using Service, it's instantiated with the 'new' keyword. Because of that, you'll add properties to 'this' and the service will return 'this'.  When you pass the service into your controller, those properties on 'this' will now be available on that controller through your service.

 angular.module("app").service("DataService", DataService)
 function DataService() {
    var service = this;
    
    service.id = 0;
    service.handlers = {};
     
    service.init = function() {
        window.addEventListener("idg-io-onmessage", function(e) {
            if (e == null || e.detail == null) {
                return;
            }
            service.onMessage(JSON.parse(e.detail));
        })
    }
    
    // dataService.addEventListener("OnGetUserSettings", vm.handler, true);
    service.addEventListener = function(name, handler, isDefault) {
        service.id++;
        
        isDefault = isDefault || false;
        
        var items = service.handlers[name];
        if (items == null) {
            items = [];
            service.handlers[name] = items;
        }
        
        items.push({id: service.id, handler: handler, isDefault: isDefault});
        
        return service.id;
    }
    
    service.removeEventListener = function(name, handler) {
        var items = service.handlers[name];
        if (items == null) {
            return;
        }
        
        for (var i=items.length -1; i >= 0; i--) {
            var item = items[i];
            if (item.handler !== handler) {
                continue;
            }
            
            items.splice(i, 1);
            break;
        }
    }
    
    service.onMessage = function(message) {
        if (message == null || message.Command == null) {
            return;
        }
        
        var items = service.handlers[message.Command];
        if (items == null) {
            return;
        }
        
        for (var i=0; i<items.length; i++) {
            var item = items[i];
            if (item.isDefault === true) {
                item.handler(message);
            }
            else if (message.Id != null && message.Id === item.id) {
                item.handler(message);
            }
        }
    };
     
    service.execute = function(message) {
        var command = message.Command;
        
        var promise = new Promise(function(resolve, reject) {
            var name = "On" + command;
            
            var handler = function(response) {
                service.removeEventListener(name, this);
                
                if (response == null) {
                    reject("invalid message or arguments");
                    return;
                }
                
                resolve(response);
            };
            
            message.Id = service.addEventListener(name, handler);
            
            FireEvent("idg-io-message", message);
        });
        
        return promise;
    }
     
    service.getUserSettings = function(result) {
        return service.execute({ Command: "GetUserSettings", Args: {Code: result}})
    };
    
    service.init(); 
};