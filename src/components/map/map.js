/*
    How to calibrate (georeference) image:

    - map overlay should be around 1860 pixels wide (holland in the image has the same size as holland in g maps at zoom level 6)
    - put google maps below the image
    - drag google maps so that holland in overlay is on top of holland in g maps
    - use map.getCenter().toString() to get the map center;
*/

import FlatMercatorViewport from './flat-mercator-viewport';
import Promise from 'promise-polyfill';
import debug from './mapDebug';
import Marker from './marker';
 
//constants  
const zoom = 6;
const center = {lat: 50.23784910180976, lng : 10.799029296875009};
const mapSize = [960, 544]; //map size at desktop
const liveMapElement = document.getElementById("live-map");

let contentMarkers = [];
let livePositionMarker = null;

//debug(liveMapElement, {zoom, center});

function loadMapData() {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if(xhr.readyState === 4) {
                const mapData = JSON.parse(xhr.responseText);
                return resolve(mapData);
            }
        }
        xhr.open("GET", "/api/map/data");
        xhr.send();
    });
}

function createMap(el) {
    const projector = new FlatMercatorViewport({
        tileSize : 256,
        longitude : center.lng,
        latitude : center.lat,
        zoom,
        width : mapSize[0],
        height : mapSize[1]
    });

    return Promise.resolve({
        addMarker(opts) {
            const marker = new Marker(projector, opts);
            marker.appendTo(el);
            return marker;
        }
    });
}

function addMapMarkers(map, mapData) {
    contentMarkers = mapData.items.map(data => map.addMarker(data.loc));

    const {lat, lng} = mapData.currentLocation;
    livePositionMarker = map.addMarker({extraClassName : "map__marker--current", lat, lng});
}

function initLiveFeed() {
    //TODO load polyfill for live data
    if(!window.EventSource) {
        return;
    }

    const sse = new EventSource('/api/map/live');
    sse.addEventListener("live_position", ({data}) => {
        data = JSON.parse(data);
        console.log(data);

        livePositionMarker.location = data;
    }, false);
}

if(liveMapElement) {
    Promise.all([createMap(liveMapElement), loadMapData()])
        .then(([map, mapData]) => {
            addMapMarkers(map, mapData);
            initLiveFeed(); 
        });
}