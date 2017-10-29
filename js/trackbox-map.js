/*
 * TrackboxMap - trackbox map class based on Google Maps
 *
 * ref. Overlay map types
 * https://developers.google.com/maps/documentation/javascript/examples/maptype-overlay
 *
 */

/** @constructor */
function TrackboxMap(def) {
	this.tileSize = new google.maps.Size(256, 256);
	this.maxZoom = 21;
	this.name = def.name;
	this.alt = '';

	this._def = def;

	this._tileBounds = new google.maps.LatLngBounds(
		new google.maps.LatLng(def.bounds[0][0], def.bounds[0][1]),
		new google.maps.LatLng(def.bounds[1][0], def.bounds[1][1]));

	this._retina = window.devicePixelRatio >= 2;
}

TrackboxMap.prototype.addTo = function(map) {
	this.map = map;

	//map.fitBounds(this._tileBounds);

	this._setOverlayControl();

	map.mapTypes.set(this._def.name, this);
	//map.setMapTypeId(this._def.name);
	map.overlayMapTypes.insertAt(0, this);
	this._show = true;

	if (this._def.waypoint_url){
		this._waypoint = new TrackboxWaypoint(this._def.waypoint_url, map);
	}
};


TrackboxMap.prototype.getTile = function(coord, zoom, owner) {
	var tileBounds = this._tileCoordsToBounds(coord, zoom);

	if (tileBounds.intersects(this._tileBounds)){
		if (zoom >= this._def.zoom.min && zoom <= this._def.zoom.max){

			if (this._retina && zoom < this._def.zoom.max){
				var tile = owner.createElement('div');
				tile.style.width = this.tileSize.width + 'px';
				tile.style.height = this.tileSize.height + 'px';

				this._createRetinaTile(tile, coord, zoom + 1, 0, 0);
				this._createRetinaTile(tile, coord, zoom + 1, 0, 1);
				this._createRetinaTile(tile, coord, zoom + 1, 1, 0);
				this._createRetinaTile(tile, coord, zoom + 1, 1, 1);

				return tile;				

			}else{
				var tile = owner.createElement('img');
				tile.alt = '';

				tile.src = this._getTileUrl(coord, zoom);
				tile.style.width = this.tileSize.width + 'px';
				tile.style.height = this.tileSize.height + 'px';

				return tile;
			}
		}
	}
	
	var tile = owner.createElement('img');
	tile.alt = '';
	return tile;
};


TrackboxMap.prototype._createRetinaTile = function(tile, coord, zoom, px, py) {
	var coord1 = { x: coord.x * 2 + px, y: coord.y * 2 + py };
	var tileBounds = this._tileCoordsToBounds(coord1, zoom);

	if (tileBounds.intersects(this._tileBounds)){
		var tile1 = document.createElement('img');
		tile1.src = this._getTileUrl(coord1, zoom);
		tile1.style.width = (this.tileSize.width / 2) + 'px';
		tile1.style.height = (this.tileSize.height / 2) + 'px';
		tile1.style.position = 'absolute';
		tile1.style.top = (this.tileSize.width / 2 * py) + 'px';
		tile1.style.left = (this.tileSize.height / 2 * px) + 'px';

		tile.appendChild(tile1);
	}
};

TrackboxMap.prototype._getTileUrl = function(coord, zoom) {
	var y = (1 << zoom) - coord.y - 1;
	return this._def.url + '/' + zoom + '/' + coord.x + '/' + y + '.png';
};

TrackboxMap.prototype._tileCoordsToBounds = function(coord, zoom) {
	var proj = this.map.getProjection();
	var scale = Math.pow(2, zoom);

	var p1 = new google.maps.Point(
		(coord.x + 1)* this.tileSize.width / scale,
		coord.y * this.tileSize.height / scale);
	var p2 = new google.maps.Point(
		coord.x * this.tileSize.width / scale,
		(coord.y + 1) * this.tileSize.height / scale);
	
	var ne = proj.fromPointToLatLng(p1);
	var sw = proj.fromPointToLatLng(p2);

	return new google.maps.LatLngBounds(sw, ne);
};


