import subprocess, numpy as np, soundfile as sf, sys
SR=44100
total=float(sys.argv[1])
subprocess.run(['ffmpeg','-v','error','-y','-i',sys.argv[2] if len(sys.argv)>2 else '/home/claude/GamnaMarks/samplex-music.mp3','-ar',str(SR),'-ac','2','/tmp/m.wav'],check=True)
m,_=sf.read('/tmp/m.wav',dtype='float32'); xf=3*SR; N=int(total*SR)
mus=m.copy(); r=np.linspace(0,1,xf,dtype=np.float32)[:,None]
while len(mus)<N: mus=np.concatenate([mus[:-xf],mus[-xf:]*(1-r)+m[:xf]*r,m[xf:]])
mus=mus[:N]; mus=mus/np.abs(mus).max()*0.6
fi=SR; mus[:fi]*=np.linspace(0,1,fi)[:,None]; fo=3*SR; mus[-fo:]*=np.linspace(1,0,fo)[:,None]
sf.write('music_only.wav',mus,SR)
