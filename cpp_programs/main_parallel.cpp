#include <stdint.h>
#include <math.h>
#include <iostream>
#include <vector>
#include <chrono>
#include <ctime>
#include <algorithm>
#include <tuple>
#include <future>

#define THREADS 16
#define CHANNELS 4

#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

#define STBI_MSC_SECURE_CRT
#define STB_IMAGE_WRITE_IMPLEMENTATION
#include "stb_image_write.h"


using namespace std;
unsigned char mediana(vector<unsigned char> v){
    sort(v.begin(), v.end());
    return(v[int(v.size()/2)]);
}

//sths wrong
void downscalex2(){

    int width, height, bpp;
    int width2, height2, bpp2;

    unsigned char *image = stbi_load("./pics/water_land.png", &width, &height, &bpp, 4);
    unsigned char *image2 = stbi_load("./pics/water_land.png", &width2, &height2, &bpp2, 4);
    for(int i=0;i<height2;i++){
        for(int j=0;j<width2;j++){
            unsigned char *pixels0 = &image2[(width2*i + j)*bpp2];
            pixels0[0] = 0;
            pixels0[1] = 0;
            pixels0[2] = 0;
            image2[(width2*i + j)*bpp2]=*pixels0;
        }
    }
    
    for(int i=0;i<int(height/2);i++){
        for(int j=0;j<int(width/2);j++){
            unsigned char *pixels0 = &image[(width*i*2 + j*2)*bpp];
            unsigned char *pixels1 = &image[(width*i*2 + j*2+1)*bpp];
            unsigned char *pixels2 = &image[(width*(i*2+1) + j*2)*bpp];
            unsigned char *pixels3 = &image[(width*(i*2+1) + j*2+1)*bpp];
            vector<unsigned char> reds = {pixels0[0],pixels1[0],pixels2[0],pixels3[0]};

            unsigned char res = mediana(reds);

            pixels0[0]=res;
            pixels0[1]=res;
            pixels0[2]=res;
            image2[(width2*i + j)*bpp2] = *pixels0;

            // newImg[h][w] = mediana([ water_img[h*2][w*2], water_img[h*2][w*2+1], water_img[h*2+1][w*2], water_img[h*2+1][w*2+1]])
            
        }
    }

    int succ = stbi_write_png("./pics/water_landx2.png",int(width2/2),int(height2/2),4,image2,width2*2);

    stbi_image_free(image);
}

void eu_to_water_land(){

    int width, height, bpp;

    unsigned char *image = stbi_load("./pics/eu.png", &width, &height, &bpp, 4);

    float half = 255*(0.100093+0.5);

    
    for(int i=0;i<height;i++){
        for(int j=0;j<width;j++){
            unsigned char *pixels = &image[(width*i + j)*bpp];

            unsigned char r = pixels[0];
            unsigned char g = pixels[1];
            unsigned char b = pixels[2];
            unsigned char a = pixels[3];
    
            if(r>=half){
                pixels[0]=255;
                pixels[1]=255;
                pixels[2]=255;
                image[(width*i + j)*bpp] = *pixels;

            }
            else{
                pixels[0]=0;
                pixels[1]=0;
                pixels[2]=0;
                image[(width*i + j)*bpp] = *pixels;

            }
        }
    }

    int succ = stbi_write_png("./pics/water_land.png",width,height,4,image,width*4);

    stbi_image_free(image);
}

//  / 1  \
// 0   +  2
//  \  3  /
vector<int> valid_moves(int height, int width, int i, int j){
    vector<int> moves;
    pair<int,int> possible_moves[] = {make_pair(i,j-1),make_pair(i+1,j),make_pair(i,j+1),make_pair(i-1,j)};
    for(int k=0;k<4;k++){
        pair<int,int> tmp = possible_moves[k];
        int h = tmp.first;
        int w = tmp.second;
        if(h>=0 && h<=height-1 && w>=0 && w<=width) moves.push_back(k);
    }
    return(moves);
}

bool is_coastal(unsigned char *image, int height, int width, int bpp, int i, int j){

    unsigned char *pixels = &image[(width*i + j)*bpp];
    
    unsigned char r = pixels[0];
    //cout << int(pixels[0]) << " " << int(pixels[1]) << " " << int(pixels[2]) << "\n";
    //if not land it's not coastal
    if(r!=255)return false;
    
    vector<int> moves = valid_moves(height,width,i,j);

    
    int height_arr[] = {0,1,0,-1};
    int width_arr[] = {-1,0,1,0};
    for(int m=0;m<moves.size();m++){
        int place = (width*(i+height_arr[moves[m]]) + (j+width_arr[moves[m]]))*bpp;
        unsigned char *child_pixels = &image[place];
        unsigned char child_r = child_pixels[0];
        if(child_r==0) return true;
    }
    return false;
}

