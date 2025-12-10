do not import MaxPlus, it is not a real module available in the python api
do not reset the scene
do not manipulate the viewport
DO NOT add lights to the scene
DO NOT add cameras to the scene
DO NOT add materials to objects in the scene

## 3ds max coords
x+ right
y+ forward
Z+ up

rotating x+ is clockwise (following axis left to right)
rotating y+ is clockwise (following axis back to front)
rotating z+ is clockwise (following axis bottom up)

## Creating a Scene Object
```python
my_teapot = pymxs.runtime.teapot()
#This creates a new teapot object at position [0,0,0], with a radius of 25 and 4 segments. To change these parameters at creation time, we can specify them in the constructor:
teapot_position=pymxs.runtime.point3(100,20,10)
my_teapot = pymxs.runtime.teapot(radius=50, pos=teapot_position, segments=2)
# manipulate object properties
my_teapot.spout = False
my_teapot.handle = False
```

## Modifying the Object (adding a modifier)
```python
my_modifier = pymxs.runtime.taper()
my_modifier.amount = 2.0
my_modifier.curve = 1.5
pymxs.runtime.addmodifier(my_teapot, my_modifier)
```

The noise modifier is ```pymxs.runtime.noisemodifier()``` and not ```pymxs.runtime.noise()```


## Transforming: Scale, Rotation and Position
from pymxs import runtime as rt

# define function for coercing a rotation to a quat
rt.execute("fn r2q r = (return r as quat)")

def DumpXForms (obj):
    # output node transform properties
    print "{}:\t{}".format("transform", obj.transform)
    print "{}:\t{}".format("position ", obj.pos)
    print "{}:\t{}".format("rotation ", obj.rotation)
    # output node's pivot point location
    print "{}:\t{}".format("pivot ", obj.pivot)
    # output object offsets
    print "{}:\t{}".format("objectoffsetpos", obj.objectoffsetpos)
    print "{}:\t{}".format("objectoffsetrot", obj.objectoffsetrot)
    print "{}:\t{}".format("objectoffsetscale", obj.objectoffsetscale)
    # output object transform
    print "{}:\t{}".format("objecttransform ", obj.objecttransform)
    # output vertex position in local and world coordinates
    # we do this because 'in coordsys' is not available in pymxs
    rt.setRefCoordSys(rt.Name('local'))
    print "{}:\t{}".format("vert 1 (local) ", (rt.getvert( obj, 1)))
    rt.setRefCoordSys(rt.Name('world'))
    print "{}:\t{}".format("vert 1 (world1) ", (rt.getvert( obj, 1)))
    # calculate and output vertex position in world coordinates
    v_pos = rt.getvert( obj, 1) * obj.objecttransform
    print"{}:\t{}".format("vert 1 (world2) ", v_pos)



# define function for rotating only the pivot point
def RotatePivotOnly( obj, rotation):
    rotValInv=rt.inverse (rt.r2q(rotation))
    with pymxs.animate(False):
        obj.rotation*=rotValInv
        obj.objectoffsetpos*=rotValInv
        obj.objectoffsetrot*=rotValInv


b=rt.box(pos=rt.Point3(75,75,0)) # create a 25x25x25 box, vertex 1 at [62.5,62.5,0] (world)
rt.convertToMesh (b) # convert box to mesh so we can access the vertex location
DumpXForms(b) # print transforms
b.pivot= rt.Point3(50,50,0)# move pivot only to [50,50,0]
DumpXForms (b) # print transforms
rotation = rt.EulerAngles( 0, 0, 35)
RotatePivotOnly (b, rotation) # rotate pivot only 35 degrees about local Z
DumpXForms (b)# print transforms