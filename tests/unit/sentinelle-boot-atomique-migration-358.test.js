import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Sentinelle — boot ATOMIQUE de la migration des modèles namespacés (#358
// follow-up consigné le 28 juin 2026, livré le 3 juillet, vague 3 batch 2).
//
// Fenêtre fermée : G4 (`viderModelesGlobalHerite` → removeSync) et le
// peuplement C1 (`migrerModelesVersNamespace` → setSync) sont des écritures
// fire-and-forget. Si le contexte mourait entre ces écritures et la pose du
// flag `migration_modeles_namespacees_done`, une install (fraîche CoP
// notamment) pouvait se retrouver « flag posé mais global non vidé » — le
// reliquat observé le 28 juin. Le bloc DRAINE désormais `_pendingWrites`
// (`await db.flush()`) AVANT de poser le flag : un flush qui lève passe au
// catch → flag non posé → nouvelle tentative au prochain boot (idempotent).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('sentinelle · boot atomique migration modèles #358 (flush avant flag)', () => {
    const main = readFileSync(path.join(racine, 'js', 'main.js'), 'utf8');

    // Périmètre : le bloc de migration #358 (du garde-flag au bloc #326 R1 suivant).
    const debut = main.indexOf("if (!db.getSync('migration_modeles_namespacees_done', false))");
    const fin = main.indexOf("migration_estEssai_to_estMaquette_done");
    const bloc = main.slice(debut, fin);

    it('le bloc de migration existe et précède la migration #326 R1 (périmètre valide)', () => {
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
    });

    it('le handler db-ready est async (l\'await du flush est légal)', () => {
        expect(main).toContain("window.addEventListener('db-ready', async function");
    });

    it('ordre atomique : peuplement C1 → vidage G4 → await db.flush() → pose du flag', () => {
        const iPeuple = bloc.indexOf('migrerModelesVersNamespace();');
        const iVide = bloc.indexOf('viderModelesGlobalHerite();');
        const iFlush = bloc.indexOf('await db.flush();');
        const iFlag = bloc.indexOf("db.setSync('migration_modeles_namespacees_done', true);");
        expect(iPeuple).toBeGreaterThan(-1);
        expect(iVide).toBeGreaterThan(iPeuple);
        expect(iFlush, 'await db.flush() absent du bloc — la fenêtre « flag posé / global non vidé » est rouverte').toBeGreaterThan(iVide);
        expect(iFlag).toBeGreaterThan(iFlush);
    });

    it('le flush est DANS le try du bloc (un échec de drainage empêche la pose du flag)', () => {
        const iTry = bloc.indexOf('try {');
        const iCatch = bloc.indexOf('} catch(e)');
        const iFlush = bloc.indexOf('await db.flush();');
        expect(iTry).toBeGreaterThan(-1);
        expect(iFlush).toBeGreaterThan(iTry);
        expect(iFlush).toBeLessThan(iCatch);
    });
});
