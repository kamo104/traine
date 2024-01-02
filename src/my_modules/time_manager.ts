import { ServerOptions } from "../serverOptions";

export class CycleObject{
    state:boolean;
    get(){
        return(this.state);
    }
    set(state:boolean){
        this.state = state;
    }
    constructor(state?:boolean){
        if(state!==undefined) this.state = state;
        else this.state = true;
        // return(this);
    }
}

export class TimeManager{
    
    private time:number;

    cycle:CycleObject;


    setTime(time:number){
        this.time = Number(time);
    }
    getTime():number{
        return this.time;
    }
    timeAdd(amount:number){
        this.setTime(this.getTime()+amount);
    }
    timePass(scope:this):void{
        if(scope.cycle.get()) scope.timeAdd(ServerOptions.TIME_SCALE*ServerOptions.TIME_UPDATE_INTERVAL);
    }
    timeCycle():void{
        setInterval(this.timePass,ServerOptions.TIME_UPDATE_INTERVAL,this);
    }

    constructor(cycleState:boolean, startingTime?:number){
        this.cycle = new CycleObject(cycleState);
        if(startingTime!==undefined) this.time = startingTime;
        else this.time = ServerOptions.DEFAULT_TIME;
        this.timeCycle();
    }
}