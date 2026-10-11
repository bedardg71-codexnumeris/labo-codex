import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// #1012, les quatre cases (consigne de Cowork du 2 oct. 2026, 10 h 33) — « ÉTUDIANTS », « PRÉSENCES »,
// « NOTES » ET « ANNOTATIONS » DE L'IMPORT PAR CASES S'AJOUTENT À CE QUE L'ESPACE A.
//
// Mesuré par le geste avant le lot : chacune remplaçait la valeur de l'espace par celle du fichier.
// Ici : la règle pure (`fusionnerDonneesPersoImportees`) et le verrou de structure. Le geste entier
// est jugé au navigateur : tests/integration/codex-1012-ancien-zip-par-la-case.spec.js, (3) et (4).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceImport = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');

let fusionner;
beforeEach(() => { fusionner = chargerScript('js/import-export.js', {}).fusionnerDonneesPersoImportees; });

describe('#1012 — étudiants : le DA', () => {
    it('un DA déjà là : la fiche de l\'espace reste telle quelle ; un DA absent entre à la suite', () => {
        const espace = [{ da: '1', prenom: 'Alix' }, { da: '3', prenom: 'Camille' }];
        const r = fusionner(espace, [{ da: '1', prenom: 'Autre' }, { da: '2', prenom: 'Bao' }], 'etudiants');
        expect(r).toEqual({ valeur: [...espace, { da: '2', prenom: 'Bao' }], ecrire: true, entrees: 1 });
    });

    it('rien de neuf : rien à écrire, et l\'espace rendu tel quel', () => {
        const espace = [{ da: '1' }];
        expect(fusionner(espace, [{ da: '1', prenom: 'x' }], 'etudiants')).toEqual({ valeur: espace, ecrire: false, entrees: 0 });
    });

    it('l\'espace sans clé : le fichier entre en entier', () => {
        expect(fusionner(null, [{ da: '1' }, { da: '2' }], 'etudiants')).toEqual({ valeur: [{ da: '1' }, { da: '2' }], ecrire: true, entrees: 2 });
    });

    it('une fiche sans DA se reconnaît à son contenu entier : le même fichier rouvert ne la double pas', () => {
        const sansDa = { nom: 'Fictif', prenom: 'Sans DA' };
        const r1 = fusionner([], [sansDa], 'etudiants');
        expect(fusionner(r1.valeur, [sansDa], 'etudiants').entrees).toBe(0);
    });
});

describe('#1012 — présences : date, DA, cours (cours absent = même cours)', () => {
    const fiche = (date, da, coursId, plus = {}) => ({ date, da, ...(coursId ? { coursId } : {}), periodesPresentes: 2, ...plus });

    it('même date, même DA, même cours : celle de l\'espace reste', () => {
        const espace = [fiche('2031-09-02', '1', 'C', { notes: 'espace' })];
        expect(fusionner(espace, [fiche('2031-09-02', '1', 'C', { notes: 'fichier' })], 'presences').entrees).toBe(0);
    });

    it('le cours absent d\'un côté ou de l\'autre : la même fiche', () => {
        expect(fusionner([fiche('d', '1', 'C')], [fiche('d', '1', null)], 'presences').entrees).toBe(0);
        expect(fusionner([fiche('d', '1', null)], [fiche('d', '1', 'C')], 'presences').entrees).toBe(0);
        expect(fusionner([fiche('d', '1', null)], [fiche('d', '1', null)], 'presences').entrees).toBe(0);
    });

    it('un autre cours, une autre date ou un autre DA : la fiche entre', () => {
        const espace = [fiche('d', '1', 'C')];
        const r = fusionner(espace, [fiche('d', '1', 'D'), fiche('e', '1', 'C'), fiche('d', '2', 'C')], 'presences');
        expect(r.entrees).toBe(3);
        expect(r.valeur.slice(0, 1)).toEqual(espace);
    });

    it('l\'ancien format (un dictionnaire par date) : écrit seulement si l\'espace n\'a rien', () => {
        const dico = { '2031-09-02': { 1: { statut: 'present' } } };
        expect(fusionner([fiche('d', '1', 'C')], dico, 'presences')).toEqual({ valeur: [fiche('d', '1', 'C')], ecrire: false, entrees: 0 });
        expect(fusionner([], dico, 'presences')).toEqual({ valeur: dico, ecrire: true, entrees: 1 });
    });

    it('l\'espace dans l\'ancien format et non vide : l\'espace l\'emporte, rien n\'est écrit', () => {
        const dico = { '2031-09-02': {} };
        expect(fusionner(dico, [fiche('d', '1', 'C')], 'presences')).toEqual({ valeur: dico, ecrire: false, entrees: 0 });
    });
});

