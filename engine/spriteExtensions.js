class Character extends Sprite {

    constructor(gl, startingPosX, startingPosY, sizeX, sizeY, color, imageURL=null, imgWidth, imgHeight, sprWidth, sprHeight) {
        super(gl, startingPosX, startingPosY, sizeX, sizeY, color, imageURL);

        this.imgWidth = imgWidth;
        this.imgHeight = imgHeight;
        this.sprWidth = sprWidth;
        this.sprHeight = sprHeight;
    }

    setup() {
        super.setup();

        //SETTING UP FRAMES FOR ANIMATIONS
        this.animHandler = new AnimHandler(5, this.imgWidth/this.sprWidth,this.imgHeight/this.sprHeight, this.sprWidth/this.imgWidth);
        this.animHandler.setAnimation(0);

        this.vx = 0;
        this.vy = 0; //10 px per frame

        this.ax = 0;
        this.ay = 0;
        this.g = -0.1;
    
        this.isJumping = false

        this.isDirty = true;
    }

    update(delta,count) {
        super.update(delta,count);
        
        //ANIMATIONS------------------------------------------------------------------

        //set animations when jumping/running
        this.animHandler.calcFrames(count);
        
        let frameVec2 = this.animHandler.calcFrames(count);
    
        this.setTextureCoords(frameVec2[0], frameVec2[0]-this.sprWidth/this.imgWidth,frameVec2[1],frameVec2[1]-this.sprHeight/this.imgHeight);
        //this.setTextureCoords(1, 1-this.sprWidth/this.imgWidth,1,1-this.sprHeight/this.imgHeight);

        //-----------------------------------------------------------------------------

        //PHYSICS----------------------------------------------------------------------

        this.vy += (this.ay + this.g);

        //set vy cap
        if(this.vy > 3) {
            this.vy = 3;
        }
        //set y pos boundary
        if(this.getPixelPosY() <= 64 && this.vy < 0) {
            this.vy = 0;
            this.setPixelPosY(64);
        } 
        if(this.getPixelPosY() >= 200) {
            this.ay=0;
        }

        this.addPos(this.vx*delta, this.vy*delta);

        //-----------------------------------------------------------------------------
    }
}

class Tile extends Sprite {

    constructor(gl, startingPosX, startingPosY, sizeX, sizeY, color, imagePath=null) {
        super(gl, startingPosX, startingPosY, sizeX, sizeY, color, imagePath);
    }

    setup() {
        super.setup();

        this.vx = 0;
        this.vy = 0; 

        this.ax = 0;
        this.ay = 0;

        this.isDirty = true;
    }

    update(delta, count) {
        super.update(delta, count);

        if(this.getPixelPosX() < -1*this.sizeX) {
            this.setPixelPosX(1275);
        }
        
        this.addPos(this.vx*delta, this.vy*delta); 
    }

    
}

class Background extends Sprite {

    constructor(gl, startingPosX, startingPosY, sizeX, sizeY, color, imagePath=null) {
        super(gl, startingPosX, startingPosY, sizeX, sizeY, color, imagePath);
    }

    setup() {
        super.setup();

        this.vx = 0;
        this.vy = 0; 

        this.ax = 0;
        this.ay = 0;

        this.isDirty = true;
    }

    update(delta, count) {
        super.update(delta, count);

        if(this.getPixelPosX() < -1*this.sizeX) {
            this.setPixelPosX(1275);
        }

        this.addPos(this.vx*delta, this.vy*delta); 
    }

}
