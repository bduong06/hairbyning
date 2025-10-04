
export default class BookingOptionsView {
    constructor(handlers){
        this.handlers = [{
            target: 'select-booking-options',
            event: 'change',
            handler: this.handleLocationChange
        }];
        if(handlers !== undefined){
            this.handlers.push(...handlers);
        }
        this.form = document.getElementById('select-booking-options');
        this.csrf_token = document.getElementById('csrf_token');
        this.datepicker = new Datepicker( document.getElementById('date-select'), {
            buttonClass: 'btn', 
            autohide: true,
            format: "yyyy-mm-dd",
            minDate: new Date()
        }); 
        this.installHandlers(this.handlers);
    }
    installHandlers(handlers){
        console.log(handlers);
        handlers.forEach((handler) => {
            document.getElementById(`${handler.target}`).addEventListener(handler.event, handler.handler);
        })
    }
    update(options){
        const selects = this.form.elements;
        this.csrf_token.value = options.csrf_token;
        const keys = Object.keys(options.appointment_types);
        for (const [key, location] of Object.entries(keys)) {
            let locationOption = new Option(location, key);
            let capacity;
            locationOption.setAttribute('data-group', key);
            selects['location'].options[selects['location'].options.length] = locationOption;
            for (const [key1, service] of Object.entries(options.appointment_types[location])) {
                var serviceOption = new Option(service.name, service.id);
                serviceOption.setAttribute('data-group', key);
                serviceOption.classList.add('d-none');
                selects['service'].options[selects['service'].options.length] = serviceOption;
                capacity = service.max_capacity;
            }
            for (let i = 1; i <= capacity; i++) {
                var capacityOption = new Option(i, i);
                capacityOption.setAttribute('data-group', key);
                capacityOption.classList.add('d-none');
                selects['capacity'].options[selects['capacity'].options.length] = capacityOption;
            }
        }
    }
    handleLocationChange(event){
        if(event.target.id === 'location-select'){
            event.preventDefault();
            const selects = this.elements;
            const dataGroup = event.target.value;
            for (const option of selects['service'].options) {
                if(option.dataset.group !== undefined) {
                    if(option.dataset.group == dataGroup) {
                        option.classList.remove('d-none');
                    } else {
                        option.classList.add('d-none');
                    }
                } 
            }
            for (const option of selects['capacity'].options) {
                if(option.dataset.group !== undefined) {
                    if(option.dataset.group == dataGroup) {
                        option.classList.remove('d-none');
                    } else {
                        option.classList.add('d-none');
                    }
                } 
            }
        }
    }
    restore(html){
        const formElements = this.form.elements;
        const elements = JSON.parse(sessionStorage.getItem('elements'));
        const values = JSON.parse(sessionStorage.getItem('values'));
        elements.forEach((elem) => {
            formElements[elem.name].innerHTML = elem.html;
        })
        for (let name in values) {
            formElements[name].value = values[name];
        }
        
        document.getElementById('booking').scrollIntoView();
    }
}
