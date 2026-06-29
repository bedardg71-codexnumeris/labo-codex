import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #310 — la note A/C/P de « Suivi du groupe » (#note-indicateurs) était du HTML
// STATIQUE : impossible d'appeler obtenirTermeProduction() (CSP `script-src 'self'`),
// donc le terme production/artefact y restait FIGÉ, et le texte DUPLIQUAIT mot pour
// mot celui de la Liste des étudiant·es. Option (i) retenue : une SEULE source,
// genererExplicationCalculIndices() (etudiants.js), réutilisée par les deux pages,
// avec terme dynamique + complément optionnel propre à la page Suivi (mention Gauss).
//
// Cette sentinelle verrouille :
//  1. la source est exposée et injectable (window.genererExplicationCalculIndices) ;
//  2. le terme suit la pratique active (artefact ↔ production), aucun terme figé ;
//  3. le complément optionnel est rendu quand il est fourni, absent sinon.

describe('#310 · source consolidée de la note A/C/P (terme dynamique)', () => {
    let win;
    let pratiqueActive;

    function chargerAvecPratique(pratique) {
        pratiqueActive = pratique;
        const db = {
            getSync: (k, d) => (d !== undefined ? d : null),
            get: async () => null,
            set: async () => {},
            setSync: () => {}
        };
        // obtenirTermeProduction réel : on le branche sur la pratique active simulée,
        // exactement comme profil-etudiant-helpers.js le ferait au runtime.
        const obtenirTermeProduction = (ctx = 'singulier') => {
            const m = { singulier: 'artefact', pluriel: 'artefacts' };
            const f = { singulier: 'production', pluriel: 'productions' };
            return (pratiqueActive === 'standards' ? m : f)[ctx] || (pratiqueActive === 'standards' ? 'artefact' : 'production');
        };
        win = chargerScript('js/etudiants.js', {
            db,
            cle: (k) => k,
            obtenirTypePratiqueActive: () => pratiqueActive,
            obtenirTermeProduction
        });
        win.PRATIQUE_DEFAUT = 'standards';
        return win;
    }

    beforeEach(() => {
        chargerAvecPratique('standards');
    });

    it('expose genererExplicationCalculIndices sur window (source partagée)', () => {
        expect(typeof win.genererExplicationCalculIndices).toBe('function');
    });

    it('pratique standards : utilise « artefact(s) », jamais « production »', () => {
        const html = win.genererExplicationCalculIndices();
        expect(html).toContain('PAN-Standards');
        expect(html).toContain('meilleurs artefacts');
        expect(html).toContain('Un artefact devient');
        expect(html).not.toContain('production');
    });

    it('pratique sommative : utilise « production(s) », aucun « artefact » figé', () => {
        chargerAvecPratique('sommative');
        const html = win.genererExplicationCalculIndices();
        expect(html).toContain('Sommative');
        expect(html).toContain('Un production devient'); // terme dynamique (accord = #309)
        expect(html).toContain('8 productions réalisés');
        expect(html).not.toContain('artefact');
    });

    it('terme suit la pratique au moment de l\'appel (cohérence dynamique)', () => {
        const htmlStd = win.genererExplicationCalculIndices();
        expect(htmlStd).toContain('artefact');
        chargerAvecPratique('specifications');
        const htmlAutre = win.genererExplicationCalculIndices();
        expect(htmlAutre).toContain('production');
        expect(htmlAutre).not.toContain('artefact');
    });

    it('complément optionnel : rendu quand fourni (mention Gauss du Suivi), absent sinon', () => {
        const sansComplement = win.genererExplicationCalculIndices();
        expect(sansComplement).not.toContain('mini-courbes de Gauss');

        const complement = '<em>💡 Les mini-courbes de Gauss montrent la distribution du groupe.</em>';
        const avecComplement = win.genererExplicationCalculIndices(complement);
        expect(avecComplement).toContain('mini-courbes de Gauss');
        // Le complément vient APRÈS le tronc A/C/P partagé.
        expect(avecComplement.indexOf('mini-courbes')).toBeGreaterThan(avecComplement.indexOf('A (Assiduité)'));
    });

    it('le tronc A/C/P est identique aux deux pages (un seul texte, pas de duplication)', () => {
        // Sans complément = texte de la Liste des étudiant·es.
        const listeEtudiants = win.genererExplicationCalculIndices();
        // Avec complément = texte du Suivi du groupe : le préfixe (tronc) doit être strictement le même.
        const suiviGroupe = win.genererExplicationCalculIndices('<em>complément Suivi</em>');
        expect(suiviGroupe.startsWith(listeEtudiants)).toBe(true);
    });
});
