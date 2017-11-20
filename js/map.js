var map, trackbox = {};

function onMapsApiLoaded() {
    map = new google.maps.Map(document.getElementById('map'), {
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        center: new google.maps.LatLng(36.204824, 138.252924),
        zoom: 5,
        disableDefaultUI: true
    });

    if (location.hash){
        var trackid = location.hash.substr(1);
        trackbox.tracking = new TrackboxFirebaseTracking(trackid, map);

        // map init
        trackbox.tracking.getMapDef(function(mapdef){
            trackbox.map = new TrackboxMap(mapdef);
            trackbox.map.addTo(map);
            // set center
            trackbox.goals = new TrackboxGoals(map, trackbox.map);
        
            // traking
            trackbox.tracking.start();
        });
    }

}
