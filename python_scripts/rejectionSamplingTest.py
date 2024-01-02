
import cv2 as CV
import json
import time
import numpy as np
import random
import os


# script testing rejection sampling's speed

# algorithm takes a random point from the image and generates a random probability p with it, then if  p > Pd(point), it's rejected and the search is still on
# worst case O(inf) (ideal mapping)
#
# optimisation +O(h*w) generates a map of points with P(n)>0 and then feeds these points to the algorithm
# good for images where we know there are a lot of points with Pd(x) = 0
#
# optimisation for stable execution time O(numOfPointsToFind*M) (where M is how close we want the algorithm be to an ideal distribution)
# if p > Pd(point), it's rejected and the search continues for M-- times, if there is no match in any of M times, 
# return a point with the smallest p - Pd(point) from the search



start = time.time()

source_path =  "./python_scripts/pics/water_dist/"
source_image = "final.png"   

cwd = os.getcwd()

img = CV.imread(os.path.join(cwd,source_path,source_image),CV.IMREAD_GRAYSCALE)

imgH = img.shape[0]
imgW = img.shape[1]



imgCpy = np.zeros((imgH,imgW,3), np.uint8)

# print("image copied")

# smartMap = []


# for i in range(imgH):
#     temp = []
#     for j in range(imgW):
#         if(img[i][j]>0):
#             temp.append((i,j))
#     if(len(temp)):
#         smartMap.append(temp)
#         print(f"row {i} done")

# print("Set up smartMap")

numOfSamples = 500000

numOfPointsToFind = 100000

finds = []

while(numOfPointsToFind):
    # r1 = random.randrange(0,len(smartMap))                # sample with mapping
    # r2 = random.randrange(0,len(smartMap[r1]))            # sample with mapping
    # sample = smartMap[r1][r2]                             # sample with mapping

    sample = (random.randrange(0,imgH),random.randrange(0,imgW))      # sample without mapping
    sampleProb = random.randrange(0,256)
    if(img[sample[0]][sample[1]]>sampleProb):
        finds.append(sample)
        numOfPointsToFind-=1
    numOfSamples-=1


print("Found", len(finds), "points")
start = time.time()

# for point in finds:
#     imgCpy[point[0],point[1]] = (255,255,255)

# CV.imwrite("./python_scripts/pics/output/test.png",imgCpy)



# imgCpy = CV.resize(imgCpy, (500,500), interpolation = CV.INTER_AREA)
# CV.imshow('image',imgCpy)
# CV.waitKey(0)

end = time.time()
print("The script took:", end-start, "s")