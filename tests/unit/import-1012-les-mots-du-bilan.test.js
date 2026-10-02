import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// #1012, les mots du chantier du codex (décisions de Grégoire, 2 oct. 2026, 15 h 05 et 15 h 07).
//
//  (3) « N date(s) de présences » compte des DATES distinctes (une date de cours, tous élèves
//      confondus), et non des fiches (une par élève et par jour) — à l'aperçu de l'import comme
//      à son bilan ; au bilan, seules les dates d'au moins une fiche ENTRÉE comptent.
//  (4) Quand l'import par cases écarte au moins un élève supprimé, le bilan ajoute une ligne qui
//      compte les élèves (DA distincts, toutes familles confondues), même si rien d'autre n'entre.
//
// Ici : les règles pures, l'aperçu par sa vraie fonction d'analyse, et les verrous de structure du
// bilan. Le geste entier (la vraie case, le vrai bilan) : tests/integration/codex-1012-ancien-zip-par-la-case.spec.js, (5) à (7).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceImport = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');

/** 3 dates × 10 élèves : 30 fiches. */
const TRENTE_FICHES = ['2031-09-02', '2031-09-04', '2031-09-09'].flatMap((date) =>
    Array.from({ length: 10 }, (_, i) => ({ date, da: String(9000100 + i), periodesPresentes: 2, coursId: 'cours-banc' })));

let w;
beforeEach(() => {
    w = chargerScript('js/import-export.js', {});
});

describe('#1012 (3) — le compte des dates de présences', () => {
    it('3 dates × 10 élèves : 3 dates, pas 30 fiches', () => {
        expect(TRENTE_FICHES).toHaveLength(30);
        expect(w.compterDatesPresences(TRENTE_FICHES)).toBe(3);
    });

    it('une fiche sans date, ou illisible, ne compte pas ; une date se compare en texte', () => {
        expect(w.compterDatesPresences([{ date: '2031-09-02', da: '1' }, { da: '2' }, null, 'x', { date: '2031-09-02', da: '3' }])).toBe(1);
        expect(w.compterDatesPresences([])).toBe(0);
    });

    it('l\'ancien format (un dictionnaire par date) compte ses clés ; autre chose, zéro', () => {
        expect(w.compterDatesPresences({ '2031-09-02': {}, '2031-09-04': {} })).toBe(2);
        expect(w.compterDatesPresences(null)).toBe(0);
        expect(w.compterDatesPresences('2031-09-02')).toBe(0);
    });

    it('l\'aperçu, par sa vraie fonction d\'analyse, dit 3 dates pour 3 dates × 10 élèves', () => {
        const analyse = w.analyserRessourcesDetaillees({ a2031_presences: JSON.stringify(TRENTE_FICHES) });
        expect(analyse.donnees.presences.count).toBe(3);
        expect(analyse.donnees.presences.cles).toEqual(['a2031_presences']);
    });

    it('verrou : le bilan compte les dates des fiches ENTRÉES, par la même règle', () => {
        const fonction = tranche(sourceImport, 'async function executerImportSelectif(', '// Synchroniser le cache après tous les imports');
        const presences = tranche(fonction, "if (isChecked('presences')", '// Évaluations');
        expect(presences).toContain('nbDates += compterDatesPresences(entreesPres);');
        expect(presences).toContain('presences.filter(p => gardeesPres.has(p))');
        expect(presences).not.toContain('nbDates += resPres.entrees');
        expect(presences).toContain('details.push(`${nbDates} date(s) de présences`);');
    });
});

describe('#1012 (4) — la ligne des élèves écartés', () => {
    it('les mots exacts, accords compris ; aucune ligne pour zéro', () => {
        expect(w.ligneElevesEcartes(1)).toBe('1 élève que tu avais supprimé n\'a pas été ramené.');
        expect(w.ligneElevesEcartes(2)).toBe('2 élèves que tu avais supprimés n\'ont pas été ramenés.');
        expect(w.ligneElevesEcartes(7)).toBe('7 élèves que tu avais supprimés n\'ont pas été ramenés.');
        expect(w.ligneElevesEcartes(0)).toBe('');
    });

    it('l\'écartement consigne les DA écartés, une fois par élève, toutes familles confondues', () => {
        const E = new Set(['3', '4']);
        const vus = new Set();
        w.ecarterElevesDesinscrits([{ da: '3' }, { da: '2' }], 'etudiants', E, null, vus);
        w.ecarterElevesDesinscrits([{ date: 'd', da: '3' }, { date: 'e', da: '3' }], 'presences', E, null, vus);
        w.ecarterElevesDesinscrits([{ id: 'a', etudiantDA: 3 }], 'notes', E, null, vus);
        expect([...vus]).toEqual(['3']);
        // Une annotation sans DA s'écarte par sa copie : la Map des copies donne l'élève.
        w.ecarterElevesDesinscrits([{ id: 'A1', fichierId: 'FT_4' }], 'annotations', E, new Map([['FT_4', '4']]), vus);
        expect([...vus]).toEqual(['3', '4']);
    });

    it('rien d\'écarté : rien de consigné', () => {
        const vus = new Set();
        w.ecarterElevesDesinscrits([{ da: '2' }], 'etudiants', new Set(['3']), null, vus);
        w.ecarterElevesDesinscrits([{ da: '3' }], 'etudiants', new Set(), null, vus);
        expect(vus.size).toBe(0);
    });

    it('verrou : les cinq familles consignent dans le même ensemble, et le bilan le compte dans ses deux issues', () => {
        const fonction = tranche(sourceImport, 'async function executerImportSelectif(', '// Synchroniser le cache après tous les imports');
        expect([...fonction.matchAll(/ecarterElevesDesinscrits\([^;]*, dasEcartesVus\);/g)]).toHaveLength(5);
        expect(fonction).toContain('copies.set(f.id, String(f.etudiantDA));');
        const fin = tranche(sourceImport, '// Synchroniser le cache après tous les imports', '} catch (erreur) {');
        expect(fin).toContain('ligneElevesEcartes(dasEcartesVus.size)');
        expect(fin).toContain("alert('Aucune nouvelle donnée à importer.\\n\\nLes éléments sélectionnés existent déjà (même nom).' + suiteEcartes);");
        expect(fin).toContain('`Import réussi !\\n\\n${details.join(\'\\n\')}${suiteEcartes}\\n\\nTotal');
    });
});
