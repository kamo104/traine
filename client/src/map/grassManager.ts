import * as BABYLON from "@babylonjs/core"


import * as TRAINE from "../index"


// class that takes a map and spawns grass on each chunk marked with hasGrass:bool
export class GrassManager{
    
    private scene:BABYLON.Scene;
    grassWorker: Worker;


    private populationFunction(mesh:BABYLON.AbstractMesh, 
        seeds:number[], 
        grassPlacementTextures:BABYLON.Texture[], 
        grassModels:BABYLON.AbstractMesh[], 
        grassSampleNumbers:number[]){
        
            const pickingRayDirection = new BABYLON.Vector3(0,-1,0);
        
            const boundingInfo = mesh.getBoundingInfo();
                
            // size of the mesh along x axis in object space
            const xsize =  boundingInfo.boundingBox.vectors[2].x-boundingInfo.boundingBox.vectors[4].x;
            // size of the mesh along the z axis in object space
            const zsize =  boundingInfo.boundingBox.vectors[2].z-boundingInfo.boundingBox.vectors[7].z-0.1; // idk why it's off by 10% but it is
    
    
            const meshXFunction = function(x:number):number{ // x from 0 to 1 on the x edge of the bounding box, returns x coordinate in object space
                // 2nd vector to 4th vector
                
                return boundingInfo.boundingBox.vectors[4].x+xsize*x
    
            }
            const meshZFunction = function(x:number):number{ // x from 0 to 1 on the z edge of the bounding box, returns x,z coordinates on the z edge
                // 2nd to 7th
                
                return boundingInfo.boundingBox.vectors[7].z+zsize*x
            }
    
    
            for(const [index,Texture] of grassPlacementTextures.entries()){
                const seed: number = seeds[index];
                TRAINE.PRNG.Seed(seed);
    
                const GrassModel:BABYLON.AbstractMesh = grassModels[index].clone(mesh.name+"grass",null);
                const grassSamples: number = grassSampleNumbers[index];
    
                const availibilityList:[number,number,number][] = []; // height, width, value
                const textureSize = Texture.getSize();
                
                Texture.readPixels().then((pixelByteBuffer)=>{
                    const pixels = new Uint8Array(pixelByteBuffer.buffer); 
                    const maxOffset = 0.5*Math.abs(xsize)/textureSize.height // texel size to face size in a mesh;
        
                    const maxGrassScale = 0.25;
                    const minGrassScale = 0.1
        
                    GrassModel.setAbsolutePosition(mesh.getAbsolutePosition());
                    GrassModel.setParent(mesh,true);
                    const grassMatrixInverted = GrassModel.getWorldMatrix().clone().invert() 
        
                    for(var i=0;i<textureSize.height;i++){
                        for(var j=0;j<textureSize.width;j++){
                            const pixel = pixels[(j*textureSize.width+i)*4]; // num of channels
                            
                            if(pixel>0) availibilityList.push([i,j,pixel]);
                            
                        }
                    }
        
                    
                    
                    var numOfInstances = 0;
                    
                    var matricesForNow:BABYLON.Matrix[] = [];
                    for(var i=0;i<grassSamples;i++){
                        const chance = TRAINE.PRNG.randomIntInRange(0,255);
                        const randomPixel = availibilityList[TRAINE.PRNG.randomIntInRange(0,availibilityList.length)];
                        
                        if(chance>=randomPixel[2]) continue;
        
                        
                        const offsetX = TRAINE.PRNG.NextRandom()*maxOffset;
                        const offsetY = TRAINE.PRNG.NextRandom()*maxOffset;
                        
                        const pickingRayOriginInMeshWorld = new BABYLON.Vector3(
                            meshXFunction(TRAINE.GMATH.cap(randomPixel[0]/textureSize.height+offsetX,1)), // +offsetX
                            boundingInfo.boundingBox.vectorsWorld[1].y+20,
                            meshZFunction(TRAINE.GMATH.cap(randomPixel[1]/textureSize.width+offsetY,1))) // +offsetY
                        
        
                        const pickingRayOrigin = BABYLON.Vector3.TransformCoordinates(pickingRayOriginInMeshWorld,mesh.getWorldMatrix());
                        
                        
                        
                        const ray = new BABYLON.Ray(pickingRayOrigin,pickingRayDirection,50);
                        const pickResult = this.scene.pickWithRay(ray,(pickedMesh)=>{return pickedMesh.id===mesh.id ? true : false;});
                        
                        // if we didn't hit the wanted mesh
                        if(pickResult.hit === false) continue;
        
                        // const normalVector = pickResult.getNormal(); // get an ortagonal vector from this vector such that it goes from one vertex to an other in the picked face
                        
                        // // create a vector that is perpendicular to the normal vector such that it gives random rotation around x and z
                        // // forward (x,y,z) = (x, y, z = -(x*normal.x + y*normal.y)/normal.z),    x*normal.x + y*normal.y + z*normal.z = 0
                        // const xForward = TRAINE.PRNG.NextRandom();
                        // const zForward = TRAINE.PRNG.NextRandom();
                        // const forwardVector = new BABYLON.Vector3(xForward,-(xForward*normalVector.x+zForward*normalVector.z)/normalVector.y, zForward);
        
        
                        // const rotationMatrix = BABYLON.Matrix.LookDirectionRH(forwardVector.normalize(),normalVector.normalize());
        
                        const yScale = TRAINE.PRNG.NextRandom()*(maxGrassScale-minGrassScale)+minGrassScale;
                        const scalingMatrix = BABYLON.Matrix.Scaling(0.1,yScale,0.1);
        
                        var instanceMatrix = BABYLON.Matrix.Identity();
                        
        
                        const translationVector = BABYLON.Vector3.TransformCoordinates(pickResult.pickedPoint, grassMatrixInverted)
        
                        instanceMatrix = BABYLON.Matrix.Translation(translationVector.x,translationVector.y,translationVector.z).multiply(instanceMatrix)
        
                        // instanceMatrix = rotationMatrix.multiply(instanceMatrix); // to orient the grass to the normal direction
                        const randRotation = TRAINE.PRNG.NextRandom()*Math.PI*2
                        instanceMatrix = (BABYLON.Matrix.RotationY(randRotation)).multiply(instanceMatrix);
                        
                        instanceMatrix = scalingMatrix.multiply(instanceMatrix);
        
        
        
        
                        numOfInstances+=1;
                        matricesForNow.push(instanceMatrix);
                    }
                    
                    var matricesBuffer = new Float32Array(16 * numOfInstances);
                    for(const [index,matrix] of matricesForNow.entries()) matrix.copyToArray(matricesBuffer,index*16);
        
                    (<any> GrassModel).thinInstanceSetBuffer("matrix",matricesBuffer,16);
                    
                });
                
            }
            
        }

