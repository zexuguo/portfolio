import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.spatial import Delaunay
from skimage import measure, feature, draw
W=sys.argv[1]
rng=np.random.default_rng(11)

def load(n):
    return np.asarray(Image.open(f'{W}/{n}').convert('RGB')).astype(float)/255

# ---------- body mask (full-body frame) ----------
im=load('front.png'); H,Wd,_=im.shape
m=np.load(f'{W}/mask.npy')
yy,xx=np.mgrid[0:H,0:Wd]
m&=~((yy>560)&(xx<68))
m&=~((yy>640)&(xx>240-(yy-640)*0.3))
m&=~((yy>380)&(yy<465)&(xx>276))
m&=~((yy>330)&(yy<=380)&(xx>273))
m=nd.binary_opening(m,iterations=2)
legs=(yy>470)
m=np.where(legs,nd.binary_opening(m,iterations=4),m)
# separate the legs
gap=(yy>578)&(np.abs(xx-(157-(yy-578)*0.055))<3.5)
m&=~gap
m[:160,:]=False   # head comes from the close-up frame
lab,n=nd.label(m); sizes=nd.sum(m,lab,range(1,n+1)); m=np.isin(lab,1+np.nonzero(sizes>200)[0])

# ---------- head mask (close-up frame) ----------
fc=load('face.png'); FH,FW,_=fc.shape
fy,fx=np.mgrid[0:FH,0:FW]
flum=(fc*[0.3,0.59,0.11]).sum(2)*255; fsat=(fc.max(2)-fc.min(2))*255
fdark=(flum<120)
fskin=(fc[:,:,0]*255>170)&((fc[:,:,0]-fc[:,:,2])*255>25)&(fc[:,:,2]<fc[:,:,0])
ell=((fx-210)/190)**2+((fy-400)/262)**2<1
hm=(fdark|fskin)&ell&(fy<645)&(fy>130)&~((fy>300)&(fx>362))&~((flum>200)&~(((fx-215)/135)**2+((fy-470)/190)**2<1))
# jaw: below the mouth keep only the face oval
jaw=((fx-215)/125)**2+((fy-520)/130)**2<1
hm&=~((fy>560)&~jaw)
hm=nd.binary_closing(hm,iterations=4); hm=nd.binary_fill_holes(hm); hm=nd.binary_opening(hm,iterations=4)
lab,n=nd.label(hm); sizes=nd.sum(hm,lab,range(1,n+1)); hm=lab==(1+np.argmax(sizes))
S=0.224
def f2b(x,y): return 176+(x-210)*S, 52+(y-145)*S

def triangulate(mask, img, dens, contour_k=0.7):
    Hh,Ww=mask.shape
    pts=[]
    for cnt in measure.find_contours(mask.astype(float),0.5):
        if len(cnt)<10: continue
        cnt=measure.approximate_polygon(cnt,tolerance=1.0/ S if img is fc else 1.2)
        for (y0,x0),(y1,x1) in zip(cnt[:-1],cnt[1:]):
            L=np.hypot(x1-x0,y1-y0); step=max(2,dens(x0,y0)*contour_k); k=max(1,int(L/step))
            for t in np.linspace(0,1,k,endpoint=False): pts.append((x0+(x1-x0)*t,y0+(y1-y0)*t))
    taken=np.zeros_like(mask,bool)
    def free(x,y,r):
        a,b=max(0,int(x-r)),min(Ww,int(x+r)+1); c_,d=max(0,int(y-r)),min(Hh,int(y+r)+1)
        return not taken[c_:d,a:b].any()
    for x,y in pts: taken[int(np.clip(y,0,Hh-1)),int(np.clip(x,0,Ww-1))]=True
    gray=img.mean(2)
    e=feature.canny(gray,sigma=1.6 if img is fc else 1.4)&nd.binary_erosion(mask,iterations=3)
    ey,ex=np.nonzero(e)
    for i in rng.permutation(len(ex)):
        x,y=ex[i],ey[i]; r=dens(x,y)*0.7
        if free(x,y,r): pts.append((x,y)); taken[y,x]=True
    my,mx=np.nonzero(nd.binary_erosion(mask,iterations=2))
    for i in rng.permutation(len(mx)):
        x,y=mx[i],my[i]; r=dens(x,y)
        if free(x,y,r): pts.append((x,y)); taken[y,x]=True
    pts=np.array(pts); tri=Delaunay(pts); out=[]
    for s in tri.simplices:
        P=pts[s]; cx,cy=P.mean(0)
        if not mask[int(cy),int(cx)]: continue
        rr,cc=draw.polygon(P[:,1],P[:,0],shape=mask.shape)
        if len(rr)==0: rr,cc=np.array([int(cy)]),np.array([int(cx)])
        out.append((P,img[rr,cc].mean(0),cx,cy))
    return out

