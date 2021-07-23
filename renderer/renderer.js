class Renderer {
    
    constructor(gl, vs, fs, assetPool, maxBatchSize) {
        this.gl = gl;
        this.vs = vs;
        this.fs = fs;
        this.assetPool = assetPool;
        this.maxBatchSize = maxBatchSize;
        this.batches = [];

        this.batchIndex = 0;
        this.currentSpriteID = 0;
    }

    addSprite(sprite) {
        //before being added set id to the sprite, id: 0,1,2,3,4,...
        sprite.id = this.currentSpriteID;
        this.currentSpriteID++;

        let added = false;
        for(let i=0; i<this.batches.length; i++) {
            if(this.batches[i].hasRoom) {
                this.batches[i].addSprite(sprite);
                added = true;
                break;
            }
        }
        if(!added) {
            let newBatch = new RenderBatch(this.gl, this.vs, this.fs, this.assetPool, this.maxBatchSize);
            
            newBatch.start();
            this.batches[this.batchIndex] = newBatch;
            this.batchIndex++;

            newBatch.addSprite(sprite);
        }
        
    }

    removeSprite(spriteID) {
        for(let i=0; i<this.batches.length; i++) {
            for(let j=0; j<this.batches[i].spriteArray.length; j++) {
                if(this.batches[i].spriteArray[j] != null) {
                    if(this.batches[i].spriteArray[j].id == spriteID) {
                        this.batches[i].spriteArray[j] = null;
                        this.batches[i].freeIndices.push(j);
                        break;
                    }  
                }
            }
            this.batches[i].removeVerticesByID(spriteID);
            
            this.batches[i].numSprites--; 
            break;
        }
    }

    render() {
        for(let i=0; i<this.batches.length; i++) {
            //console.log('running');
            this.batches[i].render();
        }
        
    }
}