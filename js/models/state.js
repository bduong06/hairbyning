class SessionStorage{
    constructor(namespace){
        this._nameSpace = namespace;
    }
    clear(){
        sessionStorage.setItem(this._nameSpace, JSON.stringify({}));
    }
    write(key, value){
        const serializedData = sessionStorage.getItem(this._nameSpace);
        const data = serializedData ? JSON.parse(serializedData) : {};
        data[key] = value;
        sessionStorage.setItem(this._nameSpace, JSON.stringify(data));
    }
    read(key){
        const serializedData = sessionStorage.getItem(this._nameSpace);
        const data = JSON.parse(serializedData);
        return data ? data[key] : undefined;
    }
    remove(key){
        const serializedData = sessionStorage.getItem(this._nameSpace);
        const data = serializedData ? JSON.parse(serializedData) : {};
        delete data[key];
        sessionStorage.setItem(this._nameSpace, JSON.stringify(data));
    }
}

export default class State {
    constructor(){
        this._urlParameters = null;
        this._timeSlotsFormElements = null;
        this._redirected = false;
        this._bookingOptions = null;
    }
    set urlParameters(urlParams){
        this._urlParameters = urlParams;
        sessionStorage.setItem('urlParameters', this._urlParameters);
    }
    get urlParameters(){
        if(this._urlParameters){
            return this._urlParameters;
        } else {
            return sessionStorage.getItem('urlParameters');
        }
    }
    set timeSlotsFormElements(formElements){
        this._timeSlotsFormElements = formElements;
        sessionStorage.setItem('timeSlotsFormElements', this._timeSlotsFormElements);
    }
    get timeSlotsFormElements(){
        if(this._timeSlotsFormElements){
            return this._timeSlotsFormElements;
        } else {
            return sessionStorage.getItem('timeSlotsFormElements');
        }
    }
    set bookingOptions(bookingOptions){
        this._bookingOptions = bookingOptions;
        sessionStorage.setItem('bookingOptions', this._bookingOptions);
    }
    get bookingOptions(){
        if(this._bookingOptions){
            return this._bookingOptions;
        } else {
            return sessionStorage.getItem('bookingOptions');
        }
    }
    set redirected(redirected){
        this._redirected = redirected;
        sessionStorage.setItem('redirected', this._redirected);
    }
    get redirected(){
        if(this._redirected){
            return this._redirected;
        } else {
            return JSON.parse(sessionStorage.getItem('redirected'));
        }
    }
    save(){
        sessionStorage.setItem('urlParameters', this._urlParameters);
        sessionStorage.setItem('timeSlotsFormElements', this._timeSlotsFormElements);
        sessionStorage.setItem('bookingOptions', this._bookingOptions);
        sessionStorage.setItem('redirected', this._redirected);
    /*    writeToStorage('location', select_elements['location'].value);
        writeToStorage('service', select_elements['service'].value);
        writeToStorage('capacity', select_elements['capacity'].value);
        writeToStorage('date', select_elements['date'].value);*/
    }
    restore(){
        this._urlParameters = sessionStorage.getItem('urlParameters');
        this._timeSlotsFormElements = sessionStorage.getItem('timeSlotsFormElements');
        this._bookingOptions = sessionStorage.getItem('bookingOptions');
        this._redirected = JSON.parse(sessionStorage.getItem('redirected'));
    //    window.location.hash = "#booking";
    }
    clear(){
        sessionStorage.removeItem('urlParameters');
        sessionStorage.removeItem('timeSlotsFormElements');
        sessionStorage.removeItem('bookingOptions');
        sessionStorage.removeItem('redirected');

        this._urlParameters = null;
        this._timeSlotsFormElements = null;
        this._redirected = false;
        this._bookingOptions = null;
    }
}