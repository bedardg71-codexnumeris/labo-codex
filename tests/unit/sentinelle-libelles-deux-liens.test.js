import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE — les libellés des deux liens vers la carte, validés par Grégoire
// MOT POUR MOT le 9 nov. 2026 (10 h 19 à 10 h 21, en Cowork, recommandation 9).
//
// Ce qu'elle garde : qu'aucun de ces mots ne dérive en silence. Ils vivent dans
// une seule table (`LIBELLES_DEUX_LIENS`, planification-carte.js) ; chaque
// écran la lit au lieu de recopier la chaîne. La table est donc comparée ici,
// puis chaque consommateur est vérifié : il LIT la table (pas de copie à côté).
//
// ⚠ L'apostrophe est la typographique (’), celle des textes de la carte
// (guide, infobulles) : c'est une forme, pas un mot. Les guillemets français
// sont suivis et précédés d'une espace, comme dans l'Inspecteur (« Leçon « … » »).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js/planification-carte.js'), 'utf8');
const sourceProductions = readFileSync(path.join(racine, 'js/productions.js'), 'utf8');

const ATTENDUS = {
    reprendreObjectif: 'Reprendre l’objectif d’une production',
    modifierDansProduction: 'Modifier dans la production',
    delier: 'Délier',
    relier: 'Relier',
    modifierDansFiche: 'Modifier dans la fiche du cours',
    relierAFiche: 'Relier à la fiche du cours'
};

function monter() {
    const win = chargerScript('js/planification-carte.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t == null ? '' : t)
    });
    return win.planificationCarte;
}

describe('Sentinelle · libellés des deux liens (validés le 9 nov. 2026)', () => {
    const api = monter();

    it('la table porte les mots validés, exactement', () => {
        expect(api.LIBELLES_DEUX_LIENS).toEqual(ATTENDUS);
    });

    it('la mention de la fiche de production : « Repris dans la carte : leçon « … », semaine N »', () => {
        expect(api.texteRepriseObjectif('Le sonnet', 3)).toBe('Repris dans la carte : leçon « Le sonnet », semaine 3');
    });

    it('aucune copie à côté de la table : chaque libellé n’est écrit qu’une fois dans la carte', () => {
        Object.keys(ATTENDUS).forEach((cle) => {
            if (cle === 'delier' || cle === 'relier') return;   // mots courts, présents ailleurs dans les commentaires
            const occurrences = sourceCarte.split(ATTENDUS[cle]).length - 1;
            expect(occurrences, cle).toBe(1);
        });
    });

    // Guide de la carte, page « Commence par le pourquoi » : phrase validée par Grégoire le 9 nov. 2026
    // (13 h 45 à 13 h 47), mot pour mot. Même normalisation que sentinelle-guide-carte-966 : balises
    // retirées, apostrophe courbe → droite, espace insécable → espace (la typographie du guide).
    it('le guide de la carte porte la phrase validée, et plus l’ancienne', () => {
        const normaliser = (t) => t.replace(/<\/(p|li|div|span)>/g, ' ').replace(/<[^>]+>/g, '')
            .replace(/[’]/g, "'").replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
        const page = api.GUIDE_PAGES.find((p) => p.id === 'competence');
        const texte = normaliser(page.contenu);
        expect(texte).toContain("Si la fiche de ton cours (Cadre › Trimestre) porte la compétence, le bloc la reprend ; "
            + "sinon, double-clique dessus pour écrire l'énoncé, ou écris-le dans la fiche.");
        expect(texte).not.toContain("Double-clique dessus pour écrire l'énoncé de compétence.");
    });

    it('la fiche de production affiche la mention par la carte, sans recopier la phrase', () => {
        expect(sourceProductions).toMatch(/lignesReprisesObjectif\(/);
        expect(sourceProductions).not.toMatch(/Repris dans la carte/);
    });
});
