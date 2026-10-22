# Connection map (game axes: X right, Y up, Z forward; all joints >= .005 m):
# Bull body/shoulder overlap Y .20; shoulder/head back overlap Z .20;
# head/muzzle overlap Z .18; head/eyes, brows, ears, horns overlap >= .02.
# Body/leg shoulders overlap Y .12; thigh/shin/hoof overlap Y .08.
# Body/tail root overlap Z .08; body/blanket/saddle overlap Y .05.
# Rider pelvis/torso overlap Y .10; pelvis/thigh/knee/shin/boot overlap .06.
# Torso/shoulder/upper-arm/elbow/forearm/glove overlap .04.
# Torso/neck/head/hair/hat overlap Y .03; face details overlap Z .01.
# Clothing overlays (vest, belt, chaps, scarf) overlap underlying mesh .01.
# The horn/tail/arms use explicit bmesh tubes, no rotated cylinder connectors.
import bpy, bmesh, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True) # Dedicated background process only.
scene=bpy.context.scene
parts=[]; joints=[]; audit=[]
def vec(p): return Vector((p[0],-p[2],p[1]))
def mat(name,hex,rough=.65,metal=0):
 m=bpy.data.materials.new(name)
 srgb=[int(hex[i:i+2],16)/255 for i in (0,2,4)]
 linear=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in srgb]
 m.diffuse_color=(*linear,1);m.use_nodes=True
 n=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');n.inputs['Base Color'].default_value=m.diffuse_color;n.inputs['Roughness'].default_value=rough;n.inputs['Metallic'].default_value=metal
 return m
M={k:mat(k,v) for k,v in {'hide':'743B24','shoulder':'502B20','muzzle':'BE7950','horn':'F3DBA2','tip':'B47A3B','hoof':'282B2A','eye':'FFF4D2','black':'181E20','shirt':'DB8739','vest':'194D52','denim':'285C74','leather':'663C27','gold':'E6AE51','skin':'D69B6D','hair':'512C20','red':'BB3D2D','hat':'E7BA73','hatband':'68402D','blanket':'8D3026'}.items()}
M['gold']=mat('Brass','D9A650',.3,.65)
def select(o):
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o

def bounds(o):
 bpy.context.view_layer.update();v=[o.matrix_world@p.co for p in o.data.vertices];b=[(min(p[i] for p in v),max(p[i] for p in v)) for i in range(3)];audit.append({'part':o.name,'bounds':b});return b

def overlap(a,b,axis=2,minimum=.005):
 aa=bounds(a);bb=bounds(b);d=min(aa[axis][1],bb[axis][1])-max(aa[axis][0],bb[axis][0]);joints.append({'a':a.name,'b':b.name,'axis':axis,'overlap':round(d,4),'ok':d>=minimum});assert d>=minimum,(a.name,b.name,d)

def group(name,p=(0,0,0),parent=None):
 o=bpy.data.objects.new(name,None);scene.collection.objects.link(o);o.location=vec(p);bpy.context.view_layer.update()
 if parent: w=o.matrix_world.copy();o.parent=parent;o.matrix_world=w
 return o

def finish(o,name,material,parent):
 o.name=name;o.data.materials.append(M[material]);select(o);bpy.ops.object.transform_apply(location=False,rotation=True,scale=True);bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY',center='MEDIAN')
 for p in o.data.polygons:p.use_smooth=True
 if parent:w=o.matrix_world.copy();o.parent=parent;o.matrix_world=w
 parts.append(o);bounds(o);return o

def ell(name,p,s,material,parent,segments=20,rings=12):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=segments,ring_count=rings,radius=1,location=vec(p));o=bpy.context.object;o.scale=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(scale=True)
 return finish(o,name,material,parent)

