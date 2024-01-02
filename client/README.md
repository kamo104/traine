Available at: https://kamo104.github.io/traine/
================

# 1. Files Info
    Implementing a custom client would require making map models, player models and textures.
    In blender_scripts, python_scripts and cpp_programs are dev tools that help automize this process.
    In the end the development experience boils down to making the models and running a few scripts in an order.

### Assets folder:

    [MAP_NAME] is your map's name you need to set it in the app.ts

    [NAME] name is a string used to describe a certain model

**Files:**

    public/assets/map/[MAP_NAME]/chunk_info.json // {"0480": {"x": 3720.41, "y": -131, "z": -1756},...}

    public/assets/map/[MAP_NAME]/obj/####.obj 

for each 3d chunk mesh, where #### are chunk numbers from chunk_info.json

    public/assets/player_models/playerModelMap.json // {"0":"[NAME]",...} 

for each 3d player model assign it a string value so that a client knows what models are available

    public/assets/player_models/[NAME].obj 


**Textures folder:**

    public/textures/[MAP_NAME]/sliced/[SOMETHING].####.png 

for diffuse textures, where #### are chunk numbers from chunk_info.json

    public/textures/icons/arrow_left.svg and arrow_right.svg



Maybe someday I will host the original 3d objects, textures and materials but for now I'm more focused on the developement. #EDIT

I added original models and textures to a branch client-build

# 2. Steps

To create this project you need to:

### 2. 1. Clone the repo and run:

    npm install

### 2. 2. Add all the models and textures (according to the scheme above)

[Go to 1. Assets folder](#Assets-folder:)

### 2. 3. Running a local dev version is possible with:

    npm run start

### 2. 3. Or create a bundle file that you send from a dedicated server with:

    npm run bundle