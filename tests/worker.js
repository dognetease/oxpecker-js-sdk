/* eslint-disable */
var a = 1;
var connectList = [];
var first = true
onconnect = function (e) {
    var port = e.ports[0];
    port.start();
    if (connectList.indexOf(port) === -1) {
        connectList.push(port)
    } 
    // port.onmessage = function (e) {
    //     var worker = e.currentTarget;
    //     if (connectList.indexOf(worker) === -1) {
    //         connectList.push(worker)
    //     }          
    // }
    if (first) {
        first = false
        setInterval(() => {
            a++
            connectList.forEach((wor) => {
                wor.postMessage(a)
            });
        }, 2000);
    }


}