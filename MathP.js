

class ComlpaxNumber
{
    constructor(rel=0,img=0)
    {
        this.R = rel
        this.I = img
    }


    add(num)//z+n
    {
        this.R += num.R
        this.I += num.I
    }
    sub(num)//z-n
    {
        this.R -= num.R
        this.I -= num.I
    }
    mult(num)//z*n
    {
        const temp = this.R
        this.R = this.R*num.R - this.I*num.I
        this.I = temp*num.I + this.I*num.R
    }
    dev(num)//z/n
    {
        const dever = num.R*num.R+num.I*num.I
        const temp = this.R
        this.R = (this.R*num.R+this.I*num.I)/dever
        this.I = (this.I*num.R-temp*num.I)/dever
    }

    inverse()// 1/z
    {  
        const dever = num.R*num.R+num.I*num.I
        this.R = num.R/dever
        this.I = -num.I/dever
    }
    squre()//z^2
    {
        const t = this.I*this.I;
        this.I *= this.R*2
        this.R *= this.R
        this.R -= t
    }
    cube() //z^3
    {
        const as = this.R*this.R
        const bs = this.I*this.I
        this.R = this.R*(as-3*bs)
        this.I = this.I*(3*as-bs)
    }


    sin(){ //sin(z)
        const realPart = Math.sin(this.R) * Math.cosh(this.I);
        const imaginaryPart = Math.cos(this.R) * Math.sinh(this.I);
        this.R = realPart;
        this.I = imaginaryPart;
    }
    cos() { //cos(z)
        const realPart = Math.cos(this.R) * Math.cosh(this.I);
        const imaginaryPart = -Math.sin(this.R) * Math.sinh(this.I);
        this.R = realPart;
        this.I = imaginaryPart;
    }

    exp() //e^z
    {
        const c = Math.exp(this.R)
        this.R = Math.cos(this.I) * c
        this.I = Math.sin(this.I) * c
    }
    ln() //ln(z)
    {
        const temp = Math.log(this.getAbs());
        this.I = Math.atan2(this.I,this.R)
        this.R = temp
    }
    pow(num) //z^n
    {
        this.ln()
        this.mult(num)
        this.exp()
    }
    
    fround()
    {
        this.R = Math.fround(this.R);
        this.I = Math.fround(this.I);
    }

    getAlpha()//return arg(z)
    {
        var d = Math.atan2(this.I,this.R) % Math.PI
        if(d < 0) d += Math.PI
        if(this.I < 0 || (this.I == 0 && this.R < 0)) d += Math.PI
        return d
    }
    getAbs()//return |z|
    {
        return Math.sqrt(this.R*this.R+this.I*this.I)
    }

    clone()
    {
        return new ComlpaxNumber(this.R,this.I)
    }

    toString()
    {
        if(this.I < 0) return roundNumber(this.R) + " - "  + roundNumber(Math.abs(this.I)) + "i"
        return roundNumber(this.R) + " + " + roundNumber(this.I) + "i"
    }
    print()
    {
        console.log(this.toString())
    }
}

function roundNumber(num)
{
    return Math.round(num*100000)/100000
}
