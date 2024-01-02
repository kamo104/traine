import bpy
from functools import cmp_to_key

scene = bpy.context.scene

object_list = []
search_phrase = "island"

for o in scene.objects:
    if(search_phrase in o.name):
        try:
            #print(o.name)
            #print(o.location)
            object_list.append(o)
        except:
            print("fail: ", o) 

max_object_distance=10

def compare(o1,o2):
    if o1.location.y-max_object_distance>o2.location.y:
        return(1)
    elif o1.location.y<o2.location.y-max_object_distance:
        return(-1)
    else:
        if o1.location.x+max_object_distance<o2.location.x:
            return(1)
        elif o1.location.x>o2.location.x+max_object_distance:
            return(-1)
        else:
            return(0)


object_list = sorted(object_list, key=cmp_to_key(compare))
object_list.reverse()

i=0
list_length = len(object_list)
max_zeros = len(str(list_length))
search_phrase_length = len(str(search_phrase))

for o in object_list:
    
    o.name = search_phrase + "_" + str(i)#.zfill(max_zeros)

    i+=1
    o.data.name = o.name
    
    
# filename = "D:\\Projekty\\html\\traine all\\blender_scripts\\chunk sort.py" # path to the file to execute
# exec(compile(open(filename).read(), filename, 'exec')) 
# life saver