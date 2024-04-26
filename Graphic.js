


class Renderer
{
    constructor(canves,fractel,color)
    {
        this.auto_quality = true;
        this.canves = canves
        
        this.use_gpu = true;
        if(this.use_gpu)
        {
            this.c_clone = document.createElement("canvas")
            this.c_clone.width = this.canves.width; this.c_clone.height = this.canves.height;
            this.gl = this.c_clone.getContext("webgl");
            if(!this.gl)
            {
                console.log("WebGL not supported, falling back on experimental-webgl");
                this.gl = this.c_clone.getContext("experimental-webgl");
            }
            if(!this.gl)
            {
                console.log("Your browser does not support WebGL");
                this.use_gpu=false;
            }
        }

        this.LX = -2;
        this.LY = -1;
        
        this.updateCanves()
        this.updateSize(4)
        this.changeColor(color)
        
        this.changeFractel(fractel)
        
    }

    changeFractel(fractel)
    {
        this.frac = fractel
        this.frac_quality_calculated = false
        this.full_render_time = undefined
        this.updateQuality()
        if(this.canves===Canves) FRACTEL_NAME.innerHTML = "fractel: <b>" + this.frac.name + "</b>"
    }
    changeColor(color)
    {
        this.colorize = color.method
        this.colorize_name = color.name
        this.color_code = color.code
        if(this.canves===Canves)  COLORS_NAME.innerHTML = "color: <b>" + this.colorize_name + "</b>"
    }
    changeIters(iters)
    {
        //this.frac.iterations = iters
        this.frac.setIterations(iters)
        ITERATIONS_LABEL.innerHTML = "iterations: <b>" + iters + "</b>"
    }

    updateCanves()
    {
        this.C_WIDTH = this.canves.offsetWidth
        this.C_HEIGHT = this.canves.offsetHeight
        if(this.use_gpu)
        {
            this.c_clone.width = this.C_WIDTH; this.c_clone.height = this.C_HEIGHT;
            this.gl.viewport(0,0,this.C_WIDTH,this.C_HEIGHT)
        }
        this.context = this.canves.getContext("2d",{ willReadFrequently: true, alpha: false})
        this.context_image = this.context.createImageData(this.C_WIDTH,this.C_HEIGHT);
        this.context_data = this.context_image.data;
        this.updateBuffers()
    }
    updateSize(width)
    {
        this.width = width
        this.height = width*(this.C_HEIGHT/this.C_WIDTH)
        this.updateBuffers()
    }
    updateBuffers()
    {
        this.BX = this.width / this.C_WIDTH
        this.BY = this.height / this.C_HEIGHT
        this.BXI = 1/this.BX
        this.BYI = 1/this.BY
    }
    updateQuality(quality)
    {
        if(quality != undefined)
            QUALITY_LEVEL = quality
        this.move_frames = 0
        this.move_time = 0
        this.frac_quality_calculated = false
        this.full_render()
    }
    updatePropatis()
    {
        FRACTEL_WIDTH_LABEL.innerHTML = "fractel width: <b>" + roundNumber(this.width) + "</b>"
        FRACTEL_HEIGHT_LABEL.innerHTML = "fractel height: <b>" + roundNumber(this.height) + "</b>"
        FRACTEL_LOC_X_LABEL.innerHTML = "fractel loc r: <b>" + roundNumber(this.LX+this.width/2) + "</b>"
        FRACTEL_LOC_Y_LABEL.innerHTML = "fractel loc i: <b>" + roundNumber(this.LY+this.height/2) + "</b>"
    }

    loc_to_pixel_x(x)
    {
        return (x-this.LX)*this.BXI;
    }
    loc_to_pixel_y(y)
    {
        return (y-this.LY)*this.BYI;
    }
    pixel_to_loc_x(px)
    {
        return px*this.BX + this.LX
    }
    pixel_to_loc_y(py)
    {
        return py*this.BY + this.LY
    }

    full_render_gpu()
    {
        this.general_part_render(0,0,this.C_WIDTH,this.C_HEIGHT)
        //gpu_render_part(this.gl,this.frac.code,this.color_code,this.C_WIDTH,this.C_HEIGHT,this.LX,this.LY,this.width,this.frac.iterations,0,0,this.C_WIDTH,this.C_HEIGHT,this.context_data,this.frac.julia,this.frac.juliaDot.R,this.frac.juliaDot.I)   
    }
    general_part_render(x1,y1,x2,y2)
    {
        if(this.use_gpu && this.frac.code!==undefined && this.width>MIN_GPU_SIZE) {
            //gpu_render_part_cpucolor(this,x1,y1,x2,y2)
            gpu_render_part(this.gl,this.frac.code,this.color_code,this.C_WIDTH,this.C_HEIGHT,this.LX,this.LY,this.width,this.frac.iterations,x1,y1,x2,y2,this.context_data,this.frac.julia,this.frac.juliaDot.R,this.frac.juliaDot.I)
            USEGPU_LABEL.innerHTML = "uses: <b>gpu<b>"
        }
        else 
        {
            this.smart_render(x1,y1,x2,y2)
            USEGPU_LABEL.innerHTML = "uses: <b>cpu<b>"
        }
    }

