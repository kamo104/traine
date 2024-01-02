import bpy
import os
import json

scene = bpy.context.scene

object_list = []
search_phrase = "island"

for o in scene.objects:
    print(o.name)
    if(search_phrase in o.name):
        try:
            #print(o.name)
            #print(o.location)
            object_list.append(o)
        except:
            print("fail: ", o) 

output_directory = "D:\\Projekty\\html\\traine all\\blender\\map\\"


main_dict = {}
for ob in object_list:
    #in babylon y is height and x and z are flipped
    main_dict[ob.name[len(search_phrase)+1:]] = {"x":ob.dimensions.x , "y":ob.dimensions.y , "z":ob.dimensions.z}

print(main_dict)
    
file = open(output_directory + "chunk_dimensions.json", "w+")
json_str = json.dumps(main_dict)
file.write(json_str)
file.close()

# filename = "D:\Projekty\Blender\scripts\json dimensions"
# exec(compile(open(filename).read(), filename, 'exec')) 
# life saver