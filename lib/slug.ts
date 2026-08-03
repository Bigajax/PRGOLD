/**
 * Slug para URL.
 *
 * O slug é gerado a partir do nome e nunca digitado à mão pelo lojista —
 * digitar slug é a forma mais rápida de criar duas URLs para a mesma peça.
 */
export function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Código sugerido no padrão PRG-XXX-000.
 *
 * Sugestão, não imposição: se a PR Gold já usa uma numeração própria, ela
 * digita a dela.
 */
export function codigoSugerido(nome: string): string {
  const letras = slugify(nome).replace(/-/g, "").slice(0, 3).toUpperCase() || "PRG";
  const numero = Math.floor(100 + Math.random() * 900);
  return `PRG-${letras}-${numero}`;
}
