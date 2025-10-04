
export default class BookingOptionsModel {
    constructor(rpc){
        this._url = '/hbn/appointment/appointment_type';
        this._rpc = rpc;
        this._formElements = null;
    }
    get formElements(){
        return this._formElements;
    }
    get savedElements(){
        return JSON.parse(sessionStorage.getItem('elements'));
    }
    get savedValues(){
        return JSON.parse(sessionStorage.getItem('values'));
    }

    set formElements(formElements){
        this._formElements = formElements;
        const elements = [{
            'name': 'location',
            'html':  formElements['location'].innerHTML
        },{
            'name': 'service',
            'html': formElements['service'].innerHTML
        },{
            'name': 'capacity',
            'html': formElements['capacity'].innerHTML,

        }]
        const values = {
            'location': formElements['location'].value,
            'service': formElements['service'].value,
            'capacity': formElements['capacity'].value,
            'date': formElements['date'].value
        }
        sessionStorage.setItem('elements', JSON.stringify(elements));
        sessionStorage.setItem('values', JSON.stringify(values));
    }
    async submit(){
        const date = this._formElements['date'].value;
        const params = {
            'date': encodeURIComponent(date),
            'appointment_type_id': encodeURIComponent(this._formElements['service'].value),
            'asked_capacity': encodeURIComponent(this._formElements['capacity'].value),
        }
        try{
            const response = await this._rpc(this._url, params);
            response.appointment.date = date;
            return response.appointment;
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    }
}