def box(name,p,s,material,parent,bevel=.05):
 bpy.ops.mesh.primitive_cube_add(size=2,location=vec(p));o=bpy.context.object;o.scale=(s[0],s[2],s[1]);bpy.ops.object.transform_apply(scale=True)
 mod=o.modifiers.new('Soft leather edges','BEVEL');mod.width=bevel;mod.segments=3;select(o);bpy.ops.object.modifier_apply(modifier=mod.name)
 return finish(o,name,material,parent)

def tube(name,points,radii,material,parent,n=12):
 ps=[vec(p) for p in points];bm=bmesh.new();rr=[]
 for i,p in enumerate(ps):
  tangent=(ps[min(i+1,len(ps)-1)]-ps[max(0,i-1)]).normalized();axis=Vector((0,0,1)) if abs(tangent.z)<.9 else Vector((1,0,0));u=tangent.cross(axis).normalized();v=tangent.cross(u).normalized()
  rr.append([bm.verts.new(p+radii[i]*(math.cos(j*2*math.pi/n)*u+math.sin(j*2*math.pi/n)*v)) for j in range(n)])
 for a,b in zip(rr,rr[1:]):
  for j in range(n):bm.faces.new((a[j],a[(j+1)%n],b[(j+1)%n],b[j]))
 bm.faces.new(tuple(reversed(rr[0])));bm.faces.new(tuple(rr[-1]));bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));mesh=bpy.data.meshes.new(name);bm.to_mesh(mesh);bm.free();o=bpy.data.objects.new(name,mesh);scene.collection.objects.link(o);return finish(o,name,material,parent)

def link(name,a,b,r,material,parent):
 # Connector endpoints derived from measured neighboring mesh bounds.
 aa=bounds(a);bb=bounds(b);ac=[sum(v)/2 for v in aa];bc=[sum(v)/2 for v in bb]
 return tube(name,[(ac[0],ac[2],-ac[1]),(bc[0],bc[2],-bc[1])],[r,r*.85],material,parent)

bull=group('BullRoot');body=ell('Bull_Barrel',(0,1.38,-.1),(.77,.66,1.05),'hide',bull,28,18)
shoulder=ell('Powerful_Shoulders',(0,1.62,.51),(.73,.64,.75),'shoulder',bull,24,16);overlap(body,shoulder)
head=group('Head',(0,1.65,1.05),bull)
skull=ell('Bull_Forehead',(0,1.68,1.08),(.62,.57,.56),'hide',head,28,18);overlap(shoulder,skull,1)
muzzle=ell('Broad_Muzzle',(0,1.37,1.56),(.55,.30,.35),'muzzle',head,28,16);overlap(skull,muzzle,1)
chin=ell('Lower_Lip',(0,1.21,1.60),(.36,.10,.25),'shoulder',head);overlap(muzzle,chin)
for s in (-1,1):
 eye=ell('Bull_Eye_'+str(s),(s*.37,1.84,1.49),(.15,.115,.07),'eye',head);overlap(skull,eye,1)
 ell('Bull_Pupil_'+str(s),(s*.365,1.84,1.55),(.057,.075,.028),'black',head)
 ell('Bull_Eye_Glint_'+str(s),(s*.365-.014,1.87,1.575),(.017,.021,.008),'eye',head,12,8)
 brow=tube('Expressive_Brow_'+str(s),[(s*.20,1.94,1.5),(s*.36,2.0,1.51),(s*.53,1.99,1.44)],[.075,.085,.04],'shoulder',head);overlap(skull,brow)
 ell('Nostril_'+str(s),(s*.25,1.43,1.86),(.082,.049,.025),'shoulder',head)
 ear=ell('Ear_'+str(s),(s*.68,1.88,1.00),(.27,.12,.18),'hide',head);overlap(skull,ear,0)
 ell('Ear_Inner_'+str(s),(s*.73,1.91,1.08),(.15,.055,.10),'muzzle',head)
 horn=tube('Swept_Horn_'+str(s),[(s*.48,2.02,1.04),(s*.70,2.10,1.03),(s*.95,2.25,1.01),(s*1.08,2.49,.98),(s*1.04,2.66,1.01)],[.145,.13,.095,.055,.008],'horn',head,16);overlap(skull,horn,0)
