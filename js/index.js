import {
    ConnectionAbortedError,
    ConnectionLostError,
    RPCError,
    rpc,
    rpcBus,
} from "../addons/web/static/src/core/network/rpc.js";

const dbName= 'bduongdb';

import BookingOptionsModel from "./models/booking_options.js";
import BookingOptionsView from "./views/booking_options.js";
import TimeSlotsModel from "./models/time_slots.js";
import TimeSlotsView from "./views/time_slots.js";
import TermsConditionsView from "./views/terms_condition.js";
import whenReady from "./whenready.js";
import BookingFormView from "./views/booking_form.js";
import BookingFormModel from "./models/booking_form.js";
import ConfirmBookingView from "./views/confirm_booking.js";
import State from "./models/state.js";
import getOauthProvider from "./models/oauth.js"


const bookingOptionsModel = new BookingOptionsModel(rpc);

const bookingOptionsView = new BookingOptionsView([{
    target: 'select-booking-options',
    event: 'submit',
    handler: handleBookingOptionsSubmit 
}]);

const timeSlotsModel = new TimeSlotsModel(rpc);
const timeSlotsView = new TimeSlotsView([{
            target: 'booking-modal-body-content',
            event: 'click',
            handler: handleSelectTimeSlot
        }]);

const termsConditionsView = new TermsConditionsView([{
    target: 'terms-conditions-modal',
    event: 'click',
    handler: handleContinueBooking
}]);

const bookingFormModel = new BookingFormModel(rpc);
const bookingFormView = new BookingFormView();

const confirmBookingView = new ConfirmBookingView([{
    target: 'booking-modal-body-content',
    event: 'click',
    handler: handleLogout
}]);

const state = new State('HBN');

(async function startBookingApp(){

    const queryString = window.location.search;
    checkLoginState();

    await whenReady();

    bootstrap_init();

    if(queryString.includes('liffClientId')){
//        window.history.replaceState({}, document.title, window.location.pathname);
        bookingOptionsModel.formElements = bookingOptionsView.restore();
        bookingOptionsSubmit();
    } else {
        try {
            const available_appointments = await rpc('/hbn/appointment');
            bookingOptionsView.update(available_appointments);
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    }


/*     document.getElementById('continue-fb-login').addEventListener('click', function(){
        FB.login(function(response) {
            if (response.authResponse) {
                authSignin(response.authResponse);
//                checkLoginState();
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, {scope: 'email,public_profile'});
     });*/
})();

async function checkLoginState(){
    const authLoggedIn = state.authLoggedIn;
    if(authLoggedIn) {
        const authProvider = getOauthProvider(authLoggedIn);
        authProvider.init();
    }
}

function handleBookingOptionsSubmit(event){
    event.preventDefault();
//    const date = this.elements['date'].value;
    bookingOptionsModel.formElements = this.elements;
    state.optionsFormElements = this.elements;
    termsConditionsView.render();
}

async function bookingOptionsSubmit(){
    timeSlotsView.show();
    const response = await bookingOptionsModel.submit();
    timeSlotsView.data = response;
    timeSlotsView.render();
}

async function handleSelectTimeSlot(event){
    if(event.target.hasAttribute('data-url-parameters')){
        timeSlotsModel.urlParameters = event.target.dataset.urlParameters;
        timeSlotsModel.formElements = this.querySelector('#time_slots_form').elements;
        bookingFormView.clear();
        const response = await timeSlotsModel.selectTimeSlot();
        bookingFormView.data = response;
        bookingFormView.render();
        bookingFormView.installHandlers([{
            target: 'booking-form',
            event: 'submit',
            handler: handleBookingFormSubmit
        }]);
    }
}

function handleContinueBooking(event){
    switch(event.target.id){
        case "continue-fb-login":
            event.preventDefault();
            const fbAuth = getOauthProvider('facebook');
            fbAuth.login(bookingOptionsSubmit);
            break;
        case "continue-line-login":
            event.preventDefault();
            const lineAuth = getOauthProvider('line');
            lineAuth.login();
            break;
        case "continue-no-login":
        case "continue-logged-in-btn":
            event.preventDefault();
            bookingOptionsSubmit();
            break;
    }
}

async function selectTimeSlot(){
    bookingFormView.show();
    const response = await timeSlotsModel.selectTimeSlot();
    bookingFormView.data = response;
    bookingFormView.render();
    bookingFormView.installHandlers([{
        target: 'booking-form',
        event: 'submit',
        handler: handleBookingFormSubmit
    }]);
}

async function handleBookingFormSubmit(event) {
        event.preventDefault()
        bookingFormModel.formElements = document.getElementById('booking-form').elements;
        confirmBookingView.show();
        const response = await bookingFormModel.submit();
        confirmBookingView.data = response;
        confirmBookingView.render();
}

async function continuePreviousBooking(){
    bookingFormView.show();
    timeSlotsModel.restore();
    const response = await timeSlotsModel.selectTimeSlot();
    bookingFormView.data = response;
    bookingFormView.render();
    bookingFormView.installHandlers([{
        target: 'booking-form',
        event: 'submit',
        handler: handleBookingFormSubmit
    }]);
    state.clear();
}

function handleLogout(event){

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
            const contModal = bootstrap.Modal.getInstance(document.getElementById('terms-condition-modal'));
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

function bootstrap_init(){
    document.getElementById('booking-modal').addEventListener('hide.bs.modal', () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }); 
    document.getElementById('terms-conditions-modal').addEventListener('hide.bs.modal', () => {
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
