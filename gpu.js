
function get_brightness_calculation_string(width,height,x,y,size,iters,code,color_code,px1,py1,px2,py2,use_jliua,jx,jy)
{
    function asStr(v)
    {
        v = "" + v
        if(v.indexOf('.') == -1) return v + ".0"
        return v
    }
    const buffer = size/width //convert pixels to fratel distance
    const dev_num = width/size //the size convertor
    const start_x = x
    const start_y = y

    const dev = asStr(dev_num)
    const vx1 = asStr(start_x+px1*buffer)
    const vy1 = asStr(start_y+py1*buffer)
    const res = asStr(iters)

    var px1f = asStr(px1); var py1f = asStr(py1);
    var px2f = asStr(px2); var py2f = asStr(py2)
    const fragmentShaderSrc = `
    
    precision highp float;
    vec3 HSVToColor(float h, float s, float v) {
      float M = v * s;
      float m = M * (1.0 - abs(mod(h, 2.0) - 1.0));
      float z = v - M;
      vec3 rgb;
  
      if (h < 1.0) {
          rgb = vec3(M, m, 0.0);
      } else if (h < 2.0) {
          rgb = vec3(m, M, 0.0);
      } else if (h < 3.0) {
          rgb = vec3(0.0, M, m);
      } else if (h < 4.0) {
          rgb = vec3(0.0, m, M);
      } else if (h < 5.0) {
          rgb = vec3(m, 0.0, M);
      } else {
          rgb = vec3(M, 0.0, m);
      }
  
      return rgb + vec3(z);
    }
    
    void main() {
      vec2 cords = gl_FragCoord.xy;
      if(cords.x < ` + px1f + ` || cords.y < ` + py1f +` || cords.x >= ` + px2f + ` || cords.y >= ` + py2f + `) return;
      vec2 c = (cords / ` + dev + `) + vec2(`+vx1+`, `+ vy1 +`);
      vec2 z = vec2(c.x, c.y);
      if(` + use_jliua + `) c = vec2(` + jx + `,` + jy + `);
      float inx = 1.0;

      for (int i = 0; i < `+iters+`; i++) {
        ` + code + `

        if (length(z) > 2.0) {
          inx = float(i) / ` +res+`;
          break;
        }
      }
      `+ color_code + `

      gl_FragColor = vec4(color, 1.0);
    }
  `;
  return fragmentShaderSrc;
}

function gpu_render_part(gl,code,colorize,width,height,x,y,size,iters,px1,py1,px2,py2,pixels,use_julia,jx,jy)
{
  const vertexShaderSrc = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
  `;
  const fragmentShaderSrc = get_brightness_calculation_string(width,height,x,y,size,iters,code,colorize,px1,py1,px2,py2,use_julia,jx,jy)

  // Create and compile shaders
  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vertexShaderSrc);
  gl.compileShader(vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fragmentShaderSrc);
  gl.compileShader(fragmentShader);

  // Create program and link shaders
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.useProgram(program);

  // Create buffer and put three 2d clip space points in it
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([
    -1, -1,
    -1,  1,
    1, -1,
    1,  1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  // Bind buffer, i.e., let's use the buffer we've just created
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // get attribute location, enable it
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  // drawing
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, positions.length / 2);
  
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels,width);
  return pixels
}
function gpu_render_part_cpucolor(g,x1,y1,x2,y2)
{
  gpu_render_part(g.gl,g.frac.code,"vec3 color = vec3(inx,inx,inx);",g.C_WIDTH,g.C_HEIGHT,g.LX,g.LY,g.width,g.frac.iterations,x1,y1,x2,y2,g.context_data,g.frac.julia,g.frac.juliaDot.R,g.frac.juliaDot.I)
  var data = g.context_data;
  for(let y = y1; y < y2; y++)
  {
     var s = (g.C_WIDTH*y+x1)*4
     for(let x = x1; x < x2; x++)
     {
        var color = g.colorize(data[s]/255.0);
        for(let i = 0; i < 3; i++) {data[s+i]=color[i];}
        s += 4;
     }
  }
}
function gpu_render(gl,code,colorize,width,height,x,y,size,iters,pixels)
{  
    gpu_render_part(gl,code,colorize,width,height,x,y,size,iters,0,0,width,height,pixels)
}

  

  
  
  
  