
export default class BookingOptionsView {
    constructor(handlers){
        this.events = [{
            target: 'location-select',
            event: 'change',
            handler: this.handleLocationChange
        }];
        if(handlers != 'undefined'){
            this.events.push(...handlers);
        }
        this.selects = document.getElementById('select-booking-options').elements;
        this.locationSelect = document.getElementById('location-select');
        this.serviceSelect = document.getElementById('service-select');
        this.capacitySelect = document.getElementById('capacity-select');
        this.csrf_token = document.getElementById('csrf_token');
        this.installHandlers(this.events);
    }

    installHandlers(events){
        console.log(events);
        events.forEach((event) => {
            document.getElementById(`${event.target}`).addEventListener(event.event, event.handler);
        })
    }

    update(options){
        this.csrf_token = options.csrf_token;
        const keys = Object.keys(options.appointment_types);
        for (const [key, location] of Object.entries(keys)) {
            let locationOption = new Option(location, key);
            let capacity;
            locationOption.setAttribute('data-group', key);
            this.selects['location'].options[this.selects['location'].options.length] = locationOption;
            for (const [key1, service] of Object.entries(options.appointment_types[location])) {
                var serviceOption = new Option(service.name, service.id);
                serviceOption.setAttribute('data-group', key);
                serviceOption.classList.add('d-none');
                this.selects['service'].options[this.selects['service'].options.length] = serviceOption;
                capacity = service.max_capacity;
            }
            for (let i = 1; i <= capacity; i++) {
                var capacityOption = new Option(i, i);
                capacityOption.setAttribute('data-group', key);
                capacityOption.classList.add('d-none');
                this.selects['capacity'].options[this.selects['capacity'].options.length] = capacityOption;
            }
        }
    }

    handleLocationChange(event){
        event.preventDefault();
        const selects = this.form.elements;
        const dataGroup = this.value;
        for (const option of selects['service'].options) {
            if(option.dataset.group !== undefined) {
                if(option.dataset.group == dataGroup) {
                    option.classList.remove('d-none');
                } else {
                    option.classList.add('d-none');
                }
            } 
        };
        for (const option of selects['capacity'].options) {
            if(option.dataset.group !== undefined) {
                if(option.dataset.group == dataGroup) {
                    option.classList.remove('d-none');
                } else {
                    option.classList.add('d-none');
                }
            } 
        };
    }

    setSelected(){
        this.selects['location'].value = readFromStorage('location');
        this.selects['service'].value = readFromStorage('service');
        this.selects['capacity'].value = readFromStorage('capacity');
        this.selects['date'].value = readFromStorage('date');
        document.getElementById('booking').scrollIntoView();
    }
}
