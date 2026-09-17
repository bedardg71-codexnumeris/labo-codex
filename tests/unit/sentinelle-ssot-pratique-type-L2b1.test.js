import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// #328 L2-b1/L2-b2 — calcul (11 juin 2026) PUIS affichage et domaine pratiques
// (11 juin 2026, L2-b2) dérivent le type de pratique de la SSOT.
//
// Verrouille :
//  1. `obtenirTypePratiqueActive(contexte)` (pratique-registre.js) : la chaîne
//     groupesCours[].pratiqueId → configuration.type, résolue dans la
//     bibliothèque DU TRIMESTRE DU GROUPE-COURS (absorption #301), copies en
//     dernier recours seulement et JAMAIS sous contexte explicite.
//  2. RATCHET : depuis L2-b2, PLUS AUCUN fichier de js/ ne lit le miroir
//     `modalites/config.pratique` — le balayage couvre tout js/ (plus de
//     liste : le ratchet est au maximum, il ne peut plus que le rester).
//  3. Depuis L2-b2, plus AUCUNE écriture `*.pratique = …` non plus : le champ
//     est purgé des données par purgerLegacy() à chaque boot.

const MOTIF_LECTURE_MIROIR = /\b(modalites|config|mods|modalitesTab|configBeta|m)\.pratique\b/;
const MOTIF_ECRITURE_MIROIR = /\b(modalites|config|mods|modalitesTab|configBeta|m)\.pratique\s*=[^=]/;

function listerFichiersJs(dossier) {
    const resultats = [];
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
        const chemin = path.join(dossier, entree.name);
        if (entree.isDirectory()) resultats.push(...listerFichiersJs(chemin));
        else if (entree.name.endsWith('.js')) resultats.push(chemin);
    }
    return resultats;
}

describe('Sentinelle SSOT · ratchet lecteurs/écrivains du miroir `pratique` (L2-b2, statique)', () => {

    const fichiersJs = listerFichiersJs(path.join(racineProjet, 'js'));

    it('PLUS AUCUN fichier de js/ ne lit le miroir modalites.pratique', () => {
        const fautifs = [];
        for (const fichier of fichiersJs) {
            const lignes = fs.readFileSync(fichier, 'utf8').split('\n');
            lignes.forEach((ligne, i) => {
                const sansCommentaire = ligne.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
                if (MOTIF_LECTURE_MIROIR.test(sansCommentaire)) {
                    fautifs.push(`${path.relative(racineProjet, fichier)}:${i + 1}`);
                }
            });
        }
        expect(
            fautifs,
            'Lecture du miroir modalites.pratique réintroduite — dériver via ' +
            'obtenirTypePratiqueActive() (type) ou obtenirPratiqueActiveGroupeCours() (id) ' +
            '(SSOT, plan PLAN-328-L2 §4 bis D1)'
        ).toEqual([]);
    });

    it('PLUS AUCUNE écriture du miroir modalites.pratique', () => {
        const fautifs = [];
        for (const fichier of fichiersJs) {
            const lignes = fs.readFileSync(fichier, 'utf8').split('\n');
            lignes.forEach((ligne, i) => {
                const sansCommentaire = ligne.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
                if (MOTIF_ECRITURE_MIROIR.test(sansCommentaire)) {
                    fautifs.push(`${path.relative(racineProjet, fichier)}:${i + 1}`);
                }
            });
        }
        expect(
            fautifs,
            'Écriture du miroir modalites.pratique réintroduite — l\'activation passe par ' +
            'la SSOT groupesCours[].pratiqueId (PratiqueManager.changerPratiqueActive)'
        ).toEqual([]);
    });

    it('le champ `pratique` figure dans CHAMPS_MIROIRS_MORTS du module propriétaire', () => {
        const src = fs.readFileSync(path.join(racineProjet, 'js/pratiques/modalites-evaluation.js'), 'utf8');
        expect(src).toMatch(/CHAMPS_MIROIRS_MORTS\s*=\s*\[[^\]]*'pratique'[^\]]*\]/);
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
        calculerPerformance: () => 0, calculerCompletion: () => 0, calculerDetailsCompletion: () => null,   // #871 : exigée par le registre
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
