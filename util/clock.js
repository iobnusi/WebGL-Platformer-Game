class Clock {

    constructor(timer) {
        this.happenedAlr = false;
        this.firstTime = true;
        this.timer = timer;
        this.tick = false;
    }

    update(count) {
        if(Math.floor(count) % this.timer == 0) {
            if(!this.happenedAlr) {
                this.tick = true;
                this.happenedAlr = true;
            } else this.tick = false;
        } else {
            this.happenedAlr = false;
        }
    }
}