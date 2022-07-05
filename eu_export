import bpy
import os

scene = bpy.context.scene

eu_list = []
for o in scene.objects:
    if("eu" in o.name): # eu
        try:
            #print(o.name)
            #print(o.location)
            eu_list.append(o)
        except:
            print("fail: ", o) 

directory = "D:\\Projekty\\html\\traine\\public\\assets\\map\\eu_mid\\obj\\"

bpy.ops.object.select_all(action='DESELECT') 

for ob in eu_list:
    # Select each object
    ob.select_set(True)

    # Make sure that we only export meshes
    if ob.type == 'MESH': #ob.type == 'MESH'
        # Export the currently selected object to its own file based on its name
        bpy.ops.export_scene.obj(
                filepath=os.path.join(directory, ob.name + '.obj'),
                use_mesh_modifiers=True,
                use_selection=True,
                use_materials=False,
                axis_forward='Z',
                axis_up='Y',
                use_uvs=True, #should be True
                )
    # Deselect the object and move on to another if any more are left
    ob.select_set(False)
    
    
    
#export as gltf




# filename = "D:\\Projekty\\Blender\\scripts\\eu_export"
# exec(compile(open(filename).read(), filename, 'exec')) 
