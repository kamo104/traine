import bpy
import os

from bpy import context as ctx

scene = bpy.context.scene

object_list = []
for o in scene.objects:
    if("island" in o.name):
            object_list.append(o)



for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        area.spaces.active.region_3d.view_perspective = 'CAMERA'
        break



bpy.ops.object.mode_set(mode = 'OBJECT') 
        
        
        

for ob in object_list:
    bpy.ops.object.select_all(action = 'DESELECT')
    # Select each object
    ob.select_set(True)
    bpy.context.view_layer.objects.active = ob

    if ob.type == 'MESH': 
        
        #True

        bpy.ops.object.mode_set(mode = 'EDIT') 
        # bpy.ops.mesh.select_mode(type = "VERT")
        bpy.ops.mesh.select_all(action = 'SELECT')
        
        for area in bpy.context.screen.areas:
            if area.type == 'VIEW_3D':
                for region in area.regions:
                    if region.type == 'WINDOW':
                        override = {'area': area, 'region': region, 'edit_object': bpy.context.edit_object}
                        bpy.ops.uv.project_from_view(override , camera_bounds=True, correct_aspect=False, scale_to_bounds=True)
        
        for area in bpy.context.screen.areas:
            if area.type == 'IMAGE_EDITOR':   #find the UVeditor
                cursor = area.spaces.active.cursor_location   # get cursor location
                area.spaces.active.cursor_location.x = 0.5;
                area.spaces.active.cursor_location.y = 0.5;
                
                
                
                bpy.context.area.ui_type = 'UV'
                
                bpy.context.space_data.uv_editor.lock_bounds = True
                

                bpy.ops.uv.snap_selected(target = 'CURSOR_OFFSET')
                
                # bpy.ops.transform.resize(value=(10.0, 10.0, 10.0))
                  
        
        bpy.ops.mesh.select_all(action = 'DESELECT')
        bpy.ops.object.mode_set(mode = 'OBJECT')
        
    # Deselect the object and move on to another if any more are left
    ob.select_set(False)
    
    
    




# filename = "D:\\Projekty\\html\\traine all\\blender_scripts\\set uvs.py"
# exec(compile(open(filename).read(), filename, 'exec')) 

