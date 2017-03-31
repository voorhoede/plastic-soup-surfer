const apiKey = "AIzaSyAz8MW3kClPmeZ9SSrk3sRbFnyHOuz21yc";

function loadGmap(callback) {
    window.__gmapCallback = callback;

    const script = document.createElement("script");
    script.defer = true;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__gmapCallback`;
    document.body.appendChild(script);
}

function initializeLiveMap(el, {center, zoom}) {
    const map = new google.maps.Map(el, {
        center,
        zoom,
        mapTypeControl: false,
        streetViewControl : false
    });

    return map;
}

export default function (el, options) {
    const gmap = document.createElement('div');
    gmap.style.cssText = 'position:absolute; left:0; top:0; width:100%; height:100%;'
    el.insertBefore(gmap, el.firstChild);

    el.classList.add('map--debug');

    loadGmap(function () {
        window.map = initializeLiveMap(gmap, options);
    });
} 