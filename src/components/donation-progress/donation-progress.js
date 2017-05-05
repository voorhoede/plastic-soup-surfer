const DONATION_PROGRESS__VISUAL = '[data-donation-progress--visual]';

const donationProgressVisual = document.querySelector(DONATION_PROGRESS__VISUAL)

if (donationProgressVisual) {
    const donationProgressVisualTop = donationProgressVisual.offsetTop,
          documentHeight = window.innerHeight;

    window.addEventListener('scroll', showWarrants)

    function showWarrants() {
        if(donationProgressVisual.classList.contains('open')) window.removeEventListener('scroll', showWarrants)

        let scrollFromTop = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop,
            bodyRect = document.body.getBoundingClientRect(),
            elemRect = donationProgressVisual.getBoundingClientRect(),
            offset   = elemRect.top - bodyRect.top;

        if (scrollFromTop >= offset - (documentHeight/3)*2) {
            donationProgressVisual.classList.add('open')
        }
    }
}
