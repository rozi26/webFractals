
var TOP_MENU_HEIGHT = 100
var SIZE_MENU_WIDTH = 300
var MARGIN = 20

var Canves = document.getElementById("canves")
var SIDE_MENU = document.getElementById("side_menu")

var FRACTELS_MENU = document.getElementById("fractels_menu")
var FRACTEL_NAME = document.getElementById("fractel_name")
var FRACTEL_CHOOSE = document.getElementById("fractel_choose")

var COLORS_MENU = document.getElementById("colors_menu")
var COLORS_NAME = document.getElementById("colors_name")
var COLORS_CHOOSE = document.getElementById("colors_choose")

var BUTTON1 = document.getElementById("reset_location")

var CENTER_DIV = document.getElementById("center_div")
var CENTER_DIV_EXIT = document.getElementById("center_div_exit")
var CENTER_DIV_TITLE = document.getElementById("center_div_title")
var CENTER_DIV_CONTANT = document.getElementById("center_div_contant")

var ITERATIONS_LABEL = document.getElementById("iterations_label")
var LOADTIME_LABEL = document.getElementById("loadtime_label")
var MOVEFPS_LABEL = document.getElementById("movefps_label")
var USEGPU_LABEL = document.getElementById("usegpu_label")
var QUALITY_CHECKBOX = document.getElementById("quality_checkbox")

var BOTTOM_MENU = document.getElementById("bottom_menu")
var MOUSE_X_LABEL = document.getElementById("mouse_x_label")
var MOUSE_Y_LABEL = document.getElementById("mouse_y_label")
var MOUSE_N_LABEL = document.getElementById("mouse_location")
var FRACTEL_WIDTH_LABEL = document.getElementById("fractel_width")
var FRACTEL_HEIGHT_LABEL = document.getElementById("fractel_height")
var FRACTEL_LOC_X_LABEL = document.getElementById("fractel_loc_x")
var FRACTEL_LOC_Y_LABEL = document.getElementById("fractel_loc_y")

var RENDERING_INPUTS = document.getElementById("rendering_inputs")

SIDE_MENU.style.width = SIZE_MENU_WIDTH + "px"
SIDE_MENU.style.top = "0px"
SIDE_MENU.style.right ="0px"

Canves.style.borderBottomRightRadius = "15px"
Canves.addEventListener("contextmenu",event=>event.preventDefault()) //prevent right click on the canves from opening optains menu

BOTTOM_MENU.style.height = TOP_MENU_HEIGHT + "px"

var CENTER_DIV_SHOW = false
var CENTER_DIV_STACK = []

//rendering methods
let AUTO_QUALITY = true; //if the page auto set the quality
let QUALITY_LEVEL = 1 ;//the quality level for automatic quality maker
let JULIA_QUALITY_DOWN = 3; //if rendering julia set move in how match lower the quality
let MIN_QUALITY = 75; //the worst quality the automatic quality maker can set
let MAX_QUALITY = 5000; //the best quality the automatic quality maker can set
let GRID_SQUARE_SIZE = 9;
let OUT_DISTANCE = 2;
let MIN_GPU_SIZE = Math.pow(10,-5)

function resize(first)
{
    var width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    
    Canves.width = width-SIZE_MENU_WIDTH
    Canves.height = height-TOP_MENU_HEIGHT
    
    SIDE_MENU.style.height = height - TOP_MENU_HEIGHT + "px"

    CENTER_DIV_EXIT.style.height = CENTER_DIV_TITLE.offsetHeight + "px"
    CENTER_DIV_EXIT.style.width = (CENTER_DIV_EXIT.offsetHeight) + "px"
    CENTER_DIV_CONTANT.style.height =  (CENTER_DIV.offsetHeight - CENTER_DIV_TITLE.offsetHeight - CENTER_DIV_TITLE.offsetTop*2) + "px"
    
    if(!first)
    {
        var saves = [rend.LX,rend.LY,rend.width]
        rend = new Renderer(Canves,rend.frac,{"method":rend.colorize,"name":rend.colorize_name})
        rend.LX = saves[0]; rend.LY = saves[1]; rend.updateSize(saves[2]);
        rend.full_render()
    }
}
resize(true)
window.addEventListener("resize", event=>{resize(false)});

function getSlideBar(name,min,max,vals)
{
    var div = document.createElement("div")
    var label = document.createElement("label")
    label.textContent = name
    div.appendChild(label)
    var slider = document.createElement("input")
    slider.style.width = "40%"
    slider.type = "range"
    slider.min = min; slider.max = max; slider.step=1; slider.value = vals;
    div.appendChild(slider)
    /*var value = document.createElement("label")
    value.innerHTML = slider.value
    div.appendChild(value)
    slider.addEventListener("change",(event)=>{value.innerHTML = slider.value;})*/
    var val = document.createElement("input")
    val.type = "number"
    val.value = slider.value;
    val.min = "" + min
    val.max = "" + max;
    val.style.width = "18%"
    val.style.float = "right"
    val.style.background = "transparent"
    val.style.borderRadius = "5px"
    div.appendChild(val)

    slider.addEventListener("change",(event)=>{val.value = slider.value;})
    val.addEventListener("change",(event)=>{slider.value = val.value; slider.dispatchEvent(new Event('change'))})
    val.addEventListener("dblclick",(event)=>{slider.value = vals; slider.dispatchEvent(new Event('change'))})
    
    return [div,label,slider,val]
}

