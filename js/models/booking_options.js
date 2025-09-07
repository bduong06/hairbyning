
export default class BookingOptionsModel {
    constructor(rpc){
        this.url = '/hbn/appointment';
        this.rpc = rpc;
    }
    async get(){
        try {
            const available_appointments = await rpc('/hbn/appointment');
            return available_appointments;
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    }
}
