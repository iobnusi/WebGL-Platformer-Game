class AnimHandler {

    constructor(animSpeed, numOfFramesPerRow, numOfRow, sprWidth) {
        this.animSpeed = animSpeed;
        this.numOfFramesPerRow = numOfFramesPerRow;
        this.animAmountMax = numOfRow;
        this.sprWidth = sprWidth;

        this.frameAmount;

        this.frameVec2 = glMatrix.vec2.create();
    }

    setAnimation(animTypeIndex, numOfFrames=this.numOfFramesPerRow) {
        if(animTypeIndex>this.animAmountMax-1) {
            console.error("Error : Animation index out of bounds");
            return;
        } 
        this.animTypeIndex = 1-(animTypeIndex/this.animAmountMax);
        this.frameAmount = numOfFrames;
    }

    calcFrames(count) {
        if(this.animTypeIndex==undefined) {
            console.error(`Error : No animation has been set for this sprite. Use AnimHandler.setAnimation(animTypeIndex) to set animations.`);
            return;
        }
        
        let currentframeNum = (Math.floor(count*this.animSpeed) % this.frameAmount) + 1;
        let currentFrameCoord;
        if(this.frameAmount<this.numOfFramesPerRow) {
            let boundary = this.sprWidth * this.frameAmount;
            currentFrameCoord = currentframeNum/this.frameAmount * boundary;
        } else {
            currentFrameCoord = currentframeNum/this.frameAmount;
        }
        
        glMatrix.vec2.set(this.frameVec2, currentFrameCoord, this.animTypeIndex);
        
        return this.frameVec2;

    }

    
}