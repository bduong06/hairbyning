import {
    ConnectionAbortedError,
    ConnectionLostError,
    RPCError,
    rpc,
    rpcBus,
} from "../addons/web/static/src/core/network/rpc.js";

import available_time_slots from "./views/available_time_slots.js";
import requested_date_slots  from "./views/requested_date_slots.js";
import appointment_form  from "./views/appointment_form.js";

function whenReady(fn) {
    return new Promise(function (resolve) {
        if (document.readyState !== "loading") {
            resolve(true);
        }
        else {
            document.addEventListener("DOMContentLoaded", resolve, false);
        }
    }).then(fn || function () { });
}

whenReady().then(() => {

    const reviewsCarousel = new bootstrap.Carousel('#reviewsCarousel', {
        ride: 'carousel'
    });

    const carouselElm = document.getElementById('galleryCarousel');
    const galleryCarousel = new bootstrap.Carousel(carouselElm, {
        ride: false,
        interval: 0
    });

    document.querySelectorAll('#portfolio a').forEach((elm, index) => {
    elm.addEventListener('click', event => {
        event.preventDefault();

        galleryCarousel.to(index);
    })
    });
    
    
    const galModalElm = document.getElementById('galleryModal');
    galModalElm.addEventListener('hide.bs.modal', () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }); 

    const colNavbarElm = document.getElementById('colNavbar');
    colNavbarElm.querySelectorAll('.nav-link').forEach((elm, index) => {
        elm.addEventListener('click', event => {
            if (colNavbarElm.classList.contains('show')) {
                bootstrap.Collapse.getInstance(colNavbarElm).toggle();
            }
        })
    });

    document.getElementById('location-select').addEventListener("change", function(event) {
        event.preventDefault();

        const dataGroup = this.value;
        const serviceSelect = document.getElementById('service-select');
        const capacitySelect = document.getElementById('capacity-select');
        for (const option of serviceSelect.options) {
            if(option.dataset.group !== undefined) {
                if(option.dataset.group == dataGroup) {
                    option.classList.remove('d-none');
                } else {
                    option.classList.add('d-none');
                }
            } 
        };
        for (const option of capacitySelect.options) {
            if(option.dataset.group !== undefined) {
                if(option.dataset.group == dataGroup) {
                    option.classList.remove('d-none');
                } else {
                    option.classList.add('d-none');
                }
            } 
        };
    });

    document.getElementById('select-booking-options').addEventListener("submit", async function(event) {
        event.preventDefault();

//        const form = document.getElementById('select-booking-options');
        const formElements = this.elements;
        const serviceSelect = formElements["service"];
        const date = formElements["date"].value;
        const asked_capacity = formElements["capacity"].value;
        try {
            const params = {
                'date': encodeURIComponent(date),
                'asked_capacity': encodeURIComponent(asked_capacity)
            }
            const response = await rpc('/hbn/appointment/' + encodeURIComponent(serviceSelect.value), params);
            showAvailableTimeSlots(date,response);
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    });

    const elem = document.getElementById('date-select');
    const datepicker = new Datepicker(elem, {
        buttonClass: 'btn', 
        autohide: true,
        format: "yyyy-mm-dd"
     }); 

     document.getElementById('continue-fb-login').addEventListener('click', function(){
        FB.login(function(response) {
            if (response.status === 'connected') {
                // Logged into your webpage and Facebook.
            } else {
                // The person is not logged into your webpage or we are unable to tell. 
            }
        },{scope: 'public_profile,email'});
     });
});

(async function startOdooApp() {

/*    try {

        const params = {
            "login": "admin",
            "db": "bduongdb",
            "password": "Odi4ever!"
        }
        const response = await rpc('/web/session/authenticate', params);
        console.log("JSON-RPC Response:", response);
    } catch (error) {
        console.log("JSON-RPC Error authenticating:", error.data);
    }*/

    try {
        const response = await rpc('/hbn/appointment');
        prepare_selects(response);
    } catch (error) {
        console.log("JSON-RPC Error:", error);
    }

})();

