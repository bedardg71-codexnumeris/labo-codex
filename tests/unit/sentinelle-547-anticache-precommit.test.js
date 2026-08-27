import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    extraireSuffixes,
    trouverSuffixesInchanges,
} from '../../scripts/verifier-anticache-stage.mjs';

// SENTINELLE #547 — L'ANTI-CACHE RAPPELÉ AU MOMENT DU COMMIT.
//
// LE MOTIF QUI L'A FAIT NAÎTRE. Quatre oublis du même geste en deux jours
// (25-26 août 2026), sur trois sessions et trois chantiers sans rapport :
// #540 lot C, #540 lot D sur `styles.css`, #541, #542. À chaque fois un
// fichier modifié dont le `?v=` d'index.html ne suit pas — donc un navigateur
// qui sert la version périmée pendant que le bas de page annonce la neuve.
//
// POURQUOI LE FILET EXISTANT NE SUFFISAIT PAS. La sentinelle
// `anticache-fichiers-modifies` compare des COMMITS : elle ne voit rien tant
// que le travail est dans l'arbre, et le hook pre-push la lit une fois le
// commit écrit. Le geste correcteur était connu de tous et correctement
// appliqué à chaque fois : ce qui manquait, c'était le RAPPEL AU BON MOMENT.
//
// CE QUI EST VERROUILLÉ ICI, en trois invariants :
//   1. un fichier stagé dont le `?v=` n'a pas bougé depuis HEAD est SIGNALÉ ;
//   2. le hook pre-commit APPELLE réellement le script — un contrôle jamais
//      invoqué est un contrôle qui n'existe pas ;
//   3. il l'appelle AVANT la sortie anticipée de la Défense J, qui filtre sur
//      '*.js' '*.html' et laisserait passer un commit de `styles.css` seul.
//
// BREAK-TESTS VÉRIFIÉS le 27 août 2026 — voir le journal en fin de fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

/** index.html minimal : les trois formes de suffixe réellement présentes. */
const INDEX_AVANT = `
<link rel="stylesheet" href="styles.css?v=20260827a">
<script src="version.js?v=08270953"></script>
<script src="js/db.js?v=20260826b"></script>
<script src="js/portfolio.js?v=20260805a"></script>
<script src="js/sans-version.js"></script>
<script src="libs/pdf.min.js?v=3.11.174"></script>
`;

describe('#547 · extraireSuffixes — lire les URL versionnées', () => {
    it('relève src et href, et rend le chemin sans le suffixe', () => {
        const s = extraireSuffixes(INDEX_AVANT);
        expect(s.get('styles.css')).toBe('20260827a');
        expect(s.get('js/db.js')).toBe('20260826b');
        expect(s.get('version.js')).toBe('08270953');
    });

    it('ignore un fichier référencé SANS ?v= — il n\'a pas d\'URL à rafraîchir', () => {
        expect(extraireSuffixes(INDEX_AVANT).has('js/sans-version.js')).toBe(false);
    });

    it('première occurrence gagnante', () => {
        const doublon = '<script src="js/db.js?v=AAA"></script><script src="js/db.js?v=BBB"></script>';
        expect(extraireSuffixes(doublon).get('js/db.js')).toBe('AAA');
    });

    it('relève les suffixes À POINTS des bibliothèques tierces', () => {
        // Mesuré le 27 août sur l'index.html réel : une classe [A-Za-z0-9]
        // laissait échapper `libs/pdf.min.js?v=3.11.174`, `libs/jszip.min.js`
        // et `libs/html2canvas.min.js` — trois fichiers invisibles au contrôle,
        // donc trois libs repatchables sous la même URL. 185 relevées sur 188.
        expect(extraireSuffixes(INDEX_AVANT).get('libs/pdf.min.js')).toBe('3.11.174');
    });

    it('un index vide ou absent ne fait pas tomber la lecture', () => {
        expect(extraireSuffixes('').size).toBe(0);
        expect(extraireSuffixes(null).size).toBe(0);
    });
});

