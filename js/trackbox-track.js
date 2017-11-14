/*
 * TrackboxTrack - trackbox track class based on Google Maps
 *
 */

/** @constructor */
function TrackboxTrack(map) {
    this.map = map;

    this.prevPos;
    this._startAlt;
    this._direction;
    this.track = [];
}

TrackboxTrack.prototype.drawDirection = function (position, speed, heading){
    var distance = speed * 60 * 5; // 5min
    var target;
    if (heading && heading != "-" && heading != -1){
        target = google.maps.geometry.spherical.computeOffset(position, distance, heading);
    }

    if (target){
        if (this._direction){
            this._direction.setPath([ position, target ]);
        
        }else{
            this._direction = new google.maps.Polyline({
		        path: [ position, target ],
		        strokeColor: "#2979ff",
		        strokeWeight: 4,
		        strokeOpacity: 1,
		        map: this.map
	        });
        }

    }else{
        if (this._direction){
            this._direction.setPath([]);
        }
    }
};

TrackboxTrack.prototype.addTrackPoint = function (position, point){
    this.track.push(point);
  
    var alt = point[3];
    if (!alt) alt = 0;

    if (this.prevPos){
        this._drawPolyline(this.prevPos, position, alt);
    }else{
        this._startAlt = alt;
    }
    this.prevPos = position;
};

TrackboxTrack.prototype._drawPolyline = function (p1, p2, alt){
    var color = this._fixedGradient(alt - this._startAlt);

    var polyline = new google.maps.Polyline({
		path: [ p1, p2 ],
		strokeColor: color,
		strokeWeight: 4,
		strokeOpacity: 1,
		map: this.map
	});
    
	var self = this;
    google.maps.event.addListener(polyline, 'click', function(e){
        console.log(e);
	    self.showInfoWindowFromLatLng(e.latLng.lat(), e.latLng.lng());
	});
};


TrackboxTrack.prototype._fixedGradient = function(x) {
    var grad = [
    	{ value:0,    r:0,   g:0,   b:255 },
		{ value:100,  r:0,   g:255, b:255 },
		{ value:300,  r:0,   g:255, b:0   },
		{ value:600,  r:255, g:255, b:0   },
		{ value:900,  r:255, g:0,   b:0   },
		{ value:1500, r:255, g:0,   b:255 },
		{ value:2500, r:128, g:0,   b:128 }
	];

	var pivot;
	for (pivot = 1; pivot < grad.length; pivot++){
		if ( x <= grad[pivot].value ){
			break;
		}
	}

	var l = grad[pivot-1];
	var r = grad[pivot];

	var delta = (x - grad[pivot-1].value) / (grad[pivot].value - grad[pivot-1].value);

	var color = {
		r: Math.round( (r.r - l.r) * delta + l.r ),
		g: Math.round( (r.g - l.g) * delta + l.g ),
		b: Math.round( (r.b - l.b) * delta + l.b )
	};

	return "#" + this._doubleHex(color.r) +
		this._doubleHex(color.g) + this._doubleHex(color.b);
};

TrackboxTrack.prototype._doubleHex = function(x) {
	return ( x < 16 ) ? "0" + x.toString(16) : x.toString(16);
};

TrackboxTrack.prototype.drawLastPosition = function(position) {
    if (!this._currentPosMarker) {
        this._currentPosMarker = new google.maps.Marker({
            position: position,
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 6,
                fillOpacity: 1,
                fillColor: '#1faee3',
                strokeWeight: 1,
                strokeColor: '#4591c5'
            }
        });

    }else{
        this._currentPosMarker.setPosition(position);
    }
};

TrackboxTrack.prototype.showInfoWindowFromLatLng = function (lat, lng){
    var min, min_i = 0;
    for (var i = 0; i < this.track.length; i++){
        var d = Math.pow(this.track[i][1] - lat, 2) + Math.pow(this.track[i][2] - lng, 2);
        if (i == 0){
            min = d;
        }else if (d < min){
            min = d;
            min_i = i;
        }
    }

    console.log(min_i);
    this.showInfoWindow(min_i);
};


TrackboxTrack.prototype.showInfoWindow = function (t){
    if (this._preventInfoWindow) return;
    if (this._infoWindow) this._infoWindow.close();

    function pad(n) { return n<10 ? '0'+n : n; }
    var date = new Date(this.track[t][0]);

    var content = '<div class="track-info-window" style="font-size:12px; line-height:16px;">' +
        pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds()) + "<br>" +
        "altitude: " + Math.round(this.track[t][3]) + " m<br>" +
        "speed:    " + Math.round(this.track[t][4]*10)/10 + " m/s<br>" +
        "heading:  " + Math.round(this.track[t][5]) + "°" +
        '</div>';

    this._infoWindow = new google.maps.InfoWindow({
        content: content,
        position: new google.maps.LatLng(this.track[t][1], this.track[t][2])
    });
    this._infoWindow.open(this.map);
};

