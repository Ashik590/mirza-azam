const section = document.querySelectorAll(".dev_work");

for(const _ of section){
    const lis = _.querySelectorAll("li");
    const divs = _.querySelectorAll(".container > .row .col-md-8 > div");
    
    for(const li of lis){
        li.addEventListener("click", (e)=>{
            const id = li.getAttribute("data-display");
            const div = _.querySelector(id);

            console.log(div)
            lis.forEach(v =>{
                v.classList.remove("active");
            })
            e.target.classList.add("active");

            divs.forEach(d =>{
                d.classList.add("d-none");
            });
            div.classList.remove("d-none");
        })
    }
}