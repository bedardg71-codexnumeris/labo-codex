import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — 23 AOÛT 2026 · LE BON NUMÉRO DE VERSION SUR L'ANCIENNE APP.
//
// L'INCIDENT, mesuré sur l'iPad de Grégoire. Le bas de page annonçait
// « 1.92.0 · build 0823-1013 » — la version fraîchement déployée — et l'écran
// affichait l'ANCIEN bandeau de doublons, consigne fausse comprise. Les deux
// à la fois, sur le même appareil, à la même minute.
//
// LA CAUSE. `scripts/release.mjs` détectait les fichiers à bumper avec
// `git status --porcelain`, c'est-à-dire l'ARBRE DE TRAVAIL seul. Le chantier
// #291/#476 avait été COMMITÉ avant de lancer la release : `git status` ne
// voyait plus rien, et seuls `init-inline.js` et `main.js` (toujours inclus,
// car réécrits par le script) ont reçu un nouveau `?v=`.
//
// Or ce sont précisément les deux fichiers qui AFFICHENT le numéro de version.
// Tous les autres — `bibliotheque-ui.js`, les cinq familles, `styles.css` —
// gardaient leur ancienne URL, donc leur ancien contenu en cache Safari.
//
// ▣ POURQUOI C'EST LE PIRE DES SYMPTÔMES, et pas une gêne d'affichage : la
// porte terrain vérifie le numéro de version AVANT tout le reste (§0.2),
// précisément pour écarter le « build en retard ». Ici ce contrôle passait au
// vert sur une app périmée. La porte aurait éprouvé l'état d'AVANT en croyant
// éprouver l'après — et tout relevé en serait sorti faux.
//
// L'INVARIANT VERROUILLÉ ICI : tout fichier `js/` ou `.css` référencé par
// index.html et modifié depuis la release précédente doit porter un `?v=`
// daté du build courant. Sinon le navigateur sert l'ancien.
//
// BREAK-TEST (fait le 23 août 2026) — remettre `js/bibliotheque-ui.js?v=`
// à `20260821a` dans index.html → le test rougit en nommant le fichier.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

const indexHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const version = JSON.parse(readFileSync(path.join(racineProjet, 'version.json'), 'utf8'));

/** `?v=` porté par un fichier dans index.html, ou null s'il n'y est pas référencé. */
function paramCache(relatif) {
    const motif = new RegExp(relatif.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\?v=([A-Za-z0-9]+)');
    const m = motif.exec(indexHtml);
    return m ? m[1] : null;
}

function git(args) {
    return execFileSync('git', args, {
        cwd: racineProjet, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
}

/**
 * Fichiers js/css modifiés depuis la release PRÉCÉDENTE.
 *
 * Le repère est l'avant-dernier commit qui a touché `version.json` : le
 * dernier est la release courante elle-même, celle qu'on est en train de
 * vérifier. Prendre le dernier rendrait un ensemble vide — un test qui passe
 * toujours, donc un test qui ne dit rien.
 */
function fichiersDepuisReleasePrecedente() {
    const commits = git(['log', '-3', '--format=%H', '--', 'version.json'])
        .split('\n').map((l) => l.trim()).filter(Boolean);
    if (commits.length < 2) return null;   // dépôt trop jeune : rien à comparer
    return git(['diff', '--name-only', commits[1], 'HEAD', '--', 'js', 'styles.css', 'css'])
        .split('\n').map((l) => l.trim())
        .filter((f) => (f.endsWith('.js') || f.endsWith('.css')) && !f.includes('_archives/'));
}

describe('anti-cache · un fichier modifié ne peut pas être servi sous son ancienne URL', () => {
    it('la date du build est cohérente avec version.json', () => {
        // `?v=` vaut AAAAMMJJ + suffixe ; `build` vaut MMJJ-HHMM.
        expect(version.build, 'version.json doit porter un build MMJJ-HHMM').toMatch(/^\d{4}-\d{4}$/);
    });

    it('tout fichier modifié depuis la release précédente porte un ?v= du jour du build', () => {
        const modifies = fichiersDepuisReleasePrecedente();
        if (modifies === null) return;   // dépôt sans deux releases : rien à prouver

        const mmjjBuild = version.build.slice(0, 4);
        const perimes = [];

        for (const relatif of modifies) {
            const param = paramCache(relatif);
            // Un fichier non référencé dans index.html (chargé autrement, ou
            // nouveau et pas encore branché) n'est pas concerné.
            if (param === null) continue;
            const mmjjParam = param.slice(4, 8);   // AAAAMMJJ → MMJJ
            if (mmjjParam !== mmjjBuild) {
                perimes.push(`${relatif} : ?v=${param} (build ${version.build})`);
            }
        }

        expect(
            perimes,
            'Ces fichiers ont changé mais gardent leur ancienne URL : le navigateur servira\n' +
            'leur version PÉRIMÉE, pendant que le bas de page annoncera la version neuve.\n' +
            'C\'est l\'incident du 23 août — relancer `node scripts/release.mjs --build-only`.\n  ' +
            perimes.join('\n  ')
        ).toEqual([]);
    });

    it('release.mjs ne se fie plus au seul arbre de travail', () => {
        // La régression serait de revenir à `git status` seul : le script
        // redeviendrait aveugle à un chantier déjà commité, sans rien dire.
        const src = readFileSync(path.join(racineProjet, 'scripts', 'release.mjs'), 'utf8');
        expect(src, 'release.mjs doit comparer à la release précédente, pas seulement à l\'arbre de travail')
            .toMatch(/--format=%H'?\s*,\s*'--'\s*,\s*'version\.json'/);
        expect(src).toMatch(/diff'?\s*,\s*'--name-only'/);
    });
});
