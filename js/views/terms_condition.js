
export default class TermsConditionView {
    constructor(handlers){
        this.handlers = [{}];
        this.modal = new bootstrap.Modal('#continue-booking-signin', {keyboard: false});
        if(handlers !== undefined) {
            this.handlers.push(...handlers);
        }
        this._urlParameters = null;
        this._formElements = null;
        this.installHandlers(handlers);
    }
    set urlParameters(urlParameters){
        this._urlParameters = urlParameters;
    }
    set formElements(formElements){
        this._formElements = formElements;
    }

    get urlParameters(){
        return this._urlParameters;
    }
    get formElements(){
        return this._formElements;
    }

    render(){
        this.modal.show();
    }

    installHandlers(handlers){
        handlers.forEach((handler) => {
            console.log(handlers);
            document.getElementById(`${handler.target}`).addEventListener(handler.event, handler.handler);
        })
    }
}