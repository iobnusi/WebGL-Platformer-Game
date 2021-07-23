class Texture {

    constructor(gl, imgPath) {
        this.gl = gl;
    
        this.imgPath = imgPath;
        this.texture = this.loadImage();
        this.imgLoaded = false;
    }

    loadImage() {
        //todo add here
        let gl = this.gl;

        const texture = gl.createTexture();
        const image = new Image();
        console.log("trying to load image");
        image.onload =  e => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            this.imgLoaded = true;
            console.log("image loaded");
        };
        
        image.src = this.imgPath;
        
        return texture;
    }
}