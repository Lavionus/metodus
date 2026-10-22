# Spuštění: python3 knihovna-drevo.py && cwebp -q 82 knihovna-drevo.png -o knihovna-drevo.webp
# Procedurální textura bez cizích podkladů (numpy + Pillow), vygenerováno 22. 9. 2026.
# Bezešvá textura ořechového dřeva pro motiv „stará knihovna“ (512×512, šedá kolem 50 %).
import numpy as np
from PIL import Image
N = 512
rng = np.random.default_rng(1926)
ky = np.fft.fftfreq(N)[:, None] * N   # cykly na dlaždici
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
# letokruhy: vodorovná vlákna, zvlněná pomalým šumem (celočíselné frekvence = bezešvé)
warp = sum_noise(1.2, 3.5, 11) * 1.0 + sum_noise(3, 12, 12) * 0.35
rings = np.sin(2 * np.pi * (9 * y) + warp * 3.2)
# ostřejší tmavé linky, široké světlé pásy (jarní/letní dřevo)
rings = np.where(rings > 0, np.abs(rings) ** 0.5, -np.abs(rings) ** 3)
# jemná vlákna: dlouhá v ose x, úzká v ose y
fib = sum_noise(3, 90, 13) * 0.8 + sum_noise(8, 220, 14) * 0.6
# póry: drobné tmavší tečky protažené do délky
pores = sum_noise(40, 160, 15)
pores = np.where(pores < -2.1, (pores + 2.1) * 1.4, 0)
# pomalé skvrny, aby plocha nebyla mechanicky pravidelná
blot = sum_noise(2, 2, 16)
v = 0.5 + 0.05 * rings + 0.04 * fib + 0.05 * pores + 0.025 * blot
v = np.clip(v, 0, 1)
img = Image.fromarray((v * 255).astype(np.uint8), 'L')
img.save('knihovna-drevo.png')
print(v.mean(), v.min(), v.max())
# kontrola bezešvosti: 2×2 dlaždice s barvou panelu (overlay)
base = np.array([0x2c, 0x21, 0x18]) / 255
t = np.tile(v, (2, 2))[..., None]
ov = np.where(base < .5, 2 * base * t, 1 - 2 * (1 - base) * (1 - t))
# Image.fromarray((np.clip(ov, 0, 1) * 255).astype(np.uint8)).save('nahled-2x2.png')
