import * as IJS from "image-js"


var canvas = <HTMLCanvasElement> document.getElementById("canvas");

var context = canvas.getContext("webgpu");

var fileSelector = <HTMLInputElement> document.getElementById("file-selector");

var previewImage = <HTMLImageElement> document.getElementById("image-preview");

var outputCanvas = <HTMLCanvasElement> document.getElementById("output-preview");

var heightSelector = <HTMLInputElement> document.getElementById("height-input");

const ShaderNames = {
    oceanSeparate: "oceanSeparate",
} as const

const BufferNames = {
    imageSize: "imageSize",
    inputImage: "inputImage",
    seaLevel: "seaLevel",
    outputImage: "outputImage",
    gpuReadBuffer: "gpuReadBuffer",
} as const

class GpuConfig{
    shaders:Record<keyof typeof ShaderNames,GPUShaderModule> = {} as any;
    bindGroupLayouts:Record<keyof typeof ShaderNames,GPUBindGroupLayout> = {} as any;
    buffers:Record<keyof typeof BufferNames,GPUBuffer> = {} as any;
    constructor(){}
}

class App{
    inputImage:IJS.Image; // image-js Image
    _imageBuffer:Float32Array; // pixels as float32 array

    // _gpuBuffers={}; // {"imageSize":GpuBuffer, "inputImage":GpuBuffer, "seaLevel":GpuBuffer , "outputImage":GpuBuffer}
    _gpuConfig:GpuConfig = new GpuConfig(); // {"ShaderName"}

    _canvas: HTMLCanvasElement;
    _context: GPUCanvasContext;
    _device: GPUDevice;

    ready: boolean;
    readyPromise: Promise<void>;

    async init() {
        // if (!navigator.gpu) {
        //     throw Error("WebGPU not supported.");
        // }
    
        const adapter = await navigator.gpu.requestAdapter();
        console.log(adapter.limits)
        if (!adapter) {
            throw Error("Couldn't request WebGPU adapter.");
        }
        const myDev:GPUDeviceDescriptor = {"requiredLimits":{
            // "maxBufferSize":1073741824,
            "maxBufferSize":2147483644,
            // "maxStorageBufferBindingSize":1073741824,
            "maxStorageBufferBindingSize":2147483644,
            "maxComputeWorkgroupSizeX":32,
            "maxComputeWorkgroupSizeY":32,
            "maxComputeInvocationsPerWorkgroup":1024}};
        this._device = await adapter.requestDevice(myDev); // 

        // console.log(this._device.limits)

        this._context.configure({
            device: this._device,
            format: navigator.gpu.getPreferredCanvasFormat(), // navigator.gpu.getPreferredCanvasFormat() rgba16float suggested "rgba32float" 
            alphaMode: "premultiplied",
        });

        // init all the shader modules
        for(const shaderName in ShaderNames){

            const shaderString = require("raw-loader!./"+shaderName+".wgsl").default;

            (<GPUShaderModule> (<any> this._gpuConfig.shaders)[shaderName]) = this._device.createShaderModule({
                code: shaderString,
            });
        }
        
    }

    async setImage(image:string){
        // let fileReader = new FileReader();
        this.inputImage = await IJS.Image.load(image);
        this.inputImage = this.inputImage.rgba8();

        this._imageBuffer = Float32Array.from(this.inputImage.data);

        // !!!!!!! MIGHT BE SLOW FOR BIGGER IMAGES SO BE CAREFUL
        for(let i=0;i<this._imageBuffer.length;i++){
            this._imageBuffer[i]/=255; 
        }
        // !!!!!!! MIGHT BE SLOW FOR BIGGER IMAGES SO BE CAREFUL

        // START COMPUTATION
        if(this.ready===true){
            this.readyPromise = this.startComputation();
            return;
        }
        
        this.readyPromise.finally(()=>{
            this.readyPromise = this.startComputation();
        })
    }

    _initBuffers(){
        // create input buffer
        var inputBuffer = this._device.createBuffer({
            mappedAtCreation: true,
            size: this._imageBuffer.byteLength,
            usage: GPUBufferUsage.STORAGE,
        });
        const photoArrayBuffer = inputBuffer.getMappedRange();
        new Float32Array(photoArrayBuffer).set(this._imageBuffer);
        inputBuffer.unmap();
        this._gpuConfig.buffers.inputImage = inputBuffer;
        
        // create output buffer
        var outputBuffer = this._device.createBuffer({
            size: this._imageBuffer.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });
        this._gpuConfig.buffers.outputImage = outputBuffer;

        // create image size buffer
        const imageSizeTemp = new Uint32Array([this.inputImage.width,this.inputImage.height]);
        const imageSizeBuffer = this._device.createBuffer({
            mappedAtCreation: true,
            size: imageSizeTemp.byteLength,
            usage: GPUBufferUsage.STORAGE,
        })
        const sizeBuffer = imageSizeBuffer.getMappedRange();
        new Uint32Array(sizeBuffer).set(imageSizeTemp);
        imageSizeBuffer.unmap();
        // remember it at the gpuconfig
        this._gpuConfig.buffers.imageSize = imageSizeBuffer;


        // Get a GPU buffer for reading in an unmapped state.
        const gpuReadBuffer = this._device.createBuffer({
            size: this._imageBuffer.byteLength,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });
        this._gpuConfig.buffers.gpuReadBuffer = gpuReadBuffer;


        // seaLevel
        const gpuSeaLevelBuffer = this._device.createBuffer({
            mappedAtCreation: true,
            size: 4, // one 32 bit float
            usage: GPUBufferUsage.STORAGE,
        });

        const buff = gpuSeaLevelBuffer.getMappedRange();
        new Float32Array(buff).set([Number(heightSelector.value)]);
        gpuSeaLevelBuffer.unmap();
        this._gpuConfig.buffers.seaLevel = gpuSeaLevelBuffer;

    }
    _createLayouts(){
        // oceanSeparate
        this._gpuConfig.bindGroupLayouts.oceanSeparate = this._device.createBindGroupLayout({
                entries:[
                    {
                        binding: 0,
                        visibility: GPUShaderStage.COMPUTE,
                        buffer: {
                            type: "read-only-storage"
                        }
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.COMPUTE,
                        buffer: {
                            type: "read-only-storage"
                        }
                    },
                    {
                        binding: 2,
                        visibility: GPUShaderStage.COMPUTE,
                        buffer: {
                            type: "read-only-storage"
                        }
                    },
                    {
                        binding: 3,
                        visibility: GPUShaderStage.COMPUTE,
                        buffer: {
                            type: "storage"
                        }
                    }
                ]
            } as GPUBindGroupLayoutDescriptor);

    }