describe('#547 · trouverSuffixesInchanges — le cœur du contrôle', () => {
    it('SIGNALE un fichier modifié dont le ?v= n\'a pas bougé', () => {
        const perimes = trouverSuffixesInchanges(['js/db.js'], INDEX_AVANT, INDEX_AVANT);
        expect(perimes).toEqual([{ fichier: 'js/db.js', suffixe: '20260826b' }]);
    });

    it('se tait quand le ?v= a changé', () => {
        const apres = INDEX_AVANT.replace('js/db.js?v=20260826b', 'js/db.js?v=20260827a');
        expect(trouverSuffixesInchanges(['js/db.js'], apres, INDEX_AVANT)).toEqual([]);
    });

    it('se tait sur un fichier qu\'index.html ne sert pas (test, script, doc)', () => {
        const stages = ['tests/unit/quelque-chose.test.js', 'BACKLOG.md', 'scripts/release.mjs'];
        expect(trouverSuffixesInchanges(stages, INDEX_AVANT, INDEX_AVANT)).toEqual([]);
    });

    it('se tait sur un fichier NEUF : son URL n\'a jamais été servie, aucun cache ne la porte', () => {
        const apres = INDEX_AVANT + '<script src="js/tout-neuf.js?v=20260827a"></script>';
        expect(trouverSuffixesInchanges(['js/tout-neuf.js'], apres, INDEX_AVANT)).toEqual([]);
    });

    it('attrape styles.css — le lot où la Défense J est aveugle', () => {
        // #540 lot D : un `styles.css` modifié seul. La Défense J filtre sur
        // '*.js' '*.html' et sort avant de rien voir. C'est un des quatre oublis.
        const perimes = trouverSuffixesInchanges(['styles.css'], INDEX_AVANT, INDEX_AVANT);
        expect(perimes.map((p) => p.fichier)).toEqual(['styles.css']);
    });

    it('nomme TOUS les périmés d\'un lot mixte, pas seulement le premier', () => {
        const apres = INDEX_AVANT.replace('js/db.js?v=20260826b', 'js/db.js?v=20260827c');
        const stages = ['js/db.js', 'js/portfolio.js', 'styles.css', 'BACKLOG.md'];
        const perimes = trouverSuffixesInchanges(stages, apres, INDEX_AVANT);
        expect(perimes.map((p) => p.fichier)).toEqual(['js/portfolio.js', 'styles.css']);
    });

    it('SIGNALE une bibliothèque tierce repatchée sous la même URL', () => {
        const perimes = trouverSuffixesInchanges(['libs/pdf.min.js'], INDEX_AVANT, INDEX_AVANT);
        expect(perimes).toEqual([{ fichier: 'libs/pdf.min.js', suffixe: '3.11.174' }]);
    });

    it('un lot stagé vide ne signale rien', () => {
        expect(trouverSuffixesInchanges([], INDEX_AVANT, INDEX_AVANT)).toEqual([]);
    });
});

describe('#547 · le contrôle est réellement branché au hook', () => {
    const hook = readFileSync(path.join(racineProjet, 'scripts', 'hooks', 'pre-commit'), 'utf8');

    it('le hook pre-commit appelle le script', () => {
        // Un contrôle que rien n'invoque est un contrôle qui n'existe pas —
        // c'est le patron « fix perdu au refactoring » du projet.
        expect(hook, 'scripts/hooks/pre-commit doit invoquer verifier-anticache-stage.mjs')
            .toMatch(/node\s+"?\$?\{?[A-Za-z_]*\}?"?\/?.*verifier-anticache-stage\.mjs/);
    });

    it('une sortie non nulle du script BLOQUE le commit', () => {
        // Un script de garde qui échoue sans arrêter la suite ne garde rien :
        // mesuré le 27 août sur un script de bump dont l'exception n'a arrêté
        // personne, et le commit est parti en croyant l'anti-cache posé.
        expect(hook).toMatch(/if\s+!\s+node\s+[^\n]*verifier-anticache-stage\.mjs[^\n]*;\s*then\s*\n\s*exit 1/);
    });

    it('il est appelé AVANT la sortie anticipée de la Défense J', () => {
        // La Défense J calcule son diff sur '*.js' '*.html' puis sort si le lot
        // est vide. Placé après, l'anti-cache ne verrait jamais un commit de
        // `styles.css` seul — précisément un des quatre oublis du 25-26 août.
        const posAntiCache = hook.indexOf('verifier-anticache-stage.mjs');
        const posSortieDefenseJ = hook.indexOf('if [ -z "$DIFF" ]');
        expect(posAntiCache, 'appel anti-cache introuvable dans le hook').toBeGreaterThan(-1);
        expect(posSortieDefenseJ, 'sortie anticipée de la Défense J introuvable').toBeGreaterThan(-1);
        expect(posAntiCache).toBeLessThan(posSortieDefenseJ);
    });

    it('fail-open documenté : pas de node, pas de blocage', () => {
        expect(hook).toMatch(/command -v node/);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 27 août 2026
//
// 1. `trouverSuffixesInchanges` rendant toujours `[]`
//    → 3 rouges : « SIGNALE un fichier modifié », « attrape styles.css »,
//      « nomme TOUS les périmés ».
// 2. Comparaison `ancien !== suffixe` au lieu de `===`
//    → 4 rouges : les trois ci-dessus plus « se tait quand le ?v= a changé ».
// 3. Appel du script retiré du hook
//    → 4 rouges : « le hook appelle le script », « une sortie non nulle BLOQUE »,
//      « appelé AVANT la sortie anticipée », « fail-open documenté ».
// 4. Appel déplacé APRÈS `if [ -z "$DIFF" ]`
//    → 1 rouge, et c'est le bon : « appelé AVANT la sortie anticipée ».
// 5. `if ! node ...` remplacé par `node ... || true`
//    → 1 rouge : « une sortie non nulle BLOQUE le commit ».
// 6. Classe du suffixe ramenée à [A-Za-z0-9] (l'état d'avant la mesure)
//    → 2 rouges : « relève les suffixes À POINTS », « SIGNALE une bibliothèque
//      tierce repatchée ».
// ─────────────────────────────────────────────────────────────────────────────