//working idk what was wrong
vector<pair<int,int>> count_coastal_tiles(unsigned char *image, int height, int width, int bpp){
    

    vector<pair<int,int>> coastal_tiles;

    for(int i=0;i<int(height);i++){
        for(int j=0;j<int(width);j++){
            if(is_coastal(image,height,width,bpp,i,j)){
                coastal_tiles.push_back(make_pair(i,j));
                //cout << i << " " << j << "\n";
            }

        }
    }


    

    return(coastal_tiles);
}


int distance(int i,int j,int h,int w){
    return (i-h)*(i-h)+(j-w)*(j-w); // return for smarter(?) version
    //return (abs(i-h)+abs(j-w)); // return for dumb algorithm
}
vector<pair<int,int>> path(tuple<int,int,int,int> min_dist_shore_point, vector<vector<bool>> vis){
    vector<pair<int,int>> points;

    int point_h = get<0>(min_dist_shore_point);
    int point_w = get<1>(min_dist_shore_point);
    int shore_h = get<2>(min_dist_shore_point);
    int shore_w = get<3>(min_dist_shore_point);

    //min_dist_shore_point(i, j, shore_h, shore_w)
    int y_diff = point_h-shore_h;
    int x_diff = point_w-shore_w;

    // straight from c to d
    // 1.
    // cy = a*cx + b
    // dy = a*dx + b
    // 2.
    // b = cy - a*cx
    // b = dy - a*dx
    // 3.
    // cy - a*cx = dy - a*dx
    // 4.
    // cy - dy = a*cx - a*dx
    // 5.
    // a = (cy - dy)/(cx - dx)
    // b = cy - a*cx

    if(x_diff==0){
        
        if(y_diff==0){
            return(points);
        }
        // the destination point is lower than the sea point
        else if(y_diff>0){
            while(y_diff--){
                int y_point = shore_h+y_diff+1;
                if(vis[y_point][point_w])return(points);
                points.push_back(make_pair(y_point,point_w));
            }
            return(points);
        }
        // the destination point is higher than the sea point
        else if(y_diff<0){
            while(abs(y_diff++)){
                int y_point = shore_h+y_diff-1;
                if(vis[y_point][point_w])return(points);
                points.push_back(make_pair(y_point,point_w));
            }
            return(points);
        }
    }
    // the destination point is to the right of the sea point
    else if(x_diff>0){
        if(y_diff==0){
            while(x_diff--){
                int x_point = shore_w+x_diff+1;
                if(vis[point_h][x_point])return(points);
                points.push_back(make_pair(point_h,x_point));
            }
            return(points);
        }
        // top right quarter and down right quarter is solved using the same equation
        else{
            float a = (point_h - shore_h)/(point_w - shore_w);
            float b = point_h - a*point_w;
            while(x_diff--){
                float y_at_straight = a*(shore_w+x_diff+1)+b;
                float y_frac_part=0;
                if(y_at_straight>0){
                    y_frac_part = abs(y_at_straight-int(y_at_straight));
                }
                else if(y_at_straight<0){
                    y_frac_part = 1-(abs(y_at_straight)-abs(int(y_at_straight)));
                }

                if(y_frac_part>=0.5){
                    int y_point = ceil(y_at_straight);
                    int x_point = shore_w+x_diff+1;
                    if(vis[y_point][x_point])return(points);
                    points.push_back(make_pair(y_point,x_point));
                }
                else if(y_frac_part<0.5){
                    int y_point = floor(y_at_straight);
                    int x_point = shore_w+x_diff+1;
                    if(vis[y_point][x_point])return(points);
                    points.push_back(make_pair(y_point,x_point));
                }
            }
            return(points);
        }
    }
    // the destination point is to the left of the sea point
    else if(x_diff<0){
        if(y_diff==0){
            while(abs(x_diff++)){
                int x_point = shore_w+x_diff-1;
                if(vis[shore_h][x_point])return(points);
                points.push_back(make_pair(shore_h,x_point));
            }
            return(points);
        }
        // down left and top left
        else{
            float a = (point_h - shore_h)/(point_w - shore_w);
            float b = point_h - a*point_w;
            while(abs(x_diff++)){
                float y_at_straight = a*(shore_w+x_diff-1)+b;
                float y_frac_part=0;
                if(y_at_straight>0){
                    y_frac_part = y_at_straight-int(y_at_straight);
                }
                else if(y_at_straight<0){
                    y_frac_part = 1-(abs(y_at_straight)-abs(int(y_at_straight)));
                }

                if(y_frac_part>=0.5){
                    int y_point = ceil(y_at_straight);
                    int x_point = shore_w+x_diff-1;
                    if(vis[y_point][x_point])return(points);
                    points.push_back(make_pair(y_point,x_point));
                }
                else if(y_frac_part<0.5){
                    int y_point = floor(y_at_straight);
                    int x_point = shore_w+x_diff-1;
                    if(vis[y_point][x_point])return(points);
                    points.push_back(make_pair(y_point,x_point));
                }
            }
            return(points);
        }
    }

    return(points);
}

