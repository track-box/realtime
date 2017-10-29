// Initialize Firebase
var config = {
    apiKey: "AIzaSyCJAN2lEcfIAistGj4hETX7nvvu_1JJf2Y",
    authDomain: "trackbox-47f81.firebaseapp.com",
    databaseURL: "https://trackbox-47f81.firebaseio.com",
    projectId: "trackbox-47f81",
    storageBucket: "trackbox-47f81.appspot.com",
    messagingSenderId: "301600620133"
};
firebase.initializeApp(config);



/** @constructor */
function TrackboxFirebaseTracking(trackid, map) {
    this.trackid = trackid;
    
    this.db = firebase.database();
    this.trackPoints = this.db.ref("/tracks/" + trackid + "/tracks");
    var self = this;
    this.trackPoints.once("value", function(d) {
        // first draw all
        var startTime = self.initTrack(d);

        // on added filter by timestamp
        self.trackPoints.orderByChild("0").startAt(startTime + 1).on("child_added", function(d) {
            self.trackPointAdded(d);
        });
    });
    
    this.goals = this.db.ref("/tracks/" + trackid + "/goals");
    this.goals.on("child_added", function(d) {
        self.goalAdded(d);
    });
    
    this.track = new TrackboxTrack(map);

    this.$alt = $("#footer-altitude span");
    this.$heading = $("#footer-heading span");
    this.$speed = $("#footer-speed span");
}

TrackboxFirebaseTracking.prototype.initTrack = function(d) {
    var points = d.val();

    var position, alt, timestamp, speed, headin;
    for (var i in points){
        var point = points[i];
        position = new google.maps.LatLng(point[1], point[2]);
        alt = point[3];
        timestamp = point[0];
        speed = point[4];
        heading = point[5];
        this.track.addTrackPoint(position, alt);
    }

    // last point
    this.setLastPointInfo(alt, heading, speed);
     
    this.track.drawLastPosition(position);
    this.track.drawDirection(position, speed, heading);

    return timestamp;
};


TrackboxFirebaseTracking.prototype.trackPointAdded = function(d) {
    var point = d.val();
    console.log(point);

    var position = new google.maps.LatLng(point[1], point[2]);
    var alt = point[3];
    var timestamp = point[0];
    var speed = point[4];
    var heading = point[5];

    this.setLastPointInfo(alt, heading, speed);
     
    // map
    this.track.drawLastPosition(position);
    this.track.drawDirection(position, speed, heading);
    this.track.addTrackPoint(position, alt);
};

TrackboxFirebaseTracking.prototype.setLastPointInfo = function(alt, heading, speed) {
    if (alt) this.$alt.text(alt.toFixed(0));

    var heading_str = (heading && heading != "-" && heading != -1) ? heading.toFixed(0) : "-";
    this.$heading.text(heading_str);

    var speed_str = (speed && speed != -1) ? speed.toFixed(1) : "-";
    this.$speed.text(speed_str);

};

TrackboxFirebaseTracking.prototype.goalAdded = function(d) {
    var goal = d.val();
    console.log(goal);

    trackbox.goals._addPoint(goal.name, goal.lat, goal.lon, true);
};

