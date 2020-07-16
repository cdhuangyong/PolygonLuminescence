
function FBO(gl){

	this.gl = gl;
	this.width = gl.drawingBufferWidth;
	this.height = gl.drawingBufferHeight;
	//创建一个纹理对象
	var texture = this.texture = gl.createTexture();
	//使用如下的设置来创建texture，这样对texture的设置可以使我们对任何尺寸的图片进行处理
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width , this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

	var fb = this.buffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER,fb);
	//使用该方法将texture的颜色值与FBO进行绑定
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

}

FBO.prototype = {
	bind:function(){
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.buffer);
		this.updateSize();
	},
	unbind:function(){
		this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
	},
	updateSize:function(){
		var gl = this.gl;
		if(this.width != gl.drawingBufferWidth || this.height != gl.drawingBufferHeight){
			this.width = gl.drawingBufferWidth;
			this.height = gl.drawingBufferHeight;
			gl.bindTexture(gl.TEXTURE_2D, this.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
		}
	}
}
