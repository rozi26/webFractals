

var mouse_x = -1;
var mouse_y = -1;
var button = -1
var juliaClick = false

var mouseDrag = function(event)
{
    MOUSE_X_LABEL.innerHTML = "mouse x: <b>" + event.x + "</b>"
    MOUSE_Y_LABEL.innerHTML = "mouse y: <b>" + event.y + "</b>"
    MOUSE_N_LABEL.innerHTML = "mouse x: <b>" + new ComlpaxNumber(rend.pixel_to_loc_x(event.x),rend.pixel_to_loc_y(event.y)).toString() + "</b>"
    if(button == 0)
    {
        const move_x = event.x-mouse_x
        const move_y = event.y-mouse_y
        if(juliaClick) rend.moveJulia(move_x,move_y)
        else rend.move(move_x,move_y)
    }
    else if(button == 2) rend.loadLines(event.x,event.y)

    mouse_x = event.x;
    mouse_y = event.y;
    
    
}
Canves.addEventListener('mousemove',mouseDrag)
Canves.addEventListener("mousedown",(event)=>
{
    mouse_x = event.x
    mouse_y = event.y
    button = event.button

    rend.load_image()
    if(button == 2) rend.loadLines(event.x,event.y)
    if(button == 0 && rend.frac.julia && Math.sqrt((event.x-rend.julia_px)*(event.x-rend.julia_px)+(event.y-rend.julia_py)*(event.y-rend.julia_py)) < 50) //check if click on julia dot
    {
        juliaClick = true
        rend.changeIters(parseInt(rend.frac.iterations/JULIA_QUALITY_DOWN))
    }

    Canves.addEventListener('mouseup',()=>
    {
        if(button == 2) rend.load_image()
        Canves.removeEventListener('mouseup',this);
        button = -1
        if(juliaClick)
        {
            rend.changeIters(parseInt(rend.frac.iterations*JULIA_QUALITY_DOWN))
            rend.full_render()
            juliaClick = false
        }
    });
})

Canves.addEventListener("wheel",(event)=>
{
    //console.log(event.deltaY)
    rend.zoom(event.x,event.y,Math.pow(2,event.deltaY/100))
})

document.addEventListener("keydown",event=>
{
    var keyCode = event.keyCode || event.which;
    var key = event.key;
    console.log(key)

    if(key === "j")
        rend.juliaCall(mouse_x,mouse_y)
    if(key === "r")
        rend.LX = -2
        rend.LY = -1
        rend.updateSize(4)
        rend.full_render()
})


document.getElementById("advance_mode_button").addEventListener("click",(event)=>
{
    const r = [document.getElementById("rendering_inputs"),document.getElementById("rendering_data")]
    const simple = r[0].checkVisibility({checkOpacity: true,checkVisibilityCSS: true})
    document.getElementById("advance_mode_button").innerText = simple?"advange mode":"simple mode"
    var vis_name = simple?"hidden":"visible"
    var dis_name = simple?"none":"block"
    for(let i = 0; i < r.length; i++)
    {
        r[i].style.visibility = vis_name
        r[i].style.display = dis_name
    }
    document.getElementById("quality_checkbox_div").style.visibility = (!simple)?"hidden":"visible"

    need_to_render = false;
    if(simple)
    {
        if(QUALITY_LEVEL < 3) {QUALITY_LEVEL = 1; document.getElementById("quality_checkbox").checked = false}
        else {QUALITY_LEVEL = 1; document.getElementById("quality_checkbox").checked = true}
        if(OUT_DISTANCE != 2){need_to_render = true; OUT_DISTANCE = 2;}
    }
    else
    {
        SLIDER_KIT_3[2].value = QUALITY_LEVEL;
        SLIDER_KIT_3[3].value = QUALITY_LEVEL;
        SLIDER_KIT_4[2].value = OUT_DISTANCE;
        SLIDER_KIT_4[3].value = OUT_DISTANCE;
    }
    if(need_to_render) rend.full_render();
})
//document.getElementById("advance_mode_button").click()

