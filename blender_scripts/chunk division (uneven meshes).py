import bpy, bmesh
from bpy import context as C

class SelectedIntoFour(bpy.types.Operator):
    
    bl_label = "SelectedIntoFour"
    bl_idname = "wm.dialogop"
    
    def execute(self, context):
        selected_obj_list = [obj for obj in C.selected_objects]
        for obj in selected_obj_list:
            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            
            C.view_layer.objects.active = obj
            
            bpy.ops.object.mode_set(mode='EDIT') # bpy.ops.object

            bm = bmesh.from_edit_mesh(C.object.data)

            edges = []

            for i in range(-1, 1, 1):
                    ret = bmesh.ops.bisect_plane(bm, geom=bm.verts[:]+bm.edges[:]+bm.faces[:], plane_co=(i,0,0), plane_no=(-1,0,0))
                    bmesh.ops.split_edges(bm, edges=[e for e in ret['geom_cut'] if isinstance(e, bmesh.types.BMEdge)])

            for i in range(-1, 1, 1): #was (-10, 10, 2)
                    ret = bmesh.ops.bisect_plane(bm, geom=bm.verts[:]+bm.edges[:]+bm.faces[:], plane_co=(0,i,0), plane_no=(0,1,0))
                    bmesh.ops.split_edges(bm, edges=[e for e in ret['geom_cut'] if isinstance(e, bmesh.types.BMEdge)])
                            

            bmesh.update_edit_mesh(C.object.data)

            bpy.ops.mesh.separate(type='LOOSE')
            
            for ob in C.selected_objects:
                new_selected.append(ob)
                
            bpy.ops.object.mode_set(mode='EDIT')
            #delete duped verts and set origin to center
            bpy.ops.mesh.select_mode(type="VERT")
            bpy.ops.mesh.select_all(action = 'SELECT')
            bpy.ops.mesh.remove_doubles(threshold=0.0001, use_unselected=True, use_sharp_edge_from_normals=False)
            bpy.ops.object.mode_set(mode='OBJECT')
            bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
            
            
            
            bpy.context.view_layer.objects.active = None

            
        return{'FINISHED'}





addon_keymaps = []

def register():
    
    bpy.utils.register_class(SelectedIntoFour)
    
    wm = bpy.context.window_manager
    kc = wm.keyconfigs.addon
    if kc:
        km = kc.keymaps.new(name='3D View', space_type= 'VIEW_3D')
        kmi = km.keymap_items.new("wm.dialogop", type= 'R', value= 'PRESS', shift= True)
        addon_keymaps.append((km, kmi))
        

def unregister():
    for km,kmi in addon_keymaps:
        km.keymap_items.remove(kmi)
    addon_keymaps.clear()
    
    
    bpy.utils.unregister_class(WM_OT_dialogop)     
        
if __name__ == "__main__":
    register()
    
    #testcall
    #bpy.ops.wm.dialogop('INVOKE_DEFAULT')
    
# filename = "D:\\Projekty\\Blender\\scripts\\divide into chunks"
# exec(compile(open(filename).read(), filename, 'exec'))
# exec(compile(open("D:\\Projekty\\Blender\\scripts\\divide into chunks").read(), "D:\\Projekty\\Blender\\scripts\\divide into chunks", 'exec'))