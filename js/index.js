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
import appointment_form  from "./views/appointment_form.js";
import whenReady from "./whenready.js";
import BookingFormView from "./views/booking_form.js";
import BookingFormModel from "./models/booking_form.js";
import ConfirmBookingView from "./views/confirm_booking.js";

class User {
    constructor(rpc){
        this._profileLink = document.getElementById('user-logged-in');
        this._profile = null;
        this._isLoggedIn = false;
        this._session_info = null;
        this._oauth = null;
        this._rpc = rpc;
    }
    set profile(profile){
        this._profile = profile;
        console.log(this._profile.pictureUrl);
        if(profile.pictureUrl){
            this._createPofileLink();
        }
        this._get_session_info();
    }
    get profile(){
        return this._profile;
    }
    set oauth(oauth){
        this._oauth = oauth;
    }
    async _get_session_info(){
        try {
            const session_info = await rpc('/web/session/get_session_info');
            this._session_info = session_info;
            console.log('get_session_info');
            console.log(session_info);
        } catch (error) {
            console.log("JSON-RPC Error: get_session_info", error);
        }
    }
    isLoggedIn(){
        return this._isLoggedIn;
    }
    _createPofileLink(){
        const img = document.getElementById('profile-image');
        img.src = this._profile.pictureUrl;
    }
    async login(){
        this._oauth.login();
    }
}

class LineOauth {
    constructor(){
        this._baseCallbackURI = window.location.host + '/auth_oauth/signin?';
        this._callbackURI = null;
        this._liffId = '2007896254-Dkr9Yr56';
        this._scope = 'openid+profile+email';
        this._state = {
            'd': dbName,
            'p': 5,
            'r': window.location.host
        }
        this._setCallbackURI();
    }
    _setCallbackURI(){
        const params = new URLSearchParams();
        params.append('scope', this._scope);
        params.append('state', JSON.stringify(this._state));
        this._callbackURI = encodeURIComponent(this._baseCallbackURI) + params;
    }
    get callbackURI(){
        return this._callbackURI;
    }
    async login(){
        try{
            await liff.init({liffId: this._liffId});
            liff.login({redirectUri: this._callbackURI});
        } catch(error) {
            console.error("LIFF initialization failed", error);
        };
    }
    async init(){
        try {
            await liff.init({liffId: this._liffId });
            if (liff.isLoggedIn()) {
                const profile = await liff.getProfile();
                user.profile = profile;
            } 
        } catch (error) {
            console.error("LIFF initialization failed", error);
        }
    }

}

class LocalStorage{
    constructor(namespace){
        this._nameSpace = namespace;
    }
    clear(){
        localStorage.setItem(this._nameSpace, JSON.stringify({}));
    }
    write(key, value){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = serializedData ? JSON.parse(serializedData) : {};
        data[key] = value;
        localStorage.setItem(this._nameSpace, JSON.stringify(data));
    }
    read(key){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = JSON.parse(serializedData);
        return data ? data[key] : undefined;
    }
    remove(key){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = serializedData ? JSON.parse(serializedData) : {};
        delete data[key];
        localStorage.setItem(this._nameSpace, JSON.stringify(data));
    }
}

class State {
    constructor(namespace){
        this._urlParameters = null;
        this._oauth = null;
        this._formElements = null;
        this._redirected = false;
        this._selects = document.getElementById('select-booking-options').querySelectorAll('.form-control');
        this._localStorage = new LocalStorage(namespace);
    }
    set urlParameters(urlParams){
        this._urlParameters = urlParams;
    }
    get urlParameters(){
        return thie._urlParameters;
    }
    set oauth(oauth){
        this._oauth = oauth;
    }
    get oauth(){
        return this._oauth;
    }
    set formElements(formElements){
        this._formElements = formElements;
    }
    get formElements(){
        return this._formElements;
    }
    get selects(){
        return this._selects;
    }
    set redirected(redirected){
        this._redirected = redirected;
    }
    get redirected(){
        return this._redirected;
    }
    save(){
        const inputs = [];
        const selects = [];

        for (const input of this._formElements){
            inputs.push({
                name: input.name,
                value: input.value
            })
        }
        for (const select of this._selects){
            selects.push({
                name: select.name,
                value: select.value
            })
        }
        this._localStorage.write('urlParameters', this._urlParameters);
        this._localStorage.write('formElements', JSON.stringify(inputs));
        this._localStorage.write('selects', JSON.stringify(selects));
        this._localStorage.write('oauth', JSON.stringify(this._oauth));
        this._localStorage.write('redirected', true);
    /*    writeToStorage('location', select_elements['location'].value);
        writeToStorage('service', select_elements['service'].value);
        writeToStorage('capacity', select_elements['capacity'].value);
        writeToStorage('date', select_elements['date'].value);*/
    }
    restore(){
        this._urlParameters = this._localStorage.read('urlParameters');
        this._redirected = this._localStorage.read('redirected');
        this._formElements = JSON.parse(this._localStorage.read('formElements'));
        this._oauth = JSON.parse(this._localStorage.read('oauth'));
        for (const select of JSON.parse(this._localStorage.read('selects'))){
            this._selects[select.name].value = select.value;
        }
        document.getElementById('booking').scrollIntoView();
    }
    isRedirected(){
        return this._localStorage.read('redirected');
    }
}

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


    if(state.isRedirected()){

    }

    bootstrap_init();

    bookingOptionsView.update(available_appointments);

    if(readFromStorage('redirected')){
        continuePreviousBooking();
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

function saveCurrentState(urlParameters, formElements){
    const inputs = [];
    const selects = [];

    for (const input of formElements){
        inputs.push({
            name: input.name,
            value: input.value
        })
    }
    const select_elements = document.getElementById('select-booking-options').querySelectorAll('.form-control');
    for (const select of select_elements){
        selects.push({
            name: select.name,
            value: select.value
        })
    }
/*    writeToStorage('location', select_elements['location'].value);
    writeToStorage('service', select_elements['service'].value);
    writeToStorage('capacity', select_elements['capacity'].value);
    writeToStorage('date', select_elements['date'].value);*/
    writeToStorage('urlParameters', urlParameters);
    writeToStorage('inputs', JSON.stringify(inputs));
    writeToStorage('selects', JSON.stringify(selects));
    writeToStorage('redirected', true);
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
