
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
  