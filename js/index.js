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
import whenReady from "./whenready.js";

const NAMESPACE = "HBN";

(async function startBookingApp(){

    if(readFromStorage('redirected')){
        getBookingForm();
    }

    try {
        const response = await rpc('/hbn/appointment');
        prepare_selects(response.appointment_types);
        //prepare_selects(response);
    } catch (error) {
        console.log("JSON-RPC Error:", error);
    }
})();

whenReady().then(() => {

    liff.init({liffId: '2007896254-Dkr9Yr56'});

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
            showAvailableTimeSlots(date,response.appointment);
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
            if (response.authResponse) {
                authSignin(response.authResponse);
//                checkLoginState();
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: 'email,public_profile'});
     });
/*     document.getElementById('continue-line-login').addEventListener('click', function(){
        liff.login(function(response) {
            if (response) {
            //    authSignin(response.authResponse);
//                checkLoginState();
                console.log('liff.login');
                console.log(response);
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: 'email,public_profile'});
     });*/
});


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

function testAPI() {                      // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
        console.log('Successful login for: ' + response.name);
        document.getElementById('login_status').innerHTML =
        'Thanks for logging in, ' + response.name + '!';
    });
}

async function checkLoginState() {               // Called when a person is finished with the Login Button.
    try {
        const response = await rpc('/web/session/get_session_info');
        statusChangeCallback(response.name);
    } catch (error) {
        statusChangeCallback(null);
    }
}

function statusChangeCallback(name) {  // Called with the results from FB.getLoginStatus().
    if(name){
        document.getElementById('login_status').innerHTML = name;
        document.getElementById('continue-login').className = "container d-none";
        document.getElementById('btn-continue').className = "container";
    } else {
        document.getElementById('login_status').innerHTML = 'Sign In';
        document.getElementById('continue-login').className = "container";
        document.getElementById('btn-continue').className = "container d-none";
    }
}

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

    if(readFromStorage('redirected')){
        const select_elements = document.getElementById('select-booking-options').elements;
        select_elements['location'].value = readFromStorage('location');
        select_elements['service'].value = readFromStorage('service');
        select_elements['capacity'].value = readFromStorage('capacity');
        select_elements['date'].value = readFromStorage('date');
        document.getElementById('booking').scrollIntoView();
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

    document.getElementById('booking-modal-body').innerHTML = html;

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
                document.getElementById('available-time-slots-container').querySelectorAll('button').forEach( (elm) => {
                    addEventListener(elm);
                })
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
    checkLoginState();
    document.getElementById('available-time-slots-container').querySelectorAll('button').forEach(
        (elm) => {
            addTimeSlotEventListener(elm)
        })
    const availableTimeSlotsModal = new bootstrap.Modal('#booking-modal', {keyboard: false});
    availableTimeSlotsModal.show();
}

