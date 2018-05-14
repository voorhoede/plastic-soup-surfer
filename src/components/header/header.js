const MOBILE_MENU_ATTR = '[data-mobile-menu]';
const MOBILE_MENU_TRIGGER_ATTR = '[data-mobile-menu-toggle]';

const menu = document.querySelector(MOBILE_MENU_ATTR)
const menuTrigger = document.querySelector(MOBILE_MENU_TRIGGER_ATTR);

menuTrigger.addEventListener('click', function() {
	document.body.classList.toggle('menu-active');
	menu.classList.toggle('hidden');
})
