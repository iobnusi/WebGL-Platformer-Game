var lastFrameTimeMs = 0;
var lastFpsUpdate = 0;
var framesThisSecond = 0;
var fps = 0;
var count = 0.0;
var maxFPS = 120;
var timestep = 1000/120;
var delta = 0;
let header = document.getElementById('header');

function start() {
    setup();
    loop();
}

function setup() {
    window.game.setup();
}

function loop(timestamp) {
    
    //requestAnimationFrame(loop);
    
        if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
            requestAnimationFrame(loop);
            return;
        }
        if(typeof timestamp != 'undefined') {

            //calculating amount of time passed in one loop
            delta += timestamp - lastFrameTimeMs;
            lastFrameTimeMs = timestamp;

            //calculating average FPS
            if (timestamp > lastFpsUpdate + 1000) {
                fps = 0.25 * framesThisSecond + 0.75 * fps;
        
                lastFpsUpdate = timestamp;
                framesThisSecond = 0;
            }
            framesThisSecond++;
            header.textContent = Math.round(fps) + 'FPS';

            //algorithm for keeping up the lag between game loop and real time 
            var numOfUpdateSteps = 0;
            while (delta >= timestep) {
                
                window.game.update(timestep/1000, count);
                count += timestep/1000;
                delta -= timestep;
                //if browser lags for too long
                if(++numOfUpdateSteps >= 240) {
                    delta = 0;
                    break;
                }
            }
            requestAnimationFrame(loop);

        } else {
            requestAnimationFrame(loop);
            return;
        }
}

class Game {
    
    constructor(innerWidth, innerHeight) {
        //create canvas
        this.canvasElm = document.createElement("canvas");
        this.canvasElm.setAttribute("id", "gameScreen");
        this.canvasElm.width = innerWidth;
        this.canvasElm.height = innerHeight;

        //initialize world Matrix and resize canvas
        this.worldMatrix = glMatrix.mat4.create();
        //this.resizeCanvas(1000, 600);

        //initialize webgl and set bg color
        this.gl = this.canvasElm.getContext("webgl2");
        //set this option to prevent rextures from loading upside down
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        //sets the bg color of the canvas
        this.gl.clearColor(0.094, 0.105, 0.129,1.0);
        
        //add canvas element to html
        document.body.appendChild(this.canvasElm);    
        //this.gatherRenderables();
    }

    gatherRenderables() {
        this.renderables = { 
            objects : [
  
                          
            ]
        }
    }

    resizeCanvas(x, y) {
        let mat4 = glMatrix.mat4;
        let ratio = 1;
        this.canvasElm.width = x;
        this.canvasElm.height = y;
        this.worldMatrix = mat4.create();

        if(x>y) {
            ratio = x/y;
            mat4.scale(this.worldMatrix, this.worldMatrix, [1/ratio,1,1]);
        } else if(y>x) {
            ratio = y/x;
            mat4.scale(this.worldMatrix, this.worldMatrix, [1,1/ratio,1]);
        } else {
            mat4.scale(this.worldMatrix, this.worldMatrix, [1,1,1]);
        }
      
    }

    setup() {
        
        //initialize mouseListener
        this.mouseListener = new MouseListener();

        //setup mouse listener events to canvas
        const testCanvas = document.getElementById("gameScreen");
        testCanvas.addEventListener("mousedown",  ev => this.mouseDown(ev));
        testCanvas.addEventListener("mouseup", ev => this.mouseUp(ev));
        
        //import shaders from html file
        let vs = document.getElementById("vs_01").innerHTML;
        let fs = document.getElementById("fs_01").innerHTML;
        
        //initialize spritesheet
        this.assetPool = new AssetPool();
        
        //load textures
        this.assetPool.addTexture(new Texture(this.gl, "res/characterSpriteSheet.png"));
        this.assetPool.addTexture(new Texture(this.gl, "res/runAnim2.png"));
        this.assetPool.addTexture(new Texture(this.gl, "res/stoneTile.png"));
        this.assetPool.addTexture(new Texture(this.gl, "res/gamebg.png"));
        this.assetPool.addTexture(new Texture(this.gl, "res/spike.png"));


        //initialize scene
        this.scene = new Scene(this.gl, vs, fs, this.assetPool, this.mouseListener);
        this.scene.init();
        this.scene.start();
    
    } 

    update(delta,count) {
        this.gl.viewport(0, 0, this.canvasElm.width, this.canvasElm.height);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT); //refresh canvas every update

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.flush();
       
        //update current scene
        this.scene.update(delta,count);
        
    }

    getWorldMatrix() {
        return this.worldMatrix;
    }

    static getCanvasWidth() {
        return 1280;
    }

    static getCanvasHeight() {
        return 720;
    }

    mouseDown(ev) {
        // console.log(ev;
        this.mouseListener.mouseDown();

    }

    mouseUp(ev) {
        // console.log(ev);
        this.mouseListener.mouseUp();
    }
}