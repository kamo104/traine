class PRNG{
    seed = 0;
    primeA = 15485863;
    primeB = 2038074743;

    CurrentRandom(){
        let a = this.seed * this.primeA
        return(a*a*a % this.primeB )/ this.primeB;
    }

    Seed(seed){
        this.seed = seed;
        // return(this.CurrentRandom())
    }

    NextRandom(){
        this.seed++ // = this.seed + Math.ceil(Math.random()*this.seed)+13 ;
        return(this.CurrentRandom())
    }
    
    RandomArray(length){
        let nums = [];
        while(length--){
            nums.push(this.NextRandom());
        }
        return nums;
    }

    randomIntInRange = function (start,end){
        const span = end-start; 
        return Math.floor(span*this.NextRandom())+start;
    }

    RandomIntArrayInRange(min,max,length,options){
        // const oldSeed = this.seed;

        const seeded = options!==undefined?(options.seed!==undefined?1:0):0;
        if(seeded) this.seed = options.seed;

        const span = max-min;
        let nums = [];
        while(length--) nums.push(Math.floor(this.NextRandom()*span)+min);

        // if(seeded) this.seed = oldSeed;

        return nums;
    }

    constructor(seed){
        this.seed = seed;
    }

}
function main(){
    const sampleNum = 2000000;
    const numOfPositions = 1000000;

    let generator = new PRNG(0);

    const chancesArr = generator.RandomArray(sampleNum);
    const positionsArr = generator.RandomIntArrayInRange(0,numOfPositions,sampleNum,{seed:0});
    
    console.log(positionsArr);
}



exports.PRNG = PRNG