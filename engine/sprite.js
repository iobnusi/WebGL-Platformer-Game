class Sprite {

    constructor(gl, startingPosX, startingPosY, sizeX, sizeY, color, imagePath=null) {
        
        this.gl = gl;
        
        this.startingPosX = startingPosX;
        this.startingPosY = startingPosY;
        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.color = color;
        this.imagePath = imagePath;
    
    }

    setup() {

        this.id; //will be instantiated in render class after being added

        this.isOutOfBounds = false;

        this.texCoords = [ 
            1,0, //v0
            1,1, //v1
            0,1, //v2
            0,0, //v3
        ];

        this.vec2 = glMatrix.vec2;
        let vec2 = this.vec2;
        let gameCanvasWidth = Game.getCanvasWidth();
        let gameCanvasHeight = Game.getCanvasHeight();
        
        //SETTING UP POSITION AND SCALE
        this.scaleVector = this.vec2.create();
        this.currentPosVector = this.vec2.create();
        this.newPosVector = this.vec2.create();

        vec2.set(this.scaleVector, this.sizeX/gameCanvasWidth, this.sizeY/gameCanvasHeight);
        vec2.set(this.currentPosVector, (this.startingPosX/(gameCanvasWidth/2)) - 1 + this.sizeX/1280, this.startingPosY/(gameCanvasHeight/2) - 1 + this.sizeY/720);
        vec2.copy(this.newPosVector, this.currentPosVector);
        
        //SETTING UP TEXTURES
        if(this.imagePath!=null) {
            this.texture = this.imagePath;
            this.color = [1.0,1.0,1.0,1.0]; //if there is image loaded then color is set to white
        } else {
            this.texture = null;
        }

        
    }

    update(delta,count) {
        let vec2 = this.vec2;
        
        if(!(vec2.equals(this.currentPosVector, this.newPosVector))) {
            vec2.copy(this.currentPosVector, this.newPosVector);
            this.isDirty = true;
        }
       
    }

    getColor() {
        return this.color;
    }

    getScaleVec2() {
        return this.scaleVector;
    }

    getPosVec2() {
        return this.currentPosVector;
    }

    getTexture() {
        return this.texture;
    }

    getTexCoords() {
        return this.texCoords;
    }

    loadImage() {
        let gl = this.gl;

        const texture = gl.createTexture();
        const image = new Image();

        image.onload =  e => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

            gl.generateMipmap(gl.TEXTURE_2D);
        };

        image.src = this.imagePath;
        
        return texture;
    }
    
    setClean() {
        this.isDirty = false;
    }

    transformPos(x=this.currentPosVector[0],y=this.currentPosVector[1]) {
        this.vec2.set(this.newPosVector, x, y);
    }
    
    addPos(x,y) {
        let operand = this.vec2.create();
        this.vec2.set(operand, x, y);
        this.vec2.add(this.newPosVector, this.newPosVector, operand);
    }

    setTextureCoords(uvXright, uvXleft, uvYup, uvYdown) {
        this.texCoords = [
            uvXright,uvYdown,   //v0
            uvXright,uvYup, //v1
            uvXleft,uvYup,   //v2
            uvXleft,uvYdown,     //v3
        ];

        this.isDirty = true;
    }

    //returns the bottom left corner pixel X coordinate of that object
    getPixelPosX() {
        let widthCoeff = Game.getCanvasWidth()/2;
        return Math.round((this.currentPosVector[0] - (this.sizeX/Game.getCanvasWidth()) + 1) * widthCoeff);
    }

    //returns the bottom left corner pixel Y coordinate of that object
    getPixelPosY() {
        let heightCoeff = Game.getCanvasHeight()/2;
        return Math.round((this.currentPosVector[1] - (this.sizeY/Game.getCanvasHeight()) + 1) * heightCoeff);
    }

    setPixelPosX(x) {
        let normX = (x/(Game.getCanvasWidth()/2)) - 1 + this.sizeX/1280;
        this.transformPos(normX);
    }

    setPixelPosY(y) {
        let normY = (y/(Game.getCanvasHeight()/2)) - 1 + this.sizeY/720;
        this.transformPos(undefined ,normY);
    }

    // addPixelPosX(x) {
    //     let normX = (x/(Game.getCanvasWidth()/2)) - 1 + this.sizeX/1280;
    //     this.addPos(normX, 0);
    // }

    // addPixelPosY(y) {
    //     let normY = (y/(Game.getCanvasHeight()/2)) - 1 + this.sizeY/720;
    //     this.addPos(0 ,normY);
    // }
 }