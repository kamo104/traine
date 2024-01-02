// game constants and variables
import {constants} from "../constants";
import {variables} from "../variables";
import { keyBindings } from "../keyBindings";

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
    timeAdd(addAmount:number):void{
        this.time+=addAmount;
    }
    // timeCycle():void{
    //     setInterval(this.timeAdd,constants.TIME_UPDATE_INTERVAL,this);
    // }

    constructor(cycleState:boolean, startingTime?:number){
        this.cycle = new CycleObject(cycleState);
        if(startingTime!==undefined) this.time = startingTime;
        else this.time = Date.now();
        // this.timeCycle();
    }
}