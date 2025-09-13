
export default class BookingOptionsModel {
    constructor(rpc){
        this._url = '/hbn/appointment/appointment_type';
        this._rpc = rpc;
        this._formElements = null;
    }
    get formElements(){
        return this._formElements;
    }
    set formElements(formElements){
        this._formElements = formElements;
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
