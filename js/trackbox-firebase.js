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
    this.map = map;
    this.db = firebase.database();
    
    this.track = new TrackboxTrack(this.map);
    trackbox.track = this.track;

    this.$alt = $("#footer-altitude span");
    this.$heading = $("#footer-heading span");
    this.$speed = $("#footer-speed span");
}

TrackboxFirebaseTracking.prototype.init = function(callback) {
    var self = this;
    //this.db.ref("/tracks/" + this.trackid + "/map").once("value", function(d){
    this.db.ref("/tracks/" + this.trackid).once("value", function(d){
        self.snapshot = d;
        callback(d.child("map").val());
        //callback(d.val());
    });
};

TrackboxFirebaseTracking.prototype.initTrack = function(callback) {
    this.trackPoints = this.db.ref("/tracks/" + this.trackid + "/tracks");
    var self = this;
    this.trackPoints.once("value", function(d) {
        var points = d.val();

        var position, alt, timestamp, speed, headin;
        for (var i in points){
            var point = points[i];
            position = new google.maps.LatLng(point[1], point[2]);
            alt = point[3];
            timestamp = point[0];
            speed = point[4];
            heading = point[5];
            self.track.addTrackPoint(position, point);
        }

        if (points){
            // last point
            self.setLastPointInfo(alt, heading, speed);
            self.track.drawLastPosition(position);
            self.track.drawDirection(position, speed, heading);
        }
        
        callback(timestamp);
    });
};

TrackboxFirebaseTracking.prototype.initGoals = function() {
    this.goals = this.db.ref("/tracks/" + this.trackid + "/goals");
    var self = this;
    this.goals.once("value", function(d) {
        var goals = d.val();
        for (var key in goals){
            trackbox.goals.addRemoteGoal(key, goals[key]);
        }
    });
};

TrackboxFirebaseTracking.prototype.start = function(startTime) {
    var self = this;

    // on added filter by timestamp
    if (startTime){
        this.trackPoints.orderByChild("0").startAt(startTime + 1).on("child_added", function(d) {
            self.trackPointAdded(d);
        });

    }else{
        this.trackPoints.on("child_added", function(d) {
            self.trackPointAdded(d);
        });
    }
    
    this.goals.on("child_added", function(d) {
        self.goalAdded(d);
    });
    this.goals.on("child_changed", function(d) {
        self.goalChanged(d);
    });
    this.goals.on("child_removed", function(d) {
        self.goalRemoved(d);
    });
};


TrackboxFirebaseTracking.prototype.trackPointAdded = function(d) {
    var point = d.val();

    var position = new google.maps.LatLng(point[1], point[2]);
    var alt = point[3];
    var timestamp = point[0];
    var speed = point[4];
    var heading = point[5];

    this.setLastPointInfo(alt, heading, speed);
     
    // map
    this.track.drawLastPosition(position);
    this.track.drawDirection(position, speed, heading);
    this.track.addTrackPoint(position, point);
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

    trackbox.goals.addRemoteGoal(d.key, goal);
};

TrackboxFirebaseTracking.prototype.goalChanged = function(d) {
    var goal = d.val();
    console.log(goal);

    trackbox.goals.updateRemoteGoal(d.key, goal);
};

TrackboxFirebaseTracking.prototype.goalRemoved = function(d) {
    trackbox.goals.deleteRemoteGoal(d.key);
};
