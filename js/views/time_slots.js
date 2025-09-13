import available_time_slots from "./available_time_slots.js";
import requested_date_slots  from "./requested_date_slots.js";

export default class TimeSlotsView {
    constructor(handlers){
        this._handleChangeDate = this._handleChangeDate.bind(this);
        this._handleClick = this._handleClick.bind(this);
        this._handlers = [{
            target: 'booking-modal-body-content',
            event: 'changeDate',
            handler: this._handleChangeDate
        },
        {
            target: 'booking-modal-body-content',
            event: 'click',
            handler: this._handleClick
        }];
        if(handlers !== undefined) {
            console.log(handlers);
            this._handlers.push(...handlers);
        }
        this._spinner = document.getElementById('spinner');
        this._modal = new bootstrap.Modal('#booking-modal', {keyboard: false});
        this._modalContent = document.getElementById('booking-modal-body-content');
        this._available_time_slots = available_time_slots;
        this._requested_date_slots = requested_date_slots;
        this._data = null;

        this.installHandlers(this._handlers);
    }
    set data(data){
        this._data = data;
    }
    get data(){
        return this._data;
    }
    render(){

        let startIndex = this._data.slots.findIndex(slot => slot.slots.length > 0);
        const availableSlots = this._data.slots.slice(startIndex);
        const selectedDateIndex = availableSlots.findIndex(slot => slot.day == this._data.date);

        if(selectedDateIndex - 2 >= 0){
            startIndex = selectedDateIndex - 2; 
        } else {
            startIndex = 0; 
        }

        let html = ejs.render(available_time_slots, {
            date: this._data.date, 
            asked_capacity: this._data.asked_capacity,
            location: this._data.location,
            appointment_type_id: this._data.appointment_type_id,
            availableSlots: availableSlots,
            requestedDateSlots: availableSlots[selectedDateIndex].slots,
            startIndex: startIndex
        })

        this._modalContent.innerHTML = html;

        const today = new Date();
        const elem = document.getElementById('slots-datepicker');
        const datepicker = new Datepicker(elem, {
            buttonClass: 'btn', 
            autohide: true , 
            datesDisabled: this.isDateDisabled,
            updateOnBlur: false,
            format: 'yyyy-mm-dd',
            defaultViewDate: this._data.date,
            minDate: today 
        }); 

        this._initialize_tabs();
        this._spinner.classList.add('d-none');
    }
    installHandlers(handlers){
        handlers.forEach((handler) => {
            document.getElementById(`${handler.target}`).addEventListener(handler.event, handler.handler);
        })
    }
    _handleChangeDate(event){
        event.preventDefault();

        event.target.value = null;
        const selectedDate = event.detail.date;
        const tabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
        tabList.forEach((tab, index) => {
            const date = new Date(tab.dataset.slotDate);
            date.setHours(0,0,0,0);
            if(selectedDate.getTime() === date.getTime()){
                const event = new MouseEvent("click", {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                });
                this.showAvailableTimeSlotsTabs(tabList, index);
                tab.dispatchEvent(event);
            }
        });
    }
    _handleClick(event){
        if(event.target.classList.contains('datepicker-cell') || event.target.classList.contains('date-picker')) {
            event.stopImmediatePropagation();
        } else {
            const elm = event.target;
            if(elm.id === 'nav-control-prev'){

                let tabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
                let index = parseInt(elm.dataset.startIndex);

                for(let i=0; i < 7; i++){
                    tabList[index + i].classList.add('d-none');
                }

                index = (index - 7) < 0 ? 0 : index = index - 7;

                for(let i=0; i < 7; i++){
                    tabList[index + i].classList.remove('d-none');
                }
                elm.dataset.startIndex = index;
                document.getElementById('nav-control-next').dataset.startIndex = index;
                event.stopImmediatePropagation();

            } else if (elm.id === 'nav-control-next'){

                let tabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
                let index = parseInt(elm.dataset.startIndex);

                for(let i=0; i < 7; i++){
                    tabList[index + i].classList.add('d-none');
                }

                index = index + 14 > tabList.length ? tabList.length -7 : index + 7;

                for(let i=0; i < 7; i++){
                    tabList[index + i].classList.remove('d-none');
                }
                elm.dataset.startIndex = index;
                document.getElementById('nav-control-prev').dataset.startIndex = index;
                event.stopImmediatePropagation();

            } else {
                if(elm.role === 'tab'){
                    if(!elm.classList.contains('active')){
                        const slotDate = elm.dataset.slotDate;
                        document.getElementById('current-slot-date').innerHTML = slotDate;
                        let html = ejs.render(requested_date_slots, {requestedDateSlots: JSON.parse(elm.dataset.availableSlots) });
                        document.getElementById('available-time-slots-container').innerHTML = html;
                        const triggerEl = document.querySelector(`#available-dates-nav button[data-slot-date="${slotDate}"]`)
                        bootstrap.Tab.getInstance(triggerEl).show() // Select tab by name
                    }
                    event.stopImmediatePropagation();
                }
            }
        }
    }
    isDateDisabled(date, viewId, rangeEnd){
        let dateDisabled = true;
        const tabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
        const firstDate = new Date(tabList[0].dataset.slotDate);
        const lastDate = new Date(tabList[tabList.length - 1].dataset.slotDate);
        firstDate.setHours(0,0,0,0);
        lastDate.setHours(0,0,0,0);
        if((date.getTime() >= firstDate.getTime()) &&  (date.getTime() <= lastDate)){
            dateDisabled = false;
        }

        return dateDisabled;
    }
    show(){
        this._modalContent.innerHTML = null; 
        this._modal.show();
        this._spinner.classList.remove('d-none');
    }
    hide(){
        this._modal.hide();
    }

    showAvailableTimeSlotsTabs(tabList, startIndex){
        let index = parseInt(document.getElementById('nav-control-next').dataset.startIndex);

        for(let i=0; i < 7; i++){
            tabList[index + i].classList.add('d-none');
        }

        index = startIndex - 2 < 0 ? 0 : startIndex -2;
        for(let i=0; i < 7; i++){
            tabList[index + i].classList.remove('d-none');
        }

        document.getElementById('nav-control-next').dataset.startIndex = index;
        document.getElementById('nav-control-prev').dataset.startIndex = index;
    }

    _initialize_tabs(){
        var triggerTabList = [].slice.call(document.querySelectorAll('#available-dates-nav button'));
        triggerTabList.forEach(function (triggerEl) {
            var tabTrigger = new bootstrap.Tab(triggerEl);
/*            triggerEl.addEventListener('click', function (event) {
                event.preventDefault();
                if(!this.classList.contains('active')){
                    document.getElementById('current-slot-date').innerHTML = this.dataset.slotDate;
                    html = ejs.render(requested_date_slots, {requestedDateSlots: JSON.parse(this.dataset.availableSlots) });
                    document.getElementById('available-time-slots-container').innerHTML = html;
                    document.getElementById('available-time-slots-container').querySelectorAll('button').forEach( (elm) => {
                        addEventListener(elm);
                    })
                    tabTrigger.show();
                }
            })*/
        })


    }

}