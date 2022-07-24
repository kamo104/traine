import bpy
import os

scene = bpy.context.scene

eu_list = []
coll = bpy.data.collections.get("eu")
for o in coll.objects:
    if("eu." in o.name):
        eu_list.append(o)


physics_list = []

coll = bpy.data.collections.get("eu_idk.002")
for o in coll.objects:
    if("physicsPlane_eu." in o.name):
        physics_list.append(o)

        
chunk_dict = {}
single_chunk_list = []       
for ob in eu_list:
    for o in physics_list:
        if ob.name in o.name:
            single_chunk_list.append(o)
    chunk_dict[ob.name] = single_chunk_list.copy()
    single_chunk_list.clear()

print(chunk_dict)
directory = "D:\\Projekty\\html\\traine\\public\\assets\\map\\eu_sliced\\physics\\"

for key, val in chunk_dict.items():
    if len(val)==0:
        continue
    bpy.ops.object.select_all(action='DESELECT')
    
    for ob in val:
        # Select each object
        # Make sure that we only export meshes
        if ob.type == 'MESH':
            ob.select_set(True)
            # Export the currently selected object to its own file based on its name
            
        # Deselect the object and move on to another if any more are left

    bpy.ops.export_scene.obj(filepath=os.path.join(directory, key + "_physics" + '.obj'),use_selection=True,)



# filename = "D:\\Projekty\\Blender\\scripts\\eu_physics_export"
#filename = path to text file
# exec(compile(open(filename).read(), filename, 'exec')) 
# life saver