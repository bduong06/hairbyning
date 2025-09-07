import available_time_slots from "./available_time_slots.js";
import requested_date_slots  from "./requested_date_slots.js";

export default class TimeSlotsView {
    constructor(handlers){
        this.handleChangeDate = this.handleChangeDate.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handlers = [{
            target: 'booking-modal-body-content',
            event: 'changeDate',
            handler: this.handleChangeDate
        },
        {
            target: 'booking-modal-body-content',
            event: 'click',
            handler: this.handleClick
        }];
        if(handlers !== undefined) {
            console.log(handlers);
            this.handlers.push(...handlers);
        }
        this.spinner = document.getElementById('spinner');
        this.modal = new bootstrap.Modal('#booking-modal', {keyboard: false});
        this.modalContent = document.getElementById('booking-modal-body-content');
        this.available_time_slots = available_time_slots;
        this.requested_date_slots = requested_date_slots;

        this.installHandlers(this.handlers);
    }
    render(data){
        this.spinner.classList.add('d-none');

        let html = ejs.render(available_time_slots, {
            date: data.date, 
            asked_capacity: data.asked_capacity,
            location: data.location,
            appointment_type_id: data.appointment_type_id,
            availableSlots: data.availableSlots,
            requestedDateSlots: data.requestedDateSlots,
            startIndex: data.startIndex
        })

        this.modalContent.innerHTML = html;

        const today = new Date();
        const elem = document.getElementById('slots-datepicker');
        const datepicker = new Datepicker(elem, {
            buttonClass: 'btn', 
            autohide: true , 
            datesDisabled: this.isDateDisabled,
            updateOnBlur: false,
            format: 'yyyy-mm-dd',
            defaultViewDate: data.date,
            minDate: today 
        }); 

        this.initialize_tabs();
    }
    installHandlers(handlers){
        handlers.forEach((handler) => {
            document.getElementById(`${handler.target}`).addEventListener(handler.event, handler.handler);
        })
    }
    handleChangeDate(event){
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
    handleClick(event){
        if(event.target.classList.contains('datepicker-cell') || event.target.classList.contains('date-picker')) {
            event.stopImmediatePropagation();
        } else {
            event.preventDefault();
            const elm = event.target;
            if(elm.id === 'nav-control-prev'){
                event.preventDefault();

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
        this.modalContent.innerHTML = '';
        this.modal.show();
        this.spinner.classList.remove('d-none');
    }
    hide(){
        this.modal.hide();
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

    initialize_tabs(){
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