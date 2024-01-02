class PRNG{
    private seed:number = 0;
    private primeA = 15485863;
    private primeB = 2038074743;

    CurrentRandom(){
        let a = this.seed * this.primeA
        return(a*a*a % this.primeB )/ this.primeB;
    }

    Seed(seed){
        this.seed = seed;
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

    randomIntInRange(start,end){
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


    constructor(seed?:number){
        this.seed = seed;
    }

}


export const NumberGenerator = new PRNG();
// function main(){
//     const sampleNum = 2000000;
//     const numOfPositions = 1000000;

//     let generator = new PRNG(0);

//     const chancesArr = generator.RandomArray(sampleNum);
//     const positionsArr = generator.RandomIntArrayInRange(0,numOfPositions,sampleNum,{seed:0});
    
//     console.log(positionsArr);
// }

