import scrollPastPoint from '../../scrollPastPoint';

const HERO__PLASTIC_SURFER_IMAGE = '[data-hero--image]';

const heroPlasticSurferImage = document.querySelector(HERO__PLASTIC_SURFER_IMAGE);

if (heroPlasticSurferImage)
    scrollPastPoint(heroPlasticSurferImage, 'open', .5)
