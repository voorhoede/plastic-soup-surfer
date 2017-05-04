import FlatMercatorViewport from './flat-mercator-viewport';

export default class Marker {
    constructor(projector, {lat, lng, extraClassName = "", clickHandler = null}) {
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

        const [x,y] = this.projector.project([lng, lat]);
        this.el.style.left = x + "px";
        this.el.style.top = y + "px";
    }

    appendTo(el) {
        el.appendChild(this.el);
    }
}