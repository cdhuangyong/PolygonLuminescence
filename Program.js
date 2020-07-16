function Program(options){

	var gl = this.gl = options.gl;

	this.vertexShaderSource = options.vertexShaderSource;
	this.fragmentShaderSource = options.fragmentShaderSource;

	this.vertexShader = gl.createShader(gl.VERTEX_SHADER)
	gl.shaderSource(this.vertexShader,this.vertexShaderSource);
	gl.compileShader(this.vertexShader);

	if (!gl.getShaderParameter(this.vertexShader,gl.COMPILE_STATUS)) {
		throw "Shader Compile Error: " + (gl.getShaderInfoLog(this.vertexShader));
	}

	this.fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(this.fragmentShader,this.fragmentShaderSource);
	gl.compileShader(this.fragmentShader);

	if (!gl.getShaderParameter(this.fragmentShader,gl.COMPILE_STATUS)) {
		throw "Shader Compile Error: " + (gl.getShaderInfoLog(this.fragmentShader));
	}

	var program = this.program = gl.createProgram();
	gl.attachShader(program, this.vertexShader);
	gl.attachShader(program, this.fragmentShader);
	gl.linkProgram(program);



	//
	var attributes = options.attributes || [];
	var attrs = this.attributes = {};
	var attr , loc , buffer;
	for(var i = 0 ; i < attributes.length ; i ++){
		attr = attributes[i];
		//当前点
		loc = gl.getAttribLocation(program,attr.name);
		buffer = gl.createBuffer();
		if(attr.data){
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, attr.data, gl.STATIC_DRAW);
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
		}
		attrs[attr.name] = {
			loc:loc,
			buffer:buffer,
			size:attr.size
		}
	};

	var uniforms = options.uniforms || [];
	var u = this.uniforms = {};
	for(var i = 0 ; i < uniforms.length ; i ++){
		var uniform = uniforms[i];
		(function(name,value,type){
			var update = true;
			u[name] = {};
			Object.defineProperty(u[name],"value",{
				get:function(){
					return value
				},
				set:function(newValue){
					if(newValue != value){
						update = true;
					}
					value = newValue;
				}
			});
			u[name].loc = gl.getUniformLocation(program,name);
			u[name].update = function(){
				if(!value || !update)return;
				if(type){
					gl[type](u[name].loc,value);
				}else if(typeof value === "number"){
					gl.uniform1f(u[name].loc,value);
				}else if(typeof value === "object"){
					if(value.length <= 4){
						gl["uniform"+value.length+"fv"](u[name].loc,value);
					}else{
						gl["uniformMatrix"+Math.sqrt(value.length)+"fv"](u[name].loc,false,value);
					}
				}
				update = false
			}
		})(uniform.name,uniform.value,uniform.type);
	}




	this.indexesBuffer = gl.createBuffer();

	this.indexeLength = 0;

	if(options.indexes){
		this.indexes(options.indexes);
	}

}

Program.prototype = {

	use:function(){
		this.gl.useProgram(this.program);
	},

	bufferData:function(name,data){
		var gl = this.gl;
		var attr = this.attributes[name];
		gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	},

	indexes:function(indexes){
		var gl = this.gl;
		this.indexeLength = indexes.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexesBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	},

	bindBuffers:function(){
		var gl = this.gl;
		for(var name in this.attributes){
			var attr = this.attributes[name];
			gl.bindBuffer(gl.ARRAY_BUFFER, attr.buffer);
			gl.vertexAttribPointer(attr.loc, attr.size, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(attr.loc);
		}
	},

	updateUniforms:function(){
		for(var name in this.uniforms){
			this.uniforms[name].update();
		}
	},

	render(){

		var gl = this.gl;
		this.bindBuffers();
		this.updateUniforms();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexesBuffer);
		gl.drawElements(gl.TRIANGLES, this.indexeLength, gl.UNSIGNED_SHORT,0);

	}
}