const zoom = 6;

const center = {lat: 49.89936493298099, lng : 11.831744140625009};

const styles = [
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "hue": "#60ff00"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "weight": "6.73"
            },
            {
                "visibility": "on"
            },
            {
                "lightness": "-18"
            },
            {
                "invert_lightness": true
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "weight": "2.75"
            },
            {
                "hue": "#faff00"
            }
        ]
    }
]

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

    const map = new google.maps.Map(el, {
        center,
        zoom,
        styles,
        mapTypeControl: false,
        streetViewControl : false
    });

     var kmlLayer = new google.maps.KmlLayer({
         url : 'http://4d5b2310.ngrok.io/assets/kml/rhine.kml',
         suppressInfoWindows: true,
         preserveViewport: true,
         map
    });

    window.map = map;

    return map;
}

function loadMapData(map, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
            const mapData = JSON.parse(xhr.responseText);
            
            const markers = mapData.items.map(item => {
                const {lat,lon} = item.loc;

                return new google.maps.Marker({
                    position: new google.maps.LatLng(lat, lon),
                    label: "",
                    map
                });
            });
        }
    }
    xhr.open("GET", "/api/map/data");
    xhr.send();
}

const liveMapElement = document.getElementById("live-map");
if(liveMapElement) {
    loadGmap(function () {
        const map = initializeLiveMap(liveMapElement);
        loadMapData(map, function () {

        });
    });
}