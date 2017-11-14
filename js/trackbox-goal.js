/*
 * TrackboxGoals - trackbox goal view class
 *
 * require:
 *  	google maps
 *
 */

function initTrackboxGoal(){
    TrackboxGoal.prototype = new google.maps.OverlayView();


function TrackboxGoal(key, name, pos, goal, map) {
	this._name = name;
    this._key = key;
	this._pos = pos;
	this.data = goal;
	this.map = map;
	this.setMap(map);

    this._circles = [];
	if (goal.circle){
		for (var i = 0; i < goal.circle.length; i++){
			this.drawCircle(i, parseFloat(goal.circle[i]));
		}
	}
};


TrackboxGoal.prototype.onAdd = function() {
	this._div = document.createElement('div');

	if (this._name == "") this._name = "?";

	var show_name = this._name;
	var width = 8 * this._name.length;

	if (this._name.length == 1) width = 16;
	if (this._name.length > 6) {
		width = 48;
		show_name = this._name.substr(0, 6);
	}

	this._div.style.position = 'absolute';
	this._div.style.width = width + 'px';
	this._div.style.height = '32px';

	if (!this.data.color) this.data.color = "#F06292";

	this._div.innerHTML = 
		'<div style="width: ' + width + 'px; font-size:12px; text-align:center; line-height:1; background-color: ' + this.data.color +  '; color: #212121; padding: 1px; border: 1px solid #777; box-shadow: 0 1px 4px -1px rgba(0,0,0,.3)">' + show_name + '</div>' +
	'<svg width="' + width + '" height="14">' +
		'<line x1="' + width/2 + '" y1="0" x2="' + width/2 + '" y2="8" stroke="#111" stroke-width="1" />' +
		'<circle cx="' + width/2 + '" cy="10" r="3" stroke="#e91e63" stroke-width="2" fill="none" />' +
		'</svg>';

	var self = this;
	var sub = (this.data.coord) ? this.data.coord : '';
	this._width = width;

	this._div.onclick = function () {
		trackbox.goals._showMarkerInfo(self._key);
	};
    
	var panes = this.getPanes();
	panes.overlayMouseTarget.appendChild(this._div);
};

TrackboxGoal.prototype.draw = function() {
	var pos = this._getPosFromLatLng(this._pos);
	if (this._div){
		this._div.style.left = (pos.x - this._width/2) + 'px';
		this._div.style.top = (pos.y - 28) + 'px';
	}
};

TrackboxGoal.prototype._redraw = function() {
	var map = this.map;
	this.setMap(null);
	this.setMap(map);
};

TrackboxGoal.prototype.onRemove = function() {
	if (this._div && this._div.parentNode) {
		this._div.parentNode.removeChild(this._div);
		this._div = null;
	}
};

TrackboxGoal.prototype._getPosFromLatLng = function(latlng) {
	return this.getProjection().fromLatLngToDivPixel(latlng);
};

TrackboxGoal.prototype.setCircles = function (circle){
	for (var i = 0; i < circle.length; i++){
        var r = parseFloat(circle[i])
		if (r) this.drawCircle(i, r);
	}
};

TrackboxGoal.prototype.drawCircle = function(i, radius) {
    if (!radius) {
        if (!this._circles[i]){
            this._circles[i].setRadius(0);
        }
        return;
    }

    if (!this._circles[i]){
	    this._circles[i] = new google.maps.Circle({
		    center: this._pos,
		    map: this.map,
	    	radius: radius,
	    	strokeColor: "#ef5350",
	    	strokeOpacity: 0.8,
		    strokeWeight: 2,
	    	fillColor: "#ffffff",
    		fillOpacity: 0,
            clickable: false,
            zIndex: 1
	    });
    }else{
        this._circles[i].setRadius(radius);
    }
};

TrackboxGoal.prototype.setColor = function(color) {
	this.data.color = color;
	this._redraw();
};

TrackboxGoal.prototype.setName = function(name) {
	this._name = name;
    this.data.name = name;
	this._redraw();
};

TrackboxGoal.prototype.setCenter = function() {
	this.map.setZoom(14);
	var pos = new google.maps.LatLng(this._pos.lat() - 0.007, this._pos.lng());
	this.map.panTo(pos);
};

TrackboxGoal.prototype.delete = function() {
	this.setMap(null);
    for (var i = 0; i < this._circles.length; i++){
        if (this._circles[i]) this._circles[i].setMap(null);
	}
	this.data = null;
};

    return TrackboxGoal;
}
