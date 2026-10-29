"""Editable Blender POKAL glass and rounded ceramic espresso cup."""
import bpy, math, json, pathlib
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
root=pathlib.Path(__file__).resolve().parent.parent
N=96
def lathe(name,profile,faceted=False):
 vertices=[]
 for r,y in profile:
  for i in range(N):
   a=2*math.pi*i/N
   # Twelve broad, flat facets in the thick lower glass.
   facet=math.cos(math.pi/12)/math.cos((a+math.pi/12)%(math.pi/6)-math.pi/12)
   weight=max(0,1-y/.65) if faceted else 0
   rr=r*(1-weight+weight*facet)
   vertices.append((rr*math.cos(a),y,rr*math.sin(a)))
 faces=[]
 for j in range(len(profile)-1):
  for i in range(N):faces.append(((j+1)*N+i,(j+1)*N+(i+1)%N,j*N+(i+1)%N,j*N+i))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
 obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
 for p in mesh.polygons:p.use_smooth=True
 return obj
obj=lathe('Clear POKAL tumbler',[(0,0),(.285,0),(.302,.015),(.312,.06),(.32,.16),(.332,.36),(.35,.62),(.38,.94),(.413,1.25),(.432,1.395),(.432,1.414),(.425,1.42),(.414,1.414),(.412,1.395),(.393,1.25),(.36,.94),(.33,.62),(.312,.36),(.298,.17),(.28,.14),(0,.14)],True)
mat=bpy.data.materials.new('Clear glass');mat.diffuse_color=(1,1,1,.2);mat.use_nodes=True
bsdf=mat.node_tree.nodes.get('Principled BSDF');bsdf.inputs['Roughness'].default_value=.035;bsdf.inputs['Transmission Weight'].default_value=1;bsdf.inputs['IOR'].default_value=1.5;obj.data.materials.append(mat)
cup=lathe('Rounded ivory espresso cup',[(0,0),(.075,0),(.112,.012),(.145,.036),(.174,.075),(.196,.125),(.211,.19),(.218,.27),(.218,.345),(.214,.36),(.204,.365),(.194,.356),(.194,.28),(.187,.20),(.172,.14),(.145,.10),(.10,.077),(0,.072)])
ceramic=bpy.data.materials.new('Glazed ivory ceramic');ceramic.diffuse_color=(.96,.92,.82,1);ceramic.use_nodes=True;ceramic.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.12;cup.data.materials.append(ceramic)
# Handle lies in the vertical XY plane; joined into the exported cup.
bpy.ops.mesh.primitive_torus_add(major_segments=48,minor_segments=12,location=(.25,.215,0),major_radius=.105,minor_radius=.027)
handle=bpy.context.object;handle.name='Ceramic handle';handle.data.materials.append(ceramic)
for p in handle.data.polygons:p.use_smooth=True
bpy.ops.object.select_all(action='DESELECT');cup.select_set(True);handle.select_set(True);bpy.context.view_layer.objects.active=cup;bpy.ops.object.join();bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
(root/'assets').mkdir(exist_ok=True);bpy.ops.wm.save_as_mainfile(filepath=str(root/'assets'/'cafe-tumbler.blend'))
def export_mesh(item,prefix):
 eval_obj=item.evaluated_get(bpy.context.evaluated_depsgraph_get());m=eval_obj.to_mesh();m.calc_loop_triangles()
 positions=[];normals=[];indices=[];lookup={}
 for tri in m.loop_triangles:
  for li in tri.loops:
   loop=m.loops[li];v=m.vertices[loop.vertex_index].co;n=loop.normal;key=(loop.vertex_index,tuple(round(float(c),4) for c in n))
   if key not in lookup:
    lookup[key]=len(positions)//3;positions.extend(round(float(c),5) for c in v);normals.extend(round(float(c),4) for c in n)
   indices.append(lookup[key])
 eval_obj.to_mesh_clear()
 return ''.join('export const '+prefix+name+'='+json.dumps(value,separators=(',',':'))+';\n' for name,value in [('Positions',positions),('Normals',normals),('Indices',indices)])
(root/'dist'/'glass-model.js').write_text(export_mesh(obj,'cafeGlass')+export_mesh(cup,'espressoCup'))
