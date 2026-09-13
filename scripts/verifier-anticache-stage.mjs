#!/usr/bin/env node
/**
 * #547 — L'ANTI-CACHE, RAPPELÉ AU MOMENT DU COMMIT.
 *
 * LE MANQUE. `tests/unit/sentinelle-anticache-fichiers-modifies.test.js`
 * compare des COMMITS : elle ne peut rien voir tant que le travail est dans
 * l'arbre, et rougit seulement au coup d'après. Le hook `pre-push` la lit —
 * trop tard, le commit est déjà écrit. Résultat mesuré : quatre oublis du même
 * geste en deux jours (25-26 août), sur trois sessions et trois chantiers sans
 * rapport. Ce n'est pas la connaissance qui manque — le geste correcteur est
 * connu et appliqué correctement à chaque fois — c'est le RAPPEL AU BON MOMENT.
 *
 * CE QUE CE SCRIPT VÉRIFIE, en deux refus :
 *   1. Pour chaque fichier STAGÉ servi avec un `?v=` (index.html, ou un
 *      chargement dynamique de `js/` à jeton écrit en dur), le jeton stagé doit
 *      différer de celui de HEAD. Sinon le navigateur sert la version périmée
 *      pendant que le bas de page annonce la neuve — l'incident du 23 août.
 *   2. (#826, 13 sept. 2026) Tout jeton d'index.html qui CHANGE dans ce commit
 *      doit être neuf pour ce chemin — ou avoir déjà servi EXACTEMENT ce
 *      contenu. Le 10 sept., deux sessions parallèles ont chacune posé
 *      `js/main.js?v=20260910a` sur deux contenus différents (`f6f00c71`,
 *      `0e93f057`) : comparer à HEAD seul ne pouvait pas le voir. Sous
 *      `/js/*` immuable (netlify.toml), une récidive fige un an le mauvais
 *      fichier chez qui l'a reçu. On lit donc tout l'historique d'index.html,
 *      toutes branches comprises (`git log --all`) : les sessions parallèles
 *      partagent le dépôt, leurs branches y sont visibles.
 *
 * POURQUOI COMPARER À HEAD, ET NON À LA RELEASE PRÉCÉDENTE. C'est ce qui
 * distingue ce contrôle de la sentinelle. Un `?v=` bumpé au premier commit d'un
 * cycle reste « changé depuis la release précédente » pour tous les commits
 * suivants : la sentinelle reste verte pendant que le fichier est modifié trois
 * fois de plus sous la même URL. Comparer à HEAD attrape chaque modification.
 *
 * CE QU'IL DIT SANS REFUSER (#602, 13 sept. 2026). Un fichier stagé chargé SANS
 * jeton (les bibliothèques de `libs/` qu'index.html charge nues,
 * `libs/pdf.worker.min.js` via `workerSrc`) ou sous un jeton CALCULÉ au
 * chargement (`pack-demo-10.js`, `heic-worker.js`) échappe à ce contrôle. Il
 * est NOMMÉ, sans bloquer : `libs/` reste revalidé (netlify.toml), et les
 * jetons de build sont jugés au pre-push par la sentinelle #825.
 * Et quand rien n'est stagé, il le DIT (#600) : un « rien vérifié » muet ne se
 * distinguait pas d'un « vérifié et bon ».
 *
 * CE QU'IL N'ÉCRIT JAMAIS. Rien. Il signale, il ne corrige pas — décision du
 * 26 août : Grégoire travaille dans l'arbre en `file://`, et tout automatisme
 * qui bumpe le BUILD lui change la version sous les pieds. Le geste correcteur
 * ne touche d'ailleurs pas `version.json` : poser un jeton du JOUR DU BUILD
 * (celui de `version.json`, ce qu'exige la sentinelle post-commit) avec une
 * lettre jamais servie. Le refus propose ce jeton, fichier par fichier.
 *
 * POURQUOI IL BLOQUE. Un contrôle qui avertit sans bloquer ne garde rien — le
 * projet l'a mesuré le 27 août sur un script de bump dont l'exception n'a
 * arrêté personne. Comme le geste correcteur ne touche pas la version affichée,
 * bloquer ne heurte aucune contrainte.
 *
 * PÉRIMÈTRE, ET UN CHOIX ASSUMÉ SUR libs/. Ce contrôle regarde TOUT fichier
 * stagé servi avec un `?v=` — donc aussi les bibliothèques vendored,
 * versionnées par leur numéro (`libs/pdf.min.js?v=3.11.174`). La sentinelle
 * post-commit `anticache-fichiers-modifies`, elle, reste bornée à `js`,
 * `styles.css` et `css` : son second invariant — « le suffixe porte la date du
 * build » — n'a aucun sens sur un numéro de version de bibliothèque. Le risque
 * est couvert ICI, au moment du commit, là où il naît.
 *
 * USAGE
 *   node scripts/verifier-anticache-stage.mjs     # sortie 1 si un ?v= manque
 *
 * ÉCHAPPATOIRE, pour le cas exceptionnel seulement :
 *   LABO_ANTICACHE_SKIP=1 git commit ...
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';

const ROUGE = '\x1b[0;31m';
const JAUNE = '\x1b[0;33m';
const GRIS = '\x1b[0;90m';
const RAZ = '\x1b[0m';

// Le suffixe accepte le POINT et le tiret, pas seulement l'alphanumérique.
// Mesuré le 27 août : trois références y échappaient — `libs/pdf.min.js?v=3.11.174`,
// `libs/jszip.min.js?v=3.10.1`, `libs/html2canvas.min.js?v=1.4.1`. Les
// bibliothèques tierces sont versionnées par leur numéro, pas par une date
// de build, et une classe [A-Za-z0-9] les rendait invisibles au contrôle :
// une lib repatchée sous la même URL serait servie depuis le cache.
const MOTIF_SUFFIXE = /(?:src|href)="([^"?]+)\?v=([A-Za-z0-9._-]+)"/g;

/**
 * Toutes les URL versionnées d'un index.html, sous forme `chemin -> suffixe`.
 *
 * Première occurrence gagnante : c'est ce que fait déjà la sentinelle, et un
 * fichier n'est référencé qu'une fois. Deux entrées divergentes pour un même
 * chemin seraient un défaut distinct, à voir ailleurs qu'ici.
 */
