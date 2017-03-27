
const apiKey = "AIzaSyAz8MW3kClPmeZ9SSrk3sRbFnyHOuz21yc";

function loadGmap(callback) {
    window.__gmapCallback = callback;

    const script = document.createElement("script");
    script.defer = true;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__gmapCallback`;
    document.body.appendChild(script);
}

function initializeLiveMap(el) {
    //1. always keep current route in focus
    //2. put overlay on top of map
    //3. show the latest location

    const gmap = new google.maps.Map(el, {
        center: {lat: -34.397, lng: 150.644},
        zoom: 8
    });
}

const liveMapElement = document.getElementById("live-map");
if(liveMapElement) {
    loadGmap(function () {
        initializeLiveMap(liveMapElement);   
    });
}