// Copyright 2010 Robert Scott Dionne. All Rights Reserved.

goog.provide('ray');

goog.require('ray.Key');
goog.require('ray.Keys');


var keys = new ray.Keys();


ray.load = function() {
  var canvas = document.getElementById('c');
  keys.install(window);
  canvas.width = 640;
  canvas.height = 640;
  var gl = canvas.getContext('experimental-webgl');
  var p = gl.createProgram();
  var b = gl.createBuffer();
  onCreate(gl, p, b);
  var width, height;
  window.setInterval(function() {
    if (width !== canvas.width || height !== canvas.height) {
      width = canvas.width;
      height = canvas.height;
      onChange(gl, width, height);
    }
    update();
    onDraw(gl, p, b);
  }, 10);
};


var X = 0;
var Y = 0;
var Z = 10;


var update = function() {
  if (keys.isDown(ray.Key.UP)) {
    Y += 0.1;
  }
  if (keys.isDown(ray.Key.DOWN)) {
    Y -= 0.1;
  }
  if (keys.isDown(ray.Key.LEFT)) {
    X -= 0.1;
  }
  if (keys.isDown(ray.Key.RIGHT)) {
    X += 0.1;
  }
  if (keys.isDown(65)) {
    Z += 0.1;
  }
  if (keys.isDown(90)) {
    Z -= 0.1;
  }
};

var onCreate = function(gl, p, b) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  var v = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(v, document.getElementById('v').text);
  var result = gl.compileShader(v);
  gl.compileShader(v);
  if (!gl.getShaderParameter(v, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(v));
  }
  gl.attachShader(p, v);
  gl.deleteShader(v); v = null;
  var f = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(f, document.getElementById('f').text);
  gl.compileShader(f);
  if (!gl.getShaderParameter(f, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(f));
  }
  gl.attachShader(p, f);
  gl.deleteShader(f); f = null;
  gl.linkProgram(p);
  gl.useProgram(p);

  p.position = gl.getAttribLocation(p, 'position');

  p.resolution = gl.getUniformLocation(p, 'resolution');
  p.sphere = gl.getUniformLocation(p, 'sphere');

  var data = [
    1.0, -1.0, 1.0,
    1.0,  1.0, 1.0,
   -1.0, -1.0, 1.0,
   -1.0,  1.0, 1.0
  ];

  var a = new Float32Array(data);
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, a.byteLength, gl.STATIC_DRAW);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, a);
};


var onChange = function(gl, width, height) {
  gl.viewport(0, 0, width, height);
};


var onDraw = function(gl, p, b) {
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  gl.uniform2fv(p.resolution,
      new Float32Array([gl.canvas.width, gl.canvas.height]));
  gl.uniform3fv(p.sphere, new Float32Array([X, Y, Z]));
  gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.vertexAttribPointer(p.position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(p.position);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.disableVertexAttribArray(p.position);
  gl.flush();
};
