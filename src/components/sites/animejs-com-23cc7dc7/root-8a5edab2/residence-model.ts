import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export type Category = 'shell' | 'room' | 'repair' | 'bill' | 'roof' | 'base';
export interface ModelPart { object: THREE.Group; home: THREE.Vector3; spread: THREE.Vector3; spin: THREE.Vector3; category: Category; floor: number; }
export interface ResidenceModel { root: THREE.Group; parts: ModelPart[]; surfaceMaterials: THREE.MeshStandardMaterial[]; edgeMaterials: THREE.LineBasicMaterial[]; dispose: () => void; }
type ColorName = 'stone' | 'slab' | 'glass' | 'bronze' | 'wood' | 'sage' | 'linen' | 'warm' | 'copper' | 'violet' | 'leaf' | 'soil';
const palette: Record<ColorName, number> = { stone:0xc8c1ad, slab:0xe5dfce, glass:0x34474b, bronze:0x5f625b, wood:0x987958, sage:0x899780, linen:0xdac7ac, warm:0xf7c480, copper:0xcb855f, violet:0x9a8daf, leaf:0x718269, soil:0x51493e };

export function createResidenceModel(): ResidenceModel {
  const root = new THREE.Group(); root.name = 'Dorma continuous residence';
  const parts: ModelPart[] = []; const surfaceMaterials: THREE.MeshStandardMaterial[] = []; const edgeMaterials: THREE.LineBasicMaterial[] = [];
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  const allGeometries = new Set<THREE.BufferGeometry>();
  function material(name: ColorName, category: Category) {
    const key = `${name}-${category}`;
    const cached = materials.get(key); if (cached) return cached;
    const m = new THREE.MeshStandardMaterial({ color:palette[name], roughness:name === 'glass' ? .24 : .72, metalness:name === 'bronze' || name === 'copper' ? .38 : .08, emissive:name === 'warm' ? 0xffa455 : 0x000000, emissiveIntensity:name === 'warm' ? .25 : 0 });
    m.userData.baseColor = m.color.clone(); m.userData.baseEmissive = m.emissive.clone(); m.userData.category = category;
    materials.set(key,m); surfaceMaterials.push(m); return m;
  }
  function part(category: Category, floor: number, home: [number,number,number], spread: [number,number,number], spin: [number,number,number] = [0,0,0]) {
    const object = new THREE.Group(); object.position.set(...home); object.userData.category = category; object.name = `${category}-${parts.length}`; root.add(object);
    parts.push({object,home:object.position.clone(),spread:new THREE.Vector3(...spread),spin:new THREE.Vector3(...spin),category,floor});
    const batches = new Map<ColorName,THREE.BufferGeometry[]>();
    const add = (g:THREE.BufferGeometry, name:ColorName, x:number,y:number,z:number,rx=0,ry=0,rz=0) => { if(g.index){const indexed=g;g=g.toNonIndexed();indexed.dispose();} const q=new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)); g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),q,new THREE.Vector3(1,1,1))); const list=batches.get(name)||[];list.push(g);batches.set(name,list); };
    return {
      box:(w:number,h:number,d:number,x:number,y:number,z:number,name:ColorName='stone',rx=0,ry=0,rz=0)=>add(new THREE.BoxGeometry(w,h,d),name,x,y,z,rx,ry,rz),
      cylinder:(r:number,h:number,x:number,y:number,z:number,name:ColorName='bronze',rx=0,rz=0)=>add(new THREE.CylinderGeometry(r,r,h,12,1),name,x,y,z,rx,0,rz),
      sphere:(r:number,x:number,y:number,z:number,name:ColorName='leaf')=>add(new THREE.IcosahedronGeometry(r,1),name,x,y,z),
      finish:()=>{
        const edgeSources:THREE.BufferGeometry[]=[];
        batches.forEach((geometries,name)=>{const merged=mergeGeometries(geometries);if(!merged)throw new Error('Geometry merge failed');geometries.forEach(g=>g.dispose());allGeometries.add(merged);const mesh=new THREE.Mesh(merged,material(name,category));mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData.category=category;object.add(mesh);edgeSources.push(merged);});
        const entire=mergeGeometries(edgeSources);if(entire){const eg=new THREE.EdgesGeometry(entire,25);entire.dispose();allGeometries.add(eg);const em=new THREE.LineBasicMaterial({color:0x626457,transparent:true,opacity:.22});em.userData.category=category;em.userData.baseColor=em.color.clone();edgeMaterials.push(em);const lines=new THREE.LineSegments(eg,em);lines.userData.decoration=true;object.add(lines);}
      },
    };
  }
  const base=part('base',-1,[0,-4.28,0],[0,-1.1,0]);
  base.box(9,.3,7,0,0,0,'slab');base.box(8.7,.06,6.7,0,.18,0,'stone');
  for(let k=0;k<4;k++)base.box(2.6,.09,1.2-k*.2,0,-.1+k*.085,3.55-k*.12,'slab');
  for(const x of [-4.05,4.05]){const z=2.95;base.box(.62,.42,.62,x,.35,z,'stone');base.box(.52,.05,.52,x,.59,z,'soil');base.cylinder(.06,.88,x,.99,z,'wood');base.sphere(.39,x,1.52,z,'leaf');base.sphere(.3,x+.14,1.77,z,'sage');}
  for(const x of [-2.7,2.7]){base.box(1.3,.12,.35,x,.52,3,'wood');base.box(.08,.4,.3,x-.45,.27,3,'bronze');base.box(.08,.4,.3,x+.45,.27,3,'bronze');}
  base.finish();
  for(let f=0;f<5;f++){
    const y=-4+f*1.5;const spreadY=(f-2)*1.72;
    const balconyCenters=f===0?[-2.28,2.28]:[-2.28,0,2.28];
    const rooms=part('room',f,[0,y,0],[(f-2)*.62,spreadY,f%2===0?.5:-.5],[0,(f-2)*.055,0]);
    rooms.box(7,.18,4.8,0,.02,0,'slab');rooms.box(6.7,.05,4.55,0,.14,0,'wood');
    rooms.box(6.65,.04,.85,0,.18,-1.65,'stone');
    for(const x of [-1.12,1.12]) rooms.box(.09,.85,3.65,x,.59,.34,'slab');
    for(const x of [-2.25,0,2.25]){
      for(const side of [-1,1]){const bx=x+side*.58;rooms.box(.57,.16,1.2,bx,.38,-.15,'wood');rooms.box(.55,.13,1.13,bx,.52,-.15,'linen');rooms.box(.51,.05,.65,bx,.61,.02,'sage');rooms.box(.45,.12,.22,bx,.64,-.55,'slab');for(const z of [-.65,.35])rooms.box(.05,.24,.05,bx,.22,z,'bronze');}
      rooms.box(.72,.62,.38,x,.5,1.55,'wood');rooms.box(.79,.08,.45,x,.85,1.55,'slab');rooms.box(.26,.02,.21,x,.91,1.55,'glass');rooms.box(.3,.23,.03,x,1.02,1.68,'bronze');
      rooms.box(.33,.05,.32,x,.48,1.0,'sage');rooms.box(.33,.38,.06,x,.66,.83,'wood');for(const dx of [-.13,.13])rooms.box(.025,.31,.025,x+dx,.31,1,'bronze');
      rooms.box(.4,1.04,.48,x+.77,.68,-1.02,'wood');rooms.box(.015,.72,.01,x+.77,.74,-.771,'bronze');
      rooms.box(.6,1.08,.09,x,.72,-1.18,'wood');rooms.box(.48,.92,.025,x,.72,-1.125,'linen');rooms.box(.055,1.14,.12,x-.33,.72,-1.17,'slab');rooms.box(.055,1.14,.12,x+.33,.72,-1.17,'slab');rooms.box(.72,.055,.12,x,1.31,-1.17,'slab');rooms.sphere(.03,x+.19,.72,-1.08,'bronze');
      rooms.box(.24,.035,.05,x,1.32,-1.2,'warm');
    }
    rooms.finish();
    const facade=part('shell',f,[0,y,0],[(f-2)*.45,spreadY,4.7],[.015*(f-2),.075*(f-2),0]);
    facade.box(7,.16,.24,0,.06,2.32,'slab');
    for(const x of balconyCenters)facade.box(1.96,.16,.68,x,.08,2.62,'slab');
    for(const x of [-3.45,-1.13,1.13,3.45])facade.box(.17,1.4,.27,x,.83,2.28,'slab');
    facade.box(7,.21,.3,0,1.36,2.29,'slab');facade.box(7,.13,.28,0,.25,2.3,'stone');
    for(const x of [-2.28,0,2.28]){facade.box(1.93,.93,.06,x,.81,2.29,'glass');facade.box(.045,1.02,.1,x,.81,2.32,'bronze');facade.box(2.0,.04,.1,x,.83,2.32,'bronze');facade.box(1.85,.035,.04,x,1.29,2.36,'warm');}
    if(f===0){facade.box(1.62,1.26,.12,0,.67,2.43,'slab');facade.box(.68,1.12,.045,-.36,.66,2.51,'glass');facade.box(.68,1.12,.045,.36,.66,2.51,'glass');facade.box(.055,1.17,.055,0,.67,2.55,'bronze');facade.box(.055,.34,.055,-.08,.67,2.57,'bronze');facade.box(.055,.34,.055,.08,.67,2.57,'bronze');facade.box(2.15,.12,.82,0,1.39,2.68,'slab');facade.box(1.85,.05,.68,0,1.31,2.71,'warm');}
    for(const x of balconyCenters){
      facade.box(1.82,.035,.035,x,.93,2.96,'bronze');facade.box(1.82,.025,.025,x,.45,2.96,'bronze');
      for(let dx=-.88;dx<=.88;dx+=.22)facade.box(.022,.62,.025,x+dx,.64,2.96,'bronze');
      for(const edge of [-.96,.96]){
        facade.box(.025,.035,.66,x+edge,.93,2.64,'bronze');facade.box(.025,.025,.66,x+edge,.45,2.64,'bronze');
        for(const z of [2.36,2.56,2.76,2.96])facade.box(.025,.62,.025,x+edge,.64,z,'bronze');
      }
    }
    for(const x of [-2.65,2.65]){facade.box(.5,.2,.24,x,.28,2.76,'wood');for(let i=0;i<3;i++)facade.sphere(.12,x-.15+i*.15,.47,2.76,'leaf');}
    facade.finish();
    for(const side of [-1,1]){
      const shell=part('shell',f,[0,y,0],[side*4.35,spreadY,-1.1],[0,side*.14,0]);
      shell.box(.13,1.38,4.4,side*3.43,.81,0,'stone');shell.box(3.4,1.38,.15,side*1.7,.81,-2.24,'stone');
      shell.box(.015,.82,.98,side*3.505,.8,.25,'glass');for(const z of [-.26,.76])shell.box(.03,.92,.035,side*3.52,.8,z,'bronze');shell.box(.03,.035,1.02,side*3.52,.8,.25,'bronze');
      shell.box(1.9,.63,.02,side*1.7,.92,-2.33,'glass');for(const x of [-.6,0,.6])shell.box(.045,.7,.06,side*1.7+x,.92,-2.35,'bronze');
      shell.box(.16,.055,4.8,side*3.46,1.45,0,'slab');shell.finish();
    }
  }
  const stair=part('room',2,[0,-4,-1.78],[0,0,-5.35],[0,.16,0]);
  for(let f=0;f<5;f++){for(let i=0;i<9;i++)stair.box(.76,.095,.22,(f%2 ? .42 : -.42),f*1.5+.17*i,-.68+i*.15,'slab');stair.box(1.75,.11,.4,0,f*1.5+1.44,.7,'slab');stair.box(.025,1.25,.025,-.85,f*1.5+.7,.7,'bronze');stair.box(.025,1.25,.025,.85,f*1.5+.7,.7,'bronze');}stair.finish();
  const roof=part('roof',5,[0,3.6,0],[.55,5.65,-.65],[.04,-.12,0]);
  roof.box(7.15,.23,4.95,0,0,0,'slab');roof.box(6.85,.06,4.65,0,.15,0,'sage');
  for(const x of [-3.5,3.5])roof.box(.1,.48,4.95,x,.3,0,'slab');for(const z of [-2.43,2.43])roof.box(7.15,.48,.1,0,.3,z,'slab');
  roof.box(1.5,.8,1.2,-1.9,.55,-1.05,'stone');roof.box(1.65,.1,1.35,-1.9,1.0,-1.05,'slab');for(let i=0;i<7;i++)roof.box(1.2,.035,.045,-1.9,.25+i*.085,-.41,'bronze');
  for(const x of [1.25,2.35]){roof.cylinder(.38,.9,x,.64,-1.1,'slab');roof.cylinder(.4,.08,x,1.1,-1.1,'bronze');roof.cylinder(.1,.1,x,1.19,-1.1,'bronze');roof.box(.65,.15,.7,x,.2,-1.1,'stone');}
  for(const x of [-1.6,.1,1.8]){roof.box(1.32,.065,1.5,x,.55,1,'glass',-.19);roof.box(1.18,.045,.055,x,.51,1,'bronze',-.19);for(let i=0;i<5;i++)roof.box(.014,.075,1.5,x-.54+i*.27,.55,1,'slab',-.19);for(const dx of [-.48,.48])for(const z of [.55,1.42])roof.box(.07,.32,.07,x+dx,.28,z,'bronze');}
  roof.finish();
  const repair=part('repair',2,[3.62,0,0],[6.35,.25,-1.55],[0,.22,0]);
  for(const z of [1.62,1.9])repair.cylinder(.055,7.4,0,-.2,z,'copper');
  for(let f=0;f<5;f++){const y=-3.5+f*1.5;repair.cylinder(.04,.52,.22,y+.05,1.62,'copper',0,Math.PI/2);repair.box(.42,.48,.86,.28,y+.25,1.25,'slab');for(let i=0;i<7;i++)repair.box(.045,.025,.68,.5,y+.08+i*.05,1.25,'bronze');repair.cylinder(.14,.05,.51,y+.24,1.25,'bronze',0,Math.PI/2);repair.cylinder(.045,.05,.56,y+.24,1.25,'copper',0,Math.PI/2);repair.box(.05,.13,.38,.18,y,1.43,'copper');}repair.finish();
  const electric=part('bill',2,[-3.62,0,0],[-6.45,-.25,1.35],[0,-.22,0]);
  electric.box(.07,7.6,.09,0,-.1,1.62,'violet');electric.box(.07,7.6,.09,0,-.1,1.9,'bronze');
  for(let f=0;f<5;f++){const y=-3.45+f*1.5;electric.box(.42,.53,.7,-.28,y+.2,1.25,'bronze');electric.box(.04,.19,.4,-.51,y+.25,1.25,'glass');electric.box(.045,.04,.1,-.54,y+.25,1.25,'warm');for(const z of [1.08,1.25,1.42])electric.box(.06,.05,.05,-.53,y+.02,z,'violet');electric.box(.09,.06,.5,-.05,y+.05,1.48,'violet');}electric.finish();
  root.updateMatrixWorld(true);
  return {root,parts,surfaceMaterials,edgeMaterials,dispose:()=>{allGeometries.forEach(g=>g.dispose());surfaceMaterials.forEach(m=>m.dispose());edgeMaterials.forEach(m=>m.dispose());}};
}
