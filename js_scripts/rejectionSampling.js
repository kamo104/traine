var fs = require("fs")
var PNG = require("pngjs").PNG;
const PRNG = require("./randomNumberSquence");
// console.log(PRNG.PRNG)
var generator = new PRNG.PRNG(0);

randomIntInRange = function (start,end){
    const span = end-start;
    let num = Math.floor(span*Math.random())+start
    return(num)
}

//takes abt 6s for 2Mil points
rejectionSample = function () {
    var start = Date.now()
    
    var availabilityList = [];
    var vis = [];
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var idx = (this.width * y + x) << 2;

        if(this.data[idx]>0){
            availabilityList.push(idx);
        }
      }
    }
    vis.fill(0,0,availabilityList.length-1)

    // //copy png data
    // var copyOfData = Object.create(this.data)

    // // clear image
    // for (var y = 0; y < this.height; y++) {
    //     for (var x = 0; x < this.width; x++) {
    //       var idx = (this.width * y + x) << 2;

    //       this.data[idx] = 0
    //       this.data[idx + 1] = 0
    //       this.data[idx + 2] = 0
    //     }
    //     console.log(y);
    // }

    var newImg = new PNG({
        width: this.width,
        height: this.height,
        filterType: -1,
        colorType: 0,
        bgColor: {red:0,green:0,blue:0}
    });

    var numOfSamples = 2000000;
    var numOfPoints = 2000000;
    while(numOfPoints && numOfSamples){
        var point = generator.randomIntInRange(0,availabilityList.length);
        var chance = generator.randomIntInRange(0,255)
        // let point = randomIntInRange(0,availabilityList.length);
        // let chance = randomIntInRange(0,255);
        if(chance<this.data[availabilityList[point]] && !vis[point]){
            //mark the point as visited
            newImg.data[availabilityList[point]] = 255
            newImg.data[availabilityList[point]+1] = 255
            newImg.data[availabilityList[point]+2] = 255
            newImg.data[availabilityList[point]+3] = 255
            vis[point] = 1;
            //numOfPoints--;
        }
        numOfSamples--;
    }
    
    newImg.pack().pipe(fs.createWriteStream("./js_scripts/pics/output/out.png"));


    console.log("The script took:",(Date.now()-start)/1000,"s")
}



fs.createReadStream("./js_scripts/pics/water_dist/final.png")
    .pipe(
        new PNG({
            filterType: -1,
            colorType: 0,
            alpha: 0
        })
    )
    .on("parsed", rejectionSample);




