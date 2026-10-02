import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// #1012, suite (2 oct. 2026) — LES COPIES D'UN FICHIER IMPORTÉ PAR LES CASES S'AJOUTENT À
// CELLES DE L'ESPACE.
//
// Mesuré par le geste avant le lot : la case « Fichiers travaux » de l'import par cases
// REMPLAÇAIT la liste des copies de l'espace par celle du fichier (`db.set`). Les copies de
// l'espace n'avaient plus d'entrée, et le codex réécrit ensuite les perdait sans fenêtre.
//
// Ici : la règle pure (`fusionnerCopiesImportees`) et le verrou de structure. Le geste entier
// (la case, le magasin, la mise à jour du codex) est jugé au navigateur :
// tests/integration/codex-1012-ancien-zip-par-la-case.spec.js.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceImport = readFileSync(path.join(racineProjet, 'js', 'import-export.js'), 'utf8');

let win;
beforeEach(() => { win = chargerScript('js/import-export.js', {}); });

const copie = (id, plus = {}) => ({ id, nomFichier: id + '.pdf', etudiantDA: '9000001', productionId: 'PROD_FICTIVE', ...plus });

describe('#1012 — fusionnerCopiesImportees : les copies du fichier s\'ajoutent', () => {
    it('aucune copie de l\'espace ne perd son entrée ; celles du fichier entrent à la suite', () => {
        const espace = [copie('FT_A'), copie('FT_B')];
        const r = win.fusionnerCopiesImportees(espace, [copie('FT_Z')]);
        expect(r.liste.map((f) => f.id)).toEqual(['FT_A', 'FT_B', 'FT_Z']);
        expect(r.nouvelles.map((f) => f.id)).toEqual(['FT_Z']);
        expect(r.dejaLa).toEqual([]);
    });

    it('un identifiant déjà là : l\'entrée de l\'espace reste, celle du fichier n\'entre pas', () => {
        const deLEspace = copie('FT_A', { nomFichier: 'nom-de-l-espace.pdf', etudiantDA: '9000001', blobStatut: 'present' });
        const duFichier = copie('FT_A', { nomFichier: 'nom-du-fichier.pdf', etudiantDA: '9000002' });
        const r = win.fusionnerCopiesImportees([deLEspace], [duFichier, copie('FT_Z')]);
        expect(r.liste.length).toBe(2);
        expect(r.liste[0], 'la même entrée, pas une copie réécrite').toBe(deLEspace);
        expect(r.liste[0]).toEqual({ id: 'FT_A', nomFichier: 'nom-de-l-espace.pdf', etudiantDA: '9000001', productionId: 'PROD_FICTIVE', blobStatut: 'present' });
        expect(r.nouvelles.map((f) => f.id)).toEqual(['FT_Z']);
        // `dejaLa` rend l'entrée DE L'ESPACE : c'est sous son association qu'un fichier revenu est rangé.
        expect(r.dejaLa).toEqual([deLEspace]);
        expect(r.dejaLa[0]).toBe(deLEspace);
    });

    it('la liste de l\'espace n\'est pas modifiée en place', () => {
        const espace = [copie('FT_A')];
        const r = win.fusionnerCopiesImportees(espace, [copie('FT_Z')]);
        expect(espace.map((f) => f.id)).toEqual(['FT_A']);
        expect(r.liste).not.toBe(espace);
    });

    it('un même identifiant deux fois dans le fichier n\'entre qu\'une fois', () => {
        const r = win.fusionnerCopiesImportees([], [copie('FT_Z', { nomFichier: 'premier.pdf' }), copie('FT_Z', { nomFichier: 'second.pdf' })]);
        expect(r.liste.map((f) => f.nomFichier)).toEqual(['premier.pdf']);
    });

    it('un espace sans liste, un fichier sans liste, des entrées vides : rien ne casse, rien ne se perd', () => {
        expect(win.fusionnerCopiesImportees(null, [copie('FT_Z')]).liste.map((f) => f.id)).toEqual(['FT_Z']);
        expect(win.fusionnerCopiesImportees([copie('FT_A')], null).liste.map((f) => f.id)).toEqual(['FT_A']);
        expect(win.fusionnerCopiesImportees([copie('FT_A')], [null, undefined]).liste.map((f) => f.id)).toEqual(['FT_A']);
        // Sans identifiant, rien ne permet de dire « déjà là » : elle entre, comme avant le lot.
        const sansId = { nomFichier: 'sans-identifiant.pdf' };
        expect(win.fusionnerCopiesImportees([copie('FT_A')], [sansId]).liste).toEqual([copie('FT_A'), sansId]);
    });
});

describe('#1012 — verrou de structure : l\'import par cases ne remplace plus la liste des copies', () => {
    // Bornée à la fonction suivante, pas à une fenêtre fixe (une tranche vide rendrait l'absence vraie).
    const debut = sourceImport.indexOf('\nasync function executerImportSelectif()');
    const suite = sourceImport.slice(debut + 1).search(/\n(async )?function /);
    const corps = sourceImport.slice(debut, debut + 1 + suite);

    it('la tranche jugée est bien le corps de executerImportSelectif, et rien d\'autre', () => {
        expect(debut).toBeGreaterThan(0);
        expect(suite).toBeGreaterThan(10000);
        expect(corps).toContain('isChecked(\'fichiersTravaux\')');
        expect(corps.match(/\n(async )?function /g)).toEqual(['\nasync function ']);
    });

    it('la case des copies passe par _ajouterCopiesImportees, et n\'écrit plus la liste du fichier telle quelle', () => {
        expect(corps).toContain('await _ajouterCopiesImportees(listesCopies, zipTravaux)');
        expect(corps).not.toMatch(/db\.set(Sync)?\(\s*cleFT\s*,/);
        expect(corps).not.toContain('_restaurerBlobsDepuisZip(');
    });

    it('_ajouterCopiesImportees n\'écrit une liste que par la fusion, et jamais la liste du fichier', () => {
        const d = sourceImport.indexOf('async function _ajouterCopiesImportees(');
        const f = sourceImport.indexOf('\nasync function _restaurerBlobsDepuisZip(', d);
        expect(d).toBeGreaterThan(0);
        expect(f).toBeGreaterThan(d);
        const tranche = sourceImport.slice(d, f);
        expect(tranche.length).toBeGreaterThan(1500);
        const ecritures = tranche.match(/db\.set(Sync)?\([^)]*\)/g) || [];
        expect(ecritures).toEqual(['db.set(cleFT, fusion.liste)', 'db.set(cleFT, liste)']);
        expect(tranche).toContain('fusionnerCopiesImportees(await db.get(cleFT, []), listesDuFichier[cleFT])');
    });
});
