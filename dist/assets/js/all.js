;(function() {
"use strict";

var apiKey = "AIzaSyAz8MW3kClPmeZ9SSrk3sRbFnyHOuz21yc";

function loadGmap(callback) {
    window.__gmapCallback = callback;

    var script = document.createElement("script");
    script.defer = true;
    script.async = true;
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&callback=__gmapCallback";
    document.body.appendChild(script);
}

function initializeLiveMap(el) {
    var gmap = new google.maps.Map(el, {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
}

var liveMapElement = document.getElementById("live-map");
if(liveMapElement) {
    loadGmap(function () {
        initializeLiveMap(liveMapElement);   
    });
}
}());

//# sourceMappingURL=all.js.map
