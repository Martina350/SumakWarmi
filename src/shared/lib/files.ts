export async function readDemoFile(file: File, max = 750000): Promise<string> {
  if (file.size > max || file.size === 0 || !['image/png', 'image/jpeg', 'image/webp', 'application/pdf'].includes(file.type)) throw new Error(`Usa JPG, PNG, WebP o PDF ficticio de hasta ${Math.round(max / 1000)} KB.`);
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('No se pudo leer el archivo.')); reader.readAsDataURL(file); });
}
