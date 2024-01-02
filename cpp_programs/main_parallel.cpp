#include <stdint.h>
#include <math.h>
#include <iostream>
#include <vector>
#include <chrono>
#include <ctime>
#include <algorithm>
#include <tuple>
#include <future>
#include <pthread.h>
#include <time.h>

#define THREADS 16

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#define STBI_MSC_SECURE_CRT
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"

using namespace std;

class Tile{
    public:
    Tile operator+(const Tile& other){
        return Tile(this->hpos+other.hpos,this->wpos+other.wpos);
    }
    int hpos;
    int wpos;
    Tile(int hpos,int wpos){
        this->hpos = hpos;
        this->wpos = wpos;
    }
};

class Image{
    public:
    unsigned char* pixels;
    int height;
    int width;
    int widthsq;
    int bpp;

    unsigned char* pixelsAt(int heightPos, int widthPos){
        return &this->pixels[(this->width*heightPos+widthPos)*this->bpp];
    }
    unsigned char* pixelsAt(Tile tile){
        return &this->pixels[(this->width*tile.hpos+tile.wpos)*this->bpp];
    }
    Image(unsigned char* pixels, int height, int width, int bpp){
        this->pixels = pixels;
        this->height = height;
        this->width = width;
        this->widthsq = this->width*this->width;
        this->bpp = bpp;
    }
    Image(){}
};


unsigned char median(vector<unsigned char> v){
    sort(v.begin(), v.end());
    return(v[int(v.size()/2)]);
}

int distance(int i,int j,int h,int w){
    return (i-h)*(i-h)+(j-w)*(j-w);
}

int distance(Tile pos1,Tile pos2){
    return distance(pos1.hpos,pos1.wpos,pos2.hpos,pos2.wpos);
}

void heightmapToLandmap(Image* image,unsigned char shorelineHeight){
    
    for(int i=0;i<image->height;i++){
        for(int j=0;j<image->width;j++){
            unsigned char *pixels = image->pixelsAt(i,j);

            if(pixels[0]>=shorelineHeight){
                for(int k=0;k<3;k++) pixels[k] = 255;
                continue;
            }
            else{
                for(int k=0;k<3;k++) pixels[k] = 0;
                continue;
            }
        }
    }

}


const int movements[4][2] = {{0,-1}, {1,0}, {0,1}, {-1,0}};

vector<Tile> tilesPossibleToMoveTo(Image* image, Tile tile){
    vector<Tile> tilesPossibleToMoveTo;
    vector<Tile> possibleMoves;

    for(int i=0;i<4;i++) possibleMoves.push_back(Tile(movements[i][0]+tile.hpos,movements[i][1]+tile.wpos));

    for(Tile &tileToMoveTo:possibleMoves){
        if(
            tileToMoveTo.hpos >= 0 && 
            tileToMoveTo.hpos < image->height && 
            tileToMoveTo.wpos >= 0 && 
            tileToMoveTo.wpos < image->width
            ) tilesPossibleToMoveTo.push_back(tileToMoveTo);
    }
    return(tilesPossibleToMoveTo);
}

bool isCoastal(Image* image, Tile tile){

    unsigned char *pixels = image->pixelsAt(tile);
    
    // if the tile is not land then it can't be coastal
    if(pixels[0]!=255)return false;

    
    for(Tile &tileToMove:tilesPossibleToMoveTo(image,tile)){
        unsigned char *pixels = image->pixelsAt(tileToMove);

        // if we find a tile near it that is a sea tile then it's a coast
        if(pixels[0]==0) return true;
    }
    return false;
}

vector<Tile> coastalTiles(Image* image){

    vector<Tile> coastalTiles;

    for(int i=0;i<int(image->height);i++){
        for(int j=0;j<int(image->width);j++){

            Tile currentTile(i,j);
            if(isCoastal(image,currentTile)){
                coastalTiles.push_back(currentTile);
                continue;
            }
        }
    }

    return(coastalTiles);
}

int findSmallestDistanceToTile(Tile position, vector<Tile>* coastalTiles){
    if(coastalTiles->size()<=0) return INT_MAX;

    int smallest = distance(position,coastalTiles->at(0));
    for(Tile tile:(*coastalTiles)){
        int dist = distance(position,tile);
        smallest = dist < smallest ? dist : smallest; 
    }
    return smallest;
}

vector<Tile> tileListFromTo(Tile pos1, Tile pos2){
    vector<Tile> tiles;
    int heightDifference=pos2.hpos-pos1.hpos;
    int widthDifference=pos2.wpos-pos1.wpos;
    if(heightDifference>0 && widthDifference>0){
        for(int i=pos1.hpos;i<pos2.hpos;i++) for(int j=pos1.wpos;j<pos2.wpos;j++) tiles.push_back(Tile(i,j));
    }
    else if(heightDifference>0 && widthDifference==0){
        for(int i=pos1.hpos;i<pos2.hpos;i++) tiles.push_back(Tile(i,pos2.wpos));
    }
    else if(heightDifference==0 && widthDifference>0){
        for(int j=pos1.wpos;j<pos2.wpos;j++) tiles.push_back(Tile(pos2.hpos,j));
    }
    return tiles;
}


void colorTileByDistance(Image* image, Tile currentTile, float distance ){
    int dist = distance/image->width;
    if(dist>255) dist=255;
    else if(dist<=0) dist=1;
    unsigned char *pixels = image->pixelsAt(currentTile);
    // printf("Coloring tile(w,h) (%d,%d) color(char) (%f)\n",currentTile.wpos,currentTile.hpos,dist);
    for(int k=0;k<3;k++) pixels[k] = (unsigned char)dist;
}


