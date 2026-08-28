import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #575 (lot 4 du plan SOLO) — le PDF remis à l'élève ne porte plus
// l'échelle de Grégoire quand celle de l'enseignant·e ne se résout pas.
//
// CE QUI EXISTAIT AVANT. `synthese-retroaction-data.js` construit le shape
// `Feedback` de la page de synthèse du **PDF de rétroaction remis à l'élève**
// (`travaux-export-pdf.js`, `ajouterPageSynthese`). Sa fonction `lireEchelle`
// relisait `echellesTemplates` à la main et, si elle n'y trouvait rien,
// renvoyait `SCALE_FALLBACK` : l'échelle IDME de Grégoire au complet — codes,
// libellés (« Insuffisant », « Maîtrisé »…), étiquettes SOLO, plages
// (65-74 / 75-84 / 85-100) et couleurs.
//
// ⚠ CE N'ÉTAIT PAS UN CAS DE BORD. Une évaluation produite sous une pratique
// CONFIGURABLE porte `echelleId = 'pratique-<id>'`, et son échelle vit dans
// `pratiquesConfigurables[].config.echelle`, pas dans `echellesTemplates` —
// c'est le défaut A2 de #542, corrigé partout ailleurs par
// `obtenirEchelleResolue`. Ici, l'échelle était donc « introuvable » sur un
// chemin ORDINAIRE, et le repli partait dans un document remis à des élèves.
//
// ⮕ LA RÈGLE APPLIQUÉE EST CELLE DE #527 : sans donnée, on ne rend rien. Pas de
// libellé, pas de plage, pas de couleur inventés. `lireEchelle` renvoie `[]` et
// le rendu masque la légende et la jauge (il lit partout `feedback.scale || []`).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js/synthese-retroaction-data.js'), 'utf8');

// Le corps exécutable seul : une valeur citée dans un commentaire d'explication
// ne doit pas faire rougir la sentinelle — mais un `65` qui REVIENT dans du
// code, si. (Défaut d'assertion mesuré le 27 août sur #549 : un `toContain`
// satisfait par sa propre ligne d'ancrage ne prouve rien.)
const codeSeul = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .map((l) => l.replace(/(^|[^:])\/\/.*$/, '$1'))
    .join('\n');

// Une échelle qui n'a RIEN d'IDME : ni ses codes, ni ses libellés, ni ses bornes.
const ECHELLE_UTILISATEUR = {
    id: 'ECH_WXYZ',
    nom: 'Cotation W-X-Y-Z',
    niveaux: [
        { code: 'W', nom: 'Amorce',      description: 'Unistructurel',   min: 0,  max: 49,  couleur: '#111111' },
        { code: 'X', nom: 'En chemin',   description: 'Multistructurel', min: 50, max: 69,  couleur: '#222222' },
        { code: 'Y', nom: 'Consolidé',   description: 'Relationnel',     min: 70, max: 89,  couleur: '#333333' },
        { code: 'Z', nom: 'Transféré',   description: 'Abstrait étendu', min: 90, max: 100 }  // sans couleur : voulu
    ]
};

let idsDemandes = [];

