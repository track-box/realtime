/*
 * TrackboxGoals - trackbox goals management class
 *
 *  use 
 *  	materialize
 *  	google maps
 *  	proj4
 *
 */

/** @constructor */
function TrackboxGoals(map, trackboxMap) {
	this.map = map;
	this._waypoint = trackboxMap._waypoint;

	this._utm = trackboxMap._def.utm;
	this._utm.xbase = Math.floor(this._utm.xmax / 100000) * 100000;
	this._utm.ybase = Math.floor(this._utm.ymax / 100000) * 100000;

	this._goals = {};

    TrackboxGoal = initTrackboxGoal();	
}

TrackboxGoals.prototype.addGoal = function(x, noshow) {
	if (!x){
		return;
	}

	if (this._goals[x]){
		return;
	}

	if (x.length == 3){
		if (this._waypoint.data.waypoints[x]){
			var w = this._waypoint.data.waypoints[x];
			this._addPoint(x, w.lat, w.lon, noshow);

		}else{
			Materialize.toast("not found", 1000);
		}
	}else if (x.length == 8){
		var latlon = this._getDigitLatLon(x);
		this._addPoint(x, latlon.lat, latlon.lon, noshow);

	}else{
		Materialize.toast("error!", 1000);
	}
};

TrackboxGoals.prototype._getDigitLatLon = function(digit) {
	var dx = parseInt(digit.substr(0, 4));
	var dy = parseInt(digit.substr(4, 4));

	var x = this._utm.xbase + dx * 10;
	var y = this._utm.ybase + dy * 10;

	if (x > this._utm.xmax) x -= 1000000;
	if (y > this._utm.ymax) y -= 1000000;

	var utm = "+proj=utm +zone=" + this._utm.zone;
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

	var pos = proj4(utm, wgs84, [x, y]);

	return { lat: pos[1], lon: pos[0] };
};

TrackboxGoals.prototype._getDigit = function(lat, lon) {
	var utm = "+proj=utm +zone=" + this._utm.zone;
	var wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";

	var pos = proj4(wgs84, utm, [lon, lat]);

	var x = Math.floor(pos[0] / 10);
	var y = Math.floor(pos[1] / 10);

	var dx = x % 10000;
	var dy = y % 10000;

	return "" + dx + dy;
};

TrackboxGoals.prototype._addPoint = function(name, lat, lon, noshow) {
	this._goals[name] = true;

	var pos = new google.maps.LatLng(lat, lon);
	var marker = new google.maps.Marker({
		position: pos, 
		map: this.map
	});
	
	if (!noshow) this._showGoal(pos);
    
	var self = this;
	marker.addListener('click', function() {
		self._showMarkerInfo(name);
	});

    
	this._goals[name] = {
        name: name,
		pos: pos,
		marker: marker
	};

	//this.updatePosition();
};

TrackboxGoals.prototype.addRemoteGoal = function(id, data) {
	var pos = new google.maps.LatLng(data.lat, data.lon);
    var goal = new TrackboxGoal(id, data.name, pos, { coord: data.coord, circle: data.circle }, this.map);
    
	this._goals[id] = {
		pos: pos,
		goal: goal,
        name: data.name
	};
};

TrackboxGoals.prototype.updateRemoteGoal = function (key, data){
    if (data.name != this._goals[key].name){
        this._goals[key].name = data.name;
        this._goals[key].goal.setName(data.name);
    }

    if (data.circle && data.circle.length > 0){
        this._goals[key].circle = data.circle;
        this._goals[key].goal.setCircles(data.circle);
    }
};

TrackboxGoals.prototype.deleteRemoteGoal = function (key) {
    this._goals[key].goal.delete();
    this._goals[key] = null;
};


TrackboxGoals.prototype._showMarkerInfo = function(name) {
	if (this._goals[name]){
		var goal = this._goals[name];
		var lat = goal.pos.lat();
		var lon = goal.pos.lng();
		$("#marker-info-name").text(goal.name);
		$("#marker-info-href").attr("href", "http://maps.google.com/maps?q="+ lat +","+ lon);
		$("#marker-info").modal().modal("open");
	}
};

TrackboxGoals.prototype._showGoal = function(pos) {
	this.map.setZoom(14);
	this.map.panTo(pos);
};

TrackboxGoals.prototype.updatePosition = function(position) {
	if (position){
		this._lastPosition = position;

		for (var key in this._goals){
			var goal = this._goals[key];

			var distance = google.maps.geometry.spherical.computeDistanceBetween(position, goal.pos);
			var heading = google.maps.geometry.spherical.computeHeading(position, goal.pos);

			if (heading < 0) heading += 360;

			var d = Math.round(distance) + "m";
			var head = Math.round(heading) + "°";

			goal.sheet.cells[1].innerHTML = d;
			goal.sheet.cells[2].innerHTML = head;
		}
	}else if (this._lastPosition){
		this.updatePosition(this._lastPosition);
	}
};


TrackboxGoals.prototype.deleteGoal = function(name) {
	if (this._goals[name]){
		var goal = this._goals[name];

		goal.marker.setMap(null);
		//this._sheet.deleteRow(goal.sheet.sectionRowIndex);

		delete this._goals[name];
	}
};


