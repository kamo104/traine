import bpy
from functools import cmp_to_key

scene = bpy.context.scene

eu_list = []

for o in scene.objects:
    if("eu" in o.name):
        try:
            #print(o.name)
            #print(o.location)
            eu_list.append(o)
        except:
            print("fail: ", o) 

def compare(o1,o2):
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


eu_list = sorted(eu_list, key=cmp_to_key(compare))
eu_list.reverse()
#print(eu_list)

i=0
for o in eu_list:
    #print(o.data.name)
    if len(str(i))==1:
        o.name = o.name[0:3] + "000" + str(i)
    elif len(str(i))==2:
        o.name = o.name[0:3] + "00" + str(i)
    elif len(str(i))==3:
        o.name = o.name[0:3] + "0" + str(i)
    elif len(str(i))==4:
        o.name = o.name[0:3] + "" + str(i)
    i+=1
    o.data.name = o.name
# filename = path to text file
# exec(compile(open(filename).read(), filename, 'exec')) 
# life saver