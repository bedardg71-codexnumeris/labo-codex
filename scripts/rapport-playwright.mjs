/**
 * Lecture d'un rapport JSON de Playwright, et jugement contre la baseline.
 *
 * Fonctions PURES, sans effet de bord : deux juges les partagent.
 *   · scripts/verifier-playwright.mjs — le verdict du Mac, qui lance la suite ;
 *   · scripts/juger-rapport-playwright.mjs — le verdict de la CI, qui juge le
 *     rapport FUSIONNÉ des morceaux (shards) de GitHub (16 oct. 2026).
 * Deux copies de ces règles finiraient par diverger : le Mac et GitHub
 * appelleraient « nouvelle » une rougeur différente.
 */

/**
 * Identité d'une spec, STABLE dans le temps.
 *
 * Volontairement « fichier › titre », sans le numéro de ligne : une ligne bouge
 * dès qu'on édite le fichier au-dessus, et la baseline se mettrait alors à
 * dénoncer des échecs « nouveaux » qui sont les mêmes. Le titre, lui, ne bouge
 * que si l'on change ce que la spec vérifie — auquel cas la revoir est justement
 * ce qu'on veut.
 */
export function identite(fichier, titre) {
    return `${fichier.replace(/\\/g, '/')} › ${titre}`;
}

/** Parcourt l'arbre de suites du rapport JSON et rend les specs en échec. */
export function echecsDuRapport(rapport) {
    const trouves = [];
    const descendre = (suites) => {
        for (const suite of suites ?? []) {
            for (const spec of suite.specs ?? []) {
                if (spec.ok === false) trouves.push(identite(spec.file ?? suite.file ?? '?', spec.title));
            }
            descendre(suite.suites);
        }
    };
    descendre(rapport.suites);
    return trouves.sort();
}

/**
 * Specs VERTES AU SECOND ESSAI (#534, 26 août 2026).
 *
 * `retries: 1` empêche qu'un dépassement de délai isolé refuse un push légitime.
 * Mais une reprise silencieuse est un tapis : elle transforme l'instabilité en
 * vert, et personne ne voit plus rien. Ces specs ne bloquent pas — elles se
 * DISENT. C'est la même règle que le « verdict impossible » : ce qu'on n'a pas
 * su juger ne doit jamais ressembler à ce qui va bien.
 */
export function flakyDuRapport(rapport) {
    const trouves = [];
    const descendre = (suites) => {
        for (const suite of suites ?? []) {
            for (const spec of suite.specs ?? []) {
                const instable = (spec.tests ?? []).some((t) => t.status === 'flaky');
                if (instable) trouves.push(identite(spec.file ?? suite.file ?? '?', spec.title));
            }
            descendre(suite.suites);
        }
    };
    descendre(rapport.suites);
    return trouves.sort();
}

/**
 * Compare les échecs à la dette connue. Seule une rougeur absente de la
 * baseline est `nouvelle` ; une spec de la baseline redevenue verte est
 * `reparee` — elle ne bloque rien, mais elle se dit, sinon la baseline se met
 * à couvrir du vert.
 */
export function comparerALaBaseline(echecs, echecsConnus) {
    const connus = new Set(echecsConnus ?? []);
    return {
        nouveaux: echecs.filter((e) => !connus.has(e)),
        reparees: [...connus].filter((e) => !echecs.includes(e)).sort()
    };
}