# ---------- colour treatment ----------
def grade(c, gamma, satk):
    c=c**gamma; g=c.mean(-1,keepdims=True); return np.clip(g+(c-g)*satk,0,1)

def body_dens(x,y):
    if y>378 and y<465 and (x<116 or x>236): return 5      # hands
    if y<205: return 7                                     # neck/collar
    return 14
def face_dens(x,y):
    # close-up px; ~1 body px = 4.5 close-up px
    if 100<=x<=330 and 380<=y<=470: return 9   # eyes
    if 160<=x<=280 and 470<=y<=600: return 13  # nose, mouth
    if 80<=x<=350 and 330<=y<=640: return 18   # rest of face
    return 30                                  # hair

body=triangulate(m, grade(im,1.7,1.0), body_dens)
head=triangulate(hm, grade(fc,1.25,0.85), face_dens)

# region palettes: pull body colours toward clean region tones
def region(cx,cy,col):
    lum=col.mean()
    if cy>722: return 'shoe'
    if col[0]-col[2]>0.12 and lum>0.35: return 'skin'
    return 'top' if cy<378 else 'pants'
BASE={'top':np.array([.16,.17,.19]),'pants':np.array([.13,.14,.15]),'shoe':np.array([.90,.90,.88])}
tris=[]
for P,col,cx,cy in body:
    r=region(cx,cy,col)
    if r in BASE:
        shade=np.clip((col.mean()-0.17)*1.2,-.08,.10)
        col=np.clip(BASE[r]+shade,0,1)
    tris.append({'p':[(176+0*0+(x-176), y) for x,y in P],'c':col,'cx':cx,'cy':cy,'src':'body'})
FACE_OVAL=lambda x,y: ((x-215)/132)**2+((y-480)/180)**2<1
skin_cols=[col for P,col,cx,cy in head if FACE_OVAL(cx,cy) and 380<cy<600]
SKIN=np.median(np.array(skin_cols),0); HAIR=np.array([.22,.18,.15])
for t in tris:
    if t['src']=='body' and region(t['cx'],t['cy'],t['c'])=='skin':
        t['c']=np.clip(SKIN*(0.92 if t['cy']<200 else 1.0)+np.clip((t['c'].mean()-.6)*.3,-.06,.06),0,1)
for P,col,cx,cy in head:
    if not FACE_OVAL(cx,cy):
        col=np.clip(HAIR+np.clip((col.mean()-.3)*.35,-.06,.12),0,1)
    elif col.mean()>SKIN.mean()+0.06:
        col=SKIN+(col-SKIN)*0.3   # tame the window glare on one cheek
    Q=[f2b(x,y) for x,y in P]; bx,by=f2b(cx,cy)
    tris.append({'p':Q,'c':col,'cx':bx,'cy':by,'src':'head','fx':cx,'fy':cy})
# photo -> viewBox
s=680/690
def vb(x,y): return round(200+(x-172)*s,1), round(50+(y-52)*s,1)
out=[]
for t in tris:
    zone='figura-base'; cx,cy=t['cx'],t['cy']
    if t['src']=='head':
        zone='ojos' if (95<=t['fx']<=335 and 385<=t['fy']<=465) else 'cerebro'
    elif 380<cy<470 and (cx<118 or cx>234): zone='manos'
    elif cy>=378: zone='piernas'
    elif 105<cx<240 and cy>200: zone='corazon'
    out.append({'z':zone,'c':'#%02x%02x%02x'%tuple((np.clip(t['c'],0,1)*255).round().astype(int)),'p':[vb(x,y) for x,y in t['p']]})
json.dump(out,open(f'{W}/tris.json','w'))
from collections import Counter; print(len(out),Counter(o['z'] for o in out))
