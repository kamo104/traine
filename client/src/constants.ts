export const enum constants {
    MAP_NAME = "islands", // eu_mid
    WEBSOCKET_SERVER_NAME = "https://traine-backend.fly.dev/", //"https://traine-backend.fly.dev/" | "http://localhost:3000"
    CONNECT_TO_BACKEND = 0,

    DAYNIGHT_CYCLE = 0,

    DEBUG_MODE = 0,
    TEST_MAP = 1,
    GAME_INIT_ON_LOAD = 1,
    

    TIME_SCALE = 20, // how much faster the time flows
    DEFAULT_TIME = 1657630800000, // 1657630800000 [ms]


    PLAYER_REDER_DISTANCE = 275,
    PLAYER_UNLOAD_DISTANCE = 260,
    PHYSICS_RENDER_DISTANCE = 150,


    MAP_SCALE_X = 2,
    MAP_SCALE_Y = 2,
    MAP_SCALE_Z = 2,
    MAP_LOADING_STEPS=3,
    MAP_MESH_IMPOSTOR_FRICTION = 10,
    MAP_CUBE_IMPOSTOR_FRICTION = 0.5,

    MAP_UPDATE_INTERVAL = 60,
    SUN_UPDATE_INTERVAL = 10,
    FOG_UPDATE_INTERVAL = 52,
    SUN_INTENSITY = 1,
    AMBIENT_LIGHT_INTENSITY = 0.2,
    SUNRISE_HEIGHT = 10,
    SKY_LUMINANCE = 0.9,
    DEFAULT_FOG_COLOR_R = 0.8941176470588235,
    DEFAULT_FOG_COLOR_G = 0.8784313725490196,
    DEFAULT_FOG_COLOR_B = 0.8431372549019608,
    WORLD_GRAVITY = -15,
    SUN_LATITUDE = 51.1657, //51.1657° N, 
    SUN_LONGITUDE = 10.4515, //10.4515° E germany //


    SHADOWGEN_TEXTURE_SIZE = 4096,
    SHADOWGEN_NUMCASCADES = 4,
    SHADOWGEN_CASCADEBLENDPERCENTAGE = 0.05,
    SHADOWGEN_LAMBDA = 1,
    SHADOWGEN_TRANSPARENCYSHADOW = 1,

    CHARACTER_HEAD_HEIGHT = 1.723,
    CHARACTER_STARTING_POS_X = 0,
    CHARACTER_STARTING_POS_Y = 80,
    CHARACTER_STARTING_POS_Z = 0,
    CHARACTER_SPEED = 40,
    CHARACTER_MASS = 60,
    CHARACTER_RESTITUTION = 0,
    CHARACTER_FRICTION = 1,


    
    BROWSER_CAMERA_ALPHA = -1, 
    BROWSER_CAMERA_BETA = 1.417,
    BROWSER_CAMERA_TARGET_X = 0,
    BROWSER_CAMERA_TARGET_Y = 1.5,
    BROWSER_CAMERA_TARGET_Z = 0,
    BROWSER_CAMERA_UPPERBETALIMIT = 1.884955592153876, // 3*Math.PI/5
    BROWSER_CAMERA_DEFAULT_RADIUS = 3,
    BROWSER_CAMERA_LOWERRADIUSLIMIT = 1.5,
    BROWSER_CAMERA_UPPERRADIUSLIMIT = 20,
    BROWSER_CAMERA_WHEELPRECISION = 50,
    BROWSER_CAMERA_ANGULARSENSIBILITY_X = 1000,
    BROWSER_CAMERA_ANGULARSENSIBILITY_Y = 1000,
    BROWSER_CAMERA_VIEWPORT_X = -0.3,
    BROWSER_CAMERA_VIEWPORT_Y = 0,
    BROWSER_CAMERA_VIEWPORT_W = 1.3,
    BROWSER_CAMERA_VIEWPORT_H = 1,


    GAME_CAMERA_ALPHA =1.570796326794897, // Math.PI/2
    GAME_CAMERA_BETA =1.570796326794897, // Math.PI/2
    GAME_CAMERA_RADIUS = 0,
    GAME_CAMERA_LOWERRADIUSLIMIT =0,
    GAME_CAMERA_UPPERRADIUSLIMIT =80,
    GAME_CAMERA_LOWERBETALIMIT = -1.470796326794897, // -Math.PI/2+0.1
    GAME_CAMERA_INERTIA =0.5,
    GAME_CAMERA_MAXZ_ADD = 500,
    GAME_CAMERA_COLLISIONRADIUS_X =0.5,
    GAME_CAMERA_COLLISIONRADIUS_Y =0.5,
    GAME_CAMERA_COLLISIONRADIUS_Z =0.5,


    GUI_MAXIMUM_SCALE_DISTANCE = 5,
    GUI_MINIMUM_SCALE_DISTANCE = 50,
    GUI_MINIMUM_SCALE = 1.5,
    GUI_MAXIMUM_SCALE = 3,

    GUI_SCALE_SPAN = 1.5, // constants.GUI_MAXIMUM_SCALE - constants.GUI_MINIMUM_SCALE;
    GUI_DISTANCE_SPAN = 45, // constants.GUI_MINIMUM_SCALE_DISTANCE - constants.GUI_MAXIMUM_SCALE_DISTANCE;
    GUI_DISTANCE_TO_SCALE_RATIO = 0.01875, // constants.GUI_SCALE_SPAN/constants.GUI_DISTANCE_SPAN
}
