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

    locationSelect.addEventListener("change", function(event) {
        const dataGroup = event.target.value;
        document.getElementById('service-select').querySelectorAll('option').forEach((option) => {

            if(option.dataset.group) {
                if(option.dataset.group == dataGroup) {
                    option.classList.remove('d-none');
                } else {
                    option.classList.add('d-none');
                }
            } 

        });
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



function prepare_selects(response) {

    var locationSelect = document.getElementById('location-select');
    var serviceSelect = document.getElementById('service-select');
    var arr = Object.keys(response);

    for (const [key, location] of Object.entries(arr)) {
        var locationOption = new Option(location, key);
        locationOption.setAttribute('data-group', key);
        locationSelect.options[locationSelect.options.length] = locationOption;
        for (const [key1, service] of Object.entries(response[location])) {
            var serviceOption = new Option(service.name, service.id);
            serviceOption.setAttribute('data-group', key);
            serviceOption.classList.add('d-none');
            serviceSelect.options[serviceSelect.options.length] = serviceOption;
        }
    }
/*    Object.keys(arr).foreach (location => {
        location_select.options[location_select.options.length] = new Option (location,"");
        response[location].foreach(service => {
            service_select.options[service_select.options.length] = new Option (service,"");
        }) 
    });*/
}