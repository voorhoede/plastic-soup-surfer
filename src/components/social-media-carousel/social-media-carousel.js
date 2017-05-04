import Flickity from 'flickity';

const LOAD_COUNT = 24;
const LOAD_THRESHOLD = 12;

function initializeCarousel() {
    let nextId = carouselElement.getAttribute("data-carousel-next");
    let offsetIndex = 0;
    let newPosts;
    let loading = false;

    function loadCarouselData(offsetId, limit) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = () => {
                if(xhr.readyState === 4) {
                    const carouselData = JSON.parse(xhr.responseText);
                    return resolve(carouselData);
                }
            }
            xhr.open("GET", "/api/social-feed?offsetId=" + offsetId + "&limit=" + limit);
            xhr.send();
        });
    }

    function appendNewPosts(posts) {
        newPosts = posts.map(post => {
            const el = document.createElement('div');
            el.className = "carousel__cell";
            el.innerHTML = post;
            return el;
        });
    }

    function loadNextItems() {
        if(!nextId) {
            return;
        }

        loading = true;

        loadCarouselData(nextId, LOAD_COUNT)
            .then(data => {
                nextId = data.next;
                appendNewPosts(data.posts);
            });
    }

    const carousel = new Flickity(carouselElement, { 
        "cellAlign": "left", 
        "contain": true, 
        "pageDots": false, 
        "groupCells": true 
    });

    carousel.on('settle', () => {
        if(newPosts) {
            carousel.append(newPosts);
            newPosts = null;
            loading = false;
        }
    });

    carousel.on('scroll', progress => {
        const itemIndex = progress * carousel.cells.length;
        if(itemIndex >= carousel.cells.length - LOAD_THRESHOLD && !loading) {
            loadNextItems();
        }
    })
}

const carouselElement = document.querySelector('[data-carousel]');

if(carouselElement) {
    initializeCarousel();    
}