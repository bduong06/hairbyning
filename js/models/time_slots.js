export default class TimeSlotsModel {
    constructor(rpc){
        this._rpc = rpc;
        this._url = '/hbn/appointment/info';
        this._urlParameters = null;
        this._formElements = null;
    }

    set formElements(formElements){
        this._formElements = formElements;
    }

    get formElements(){
        return this._formElements;
    }

    set urlParameters(urlParameters){
        this._urlParameters = urlParameters;
    }

    get urlParameters(){
        return this._urlParameters;
    }

    async selectTimeSlot(){
        const form = document.createElement('form');
        form.innerHTML = this._formElements;
        const searchParams = new URLSearchParams(decodeURIComponent(this._urlParameters));
        const params = {};
        const formElements = form.elements;
        try {
            for (const [key, value] of searchParams.entries()) {
                params[`${key}`] = encodeURIComponent(value);
            }
            for (const input of formElements){
                params[`${input.name}`] = encodeURIComponent(input.value);
            }
            const response = await this._rpc(this._url, params);
            return response;
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }

    }

}