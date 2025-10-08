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
        const userLoggedIn = document.getElementById('user-logged-in');
        const buttons = document.getElementById('terms-conditions-modal').querySelectorAll('.not-logged-in');
        if(userLoggedIn.classList.contains('d-none')){
            for(const btn of buttons){
                btn.classList.remove('d-none');
            }
            document.getElementById('continue-logged-in-btn').classList.add('d-none');
        } else{
            for(const btn of buttons){
                btn.classList.add('d-none');
            }
            document.getElementById('continue-logged-in-btn').classList.remove('d-none');
        }
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