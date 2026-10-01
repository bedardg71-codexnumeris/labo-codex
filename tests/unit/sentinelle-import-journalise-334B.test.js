import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// Sentinelle statique — #334 session B (10 juin 2026), import journalisé.
// Verrouille trois défenses contre un retour silencieux du bug terrain iPad
// (« import déclaré réussi » avec des fichiers manquants + avalanche de
// bandeaux « Fichier trop volumineux ») — cf.
// feedback-fix-perdu-refactoring-extraction :
//   1. chargerCodex journalise les échecs de blobs (compteurs par raison)
//      et appelle stockerBlob avec notifier:false (anti-spam) ;
//   2. stockerBlob accepte options.notifier — et depuis le 11 juin 2026,
//      n'impose PLUS de limite de taille par fichier (hypothèse périmée) ;
//   3. les fichiers sans blob sont marqués blobStatut 'manquant' et la
//      visionneuse affiche cet état.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('sentinelle · import codex journalisé (#334 B)', () => {
    const codex = readFileSync(path.join(racine, 'js', 'codex.js'), 'utf8');
    const stockage = readFileSync(path.join(racine, 'js', 'travaux-stockage.js'), 'utf8');
    const ui = readFileSync(path.join(racine, 'js', 'travaux-ui.js'), 'utf8');

    // Périmètre : corps de chargerCodex.
    const debut = codex.indexOf('async function chargerCodex(');
    const fin = codex.indexOf('function construireBilanImport(');
    const corps = codex.slice(debut, fin);

    it('chargerCodex précède construireBilanImport (périmètre valide)', () => {
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
    });

    it('chargerCodex compte les échecs de blobs par raison (plus de continue silencieux)', () => {
        expect(corps).toContain('blobsRefusesMagic.push');
        expect(corps).toContain('blobsAbsentsDuZip.push');
        expect(corps).toContain('blobsEchecs.push');
        expect(corps).toContain("raison = 'quota'");
    });

    it('chargerCodex appelle stockerBlob avec notifier:false (anti-avalanche)', () => {
        expect(corps).toMatch(/stockerBlob\([^)]*\{ notifier: false \}\)/);
    });

    it('les stats portent le verdict incomplet et le libellé final ne ment plus', () => {
        expect(corps).toContain('incomplet:');
        expect(corps).toContain('Import terminé — incomplet');
    });

    it('échec quota en phase données → message actionnable (pas d\'état partiel muet)', () => {
        // La source utilise des apostrophes échappées (chaîne JS à quotes simples).
        expect(corps).toContain("L\\'espace s\\'est rempli pendant l\\'import");
    });

    it('les fichiers sans blob sont marqués blobStatut manquant et les clés réécrites', () => {
        expect(corps).toContain("fic.blobStatut = 'manquant'");
        expect(corps).toMatch(/db\.set\(clesFTImport\[k\]/);
    });

    it('l\'ouverture route le cas incomplet vers le bilan, porté par la fenêtre de rechargement (#1012)', () => {
        // Bornée à la fonction : de `_ouvrirLeFichierChoisi` à la fonction suivante.
        // `tranche()` refuse une tranche vide (#858) : l'assertion négative plus bas en dépend.
        const suite = tranche(codex, 'async function _ouvrirLeFichierChoisi(', 'async function actionEnregistrer(');
        expect(suite).toContain('resultat.stats.incomplet');
        expect(suite).toContain('construireBilanImport(resultat.stats)');
        expect(suite).toContain("titre: bilan ? bilan.titre : 'Recharger la page'");
        expect(suite).toContain('bilan.message');
        // Le bilan ne passe plus par un bandeau qui s'en va (remarque de Grégoire, 1er oct. 2026).
        expect(suite).not.toContain('notifications.warning');
    });

    it('stockerBlob accepte options.notifier et n\'a PAS de limite de taille par fichier', () => {
        expect(stockage).toMatch(/async function stockerBlob\(id, blob, etudiantDA, productionId, options\)/);
        expect(stockage).toContain("options.notifier !== false");
        // Limite 20 Mo retirée le 11 juin 2026 (hypothèse « IDB ≈ 50 Mo »
        // périmée ; décision Grégoire). Verrou anti-réintroduction :
        expect(stockage).not.toContain('LIMITE_BLOB_MB');
        expect(stockage).not.toContain('BLOB_TROP_VOLUMINEUX');
    });

    it('la visionneuse affiche l\'état manquant (badge dans les 3 rendus)', () => {
        const occurrences = ui.split('travaux-badge-manquant').length - 1;
        expect(occurrences).toBeGreaterThanOrEqual(3);
    });
});
