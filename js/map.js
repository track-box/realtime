var map, trackbox, tracking;

function onMapsApiLoaded() {
    map = new google.maps.Map(document.getElementById('map'), {
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        center: new google.maps.LatLng(33.252814, 130.245334),
        zoom: 12,
        disableDefaultUI: true
    });

    var mapdef = {
        name: "Saga2017",
        bounds: [[33.07754498441214, 129.95346411545185], [33.41060691858563, 130.49726791761674]],
        zoom: { min: 5, max: 15 },
        utm: {
            zone: 52,
            xmin: 588987,
            xmax: 639232,
            ymin: 3660873,
            ymax: 3697218
        },
        url: "https://d128cdxvkxdfwx.cloudfront.net/map/saga2017",
        waypoint_url: "https://track-box.github.io/trackbox-map/saga2017/waypoint.json"
    };

    var trackboxMap = new TrackboxMap(mapdef);
    trackboxMap.addTo(map);
    var trackboxGoals = new TrackboxGoals(map, trackboxMap);
    
    trackbox = {
        map: trackboxMap,
        goals: trackboxGoals
    };
    
    tracking = new Tracking();
}