describe('#1012 — notes : l\'id, et le couple élève × production', () => {
    const ev = (id, da, prod, plus = {}) => ({ id, etudiantDA: da, productionId: prod, noteFinale: 70, ...plus });

    it('aucune évaluation de l\'espace ne change : même id, ou même couple, l\'espace l\'emporte', () => {
        const espace = [ev('E1', '1', 'P', { noteFinale: 85 })];
        const r = fusionner(espace, [ev('E1', '1', 'P', { noteFinale: 10 }), ev('E9', '1', 'P', { noteFinale: 72 })], 'notes');
        expect(r).toEqual({ valeur: espace, ecrire: false, entrees: 0 });
    });

    it('une reprise du fichier sur une originale de l\'espace n\'entre pas : le couple est déjà là', () => {
        const espace = [ev('E1', '1', 'P')];
        const reprise = ev('EVAL_REPRISE_X', '1', 'P', { repriseDeId: 'E1', jetonRepriseApplique: true, noteFinale: 90 });
        expect(fusionner(espace, [reprise], 'notes').entrees).toBe(0);
    });

    it('un couple absent de l\'espace : toute sa lignée du fichier entre, originale archivée et reprise', () => {
        const originale = ev('F1', '2', 'P', { remplaceeParId: 'F2', archivee: true });
        const reprise = ev('F2', '2', 'P', { repriseDeId: 'F1', jetonRepriseApplique: true });
        const r = fusionner([ev('E1', '1', 'P')], [originale, reprise], 'notes');
        expect(r.entrees).toBe(2);
        expect(r.valeur.map((e) => e.id)).toEqual(['E1', 'F1', 'F2']);
    });

    it('le même fichier rouvert ne double rien', () => {
        const r1 = fusionner([], [ev('F1', '2', 'P'), ev('F2', '3', 'P')], 'notes');
        expect(fusionner(r1.valeur, [ev('F1', '2', 'P'), ev('F2', '3', 'P')], 'notes').entrees).toBe(0);
    });

    it('les clés sans lecteur (`evaluations`, `notesEtudiants`), en dictionnaire : écrites seulement si l\'espace n\'a rien', () => {
        expect(fusionner({ a: 1 }, { b: 2 }, 'notes')).toEqual({ valeur: { a: 1 }, ecrire: false, entrees: 0 });
        expect(fusionner(null, { b: 2 }, 'notes')).toEqual({ valeur: { b: 2 }, ecrire: true, entrees: 1 });
    });
});

describe('#1012 — annotations : l\'id, et la copie annotée', () => {
    const an = (id, fichierId, texte) => ({ id, fichierId, texte });

    it('même copie, ou même id : celle de l\'espace reste ; une copie non annotée reçoit celle du fichier', () => {
        const espace = [an('A1', 'FT_1', 'espace')];
        const r = fusionner(espace, [an('A9', 'FT_1', 'fichier'), an('A1', 'FT_2', 'même id'), an('A2', 'FT_3', 'neuve')], 'annotations');
        expect(r).toEqual({ valeur: [...espace, an('A2', 'FT_3', 'neuve')], ecrire: true, entrees: 1 });
    });
});

describe('#1012 — verrou de structure : les quatre cases passent par la fusion', () => {
    it('chaque case appelle la fusion de sa famille, et aucune n\'écrit la valeur du fichier', () => {
        const fonction = tranche(sourceImport, 'async function executerImportSelectif(', '// Synchroniser le cache après tous les imports');
        const corps = tranche(fonction, '// Étudiants', '// Configuration') + tranche(fonction, '// Annotations travaux', undefined);
        // #522 lot 7 (11 oct. 2026) : la fusion se fait dans la file de la clé, sur la valeur lue (`lus`).
        const familles = [...corps.matchAll(/fusionnerDonneesPersoImportees\(lus, \w+, '(\w+)'\)/g)].map((m) => m[1]);
        expect(familles).toEqual(['etudiants', 'presences', 'notes', 'annotations']);
        for (const brut of ['db.set(cleEtu, etudiants)', 'db.set(clePres, presences)', 'db.set(cleEval, data)', 'db.set(cleAT, annotations)']) {
            expect(corps).not.toContain(brut);
        }
    });
});
