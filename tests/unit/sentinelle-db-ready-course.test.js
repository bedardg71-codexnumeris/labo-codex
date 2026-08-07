import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// LA COURSE `db-ready` (7 août 2026) — cause réelle de #367 non migré.
//
// INCIDENT. Constat terrain de Grégoire, des HEURES après le déploiement :
// `migration_planification_seances_done` encore à `false`, 38 entrées toujours
// dans la clé nue — avec un `main.js` pourtant à jour (build 0807-1413).
//
// CAUSE. Le bloc de migrations de `main.js` ne s'abonnait qu'à `db-ready`,
// depuis `DOMContentLoaded`. Or `db.syncToLocalStorageCache()` émet cet
// événement dès la fin de la synchro IndexedDB, qui peut se terminer AVANT que
// l'écouteur soit posé. L'événement est alors déjà passé : l'écouteur ne se
// déclenche jamais et TOUTES les migrations du bloc sont sautées.
//
// ⚠ Rien ne le signale. Pas d'erreur, pas de trace, pas de dégradation
// visible — seulement des données qui ne migrent pas, indéfiniment. Et le
// résultat DÉPEND DE LA VITESSE DE LA MACHINE : la même version migre chez
// l'un et pas chez l'autre. C'est ce qui l'a rendu invisible jusqu'ici.
//
// `codex.js` connaissait le piège (`if (window.dbReady) … else addEventListener`).
// `main.js` ne testait `window.dbReady` NULLE PART.
//
// ⮕ Ce que cette sentinelle verrouille : le bloc de migrations doit rattraper
// un `db-ready` déjà émis. Un test de rendu ou de logique ne peut pas voir ça —
// il faut regarder l'INSCRIPTION elle-même.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceMain = readFileSync(path.join(racineProjet, 'js', 'main.js'), 'utf8');

describe('db-ready · le bloc de migrations rattrape un événement déjà émis', () => {
    it('main.js teste window.dbReady', () => {
        // Zéro occurrence avant le correctif : c'était tout le bug.
        expect(sourceMain).toMatch(/if\s*\(\s*window\.dbReady\s*\)/);
    });

    it('le rattrapage APPELLE réellement le handler', () => {
        // Tester le drapeau sans rien en faire ne corrigerait rien.
        expect(sourceMain).toMatch(/if\s*\(\s*window\.dbReady\s*\)\s*\{[\s\S]{0,200}auDbReady\(/);
    });

    it('l’écouteur reste posé — db-ready peut être réémis après un import', () => {
        expect(sourceMain).toMatch(/addEventListener\(\s*'db-ready'\s*,\s*auDbReady/);
    });

    it('le handler est NOMMÉ — un anonyme ne peut pas être rappelé au rattrapage', () => {
        expect(sourceMain).toMatch(/async function auDbReady\s*\(/);
        // Et il ne reste pas d'écouteur anonyme sur db-ready dans ce fichier :
        // ce serait un second bloc, non rattrapable.
        expect(sourceMain).not.toMatch(/addEventListener\(\s*'db-ready'\s*,\s*(async\s*)?function\s*\(/);
    });

    it('les migrations du bloc restent idempotentes — le rattrapage peut doubler', () => {
        // Si db-ready est réémis après un rattrapage, le bloc tourne deux fois.
        // Chaque migration doit donc être gardée par son drapeau.
        const bloc = sourceMain.slice(
            sourceMain.indexOf('async function auDbReady'),
            sourceMain.indexOf("window.addEventListener('db-ready', auDbReady)")
        );
        const migrations = [...bloc.matchAll(/db\.setSync\('(migration_\w+_done)',\s*true\)/g)]
            .map((m) => m[1]);
        expect(migrations.length).toBeGreaterThan(0);
        for (const drapeau of migrations) {
            expect(
                bloc,
                `${drapeau} est posé sans être testé : la migration rejouerait à chaque db-ready`
            ).toContain(`db.getSync('${drapeau}', false)`);
        }
    });
});
