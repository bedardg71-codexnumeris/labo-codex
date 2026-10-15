/**
 * SENTINELLE #489 — LE VERROU D'UNE PRODUCTION ENTIÈRE EST RETIRÉ, ET NE REVIENT PAS
 * EN SILENCE. LE VERROU D'UNE COPIE, LUI, RESTE.
 *
 * Décision de Grégoire, 15 oct. 2026 à 10 h 51 (`DECISIONS-2026-10-15-groupe-2.md`,
 * question 1) : le verrou d'une production ne se posait nulle part et ne bloquait
 * rien. Sont retirés : `verrouillerEvaluation` (productions.js, protégée par
 * noms_stables.json, autorisation donnée dans le même « oui »), les deux verrous
 * individuels d'evaluation.js, et la Banque d'évaluations entière (sa modale
 * n'existait plus dans index.html) avec son cadenas, ses jetons, sa suppression
 * et le verrouillage en lot — tous sans appelant vivant, remesuré le 15 oct.
 *
 * ⮕ CE QUI RESTE, ET C'EST VOULU : le champ `verrouille` déjà écrit dans les
 *   productions existantes (source, pas stock : il n'est pas réécrit), et sa
 *   déclaration dans les schémas d'échange — un fichier déjà exporté doit rester
 *   lisible. Les créateurs cessent de l'ÉCRIRE ; plus rien ne le LIT.
 *
 * ⚠ Ne pas confondre avec le `verrouille` des critères de grille (grilles.js),
 *   des cartouches (#864) et des présences, ni avec le `verrouillee` (deux e)
 *   d'une évaluation — le cadenas d'une copie — qui vit.
 *
 * BREAK-TESTS attendus : remettre `window.verrouillerEvaluation = …` → A rougit ;
 * remettre `productionData.verrouille = false;` → B rougit ; retirer le
 * `data-action` du bouton « Verrouiller l'évaluation » → C rougit.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const FICHIERS_JS = readdirSync(path.join(racine, 'js'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => 'js/' + f);

const SYMBOLES_RETIRES = [
    'verrouillerEvaluation',
    'verrouillerEvaluationIndividuelle',
    'deverrouillerEvaluationIndividuelle',
    'basculerVerrouillageEvaluation',
    'verrouillerToutesEvaluations',
    'ouvrirBanqueEvaluations',
    'fermerBanqueEvaluations',
    'chargerFiltresBanqueEvaluations',
    'filtrerBanqueEvaluations',
    'afficherListeBanqueEvaluations',
    'chargerEvaluationDepuisBanque',
    'appliquerJetonRepriseDepuisBanque',
    'appliquerJetonRepriseDepuisSidebar',
    'supprimerEvaluationBanque',
    'retirerJeton',
    'ouvrirBanqueAvecRecherche',
    'modalBanqueEvaluations'
];

/** Le code, commentaires écartés : un commentaire d'historique peut nommer un retrait. */
function code(f) {
    return lire(f)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:\\])\/\/.*$/gm, '$1');
}

/** Occurrence d'un identifiant entier (`retirerJeton` ne doit pas attraper `retirerJetonDepuisSidebar`). */
const motEntier = (s) => new RegExp('(^|[^\\w$])' + s + '(?![\\w$])');

describe('#489 · A — les symboles retirés ne reviennent pas', () => {
    it('aucun, dans le code de js/, ni dans index.html, ni dans noms_stables.json', () => {
        const sites = [];
        for (const f of FICHIERS_JS) {
            const src = code(f);
            for (const s of SYMBOLES_RETIRES) if (motEntier(s).test(src)) sites.push(`${f} : ${s}`);
        }
        for (const f of ['index.html', 'noms_stables.json']) {
            const src = lire(f);
            for (const s of SYMBOLES_RETIRES) if (motEntier(s).test(src)) sites.push(`${f} : ${s}`);
        }
        expect(sites, 'symbole retiré par #489 réapparu :\n  ' + sites.join('\n  ')).toEqual([]);
    });
});

describe('#489 · B — le drapeau `verrouille` d\'une production n\'est plus ni écrit ni lu', () => {
    // Un accès, lecture ou écriture, ou un littéral `verrouille:` posé par un créateur.
    const ACCES = /\.verrouille\b|\[\s*['"]verrouille['"]\s*\]|\bverrouille\s*:/;

    for (const f of ['js/productions.js', 'js/productions-liste.js']) {
        it(`${f} : aucun accès ni littéral`, () => {
            const vues = code(f).split('\n')
                .map((l, i) => [i + 1, l])
                // `delete copie.verrouille` RETIRE le champ : c'est le geste voulu (voir plus bas).
                .filter(([, l]) => ACCES.test(l) && !/delete\s+[\w.]+\.verrouille\b/.test(l))
                .map(([n, l]) => `${f}:${n}: ${l.trim()}`);
            expect(vues, 'le verrou d\'une production est retiré (#489) :\n  ' + vues.join('\n  ')).toEqual([]);
        });
    }

    it('la copie depuis la bibliothèque ne porte pas le champ de sa source', () => {
        expect(code('js/productions-liste.js')).toMatch(/delete copie\.verrouille;/);
    });

    it('témoin : les schémas d\'échange tolèrent encore le champ (ce qui voyage)', () => {
        // Sans ce témoin, un retrait trop large rendrait illisible un fichier déjà exporté.
        expect(lire('js/import-export.js')).toMatch(/verrouille:\s*\{\s*type:/);
        expect(lire('js/partage-schemas.js')).toMatch(/verrouille:\s*\{\s*type:/);
    });
});

describe('#489 · C — le verrou d\'une copie reste branché', () => {
    it('« Verrouiller l\'évaluation » appelle la porte unique, définie et exportée', () => {
        expect(lire('index.html')).toMatch(
            /id="btnVerrouillerEvaluation"[^>]*data-action="basculerVerrouillageEvaluationCourante"/
        );
        const ev = code('js/evaluation.js');
        expect(ev).toMatch(/function basculerVerrouillageEvaluationCourante\(\)/);
        expect(ev).toMatch(/window\.basculerVerrouillageEvaluationCourante = basculerVerrouillageEvaluationCourante;/);
    });

    it('le cadenas de la palette (travaux-ui.js) passe par la même porte', () => {
        expect(code('js/travaux-ui.js')).toMatch(/basculerVerrouillageEvaluationCourante\(\)/);
    });
});
