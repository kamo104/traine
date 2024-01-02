import bpy, bmesh
from bpy import context as C

class SelectedIntoFour(bpy.types.Operator):
    
    bl_label = "SelectedIntoFour"
    bl_idname = "wm.dialogop"
    
    def execute(self, context):
        selected_obj_list = [obj for obj in C.selected_objects]
        cut_one_over = 2
        vertical = True
        horizontal = True

        for obj in selected_obj_list:
            bpy.ops.object.select_all(action='DESELECT')
            obj.select_set(True)
            
            C.view_layer.objects.active = obj
            
            bpy.ops.object.mode_set(mode='EDIT') # bpy.ops.object

            bm = bmesh.from_edit_mesh(C.object.data)

            
            bm.verts.ensure_lookup_table()

            

            if(len(bm.verts)<9):
                bm.free()
                bpy.ops.object.mode_set(mode='OBJECT')
                continue
            

            
            starting_vert = bm.verts[0]
            j=0
            while(starting_vert.is_boundary):
                starting_vert = bm.verts[j]
                j+=1
            top_right = starting_vert
            down_left = starting_vert
            
            width=0
            height=0
            
            tmp_vert = starting_vert
            
            j=len(bm.verts)
            #walk right then top from start
            while(j):
                print(tmp_vert.co)
                j-=1
                if(len(tmp_vert.link_edges)==2):
                    top_right = tmp_vert
                    break
                elif(len(tmp_vert.link_edges)==3):
                    #go up
                    height+=1
                    for edge in tmp_vert.link_edges:
                        for v in edge.verts:
                            if(v.co.y>tmp_vert.co.y):
                                tmp_vert = v
                                break
                    continue
                elif(len(tmp_vert.link_edges)==4):
                    #go right
                    width+=1
                    for edge in tmp_vert.link_edges:
                        for v in edge.verts:
                            if(v.co.x>tmp_vert.co.x):
                                tmp_vert = v
                                break

                    continue
            
            #walk left then down from start
            j=len(bm.verts)
            tmp_vert = starting_vert
            while(j):
                j-=1
                if(len(tmp_vert.link_edges)==2):
                    down_left = tmp_vert
                    break
                elif(len(tmp_vert.link_edges)==3):
                    #go up
                    height+=1
                    for edge in tmp_vert.link_edges:
                        for v in edge.verts:
                            if(v.co.y<tmp_vert.co.y):
                                tmp_vert = v
                                break
                        
                    continue
                elif(len(tmp_vert.link_edges)==4):
                    #go right
                    width+=1
                    for edge in tmp_vert.link_edges:
                        for v in edge.verts:
                            if(v.co.x<tmp_vert.co.x):
                                tmp_vert = v
                                break

                    continue
            
            edges = []
            print(down_left.co,top_right.co,width,height)

            
            #travel top_right to top_middle and gather the edges going down
            if(vertical):
                top_middle = top_right
                for t in range((cut_one_over-1)*width//cut_one_over): #(cut_one_over-1)*
                    for edge in top_middle.link_edges:
                        for v in edge.verts:
                            if(top_middle.co.x>v.co.x):
                                top_middle = v
                                break
                
                for edge in top_middle.link_edges:
                    for v in edge.verts:
                        if(top_middle.co.y>v.co.y):
                            top_middle = v
                            edges.append(edge)
                            break
                        
                while(not top_middle.is_boundary):
                    for edge in top_middle.link_edges:
                        for v in edge.verts:
                            if(top_middle.co.y>v.co.y):
                                top_middle = v
                                edges.append(edge)
                                break
            
            if(horizontal):
            
                middle_left = down_left
                for t in range(height//cut_one_over): #(cut_one_over-1)*
                    for edge in middle_left.link_edges:
                        for v in edge.verts:
                            if(middle_left.co.y<v.co.y):
                                middle_left = v
                                break
                
                #edges = []
                for edge in middle_left.link_edges:
                    for v in edge.verts:
                        if(middle_left.co.x<v.co.x):
                            middle_left = v
                            edges.append(edge)
                            break
                while(len(middle_left.link_edges)==4): #is_boundary was
                    for edge in middle_left.link_edges:
                        for v in edge.verts:
                            if(middle_left.co.x<v.co.x):
                                middle_left = v
                                edges.append(edge)
                                break
            
            bmesh.ops.split_edges(bm, edges=edges)
            
            
            bmesh.update_edit_mesh(C.object.data)

            bpy.ops.mesh.separate(type='LOOSE')
            

            bpy.ops.object.mode_set(mode='OBJECT')
            
            
            #bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
            
            
            
            

            
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