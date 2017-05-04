const DONATION_PROGRESS__VISUAL = '[data-donation-progress--visual]';

const donationProgressVisual = document.querySelector(DONATION_PROGRESS__VISUAL)

if (donationProgressVisual) {
    const donationProgressVisualTop = donationProgressVisual.offsetTop,
          documentHeight = window.innerHeight;

    if (window.innerWidth >= 768) {
      window.addEventListener('scroll', function() {
          if(donationProgressVisual.classList.contains('open')) return
          let scrollFromTop = document.body.scrollTop || document.documentElement.scrollTop

          if (scrollFromTop >= donationProgressVisualTop - (documentHeight/3)*2) {
              donationProgressVisual.classList.add('open')
          }
      })
    }
}