void mark_path(vector<vector<bool>> vis,unsigned char *result_image,int height2, int width2, int width2sq, int bpp2, tuple<int,int,int,int> min_dist_shore_point){
    vector<pair<int,int>> path_through = path(min_dist_shore_point, vis);
    int h_destination = get<2>(min_dist_shore_point);
    int w_destination = get<3>(min_dist_shore_point);
    int dist=width2sq;
    for(pair<int,int> point:path_through){
        int i=get<0>(point);
        int j=get<1>(point);
        if(vis[i][j])continue;
        vis[i][j]=1;


        dist = distance(i,j,h_destination,w_destination);
        dist = int(((float(dist)/float(width2sq/64))*255)); //changed from width2/4 to --> width2sq/16
        if(dist>255)dist=255;
        else if(dist==0)dist=1;
        unsigned char *pixels = &result_image[(width2*i + j)*bpp2];
        pixels[0]=(unsigned char)dist;
        //pixels[1]=(unsigned char)dist;
        //pixels[2]=(unsigned char)dist;
        //pixels[3]=(unsigned char)dist;
        result_image[(width2*i + j)*bpp2] = *pixels;
    }
    
}

bool dts_worker(vector<vector<bool>> vis, vector<pair<int,int>> coastal_tiles, unsigned char *result_image, int height2, int width2, int bpp2, tuple<int,int,int,int> ranges){
    int smallest= width2;
    // curr height, curr width, 
    //tuple<int,int,int,int> min_dist_shore_point(0,0,0,0);
    int width2sq = width2*width2;
    for(int i=get<0>(ranges);i<get<2>(ranges);i++){
        for(int j=get<1>(ranges);j<get<3>(ranges);j++){
            if(vis[i][j])continue;
            // mark current i, j as visited
            vis[i][j]=1; 
            smallest=width2sq; //changed from width2 to --> width2sq/16
            // initialize the min_dist_shore_point to 0 distance
            //get<0>(min_dist_shore_point) = i;
            //get<1>(min_dist_shore_point) = j;
            //get<2>(min_dist_shore_point) = i;
            //get<3>(min_dist_shore_point) = j;
            for(pair<int,int> tile:coastal_tiles){
                int h = tile.first;
                int w = tile.second;
                int dist = distance(i,j,h,w);
                //int dist = (abs(i-h)+abs(j-w));
                if(dist<smallest){
                    smallest=dist;
                    //get<2>(min_dist_shore_point) = h;
                    //get<3>(min_dist_shore_point) = w;
                }
                //if(smallest>2)cout << smallest << "\n";
            }
            //mark_path(vis, result_image, height2, width2, width2sq, bpp2, min_dist_shore_point);
            
            // now this code gets executed for every point in the mark_path function which turns out to be slower than brute force
            smallest = int(((float(smallest)/float((2*255)*(2*255)))*255)); //changed from width2/4 to --> width2sq/16 --> 64(v2) --> 256(v3) --> width2sq/512(v4) --> 255*255(v5)
            if(smallest>255)smallest=255;
            else if(smallest==0)smallest=1;
            unsigned char *pixels = &result_image[(width2*i + j)*bpp2];
            pixels[0]=(unsigned char)smallest;
            pixels[1]=(unsigned char)smallest; // needs this on 16K version
            pixels[2]=(unsigned char)smallest; // needs this on 16K version
            // pixels[3]=(unsigned char)smallest; // needs this on 16K version
            result_image[(width2*i + j)*bpp2] = *pixels;
        }

        // if(i==get<0>(ranges)+5)break;
    }
    return 1;
}

