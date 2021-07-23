class RenderBatch {

    constructor(gl, vs, fs, assetPool, maxBatchSize) {

        this.POS_SIZE = 3;
        this.COLOR_SIZE = 4;
        this.TEX_COORDS_SIZE = 2;
        this.TEX_ID_SIZE = 1;
        this.FLOAT_BYTESIZE = 4;
        this.SPRITE_ID_SIZE = 1;

        this.SPRITE_ID_OFFSET = 0;
        this.POS_OFFSET = this.SPRITE_ID_OFFSET + this.SPRITE_ID_SIZE * this.FLOAT_BYTESIZE;
        this.COLOR_OFFSET = this.POS_OFFSET + this.POS_SIZE * this.FLOAT_BYTESIZE;
        this.TEX_COORDS_OFFSET = this.COLOR_OFFSET + this.COLOR_SIZE * this.FLOAT_BYTESIZE;
        this.TEX_ID_OFFSET = this.TEX_COORDS_OFFSET + this.TEX_COORDS_SIZE * this.FLOAT_BYTESIZE;

        this.VERTEX_SIZE = this.POS_SIZE + this.COLOR_SIZE + this.TEX_COORDS_SIZE + this.TEX_ID_SIZE + this.SPRITE_ID_SIZE;
        this.VERTEX_BYTESIZE = this.VERTEX_SIZE * this.FLOAT_BYTESIZE;
        this.VERTEX_PER_SPRITE = 4;

        this.gl = gl;
        this.assetPool = assetPool;
        this.shader = new Shader(gl, vs, fs);
        
        this.maxBatchSize = maxBatchSize;

        this.numAllocatedSpriteData = 0;
        this.numSprites = 0;
        this.hasRoom = true;
        
        this.freeIndices = []; //stores the indices of a sprite's id thats ready to be overwritten
        this.vertexArray = [];
        this.spriteArray = [];
        this.texSlots = [0,1,2,3,4,5,6,7];
        this.textures = [0];
    }

    start() {
        let gl = this.gl;
        // Generate and bind a Vertex Array Object
        this.vaoID = gl.createVertexArray();
        gl.bindVertexArray(this.vaoID);

        // Allocate space for vertices
        this.vboID = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vboID);
        gl.bufferData(gl.ARRAY_BUFFER, this.maxBatchSize*this.VERTEX_PER_SPRITE*this.VERTEX_BYTESIZE, gl.DYNAMIC_DRAW); //use size in bytes you idiot 

        // Create and upload indices buffer
        const eboID = gl.createBuffer();
        const indices = this.generateIndices();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, eboID);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW, 0);

        // Enable the buffer attribute pointers
        gl.vertexAttribPointer(0, this.POS_SIZE, gl.FLOAT, false, this.VERTEX_BYTESIZE, this.POS_OFFSET);
        gl.enableVertexAttribArray(0);
 
        gl.vertexAttribPointer(1, this.COLOR_SIZE, gl.FLOAT, false, this.VERTEX_BYTESIZE, this.COLOR_OFFSET);
        gl.enableVertexAttribArray(1);

        gl.vertexAttribPointer(2, this.TEX_COORDS_SIZE, gl.FLOAT, false, this.VERTEX_BYTESIZE, this.TEX_COORDS_OFFSET);
        gl.enableVertexAttribArray(2);

        gl.vertexAttribPointer(3, this.TEX_ID_SIZE, gl.FLOAT, false, this.VERTEX_BYTESIZE, this.TEX_ID_OFFSET);
        gl.enableVertexAttribArray(3);

        this.setup();
        
    }

    addSprite(sprite) {
        if(this.freeIndices.length > 0) {
            var spriteArrIndex;
            for(let i=0; i<this.spriteArray.length; i++) {
                if(this.spriteArray[i] == null) {
                    this.spriteArray[i] = sprite;
                    spriteArrIndex = i;
                    break;
                }
            }

            this.numSprites++;

            if(sprite.getTexture() != null) {
                if(!this.textures.includes(sprite.getTexture())) {
                    this.textures.push(sprite.getTexture());
                }
            }
            
            this.loadVertexProperties(this.freeIndices[0]);
            
            this.freeIndices.splice(0,1);
        } 
        else {
            this.spriteArray.push(sprite);
            this.numAllocatedSpriteData++;
            this.numSprites++;

            if(sprite.getTexture() != null) {
                if(!this.textures.includes(sprite.getTexture())) {
                    this.textures.push(sprite.getTexture());
                }
            }
            // Add properties to local vertices array
            this.loadVertexProperties(this.spriteArray.length-1);

            if (this.numAllocatedSpriteData >= this.maxBatchSize) {
                this.hasRoom = false;
            }
        }
        
    } 

    setup() {
        let gl = this.gl;

        gl.useProgram(this.shader.program);

        //setup uniforms
        const imageLocation = gl.getUniformLocation(this.shader.program, "uImages");
        gl.uniform1iv(imageLocation, this.texSlots);

        const rotateBy90MatrixLocation = gl.getUniformLocation(this.shader.program, "uWorldMat");
        gl.uniformMatrix4fv(rotateBy90MatrixLocation, false, AssetPool.rotateBy90Matrix());
        
        gl.useProgram(null);
    }

    render() {
        let reloadData = false;
        for(let i=0; i<this.spriteArray.length; i++) {
            if(this.spriteArray[i] != null) {
                if(this.spriteArray[i].isDirty) {
                    // console.log(this.spriteArray[i].isDirty);
                    this.loadVertexProperties(i);
                    this.spriteArray[i].setClean();
                    reloadData = true;
                }   
            }
            
        }
    
        if(this.justRemovedSprite) {
            //console.log(this.spriteArray.length);
            for(let i=0; i<this.spriteArray.length; i++) {
                this.loadVertexProperties[i];
            }    
            this.justRemovedSprite = false; 
        }

        let gl = this.gl;

        gl.useProgram(this.shader.program);

        //For now, we will rebuffer all data every frame
        if(reloadData) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vboID);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(this.vertexArray), 0);
        }
        
        //upload uniforms 
        // const worldMatLocation = gl.getUniformLocation(this.shader.program, "uWorldMat");
        // gl.uniformMatrix4fv(worldMatLocation, false, this.game.getWorldMatrix());

        //upload textures
        for (let i=0; i<this.textures.length; i++) {
            gl.activeTexture(gl.TEXTURE0 + i + 1);
            //gl.bindTexture(gl.TEXTURE_2D, this.textures[i+1]);
            let currentTexture = this.assetPool.getTexture(this.textures[i+1])
            if(currentTexture != undefined) {
                gl.bindTexture(gl.TEXTURE_2D, currentTexture);
            }
            
        }

        gl.bindVertexArray(this.vaoID);
        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.drawElements(gl.TRIANGLES, this.numAllocatedSpriteData * 6, gl.UNSIGNED_SHORT, 0); //use unsigned short because webgl is shit

        gl.disableVertexAttribArray(0);
        gl.disableVertexAttribArray(1);
        gl.disableVertexAttribArray(2);
        gl.disableVertexAttribArray(3);
        gl.bindVertexArray(null);

        gl.useProgram(null);
    }

    loadVertexProperties(index) {
        let sprite = this.spriteArray[index];

        // Find offset within array (4 vertices per sprite)
        let offset = index * this.VERTEX_PER_SPRITE * this.VERTEX_SIZE;

        let color = sprite.getColor();

        let texCoords = sprite.getTexCoords();
        let texID = 0;
        if(sprite.getTexture() != null) {
            for(let i=0; i<this.textures.length; i++) {
                if(this.textures[i] == sprite.getTexture()) {
                    texID = i;
                    break;
                } 
            } 
        }
       

        let xAdd = 1.0;
        let yAdd = -1.0;
        for(let i=0; i<4; i++) {
            let vertexArray = this.vertexArray;
            if (i == 1) {
                yAdd = 1.0;
            } else if (i == 2) {
                xAdd = -1.0;
                yAdd = 1.0;
            } else if (i == 3) {
                yAdd = -1.0;
            }
            //Add sprite's id each of the sprite's vertex will have this id
            vertexArray[offset] = sprite.id;
            // Add pos attribute
            vertexArray[offset+1] = sprite.getPosVec2()[0] + xAdd * sprite.getScaleVec2()[0];       //x Position
            vertexArray[offset+2] = sprite.getPosVec2()[1] + yAdd * sprite.getScaleVec2()[1];     //y Position
            vertexArray[offset+3] = 0.0;
             // Add color attribute
            vertexArray[offset+4] = color[0];
            vertexArray[offset+5] = color[1];
            vertexArray[offset+6] = color[2];
            vertexArray[offset+7] = color[3];
             // Add UV attribute
            vertexArray[offset+8] = texCoords[2*i];
            vertexArray[offset+9] = texCoords[2*i+1];
             // Add texID attribute
            vertexArray[offset+10] = texID;

            offset += this.VERTEX_SIZE;
        }
       
    }

    generateIndices() {
        let elements = [];
        for(let i=0; i<this.maxBatchSize; i++) {
            this.loadElementIndices(elements, i);
        }
        return elements;
    }

    loadElementIndices(elements, index) {
        let offsetArrayIndex = 6 * index;
        let offset = 4 * index;

        // 3, 2, 0, 0, 2, 1        7, 6, 4, 4, 6, 5
        // Triangle 1
        elements[offsetArrayIndex] = offset + 1;
        elements[offsetArrayIndex + 1] = offset + 2;
        elements[offsetArrayIndex + 2] = offset + 0;

        // Triangle 2
        elements[offsetArrayIndex + 3] = offset + 0;
        elements[offsetArrayIndex + 4] = offset + 2;
        elements[offsetArrayIndex + 5] = offset + 3;

    }

    hasRoom() {
        return this.hasRoom;
    }

    removeVerticesByID(vertexId) {
        for(let i=0; i<this.vertexArray.length/this.VERTEX_SIZE; i++) {
            if(this.vertexArray[i*this.VERTEX_SIZE] == vertexId) {
                for(let j=0; j<this.VERTEX_PER_SPRITE*this.VERTEX_SIZE; j++) {
                    if(j % this.VERTEX_SIZE == 0) {
                        this.vertexArray[(i*this.VERTEX_SIZE) + j] = -1 //id of -1 means that this vertex is marked as "deleted" and can be overwritten
                        //this.freeIndices.push(i*this.VERTEX_SIZE + j);
                    } else this.vertexArray[(i*this.VERTEX_SIZE) + j] = 0;
                }
                break;
            }
        }
    }
}