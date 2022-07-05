import bpy
import os
import json

scene = bpy.context.scene

eu_list = []
for o in scene.objects:
    print(o.name)
    if("eu" in o.name):
        try:
            #print(o.name)
            #print(o.location)
            eu_list.append(o)
        except:
            print("fail: ", o) 

directory = "D:\\Projekty\\html\\traine\\public\\assets\\map\\eu_mid\\"


main_dict = {}
for ob in eu_list:
    #in babylon y is height and x and z are flipped
    main_dict[ob.name] = {"x":ob.dimensions.x , "y":ob.dimensions.y , "z":ob.dimensions.z}

print(main_dict)
    
file = open(directory + "chunk_dimensions.json", "w+")
json_str = json.dumps(main_dict)
file.write(json_str)
file.close()

# filename = "D:\Projekty\Blender\scripts\json dimensions"
# exec(compile(open(filename).read(), filename, 'exec')) 
# life saver