struct dtsWorkerArgs{
    Image* image;
    vector<vector<bool>>* vis;
    vector<Tile>* coastalTiles;
    vector<Tile>* tilesToProcess;
};
// (distanceToShore)worker
void* dtsWorker(void* args){
    dtsWorkerArgs* myArgs = (dtsWorkerArgs*)(args);
    // int count = 0;
    for( Tile &currentTile:(*myArgs->tilesToProcess)){
        if((*myArgs->vis)[currentTile.hpos][currentTile.wpos]) continue;
        // mark current currentTile as visited
        (*myArgs->vis)[currentTile.hpos][currentTile.wpos]=true;
        
        colorTileByDistance(myArgs->image, currentTile, findSmallestDistanceToTile(currentTile,myArgs->coastalTiles));

        // if(count++ == 10) break; // !!!!!!! for testing
    }
    pthread_exit(NULL);
    return 0;
}


void distanceToShore(Image* image){

    vector<Tile> coastTiles = coastalTiles(image);
    //init visited vector for checking whether a tile has been processed
    vector<bool> my_child(image->width, false);
    vector<vector<bool>> vis(image->height,my_child);

    //fill vis with land tiles
    for(int i=0;i<image->height;i++){
        for(int j=0;j<image->width;j++){
            if(image->pixelsAt(i,j)[0]==255) vis[i][j] = true;
        }
    }

    // clear the image
    for(int i=0;i<image->height;i++){
        for(int j=0;j<image->width;j++){
            unsigned char *pixels = image->pixelsAt(i,j);
            for(int k=0;k<3;k++) pixels[k]=0;
        }
    }

    
    
    // ranges for each worker (h from, w from, h to w to) including start pos, excluding end_pos
    vector<vector<Tile>> tilesToProcess;

    int width_amount = sqrt(THREADS); // 
    int height_amount = width_amount;
    int width_interval = int(image->width/width_amount);
    int height_interval = int(image->height/height_amount);
    
    //config options for all threads
    for(int i=0;i<height_amount;i++){
        for(int j=0; j<width_amount;j++){
            Tile startTile(height_interval*(i),width_interval*(j));
            Tile endTile(height_interval*(i+1),width_interval*(j+1));
            tilesToProcess.push_back(tileListFromTo(startTile,endTile));
        }
    }
    pthread_t threads[tilesToProcess.size()];
    for(int i=0;i<tilesToProcess.size();i++){
        dtsWorkerArgs* args = new dtsWorkerArgs;
        args->image = image;
        args->coastalTiles = &coastTiles;
        args->vis = &vis;
        args->tilesToProcess = &tilesToProcess[i];

        pthread_create(&threads[i],NULL,dtsWorker,args);
    }
    for(int i=0;i<tilesToProcess.size();i++){
        pthread_join(threads[i],NULL);
    }

    
}


int main(int argc, char* argv[]) {

    char const* inputFilename = "./pics/water_landx2.png"; // "./pics/water_landx2.png" "./pics/eu.png"
    char const* outputFilename = "./pics/eu_test.png"; // "./pics/shore_distx2.png" "./pics/eu_land.png"
    char shorelineHeight = 154; // (255*(0.100093+0.5))
    int command=1; // 1: land texture from heightmap, 2:distance to shore texture from land texture, 3:distance to shore texture from heightmap

    for(int i=1;i<argc;i++){
        if(strcmp(argv[i],"-i")==0){
            i++;
            printf("Got input file path: \"%s\"\n",argv[i]);
            inputFilename= argv[i];
        }
        else if(strcmp(argv[i],"-o")==0){
            i++;
            printf("Got output file path: \"%s\"\n",argv[i]);
            outputFilename= argv[i];
        }
        else if(strcmp(argv[i],"-s")==0||strcmp(argv[i],"--shore")==0){
            i++;
            printf("Got shoreline height: %s\n",argv[i]);
            shorelineHeight = atoi(argv[i]);
        }
        else if(strcmp(argv[i],"-c")==0||strcmp(argv[i],"--command")==0){
            i++;
            printf("Got command: %s ",argv[i]);
            command = atoi(argv[i]);
            switch(command){
                case(1):{
                    printf("(land texture from heightmap)\n");
                    break;
                }
                case(2):{
                    printf("(distance from shore texture from heightmap)\n");
                    break;
                }
                case(3):{
                    printf("(distance to shore texture from land texture)\n");
                    break;
                }
            }
        }
    }

    time_t now;
    time(&now);
    printf("Starting execution at: %s", ctime(&now));
    auto start = std::chrono::system_clock::now();

    // set up the image
    Image image;
    image.pixels = stbi_load(inputFilename, &image.width, &image.height, &image.bpp, 4);
    image.widthsq = image.width*image.width;

    switch(command){
        case(1):{
            heightmapToLandmap(&image, shorelineHeight);
            break;
        }
        case(2):{
            heightmapToLandmap(&image, shorelineHeight);
            distanceToShore(&image);
            break;
        }
        case(3):{
            distanceToShore(&image);
            break;
        }
    }

    

    // write out the image
    int succ = stbi_write_png(outputFilename,image.width,image.height,image.bpp,image.pixels,image.width*image.bpp);
    stbi_image_free(image.pixels);

    auto end = std::chrono::system_clock::now();
    std::chrono::duration<double> elapsed_seconds = end-start;
    time_t end_time = std::chrono::system_clock::to_time_t(end);
    printf("Elapsed time: %lfs\n",elapsed_seconds.count());
    return 0;
}