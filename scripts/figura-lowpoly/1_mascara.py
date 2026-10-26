import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
W=sys.argv[1]
im=np.asarray(Image.open(f'{W}/front.png').convert('RGB')).astype(int)
H,Wd,_=im.shape
lum=(im*[0.3,0.59,0.11]).sum(2); sat=im.max(2)-im.min(2)
dark=(lum<145)&(sat<34)
skin=(im[:,:,0]>190)&(im[:,:,0]-im[:,:,2]>35)&(im[:,:,0]-im[:,:,2]<115)&(im[:,:,1]>140)
white=(lum>225)&(sat<30)  # socks/cuffs/undershirt
yy,xx=np.mgrid[0:H,0:Wd]
region=(xx>=62)&(xx<=286)&(yy>=48)&(yy<=752)
region&=~((yy>458)&(xx>250))
region&=~((yy>395)&(yy<=458)&(xx>279))
skin&=(yy<470)
m=(dark|skin)&region
m=nd.binary_closing(m,iterations=3)
m=nd.binary_fill_holes(m)
m=nd.binary_opening(m,iterations=2)
lab,n=nd.label(m); sizes=nd.sum(m,lab,range(1,n+1)); m=lab==(1+np.argmax(sizes))
# add white bits (socks, cuffs, undershirt band) touching the body
wb=white&region&nd.binary_dilation(m,iterations=6)&(yy>360)&((yy<392)|(yy>722))
wl,wn=nd.label(wb)
for i in range(1,wn+1):
    comp=wl==i
    if comp.sum()<1500: m|=comp
m=nd.binary_fill_holes(nd.binary_closing(m,iterations=2))
np.save(f'{W}/mask.npy',m)
vis=(im*0.35).astype('uint8'); vis[m]=im[m]
Image.fromarray(vis).save(f'{W}/maskvis.png')
print(m.sum())