window.fbAsyncInit = function() {
    FB.init({
    appId      : '763714192774133',
    cookie     : true,                     // Enable cookies to allow the server to access the session.
    xfbml      : true,                     // Parse social plugins on this webpage.
    version    : 'v23.0'           // Use this Graph API version for this call.
    });
};



// Example starter JavaScript for disabling form submissions if there are invalid fields
/*(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
            event.preventDefault()
            event.stopImmediatePropagation()
        }

        form.classList.add('was-validated')
        }, false)
  })
})()*/


function prepare_selects(response) {

    var locationSelect = document.getElementById('location-select');
    var serviceSelect = document.getElementById('service-select');
    var capacitySelect = document.getElementById('capacity-select');
    var arr = Object.keys(response);

    for (const [key, location] of Object.entries(arr)) {
        var locationOption = new Option(location, key);
        var capacity;
        locationOption.setAttribute('data-group', key);
        locationSelect.options[locationSelect.options.length] = locationOption;
        for (const [key1, service] of Object.entries(response[location])) {
            var serviceOption = new Option(service.name, service.id);
            serviceOption.setAttribute('data-group', key);
            serviceOption.classList.add('d-none');
            serviceSelect.options[serviceSelect.options.length] = serviceOption;
            capacity = service.max_capacity;
        }
        for (let i = 1; i <= capacity; i++) {
            var capacityOption = new Option(i, i);
            capacityOption.setAttribute('data-group', key);
            capacityOption.classList.add('d-none');
            capacitySelect.options[capacitySelect.options.length] = capacityOption;
        }
    }

}

function showAvailableTimeSlots(date, response) {
    let startIndex = response.slots.findIndex(slot => slot.slots.length > 0);

    const availableSlots = response.slots.slice(startIndex);
    const selectedDateIndex = availableSlots.findIndex(slot => slot.day == date);

    if(selectedDateIndex - 2 >= 0){
        startIndex = selectedDateIndex - 2; 
    } else {
        startIndex = 0; 
    }

    let html = ejs.render(available_time_slots, {
        date: date, 
        asked_capacity: response['asked_capacity'],
        location: response['location'],
        appointment_type_id: response['appointment_type_id'],
        availableSlots: availableSlots,
        requestedDateSlots: availableSlots[selectedDateIndex].slots,
        startIndex: startIndex
    })

    document.getElementById('booking-modal-content').innerHTML = html;

    const elem = document.getElementById('slots-datepicker');
    const datepicker = new Datepicker(elem, {
        buttonClass: 'btn', 
        autohide: true , 
        datesDisabled: isDateDisabled,
        updateOnBlur: false,
        format: 'yyyy-mm-dd',
        defaultViewDate: date
    }); 

    document.getElementById('slots-datepicker').addEventListener('changeDate', (event) => {
        event.preventDefault();
        event.target.value = null;
        const selectedDate = event.detail.date;
        const tabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
        tabList.forEach(function(tab, index){
            const date = new Date(tab.dataset.slotDate);
            date.setHours(0,0,0,0);
            if(selectedDate.getTime() === date.getTime()){
                const event = new MouseEvent("click", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                showAvailableTimeSlotsTabs(tabList, index);
                tab.dispatchEvent(event);
            }
        })
    })

    var triggerTabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));

    triggerTabList.forEach(function (triggerEl) {
        var tabTrigger = new bootstrap.Tab(triggerEl);
        triggerEl.addEventListener('click', function (event) {
            event.preventDefault();
            if(!this.classList.contains('active')){
                document.getElementById('current-slot-date').innerHTML = this.dataset.slotDate;
                html = ejs.render(requested_date_slots, {requestedDateSlots: JSON.parse(this.dataset.availableSlots) });
                document.getElementById('available-time-slots-container').innerHTML = html;
                document.getElementById('available-time-slots-container').querySelectorAll('button').forEach((elm) => (
                    elm.addEventListener('click', (event) => {
                        event.preventDefault();
                        selectTimeSlot(event);
                    })
                ))
                tabTrigger.show();
            }
        })
    })

    document.getElementById('nav-control-prev').addEventListener('click', (event) => {
        event.preventDefault();

        const elm = event.target;
        let tabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
        let index = parseInt(elm.dataset.startIndex);

        for(let i=0; i < 7; i++){
            tabList[index + i].classList.add('d-none');
        }

        index = (index - 7) < 0 ? 0 : index = index - 7;

        for(let i=0; i < 7; i++){
            tabList[index + i].classList.remove('d-none');
        }
        elm.dataset.startIndex = index;
        document.getElementById('nav-control-next').dataset.startIndex = index;
    })

    document.getElementById('nav-control-next').addEventListener('click', (event) => {
        event.preventDefault();

        const elm = event.target;
        let tabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
        let index = parseInt(elm.dataset.startIndex);

        for(let i=0; i < 7; i++){
            tabList[index + i].classList.add('d-none');
        }

        index = index + 14 > tabList.length ? tabList.length -7 : index + 7;

        for(let i=0; i < 7; i++){
            tabList[index + i].classList.remove('d-none');
        }
        elm.dataset.startIndex = index;
        document.getElementById('nav-control-prev').dataset.startIndex = index;
    })

    document.getElementById('available-time-slots-container').querySelectorAll('button').forEach((elm) => (
        elm.addEventListener('click', (event) => {
            event.preventDefault();
            selectTimeSlot(event);
        })
    ))

    const availableTimeSlotsModal = new bootstrap.Modal('#show-available-time-slots', {keyboard: false});
    availableTimeSlotsModal.show();
}

