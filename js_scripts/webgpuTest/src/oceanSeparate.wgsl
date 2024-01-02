const workSize:u32 = 32; // or const idk

@group(0) @binding(0) var<storage, read> imageSize:vec2<u32>;
@group(0) @binding(1) var<storage, read> inputImage:array<vec4<f32>>;
@group(0) @binding(2) var<storage, read> seaLevel:f32;

@group(0) @binding(3) var<storage, read_write> outputImage:array<vec4<f32>>;



@compute @workgroup_size(workSize,workSize)
fn main(@builtin(global_invocation_id) global_id:vec3<u32>){
    let myId = (workSize*global_id.x)+global_id.y;
    
    if(myId > imageSize.x*imageSize.y){ return;} // check for out of bounds


    var col = vec4<f32>(clamp(sign(inputImage[myId].x-seaLevel),0.0,1.0));
    col.w = 1.0;

    outputImage[myId]=col;

}