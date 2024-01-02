import bpy
import os
import json

scene = bpy.context.scene

object_list = []
search_phrase = "island"

search_phrase_len = len(search_phrase)


for o in scene.objects:
    print(o.name)
    if(search_phrase in o.name):
        try:
            #print(o.name)
            #print(o.location)
            object_list.append(o)
        except:
            print("fail: ", o) 

directory = "D:\\Projekty\\html\\traine all\\blender\\map\\"


main_dict = {}
for ob in object_list:
    #in babylon y is height and x and z are flipped
    #main_dict[ob.name] = {"x":(-1*ob.location[0]) , "y":(ob.location[2]) , "z":(ob.location[1])}
    main_dict[ob.name[search_phrase_len+1:]] = [-1*ob.location[0] , ob.location[2] , ob.location[1]]
    
print(main_dict)
    
file = open(directory + "chunk_info.json", "w+")
json_str = json.dumps(main_dict)
file.write(json_str)
file.close()

# filename = "D:\Projekty\Blender\scripts\eu_json_location"
# exec(compile(open(filename).read(), filename, 'exec')) 
# life saver