for x in (-.52,.52):
 for z in (-.69,.62):
  tag=('L' if x<0 else 'R')+('F' if z>0 else 'B');leg=group('Leg_'+tag,(x,1.25,z),bull)
  thigh=ell('Thigh_'+tag,(x,1.06,z),(.235,.44,.27),'hide',leg);overlap(body,thigh)
  shin=ell('Shin_'+tag,(x,.60,z+.035),(.145,.34,.17),'hide',leg);overlap(thigh,shin)
  hoof=box('Hoof_'+tag,(x,.20,z+.09),(.20,.18,.25),'hoof',leg,.085);overlap(shin,hoof)
  box('Hoof_Cleft_'+tag,(x,.19,z+.33),(.015,.10,.012),'black',leg,.008)
tail=group('Tail',(0,1.55,-1.02),bull)
t= tube('Tail_Curve',[(0,1.56,-.99),(.24,1.60,-1.29),(.46,1.83,-1.5),(.55,2.04,-1.5)],[.075,.06,.047,.03],'hide',tail);overlap(body,t,1)
ell('Tail_Tuft',(.55,2.06,-1.5),(.12,.18,.12),'shoulder',tail)
blanket=box('Saddle_Blanket',(0,1.99,-.18),(.68,.08,.67),'blanket',bull,.10);overlap(body,blanket)
saddle=ell('Leather_Saddle',(0,2.10,-.18),(.48,.16,.47),'leather',bull);overlap(blanket,saddle)
for z in (-.62,.21):
 ell('Saddle_Rim_'+str(z),(0,2.17,z),(.44,.15,.09),'leather',bull)
for s in (-1,1):
 # Decorative saddle rivets sit embedded in blanket edge.
 for z in (-.62,-.32,-.02,.28):ell('Brass_Rivet', (s*.665,2.0,z),(.018,.028,.027),'gold',bull,12,8)
rope=tube('Bull_Rope',[(.64,1.94,.35),(.79,1.60,.35),(.56,1.06,.35),(0,.91,.35),(-.56,1.06,.35),(-.79,1.60,.35),(-.64,1.94,.35),(-.1,2.13,.35)],[.033]*8,'horn',bull)

rider=group('CowboyRoot');pelvis=ell('Denim_Seat',(0,.08,0),(.40,.25,.30),'denim',rider)
for s in (-1,1):
 hip=ell('Hip', (s*.30,.03,.015),(.21,.21,.23),'denim',rider);overlap(pelvis,hip,0)
 knee=ell('Knee',(s*.69,-.35,.20),(.17,.20,.18),'denim',rider)
 thigh=link('Denim_Thigh',hip,knee,.19,'denim',rider);overlap(hip,thigh);overlap(knee,thigh)
 ankle=ell('Ankle',(s*.73,-.79,.28),(.125,.13,.13),'leather',rider)
 shin=link('Denim_Shin',knee,ankle,.14,'denim',rider);overlap(knee,shin);overlap(ankle,shin)
 tube('Leather_Chap',[(s*.74,-.24,.20),(s*.77,-.49,.24),(s*.78,-.70,.27)],[.11,.10,.075],'leather',rider)
 boot=box('Cowboy_Boot',(s*.73,-.91,.40),(.16,.15,.29),'leather',rider,.085);overlap(ankle,boot)
 box('Boot_Sole',(s*.73,-1.035,.42),(.17,.036,.30),'hoof',rider,.025)
 box('Boot_Heel',(s*.73,-1.08,.25),(.14,.045,.11),'hoof',rider,.02)
 ell('Boot_Spur',(s*.74,-.91,.10),(.07,.07,.045),'gold',rider,12,8)
