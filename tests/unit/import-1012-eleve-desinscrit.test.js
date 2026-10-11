import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// #1012, l'élève désinscrit (décision de Grégoire, 2 oct. 2026, vers 11 h 26 et 11 h 31) — UN ÉLÈVE
// SUPPRIMÉ NE REVIENT PLUS PAR UN ANCIEN FICHIER.
//
// Ici : les règles pures (`dasElevesEcartes`, `ecarterElevesDesinscrits`) et deux verrous de structure
// (seul « Supprimer » écrit la trace ; l'import l'applique aux cinq familles avant la fusion). Le geste
// entier est jugé au navigateur : tests/integration/codex-1012-ancien-zip-par-la-case.spec.js, (5) et (6).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceImport = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');
const sourceEtudiants = readFileSync(path.join(racineProjet, 'js', 'trimestre-v2-etudiants.js'), 'utf8');

let ecartes, ecarter;
beforeEach(() => {
    const w = chargerScript('js/import-export.js', {});
    ecartes = w.dasElevesEcartes;
    ecarter = w.ecarterElevesDesinscrits;
});

describe('#1012 — les élèves écartés : la trace, moins la liste', () => {
    it('un DA de la trace absent de la liste est écarté', () => {
        expect([...ecartes([{ da: '3', date: 'd' }], [{ da: '1' }])]).toEqual(['3']);
    });

    it('un DA de la trace ajouté de nouveau à la liste n\'est plus écarté', () => {
        expect([...ecartes([{ da: '3', date: 'd' }], [{ da: '1' }, { da: '3' }])]).toEqual([]);
    });

    it('le DA se compare en texte (un DA numérique dans la liste ou la trace)', () => {
        expect([...ecartes([{ da: 3 }], [{ da: '3' }])]).toEqual([]);
        expect([...ecartes([{ da: 3 }], [])]).toEqual(['3']);
    });

    it('sans trace, ou une trace illisible : personne n\'est écarté', () => {
        expect(ecartes(null, []).size).toBe(0);
        expect(ecartes({ da: '3' }, []).size).toBe(0);
        expect(ecartes([null, { date: 'd' }], []).size).toBe(0);
    });
});

describe('#1012 — ce qui est écarté, famille par famille', () => {
    const E = new Set(['3']);

    it('étudiants (da), présences (da), notes (etudiantDA), copies (etudiantDA)', () => {
        expect(ecarter([{ da: '3' }, { da: '2' }], 'etudiants', E)).toEqual([{ da: '2' }]);
        expect(ecarter([{ date: 'd', da: '3' }, { date: 'd', da: '2' }], 'presences', E)).toEqual([{ date: 'd', da: '2' }]);
        expect(ecarter([{ id: 'a', etudiantDA: '3' }, { id: 'b', etudiantDA: '2' }], 'notes', E)).toEqual([{ id: 'b', etudiantDA: '2' }]);
        expect(ecarter([{ id: 'FT_3', etudiantDA: '3' }, { id: 'FT_2', etudiantDA: '2' }], 'copies', E)).toEqual([{ id: 'FT_2', etudiantDA: '2' }]);
    });

    it('annotations : par le DA, ou, sans DA, par la copie annotée', () => {
        const liste = [
            { id: 'A1', fichierId: 'FT_3' },
            { id: 'A2', fichierId: 'FT_X', etudiantDA: '3' },
            { id: 'A3', fichierId: 'FT_2', etudiantDA: '2' },
            { id: 'A4', fichierId: 'FT_2' }
        ];
        expect(ecarter(liste, 'annotations', E, new Set(['FT_3'])).map((a) => a.id)).toEqual(['A3', 'A4']);
    });

    it('personne d\'écarté, ou une valeur qui n\'est pas une liste : rendue telle quelle', () => {
        const liste = [{ da: '3' }];
        expect(ecarter(liste, 'etudiants', new Set())).toBe(liste);
        const dico = { '3': { note: 1 } };
        expect(ecarter(dico, 'notes', E)).toBe(dico);
    });

    it('une famille inconnue lève', () => {
        expect(() => ecarter([], 'grilles', E)).toThrow('Famille inconnue');
    });
});

describe('#1012 — verrous de structure', () => {
    it('l\'import écarte les cinq familles, AVANT leur fusion', () => {
        const fonction = tranche(sourceImport, 'async function executerImportSelectif(', '// Synchroniser le cache après tous les imports');
        const familles = [...fonction.matchAll(/ecarterElevesDesinscrits\(\w+, '(\w+)'/g)].map((m) => m[1]);
        expect(familles).toEqual(['etudiants', 'presences', 'notes', 'copies', 'annotations']);
        // #522 lot 7 (11 oct. 2026) : la fusion se fait dans la file de la clé, sur la valeur lue (`lus`).
        for (const [ecart, fusion] of [
            ["ecarterElevesDesinscrits(etudiants, 'etudiants'", 'fusionnerDonneesPersoImportees(lus, etudiants,'],
            ["ecarterElevesDesinscrits(presences, 'presences'", 'fusionnerDonneesPersoImportees(lus, presences,'],
            ["ecarterElevesDesinscrits(data, 'notes'", 'fusionnerDonneesPersoImportees(lus, data,'],
            ["ecarterElevesDesinscrits(fichiersTravaux, 'copies'", '_ajouterCopiesImportees(listesCopies'],
            ["ecarterElevesDesinscrits(annotations, 'annotations'", 'fusionnerDonneesPersoImportees(lus, annotations,']
        ]) {
            expect(fonction.indexOf(ecart), ecart).toBeGreaterThan(-1);
            expect(fonction.indexOf(ecart), ecart).toBeLessThan(fonction.indexOf(fusion));
        }
    });

    it('seul « Supprimer » écrit la trace : ni le changement de statut, ni rien d\'autre du module', () => {
        const ecrivains = sourceEtudiants.split(/\n(?=(?:async )?function )/).filter((f) => f.includes("cle('elevesDesinscrits')"));
        expect(ecrivains.map((f) => f.match(/function (\w+)/)[1])).toEqual(['supprimerEtudiantV2']);
        const supprimer = tranche(sourceEtudiants, 'async function supprimerEtudiantV2(', 'function actionEtudiantV2(');
        // La trace suit le retrait de la fiche, et seulement s'il a eu lieu.
        expect(supprimer.indexOf("cle('elevesDesinscrits')")).toBeGreaterThan(supprimer.indexOf('liste.splice(i, 1)'));
        expect(supprimer).toMatch(/if \(supprime\) \{\s*try \{\s*await modifierEtAnnoncer\(cle\('elevesDesinscrits'\)/);
    });
});
