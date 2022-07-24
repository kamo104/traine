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

directory = "D:\\Projekty\\html\\traine\\public\\assets\\map\\eu_mid\\gltf\\"

bpy.ops.object.select_all(action='DESELECT') 

for ob in eu_list:
    # Select each object
    ob.select_set(True)

    # Make sure that we only export meshes
    if ob.type == 'MESH': #ob.type == 'MESH'
        # Export the currently selected object to its own file based on its name
        bpy.ops.export_scene.gltf(
                filepath=os.path.join(directory, ob.name + '.gltf'),
                export_format="GLTF_SEPARATE",
                export_apply=True,
                #export_yup=True,
                use_selection=True,
                export_normals=True,
                export_materials="EXPORT",
                #axis_forward='Z',
                )
    # Deselect the object and move on to another if any more are left
    ob.select_set(False)
    
    
    
#export as gltf




# filename = "D:\Projekty\Blender\scripts\better_export"
# exec(compile(open(filename).read(), filename, 'exec')) 
