class MouseListener {
    
    constructor() {
        this.buttons = [false];
    }

    mouseDown() {
        this.buttons[0] = true;
    }

    mouseUp() {
        this.buttons[0] = false;
    }

}