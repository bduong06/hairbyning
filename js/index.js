import {
    ConnectionAbortedError,
    ConnectionLostError,
    RPCError,
    rpc,
    rpcBus,
} from "../addons/web/static/src/core/network/rpc.js";


function whenReady(fn) {
    return new Promise(function (resolve) {
        if (document.readyState !== "loading") {
            resolve(true);
        }
        else {
            document.addEventListener("DOMContentLoaded", resolve, false);
        }
    }).then(fn || function () { });
}

whenReady().then(() => {

    const reviewsCarousel = new bootstrap.Carousel('#reviewsCarousel', {
        ride: 'carousel'
    });

    const carouselElm = document.getElementById('galleryCarousel');
    const galleryCarousel = new bootstrap.Carousel(carouselElm, {
        ride: false,
        interval: 0
    });

    document.querySelectorAll('#portfolio a').forEach((elm, index) => {
    elm.addEventListener('click', event => {
        event.preventDefault();

        galleryCarousel.to(index);
    })
    });
    
    
    const galModalElm = document.getElementById('galleryModal');
    galModalElm.addEventListener('hide.bs.modal', () => {
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }
    }); 

    const colNavbarElm = document.getElementById('colNavbar');
    colNavbarElm.querySelectorAll('.nav-link').forEach((elm, index) => {
        elm.addEventListener('click', event => {
            if (colNavbarElm.classList.contains('show')) {
                bootstrap.Collapse.getInstance(colNavbarElm).toggle();
            }
        })
    });

    document.getElementById('location-select').addEventListener("change", function(event) {
        event.preventDefault();

        const dataGroup = this.value;
        const serviceSelect = document.getElementById('service-select');
        const capacitySelect = document.getElementById('capacity-select');
        for (const option of serviceSelect.options) {
            if(option.dataset.group !== undefined) {
                if(option.dataset.group == dataGroup) {
                    option.classList.remove('d-none');
                } else {
                    option.classList.add('d-none');
                }
            } 
        };
        for (const option of capacitySelect.options) {
            if(option.dataset.group !== undefined) {
                if(option.dataset.group == dataGroup) {
                    option.classList.remove('d-none');
                } else {
                    option.classList.add('d-none');
                }
            } 
        };
    });

    document.getElementById('select-booking-options').addEventListener("submit", async function(event) {
        event.preventDefault();

//        const form = document.getElementById('select-booking-options');
        const formElements = this.elements;
        const serviceSelect = formElements["service"];
        const date = formElements["date"].value;
        const asked_capacity = formElements["capacity"].value;
        try {
            const params = {
                'date': date,
                'asked_capacity': asked_capacity
            }
            const response = await rpc('/hbn/appointment/' + serviceSelect.value, params);
            showAvailableTimeSlots(date,response);
        } catch (error) {
            console.log("JSON-RPC Error:", error);
        }
    });
  
});

(async function startOdooApp() {

/*    try {

        const params = {
            "login": "admin",
            "db": "bduongdb",
            "password": "Odi4ever!"
        }
        const response = await rpc('/web/session/authenticate', params);
        console.log("JSON-RPC Response:", response);
    } catch (error) {
        console.log("JSON-RPC Error authenticating:", error.data);
    }*/

    try {
        const response = await rpc('/hbn/appointment');
        prepare_selects(response);
    } catch (error) {
        console.log("JSON-RPC Error:", error);
    }

})();



// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopImmediatePropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()


function prepare_selects(response) {

    var locationSelect = document.getElementById('location-select');
    var serviceSelect = document.getElementById('service-select');
    var capacitySelect = document.getElementById('capacity-select');
    var arr = Object.keys(response);

    for (const [key, location] of Object.entries(arr)) {
        var locationOption = new Option(location, key);
        var capacity;
        locationOption.setAttribute('data-group', key);
        locationSelect.options[locationSelect.options.length] = locationOption;
        for (const [key1, service] of Object.entries(response[location])) {
            var serviceOption = new Option(service.name, service.id);
            serviceOption.setAttribute('data-group', key);
            serviceOption.classList.add('d-none');
            serviceSelect.options[serviceSelect.options.length] = serviceOption;
            capacity = service.max_capacity;
        }
        for (let i = 1; i <= capacity; i++) {
            var capacityOption = new Option(i, i);
            capacityOption.setAttribute('data-group', key);
            capacityOption.classList.add('d-none');
            capacitySelect.options[capacitySelect.options.length] = capacityOption;
        }
    }
/*    Object.keys(arr).foreach (location => {
        location_select.options[location_select.options.length] = new Option (location,"");
        response[location].foreach(service => {
            service_select.options[service_select.options.length] = new Option (service,"");
        }) 
    });*/

}

function showAvailableTimeSlots(date, response) {
    const slots = response.slots;
    const dateInput = document.getElementById('booking-date');
    const dateButtons = document.querySelectorAll('#available-dates-nav button');
    const bookingDetails = document.querySelectorAll('#booking-details-row span');
    let index = slots.findIndex(slot => slot.day == date);

    dateInput.value = date;

    if(slots[index - 2].slots.length > 0) {
        index = index - 2;
    } else {
        index = slots.findIndex(slot => slot.slots.length > 0);
    }

    var i = 0;
    for(const dateButton of dateButtons){
        const shortDate = new Date(slots[index +i].day);
        dateButton.textContent = shortDate.toLocaleString('en-US',{month: "short", day: "numeric"});
        dateButton.dataset.availableTimeSlots = JSON.stringify(slots[index +i].slots);
        if (slots[index + i].day == date) {
            dateButton.classList.add('active');
            createBookingCards(slots[index +i].slots);
        } 
        i++;
    }

    response['date'] = date;
    for(const span of bookingDetails){
        span.textContent = response[span.dataset.prop];
    }


    const availableTimeSlotsModal = new bootstrap.Modal('#show-available-time-slots', {keyboard: false});
    availableTimeSlotsModal.show();
}

function createBookingCards(slots) {
    const slotArray = slots;
    const template = document.getElementById('available-time-slot');
    const spanElements = template.content.querySelectorAll("span");
    const selectButton = template.content.querySelector("button");
    for(const slot of slotArray){
        for(const span of spanElements){
            span.textContent = slot[span.dataset.prop];
        }
        selectButton.dataset.availableResources=JSON.stringify(slot['available_resources']);
        selectButton.dataset.urlParameters=slot['url_parameters'];
        document.getElementById('available-time-slots-container').appendChild(template.content.cloneNode(true));
    }
}