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
 * CE QUE CE SCRIPT VÉRIFIE. Pour chaque fichier STAGÉ qu'index.html référence
 * avec un `?v=`, le suffixe de l'index.html stagé doit différer de celui de
 * HEAD. Sinon le navigateur sert la version périmée pendant que le bas de page
 * annonce la neuve — l'incident du 23 août.
 *
 * POURQUOI COMPARER À HEAD, ET NON À LA RELEASE PRÉCÉDENTE. C'est ce qui
 * distingue ce contrôle de la sentinelle. Un `?v=` bumpé au premier commit d'un
 * cycle reste « changé depuis la release précédente » pour tous les commits
 * suivants : la sentinelle reste verte pendant que le fichier est modifié trois
 * fois de plus sous la même URL. Comparer à HEAD attrape chaque modification.
 *
 * CE QU'IL N'ÉCRIT JAMAIS. Rien. Il signale, il ne corrige pas — décision du
 * 26 août : Grégoire travaille dans l'arbre en `file://`, et tout automatisme
 * qui bumpe le BUILD lui change la version sous les pieds. Le geste correcteur
 * ne touche d'ailleurs pas `version.json` : incrémenter la lettre du suffixe
 * (`20260827a` -> `20260827b`) suffit, et laisse le numéro de version en place.
 *
 * POURQUOI IL BLOQUE. Un contrôle qui avertit sans bloquer ne garde rien — le
 * projet l'a mesuré le 27 août sur un script de bump dont l'exception n'a
 * arrêté personne. Comme le geste correcteur ne touche pas la version affichée,
 * bloquer ne heurte aucune contrainte.
 *
 * PÉRIMÈTRE, ET UN CHOIX ASSUMÉ SUR libs/. Ce contrôle regarde TOUT fichier
 * stagé qu'index.html sert avec un `?v=` — donc aussi les bibliothèques
 * vendored, versionnées par leur numéro (`libs/pdf.min.js?v=3.11.174`). La
 * sentinelle post-commit `anticache-fichiers-modifies`, elle, reste bornée à
 * `js`, `styles.css` et `css` : son second invariant — « le suffixe porte la
 * date du build » — n'a aucun sens sur un numéro de version de bibliothèque,
 * et l'y étendre demanderait deux régimes de lecture dans le même test. Le
 * risque est couvert ICI, au moment du commit, là où il naît. Ce n'est pas un
 * oubli : c'est le partage de tâches entre les deux filets.
 *
 * USAGE
 *   node scripts/verifier-anticache-stage.mjs     # sortie 1 si un ?v= manque
 *
 * ÉCHAPPATOIRE, pour le cas exceptionnel seulement :
 *   LABO_ANTICACHE_SKIP=1 git commit ...
 */

import { execFileSync } from 'node:child_process';

const ROUGE = '\x1b[0;31m';
const GRIS = '\x1b[0;90m';
const RAZ = '\x1b[0m';

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
    // Le suffixe accepte le POINT et le tiret, pas seulement l'alphanumérique.
    // Mesuré le 27 août : trois références y échappaient — `libs/pdf.min.js?v=3.11.174`,
    // `libs/jszip.min.js?v=3.10.1`, `libs/html2canvas.min.js?v=1.4.1`. Les
    // bibliothèques tierces sont versionnées par leur numéro, pas par une date
    // de build, et une classe [A-Za-z0-9] les rendait invisibles au contrôle :
    // une lib repatchée sous la même URL serait servie depuis le cache.
    const motif = /(?:src|href)="([^"?]+)\?v=([A-Za-z0-9._-]+)"/g;
    let m;
    while ((m = motif.exec(contenuIndex)) !== null) {
        if (!suffixes.has(m[1])) suffixes.set(m[1], m[2]);
    }
    return suffixes;
}

/**
 * Les fichiers stagés qui gardent l'URL qu'ils avaient à HEAD.
 *
 * @param {string[]} fichiersStages - chemins relatifs à la racine du dépôt
 * @param {string} indexStage - index.html tel qu'il est dans l'index git
 * @param {string} indexHead - index.html tel qu'il est à HEAD
 * @returns {{fichier: string, suffixe: string}[]}
 */
export function trouverSuffixesInchanges(fichiersStages, indexStage, indexHead) {
    const avant = extraireSuffixes(indexHead);
    const apres = extraireSuffixes(indexStage);
    const perimes = [];

    for (const fichier of fichiersStages) {
        // Un fichier qu'index.html ne sert pas ne peut pas être servi périmé :
        // module chargé autrement, script de dev, test, documentation.
        const suffixe = apres.get(fichier);
        if (suffixe === undefined) continue;

        // Fichier neuf, ou nouvellement référencé : son URL n'a jamais été
        // servie, donc aucun cache ne la porte. Rien à exiger.
        const ancien = avant.get(fichier);
        if (ancien === undefined) continue;

        if (ancien === suffixe) perimes.push({ fichier, suffixe });
    }
    return perimes;
}

function git(args) {
    return execFileSync('git', args, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        // index.html pèse ~1 Mo — au-dessus du tampon par défaut, qui vaut
        // EXACTEMENT 1 Mo. Sans ce relèvement, `git show` lève ENOBUFS, et la
        // vérification se sauterait elle-même. La sentinelle du 23 août s'est
        // fait prendre à ce piège : elle rendait null et passait au vert.
        maxBuffer: 64 * 1024 * 1024,
    });
}

function main() {
    if (process.env.LABO_ANTICACHE_SKIP === '1') return 0;

    // Fichiers stagés, suppressions exclues : un fichier retiré du dépôt n'a
    // plus d'URL à rafraîchir.
    const stages = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
        .split('\n').map((l) => l.trim()).filter(Boolean);
    if (stages.length === 0) return 0;

    let indexStage;
    let indexHead;
    try {
        indexStage = git(['show', ':index.html']);
        indexHead = git(['show', 'HEAD:index.html']);
    } catch {
        // Dépôt sans HEAD, ou index.html absent de l'un des deux états. Rien à
        // comparer : on passe (fail-open), comme le pre-push là où WebKit
        // n'existe pas. Un contrôle inapplicable qui bloque se fait contourner.
        return 0;
    }

    const perimes = trouverSuffixesInchanges(stages, indexStage, indexHead);
    if (perimes.length === 0) return 0;

    const dire = (s) => process.stderr.write(s);
    dire('\n');
    dire(GRIS + '=== Anti-cache pre-commit (#547) ===' + RAZ + '\n\n');
    dire(ROUGE + 'x ' + perimes.length + ' fichier(s) modifie(s) gardent l\'URL qu\'ils avaient a HEAD' + RAZ + '\n');
    dire(GRIS + 'Le navigateur servira leur version PERIMEE — l\'incident du 23 aout.' + RAZ + '\n\n');
    for (const { fichier, suffixe } of perimes) {
        dire('  ' + ROUGE + fichier + RAZ + '  ?v=' + suffixe + ' ' + GRIS + '(inchange)' + RAZ + '\n');
    }
    dire('\n' + GRIS + 'Corriger, au choix :' + RAZ + '\n');
    dire(GRIS + '  · incrementer la lettre du suffixe dans index.html (20260827a -> 20260827b)' + RAZ + '\n');
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