function loadFractelChooser(colors)
{
    if(CENTER_DIV_SHOW) return
    //remove all the existing fractels
    //const DIV = colors?COLORS_CHOOSE:FRACTEL_CHOOSE
    CENTER_DIV_TITLE.textContent = "change " + ((colors)?"color":"fractel")
    var DIV = getNewCenterDivContant()
    DIV.style.paddingBottom = "50px"
    DIV.style.display = "block"
    DIV.style.overflow = "auto"
    
    var height = DIV.offsetHeight;
    var width = DIV.offsetWidth-60;
    const limit = colors?C_LIST.length:F_LIST.length

    
    var prevblock = undefined
    for(let i = 0; i < limit; i++)
    {
        var block = null
        if(i % 2 == 0)
        {
            block = document.createElement("div");
            block.style.margin = "10px"
            block.style.width = (width) + "px"
            block.style.whiteSpace = "nowrap"
            block.style.display = "flex"
            block.style.justifyContent = "space-between"
            prevblock = block
            DIV.appendChild(block);

        }
        else
            block = prevblock
        

        const can = document.createElement("canvas")
        CENTER_DIV_STACK[CENTER_DIV_STACK.length] = can
        can.id = "block_" + ((colors)?C_LIST[i].name:F_LIST[i].name)
        can.style.borderRadius = "10px"
        can.style.display = "inline-block"
        can.style.margin= "0px"
        can.style.borderStyle = "solid"
        //can.style.margin = "10px"
        block.appendChild(can);

        can.width = parseInt((width-20)/2);
        can.height = parseInt(height/2);
        if(i % 2 == 1)
            can.style.float = "right"

        var color = colors?C_LIST[i]:{"method":rend.colorize}
        var fractel = colors?rend.frac:new Fractel(F_LIST[i])

        var render = new Renderer(can,fractel,color);
        render.use_gpu = false;
        render.auto_quality = false;
        if(colors)
        {
            render.LX = rend.LX
            render.LY = rend.LY
            render.updateSize(rend.width)
            render.changeIters(Math.min(rend.frac.iterations,500))
        }
        else
        {
            render.LY = -1
            render.LX = -2.5
            render.changeIters(50)
        }
        render.full_render()
        

        can.addEventListener("click",(event)=>
        {
            const block_name = can.id.toString().substring(6)
            if((colors?(block_name === rend.colorize_name):(block_name === rend.name))) {hideCenterDiv(); return}
            let g = 0;
            while(g < (colors)?C_LIST.length:F_LIST.length)
            {
                if(colors?(C_LIST[g].name===block_name):(F_LIST[g].name === block_name)) break
                g += 1
            }
            if(colors) rend.changeColor(C_LIST[g])
            else rend.changeFractel(new Fractel(F_LIST[g]))
            rend.full_render()
            loadFractelChooser(!colors)
        });
    }

    showCenterDiv()
    return null
}
function getNewCenterDivContant()
{
    var DIV = CENTER_DIV_CONTANT

    while (DIV.firstChild) {
        DIV.removeChild(DIV.firstChild);
    }
    return DIV
}
function hideCenterDiv()
{
    CENTER_DIV_CONTANT.innerHTML = ""
    CENTER_DIV.style.visibility = "hidden";
    CENTER_DIV_SHOW  = false;
    for(let i = 0; i < CENTER_DIV_STACK.length; i++)
    {
        CENTER_DIV_STACK[i].remove()
    }
    CENTER_DIV_STACK.length = 0;
}
function showCenterDiv()
{
    CENTER_DIV.style.widows = CENTER_DIV_CONTANT.offsetWidth + "px"
    CENTER_DIV.style.height = CENTER_DIV_CONTANT.offsetHeight + "px"
    CENTER_DIV.style.visibility = "visible";
    CENTER_DIV_SHOW = true;
}
function hideOnClick(div)
{
    const or_width = div.offsetWidth;
    var kids = [].slice.call(div.getElementsByTagName('*'),0);
    div.addEventListener("click",(event)=>{
        console.log(div.offsetWidth)
        var show = Math.abs(or_width-div.offsetWidth) > 20
        var state = show?"visible":"hidden"
        div.style.width = (show?or_width:40) + "px"
        for(let i = 0; i < kids.length; i++)
        {
            if(kids[i].style === undefined) continue
            kids[i].style.visibility = state
        }
    })
}
hideOnClick(document.getElementById("bottom_blob_1"))
//hideOnClick(document.getElementById("bottom_blob_2"))


const SLIDER_KIT_3 =  getSlideBar("quality",1,4,QUALITY_LEVEL)
RENDERING_INPUTS.appendChild(SLIDER_KIT_3[0])
SLIDER_KIT_3[2].addEventListener("change",(event)=>{QUALITY_LEVEL = SLIDER_KIT_3[2].value; rend.updateQuality(QUALITY_LEVEL);})

const SLIDER_KIT_1 =  getSlideBar("grid size",1,100,9)
RENDERING_INPUTS.appendChild(SLIDER_KIT_1[0])
SLIDER_KIT_1[2].addEventListener("change",(event)=>{GRID_SQUARE_SIZE = SLIDER_KIT_1[2].value; rend.full_render();})

const SLIDER_KIT_2 =  getSlideBar("min quality",1,200,75)
RENDERING_INPUTS.appendChild(SLIDER_KIT_2[0])
SLIDER_KIT_2[2].addEventListener("change",(event)=>{MIN_QUALITY = SLIDER_KIT_2[2].value; rend.updateQuality(QUALITY_LEVEL);})

const SLIDER_KIT_4 =  getSlideBar("out dist",1,100,OUT_DISTANCE)
RENDERING_INPUTS.appendChild(SLIDER_KIT_4[0])
SLIDER_KIT_4[2].step = "0.1"
SLIDER_KIT_4[2].addEventListener("change",(event)=>{OUT_DISTANCE = SLIDER_KIT_4[2].value; rend.full_render();})