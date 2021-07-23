class AssetPool {

    constructor() {
        this.textureArray = [];
    }

    static rotateBy90Matrix() {
        let matrix = glMatrix.mat4.create();
        
        return matrix;
    }

    addTexture(texture) {
        if(texture instanceof Texture) {
            this.textureArray.push(texture);
            console.log(texture.imgLoaded);
        } else {
            console.error("Error: Added texture was not of class Texture");
            return;
        }
    }

    getTexture(texturePath) {
        if(this.textureArray == undefined || this.textureArray.length == 0) {
            console.error("Error: There are no textures loaded in class AssetPool");
            return;
        }
        for(let i=0; i<this.textureArray.length; i++) {
            
            if(this.textureArray[i].imgPath===texturePath) {
                return this.textureArray[i].texture;
            }
            
        }
        
    }
}