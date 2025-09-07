import {
    ConnectionAbortedError,
    ConnectionLostError,
    RPCError,
    rpc,
    rpcBus,
} from "../addons/web/static/src/core/network/rpc.js";

import BookingOptionsModel from "./models/booking_options.js";
import BookingOptionsView from "./views/booking_options.js";
import TimeSlotsModel from "./models/time_slots.js";
import TimeSlotsView from "./views/time_slots.js";
import TermsConditionView from "./views/terms_condition.js";
import appointment_form  from "./views/appointment_form.js";
import whenReady from "./whenready.js";
import BookingFormView from "./views/booking_form.js";

const NAMESPACE = "HBN";

const OptionsModel = new BookingOptionsModel(rpc);

const OptionsView = new BookingOptionsView([{
    target: 'select-booking-options',
    event: 'submit',
    handler: handleBookingOptionsSubmit 
}]);

const AvailableTimeSlotsModel = new TimeSlotsModel(rpc);
const AvailableTimeSlotsView = new TimeSlotsView([{
            target: 'booking-modal-body-content',
            event: 'click',
            handler: handleSelectTimeSlot
        }]);

const TermsAndConditionView = new TermsConditionView([{
    target: 'continue-booking-signin',
    event: 'click',
    handler: handleContinueBooking
}]);

const AppoinmentFormView = new BookingFormView([{
    target: 'booking-modal-body-content',
    event: 'submit',
    handler: handleBookingFormSubmit
}]);



(async function startBookingApp(){

    let available_appointments = null;
    try {
        available_appointments = await rpc('/hbn/appointment');
    } catch (error) {
        console.log("JSON-RPC Error:", error);
    }

//    liff.init({liffId: '2007896254-Dkr9Yr56'});
    await whenReady();

    bootstrap_init();

    OptionsView.update(available_appointments);

    if(readFromStorage('redirected')){
        getBookingForm();
    }

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
})();

async function handleBookingOptionsSubmit(event){
    event.preventDefault();
    const formElements = this.elements;
    const serviceSelect = formElements["service"];
    const date = formElements["date"].value;
    const asked_capacity = formElements["capacity"].value;
    const url = `/hbn/appointment/${encodeURIComponent(serviceSelect.value)}`;
    AvailableTimeSlotsView.show();
    const params = {
        'date': encodeURIComponent(date),
        'asked_capacity': encodeURIComponent(asked_capacity),
    }
    const response = await OptionsModel.submit(url,params);

    let startIndex = response.slots.findIndex(slot => slot.slots.length > 0);
    const availableSlots = response.slots.slice(startIndex);
    const selectedDateIndex = availableSlots.findIndex(slot => slot.day == date);

    if(selectedDateIndex - 2 >= 0){
        startIndex = selectedDateIndex - 2; 
    } else {
        startIndex = 0; 
    }

    AvailableTimeSlotsView.render({
        date: date, 
        asked_capacity: response['asked_capacity'],
        location: response['location'],
        appointment_type_id: response['appointment_type_id'],
        availableSlots: availableSlots,
        requestedDateSlots: availableSlots[selectedDateIndex].slots,
        startIndex: startIndex
    });

}


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

async function handleSelectTimeSlot(event){
    if(event.target.hasAttribute('data-url-parameters')){
        event.preventDefault();
        TermsAndConditionView.formElements = event.currentTarget.querySelector('#time_slots_form');
        TermsAndConditionView.urlParameters = event.target.dataset.urlParameters;
        AvailableTimeSlotsView.hide();
        TermsAndConditionView.render();
    }

}

async function handleContinueBooking(event){
    if(event.target.id === 'continue-no-login'){
        event.preventDefault();
        const urlParameters = TermsAndConditionView.urlParameters;
        const formElements = TermsAndConditionView.formElements;
        AppoinmentFormView.show();
        const response = await AvailableTimeSlotsModel.selectTimeSlot(urlParameters,formElements);
        AppoinmentFormView.data = response;
        AppoinmentFormView.render();
    }

}

async function handleBookingFormSubmit(event){
        event.preventDefault();
        const elements = document.getElementById('booking-form').elements;
        spinner.classList.remove('d-none');
        bookingModalContent.innerHTML = '';
        bookingModal.show();
        try {
            const params = {};
            params['csrf_token'] = document.getElementById('csrf_token').value;
            for(const input of elements){
                if(input.name.length > 0){
                    params[`${input.name}`] = input.value;
                }
            }
            let url = `/hbn/appointment/${params.id}/submit`;

           const response = await rpc(url, params);
           console.log('submit');
           console.log(response);
 //           showBookingForm(response);
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }

}

