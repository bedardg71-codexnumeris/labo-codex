/**
 * Lecture d'un rapport JSON de Playwright, et jugement contre la baseline.
 *
 * Fonctions PURES, sans effet de bord : trois juges les partagent.
 *   · scripts/verifier-playwright.mjs — le verdict du Mac, qui lance la suite ;
 *   · scripts/verdict-en-morceaux.mjs — le verdict du Mac, en morceaux ;
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
 * Specs JOUÉES ET VERTES (#1114, 28 oct. 2026) : au moins un essai `expected`
 * ou `flaky` (vert au second essai — passée, comme le dit Playwright par
 * `ok`). Une spec sautée n'est ni rouge ni verte : elle n'a pas été jouée. Le
 * juge en a besoin pour ne dire « redevenue verte » que ce qu'il a VU vert.
 */
export function vertsDuRapport(rapport) {
    const trouves = [];
    const descendre = (suites) => {
        for (const suite of suites ?? []) {
            for (const spec of suite.specs ?? []) {
                const jouee = (spec.tests ?? []).some((t) => t.status === 'expected' || t.status === 'flaky');
                if (spec.ok !== false && jouee) trouves.push(identite(spec.file ?? suite.file ?? '?', spec.title));
            }
            descendre(suite.suites);
        }
    };
    descendre(rapport.suites);
    return trouves.sort();
}

/**
 * Compare les échecs à la baseline, qui tient deux listes (#1114, 28 oct. 2026) :
 *   · `echecsConnus` — rouges à chaque fois ; elles doivent le rester ;
 *   · `echecsIntermittents` — rouges un soir, vertes un autre (sous Linux) ;
 *     absente, elle vaut `[]`. Le nom les distingue des « instables » du juge
 *     (`flakyDuRapport`, les vertes au second essai).
 *
 * Seule une rougeur absente des DEUX listes est `nouvelle`. Une connue n'est
 * `reparee` que JOUÉE ET VERTE dans ce rapport ; absente du rapport (un morceau,
 * un run partiel), elle est `nonJouee`, sans conclusion — le 26 oct., 14 des 18
 * « redevenues vertes » d'un jugement n'avaient pas tourné. Une intermittente ne
 * bloque ni rouge ni verte : on dit seulement combien sont rouges.
 */
export function comparerALaBaseline({ echecs, verts }, { echecsConnus = [], echecsIntermittents = [] } = {}) {
    const connus = new Set(echecsConnus);
    const intermittentes = new Set(echecsIntermittents);
    const rouges = new Set(echecs);
    const vus = new Set(verts);
    return {
        nouveaux: echecs.filter((e) => !connus.has(e) && !intermittentes.has(e)),
        reparees: [...connus].filter((e) => vus.has(e) && !rouges.has(e)).sort(),
        nonJouees: [...connus].filter((e) => !vus.has(e) && !rouges.has(e)).sort(),
        intermittentesRouges: echecs.filter((e) => intermittentes.has(e))
    };
}
