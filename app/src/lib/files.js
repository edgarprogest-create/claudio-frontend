export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB, same as the old app
const MAX_IMAGE_SIDE = 1568; // recommended max image edge for the AI model

const readAsDataUrl = file => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(r.result);
  r.onerror = () => reject(r.error);
  r.readAsDataURL(file);
});

/** Downscale big photos to keep requests and localStorage small. */
async function shrinkImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(img.width, img.height));
    if (scale === 1 && file.size < 1.5 * 1024 * 1024) return null; // already small
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** → { name, type, dataUrl } */
export async function readAttachment(file) {
  const isImage = /^image\/(jpeg|png|gif|webp)$/.test(file.type) || /^image\/hei[cf]$/.test(file.type);
  if (isImage) {
    const small = await shrinkImage(file);
    if (small) return { name: file.name, type: 'image/jpeg', dataUrl: small };
  }
  return { name: file.name, type: file.type || 'application/octet-stream', dataUrl: await readAsDataUrl(file) };
}

/** Message content blocks for the chat API (same format the old app sent). */
export function toContentBlocks(text, attachments) {
  const blocks = [];
  if (text) blocks.push({ type: 'text', text });
  for (const a of attachments) {
    const data = a.dataUrl.split(',')[1];
    if (a.type.startsWith('image/')) blocks.push({ type: 'image', source: { type: 'base64', media_type: a.type, data } });
    else blocks.push({ type: 'document', name: a.name, media_type: a.type, data });
  }
  return blocks.length === 1 && blocks[0].type === 'text' ? text : blocks;
}
