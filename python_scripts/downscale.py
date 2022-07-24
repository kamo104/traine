import cv2 as CV
import json
import time
import numpy as np

# script for downscaling an image 2x using opencv

start = time.time()


img = CV.imread("./images/water_land.png",CV.IMREAD_GRAYSCALE)


imgH = img.shape[0]
imgW = img.shape[1]

water_img =  img



newImg = [[0 for _ in range(imgW//2)] for _ in range(imgH//2)]

def mediana(x):
    x.sort()
    count=0
    for i in x:
        count +=1
    return(x[count//2])

for w in range(imgW//2):
    for h in range(imgH//2):

        #x=mediana([ water_img[h*2][w*2], water_img[h*2][w*2+1], water_img[h*2+1][w*2], water_img[h*2+1][w*2+1]])
        newImg[h][w] = mediana([ water_img[h*2][w*2], water_img[h*2][w*2+1], water_img[h*2+1][w*2], water_img[h*2+1][w*2+1]])



result = np.array(newImg)

CV.imwrite("./images/water_landx2.png",result)



end = time.time()
print("The script took:", end-start, "s")