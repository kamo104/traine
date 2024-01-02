import bpy
import os
from functools import cmp_to_key
import bmesh
import datetime
start = datetime.datetime.now()
scene = bpy.context.scene
eu_list = []


for o in scene.objects:
    if("eu." in o.name):
        eu_list.append(o)



def compareObjs(o1,o2):
    if o1.location.y-50>o2.location.y:
        return(1)
    elif o1.location.y<o2.location.y-50:
        return(-1)
    else:
        if o1.location.x+50<o2.location.x:
            return(1)
        elif o1.location.x>o2.location.x+50:
            return(-1)
        else:
            return(0)


eu_list = sorted(eu_list, key=cmp_to_key(compareObjs))
eu_list.reverse()


def compareVerts(v1,v2):
    if v1[1]-0.15>v2[1]:
        return(1)
    elif v1[1]<v2[1]-0.15:
        return(-1)
    else:
        if v1[0]+0.15<v2[0]:
            return(1)
        elif v1[0]>v2[0]+0.15:
            return(-1)
        else:
            return(0)

vertex_list = []
obs = []


do_times = 91
name = ""
with open("C:\\Users\\Kamo\\Desktop\\eu_conf.txt", "r+") as f:
    do = f.readline()
    if len(str(int(do)+1)) == 2:
        name = "eu.0" + str(int(do)+1)
    elif len(str(int(do)+1)) == 3:
        name = "eu." + str(int(do)+1)
    f.seek(0)
    f.write(str(int(do)+do_times))
    f.truncate()
    
x=int(do)

for j in range(do_times):
    new_collection = bpy.data.collections.new("eu_idk")
    bpy.ops.object.select_all(action='DESELECT')
    for obj in eu_list:
        if int(obj.name[3:]) <= x+j or int(obj.name[3:]) >= x+2+j:
            continue
        
        obj.select_set(True)
        bpy.ops.object.editmode_toggle()
        
        mesh = bpy.data.objects[obj.name].data
        bm = bmesh.from_edit_mesh(mesh)
        obMat = obj.matrix_world
        
       
        i=0
        for f in bm.faces:
            for v in f.verts:
                loc = obMat @ v.co
                vertex_list.append(loc)
            
            
            vertex_list = sorted(vertex_list, key=cmp_to_key(compareVerts))
            v1 = vertex_list[0]
            v2 = vertex_list[1]
            v3 = vertex_list[2]
            v4 = vertex_list[3]
            vertices = [(v1[0], v1[1], v1[2]),(v2[0],v2[1],v2[2]),(v3[0],v3[1],v3[2]),(v4[0],v4[1],v4[2])]
            edges = [(0,1),(1,3),(3,2),(2,0)]
            faces = [(0,1,3,2)]
            new_mesh = bpy.data.meshes.new("physicsPlane"+"_"+obj.name+"_"+str(i))
            new_mesh.from_pydata(vertices, edges, faces)
            new_mesh.update()
            new_object = bpy.data.objects.new("physicsPlane"+"_"+obj.name+"_"+str(i), new_mesh)

            obs.append(new_object)
            vertex_list.clear()
            i+=1
            
        bpy.ops.object.editmode_toggle()
        bpy.ops.object.select_all(action='DESELECT')
        

    for ob in obs:
        new_collection.objects.link(ob)
    bpy.context.scene.collection.children.link(new_collection)
    obs.clear()

    #export part
    #
    #
    #

    physics_list = []

    for o in new_collection.objects:
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

    directory = "D:\\Projekty\\html\\traine\\public\\assets\\map\\eu_sliced\\physics\\"



    for key, val in chunk_dict.items():
        bpy.ops.object.select_all(action='DESELECT')
        if len(val)==0:
            continue
        
        
        for ob in val:
            # Select each object
            # Make sure that we only export meshes
            if ob.type == 'MESH':
                ob.select_set(True)
                # Export the currently selected object to its own file based on its name
                
            # Deselect the object and move on to another if any more are left

        bpy.ops.export_scene.obj(filepath=os.path.join(directory, key + "_physics" + '.obj'),use_selection=True,)
        bpy.ops.object.delete(use_global=False, confirm=False)
        bpy.ops.object.select_all(action='DESELECT')
        #delete collection
        bpy.data.collections.remove(new_collection)
        #bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
        #bpy.ops.wm.open_mainfile(filepath=bpy.data.filepath)
        print("Time it took: ")
        print(datetime.datetime.now()-start)


bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
bpy.ops.wm.open_mainfile(filepath=bpy.data.filepath)

# filename = "D:\\Projekty\\Blender\\scripts\\facesToPlanes"
# exec(compile(open("D:\\Projekty\\Blender\\scripts\\facesToPlanes").read(), "D:\\Projekty\\Blender\\scripts\\facesToPlanes", 'exec')) 
# filename = path to text file
# exec(compile(open(filename).read(), filename, 'exec')) 
# life saver