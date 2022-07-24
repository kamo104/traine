import cv2 as CV
import json
import time


# script for checking whether a pixel is water or land as with help of a threshold value, works on greyscale images

start = time.time()

half_at = 0.100093+0.5

img = CV.imread("./images/eu.png",CV.IMREAD_GRAYSCALE)

with open("D:\\Projekty\\html\\traine_ammo_better\\public\\assets\\map\\eu_mid\\chunk_dimensions.json") as json_file:
    data = dict(json.load(json_file))

keys = [key for key in data.keys()]
keys.sort()

imgW = img.shape[1]
imgH = img.shape[0]

mapXMax = 7680
mapYMax = 3748

X =data[keys[0]]["x"]
Y =data[keys[0]]["y"]

imgScaleX = imgW/mapXMax
imgScaleY = imgH/mapYMax
#print(imgScaleX, imgScaleY)
nCols = int(mapXMax/X) # 32 na szerokość nope, 64
nRows = int(mapYMax/Y) # 16 na wysokość

# -0.5 --> 0.5 (0.100093)
# 0 --> 1 (0.100093+0.5)



half = 255*half_at

def prep_square():
    print("")


water_img = img.copy()

row_count=0
el_count=0

for row in water_img:
    el_count=0
    for el in row:
        if(el<half):
            water_img[row_count][el_count]= 0
        else:
            water_img[row_count][el_count]= 255

        el_count+=1
    row_count +=1


CV.imwrite("./images/water_land.png",water_img)


end = time.time()
print("The script took:", end-start, "s")
