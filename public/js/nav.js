// sticky nav

const nav = document.querySelector("nav");
let topVal = nav.getBoundingClientRect().top;

window.addEventListener("scroll", ()=>{
    if(scrollY >= topVal){
        nav.classList.add("sticky");
    }else{
        nav.classList.remove("sticky")
    }
})