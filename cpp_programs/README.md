# Image processing

This program uses a great header library for images from https://github.com/nothings/stb

This program uses multiprocessing to create distance image for every pixel of water to shore lines.

The algorithm used first finds all the shore points and then runs in chunks of the image finding the nearest shore point to a pixel.
It's important to note that making a BFS version could be more beneficial in some scenarios, (when theres a lot of land and water mixed) however in my case water is in big reservoirs.


Compile command:

g++ -O3 main_parallel.cpp -o main

Run with command:
./main -i INPUT_IMAGE_PATH -o OUTPUT_IMAGE_PATH -s SHORELINE_HEIGHT -c COMMAND

INPUT_IMAGE_PATH for example: "./pics/water_landx2.png"
OUTPUT_IMAGE_PATH for example: "./pics/eu_test.png"
SHORELINE_HEIGHT - a value from 0 to 255 below which is the water level
COMMAND - 1 | 2 | 3 - a number indicating which processing command to run