import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #328 L2-b1 — le chemin de CALCUL dérive le type de pratique de la SSOT
// (11 juin 2026).
//
// Verrouille :
//  1. `obtenirTypePratiqueActive(contexte)` (pratique-registre.js) : la chaîne
//     groupesCours[].pratiqueId → configuration.type, résolue dans la
//     bibliothèque DU TRIMESTRE DU GROUPE-COURS (absorption #301), copies en
//     dernier recours seulement et JAMAIS sous contexte explicite.
//  2. RATCHET : les fichiers du chemin de calcul migrés ne relisent plus
//     `modalites/config.pratique` (le miroir). Cette liste ne peut que
//     S'ALLONGER (L2-b2 y ajoutera l'affichage) — jamais rétrécir.

const FICHIERS_CALCUL_SANS_MIROIR = [
    'js/indices.js',
    'js/evaluation.js',
    'js/evaluation-chargement.js',
    'js/statistiques.js',
    'js/profil-etudiant-calculs.js',
    'js/profil-etudiant-actions.js',
    'js/profil-etudiant-helpers.js',
    'js/etudiants.js'
];

const MOTIF_LECTURE_MIROIR = /\b(modalites|config|mods|modalitesTab|configBeta)\.pratique\b/;

describe('Sentinelle SSOT · ratchet lecteurs du miroir `pratique` (L2-b1, statique)', () => {

    it('les fichiers du chemin de calcul ne lisent plus le miroir', () => {
        const fautifs = [];
        for (const fichier of FICHIERS_CALCUL_SANS_MIROIR) {
            const lignes = fs.readFileSync(path.join(racineProjet, fichier), 'utf8').split('\n');
            lignes.forEach((ligne, i) => {
                if (MOTIF_LECTURE_MIROIR.test(ligne)) fautifs.push(`${fichier}:${i + 1}`);
            });
        }
        expect(
            fautifs,
            'Lecture du miroir modalites.pratique réintroduite dans le chemin de calcul — ' +
            'dériver via obtenirTypePratiqueActive() (SSOT, plan PLAN-328-L2)'
        ).toEqual([]);
    });

    it('le helper est bien câblé dans chaque fichier migré', () => {
        for (const fichier of FICHIERS_CALCUL_SANS_MIROIR) {
            const src = fs.readFileSync(path.join(racineProjet, fichier), 'utf8');
            const utiliseHelper = src.includes('obtenirTypePratiqueActive')
                || src.includes('obtenirPratiqueActiveGroupeCours');   // sites qui veulent l'ID
            expect(utiliseHelper, `${fichier} : aucun appel au helper SSOT`).toBe(true);
        }
    });

});

describe('obtenirTypePratiqueActive — dérivation SSOT (fonctionnel)', () => {

    let store = {};
    const db = {
        getSync: (k, def) => (k in store ? store[k] : (def !== undefined ? def : null)),
        setSync: (k, v) => { store[k] = v; }
    };
    const cle = (k) => 'actif_' + k;

    const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    win.obtenirTrimestreId = () => 'actif';

    // Instance minimale conforme au contrat IPratique pour peupler le registre
    // (les ids canoniques du registre SONT des types).
    const fauxIPratique = (id) => ({
        obtenirNom: () => id, obtenirId: () => id, obtenirDescription: () => '',
        calculerPerformance: () => 0, calculerCompletion: () => 0,
        detecterDefis: () => [], identifierPattern: () => null,
        genererCibleIntervention: () => null
    });
    win.enregistrerPratique('sommative', fauxIPratique('sommative'));

    beforeEach(() => { store = {}; });

    it('GC actif → configurable de SON trimestre → type normalisé', () => {
        store['groupeCoursActif'] = { id: 'GC1', trimestreId: 'actif' };
        store['actif_groupesCours'] = [{ id: 'GC1', pratiqueId: 'p-std' }];
        store['actif_pratiquesConfigurables'] = [{ id: 'p-std', configuration: { type: 'pan-standards' } }];
        // 'pan-standards' (legacy) normalisé → 'standards'
        expect(win.obtenirTypePratiqueActive()).toBe('standards');
    });

    it('id canonique du registre → type direct, sans passer par les configurables', () => {
        store['groupeCoursActif'] = { id: 'GC1', trimestreId: 'actif' };
        store['actif_groupesCours'] = [{ id: 'GC1', pratiqueId: 'sommative' }];
        expect(win.obtenirTypePratiqueActive()).toBe('sommative');
    });

    it('#301 · contexte explicite → bibliothèque du trimestre CONSULTÉ, pas de l\'actif', () => {
        // Trimestre archivé a2025 : sa propre biblio, son propre GC.
        store['a2025_groupesCours'] = [{ id: 'GC_ARCH', pratiqueId: 'p-arch' }];
        store['a2025_pratiquesConfigurables'] = [{ id: 'p-arch', configuration: { type: 'specifications' } }];
        // La biblio du trimestre ACTIF contient un homonyme de type différent :
        // il ne doit JAMAIS être consulté.
        store['actif_pratiquesConfigurables'] = [{ id: 'p-arch', configuration: { type: 'standards' } }];
        expect(win.obtenirTypePratiqueActive({ gcId: 'GC_ARCH', trimestreId: 'a2025' }))
            .toBe('specifications');
    });

    it('désync copie/SSOT → la SSOT gagne', () => {
        store['groupeCoursActif'] = { id: 'GC1', trimestreId: 'actif', pratiqueId: 'p-copie' };
        store['actif_groupesCours'] = [{ id: 'GC1', pratiqueId: 'sommative' }];
        store['actif_pratiquesConfigurables'] = [{ id: 'p-copie', configuration: { type: 'denotation' } }];
        expect(win.obtenirTypePratiqueActive()).toBe('sommative');
    });

    it('GC introuvable dans la SSOT → copie en dernier recours, SAUF sous contexte explicite', () => {
        store['groupeCoursActif'] = { id: 'GC_FANTOME', trimestreId: 'actif', pratiqueId: 'sommative' };
        store['actif_groupesCours'] = [{ id: 'GC1', pratiqueId: 'p-std' }];
        expect(win.obtenirTypePratiqueActive()).toBe('sommative');           // copie tolérée
        expect(win.obtenirTypePratiqueActive({ gcId: 'GC_FANTOME', trimestreId: 'actif' }))
            .toBe(null);                                                      // jamais sous contexte
    });

    it('rien d\'actif / pratique introuvable en biblio → null (défaut = choix de l\'appelant)', () => {
        expect(win.obtenirTypePratiqueActive()).toBe(null);
        store['groupeCoursActif'] = { id: 'GC1', trimestreId: 'actif' };
        store['actif_groupesCours'] = [{ id: 'GC1', pratiqueId: 'p-supprimee' }];
        expect(win.obtenirTypePratiqueActive()).toBe(null);
    });

});
