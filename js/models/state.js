
class LocalStorage{
    constructor(namespace){
        this._nameSpace = namespace;
    }
    clear(){
        localStorage.setItem(this._nameSpace, JSON.stringify({}));
    }
    write(key, value){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = serializedData ? JSON.parse(serializedData) : {};
        data[key] = value;
        localStorage.setItem(this._nameSpace, JSON.stringify(data));
    }
    read(key){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = JSON.parse(serializedData);
        return data ? data[key] : undefined;
    }
    remove(key){
        const serializedData = localStorage.getItem(this._nameSpace);
        const data = serializedData ? JSON.parse(serializedData) : {};
        delete data[key];
        localStorage.setItem(this._nameSpace, JSON.stringify(data));
    }
}

class State {
    constructor(namespace){
        this._urlParameters = null;
        this._oauth = null;
        this._formElements = null;
        this._redirected = false;
        this._selects = document.getElementById('select-booking-options').elements;
        this._localStorage = new LocalStorage(namespace);
    }
    set urlParameters(urlParams){
this._urlParameters = urlParams;
    }
    get urlParameters(){
        return this._urlParameters;
    }
    set oauth(oauth){
        this._oauth = oauth;
    }
    get oauth(){
        return this._oauth;
    }
    set formElements(formElements){
        this._formElements = formElements;
    }
    get formElements(){
        return this._formElements;
    }
    get selects(){
        return this._selects;
    }
    set redirected(redirected){
        this._redirected = redirected;
    }
    get redirected(){
        return this._redirected;
    }
    save(){
        const inputs = [];
        const selects = [];

        for (const input of this._formElements){
            inputs.push({
                name: input.name,
                value: input.value
            })
        }
        for (const select of this._selects){
            if(select.classList.contains('form-control')){
                selects.push({
                    name: select.name,
                    value: select.value
                })
            }
        }
        this._localStorage.write('urlParameters', this._urlParameters);
        this._localStorage.write('formElements', JSON.stringify(inputs));
        this._localStorage.write('selects', JSON.stringify(selects));
        this._localStorage.write('redirected', true);
    /*    writeToStorage('location', select_elements['location'].value);
        writeToStorage('service', select_elements['service'].value);
        writeToStorage('capacity', select_elements['capacity'].value);
        writeToStorage('date', select_elements['date'].value);*/
    }
    restore(){
        this._urlParameters = this._localStorage.read('urlParameters');
        this._redirected = this._localStorage.read('redirected');
        this._formElements = JSON.parse(this._localStorage.read('formElements'));
        for (const select of JSON.parse(this._localStorage.read('selects'))){
            this._selects[select.name].value = select.value;
        }
        document.getElementById('booking').scrollIntoView();
    }
    isRedirected(){
        return this._localStorage.read('redirected');
    }
    clear(){
        this._localStorage.clear();
    }
}

export {LocalStorage, State};