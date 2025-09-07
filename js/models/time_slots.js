export default class TimeSlotsModel {
    constructor(rpc){
        this._rpc = rpc;
    }

    async selectTimeSlot(urlParameters, formElements){
        const searchParams = new URLSearchParams(decodeURIComponent(urlParameters));
        try {
            const params = {};
            for (const [key, value] of searchParams.entries()) {
                params[`${key}`] = encodeURIComponent(value);
            }
            const response = await this._rpc('/hbn/appointment/' + encodeURIComponent(formElements['appointment_type_id'].value) + '/info', params);
            return response;
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }

    }

}