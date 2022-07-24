import cv2 as CV
import json

# script for slicing an image into chunks defined in json_file {"file_name":{"x":some_size,"y":some_other_size}}
# currently asserts all chunk sizes equal to each other, however x and y can have different values


img = CV.imread("D:\\Projekty\\html\\traine\\public\\textures\eu-mid\\eu-mid_diff2.png",CV.IMREAD_UNCHANGED)

with open("D:\\Projekty\\html\\traine\\public\\assets\\map\\eu_mid\\chunk_dimensions.json") as json_file:
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

currX=0
currY=0

count =0
for __ in range(nRows):
    currX=0
    for _ in range(nCols):
        print(currX, currY)
        tempImg = img[int(currY):int(currY+Y*imgScaleY),int(currX):int(currX+X*imgScaleX)] # *scale
        CV.imwrite("D:\\Projekty\\html\\traine\\public\\textures\eu-mid\\sliced2\\"+keys[count]+".png",tempImg)

        count+=1
        currX+=X*imgScaleX
    currY+=Y*imgScaleY