export function extraireSuffixes(contenuIndex) {
    const suffixes = new Map();
    if (!contenuIndex) return suffixes;
    const motif = new RegExp(MOTIF_SUFFIXE.source, 'g');
    let m;
    while ((m = motif.exec(contenuIndex)) !== null) {
        if (!suffixes.has(m[1])) suffixes.set(m[1], m[2]);
    }
    return suffixes;
}

/**
 * Les scripts et feuilles de style LOCAUX qu'un index.html charge sans `?v=`.
 * Mesuré le 13 sept. 2026 : quatre bibliothèques de `libs/` (chart, son plugin
 * d'annotation, jspdf, jspdf-autotable).
 * @returns {Set<string>}
 */
export function referencesSansJeton(contenuIndex) {
    const nues = new Set();
    if (!contenuIndex) return nues;
    const motif = /(?:src|href)="(?![a-z]+:|\/\/|#)([^"?#]+\.(?:m?js|css))"/g;
    let m;
    while ((m = motif.exec(contenuIndex)) !== null) nues.add(m[1].replace(/^\.\//, ''));
    return nues;
}

/**
 * Les chargements de scripts faits HORS d'index.html, dans un source de `js/`.
 *
 * Quatre formes : `.src = '…'` (script créé), `new Worker('…')`,
 * `importScripts('…')` (dans un worker) et `workerSrc = '…'` (PDF.js). Les deux
 * dernières manquaient aux trois filets jusqu'au 13 sept. (#602) :
 * `importScripts('../libs/libheif-bundle.js?v=20260830a')` et
 * `workerSrc = 'libs/pdf.worker.min.js'`, sans jeton.
 *
 * Le chemin est résolu comme le navigateur le fait : `importScripts` par
 * rapport au worker qui l'appelle, les autres par rapport au document.
 * Commentaires écartés avant lecture, sinon « Source : js/pack-demo-10.js »
 * compterait comme une URL.
 *
 * @param {string} source
 * @param {string} [fichierSource] - chemin du source, ex. 'js/heic-worker.js'
 * @returns {{site: string, chemin: string, avecJeton: boolean, jeton: string|null, calcule: boolean}[]}
 *   `jeton` : écrit en dur, ou null ; `calcule` : `'…?v=' + expression`.
 */
export function chargementsDynamiques(source, fichierSource = '') {
    const sansCommentaires = source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:'"])\/\/[^\n]*/g, '$1');
    const motif = /(\.src\s*=\s*|workerSrc\s*=\s*|new Worker\(\s*|importScripts\(\s*)(['"])([^'"]+?\.m?js(?:\?v=[^'"]*)?)\2/g;
    const sites = [];
    let m;
    while ((m = motif.exec(sansCommentaires)) !== null) {
        const site = m[3];
        const [brut, apresV] = site.split('?v=');
        const base = m[1].startsWith('importScripts') ? path.posix.dirname(fichierSource || '.') : '.';
        const chemin = path.posix.normalize(path.posix.join(base, brut));
        const avecJeton = apresV !== undefined;
        sites.push({
            site,
            chemin,
            avecJeton,
            jeton: avecJeton && apresV !== '' ? apresV : null,
            calcule: avecJeton && apresV === '',
        });
    }
    return sites;
}

/**
 * Le cœur du premier refus : les fichiers stagés qui gardent le jeton de HEAD.
 *
 * @param {string[]} fichiersStages - chemins relatifs à la racine du dépôt
 * @param {Map<string,string>} carteStage - chemin -> jeton, état stagé
 * @param {Map<string,string>} carteHead - chemin -> jeton, à HEAD
 * @returns {{fichier: string, suffixe: string}[]}
 */
export function trouverJetonsInchanges(fichiersStages, carteStage, carteHead) {
    const perimes = [];
    for (const fichier of fichiersStages) {
        // Un fichier qu'on ne sert pas avec un jeton ne peut pas être servi
        // périmé PAR CE MÉCANISME : module sans jeton, script de dev, test, doc.
        const suffixe = carteStage.get(fichier);
        if (suffixe === undefined) continue;

        // Fichier neuf, ou nouvellement référencé : son URL n'a jamais été
        // servie, donc aucun cache ne la porte. Rien à exiger.
        const ancien = carteHead.get(fichier);
        if (ancien === undefined) continue;

        if (ancien === suffixe) perimes.push({ fichier, suffixe });
    }
    return perimes;
}

/** Le premier refus, lu sur deux index.html (la forme d'origine, gardée). */
export function trouverSuffixesInchanges(fichiersStages, indexStage, indexHead) {
    return trouverJetonsInchanges(fichiersStages, extraireSuffixes(indexStage), extraireSuffixes(indexHead));
}

/**
 * Lit la sortie de `git log -p --format='commit %H' -- index.html` : pour
 * chaque chemin, chaque jeton qu'une ligne AJOUTÉE lui a donné, et les commits
 * qui l'ont posé. Toute URL servie un jour est entrée par une ligne `+`, le
 * commit racine compris.
 * @returns {Map<string, Map<string, Set<string>>>} chemin -> jeton -> commits
 */
export function lireHistoriqueJetons(logPatch) {
    const histo = new Map();
    let commit = null;
    for (const ligne of String(logPatch || '').split('\n')) {
        if (ligne.startsWith('commit ')) { commit = ligne.slice(7).trim(); continue; }
        if (!ligne.startsWith('+') || ligne.startsWith('+++')) continue;
        const motif = new RegExp(MOTIF_SUFFIXE.source, 'g');
        let m;
        while ((m = motif.exec(ligne)) !== null) {
            if (!histo.has(m[1])) histo.set(m[1], new Map());
            const parJeton = histo.get(m[1]);
            if (!parJeton.has(m[2])) parJeton.set(m[2], new Set());
            if (commit) parJeton.get(m[2]).add(commit);
        }
    }
    return histo;
}

/**
 * Le second refus (#826) : un jeton qui change dans ce commit, mais qui a DÉJÀ
 * servi ce chemin avec un autre contenu.
 *
 * @param {Map<string,string>} candidats - chemin -> jeton stagé, pour les
 *   seuls jetons qui diffèrent de HEAD (un jeton égal à HEAD relève du 1er refus)
 * @param {Map<string, Map<string, Set<string>>>} historique - lireHistoriqueJetons
 * @param {(commit: string, chemin: string) => boolean|null} memeContenu - le
 *   fichier au commit est-il celui qui est stagé ? null si on ne peut le dire
 *   (fichier absent à ce commit) : on ne refuse pas sur une inconnue.
 * @returns {{fichier: string, suffixe: string, commit: string}[]}
 */
export function trouverJetonsDejaServis(candidats, historique, memeContenu) {
    const collisions = [];
    for (const [fichier, suffixe] of candidats) {
        const commits = historique.get(fichier)?.get(suffixe);
        if (!commits) continue;
        for (const commit of commits) {
            if (memeContenu(commit, fichier) === false) {
                collisions.push({ fichier, suffixe, commit });
                break;
            }
        }
    }
    return collisions;
}

/**
 * Le jeton à proposer : jour du build + la première lettre jamais servie.
 * @param {string|undefined} actuel - jeton stagé du fichier
 * @param {string|null} jourBuild - AAAAMMJJ, ou null si version.json illisible
 * @param {Set<string>} dejaServis - jetons que ce chemin a déjà portés
 */
export function proposerJeton(actuel, jourBuild, dejaServis) {
    if (!jourBuild) return null;
    // Compteur bijectif base 26 : a..z, aa, ab, … (celui de release.mjs).
    const lettres = (n) => {
        let s = '';
        for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(97 + ((n - 1) % 26)) + s;
        return s;
    };
    const rang = (s) => [...s].reduce((n, c) => n * 26 + (c.charCodeAt(0) - 96), 0) - 1;
    // Même jour : on repart APRÈS le rang actuel, on ne recule pas.
    const suffixe = actuel && actuel.startsWith(jourBuild) ? actuel.slice(jourBuild.length) : '';
    const depart = /^[a-z]+$/.test(suffixe) ? rang(suffixe) + 1 : 0;
    for (let i = depart; i < depart + 26 * 27; i++) {
        const jeton = jourBuild + lettres(i);
        if (!dejaServis.has(jeton)) return jeton;
    }
    return null;
}

function git(args, { tolererVide = false } = {}) {
    try {
        return execFileSync('git', args, {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
            // index.html pèse ~1 Mo — au-dessus du tampon par défaut, qui vaut
            // EXACTEMENT 1 Mo. Sans ce relèvement, `git show` lève ENOBUFS, et la
            // vérification se sauterait elle-même. La sentinelle du 23 août s'est
            // fait prendre à ce piège : elle rendait null et passait au vert.
            // L'historique d'index.html (`git log -p -U0`) pèse ~11 Mo en sept.
            maxBuffer: 512 * 1024 * 1024,
        });
    } catch (e) {
        // `git grep` sort en 1 quand il ne trouve rien : ce n'est pas une panne.
        if (tolererVide && e.status === 1) return '';
        throw e;
    }
}

/** Chemin -> jeton des chargements dynamiques à jeton écrit en dur, et la liste brute. */
function lireChargements(arbre) {
    // `arbre` : '--cached' (l'index) ou 'HEAD'. Bornés à `js/`, le code servi :
    // les bancs de tests/ fabriquent leurs propres `.src =`.
    const sortie = git(['grep', '--no-color', '--name-only', ...(arbre === 'HEAD' ? [] : ['--cached']), '-E',
        'importScripts\\(|workerSrc|new Worker\\(|\\.src[[:space:]]*=', ...(arbre === 'HEAD' ? ['HEAD'] : []), '--', 'js'],
    { tolererVide: true });
    const fichiers = sortie.split('\n').map((l) => l.trim().replace(/^HEAD:/, '')).filter(Boolean);
    const sites = [];
    for (const fichier of fichiers) {
        const source = git(['show', (arbre === 'HEAD' ? 'HEAD:' : ':') + fichier]);
        for (const s of chargementsDynamiques(source, fichier)) sites.push({ ...s, depuis: fichier });
    }
    return sites;
}

function anneeToronto() {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric' }).format(new Date());
}

function main() {
    if (process.env.LABO_ANTICACHE_SKIP === '1') return 0;
    const dire = (s) => process.stderr.write(s);
    const titre = GRIS + '=== Anti-cache pre-commit (#547) ===' + RAZ;

    // Fichiers stagés, suppressions exclues : un fichier retiré du dépôt n'a
    // plus d'URL à rafraîchir.
    const stages = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
        .split('\n').map((l) => l.trim()).filter(Boolean);
    if (stages.length === 0) {
        // #600 — le vert creux. Lancé APRÈS un commit (l'ordre qu'on trouvait
        // dans le rituel), ce script sortait en 0 sans une ligne : un vert
        // indiscernable d'un vrai. Il n'a rien vérifié ; il le dit.
        process.stdout.write(GRIS + 'Anti-cache (#547) : rien de stagé — RIEN VÉRIFIÉ. '
            + 'Après un commit, c\'est la sentinelle Vitest anticache-fichiers-modifies qui juge.' + RAZ + '\n');
        return 0;
    }

    let indexStage;
    let indexHead;
    try {
        indexStage = git(['show', ':index.html']);
        indexHead = git(['show', 'HEAD:index.html']);
    } catch {
        // Dépôt sans HEAD, ou index.html absent de l'un des deux états. Rien à
        // comparer : on passe (fail-open), comme le pre-push là où WebKit
        // n'existe pas. Un contrôle inapplicable qui bloque se fait contourner —
        // mais il le DIT : un « impossible » muet se confond avec un vert.
        process.stdout.write(GRIS + 'Anti-cache (#547) : index.html illisible à HEAD ou dans l\'index — '
            + 'RIEN VÉRIFIÉ (laissé passer).' + RAZ + '\n');
        return 0;
    }

    // Les chargements hors index.html (#602). Une panne de lecture ici ne doit
    // pas coûter le contrôle principal : on continue sans eux, en le disant.
    let dynStage = [];
    let dynHead = [];
    let dynLisible = true;
    try {
        dynStage = lireChargements('--cached');
        dynHead = lireChargements('HEAD');
    } catch {
        dynLisible = false;
    }
    const carteDe = (index, dyn) => {
        const carte = extraireSuffixes(index);
        for (const s of dyn) if (s.jeton && !carte.has(s.chemin)) carte.set(s.chemin, s.jeton);
        return carte;
    };
    const carteStage = carteDe(indexStage, dynStage);
    const carteHead = carteDe(indexHead, dynHead);

    const perimes = trouverJetonsInchanges(stages, carteStage, carteHead);

    // #826 — les jetons d'index.html qui changent dans ce commit.
    const suffixesStage = extraireSuffixes(indexStage);
    const suffixesHead = extraireSuffixes(indexHead);
    const candidats = new Map();
    for (const [chemin, jeton] of suffixesStage) {
        if (suffixesHead.get(chemin) !== jeton) candidats.set(chemin, jeton);
    }
    let historique = null;
    const lireHistorique = () => {
        if (historique === null) {
            historique = lireHistoriqueJetons(git(['log', '--all', '-p', '-U0', '--no-color',
                '--no-ext-diff', '--format=commit %H', '--', 'index.html']));
        }
        return historique;
    };
    let collisions = [];
    if (candidats.size > 0) {
        const blobStage = (chemin) => {
            try { return git(['rev-parse', '--verify', '-q', ':' + chemin]).trim(); } catch { return null; }
        };
        const memeContenu = (commit, chemin) => {
            let aCommit;
            try { aCommit = git(['rev-parse', '--verify', '-q', commit + ':' + chemin]).trim(); } catch { return null; }
            const stage = blobStage(chemin);
            return stage === null ? null : aCommit === stage;
        };
        collisions = trouverJetonsDejaServis(candidats, lireHistorique(), memeContenu);
    }

    // #602 — ce que ce garde ne couvre pas, parmi les fichiers stagés.
    const nues = referencesSansJeton(indexStage);
    const nonCouverts = [];
    for (const fichier of stages) {
        if (carteStage.has(fichier)) continue;
        const dyn = dynStage.find((s) => s.chemin === fichier);
        if (nues.has(fichier)) nonCouverts.push(fichier + '  ' + GRIS + '(index.html le charge sans ?v=)' + RAZ);
        else if (dyn && dyn.calcule) nonCouverts.push(fichier + '  ' + GRIS + '(jeton calculé au chargement, dans ' + dyn.depuis + ' — jugé au pre-push par la sentinelle #825)' + RAZ);
        else if (dyn) nonCouverts.push(fichier + '  ' + GRIS + '(chargé sans ?v= par ' + dyn.depuis + ' : ' + dyn.site + ')' + RAZ);
    }

    if (nonCouverts.length > 0 || !dynLisible) {
        dire('\n' + titre + '\n');
        if (!dynLisible) {
            dire(JAUNE + '⚠ Chargements hors index.html illisibles (git grep) : importScripts, workerSrc, new Worker NON vérifiés.' + RAZ + '\n');
        }
        if (nonCouverts.length > 0) {
            dire(JAUNE + '⚠ ' + nonCouverts.length + ' fichier(s) stagé(s) HORS de ce contrôle — il ne peut rien en dire :' + RAZ + '\n');
            for (const ligne of nonCouverts) dire('  ' + ligne + '\n');
            dire(GRIS + '  Sans jeton, ils ne tiennent qu\'à la revalidation (netlify.toml : libs/ hors immuable). Commit non bloqué.' + RAZ + '\n');
        }
        dire('\n');
    }

    if (perimes.length === 0 && collisions.length === 0) return 0;

    // Le jour du build, celui qu'exige la sentinelle post-commit : lu dans le
    // version.json qui part avec ce commit.
    let build = null;
    try {
        const v = JSON.parse(git(['show', ':version.json']));
        if (/^\d{4}-\d{4}$/.test(v.build)) build = v.build;
    } catch { /* version.json absent : la proposition se tait, le refus reste */ }
    const jourBuild = build ? anneeToronto() + build.slice(0, 4) : null;
    const proposition = (fichier, suffixe) => {
        let servis = new Set();
        try { servis = new Set(lireHistorique().get(fichier)?.keys() || []); } catch { /* sans historique */ }
        const p = proposerJeton(suffixe, jourBuild, servis);
        return p ? '  ' + GRIS + '→ ?v=' + p + RAZ : '';
    };

    dire('\n' + titre + '\n\n');
    if (perimes.length > 0) {
        dire(ROUGE + 'x ' + perimes.length + ' fichier(s) modifie(s) gardent l\'URL qu\'ils avaient a HEAD' + RAZ + '\n');
        dire(GRIS + 'Le navigateur servira leur version PERIMEE — l\'incident du 23 aout.' + RAZ + '\n\n');
        for (const { fichier, suffixe } of perimes) {
            dire('  ' + ROUGE + fichier + RAZ + '  ?v=' + suffixe + ' ' + GRIS + '(inchange)' + RAZ + proposition(fichier, suffixe) + '\n');
        }
        dire('\n');
    }
    if (collisions.length > 0) {
        dire(ROUGE + 'x ' + collisions.length + ' jeton(s) ont DEJA servi ce chemin avec un autre contenu (#826)' + RAZ + '\n');
        dire(GRIS + 'Sous /js/* immuable, le navigateur qui a l\'ancien le garde un an.' + RAZ + '\n\n');
        for (const { fichier, suffixe, commit } of collisions) {
            dire('  ' + ROUGE + fichier + RAZ + '  ?v=' + suffixe + ' ' + GRIS + '(deja pose par ' + commit.slice(0, 8) + ')' + RAZ + proposition(fichier, suffixe) + '\n');
        }
        dire('\n');
    }
    dire(GRIS + 'Corriger, au choix :' + RAZ + '\n');
    if (build) {
        dire(GRIS + '  · poser dans index.html un jeton du JOUR DU BUILD (version.json : ' + build + ', donc ' + jourBuild + ')' + RAZ + '\n');
        dire(GRIS + '    avec une lettre jamais servie pour ce fichier — proposee ci-dessus ;' + RAZ + '\n');
    } else {
        dire(GRIS + '  · poser dans index.html un jeton du JOUR DU BUILD de version.json (AAAAMMJJ + une lettre jamais servie) ;' + RAZ + '\n');
    }
    dire(GRIS + '    — ne touche PAS version.json, donc sur meme avec l\'application ouverte ;' + RAZ + '\n');
    dire(GRIS + '  · ou node scripts/release.mjs --build-only, si le build peut bouger.' + RAZ + '\n\n');
    dire(ROUGE + 'Commit refuse.' + RAZ + '\n');
    dire(GRIS + 'Cas exceptionnel : LABO_ANTICACHE_SKIP=1 git commit ...' + RAZ + '\n\n');
    return 1;
}

// Exécuté seulement en CLI : l'import depuis les tests ne doit rien lancer.
if (process.argv[1] && process.argv[1].endsWith('verifier-anticache-stage.mjs')) {
    process.exit(main());
}