    async populateWithGrass(mesh:BABYLON.AbstractMesh, 
            seeds:number[], 
            grassPlacementTextures:BABYLON.Texture[], 
            grassModels:BABYLON.AbstractMesh[], 
            grassSampleNumbers:number[]){
        
        
        return new Promise((resolve,reject)=>{
            // we want to spin up a worker that will do that for us
            // recreate the parent mesh in the worker
            // get the pixels of the texture to the worker
            // then compute all the intensive computations and return the matrices

            // var worker = new Worker("./workerTest");
            // worker.postMessage("args",[mesh,seeds,grassPlacementTextures])

            

            // const texture = grassPlacementTextures[0];
            
            const meshInfo = {indices:mesh.getIndices(),vertices:mesh.getPositionData()};

            const serializedMesh = BABYLON.SceneSerializer.SerializeMesh(mesh);

            const strMesh = JSON.stringify(serializedMesh);


            const blob = new Blob([strMesh], { type: "octet/stream" });

            // turn blob into an object URL; saved as a member, so can be cleaned out later
            const objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

            const texture = grassPlacementTextures[0];


            texture.readPixels().then((pixelBuffer)=>{
                this.grassWorker.postMessage({ args: [/*texture*/ {buffer:pixelBuffer,size:texture.getSize()},/*model*/ objectUrl], });
            })
            

            this.grassWorker.onmessage = (({ data: { matrices } })=>{console.log(matrices)})

            // this.populationFunction(mesh,seeds,grassPlacementTextures,grassModels,grassSampleNumbers)

            resolve(0);
            reject();
        });
        
    }

    constructor(scene:BABYLON.Scene, grassWorker:Worker){
        this.scene = scene;
        this.grassWorker = grassWorker;
    }
}