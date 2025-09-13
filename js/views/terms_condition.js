import terms_conditions from "./terms_condition_txt.js";
export default class TermsConditionsView {
    constructor(handlers){
        this._handlers = [];
        this._modal = new bootstrap.Modal('#terms-conditions-modal', {keyboard: false});
        this._modalContent = document.getElementById('terms-conditions-body-content');
        if(handlers !== undefined) {
            this._handlers.push(...handlers);
        }
        this.installHandlers(handlers);
    }
    render(){
        this._modalContent.innerHTML = terms_conditions;
        this._modal.show();
    }
    installHandlers(handlers){
        handlers.forEach((handler) => {
            console.log(handlers);
            document.getElementById(`${handler.target}`).addEventListener(handler.event, handler.handler);
        })
    }
}