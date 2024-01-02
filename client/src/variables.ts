interface GameVariables{
    GAME_CAMERA_ANGULARSENSIBILITY_X:number ;
    GAME_CAMERA_ANGULARSENSIBILITY_Y:number ;

    FOG_DENSITY:number;
    FOG_START:number;

    FRAME_COUNT:number; //iterated every frame
        
    RENDER_DISTANCE:number,
    RENDER_DISTANCE_SQ:number,
};

export var variables:GameVariables = {
    GAME_CAMERA_ANGULARSENSIBILITY_X : 2000,
    GAME_CAMERA_ANGULARSENSIBILITY_Y : 2000,

    FOG_DENSITY : 10,
    FOG_START : 100,

    FRAME_COUNT : 0,

    RENDER_DISTANCE : 1000,
    RENDER_DISTANCE_SQ : 1000*1000,
}
