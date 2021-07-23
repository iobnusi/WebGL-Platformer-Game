class Scene {

    constructor(gl, vs, fs, assetPool, mouseListener) {
        this.gl = gl;
        this.assetPool = assetPool;
        this.mouseListener = mouseListener;
        this.renderer = new Renderer(gl, vs, fs, assetPool, 1000);

        this.isRuninng = false;
        this.spriteArray = [];

        this.sprNum = 0;

        this.levelStarted = false;
        this.levelSpeed = 0;

    }

    init() {

        //add bg to scene
        let bgSprite1 = new Background(this.gl, 0, 64, 1280, 720, 0, `res/gamebg.png`);
        let bgSprite2 = new Background(this.gl, 1280, 64, 1280, 720, 0, `res/gamebg.png`);
        bgSprite1.setup();
        bgSprite2.setup();
        this.addSpriteToScene(bgSprite1);
        this.addSpriteToScene(bgSprite2);
        
        //add spikes to scene
        let spike1 = new Tile(this.gl, 600, 64, 128, 128, 0, `res/spike.png`);
        spike1.setup();
        this.addSpriteToScene(spike1);
        let spike2 = new Tile(this.gl, 1100, 64, 128, 128, 0, `res/spike.png`);
        spike2.setup();
        this.addSpriteToScene(spike2);

        //add floors to scene
        for(let i=0; i<11; i++) {
            let floorSprite = new Tile(this.gl, 128*i, -64, 128, 128, 0, `res/stoneTile.png`);
            floorSprite.setup();
            this.addSpriteToScene(floorSprite);
        }
        
        //add character to scene
        let char1 = new Character(this.gl,128,64,144,288,0, `res/characterSpriteSheet.png`, 192, 320, 32, 64);
        char1.setup();
        this.addSpriteToScene(char1);
        
        

    }

    update(delta,count) {
        
        //update sprite data, remove sprites if out of bounds
        for(let i=0; i<this.spriteArray.length; i++) {
            
            this.spriteArray[i].update(delta,count);
        
        }
        let character = this.spriteArray[15];

        if(this.mouseListener.buttons[0] && !this.levelStarted) {   
            this.levelStarted = true;
            this.levelSpeed = 0.5;
            for(let i=0; i<15; i++) {
                if(i==0 || i==1) this.spriteArray[i].vx = -(this.levelSpeed/5);
                else this.spriteArray[i].vx = -(this.levelSpeed);
            }
        } 

        if(!this.levelStarted) {
            character.animHandler.setAnimation(0, 4);
        } else {
            if(character.getPixelPosY()>64) {
                character.animHandler.setAnimation(4);
            } else {
                character.animHandler.setAnimation(2);
            }
    
            if(this.mouseListener.buttons[0]) {   
                if(character.getPixelPosY() == 64) {
                    character.ay = 0.3;
                }
            } else {
                character.ay = 0;
            }
        }

        //render sprite using sprite data
        this.renderer.render();

    }

    start() {
        for(let i=0; i<this.spriteArray.length; i++) {
            this.renderer.addSprite(this.spriteArray[i]);
        }
        
        this.isRunning = true;
    }

    addSpriteToScene(sprite) {
        if(!this.isRunning) {
            this.spriteArray.push(sprite);
        } else {
            this.spriteArray.push(sprite);
            this.renderer.addSprite(sprite);
        }
    }

    removeSpriteFromScene(spriteID) {
        this.spriteArray.splice(spriteID, 1);
        this.renderer.removeSprite(spriteID);
    }
}