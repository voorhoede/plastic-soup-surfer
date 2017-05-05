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
const center = {lat: 50.251900786108095, lng : 10.425494140625009};
const mapSize = [928, 544]; //map size at desktop
const liveMapElement = document.getElementById("live-map");
let mapInfoPanel;

let contentMarkers = [];
let livePositionMarker = null;

//debug(liveMapElement, {zoom, center});

/**
 * Load the map data
 */
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

/**
 * Creates the map instance (currently only has one method: addMarker)
 * @param {DOMElement} el 
 */
function createMap(el) {
    const markerContainer = document.createElement('div');
    markerContainer.className = "map__marker-container";
    el.appendChild(markerContainer);

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
            marker.appendTo(markerContainer);
            return marker;
        }
    });
}

/**
 * Display the info panel with given marker data
 * @param {*} data 
 */
function displayInfoPanel(data) {
    const currentInfoPanel = document.querySelector('.social-card');

    const infoPanelParent = currentInfoPanel.parentNode;

    if(currentInfoPanel) {
        infoPanelParent.removeChild(currentInfoPanel);
    }

    const temp = document.createElement("div");
    temp.innerHTML = data.html;

    mapInfoPanel = temp.firstElementChild;

    infoPanelParent.appendChild(mapInfoPanel);
}

/**
 * Adds the markers to the given map instance
 * @param {*} map 
 * @param {*} mapData 
 */
function addMapMarkers(map, mapData) {

    //the content markers (highlighted post & events)
    contentMarkers = mapData.items.map(data => {
        return map.addMarker(Object.assign(
            data.loc, 
            {
                mapSize,
                extraClassName : "map__marker--" + data.type,
                clickHandler : marker => {
                    displayInfoPanel(data);
                }
            }
        ));
    });

    //adds the live marker only when phase === june
    if(window.PHASE === "june") {
        const {lat, lng} = mapData.currentLocation;
        livePositionMarker = map.addMarker({extraClassName : "map__marker--current", mapSize, lat, lng});
    }
}

/**
 * Init the live feed connection
 */
function initLiveFeed() {
    //TODO load polyfill for live data
    if(!window.EventSource) {
        return;
    }

    const sse = new EventSource('/api/map/live');
    sse.addEventListener("live_position", ({data}) => {
        data = JSON.parse(data);
        //console.log(data);

        livePositionMarker.location = data;
    }, false);
}

if(liveMapElement) {
    Promise.all([createMap(liveMapElement), loadMapData()])
        .then(([map, mapData]) => {
            addMapMarkers(map, mapData);

            //only start live feed when merijn starts supping
            if(window.PHASE === "june") {
                initLiveFeed(); 
            }
        });
}