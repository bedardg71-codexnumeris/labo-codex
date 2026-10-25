/**
 * #1150, lot 4 (24 oct. 2026) — lire l'atelier du critère algorithmique dans le HTML rendu.
 * Les cartes du gabarit (`data-pli="<id>:<section>"`) sont devenues les ÉTAPES de l'atelier
 * (`<section class="atelier-algo-etape" data-etape="…">`), dans l'atelier du critère (`data-critere-id`).
 * Correspondance : formule → `note` ; projection (sans le décompte) → `paliers` ; Bilan (avec le
 * décompte) → `eleve` ; les noms → `compte` ; les sous-critères et « Aucune annotation » → `codes`.
 */

/** Le HTML de l'atelier d'un critère : de sa racine à la racine suivante (ou la fin). */
export function atelierDe(html, critereId) {
    const i = html.indexOf('data-critere-id="' + critereId + '"');
    if (i < 0) return '';
    const suivant = html.indexOf('class="gabarit-algo"', i + 10);
    return html.slice(i, suivant < 0 ? undefined : suivant);
}

/** Le HTML d'une étape d'un critère : de sa section à la suivante, ou à l'aperçu. '' si absente. */
export function etapeDe(html, critereId, etape) {
    const a = atelierDe(html, critereId);
    const i = a.indexOf('data-etape="' + etape + '"');
    if (i < 0) return '';
    const fins = [a.indexOf('<section class="atelier-algo-etape', i + 10), a.indexOf('<aside class="apercu-algo"', i + 10)].filter((x) => x >= 0);
    return a.slice(i, fins.length ? Math.min(...fins) : undefined);
}

/** L'étape est-elle ouverte au rendu ? (`data-ouverte` sur la section, son corps sans `hidden`.) */
export function etapeOuverte(html, critereId, etape) {
    const e = etapeDe(html, critereId, etape);
    return /^data-etape="[a-z]+" data-ouverte>/.test(e);
}