    async startComputation(){
        this.ready = false;

        console.log("starting cpu buffer setup")

        this._initBuffers();
        this._createLayouts();

        console.log("finished cpu buffer setup")

        console.log("starting gpu computattion");

        const bindGroup = this._device.createBindGroup({
            layout: this._gpuConfig.bindGroupLayouts.oceanSeparate,
            entries: [
                {
                    binding: 0,
                    resource: { buffer: this._gpuConfig.buffers.imageSize}
                },
                {
                    binding: 1,
                    resource: { buffer: this._gpuConfig.buffers.inputImage}
                },
                {
                    binding: 2,
                    resource: { buffer: this._gpuConfig.buffers.seaLevel}
                },
                {
                    binding: 3,
                    resource: { buffer: this._gpuConfig.buffers.outputImage}
                }
            ]
        });

        const computePipeline = this._device.createComputePipeline({
            layout: this._device.createPipelineLayout({
                bindGroupLayouts: [this._gpuConfig.bindGroupLayouts.oceanSeparate]
            }),
            compute: {
                module: this._gpuConfig.shaders.oceanSeparate,
                entryPoint: "main"
            }
        });

        const commandEncoder = this._device.createCommandEncoder();

        const passEncoder = commandEncoder.beginComputePass();
        passEncoder.setPipeline(computePipeline);
        passEncoder.setBindGroup(0, bindGroup);
        const workgroupCount = this.inputImage.width*this.inputImage.height/(32*32);
        passEncoder.dispatchWorkgroups(workgroupCount/2,workgroupCount/2);
        passEncoder.end();

        
        // Encode commands for copying buffer to buffer.
        commandEncoder.copyBufferToBuffer(
            this._gpuConfig.buffers[BufferNames.outputImage] /* source buffer */,
            0 /* source offset */,
            this._gpuConfig.buffers[BufferNames.gpuReadBuffer] /* destination buffer */,
            0 /* destination offset */,
            this._imageBuffer.byteLength /* size */
        );
        
        // Submit GPU commands.
        const gpuCommands = commandEncoder.finish();
        this._device.queue.submit([gpuCommands]);
        
        // retrieve the buffer from the gpu
        await this._gpuConfig.buffers[BufferNames.gpuReadBuffer].mapAsync(GPUMapMode.READ);

        console.log("finished gpu computation");
        console.log("starting cpu copying");

        const arrayBuffer = this._gpuConfig.buffers[BufferNames.gpuReadBuffer].getMappedRange();
        const output = new Float32Array(arrayBuffer);
        // arrayBuffer.unmap();

        for(let i=0;i<output.length;i++){
            output[i]*=255;
        }
        
        let uint8 = Uint8ClampedArray.from(output);
        outputCanvas.width = this.inputImage.width;
        outputCanvas.height = this.inputImage.height;
        let ctx = outputCanvas.getContext("2d");

        let imageData = new ImageData(uint8,this.inputImage.width,this.inputImage.height)
        ctx.putImageData(imageData,0,0);

        console.log("finished cpu copying");
        this.ready = true;
    }   


    constructor(canvas:HTMLCanvasElement,context:GPUCanvasContext){
        this._canvas = canvas;
        this._context = context;
        this.readyPromise = this.init();
        this.readyPromise.finally(()=>{
            this.ready = true;
        })
    }
}

var app = new App(canvas,context);


fileSelector.addEventListener("change", (e)=>{

    let fileReader = new FileReader();

    fileReader.onload = function(event) {
        previewImage.src = event.target.result as string
        app.setImage(event.target.result as string)
    };
    
    fileReader.readAsDataURL((<HTMLInputElement> e.target).files[0]);
    
    
}, false);

// heightSelector.addEventListener("change", (e)=>{

//     if(app.inputImage===undefined) return;
//     if(app.ready===false){
//         // app.readyPromise.finally(()=>{
//         //     app.readyPromise = app.startComputation();
//         // });
//         return;
//     }
//     app.readyPromise = app.startComputation();
    
// }, false);

heightSelector.addEventListener("input", (e)=>{

    if(app.inputImage===undefined) return;
    if(app.ready===false){
        // app.readyPromise.finally(()=>{
        //     app.readyPromise = app.startComputation();
        // });
        return;
    }
    app.readyPromise = app.startComputation();
    
}, false);