void distance_to_shore(){
    int width, height, bpp;

    unsigned char *image = stbi_load("./pics/water_land.png", &width, &height, &bpp, CHANNELS); //for some reason doesnt work with 1 channel on full scale version


    // // counts water and land tiles
    // int nland=0,nwater=0;
    // for(int i=0;i<height;i++){
    //     for(int j=0;j<width;j++){
    //         unsigned char *pixels = &image[(width*i + j)*bpp];
    //         unsigned char r = pixels[0];
    //         if(r==255) nland+=1;
    //         else nwater+=1;
    //     }
    // }


    //load and clean plain canvas
    int width2, height2, bpp2;
    unsigned char *result_image = stbi_load("./pics/water_land.png", &width2, &height2, &bpp2, CHANNELS); //for some reason doesnt work with 1 channel on full scale version
    for(int i=0;i<height2;i++){
        for(int j=0;j<width2;j++){
            unsigned char *pixels = &result_image[(width2*i + j)*bpp2];
            pixels[0]=0;
            pixels[1]=0;
            pixels[2]=0;
            result_image[(width2*i + j)*bpp2] = *pixels;
        }
    }

    //init visited vector for checking whether a tile has been processed
    vector<bool> my_child(width2, 0);
    vector<vector<bool>> vis(height2,my_child); 
    //fill vis with land tiles
    for(int i=0;i<height;i++){
        for(int j=0;j<width;j++){
            unsigned char *pixels = &image[(width*i + j)*bpp];
            unsigned char r = pixels[0];
            if(r==255) vis[i][j]=1;
        }
    }

    vector<pair<int,int>> coastal_tiles = count_coastal_tiles(image,height,width,bpp);
    
    // ranges for each worker (h from, w from, h to w to) including start pos, excluding end_pos
    vector<tuple<int,int,int,int>> options;

    int width_amount = int(THREADS/4);
    int height_amount = 4;
    int width_interval = int(width2/width_amount);
    int height_interval = int(height2/height_amount);
    
    //confing options for all threads
    for(int i=0;i<height_amount;i++){
        for(int j=0; j<width_amount;j++){
            options.push_back(make_tuple(height_interval*(i),width_interval*(j),height_interval*(i+1),width_interval*(j+1)));
        }
    }
    tuple<int,int,int,int> default_options ={0,0,height2,width2};
    
    switch(THREADS){
        case(16):{
            future<bool> f0 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[0]);
            future<bool> f1 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[1]);
            future<bool> f2 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[2]);
            future<bool> f3 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[3]);
            future<bool> f4 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[4]);
            future<bool> f5 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[5]);
            future<bool> f6 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[6]);
            future<bool> f7 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[7]);
            future<bool> f8 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[8]);
            future<bool> f9 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[9]);
            future<bool> f10 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[10]);
            future<bool> f11 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[11]);
            future<bool> f12 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[12]);
            future<bool> f13 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[13]);
            future<bool> f14 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[14]);
            future<bool> f15 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[15]);
            f0.get();
            f1.get();
            f2.get();
            f3.get();
            f4.get();
            f5.get();
            f6.get();
            f7.get();
            f8.get();
            f9.get();
            f10.get();
            f11.get();
            f12.get();
            f13.get();
            f14.get();
            f15.get();
            break;
        }
        case(8):{
            future<bool> f0 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[0]);
            future<bool> f1 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[1]);
            future<bool> f2 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[2]);
            future<bool> f3 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[3]);
            future<bool> f4 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[4]);
            future<bool> f5 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[5]);
            future<bool> f6 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[6]);
            future<bool> f7 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, options[7]);
            f0.get();
            f1.get();
            f2.get();
            f3.get();
            f4.get();
            f5.get();
            f6.get();
            f7.get();
            break;
        }
        default:{
            future<bool> f0 = async(dts_worker,vis,coastal_tiles, result_image, height2,width2, bpp, default_options);
            f0.get();
            break;
        }
    }
    

    // cout << "Number of water tiles: " << nwater << "\n";
    // cout << "Number of land tiles: " << nland << "\n";
    //cout << "Number of coastal tiles: " << coastal_tiles.size() << "\n";
    
    int succ = stbi_write_png("./pics/finalv2.png",width2,height2,CHANNELS,result_image,width2*CHANNELS); //width2 required for 8K version
    stbi_image_free(result_image);
    stbi_image_free(image);
}

int main() {
    auto start = chrono::system_clock::now();


    distance_to_shore();


    auto end = chrono::system_clock::now();
    chrono::duration<double> elapsed_seconds = end-start;
    time_t end_time = chrono::system_clock::to_time_t(end);
    cout << "elapsed time: " << elapsed_seconds.count() << "s" << endl;
    return 0;
}