function chargerAvecEchelle(echelleRendue) {
    idsDemandes = [];
    return chargerScript('js/synthese-retroaction-data.js', {
        db: {
            getSync: (k, d) => (d !== undefined ? d : null),
            get: async () => null, set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'test_' + k,
        obtenirEchelleResolue: (id) => { idsDemandes.push(id); return echelleRendue; },
        obtenirDonneesSelonMode: () => [],
        obtenirTrimestreActif: () => ({ id: 'T1', nom: 'H2026' }),
        obtenirEtudiantsCoursActif: () => [],
        obtenirGroupesCours: () => [],
        travauxStockage: { obtenirAnnotationFichier: () => null },
        travauxOutils: { AUTOCOLLANTS: [] },
        obtenirPreference: () => null
    });
}

function evaluationSur(echelleId, niveau) {
    return {
        id: 'EV1', etudiantDA: '111', grilleId: 'G1',
        echelleId: echelleId,
        niveauFinal: niveau,
        criteres: [{ critereId: 'c1', critereNom: 'Analyse', niveauSelectionne: niveau, ponderation: 50 }]
    };
}

function feedbackAvec(echelleRendue, echelleId, niveau) {
    const win = chargerAvecEchelle(echelleRendue);
    return win.syntheseRetroactionData.construireFeedback(
        evaluationSur(echelleId, niveau), { id: 'F1' }, null);
}

describe('#575 · l\'échelle du PDF de synthèse est celle de l\'utilisateur, ou rien', () => {

    it('échelle non résolue ⇒ AUCUNE échelle, et surtout pas celle de Grégoire', () => {
        const fb = feedbackAvec(null, 'ECH_DISPARUE', 'M');
        expect(fb.scale).toEqual([]);
        // Le cœur du défaut : ces libellés partaient dans un document d'élève.
        expect(JSON.stringify(fb.scale)).not.toMatch(/Insuffisant|Maîtrisé|Étendu|développement/);
    });

    it('échelle non résolue ⇒ le niveau global n\'est pas NOMMÉ pour autant', () => {
        // `construireOverall` cherchait le code dans l'échelle : avec le repli,
        // un « M » ressortait « Maîtrisé », en vert, sur l'échelle d'un autre.
        const fb = feedbackAvec(null, 'ECH_DISPARUE', 'M');
        expect(fb.overall.code).toBe('M');
        expect(fb.overall.label).toBe('');
        expect(fb.overall.color).toBe('#767169');
    });

    it('échelle de l\'utilisateur ⇒ SES codes, SES libellés, SES plages', () => {
        const fb = feedbackAvec(ECHELLE_UTILISATEUR, 'ECH_WXYZ', 'Y');
        expect(fb.scale.map(n => n.code)).toEqual(['W', 'X', 'Y', 'Z']);
        expect(fb.scale.map(n => n.label)).toEqual(['Amorce', 'En chemin', 'Consolidé', 'Transféré']);
        expect(fb.scale[2]).toMatchObject({ min: 70, max: 89, color: '#333333' });
        expect(fb.overall).toMatchObject({ code: 'Y', label: 'Consolidé', color: '#333333' });
    });

    it('un niveau SANS couleur prend la neutre, pas celle du même code IDME', () => {
        // Avant : `normaliserCouleur` cherchait le code dans l'échelle de
        // Grégoire — un « Z » n'y étant pas, il tombait sur la neutre par
        // hasard ; un « M » ou un « E », lui, héritait de son vert ou de son bleu.
        const fb = feedbackAvec(ECHELLE_UTILISATEUR, 'ECH_WXYZ', 'Z');
        expect(fb.scale[3].color).toBe('#767169');
    });

    it('la résolution passe par le chemin unique, avec l\'id de l\'ÉVALUATION', () => {
        // Y compris `pratique-<id>` : c'est le cas qui tombait systématiquement
        // sur le repli, puisque ces échelles ne sont pas dans `echellesTemplates`.
        feedbackAvec(ECHELLE_UTILISATEUR, 'pratique-abc123', 'Y');
        expect(idsDemandes).toContain('pratique-abc123');
    });

    it('le module ne relit plus `echellesTemplates` à la main', () => {
        // Ratchet : c'est cette lecture directe qui rendait « introuvable » toute
        // échelle embarquée dans une pratique configurable.
        expect(codeSeul).not.toMatch(/echellesTemplates/);
    });

    it('`SCALE_FALLBACK` et ses valeurs signature ne reviennent pas', () => {
        expect(codeSeul).not.toMatch(/SCALE_FALLBACK/);
        // ⚠ Les couleurs retenues ici sont celles qui n'appartenaient QU'au repli.
        // `#5fb84a` et `#27b9e0` en faisaient partie aussi, mais elles servent
        // également aux familles de tampons (`FAMILY_COLOR`) : les inscrire ici
        // ferait rougir la sentinelle sur du code sain — une fausse garde, qu'on
        // finirait par désarmer. Mesuré, pas supposé.
        for (const marque of ['Insuffisant', 'En développement', 'Maîtrisé', 'Non recevable',
                              'Préstructurel', 'Unistructurel', 'Multistructurel',
                              '#f08c3a', '#f0c83a', '#b8b8b8']) {
            expect(codeSeul).not.toContain(marque);
        }
    });
});
