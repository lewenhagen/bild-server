/**
 * Simple HTTP server
 *
 */

 /*jshint esversion: 6 */
 var Router = require('./router');
 var router = new Router();

var http = require('http');
var url = require('url');

var fs = require('fs');
var qs = require('querystring');
var child = require('child_process');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database("db/images.sqlite");

/**
 * Wrapper function for sending a JSON response
 *
 * @param  Object        res     The response
 * @param  Object/String content What should be written to the response
 * @param  Integer       code    HTTP status code
 */
function sendJSONResponse(res, content, code = 200) {
    res.writeHead(code, "Content-Type: application/json");
    res.write(JSON.stringify(content, null, "    "));
    res.end();
}



/**
 * Display a helptext about the API.
 *
 * @param Object req The request
 * @param Object res The response
 */
router.get("/", (req, res) => {

    res.writeHead(200, "Content-Type: text/plain");
    res.write("Welcome Image app. This is the API of what can be done.\n\n"
        + " /                                   Visar den här hjälpen.\n"
        + " /all                                Visar alla bilder\n"
        + " /id/:<int>                          Hämtar en bild med id\n"
        + " /category/:<string>                Hämtar alla bilder baserat på kategori\n"
    );
    res.end();
});



/**
 * Returns all images from database.
 *
 * @param Object req The request
 * @param Object res The response
 */
router.get("/all", (req, res) => {

    // Show all
    db.serialize(function() {
        db.all("SELECT * FROM images", (err, rows) => {
            console.log(rows);
            sendJSONResponse(res, rows);
        });

    });
});



/**
 * Returns one image from database based on id.
 *
 * @param Object req The request
 * @param Object res The response
 */
router.get("/id/:id", (req, res) => {
    var id = -1;
    if (typeof(parseInt(req.params.id)) === "number") {
        id = parseInt(req.params.id);
    }

    db.serialize(function() {
        db.all("SELECT * FROM images WHERE id=" + id, (err, rows) => {
            console.log(rows);

            var imageurl = fs.readFileSync('images/org/' + rows[0].imagename); // rows[0].imagename
            res.writeHead(200, {'Content-Type': 'image/jpg' });
            res.end(imageurl, 'binary');
        });
    });
});



/**
 * Returns all images with a specified searchterm.
 *
 * @param Object req The request
 * @param Object res The response
 */
router.get("/search/:search", (req, res) => {
    var cat = "";
    console.log(req.params.search);
    if (typeof(req.params.search.toString()) === "string") {
        cat = req.params.search.toString();
    }

    db.serialize(function() {
        db.all("SELECT * FROM images WHERE imagename LIKE ? OR category LIKE ?", ["%" + cat + "%", "%" + cat + "%"], (err, rows) => {
            console.log(rows);
            sendJSONResponse(res, rows);
        });
    });
});





// db.close();


var server = http.createServer((req, res) => {

    var ipAddress,
        route;

    // Log incoming requests
    ipAddress = req.connection.remoteAddress;

    // Check what route is requested
    route = url.parse(req.url).pathname;
    console.log("Incoming route " + route + " from ip " + ipAddress);

    // Let the router take care of all requests
    router.route(req, res);
});

// Export the server as a module.
module.exports = server;
