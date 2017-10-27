// Utility function to create CustomEvent.
function FireEvent(name, data) {
    var event = new CustomEvent(name, {detail: JSON.stringify(data)});

    if (window != null) {
        window.dispatchEvent(event);
    }
};

// Simulating server data requesting/responding from/to the client.
function init() {
    window.addEventListener("idg-io-message", function(e) {
        if (e == null || e.detail == null) {
            return;
        }   

        var message = JSON.parse(e.detail);
        if (message == null) {
            return;
        }

        var args = null;
        var command = "On" + message.Command;

        if (message.Command === "GetUserSettings") {
            args = { Status: message.Args.Code };
        }

        window.setTimeout(function() {
            FireEvent("idg-io-onmessage", {Id: message.Id, Command: command, Args: args});
        }, 1000);

    }, false);

    // simulate every 5 seconds server sending data to the client.
    var toggle = false;
    window.setInterval(function() {
        toggle = !toggle;
        FireEvent("idg-io-onmessage", {Command: "OnGetUserSettings", Args: {Status: toggle}});
    }, 5000);
}

init();