/*async function handleSelectTimeSlot(event){
    if(event.target.hasAttribute('data-url-parameters')){
        event.preventDefault();
        const urlParameters = event.target.dataset.urlParameters;
        const formElements = event.currentTarget.querySelector('#time_slots_form').elements;
        contModal.addEventListener('shown.bs.modal', (event) => {
            if(document.getElementById('btn-continue').classList.contains('d-none')){
                saveCurrentState(urlParameters, formElements);
            } 
            document.getElementById('continue-no-login').addEventListener('click', (event) => {
                event.preventDefault();
                clearStorage(); 
                selectTimeSlot(urlParameters, formElements);
            })
        })
        const hiddenHandler = (event) => {
            if(!document.getElementById('btn-continue').classList.contains('d-none')) {
                selectTimeSlot(urlParameters, formElements);
            } 
        }
        contModal.addEventListener('hidden.bs.modal', hiddenHandler);
        document.getElementById('btn-continue-cancel').addEventListener('click', function(event){
            contModal.removeEventListener('hidden.bs.modal', hiddenHandler);
            clearStorage(); 
        })
    }

}*/

function saveCurrentState(urlParameters, formElements){
    const searchParams = new URLSearchParams(decodeURIComponent(urlParameters));
    let params = {
        "schedule_based_on": encodeURIComponent(formElements['schedule_based_on'].value),
        "assign_method": encodeURIComponent(formElements['assign_method'].value)
    };
    for (const [key, value] of searchParams.entries()) {
        params[`${key}`] = encodeURIComponent(value);
    }
    let url = '/hbn/appointment/' + encodeURIComponent(formElements['appointment_type_id'].value) + '/info';
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
    params['csrf_token'] = document.getElementById('csrf_token').value;
    bookingModalContent.innerHTML = '';
    spinner.classList.remove('d-none');
    bookingModal.show();
    try {
        const response = await rpc(url, params);
        showBookingForm(response);
        spinner.classList.add('d-none');
    } catch (error) {
        spinner.classList.add('d-none');
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
    })
    bookingModalContent.innerHTML = html;
    document.getElementById('booking-modal-cancel').addEventListener('click', function(event){
        event.preventDefault();
        clearStorage();
    })
    document.getElementById('booking-form').addEventListener('submit', async function(event){
        event.preventDefault();
        const elements = document.getElementById('booking-form').elements;
        spinner.classList.remove('d-none');
        bookingModalContent.innerHTML = '';
        bookingModal.show();
        try {
            const params = {};
            params['csrf_token'] = document.getElementById('csrf_token').value;
            for(const input of elements){
                if(input.name.length > 0){
                    params[`${input.name}`] = input.value;
                }
            }
            let url = `/hbn/appointment/${params.id}/submit`;

           const response = await rpc(url, params);
           console.log('submit');
           console.log(response);
 //           showBookingForm(response);
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    })
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
        //params.append('state', JSON.stringify({"d": "bduongdb", "p": 2, "r": encodeURIComponent('https://localodoo.hairbyning.com')}));
        params.append('state', JSON.stringify({"d": "bduongdb", "p": 2, "r": encodeURIComponent('https://localodoo.hairbyning.com')}));
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

async function selectTimeSlot(urlParameters, formElements){
    const searchParams = new URLSearchParams(decodeURIComponent(urlParameters));
    bookingModalContent.innerHTML = '';
    spinner.classList.remove('d-none');
    bookingModal.show();
    try {
        const params = {};
        for (const [key, value] of searchParams.entries()) {
            params[`${key}`] = encodeURIComponent(value);
        }
        const response = await rpc('/hbn/appointment/' + encodeURIComponent(formElements['appointment_type_id'].value) + '/info', params);
        //showBookingForm(response);
        spinner.classList.add('d-none');
    } catch (error) {
        spinner.classList.add('d-none');
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

function bootstrap_init(){
    document.getElementById('booking-modal').addEventListener('hide.bs.modal', () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }); 
    document.getElementById('continue-booking-signin').addEventListener('hide.bs.modal', () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }); 

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

}