TrackboxMap.prototype._setOverlayControl = function() {
	var div = document.createElement('div');
	div.index = 1;

	var controlUI = document.createElement('div');
	controlUI.style.backgroundColor = '#fff';
	controlUI.style.border = '2px solid #fff';
	controlUI.style.borderRadius = '2px';
	controlUI.style.boxShadow = '0 1px 4px -1px rgba(0,0,0,.3)';
	controlUI.style.cursor = 'pointer';
	controlUI.style.marginTop = '24px';
	controlUI.style.marginRight = '10px';
	controlUI.style.padding = '10px';
	controlUI.style.textAlign = 'center';
	controlUI.style.color = '#37474f';
	controlUI.style.fontSize = '11px';
	controlUI.style.position = 'relative';
	controlUI.style.display = 'block';
	controlUI.innerHTML = this._def.name;
	
	if (this._retina) controlUI.style.padding = '9px 6px';

    this.controlUI = controlUI;
	div.appendChild(controlUI);

	var self = this;
	controlUI.addEventListener('click', function() {
		self._toggle();
	});

	this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(div);
};


TrackboxMap.prototype._toggle = function() {
	if (this._show){
		if (this._waypoint) this._waypoint.showZoomgt(13);
		this.map.overlayMapTypes.removeAt(0);
        this.controlUI.style.color = '#b0bec5';
	}else{
		if (this._waypoint) this._waypoint.showZoomgt(15);
		this.map.overlayMapTypes.insertAt(0, this);
        this.controlUI.style.color = '#37474f';
	}
	this._show = !this._show;
};

TrackboxMap.prototype.showCurrentPosition = function() {
	if (this._currentPosition){
		this._showCurrentPosition();

	}else if (!this._watchId){
		var self = this;
		this._watchId = navigator.geolocation.watchPosition(
			function(pos) {
                console.log(pos);
				self._showCurrentPosition(pos);
			},
			function(err) {
				alert(err.message);
			},
			{
				enableHighAccuracy: false,
				timeout: 30000,
				maximumAge: 0
			}
		);
	}
};

TrackboxMap.prototype._showCurrentPosition = function(pos) {
	if (!pos){
		if (this._currentPosition) this.map.panTo(this._currentPosition);
		return;
	}

	var position = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
	this._currentPosition = position;
	
	if (!this._currentPosMarker) {
        var image = {
            url: 'img/position-icon.png',
            scaledSize: new google.maps.Size(40, 38),
            anchor: new google.maps.Point(20, 19)
        };

		this._currentPosMarker = new google.maps.Marker({
			position: position,
			map: this.map,
			icon: image
		});

		this.map.panTo(position);

	}else{
		this._currentPosMarker.setPosition(position);
	}

	if (this._goals){
	//	this._goals.updatePosition(position);
	}
};


function initTrackboxLongTouch() {
    TrackboxLongTouch.prototype = new google.maps.OverlayView();

    function TrackboxLongTouch(map, goals) {
        this.map = map;
        this._goals = goals;
        this.setMap(map);
    };

    TrackboxLongTouch.prototype.onAdd = function() {};
    TrackboxLongTouch.prototype.draw = function() {};
    TrackboxLongTouch.prototype.onRemove = function() {};

    TrackboxLongTouch.prototype.getLatLng = function(x, y) {
        return this.getProjection().fromContainerPixelToLatLng(new google.maps.Point(x, y));
    };

    TrackboxLongTouch.prototype.show = function(x, y) {
        var pos = this.getLatLng(x, y);
        var marker = new google.maps.Marker({
            position: pos,
            map: this.map
        });

        var digit = this._goals._getDigit(pos.lat(), pos.lng());

        $("#waypoint-info-name").text(digit);
        $("#waypoint-info-add").attr("name", digit);
        $("#waypoint-info-href").attr("href", "http://maps.google.com/maps?q="+ pos.lat() +","+ pos.lng());
        $("#waypoint-info").openModal({
            complete: function(){ marker.setMap(null); }
        });	
        $("#waypoint-info-add").click(function(){
            marker.setMap(null);
        });
    };
}