function isDateDisabled(date, viewId, rangeEnd){
    let dateDisabled = true;
    const tabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
    const firstDate = new Date(tabList[0].dataset.slotDate);
    const lastDate = new Date(tabList[tabList.length - 1].dataset.slotDate);
    firstDate.setHours(0,0,0,0);
    lastDate.setHours(0,0,0,0);
    if((date.getTime() >= firstDate.getTime()) &&  (date.getTime() <= lastDate)){
        dateDisabled = false;
    }

    return dateDisabled;
}

function showAvailableTimeSlotsTabs(tabList, startIndex){
    let index = parseInt(document.getElementById('nav-control-next').dataset.startIndex);

    for(let i=0; i < 7; i++){
        tabList[index + i].classList.add('d-none');
    }

    index = startIndex - 2 < 0 ? 0 : startIndex -2;
    for(let i=0; i < 7; i++){
        tabList[index + i].classList.remove('d-none');
    }

    document.getElementById('nav-control-next').dataset.startIndex = index;
    document.getElementById('nav-control-prev').dataset.startIndex = index;
}

async function selectTimeSlot(event){
    event.preventDefault();
    const elements = document.getElementById('time_slots_form').elements;
    const searchParams = new URLSearchParams(decodeURIComponent(event.target.dataset.urlParameters));
    let params = {
        "schedule_based_on": encodeURIComponent(elements['schedule_based_on'].value),
        "assign_method": encodeURIComponent(elements['assign_method'].value)
    };

    for (const [key, value] of searchParams.entries()) {
        params[`${key}`] = encodeURIComponent(value);
    }

    try {
        const response = await rpc('/hbn/appointment/' + encodeURIComponent(elements['appointment_type_id'].value) + '/info', params);
        showBookingForm(response);
    } catch (error) {
        console.log("JSON-RPC Error:", error);
    }

}

function showBookingForm(response){
    let html = ejs.render(appointment_form, {
        'date_locale': response['date_locale'],
        'asked_capacity': response['asked_capacity'],
        'location': "Location",
        'duration': response['duration'],
        'datetime_str': response['datatime_str'],
        'duration_str': response['duration_str'],
        'available_resource_ids': response['available_resource_ids'],
    })

    document.getElementById('booking-modal-content').innerHTML = html;
}