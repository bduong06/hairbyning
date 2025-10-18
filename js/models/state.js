class LocalStorage{
    constructor(namespace){
        this._nameSpace = namespace;
    }
    clear(){
        localStorage.setItem(this._nameSpace, JSON.stringify({}));
    }
    setItem(key, value){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = serializedData ? JSON.parse(serializedData) : {};
        data[key] = value;
        localStorage.setItem(this._nameSpace, JSON.stringify(data));
    }
    getItem(key){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = JSON.parse(serializedData);
        return data ? data[key] : undefined;
    }
    removeItem(key){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = serializedData ? JSON.parse(serializedData) : {};
        delete data[key];
        localStorage.setItem(this._nameSpace, JSON.stringify(data));
    }
}

export default class State {
    constructor(namespace){
        this._urlParameters = null;
        this._optionsFormElements = null;
        this._optionsFormValues = null;
        this._authLoggedIn = null;
        this._localStorage = new LocalStorage(namespace);
    }
    get authLoggedIn() {
        return this._localStorage.getItem('authLoggedIn');
    }
    set authLoggedIn(provider) {
        this._localStorage.setItem('authLoggedIn', provider);
    }
    set urlParameters(urlParams){
        this._urlParameters = urlParams;
        this._localStorage.setItem('urlParameters', this._urlParameters);
    }
    get urlParameters(){
        return this._localStorage.getItem('urlParameters');
    }
    get optionsFormValues() {
        return this._localStorage.getItem('optionsFormValues');
    }
    set optionsFormValues(values) {
        this._localStorage.setItem('optionsFormValues', values);
    }
    get optionsFormElements(){
        return this._localStorage.getItem('optionsFormElements');
    }
    set optionsFormElements(formElements) {
        const elements = [{
            'name': 'location',
            'html':  formElements['location'].innerHTML
        },{
            'name': 'service',
            'html': formElements['service'].innerHTML
        },{
            'name': 'capacity',
            'html': formElements['capacity'].innerHTML,

        }]
        const values = {
            'location': formElements['location'].value,
            'service': formElements['service'].value,
            'capacity': formElements['capacity'].value,
            'date': formElements['date'].value
        }
        this._localStorage.setItem('optionsFormElements', JSON.stringify(elements));
        this._localStorage.setItem('optionsFormValues', JSON.stringify(values));

    }
    set timeSlotsFormElements(formElements){
        this._timeSlotsFormElements = formElements;
        this._localStorage.setItem('timeSlotsFormElements', this._timeSlotsFormElements);
    }
    get timeSlotsFormElements(){
        return this._localStorage.getItem('timeSlotsFormElements');
    }
    set redirected(redirected){
        this._localStorage.setItem('redirected', this._redirected);
    }
    get redirected(){
        return JSON.parse(this._localStorage.getItem('redirected'));
    }
    /*save(){
        this._localStorage.setItem('urlParameters', this._urlParameters);
        this._localStorage.setItem('timeSlotsFormElements', this._timeSlotsFormElements);
        this._localStorage.setItem('bookingOptions', this._bookingOptions);
        this._localStorage.setItem('redirected', this._redirected);
        writeToStorage('location', select_elements['location'].value);
        writeToStorage('service', select_elements['service'].value);
        writeToStorage('capacity', select_elements['capacity'].value);
        writeToStorage('date', select_elements['date'].value);
    }*/
/*    restore(){
        this._urlParameters = this._localStorage.getItem('urlParameters');
        this._timeSlotsFormElements = this._localStorage.getItem('timeSlotsFormElements');
        this._bookingOptions = this._localStorage.getItem('bookingOptions');
        this._redirected = JSON.parse(this._localStorage.getItem('redirected'));
    //    window.location.hash = "#booking";*/
    //}

    clear(){
        this._localStorage.clear();
    }
}