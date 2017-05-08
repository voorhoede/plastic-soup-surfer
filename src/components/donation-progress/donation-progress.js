import scrollPastPoint from '../../scrollPastPoint';

const DONATION_PROGRESS__VISUAL = '[data-donation-progress--visual]';

const donationProgressVisual = document.querySelector(DONATION_PROGRESS__VISUAL)

if (donationProgressVisual) 
    scrollPastPoint(donationProgressVisual, 'open', 0.66)
