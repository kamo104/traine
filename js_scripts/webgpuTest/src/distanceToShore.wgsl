
override workSize = 32; // or const idk

@group(0) @binding(0) var<storage, read> imageSize:vec2<u32>;
@group(0) @binding(1) var<storage, read> inputImage:array<vec4<f32>>;

@group(0) @binding(2) var<storage, read_write> outputImage:array<vec4<f32>>;

const sqrt2 = sqrt(2);

fn idExists(id:u32)->bool{
    return id>=0 && id<=imageSize.x*imageSize.y;
}

// 0 1 2
// 7 - 3
// 6 5 4
// returns array of neighbor ids, whenever a neighbor cannot exist it is substituted with a neighbor that exists 
fn neighbors(global_id:vec3<u32>)->array<u32,8>{

    let id = (workSize*global_id.x)+global_id.y;
    let down = id+imageSize.y;
    let up = id-imageSize.y;

    var result:array<u32,8>;
    let neighIds:array<u32,8> = array(up-1,up,up+1,id+1,down+1,down,down-1,id-1);
    var exampleId:u32;

    for(let i:u32=0;i<8;i++){
        if(idExists(neighIds[i])){
            exampleId = neighIds[i];
            break;
        } 
    }

    for(let i:u32=0;i<8;i++){
        if(!idExists(neighIds[i])){
            neighIds[i] = exampleId;
        } 
    }

    return neighIds;
}


//outputImage has to be heightmap like to work
@compute @workgroup_size(workSize,workSize)
fn main(@builtin(global_invocation_id) global_id:vec3u){
    let myId = (workSize*global_id.x)+global_id.y;
    
    if(myId >= imageSize.x*imageSize.y){ return;} // check for out of bounds

    let straightStep = 1.0/f32(max(imageSize.x,imageSize.y));
    let hypoStep = straightStep*sqrt2;

    let stepForNeigh = array(hypoStep,straightStep,hypoStep,straightStep,hypoStep,straightStep,hypoStep,straightStep);

    let neighs = neighbors(my_Id);

    // maxb = my brightness after comming from the neighbor
    var maxBrightness = outputImage[neighs[0]].x-hypoStep;
    for(let i:u32=1;i<8;i++){
        maxBrightness = max(outputImage[neighs[i]].x-stepForNeigh[i],maxBrightness);
    }
    clamp(maxBrightness,0.0,1.0);


    outputImage[myId]=vec4<f32>(maxBrightness);

}