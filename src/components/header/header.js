const MOBILE_MENU_ATTR = '[data-mobile-menu]';
const MOBILE_MENU_TRIGGER_ATTR = '[data-mobile-menu-toggle]';
const PROGRESS_BAR = '[data-progressbar]';
const PROGRESS_NUMBER = '[data-progressnumber]';

const menu = document.querySelector(MOBILE_MENU_ATTR)
const menuTrigger = document.querySelector(MOBILE_MENU_TRIGGER_ATTR);
const progressBar = document.querySelector(PROGRESS_BAR);
const progressnumber = document.querySelector(PROGRESS_NUMBER);

menuTrigger.addEventListener('click', function() {
	document.body.classList.toggle('menu-active');
	menu.classList.toggle('hidden');
})

if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }

    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

// document.referrer (check if previous location was same site)
// performance.nacigation.type is to check if the page was reloaded or not (1 being reloaded and 0 a different page)
if (!document.referrer.includes(window.location.hostname) && performance.navigation.type != 1 && window.innerWidth >= 768) {
	animateProgressbar(progressBar)
	animateNumber(progressnumber, 500, '%')
}


function animateProgressbar(bar) {
	let parent = bar.parentNode,
	parentWidth = parseInt(window.getComputedStyle(parent, null).getPropertyValue('width')),
	goToWidth = parseInt(window.getComputedStyle(bar, null).getPropertyValue('width')),
	unroundedPercentage = (goToWidth / parentWidth)*100,
	percentage = Math.round(unroundedPercentage * 10) / 10;

	bar.style.width = 0;

	setTimeout(function() {
		bar.style.transition = 'width 0.5s linear';
		bar.style.width = percentage + '%';
	}, 0);
}

function animateNumber(numText, ms, append = '') {
	let num = parseInt(numText.innerHTML),
	// let num = 100,
	counter = 0;

	let interval = setInterval(function () {

		numText.innerHTML = counter + append;

		if (counter == num) {
			console.log("clear");
			clearInterval(interval);
		}

		counter +=  1;

	}, ms/num);
}