torso=group('Torso',(0,.20,0),rider)
shirt=ell('Shirt_Torso',(0,.62,0),(.37,.48,.25),'shirt',torso,24,16);overlap(pelvis,shirt)
for s in (-1,1):
 ell('Vest_Panel',(s*.21,.65,.17),(.155,.37,.13),'vest',torso)
 box('Vest_Pocket',(s*.22,.52,.285),(.095,.065,.02),'gold',torso,.02)
 for y in (.43,.57,.71):ell('Shirt_Button',(s*.045,y,.252),(.014,.014,.009),'horn',torso,10,6)
belt=box('Wide_Belt',(0,.25,0),(.36,.065,.255),'leather',torso,.04);overlap(shirt,belt)
box('Brass_Buckle',(0,.25,.27),(.115,.085,.035),'gold',torso,.035)
box('Buckle_Inset',(0,.25,.304),(.067,.04,.008),'leather',torso,.015)
neck=ell('Neck',(0,1.06,0),(.15,.16,.15),'skin',torso);overlap(shirt,neck)
face=ell('Cowboy_Face',(0,1.30,.03),(.255,.29,.245),'skin',torso,24,16);overlap(neck,face)
ell('Hair_Back',(0,1.39,-.11),(.26,.22,.19),'hair',torso)
for s in (-1,1):
 ell('Human_Ear',(s*.25,1.28,.025),(.065,.105,.06),'skin',torso)
 ell('Human_Eye',(s*.092,1.34,.25),(.037,.043,.02),'black',torso)
 tube('Cowboy_Brow',[(s*.04,1.40,.253),(s*.10,1.415,.255),(s*.15,1.40,.23)],[.022,.025,.014],'hair',torso,n=8)
 ell('Mustache',(s*.075,1.20,.271),(.09,.045,.035),'hair',torso)
ell('Nose',(0,1.25,.275),(.065,.085,.07),'skin',torso)
ell('Chin',(0,1.10,.14),(.13,.075,.10),'hair',torso)
# Swept wide brim, explicitly shaped double surface with curled sides.
verts=[];faces=[];N=48
for h in (0,.045):
 for r in (.0,.45,1):
  for j in range(N):
   a=2*math.pi*j/N;x=.62*r*math.cos(a);z=.47*r*math.sin(a);y=1.55+h+.13*(abs(math.cos(a))*r)**3-.035*r
   verts.append(vec((x,y,z)))
for layer in range(2):
 for ring in range(2):
  for j in range(N):
   a=layer*3*N+ring*N+j;b=layer*3*N+ring*N+(j+1)%N;faces.append((a,b,b+N,a+N))
