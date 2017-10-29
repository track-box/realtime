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
function TrackboxFirebase() {
    // init trackbox data
    var trackdata = {
        name: "test",  
        map: trackbox.map._def,
        tracks: [],
        goals: []
    };
    
    this.db = firebase.database();
    this.tracks = this.db.ref().child("tracks");
    this.trackid = this.tracks.push(trackdata).key;
    
    this.trackPoints = this.db.ref("/tracks/" + this.trackid).child("tracks");
    
    console.log("track id: " + this.trackid);
}

TrackboxFirebase.prototype.addTrackPoint = function(pos) {
    this.trackPoints.push([
        pos.coords.latitude,
        pos.coords.longitude,
        pos.coords.altitude,
        pos.timestamp,
        pos.coords.speed,
        pos.coords.heading
    ]);
};


TrackboxFirebase.prototype.addGoal = function() {
};