    full_render()
    {
        if(this.auto_quality) this.set_qualitiy()
        const start_time = Date.now()
        this.general_part_render(0,0,this.C_WIDTH,this.C_HEIGHT)
        this.load_image()
        this.full_render_time = Date.now()-start_time
        LOADTIME_LABEL.innerHTML = "load time: <b>" + this.full_render_time + "</b> ms"
        this.updatePropatis()
    }
    part_render(x1,y1,x2,y2)
    {
        var y = this.pixel_to_loc_y(y1)
        const x_set = this.pixel_to_loc_x(x1)
        var x;
        var y_offset = y1*this.C_WIDTH
        for(let py = y1; py < y2; py++)
        {
            x = x_set
            for(let px = x1; px < x2; px++)
            {
                const color = this.colorize(this.frac.getBrightness(x,y))
                var start = (y_offset+px)<<2
                this.context_data[start] = color[0]
                this.context_data[++start] = color[1]
                this.context_data[++start] = color[2]
                this.context_data[++start] = 255
                x += this.BX;
            }
            y += this.BY
            y_offset += this.C_WIDTH
        }
    }
    smart_render(x1,y1,x2,y2)
    {
        let GIRD_SPACE = GRID_SQUARE_SIZE
        if(GIRD_SPACE == 1) return this.part_render(x1,y1,x2,y2)
        
        const MIN_DIF = Math.min(y2-y1,x2-x1)
        if(MIN_DIF < 5) return this.part_render(x1,y1,x2,y2)
        GIRD_SPACE = Math.min(GIRD_SPACE,MIN_DIF)

        const arr = []

        const x3 = x2
        const y3 = y2
        x2 = x1 + ~~((x2-x1)/GIRD_SPACE)*GIRD_SPACE
        y2 = y1 + ~~((y2-y1)/GIRD_SPACE)*GIRD_SPACE
        
        this.part_render(x2,0,x3,this.C_HEIGHT)
        this.part_render(0,y2,this.C_WIDTH,y3)

        let y = this.pixel_to_loc_y(y1)
        
        const set_x = this.pixel_to_loc_x(x1)
        let x = set_x

        const y_add = this.BY*GIRD_SPACE
        const x_add = this.BX*GIRD_SPACE

        let index = 0;
        for(let py = y1; py < y2; py += GIRD_SPACE)
        {
            x = set_x
            for(let px = x1; px < x2; px += GIRD_SPACE)
            {
                arr[index] = this.frac.getBrightness(x,y)
                index++
                x += x_add
            }   
            y += y_add
        }
        const ly = (y2-y1)/GIRD_SPACE
        const lx = (x2-x1)/GIRD_SPACE
        const DC = this.colorize(1)
        //console.log("dc is " + DC)

        let prev_y1 = arr[0]
        let prev_y2 = arr[1]
        let prev_y3 = arr[lx]
        for(let py = 1; py <= ly; py++)
        {
            const y_place = (py-1)*lx
            prev_y1 = arr[y_place]
            prev_y2 = arr[y_place+1]
            const y_place2 = y_place+lx
            prev_y3 = arr[y_place2]
            let px = 1
            while(true)
            {
                const y4 = arr[y_place2+px]
                if(prev_y1===1 && prev_y1===y4 && prev_y1===prev_y2 && prev_y1===prev_y3)
                {
                    var mul = this.C_WIDTH*4-4*GIRD_SPACE
                    let index = (((y1+(py-1)*GIRD_SPACE)*this.C_WIDTH)+(x1+(px-1)*GIRD_SPACE))*4
                    for(let i1 = 0; i1 < GIRD_SPACE; i1++)
                    {
                        for(let i2 = 0; i2 < GIRD_SPACE; i2++)
                        {
                            this.context_data[index++] = DC[0]
                            this.context_data[index++] = DC[1]
                            this.context_data[index++] = DC[2]
                            this.context_data[index++] = 255
                        }
                        index += mul
                    }
                }
                else
                {
                    var fx2 = x1+px*GIRD_SPACE
                    var fy2 = y1+py*GIRD_SPACE
                    this.part_render(fx2-GIRD_SPACE,fy2-GIRD_SPACE,fx2,fy2)
                }
                px++
                if(px>lx) break;
                prev_y1 = prev_y2
                prev_y2 = arr[(py-1)*lx+px]
                prev_y3 = y4
            }
        }
    }
    load_image()
    {
        this.context.putImageData(this.context_image,0,0)
        this.drawJuliaDot()
    }

