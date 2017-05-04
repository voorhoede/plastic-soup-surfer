const DONATE_FORM_SELECTOR = "[data-donate-form]";
const DONATE_TOTAL_SELECTOR = "[data-total]";

function initializeDonateForm(form) {
    const extraField = form.elements.extra;
    const donateTotal = form.querySelector(DONATE_TOTAL_SELECTOR);

    donateForm.addEventListener('keydown', e => {
        if([8, 188, 190, 13, 39, 37, 9, 82].indexOf(e.keyCode) > -1) {
            return;
        } 

        const char = String.fromCharCode( e.keyCode );
        if(!char.match(/[0-9]/)) {
            e.preventDefault();
        }
    });

    function updateTotal() {
        let extra = parseFloat( extraField.value.replace(',', '.') );
        if(isNaN(extra)) {
            extra = 0;
        }

        const total = extra + 5;

        let currency;
        if(total !== Math.floor(total)) { //value with decimal
            currency = total.toFixed(2).toString().replace('.', ',');
        }
        else {
            currency = total + ",-";
        }

        donateTotal.textContent = `€ ${currency}`;
    }
    
    donateForm.addEventListener('input', updateTotal);
    updateTotal();
}

const donateForm = document.querySelector(DONATE_FORM_SELECTOR);
if(donateForm) {
    initializeDonateForm(donateForm);
}