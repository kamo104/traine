import cv2 as CV
import json
import os
import math
import sys

# script for slicing an image into chunks defined in json_file {"CHUNK_NAME":{"x":X_SIZE,"y":Y_SIZE}}
# currently asserts all chunk sizes equal to each other, however they are not necessarily squares
# 
# -s [sourcePath] source image relative path
# -o [outputFolderName] output folder name in cwd
# -d [dimensionsPath] relative path to chunk_dimensions.json
#
# example: 
# python imageSlice.py -s ./pics/island_grass/grassDensity.png -o ./pics/output/ -d ./pics/island_diff/chunk_dimensions.json

class Main:
    source_path =  "./python_scripts/pics/island_diff/diffuse.png" 
    
    output_folder = "./python_scripts/pics/output/"                             
    dimensions_json = "./python_scripts/pics/island_diff/chunk_dimensions.json" 

    
    def parseInput(self)->int:
        for i in range(0,len(sys.argv)):
            if sys.argv[i] == "-s":
                self.source_path = sys.argv[i+1]
                i+=1
            elif sys.argv[i] == "-o":
                self.output_folder = sys.argv[i+1]
                i+=1
            elif sys.argv[i] == "-d":
                self.dimensions_json = sys.argv[i+1]
                i+=1
        return 0

    def debugInfo(self, X, Y,imgScaleX, imgScaleY, nCols, nRows, imgW, imgH):
        print(
            "",
            f" X: {X}",
            f" Y: {Y}",
            f" imgScaleX: {imgScaleX}",
            f" imgScaleY: {imgScaleY}",
            f" nCols: {nCols}",
            f" nRows: {nRows}",
            f" imgW: {imgW}",
            f" imgH: {imgH}",
            "",
            sep='\n'
        )

    def runAlgorithm(self)->int:

        cwd = os.getcwd()
        
        img = CV.imread(os.path.join(cwd,self.source_path),CV.IMREAD_UNCHANGED)

        with open(os.path.join(cwd,self.dimensions_json)) as json_file:
            data = dict(json.load(json_file))

        keys = [key for key in data.keys()]

        keys.sort(key = int)

        imgW = img.shape[1]
        imgH = img.shape[0]

        mapXMax = 600
        mapYMax = 600

        X =data[keys[0]]["x"]
        Y =data[keys[0]]["y"]

        imgScaleX = imgW/mapXMax
        imgScaleY = imgH/mapYMax

        nCols = int(mapXMax/math.floor(X))
        nRows = int(mapYMax/math.floor(Y))

        currX=0
        currY=0
        
        self.debugInfo(X,Y,imgScaleX,imgScaleY,nCols,nRows,imgW,imgH)

        count =0
        for i in range(nRows):
            currX=0
            for j in range(nCols):
                # print(f'X from: {int(currX)}')
                # print(f'X to: {int(currX+math.floor(X)*imgScaleX)}')
                # print(f'Y from: {int(currY)}')
                # print(f'Y to: {int(currY+math.floor(Y)*imgScaleY)}')
                tempImg = img[int(currY):int(currY+math.floor(Y)*imgScaleY),int(currX):int(currX+math.floor(X)*imgScaleX)] # *scale
                CV.imwrite(os.path.join(cwd,self.output_folder,keys[count]+".png"),tempImg)

                count+=1
                currX+=math.floor(X)*imgScaleX
                print(i, j, "done")
            currY+=math.floor(Y)*imgScaleY

        print(f'Made {count} textures.')

        return count

    def __init__(self):
        return


if(__name__=="__main__"):
    app = Main()
    app.parseInput()
    app.runAlgorithm()