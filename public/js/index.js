//menu section toggle logic

const menubar = document.querySelector("#hero img[src='img/menu.svg']");
const menu = document.getElementById("menu");

menubar.addEventListener("click" , ()=>{
    menu.classList.toggle("d-none")
})

menu.addEventListener("click", (e)=>{
    if(e.target == menu){
        menu.classList.add("d-none");
    }
})