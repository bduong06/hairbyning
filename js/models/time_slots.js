export default class TimeSlotsModel {
    constructor(rpc){
        this._rpc = rpc;
        this._url = '/hbn/appointment/info';
        this._urlParameters = null;
        this._formElements = null;
    }

    set formElements(formElements){
        this._formElements = formElements;
        let inputs = {}; 
        Array.from(formElements).forEach(element => {
            inputs[element.name]  = element.value;
        });
        sessionStorage.setItem('timeSlotsFormElements', JSON.stringify(inputs));
    }

    get savedElements() {
        return JSON.parse(sessionStorage.getItem('timeSlotsFormElements'));
    }

    get formElements(){
        return this._formElements;
    }

    set urlParameters(urlParameters){
        this._urlParameters = urlParameters;
        sessionStorage.setItem('urlParameters', urlParameters);
    }

    get urlParameters(){
        return this._urlParameters;
    }

    async selectTimeSlot(){
        const searchParams = new URLSearchParams(decodeURIComponent(this._urlParameters));
        const params = {};
        try {
            for (const [key, value] of searchParams.entries()) {
                params[`${key}`] = encodeURIComponent(value);
            }
            for (const input of this._formElements){
                params[`${input.name}`] = encodeURIComponent(input.value);
            }
            const response = await this._rpc(this._url, params);
            return response;
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }

    }

    restore(){
        const inputs = JSON.parse(sessionStorage.getItem('timeSlotsFormElements'));
        const form = document.createElement('form');
        for (let name in inputs) {
            const input = document.createElement('input');
            input.name = name;
            input.value = inputs[name];
            form.appendChild(input);
        }
        this._formElements = form.elements;
        this._urlParameters = sessionStorage.getItem('urlParameters');
    }

}