/**
 * jeton-anticache.js — « ce fichier porte-t-il un jeton `?v=` au moins aussi
 * récent que X ? », posé une seule fois pour toutes les sentinelles.
 *
 * POURQUOI CE HELPER EXISTE (10 septembre 2026).
 * Sept sentinelles posaient la même question par une expression régulière qui
 * ÉNUMÉRAIT les jours : `?v=20260905[c-z]|?v=2026090[6-9]|?v=20261`. La
 * dernière alternative visait « la suite » — octobre à décembre — et laissait
 * un trou béant : **du 10 au 30 septembre, aucune branche ne correspond**.
 * Les sept ont rougi ensemble à la release du 10 septembre, sur un jeton
 * `20260910a` parfaitement valide. Aucune ne testait ce qu'elle croyait tester ;
 * elles mesuraient le calendrier.
 *
 * Un jeton anti-cache est une DATE (`AAAAMMJJ` + une lettre de rang dans la
 * journée). Deux dates se comparent — elles ne s'énumèrent pas.
 */

/**
 * Lit le jeton `?v=` d'un fichier dans index.html et le compare à un plancher.
 *
 * @param {string} html - le contenu d'index.html
 * @param {string} chemin - ex. 'js/grilles.js' ou 'styles.css'
 * @param {string} plancher - jeton minimal attendu, ex. '20260905c'
 * @returns {{ok: boolean, jeton: string|null, message: string}}
 */
export function jetonAuMoins(html, chemin, plancher) {
    const echappe = chemin.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
    const trouve = html.match(new RegExp('["\'(]' + echappe + '\\?v=([0-9a-z]+)'));
    if (!trouve) {
        return { ok: false, jeton: null, message: chemin + ' : aucun jeton ?v= dans index.html' };
    }
    const jeton = trouve[1];
    // La date d'abord (8 chiffres), le rang dans la journée ensuite. Comparer
    // les chaînes entières marcherait ici, mais dirait faux le jour où un rang
    // passerait à deux lettres : on sépare les deux, comme le format le fait.
    const dec = (j) => [parseInt(j.slice(0, 8), 10) || 0, j.slice(8)];
    const [dateJ, rangJ] = dec(jeton);
    const [dateP, rangP] = dec(plancher);
    const ok = dateJ > dateP || (dateJ === dateP && rangJ >= rangP);
    return {
        ok,
        jeton,
        message: chemin + ' porte ?v=' + jeton + ', attendu au moins ' + plancher
            + ' — le fichier a changé sans que son jeton suive, ou le plancher de cette sentinelle est à relever.'
    };
}
