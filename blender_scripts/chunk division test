import bpy, bmesh
from bpy import context as C

# filename = "D:\\Projekty\\Blender\\scripts\\chunk division test"
# exec(compile(open(filename).read(), filename, 'exec'))


for _ in range(4):
    bpy.ops.object.select_all(action='SELECT')
    selected_obj_list = [obj for obj in C.selected_objects]
    cut_one_over = 2
    tolerance = 0.0001
    top=False
    left=False
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
            #bpy.ops.object.mode_set(mode='OBJECT')
            break
        

        for v in bm.verts:
            if v.is_boundary:
                continue
            else:
                starting_vert = v
                break
        #starting_vert = bm.verts[0]
        j=0
        #while(starting_vert.is_boundary):
        #    starting_vert = bm.verts[j]
        #    j+=1
        top_right = starting_vert
        down_left = starting_vert
        
        width=0
        height=0
        
        tmp_vert = starting_vert
        
        j=len(bm.verts)
        #walk right then top from start
        while(j):
            #print(tmp_vert.co)
            #j-=1
            if(len(tmp_vert.link_edges)==2):
                top_right = tmp_vert
                break
            elif(len(tmp_vert.link_edges)==3):
                #go up
                height+=1
                for edge in tmp_vert.link_edges:
                    for v in edge.verts:
                        if(v.co.y>tmp_vert.co.y+tolerance and v is not tmp_vert):
                            tmp_vert = v
                            #break
                continue
            elif(len(tmp_vert.link_edges)==4):
                #go right
                width+=1
                for edge in tmp_vert.link_edges:
                    #print(tmp_vert.co, "siblings", edge.verts[0].co,edge.verts[1].co)
                    for v in edge.verts:
                        if(v.co.x>tmp_vert.co.x+tolerance and v is not tmp_vert):
                            tmp_vert = v
                            #break

                continue
        
        #walk left then down from start
        j=len(bm.verts)
        tmp_vert = starting_vert
        while(j):
            #j-=1
            if(len(tmp_vert.link_edges)==2):
                down_left = tmp_vert
                break
            elif(len(tmp_vert.link_edges)==3):
                #go up
                height+=1
                for edge in tmp_vert.link_edges:
                    for v in edge.verts:
                        if(v.co.y+tolerance<tmp_vert.co.y and v is not tmp_vert):
                            tmp_vert = v
                            #break
                    
                continue
            elif(len(tmp_vert.link_edges)==4):
                #go right
                width+=1
                for edge in tmp_vert.link_edges:
                    for v in edge.verts:
                        if(v.co.x+tolerance<tmp_vert.co.x and v is not tmp_vert):
                            tmp_vert = v
                            #break

                continue
        
        edges = []
        #print(down_left.co,top_right.co,width,height)

        
        #travel top_right to top_middle and gather the edges going down
        if(vertical):
            if(left):
                rng = (cut_one_over-1)*width//cut_one_over
            else:
                rng = width//cut_one_over
            top_middle = top_right
            for t in range(rng): #(cut_one_over-1)*
                for edge in top_middle.link_edges:
                    for v in edge.verts:
                        if(top_middle.co.x>v.co.x+tolerance and v is not top_middle):
                            top_middle = v
                            break
            
            for edge in top_middle.link_edges:
                for v in edge.verts:
                    if(top_middle.co.y>v.co.y+tolerance and v is not top_middle):
                        top_middle = v
                        edges.append(edge)
                        break
                    
            while(not top_middle.is_boundary):
                for edge in top_middle.link_edges:
                    for v in edge.verts:
                        if(top_middle.co.y>v.co.y+tolerance and v is not top_middle):
                            top_middle = v
                            edges.append(edge)
                            break
        
        if(horizontal):
        
            middle_left = down_left
            if(top):
                rng = (cut_one_over-1)*height//cut_one_over
            else:
                rng = height//cut_one_over
            for t in range(rng): #(cut_one_over-1)*
                for edge in middle_left.link_edges:
                    for v in edge.verts:
                        if(middle_left.co.y+tolerance<v.co.y and v is not middle_left):
                            middle_left = v
                            break
            
            #edges = []
            for edge in middle_left.link_edges:
                for v in edge.verts:
                    if(middle_left.co.x+tolerance<v.co.x and v is not middle_left):
                        middle_left = v
                        edges.append(edge)
                        break
            while(len(middle_left.link_edges)==4): #is_boundary was
                for edge in middle_left.link_edges:
                    for v in edge.verts:
                        if(middle_left.co.x+tolerance<v.co.x and v is not middle_left):
                            middle_left = v
                            edges.append(edge)
                            break
        
        bmesh.ops.split_edges(bm, edges=edges)
        
        
        bmesh.update_edit_mesh(C.object.data)

        bpy.ops.mesh.separate(type='LOOSE')
        

        bpy.ops.object.mode_set(mode='OBJECT')
        
        
        #bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
        
        
        

    
    

# filename = "D:\\Projekty\\Blender\\scripts\\chunk division test"
# exec(compile(open(filename).read(), filename, 'exec'))
# exec(compile(open("D:\\Projekty\\Blender\\scripts\\divide into chunks").read(), "D:\\Projekty\\Blender\\scripts\\divide into chunks", 'exec'))
#Saved text "D:\Projekty\Blender\scripts\chunk division test"
