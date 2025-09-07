
export default class BookingOptionsModel {
    constructor(rpc){
        this._url = '/hbn/appointment';
        this._rpc = rpc;
    }
    async get(){
        try {
            const available_appointments = await this._rpc('/hbn/appointment');
            return available_appointments;
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    }
    async submit(url,params){
        try{
            const response = await this._rpc(url, params);
            return response.appointment;
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    }
}
