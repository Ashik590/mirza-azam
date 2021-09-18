 // Jquery owl carousel
 $('.owl-carousel').owlCarousel({
    items:1,
    loop:true,
    margin:10,
    items:1
})
const iframe = document.querySelector("#video iframe");

function heightVideo(){
    let ratio = 315 / 560;
    let height = iframe.clientWidth * ratio;

    iframe.style.height = height + 'px';
}
heightVideo();
window.addEventListener("resize", heightVideo)

// video logic

const videoBtn = document.querySelectorAll(".videoBtn span.position-absolute");
const video = document.getElementById("video");

for(const vb of videoBtn){
    vb.addEventListener("click", ()=>{
        video.classList.remove("d-none")
        heightVideo();
    })
}

video.addEventListener("click", (e)=>{
    if(e.target === video){
        video.classList.add('d-none')
    }
})
