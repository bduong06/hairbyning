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
import User from "./models/user.js";
import { State } from "./models/state.js";


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

const user = new User();
const state = new State('HBN');

(async function startBookingApp(){

    let available_appointments = null;
    try {
        available_appointments = await rpc('/hbn/appointment');
    } catch (error) {
        console.log("JSON-RPC Error:", error);
    }

    await whenReady();

    bootstrap_init();

    bookingOptionsView.update(available_appointments);

    if(state.isRedirected()){
        state.restore();
        if(state.urlParameters){
            continuePreviousBooking();
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

async function handleBookingOptionsSubmit(event){
    event.preventDefault();
    const date = this.elements['date'].value;
    bookingOptionsModel.formElements = this.elements;
    timeSlotsView.show();
    const response = await bookingOptionsModel.submit();
    response.date = date;
    timeSlotsView.data = response;
    timeSlotsView.render();
}

async function handleSelectTimeSlot(event){
    if(event.target.hasAttribute('data-url-parameters')){
        state.formElements = document.getElementById('time_slots_form').elements;
        state.urlParameters = event.target.dataset.urlParameters;
        timeSlotsView.hide();
        termsConditionsView.render();
    }

}

async function handleContinueBooking(event){
    switch(event.target.id){
        case "continue-no-login":
            timeSlotsModel.urlParameters = state.urlParameters;
            timeSlotsModel.formElements = state.formElements;
            bookingFormView.show();
            const response = await timeSlotsModel.selectTimeSlot();
            bookingFormView.data = response;
            bookingFormView.render();
            bookingFormView.installHandlers([{
                target: 'booking-form',
                event: 'submit',
                handler: handleBookingFormSubmit
            }]);
            break;
        case "continue-fb-login":
//            saveCurrentState(urlParameters, formElements);
            break;
        case "continue-line-login":
            event.preventDefault();
            user.oauth = new LineOauth();
            state.oauth = user.oauth;
            state.save();
            user.login();
            break;
        case "continue-logged-in-btn":

    }
}

async function handleBookingFormSubmit(event) {
        event.preventDefault()
        bookingFormModel.formElements = document.getElementById('booking-form').elements;
        confirmBookingView.show();
        const response = bookingFormModel.submit();
        confirmBookingView.data = response;
        confirmBookingView.render();
}

async function continuePreviousBooking(){
    timeSlotsModel.urlParameters = state.urlParameters;
    timeSlotsModel.formElements = state.formElements;
    bookingFormView.show();
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
