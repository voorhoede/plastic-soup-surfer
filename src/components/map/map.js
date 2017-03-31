/*
    How to calibrate (georeference) image:

    - map overlay should be around 1860 pixels wide (holland in the image has the same size as holland in g maps at zoom level 6)
    - put google maps below the image
    - drag google maps so that holland in overlay is on top of holland in g maps
    - use map.getCenter().toString() to get the map center;
*/

import FlatMercatorViewport from 'viewport-mercator-project';
import Promise from 'promise-polyfill';
import debug from './mapDebug';
 
//constants  
const zoom = 6;
const center = {lat: 50.23784910180976, lng : 10.799029296875009};
const mapSize = [960, 544]; //map size at desktop
const liveMapElement = document.getElementById("live-map");

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

    return {
        addMarker({lat, lng, extraClassName = ""}) {
            const [x,y] = projector.project([lng, lat]);

            const marker = document.createElement("div");
            marker.style.left = x + "px";
            marker.style.top = y + "px";
            marker.className = "map__marker " + extraClassName;

            el.appendChild(marker);
        }
    }
}

if(liveMapElement) {
    const map = createMap(liveMapElement);

    loadMapData().then(mapData => {
        mapData.items.map(data => {
            map.addMarker(data.loc);
        });

        const {lat, lng} = mapData.currentLocation;
        map.addMarker({extraClassName : "map__marker--current", lat, lng});
    });
}