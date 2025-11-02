
export default class BookingFormModel {
    constructor(rpc){
        this._rpc = rpc;
        this._url = '/hbn/appointment/submit';
        this._formElements = null;
    }

    set formElements(formElements){
        this._formElements = formElements;
    }

    get formElements(){
        return this._formElements;
    }

    async submit(){
        try {
            const params = {};
            for(const input of this._formElements){
                if(input.name.length > 0){
                    params[`${input.name}`] = input.value;
                }
            }
           const response = await this._rpc(this._url, params);
           console.log('submit');
           console.log(response);
           return response;
        } catch (error) {
            console.log("JSON-RPC Error:", error);
            throw error;
        }
    }
}