document.getElementById("save_button").addEventListener("click",(event)=>
{
    /*CENTER_DIV_TITLE.innerHTML = "save image"
    const div = getNewCenterDivContant()
    //div.style.width = CENTER_DIV.offsetWidth + "px"
    div.style.display = "flex"
    div.style.overflow = "hidden"

    const d = []
    for(let i = 0; i < 2; i++)
    {
        d[i] = document.createElement("div")
        d[i].style.height = "100%"
        if(i == 0){d[i].style.width = "30%"; d[i].style.borderRightStyle = "solid";}
        else {d[i].style.width = "70%"; d[i].style.marginLeft = "30%";}
        d[i].style.padding = "10px"
        div.appendChild(d[i])
    }

    var slide_kit1 = getSlideBar("width",10,20000,1000);
    d[0].appendChild(slide_kit1[0])
    slide_kit1[2].addEventListener("change",(event)=>{setVLoc(); v.full_render();})
    var slide_kit2 = getSlideBar("height",10,20000,1000)
    d[0].appendChild(slide_kit2[0])
    slide_kit2[2].addEventListener("change",(event)=>{setVLoc(); v.full_render();})
    var slide_kit3 = getSlideBar("quality",10,25000,1000)
    d[0].appendChild(slide_kit3[0])
    slide_kit3[2].addEventListener("change",(event)=>{v.changeIters(slide_kit3[2].value); v.full_render();})
    
    const c_max_y =  d[1].offsetHeight-100
    const c_max_x = d[1].offsetWidth+200
    const o_ratio = rend.C_HEIGHT/rend.C_WIDTH
    var can = document.createElement("canvas")
    can.style.position = "absolute"
    can.style.left = "30%"
    const c_min = Math.min(c_max_y,c_max_x)
    can.width = c_min; can.height = c_min;

    d[1].appendChild(can)
    var v = cloneProps(can,rend)
    v.auto_quality = false;
    function setVLoc()
    {
        const ratio = slide_kit2[2].value / slide_kit1[2].value;
        if(c_max_y < c_max_x*ratio)//limit by the height
        {
            can.height = c_max_y;
            can.width = parseInt(c_max_x/ratio);
        }
        else
        {
            can.width = c_max_x;
            can.height = parseInt(c_max_x*ratio)
        }
        v.updateCanves();
        const w = (ratio*rend.width>=rend.height)?rend.width:(rend.height/ratio);
        v.updateSize(w);
        if(w == rend.width)
        {
            console.log("wb")
            v.LX = rend.LX
            v.LY = rend.LY + (rend.height-w*ratio)/2
        }
        else
        {
            console.log("wb")
            v.LY = rend.LY
            v.LX = rend.LX+(rend.width-w)/2
        }
    }
    setVLoc()
    v.full_render()

    spacep = document.createElement("p"); spacep.innerHTML = ""; d[0].append(spacep)
    var name_box_label = document.createElement("label")
    name_box_label.innerHTML = "name "
    d[0].appendChild(name_box_label)
    var name_box = document.createElement("input")
    name_box.type = "text"
    name_box.value = rend.frac.name
    d[0].appendChild(name_box)

    
    var d1b = document.createElement("div")
    d1b.style.position = "absolute"; d1b.style.bottom = 0;d1b.style.width = "20%"; d[0].appendChild(d1b);
    var save_button = document.createElement("button")
    save_button.style.float = "right"
    save_button.innerHTML = "save"
    save_button.style.width = "80px"
    save_button.style.height = "40px"
    d1b.appendChild(save_button)

    save_button.addEventListener("click",(event)=>
    {
        const c1 = document.createElement("canvas")
        d[0].appendChild(c1);
        c1.width = slide_kit1[2].value; c1.height = slide_kit2[2].value
        
        v.GRID_SPACE = 1
        v.full_render()
        v.download(name_box.value)
        d[0].removeChild(c1);
    })

    showCenterDiv()*/
    rend.download()
})


//when rendering mode is changesd
