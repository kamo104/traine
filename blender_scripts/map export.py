import bpy
import os

scene = bpy.context.scene

object_list = []
search_phrase = "island"

for o in scene.objects:
    if("island" in o.name): # eu
        try:
            object_list.append(o)
        except:
            print("fail: ", o) 

directory = "D:\\Projekty\\html\\traine all\\blender\\map\\objs\\"

bpy.ops.object.select_all(action='DESELECT') 

for ob in object_list:
    # Select each object
    ob.select_set(True)

    # Make sure that we only export meshes
    if ob.type == 'MESH': #ob.type == 'MESH'
        # Export the currently selected object to its own file based on its name
        bpy.ops.export_scene.obj(
                filepath=os.path.join(directory, ob.name[len(search_phrase)+1:] + '.obj'),
                use_mesh_modifiers=True,
                use_selection=True,
                use_materials=False,
                axis_forward='Z',
                axis_up='Y',
                use_uvs=True, #should be True
                )
    # Deselect the object and move on to another if any more are left
    ob.select_set(False)
    



# filename = "D:\\Projekty\\html\\traine all\\blender_scripts\\map export.py"
# exec(compile(open(filename).read(), filename, 'exec')) 
