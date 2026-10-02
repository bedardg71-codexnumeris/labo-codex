import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerCodex } from './_helpers/charger-codex.js';

// #334 session A (11 juin 2026) — pré-vol stockage avant import de codex.
// Cas réel : iPad au disque presque plein, quota WebKit proportionnel à
// l'espace libre → import qui échoue à mi-chemin sans avertissement.
// Deux volets :
//   1. tests FONCTIONNELS de la fonction pure evaluerPrevolStockage ;
//   2. sentinelles STATIQUES (cf. feedback-fix-perdu-refactoring-extraction)
//      qui verrouillent le câblage du pré-vol dans chargerCodex.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const Mo = 1024 * 1024;
const PLANCHER = 100 * Mo;

let win;
beforeAll(() => {
    win = chargerCodex();
});

describe('#334 A · evaluerPrevolStockage (fonction pure)', () => {

    it('ok : espace largement suffisant', () => {
        const r = win.Codex.evaluerPrevolStockage(200 * Mo, 80 * Mo, { usage: 100 * Mo, quota: 2000 * Mo });
        expect(r.verdict).toBe('ok');
        expect(r.besoin).toBe(200 * Mo * 1.5 + PLANCHER);
        expect(r.manque).toBe(0);
        expect(r.approximatif).toBe(false);
    });

    it('refus : besoin (taille × 1,5 + plancher) au-dessus du disponible, manque chiffré', () => {
        // 1 Go décompressé → besoin 1,5 Go + 100 Mo ; disponible 1 Go → manque 600 Mo
        const r = win.Codex.evaluerPrevolStockage(1024 * Mo, 400 * Mo, { usage: 1024 * Mo, quota: 2048 * Mo });
        expect(r.verdict).toBe('refus');
        expect(r.disponible).toBe(1024 * Mo);
        expect(r.manque).toBe(1024 * Mo * 1.5 + PLANCHER - 1024 * Mo);
    });

    it('plancher : même un petit codex est refusé s\'il ne reste pas ~100 Mo post-import', () => {
        // 10 Mo décompressé, 50 Mo disponibles → 15 Mo + 100 Mo > 50 Mo
        const r = win.Codex.evaluerPrevolStockage(10 * Mo, 5 * Mo, { usage: 0, quota: 50 * Mo });
        expect(r.verdict).toBe('refus');
    });

    it('inconnu : estimate() absent → non bloquant, besoin quand même chiffré', () => {
        const r = win.Codex.evaluerPrevolStockage(200 * Mo, 80 * Mo, null);
        expect(r.verdict).toBe('inconnu');
        expect(r.besoin).toBeGreaterThan(0);
        const r2 = win.Codex.evaluerPrevolStockage(200 * Mo, 80 * Mo, { usage: 0, quota: 0 });
        expect(r2.verdict).toBe('inconnu');
    });

    it('D6 · taille décompressée 0 (ZIP sans uncompressedSize) → fallback taille ZIP × 3, marqué approximatif', () => {
        const r = win.Codex.evaluerPrevolStockage(0, 100 * Mo, { usage: 0, quota: 10000 * Mo });
        expect(r.approximatif).toBe(true);
        expect(r.besoin).toBe(100 * Mo * 3 + PLANCHER);
        expect(r.verdict).toBe('ok');
    });

    it('quotaFaible : quota < 500 Mo signalé (heuristique navigation privée)', () => {
        const r = win.Codex.evaluerPrevolStockage(10 * Mo, 5 * Mo, { usage: 0, quota: 400 * Mo });
        expect(r.quotaFaible).toBe(true);
        const r2 = win.Codex.evaluerPrevolStockage(10 * Mo, 5 * Mo, { usage: 0, quota: 2000 * Mo });
        expect(r2.quotaFaible).toBe(false);
    });
});

describe('sentinelle · câblage du pré-vol (#334 A)', () => {
    const codex = readFileSync(path.join(racine, 'js', 'codex.js'), 'utf8');
    const importExport = readFileSync(path.join(racine, 'js', 'import-export.js'), 'utf8');

    // Périmètre : corps de chargerCodex.
    const debut = codex.indexOf('async function chargerCodex(');
    const fin = codex.indexOf('function construireBilanImport(');
    const corps = codex.slice(debut, fin);

    it('chargerCodex appelle le pré-vol AVANT l\'extraction des données et refuse avec message actionnable', () => {
        const posPrevol = corps.indexOf('evaluerPrevolStockage(');
        const posExtraction = corps.indexOf('Extraction des données');
        expect(posPrevol).toBeGreaterThan(-1);
        expect(posExtraction).toBeGreaterThan(posPrevol);
        expect(corps).toContain('Espace insuffisant pour ouvrir ce codex');
        expect(corps).toContain('rouvre l\\\'application dans une fenêtre normale');
    });

    it('chargerCodex revérifie persisted() et demande persist() sur geste utilisateur (D1)', () => {
        expect(corps).toContain('navigator.storage.persisted()');
        expect(corps).toContain('navigator.storage.persist()');
    });

    it('validerZipSecurite expose tailleDecompressee et validerCodex la propage (_tailleDecompressee)', () => {
        expect(importExport).toContain('tailleDecompressee: tailleDecompressee');
        expect(codex).toContain('_tailleDecompressee: tailleDecompressee');
        expect(corps).toContain('validation._tailleDecompressee');
    });

    it('actionOuvrir rappelle de GARDER le fichier de codex sur import COMPLET, et ne conseille plus de le supprimer (#1012, 2 oct. 2026)', () => {
        const posAction = codex.indexOf('async function actionOuvrir(');
        const corpsAction = codex.slice(posAction, codex.indexOf('async function actionEnregistrer('));
        // La piste 5 (#334) conseillait de supprimer le ZIP d'origine : c'est la seule copie
        // hors de l'application (limite de Grégoire du 20 septembre), le conseil est retiré.
        expect(corpsAction).toContain("Ton fichier de codex n\\'a pas changé : garde-le, c\\'est ta copie hors de ' +");
        expect(corpsAction).not.toContain('reste dans Fichiers');
        expect(corpsAction).not.toContain('tu peux le supprimer');
        // Le rappel reste sur la branche non-incomplet (un import incomplet conseille
        // de ROUVRIR le même codex). Depuis #1012, la branche incomplète est le message du bilan.
        expect(corpsAction).toContain('resultat.stats.incomplet');
        expect(corpsAction).toMatch(/msgReload = bilan\s*\?\s*bilan\.message\s*:\s*'Codex chargé depuis/);
    });
});
