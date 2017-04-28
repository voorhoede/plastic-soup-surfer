import Flickity from 'flickity';

const carouselElement = document.querySelector('[data-carousel]');

const carousel = new Flickity(carouselElement, { 
    "cellAlign": "left", 
    "contain": true, 
    "pageDots": false, 
    "groupCells": true 
});

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
    const postContainer = document.createElement("div");
    postContainer.innerHTML = posts;
    newPosts = postContainer.children;
}

function loadNextItems() {
    if(!nextId) {
        return;
    }

    loading = true;

    loadCarouselData(nextId, 12)
        .then(data => {
            nextId = data.next;
            appendNewPosts(data.posts);
        });
}

carousel.on('settle', () => {
    if(newPosts) {
        //console.log('append');
        carousel.append(newPosts);
        newPosts = null;
        loading = false;
    }
});

carousel.on('scroll', progress => {
    const itemIndex = progress * carousel.cells.length;
    if(itemIndex >= carousel.cells.length - 6 && !loading) {
        //console.log('load');
        loadNextItems();
    }
});