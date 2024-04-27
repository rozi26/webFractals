
class Fractel
{
    constructor(met)
    {
        this.met = met.method
        this.name = met.name
        this.code = met.code
        this.iterations =  MIN_QUALITY

        this.julia = false
        this.juliaDot = new ComlpaxNumber(0,0)
    }
    setIterations(iters)
    {
        this.iterations = iters
    }
    getBrightness(x,y)
    {
        var c = this.julia?this.juliaDot:new ComlpaxNumber(x,y)
        var z = new ComlpaxNumber(x,y)
        for(var i = 0; i < this.iterations; i++)
        {
            this.met(z,c);
            if(Math.abs(z.R)>OUT_DISTANCE) return i/this.iterations;
        }
        return 1;
    }


    clone()
    {
        var c = new Fractel({"method":this.met.clone(),"name":this.name})
        c.setIterations(this.iterations); c.julia = this.julia; c.juliaDot = this.juliaDot.clone()
        return c
    }
}
const F1 = {"method":(a,b)=>{a.squre(); a.add(b);},"name":"mendelbort","code":"z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y)+c;"}
const F2 = {"method":(a,b)=>{a.I = -a.I; a.squre(); a.add(b);},"name":"triset","code":"z = vec2(z.x*z.x-z.y*z.y,-2.0*z.x*z.y)+c;"}
const F3 = {"method":(a,b)=>{a.cube(); a.add(b);},"name":"mendel3","code":"float x2 = z.x*z.x; float y2 = z.y*z.y; z = vec2(x2*z.x-3.0*z.x*y2,3.0*x2*z.y-y2*z.y)+c;"}
const F4 = {"method":(a,b)=>{a.I = Math.abs(a.I); a.R = Math.abs(a.R); a.squre(); a.add(b)},"name":"berning ship","code":"z = vec2(z.x*z.x-z.y*z.y,2.0*abs(z.x)*abs(z.y))+c;"}
const F5 = {"method":(a,b)=>{var c = a.clone(); c.squre(); a.mult(c); c.R++; a.dev(c); a.add(b)},"name":"feather"}
const F6 = {"method":(a,b)=>{a.squre(); a.squre(); a.add(b);},"name":"mebdel4","code":"z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y); z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y)+c;"}
const F7 = {"method":(a,b)=>{a.squre(); a.add(b); a.exp()},"name":"ceos"}
const F8 = {"method":(a,b)=>{var c = a.clone(); c.mult(new ComlpaxNumber(b.R,-b.I)); a.squre();a.add(c);a.add(b);},"name":"perpendicular"}
const F9 = {"method":(a,b)=>{a.I=-a.I; a.cube(); a.add(b);},"name":"bird of prey","code":"z.y=-z.y; float x2 = z.x*z.x; float y2 = z.y*z.y; z = vec2(x2*z.x-3.0*z.x*y2,3.0*x2*z.y-y2*z.y)+c;"}
const F10 = {"method":(a,b)=>{var c = new ComlpaxNumber(Math.abs(a.R),-Math.abs(a.I)); a.squre();a.mult(c);a.add(b);},"name":" buffalo"}
const F11 = {"method":(a,b)=>{a.squre(); a.add(b); a.mult(new ComlpaxNumber(1-a.getAbs(),1))},"name":"spining"}
const F12 = {"method":(a,b)=>{a.mult(new ComlpaxNumber(b.I,b.R)); a.squre(); a.add(b);},"name":"swollen mendelbort"}

const C1 = {"method":(c)=>{const val = (c==1)?0:255; return [val,val,val,255]},"name":"bw","code":"float val = (inx == 1.0) ? 0.0 : 1.0; vec3 color = vec3(val,val,val);"}
const C2 = {"method":(c)=>{return HSVToColor(c*6,1,((c==1)?0:1))},"name":"orange","code":"vec3 color = HSVToColor(inx * 6.0,1.0,inx == 1.0 ? 0.0 : 1.0);"}
const C3 = {"method":(c)=>{const val = ~~(255*c); return [val,val,val,255]},"name":"black white","code":"vec3 color = vec3(inx,inx,inx);"}
const C4 = {"method":(c)=>{const s = Math.cos(Math.PI*c); const v = s*s; const r = 75-(75*v); const g = 28+r*s; const b = 255-Math.pow(255*v,1.5) % 255; return [r,g,b,255]},"name":"side","code":"float s = cos(3.1415926535*inx); float v = s * s; float r = 75.0-(75.0*v); float g = 28.0+(r*s); float b = 255.0-mod(pow(255.0*v,1.5),255.0); vec3 color = vec3(r/255.0,g/255.0,b/255.0);"}
const C5 = {"method":(c)=>{return [255*c,255*Math.sqrt(c),255*Math.sin(c),255]},"name":"green","code":"vec3 color = vec3(inx,sqrt(inx),sin(inx));"}

const F_LIST = [F1,F2,F3,F4,F5,F6,F7,F8,F9,F10,F11,F12]
const C_LIST = [C1,C2,C3,C4,C5]  

function rgbToHex(r, g, b) {
// Convert each color component to hexadecimal string
var redHex = r.toString(16).padStart(2, '0');
var greenHex = g.toString(16).padStart(2, '0');
var blueHex = b.toString(16).padStart(2, '0');

// Concatenate the hexadecimal values
var hexCode = '#' + redHex + greenHex + blueHex;

return hexCode;
}

function HSVToColor(h, s, v) {
    const M = v * s;
    const m = M * (1 - Math.abs((h) % 2 - 1));
    const z = v - M;
    let r, g, b;

    switch (Math.floor(h)) {
        case 0: r = M;  g = m;    b = 0;  break;
        case 1: r = m;  g = M;    b = 0;  break;
        case 2: r = 0;  g = M;    b = m;  break;
        case 3: r = 0;  g = m;    b = M;  break;
        case 4: r = m;  g = 0;    b = M;  break;
        default:r = M;  g = 0;    b = m;  break;
    }
    return [(r + z)*255, (g + z)*255, (b + z)*255];
}