function addTimeSlotEventListener(elm){
    elm.addEventListener('click', (event) => {
        event.preventDefault();
        const urlParameters = event.target.dataset.urlParameters;
        const contModal = document.getElementById('continue-booking-signin');
        contModal.addEventListener('shown.bs.modal', (event) => {
            if(document.getElementById('btn-continue').classList.contains('d-none'))
            {
              saveCurrentState(urlParameters);
            } 
        })
        const hiddenHandler = (event) => {
            if(!document.getElementById('btn-continue').classList.contains('d-none'))
            {
                selectTimeSlot(urlParameters);
            } 
        }
        contModal.addEventListener('hidden.bs.modal', hiddenHandler);
        document.getElementById('btn-continue-cancel').addEventListener('click', function(event){
            event.preventDefault();
            contModal.removeEventListener('hidden.bs.modal', hiddenHandler);
            clearStorage(); 
        })

    })
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

function saveCurrentState(urlParameters){
    const elements = document.getElementById('time_slots_form').elements;
    const searchParams = new URLSearchParams(decodeURIComponent(urlParameters));
    let params = {
        "schedule_based_on": encodeURIComponent(elements['schedule_based_on'].value),
        "assign_method": encodeURIComponent(elements['assign_method'].value)
    };
    for (const [key, value] of searchParams.entries()) {
        params[`${key}`] = encodeURIComponent(value);
    }
    let url = '/hbn/appointment/' + encodeURIComponent(elements['appointment_type_id'].value) + '/info';
    const select_elements = document.getElementById('select-booking-options').elements;
    writeToStorage('location', select_elements['location'].value);
    writeToStorage('service', select_elements['service'].value);
    writeToStorage('capacity', select_elements['capacity'].value);
    writeToStorage('date', select_elements['date'].value);
    writeToStorage('params', JSON.stringify(params));
    writeToStorage('url', url);
    writeToStorage('redirected', true);
}

async function getBookingForm(){
    let params = JSON.parse(readFromStorage('params'));
    let url = readFromStorage('url');
    try {
        const response = await rpc(url, params);
        showBookingForm(response);
    } catch (error) {
        console.log("JSON-RPC Error:", error);
    }
}

function showBookingForm(response){
    const partner_data = response['partner_data'];
    const name = partner_data != undefined ? partner_data.name : "";
    const email = partner_data != undefined ? partner_data.email : "";
    const phone = ((partner_data != undefined) && (partner_data.phone)) ? partner_data.phone : "";
    let html = ejs.render(appointment_form, {
        'date_locale': response['date_locale'],
        'asked_capacity': response['asked_capacity'],
        'location': "Location",
        'duration': response['duration'],
        'datetime_str': response['datetime_str'],
        'duration_str': response['duration_str'],
        'available_resource_ids': response['available_resource_ids'],
        'name': name,
        'email': email,
        'phone': phone,
        'id': response['appointment_type_id'],
        'csrf_token': response['csrf_token']
    })
    document.getElementById('booking-modal-body').innerHTML = html;
    document.getElementById('booking-modal-cancel').addEventListener('click', function(event){
        event.preventDefault();
        clearStorage();
    })
    document.getElementById('confirm-booking').addEventListener('click', async function(event){
        event.preventDefault();
        const elements = document.getElementById('booking-form').elements;
        try {
            const params = {};
            for(const input of elements){
                if(input.name.length > 0){
                    params[`${input.name}`] = input.value;
                }
            }
            let url = `/hbn/appointment/${params.id}/submit?csrf_token=${params.csrf_token}`;

           const response = await rpc(url, params);
           console.log('submit');
           console.log(response);
 //           showBookingForm(response);
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    })

    bootstrap.Modal.getOrCreateInstance(document.getElementById('booking-modal')).show();
}

async function authSignin(authResponse){
    var accessToken = authResponse.accessToken;
    var expiration_time = authResponse.data_access_expiration_time;  
    var expires_in = authResponse.expiresIn;
    try {
        const params = new URLSearchParams();
        params.append('access_token', encodeURIComponent(accessToken));
        params.append('data_access_expiration_time', encodeURIComponent(expiration_time));
        params.append('expires_in', encodeURIComponent(expires_in));
        //params.append('state', JSON.stringify({"d": "hairbyning-devdb", "p": 2, "r": encodeURIComponent('https://localodoo.hairbyning.com')}));
        params.append('state', JSON.stringify({"d": "hairbyning-devdb", "p": 2, "r": encodeURIComponent('https://localodoo.hairbyning.com')}));
        params.append('no_redirect', true);
        try {
            const response = await fetch(`/auth_oauth/signin?${params}`);
            const contModal = bootstrap.Modal.getInstance(document.getElementById('continue-booking-signin'));
            if(response.status == '200'){
                contModal.hide();
                console.log('auth_oauth/signin');
                console.log(response);
            }
            else {
                console.log(response);
            }
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }

    } catch (error) {
        console.log("JSON-RPC Error:", error);
    }
}

function createCsrfToken(csrfToken){
    document.getElementById('csrf_token').value = csrfToken;
}

async function selectTimeSlot(urlParameters){
    const elements = document.getElementById('time_slots_form').elements;
    const searchParams = new URLSearchParams(decodeURIComponent(urlParameters));
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

 
function writeToStorage(key, value) {
  const serializedData = localStorage.getItem(NAMESPACE);
  const data = serializedData ? JSON.parse(serializedData) : {};
  data[key] = value;
  localStorage.setItem(NAMESPACE, JSON.stringify(data));
}
 
function readFromStorage(key) {
  const serializedData = localStorage.getItem(NAMESPACE);
  const data = JSON.parse(serializedData);
  return data ? data[key] : undefined;
}

function clearStorage() {
  localStorage.setItem(NAMESPACE, JSON.stringify({}));
}
 
function removeItem(key) {
  const serializedData = localStorage.getItem(NAMESPACE);
  const data = serializedData ? JSON.parse(serializedData) : {};
  delete data[key];
  localStorage.setItem(NAMESPACE, JSON.stringify(data));
}