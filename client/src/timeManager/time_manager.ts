export class CycleObject{
    state:boolean;
    get(){
        return(this.state);
    }
    set(state:boolean){
        this.state = state;
    }
    constructor(state?:boolean){
        if(state) this.state = state;
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
    timeAdd(scope:this):void{
        if(scope.cycle.get()) scope.setTime(scope.getTime()+10*60*1000);
    }
    timeCycle():void{
        setInterval(this.timeAdd,10000,this);
    }

    constructor(cycleState:boolean, startingTime?:number){
        this.cycle = new CycleObject(cycleState);
        if(startingTime) this.time = startingTime;
        else this.time = Date.now();
        // this.timeCycle();
    }
}