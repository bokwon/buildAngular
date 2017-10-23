function getSync(url) {
    var startTime = Date.now();
    //var waitTime = 3000 * Math.random() * fakeSlowNetwork;
    
    var req = new XMLHttpRequest();
    req.open('get', url, false);
    req.send();
    
    if (req.status == 200) {
        return req.response;
    }
    else {
        throw Error(req.statusText || "Request failed");
    }
}

function getJsonSync(url) {
    return JSON.parse(getSync(url));
}