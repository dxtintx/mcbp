export function argbToHex(argb: number): string {
  const unsigned = argb >>> 0;
  const r = (unsigned >> 16) & 0xff;
  const g = (unsigned >> 8) & 0xff;
  const b = unsigned & 0xff;
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function argbToRgbaStr(argb: number, overrideAlpha?: number): string {
  const unsigned = argb >>> 0;
  const a = overrideAlpha !== undefined ? overrideAlpha : ((unsigned >> 24) & 0xff) / 255;
  const r = (unsigned >> 16) & 0xff;
  const g = (unsigned >> 8) & 0xff;
  const b = unsigned & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`;
}

export function hexToArgb(hex: string, alpha: number = 255): number {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  if (cleanHex.length !== 6) {
    return -16777216;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  const uint32 = ((alpha & 0xff) << 24) | ((r & 0xff) << 16) | ((g & 0xff) << 8) | (b & 0xff);
  return uint32 | 0;
}
