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
    this.trackPoints = [];
}

TrackboxTrack.prototype.drawDirection = function (pos){
    var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    var distance = pos.coords.speed * 60 * 5; // 5min
    var target = google.maps.geometry.spherical.computeOffset(position, distance, pos.coords.heading);
    
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
    }
};

TrackboxTrack.prototype.addTrackPoint = function (pos){
    var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
    this.trackPoints.push({ pos: position });
    
    if (this.prevPos){
        this._drawPolyline(this.prevPos, position, pos.coords.altitude);
    }else{
        this._startAlt = pos.coords.altitude;
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
};

TrackboxTrack.prototype._drawPath = function (){
	for (var i = 0; i < this.track.length - 1; i++){
		var color = this._fixedGradient(this.track[i].alt);

		var polyline = new google.maps.Polyline({
			path: [ this.track[i].pos, this.track[i+1].pos ],
			strokeColor: color,
			strokeWeight: 4,
			strokeOpacity: 1,
			map: this.map
		});

		var self = this;
		//google.maps.event.addListener(polyline, 'click', function(e){
		//	self.showInfoWindowFromLatLng(e.latLng.lat(), e.latLng.lng());
		//});
	}
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
