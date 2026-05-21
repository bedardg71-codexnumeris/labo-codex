import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineJs = path.resolve(__dirname, '..', '..', 'js');

// Sentinelle chantier F Cat-B (21 mai 2026) — découplage travaux-ui ↔ pivot
// `window.evaluationEnCours`. Avant le découplage, travaux-ui.js réassignait
// (L4639) + mutait (L4387-4390, L4660, L4669, L4684) le pivot — soit 8 sites
// d'écriture cross-module. PLAN-CAT-B-POST-MERGE.md §2 chantier F a tranché
// pour l'option (b) avec Grégoire le 21 mai PM : encapsuler via l'API
// `evaluation.demarrerEvaluationDepuisFichier(fichier, opts)` exportée par
// evaluation-chargement.js, et empêcher toute réassignation/mutation future
// du pivot hors du domaine evaluation*.js.
//
// La sentinelle grep statique le contenu de tous les js/*.js et vérifie que
// les écritures du pivot n'apparaissent que dans la whitelist ci-dessous.
// Si une nouvelle écriture apparaît dans un module hors whitelist, le test
// échoue et bloque la régression.

const WHITELIST = new Set([
    // Déclaration formelle (`let evaluationEnCours = null`)
    'config.js',
    // Domaine propriétaire — modules issus du refactor evaluation (18-21 mai)
    'evaluation.js',
    'evaluation-chargement.js',
    'evaluation-calcul.js',
    'evaluation-sauvegarde.js',
    'evaluation-jetons.js',
    'evaluation-retroaction.js',
    'evaluation-handlers.js'
]);

// Pattern : capture `evaluationEnCours = ...` (réassignation) ou
// `evaluationEnCours.X = ...` (mutation). Exclut explicitement `==` et `===`.
const RE_ECRITURE = /\bevaluationEnCours(\.\w+)?\s*=(?!=)/;

function listerFichiersJs() {
    return readdirSync(racineJs)
        .filter(nom => nom.endsWith('.js'))
        .sort();
}

function nettoyer(ligne) {
    // Retirer commentaires JS // ... et /* ... */ sur la ligne, pour ne pas
    // matcher des références dans la doc.
    return ligne
        .replace(/\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '')
        .replace(/\/\/.*$/, '');
}

function trouverEcrituresDansFichier(cheminAbs) {
    const contenu = readFileSync(cheminAbs, 'utf8');
    const lignes = contenu.split('\n');
    const matches = [];
    let dansCommentaireBloc = false;

    for (let i = 0; i < lignes.length; i++) {
        let ligne = lignes[i];

        // Gestion sommaire des commentaires de bloc multi-lignes
        if (dansCommentaireBloc) {
            const finComm = ligne.indexOf('*/');
            if (finComm === -1) continue;
            ligne = ligne.slice(finComm + 2);
            dansCommentaireBloc = false;
        }
        const debutComm = ligne.indexOf('/*');
        const finComm = ligne.indexOf('*/');
        if (debutComm !== -1 && (finComm === -1 || finComm < debutComm)) {
            ligne = ligne.slice(0, debutComm);
            dansCommentaireBloc = true;
        }

        const ligneSansCommentaire = nettoyer(ligne).trim();
        if (!ligneSansCommentaire) continue;
        if (ligneSansCommentaire.startsWith('*')) continue; // ligne JSDoc dans bloc

        if (RE_ECRITURE.test(ligneSansCommentaire)) {
            matches.push({ ligne: i + 1, contenu: ligneSansCommentaire });
        }
    }
    return matches;
}

describe('Sentinelle · window.evaluationEnCours · écritures cross-module interdites', () => {
    it('aucune réassignation/mutation du pivot hors whitelist evaluation*.js + config.js', () => {
        const fichiers = listerFichiersJs();
        const violations = [];

        for (const nom of fichiers) {
            if (WHITELIST.has(nom)) continue;
            const cheminAbs = path.join(racineJs, nom);
            const matches = trouverEcrituresDansFichier(cheminAbs);
            if (matches.length > 0) {
                violations.push({ fichier: nom, matches });
            }
        }

        if (violations.length > 0) {
            const detail = violations.map(v =>
                `\n  ${v.fichier} (${v.matches.length} site${v.matches.length > 1 ? 's' : ''}) :\n` +
                v.matches.map(m => `    L${m.ligne} : ${m.contenu}`).join('\n')
            ).join('');
            throw new Error(
                `Écritures interdites du pivot window.evaluationEnCours hors whitelist :${detail}\n\n` +
                `Pour amorcer/réinitialiser le pivot depuis un module externe, utiliser :\n` +
                `  window.demarrerEvaluationDepuisFichier(fichier, opts)\n` +
                `exportée par js/evaluation-chargement.js (chantier F Cat-B, 21 mai 2026).\n` +
                `Si une nouvelle écriture est légitime, l'ajouter à la WHITELIST du test.`
            );
        }

        expect(violations).toHaveLength(0);
    });

    it('l\'API evaluation.demarrerEvaluationDepuisFichier est bien exportée par evaluation-chargement.js', () => {
        const cheminChargement = path.join(racineJs, 'evaluation-chargement.js');
        const contenu = readFileSync(cheminChargement, 'utf8');
        expect(contenu).toMatch(/window\.demarrerEvaluationDepuisFichier\s*=\s*demarrerEvaluationDepuisFichier/);
        expect(contenu).toMatch(/function demarrerEvaluationDepuisFichier\s*\(/);
    });

    it('travaux-ui.js n\'écrit plus le pivot (régression chantier F)', () => {
        const cheminTravaux = path.join(racineJs, 'travaux-ui.js');
        const matches = trouverEcrituresDansFichier(cheminTravaux);
        if (matches.length > 0) {
            const detail = matches.map(m => `  L${m.ligne} : ${m.contenu}`).join('\n');
            throw new Error(
                `travaux-ui.js contient à nouveau des écritures du pivot evaluationEnCours :\n${detail}\n\n` +
                `Ces écritures ont été migrées vers evaluation.demarrerEvaluationDepuisFichier le 21 mai 2026.\n` +
                `Toute nouvelle écriture doit passer par l'API.`
            );
        }
        expect(matches).toHaveLength(0);
    });
});
