import bpy,os,json
from mathutils import Matrix,Vector
out=r'D:\Sandbox\TEST\agv-showroom\public\models\agv.glb'
scene=bpy.context.scene
bpy.ops.object.select_all(action='DESELECT')
temp=bpy.data.collections.new('WEB_EXPORT_TEMP');scene.collection.children.link(temp)
deps=bpy.context.evaluated_depsgraph_get()
copies=[]
try:
    for ob in bpy.data.collections['AGV_Reference_Model'].objects:
        if ob.type not in {'MESH','CURVE'}:continue
        mesh=bpy.data.meshes.new_from_object(ob.evaluated_get(deps),depsgraph=deps)
        dup=bpy.data.objects.new(ob.name,mesh);temp.objects.link(dup);dup.matrix_world=ob.matrix_world.copy()
        dup['part']='wheel' if ob.name.startswith(('Caster tire','Caster hub','Axle bolt')) else 'body'
        if ob.name.startswith('Continuous red side status strip'):dup['part']='light'
        copies.append(dup)
    for ix,(x,y) in enumerate([(-.3,-.365),(-.3,.365),(.3,-.365),(.3,.365)]):
        center=Vector((x,y,.052))
        pivot=bpy.data.objects.new('WheelPivot_'+str(ix),None);temp.objects.link(pivot);pivot.location=center;pivot['part']='wheelPivot'
        for o in copies:
            if o['part']=='wheel' and abs(o.location.x-x)<.05 and abs(o.location.y-y)<.04:
                world=o.matrix_world.copy()
                o.parent=pivot
                o.matrix_parent_inverse=Matrix.Identity(4)
                o.matrix_basis=Matrix.Translation(-center)@world
    bpy.context.view_layer.update()
    for o in temp.objects:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=out,export_format='GLB',use_selection=True,export_extras=True,export_yup=True)
    print('EXPORTED',os.path.getsize(out))
finally:
    for o in list(temp.objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.data.collections.remove(temp)

