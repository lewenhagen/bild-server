/**
 * Main program to run a server in KMOM04 - Linux DV1547
 *
 */
var fs = require('fs');

var server = require('./server.js');

var port = process.env.LINUX_PORT ? process.env.LINUX_PORT : 1337;

// Start the server to listen on a port
server.listen(port, '0.0.0.0');

// Save pid to file
// fs.writeFile("pid", process.pid, function(err) {
//     if (err) {
//         return console.log(err);
//     }
//     console.log("Wrote PID to file called 'pid'.");
// });


console.log("Simple server listen on port " + port);
