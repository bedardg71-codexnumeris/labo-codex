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
 * Identité d'un essai, STABLE dans le temps et UNIQUE dans la suite.
 *
 * « fichier › bloc › sous-bloc › titre », sans le numéro de ligne : une ligne
 * bouge dès qu'on édite le fichier au-dessus, et la baseline se mettrait alors à
 * dénoncer des échecs « nouveaux » qui sont les mêmes. Le titre, lui, ne bouge
 * que si l'on change ce que la spec vérifie — auquel cas la revoir est justement
 * ce qu'on veut. Un essai hors de tout bloc reste « fichier › titre ».
 *
 * Les blocs (`test.describe`) en font partie depuis le 1er nov. 2026 (#1114) :
 * sans eux, deux essais de même titre dans deux blocs d'un fichier (le même geste
 * à 1440 px et à 820 px) n'avaient qu'une identité, et la rouge de l'un était
 * couverte par l'entrée connue de l'autre. 11 paires dans la suite ce jour-là.
 */
export function identite(fichier, blocs, titre) {
    return [fichier.replace(/\\/g, '/'), ...blocs, titre].join(' › ');
}

/**
 * Le seul parcours du rapport JSON : chaque spec, avec son identité. Au premier
 * niveau, une suite est un FICHIER (son titre est son chemin, déjà dans
 * l'identité) ; plus bas, c'est un bloc. Un bloc anonyme n'a pas de titre : il
 * n'ajoute rien.
 */
function parcourirSpecs(rapport, visiter) {
    const descendre = (suites, blocs, auPremierNiveau) => {
        for (const suite of suites ?? []) {
            const chemin = auPremierNiveau ? [] : [...blocs, suite.title].filter(Boolean);
            for (const spec of suite.specs ?? []) {
                visiter(spec, identite(spec.file ?? suite.file ?? '?', chemin, spec.title));
            }
            descendre(suite.suites, chemin, false);
        }
    };
    descendre(rapport.suites, [], true);
}

/** Les identités des specs qui répondent à `garder`, triées. */
function specsDuRapport(rapport, garder) {
    const trouves = [];
    parcourirSpecs(rapport, (spec, id) => { if (garder(spec)) trouves.push(id); });
    return trouves.sort();
}

/** Les specs en échec. */
export function echecsDuRapport(rapport) {
    return specsDuRapport(rapport, (spec) => spec.ok === false);
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
    return specsDuRapport(rapport, (spec) => (spec.tests ?? []).some((t) => t.status === 'flaky'));
}

/**
 * Specs JOUÉES ET VERTES (#1114, 28 oct. 2026) : au moins un essai `expected`
 * ou `flaky` (vert au second essai — passée, comme le dit Playwright par
 * `ok`). Une spec sautée n'est ni rouge ni verte : elle n'a pas été jouée. Le
 * juge en a besoin pour ne dire « redevenue verte » que ce qu'il a VU vert.
 */
export function vertsDuRapport(rapport) {
    return specsDuRapport(rapport, (spec) => spec.ok !== false && (spec.tests ?? []).some((t) => t.status === 'expected' || t.status === 'flaky'));
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
 *
 * Une connue verte au SECOND essai (`instables`, de `flakyDuRapport`) n'est pas
 * réparée : rouge puis verte, elle est par définition intermittente — retirée des
 * connues, elle rougirait « nouvelle » au soir suivant. Elle se dit
 * `aPasserAuxIntermittentes` (verdict de Cowork du 29 oct. 2026).
 */
export function comparerALaBaseline({ echecs, verts, instables }, { echecsConnus = [], echecsIntermittents = [] } = {}) {
    const connus = new Set(echecsConnus);
    const intermittentes = new Set(echecsIntermittents);
    const rouges = new Set(echecs);
    const vus = new Set(verts);
    const rattrapees = new Set(instables);
    return {
        nouveaux: echecs.filter((e) => !connus.has(e) && !intermittentes.has(e)),
        reparees: [...connus].filter((e) => vus.has(e) && !rouges.has(e) && !rattrapees.has(e)).sort(),
        aPasserAuxIntermittentes: [...connus].filter((e) => rattrapees.has(e) && !rouges.has(e)).sort(),
        nonJouees: [...connus].filter((e) => !vus.has(e) && !rouges.has(e)).sort(),
        intermittentesRouges: echecs.filter((e) => intermittentes.has(e))
    };
}
