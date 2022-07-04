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
    
    private cycleState:boolean;
    private time:number;

    //static cycle = new CycleObject();
    cycle:CycleObject;


    setTime(time:number|string){
        switch(typeof(time)){
            case("string"):{
                break;
            }
            case("number"):{
                this.time = Number(time);
                break;
            }
        }
    }
    getTime():number{
        return this.time;
    }
    timeAdd():void{
        if(this.cycle.get()) this.setTime(this.getTime()+10*60*1000);
    }
    timeCycle():void{
        setInterval(this.timeAdd,10000);
    }

    constructor(cycleState:boolean, startingTime?:number){
        this.cycle = new CycleObject(cycleState);
        // console.log(this.cycle)
        if(startingTime) this.time = startingTime;
        else this.time = Date.now();
        this.timeCycle();
    }
}