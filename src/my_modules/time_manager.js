"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeManager = exports.CycleObject = void 0;
class CycleObject {
    constructor(state) {
        if (state)
            this.state = state;
        else
            this.state = true;
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
        this.cycle = new CycleObject(cycleState);
        if (startingTime)
            this.time = startingTime;
        else
            this.time = Date.now();
        this.timeCycle();
    }
    setTime(time) {
        this.time = Number(time);
    }
    getTime() {
        return this.time;
    }
    timeAdd(scope) {
        if (scope.cycle.get())
            scope.setTime(scope.getTime() + 10 * 60 * 1000);
    }
    timeCycle() {
        setInterval(this.timeAdd, 10000, this);
    }
}
exports.TimeManager = TimeManager;
//# sourceMappingURL=time_manager.js.map