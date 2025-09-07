import appointment_form from "./appointment_form.js";

export default class BookingFormView {
    constructor(handlers){
        this._handlers = handlers;
        this._modal = bootstrap.Modal.getInstance('#booking-modal');
        this._spinner = document.getElementById('spinner');
        this._data = null;
        this._modalContent = document.getElementById('booking-modal-body-content');
        this.appointment_form = appointment_form;
        this.installHandlers(this._handlers);
    }
    set data(data){
        this._data = data;
    }
    get data(){
        return this._data;
    }
    render(){
        this._spinner.classList.add('d-none');
        const partner_data = this._data['partner_data'];
        const name = ((partner_data != undefined) && (partner_data.name)) ? partner_data.name : "";
        const email = ((partner_data != undefined) && (partner_data.email)) ? partner_data.email : "";
        const phone = ((partner_data != undefined) && (partner_data.phone)) ? partner_data.phone : "";
        let html = ejs.render(appointment_form, {
            'date_locale': this._data['date_locale'],
            'asked_capacity': this._data['asked_capacity'],
            'location': "Location",
            'duration': this._data['duration'],
            'datetime_str': this._data['datetime_str'],
            'duration_str': this._data['duration_str'],
            'available_resource_ids': this._data['available_resource_ids'],
            'name': name,
            'email': email,
            'phone': phone,
            'id': this._data['appointment_type_id'],
        })
        this._modalContent.innerHTML = html;
    }
    show(){
        this._modalContent.innerHTML = '';
        this._modal.show();
        this._spinner.classList.remove('d-none');
    }
    hide(){
        this._modal.hide();
    }
    installHandlers(handlers){
        handlers.forEach((handler) => {
            document.getElementById(`${handler.target}`).addEventListener(handler.event, handler.handler);
        })
    }
}