    set_qualitiy()
    {
        if(this.full_render_time === undefined || !this.auto_quality) return
        if(!this.frac_quality_calculated)
        {
            this.frac_quality_calculated = true
            const target_time = ~(Math.pow(4,QUALITY_LEVEL)*5)
            this.frac_quality = ~(target_time*this.frac.iterations/this.full_render_time)
            this.changeIters(this.frac_quality);
        }
        this.changeIters(Math.max(MIN_QUALITY,this.frac_quality - Math.log2(this.width)*20))
    }


    move(px, py)
    {
        if(CENTER_DIV_SHOW) return
        const start_time = Date.now()

        const imageData = this.context.getImageData(0, 0, this.C_WIDTH, this.C_HEIGHT);
        this.context.clearRect(0,0,this.C_WIDTH,this.C_HEIGHT);
        this.context.putImageData(imageData,px,py)
        this.context_image = this.context.getImageData(0, 0, this.C_WIDTH, this.C_HEIGHT);
        this.context_data = this.context_image.data

        
        
        this.LY -= py*this.BY
        this.LX -= px*this.BX

        const render_func = (x1,y1,x2,y2)=>this.smart_render(x1,y1,x2,y2)
        if(py > 0)
        {
            render_func(0,0,this.C_WIDTH,py)
            if(px > 0) render_func(0,py,px,this.C_HEIGHT)
            else render_func(this.C_WIDTH+px,py,this.C_WIDTH,this.C_HEIGHT)
        }
        else
        {
            render_func(0,this.C_HEIGHT+py,this.C_WIDTH,this.C_HEIGHT)
            if(px > 0) render_func(0,0,px,this.C_HEIGHT+py)
            else render_func(this.C_WIDTH+px,0,this.C_WIDTH,this.C_HEIGHT+py)
        }
        this.load_image()
        this.move_time += (Date.now() - start_time)
        this.move_frames += 1
        const fps = Math.round(1000*this.move_frames/this.move_time)
        MOVEFPS_LABEL.innerHTML = "move fps:  <b>" + fps + "</b>"
        this.updatePropatis()
    }
    zoom(px, py, amount)
    {
        if(CENTER_DIV_SHOW) return
        
        this.move_time = 0
        this.move_frames = 0

        this.LX += (this.pixel_to_loc_x(px) - this.LX) * (1-amount);
        this.LY += (this.pixel_to_loc_y(py) - this.LY) * (1-amount);
        this.width *= amount;
        this.height *= amount;
        //console.log(this.width)
        this.updateBuffers();
        this.full_render()
    }

    loadLines(px, py, lines)
    {
        if(CENTER_DIV_SHOW) return
        this.load_image()
        if(lines == undefined) lines = 50
        const c = this.frac.julia?this.frac.juliaDot:new ComlpaxNumber(this.pixel_to_loc_x(px),this.pixel_to_loc_y(py))
        let z = new ComlpaxNumber(this.pixel_to_loc_x(px),this.pixel_to_loc_y(py))
        let x = px
        let y = py
        this.context.strokeStyle = 'yellow';
        this.context.lineWidth = 4
        for(let i = 0; i < lines; i++)
        {
            this.frac.met(z,c)
            const x2 = this.loc_to_pixel_x(z.R)
            const y2 = this.loc_to_pixel_y(z.I)
            this.context.beginPath();

            this.context.moveTo(x,y)
            this.context.lineTo(x2,y2)
            this.context.stroke();
            x = x2
            y = y2
        }
    }

    juliaCall(px, py)
    {
        if(CENTER_DIV_SHOW) return
        this.frac.julia = !this.frac.julia
        if(this.frac.julia)
        {
            this.frac.juliaDot = new ComlpaxNumber(this.pixel_to_loc_x(px),this.pixel_to_loc_y(py))
            //this.changeIters(parseInt(this.frac.iterations/5))
        }
        //else this.changeIters(this.frac.iterations*5)
        this.full_render()
    }
    drawJuliaDot()
    {
        if(!this.frac.julia) return
        this.julia_px = this.loc_to_pixel_x(this.frac.juliaDot.R)
        this.julia_py = this.loc_to_pixel_y(this.frac.juliaDot.I)
        this.context.beginPath()
        this.context.arc(this.julia_px,this.julia_py,10,0,2*Math.PI)
        this.context.fillStyle = "white"
        this.context.fill()
        this.context.stroke()
    }
    moveJulia(px, py)
    {
        if(CENTER_DIV_SHOW) return
        this.frac.juliaDot.add(new ComlpaxNumber(this.BX*px,this.BY*py))
        this.full_render()
    }

    download(name)
    {
        const image = new Image();
        image.src = this.canves.toDataURL();
        document.body.appendChild(image);
        const a = document.createElement('a');
        a.href = image.src;
        a.download = name + ".png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        document.body.removeChild(image)
    }
}

function cloneProps(c1,render)
{
    const r = new Renderer(c1,render.frac,{"method":render.colorize,"name":render.colorize_name})
    r.LX = render.LX; r.LY = render.LY;
    r.updateSize(render.width)
    return r
}

let rend = new Renderer(Canves,new Fractel(F1),C2)
rend.full_render()

