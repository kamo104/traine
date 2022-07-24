#traine
Available at: https://traine.servegame.com

Implementing a custom client would require making all the map models and textures.

public/assets/map/eu_mid/chunk_info.json // {"eu.0480": {"x": 3720.41, "y": -131, "z": -1756},...}

public/assets/map/eu_mid/obj/eu.####.obj // for each 3d chunk mesh, where #### are chunk numbers from chunk_info.json

public/textures/eu_mid/sliced/eu.####.png // for diffuse textures, where #### are chunk numbers from chunk_info.json

public/textures/icons/arrow_left.svg and arrow_right.svg

public/assets/player_models/playerModelMap.json // {"0":"NAME",...} // for each 3d player model assign it a value so that a client know what models are available

public/assets/player_models/NAME.obj 

Maybe someday I will host original 3d objects, textures and materials but for now I'm more focused on the developement.

You can clone the repo and run:

npm install

Running a local dev version is possible after adding all mentioned files via:

npm run start