for j in range(N):faces.append((2*N+j,2*N+(j+1)%N,5*N+(j+1)%N,5*N+j))
me=bpy.data.meshes.new('Curved hat');me.from_pydata(verts,[],faces);me.update();ob=bpy.data.objects.new('Curved_Hat_Brim',me);scene.collection.objects.link(ob);hat=finish(ob,'Curved_Hat_Brim','hat',torso);overlap(face,hat)
crown=box('Hat_Crown',(0,1.73,-.015),(.30,.19,.27),'hat',torso,.12);overlap(hat,crown)
box('Hat_Band',(0,1.61,-.015),(.305,.047,.275),'hatband',torso,.065)
box('Hat_Band_Buckle',(.12,1.61,.26),(.045,.035,.015),'gold',torso,.015)
scarf=group('Scarf',(-.14,1.03,-.10),torso)
ell('Bandana_Collar',(0,1.015,.025),(.19,.07,.18),'red',torso)
tube('Bandana_Front',[(0,1.02,.22),(0,.91,.26),(0,.80,.25)],[.12,.075,.005],'red',torso,n=3)
tube('Bandana_Tail',[(-.13,1.03,-.10),(-.38,1.06,-.22),(-.59,1.02,-.28)],[.08,.10,.005],'red',scarf,n=3)
# Holding arm linked between actual shoulder, elbow, glove bounds.
should=ell('Holding_Shoulder',(-.33,.89,0),(.16,.18,.18),'shirt',torso);overlap(shirt,should,0)
elbow=ell('Holding_Elbow',(-.49,.50,.32),(.115,.13,.13),'shirt',torso)
upper=link('Holding_Sleeve',should,elbow,.14,'shirt',torso);overlap(should,upper);overlap(elbow,upper)
hand=ell('Rope_Glove',(-.12,.18,.51),(.12,.115,.12),'hat',torso)
fore=link('Holding_Forearm',elbow,hand,.10,'skin',torso);overlap(elbow,fore);overlap(hand,fore)
arm=group('Arm',(.30,.88,0),torso)
sh=ell('Raised_Shoulder',(.33,.90,0),(.15,.17,.17),'shirt',arm);overlap(shirt,sh,0)
el=ell('Raised_Elbow',(.65,1.18,-.02),(.12,.13,.13),'shirt',arm)
a=link('Raised_Sleeve',sh,el,.13,'shirt',arm);overlap(sh,a);overlap(el,a)
ha=ell('Raised_Glove',(.71,1.65,.03),(.12,.15,.105),'hat',arm)
f=link('Raised_Forearm',el,ha,.09,'skin',arm);overlap(el,f);overlap(ha,f)
ell('Glove_Thumb',(.61,1.61,.08),(.065,.095,.06),'hat',arm)
# Audit transforms for every created mesh; animated pivot empties keep their origins.
assert all(all(abs(x)<1e-5 for x in o.rotation_euler) and all(abs(x-1)<1e-5 for x in o.scale) for o in parts)
(ROOT/'models'/'geometry-audit.json').write_text(json.dumps({'parts':len(parts),'joints':joints,'bounds':audit,'transforms_clean':True},indent=2))
for root,name in ((bull,'bull'),(rider,'cowboy')):
 bpy.ops.object.select_all(action='DESELECT');root.select_set(True)
 for child in root.children_recursive:child.select_set(True)
 bpy.context.view_layer.objects.active=root
 bpy.ops.export_scene.gltf(filepath=str(ROOT/'assets'/'models'/f'{name}.glb'),export_format='GLB',use_selection=True,export_yup=True,export_animations=False)
# Present assembled models in the editable source; GLB cowboy stays seated-origin local.
rider.location=vec((0,2.13,-.18))
world=bpy.data.worlds.new('Teal Studio');world.use_nodes=True;world.node_tree.nodes.get('Background').inputs[0].default_value=(.12,.21,.22,1);world.node_tree.nodes.get('Background').inputs[1].default_value=.5;scene.world=world
bpy.ops.mesh.primitive_plane_add(size=200);ground=bpy.context.object;ground.name='Preview_Ground';ground.data.materials.append(mat('Arena sand','C49156'))
def area(name,p,power,size,color):
 data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color;o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=vec(p);o.rotation_euler=(vec((0,2,0))-o.location).to_track_quat('-Z','Y').to_euler()
area('Warm key',(-4,7,6),900,5,(1,.83,.63));area('Cool fill',(5,4,2),600,4,(.66,.85,1));area('Rim',(0,6,-4),1100,3,(1,.70,.36))
data=bpy.data.cameras.new('Portrait Camera');cam=bpy.data.objects.new('Portrait Camera',data);scene.collection.objects.link(cam);cam.location=vec((5,4.2,9));cam.rotation_euler=(vec((0,1.9,0))-cam.location).to_track_quat('-Z','Y').to_euler();data.type='ORTHO';data.ortho_scale=5.6;scene.camera=cam
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.render.resolution_x=720;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.filepath=str(ROOT/'docs'/'blender-characters.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'models'/'rodeo_characters.blend'));bpy.ops.render.render(write_still=True)
print('RODEO_EXPORT_COMPLETE',len(parts),'parts',len(joints),'verified joints')
