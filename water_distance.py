import cv2 as CV
import json
import time
import numpy as np
import sys
import queue
import os

sys.setrecursionlimit(10**6)

start = time.time()


img = CV.imread("./images/downscaled64.png",CV.IMREAD_GRAYSCALE)


imgH = img.shape[0]
imgW = img.shape[1]

water_land = img


diag = imgH+imgW-2
newImg = [[diag for _ in range(imgW)] for _ in range(imgH)]

for w in range(imgW):
    for h in range(imgH):
        if(water_land[h][w]==255):
            newImg[h][w]=0

# marks back path from land tile to water_tile
def mark_back_path(p_from,p_to):
    if(p_from == p_to):
        return(0)
    else:
        #do out func here
        return(0)

def distance_from_to(p_from,p_to):
    h = abs(p_from[0]-p_to[0])
    w = abs(p_from[1]-p_to[1])
    #print(h+w)
    return(h+w)

water_code=255
vis_code=254
def bfs(h,w):
    #print(h,w)
    if(vis[h][w]==water_code):
        return(0)

    q = queue.Queue()
    q.put((h,w))
    vis[h][w]=vis_code
    
    while q.not_empty:
        v = q.get()
        #print(v)
        if(vis[v[0]][v[1]]==water_code):
            return(distance_from_to((h,w),v))
        # if at the bottom
        if(v[0]==0):
            # if at the left
            if(v[1]==0):
                #go up
                if(vis[v[0]+1][v[1]]!=vis_code):
                    if(vis[v[0]+1][v[1]]!=water_code):
                        vis[v[0]+1][v[1]]=vis_code
                    q.put((v[0]+1,v[1]))
                #go right
                if(vis[v[0]][v[1]+1]!=vis_code):
                    if(vis[v[0]][v[1]+1]!=water_code):
                        vis[v[0]][v[1]+1]=vis_code
                    q.put((v[0],v[1]+1))
            # if at the right
            elif(v[1]==imgW-1):
                # go up
                if(vis[v[0]+1][v[1]]!=vis_code):
                    if(vis[v[0]+1][v[1]]!=water_code):
                        vis[v[0]+1][v[1]]=vis_code
                    q.put((v[0]+1,v[1]))
                # go left
                if(vis[v[0]][v[1]-1]!=vis_code):
                    if(vis[v[0]][v[1]-1]!=water_code):
                        vis[v[0]][v[1]-1]=vis_code
                    q.put((v[0],v[1]-1))
            # if between left and right
            else:
                # go up
                if(vis[v[0]+1][v[1]]!=vis_code):
                    if(vis[v[0]+1][v[1]]!=water_code):
                        vis[v[0]+1][v[1]]=vis_code
                    q.put((v[0]+1,v[1]))
                # go left
                if(vis[v[0]][v[1]-1]!=vis_code):
                    if(vis[v[0]][v[1]-1]!=water_code):
                        vis[v[0]][v[1]-1]=vis_code
                    q.put((v[0],v[1]-1))
                # go right
                if(vis[v[0]][v[1]+1]!=vis_code):
                    if(vis[v[0]][v[1]+1]!=water_code):
                        vis[v[0]][v[1]+1]=vis_code
                    q.put((v[0],v[1]+1))
        # if at the top
        if(v[0]==imgH-1):
            # if at the left
            if(v[1]==0):
                # go down
                if(vis[v[0]-1][v[1]]!=vis_code):
                    if(vis[v[0]-1][v[1]]!=water_code):
                        vis[v[0]-1][v[1]]=vis_code
                    q.put((v[0]-1,v[1]))
                # go right
                if(vis[v[0]][v[1]+1]!=vis_code):
                    if(vis[v[0]][v[1]+1]!=water_code):
                        vis[v[0]][v[1]+1]=vis_code
                    q.put((v[0],v[1]+1))
            # if at the right
            elif(v[1]==imgW-1):
                # go down
                if(vis[v[0]-1][v[1]]!=vis_code):
                    if(vis[v[0]-1][v[1]]!=water_code):
                        vis[v[0]-1][v[1]]=vis_code
                    q.put((v[0]-1,v[1]))
                # go left
                if(vis[v[0]][v[1]-1]!=vis_code):
                    if(vis[v[0]][v[1]-1]!=water_code):
                        vis[v[0]][v[1]-1]=vis_code
                    q.put((v[0],v[1]-1))
            # if between left and right
            else:
                # go down
                if(vis[v[0]-1][v[1]]!=vis_code):
                    if(vis[v[0]-1][v[1]]!=water_code):
                        vis[v[0]-1][v[1]]=vis_code
                    q.put((v[0]-1,v[1]))
                # go left
                if(vis[v[0]][v[1]-1]!=vis_code):
                    if(vis[v[0]][v[1]-1]!=water_code):
                        vis[v[0]][v[1]-1]=vis_code
                    q.put((v[0],v[1]-1))
                # go right
                if(vis[v[0]][v[1]+1]!=vis_code):
                    if(vis[v[0]][v[1]+1]!=water_code):
                        vis[v[0]][v[1]+1]=vis_code
                    q.put((v[0],v[1]+1))
        # if between top and bottom
        else:
            # if at the left
            if(v[1]==0):
                # go up
                if(vis[v[0]+1][v[1]]!=vis_code):
                    if(vis[v[0]+1][v[1]]!=water_code):
                        vis[v[0]+1][v[1]]=vis_code
                    q.put((v[0]+1,v[1]))
                # go down
                if(vis[v[0]-1][v[1]]!=vis_code):
                    if(vis[v[0]-1][v[1]]!=water_code):
                        vis[v[0]-1][v[1]]=vis_code
                    q.put((v[0]-1,v[1]))
                # go right
                if(vis[v[0]][v[1]+1]!=vis_code):
                    if(vis[v[0]][v[1]+1]!=water_code):
                        vis[v[0]][v[1]+1]=vis_code
                    q.put((v[0],v[1]+1))
            # if at the right
            elif(v[1]==imgW-1):
                # go up
                if(vis[v[0]+1][v[1]]!=vis_code):
                    if(vis[v[0]+1][v[1]]!=water_code):
                        vis[v[0]+1][v[1]]=vis_code
                    q.put((v[0]+1,v[1]))
                # go down
                if(vis[v[0]-1][v[1]]!=vis_code):
                    if(vis[v[0]-1][v[1]]!=water_code):
                        vis[v[0]-1][v[1]]=vis_code
                    q.put((v[0]-1,v[1]))
                # go left
                if(vis[v[0]][v[1]-1]!=vis_code):
                    if(vis[v[0]][v[1]-1]!=water_code):
                        vis[v[0]][v[1]-1]=vis_code
                    q.put((v[0],v[1]-1))
            # if between left and right
            else:
                # go up
                if(vis[v[0]+1][v[1]]!=vis_code):
                    if(vis[v[0]+1][v[1]]!=water_code):
                        vis[v[0]+1][v[1]]=vis_code
                    q.put((v[0]+1,v[1]))
                # go down
                if(vis[v[0]-1][v[1]]!=vis_code):
                    if(vis[v[0]-1][v[1]]!=water_code):
                        vis[v[0]-1][v[1]]=vis_code
                    q.put((v[0]-1,v[1]))
                # go left
                if(vis[v[0]][v[1]-1]!=vis_code):
                    if(vis[v[0]][v[1]-1]!=water_code):
                        vis[v[0]][v[1]-1]=vis_code
                    q.put((v[0],v[1]-1))
                # go right
                if(vis[v[0]][v[1]+1]!=vis_code):
                    if(vis[v[0]][v[1]+1]!=water_code):
                        vis[v[0]][v[1]+1]=vis_code
                    q.put((v[0],v[1]+1))


    return(diag)



for w in range(imgW):
        for h in range(imgH):
            vis = water_land.copy()
            newImg[h][w] = bfs(h,w)


result = np.array(newImg)

CV.imwrite("./images/distance_map.png",result)



end = time.time()
print("The script took:", end-start, "s")

os.system("pause")