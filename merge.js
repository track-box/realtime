// Import Admin SDK
var admin = require("firebase-admin");

var serviceAccount = require("../trackbox-47f81-firebase-adminsdk.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://trackbox-47f81.firebaseio.com"
});

var db = admin.database();


var base = process.argv[2];
var plus = process.argv[3];


var ref1 = db.ref("/tracks/" + base + "/tracks");
var ref2 = db.ref("/tracks/" + plus + "/tracks");

ref2.once("value", function(d) {
    var points = d.val();
    for (var i in points){
        var point = points[i];
        ref1.push(point);
    }
});

