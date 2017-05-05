export default function scrollPastPoint(element, addClass, addAfterPercentage = 0.5) {
    const documentHeight = window.innerHeight;

    window.addEventListener('scroll', onScrollPastPoint)

    function onScrollPastPoint() {
        if(element.classList.contains(addClass)) window.removeEventListener('scroll', onScrollPastPoint)

        let scrollFromTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop,
            bodyRect = document.body.getBoundingClientRect(),
            elemRect = element.getBoundingClientRect(),
            offset   = elemRect.top - bodyRect.top;

        if (scrollFromTop >= offset - documentHeight*addAfterPercentage) {
            element.classList.add(addClass)
        }
    }
}
