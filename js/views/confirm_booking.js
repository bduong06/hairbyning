import confirm_booking_form from "./confirm_booking_form.js";
export default class ConfirmBookingView{
    constructor(handlers){
        this._handlers = handlers;
        this._modal = bootstrap.Modal.getOrCreateInstance('#booking-modal',{keyboard: false});
        this._spinner = document.getElementById('spinner');
        this._data = null;
        this._modalContent = document.getElementById('booking-modal-body-content');
        this._confirm_booking_form = confirm_booking_form;
        this.installHandlers(this._handlers);
    }

    set data(data){
        this._data = data;
    }
    get data(){
        return this._data;
    }
    show(){
        this._modalContent.innerHTML = '';
        this._modal.show();
        this._spinner.classList.remove('d-none');
    }
    hide(){
        this._modal.hide();
    }
    render(){

    }

    installHandlers(handlers){
        handlers.forEach((handler) => {
            document.getElementById(`${handler.target}`).addEventListener(handler.event, handler.handler);
        })
    }
}