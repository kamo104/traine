# traine

This program uses multiprocessing to create distance image for every pixel of water to shore lines.

The algorithm used first finds all the shore points and then runs in chunks of the image finding the nearest shore point to a pixel.
It's important to note that making a BFS version could be more beneficial in some scenarios, (when theres a lot of land and water mixed) however in my case water is in big reservoirs.
