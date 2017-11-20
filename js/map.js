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

        trackbox.tracking.init(function(mapdef){

            // map init
            trackbox.map = new TrackboxMap(mapdef);
            trackbox.map.addTo(map);
            trackbox.goals = new TrackboxGoals(map, trackbox.map);
            
            $("#loader").hide();
        
            // traking
            trackbox.tracking.initTrack(function(lastUpdate){
                // within 3hours
                if (!lastUpdate || Date.now() - lastUpdate < 3 * 3600 * 1000){
                    trackbox.tracking.start(lastUpdate);
                } 
            });
            trackbox.tracking.initGoals();

        });
    }

}
