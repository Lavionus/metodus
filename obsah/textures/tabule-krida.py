# Spuštění: python3 tabule-krida.py && cwebp -q 82 tabule-krida.png -o tabule-krida.webp
# Procedurální textura bez cizích podkladů (numpy + Pillow), vygenerováno 22. 9. 2026.
# Bezešvá textura školní tabule pro motiv „noční škola“ (512×512, šedá kolem 50 %,
# použije se v režimu overlay): oblouky setřené houbou, zbytky křídy a jemné zrno.
import numpy as np
from PIL import Image
N = 512
ky = np.fft.fftfreq(N)[:, None] * N
kx = np.fft.fftfreq(N)[None, :] * N
def sum_noise(sx, sy, seed):
    """Periodický šum (FFT) – anizotropní: sx, sy = typická frekvence v osách."""
    r = np.random.default_rng(seed)
    spec = (r.normal(size=(N, N)) + 1j * r.normal(size=(N, N)))
    env = np.exp(-(kx / sx) ** 2 - (ky / sy) ** 2)
    env[0, 0] = 0
    n = np.real(np.fft.ifft2(spec * env))
    return (n - n.mean()) / n.std()
y = np.arange(N)[:, None] / N
x = np.arange(N)[None, :] / N
# setřené šmouhy: velké měkké skvrny, jen světlejší (křída se rozmaže, nikdy neztmavne)
smouhy = np.clip(sum_noise(2.2, 2.2, 21), 0, None)
# tahy houbou: oblouky – vodorovné pruhy zvlněné pomalým šumem (celočíselné frekvence = bezešvé)
vlna = sum_noise(1.5, 2, 22) * 0.8
tahy = np.sin(2 * np.pi * (6 * y) + vlna * 2.5) * np.clip(sum_noise(2, 3, 23) + .3, 0, None)
tahy = np.clip(tahy, 0, None) ** 1.2
# jemné rýhy po houbě: dlouhé vodorovné, úzké svisle
ryhy = sum_noise(6, 120, 24)
# zrno břidlice a drobné zbytky křídy
zrno = sum_noise(160, 160, 25)
prach = sum_noise(90, 90, 26)
prach = np.where(prach > 2.4, (prach - 2.4) * 1.2, 0)
v = 0.5 + 0.04 * smouhy + 0.028 * tahy + 0.012 * ryhy + 0.02 * zrno + 0.05 * prach
v = np.clip(v, 0, 1)
Image.fromarray((v * 255).astype(np.uint8), 'L').save('tabule-krida.png')
print(round(v.mean(), 3), round(v.min(), 3), round(v.max(), 3))
