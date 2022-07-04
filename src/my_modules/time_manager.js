"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeManager = exports.CycleObject = void 0;
class CycleObject {
    constructor(state) {
        if (state)
            this.state = state;
        else
            this.state = true;
        return (this);
    }
    get() {
        return (this.state);
    }
    set(state) {
        this.state = state;
    }
}
exports.CycleObject = CycleObject;
class TimeManager {
    constructor(cycleState, startingTime) {
        const cycle = new CycleObject(cycleState);
        this.cycle = cycle;
        console.log(this.cycle);
        if (startingTime)
            this.time = startingTime;
        else
            this.time = Date.now();
        this.timeCycle();
    }
    setTime(time) {
        switch (typeof (time)) {
            case ("string"): {
                break;
            }
            case ("number"): {
                this.time = Number(time);
                break;
            }
        }
    }
    getTime() {
        return this.time;
    }
    timeAdd() {
        if (this.cycle.get())
            this.setTime(this.getTime() + 10 * 60 * 1000);
    }
    timeCycle() {
        setInterval(this.timeAdd, 10000);
    }
}
exports.TimeManager = TimeManager;
//# sourceMappingURL=time_manager.js.map