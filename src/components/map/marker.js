import FlatMercatorViewport from './flat-mercator-viewport';

export default class Marker {
    constructor(projector, {lat, lng, mapSize, extraClassName = "", clickHandler = null}) {
        this.mapSize = mapSize;
        this.projector = projector;

        this.el = document.createElement("div");
        this.el.className = "map__marker " + extraClassName;
        
        if(clickHandler) {
            this.el.addEventListener("click", () => {
                clickHandler(this);
            });
        }

        this.location = {lat, lng};
    }

    get location() {
        return this._location;
    }

    set location({lat, lng}) {
        this._location = {lat, lng};

        const [mapWidth, mapHeight] = this.mapSize;
        const [x,y] = this.projector.project([lng, lat]);
        this.el.style.left = ((x/mapWidth) * 100) + "%";
        this.el.style.top = ((y/mapHeight) * 100) + "%";
    }

    appendTo(el) {
        el.appendChild(this.el);
    }
}