import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { suitDansLaFonction } from './_helpers/tranche.js';

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

// ⮕ MISE À JOUR #414 (8 août 2026). Le rattrapage écrit à la main dans main.js
// a été remplacé par le portillon unique `window.auDbPret` (db.js), après que
// l'audit des 14 autres écouteurs eut montré que ce geste était réécrit en neuf
// exemplaires, portant trois familles de défauts distinctes.
//
// La garantie verrouillée ici est INCHANGÉE — « le bloc de migrations
// s'exécute même si db-ready est déjà passé » — mais elle tient désormais en
// DEUX MAILLONS, et la sentinelle doit tenir les deux : si l'un cède, la
// garantie tombe sans qu'aucune ligne de main.js n'ait bougé.
//   maillon 1 : main.js confie bien son bloc au portillon (et lui demande de
//               RESTER abonné, `once: false`) ;
//   maillon 2 : le portillon rattrape réellement un événement déjà émis.
const sourceDb = readFileSync(path.join(racineProjet, 'js', 'db.js'), 'utf8');

// Corps de `auDbPret` isolé une fois pour toutes : les assertions du maillon 2
// doivent porter sur LUI, pas sur db.js en entier — le fichier contient
// `window.dbReady = true` (l'émetteur) et `addEventListener('db-ready'…)`
// ailleurs, de quoi satisfaire par accident n'importe quelle recherche naïve.
const corpsAuDbPret = (() => {
    const debut = sourceDb.indexOf('function auDbPret(');
    expect(debut, 'auDbPret introuvable dans db.js — le portillon a disparu').toBeGreaterThan(-1);
    const fin = sourceDb.indexOf('window.auDbPret = auDbPret', debut);
    expect(fin, 'auDbPret n’est plus exporté sur window').toBeGreaterThan(debut);
    return sourceDb.slice(debut, fin);
})();

describe('db-ready · le bloc de migrations rattrape un événement déjà émis', () => {
    it('maillon 1 · main.js confie son bloc de migrations au portillon', () => {
        // Avant #413 : aucun rattrapage, sous aucune forme. C'était tout le bug.
        expect(sourceMain).toMatch(/window\.auDbPret\(\s*auDbReady/);
    });

    it('maillon 1 · l’écouteur reste posé — db-ready est réémis après un import', () => {
        // `once: false` explicite : avec le défaut (once), le bloc ne tournerait
        // qu'une fois et les données d'un import ne seraient jamais migrées.
        expect(sourceMain).toMatch(/window\.auDbPret\(\s*auDbReady\s*,\s*\{\s*once:\s*false\s*\}\s*\)/);
    });

    it('maillon 2 · le portillon teste window.dbReady', () => {
        // `db.ready` (fin d'init, AVANT la synchro) et `db.isReady` (inexistante)
        // sont les deux drapeaux qui ont fait échouer les autres sites — cf. #414.
        expect(corpsAuDbPret).toMatch(/if\s*\(\s*window\.dbReady\s*\)/);
    });

    it('maillon 2 · le rattrapage APPELLE réellement le rappel', () => {
        // Tester le drapeau sans rien en faire ne corrigerait rien.
        expect(suitDansLaFonction(corpsAuDbPret, /if\s*\(\s*window\.dbReady\s*\)\s*\{/, /executer\(/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('maillon 2 · l’abonnement est posé AVANT le rattrapage', () => {
        // Ordre non négociable : rattraper d'abord et s'abonner ensuite laisserait
        // filer un db-ready émis entre les deux gestes — la course, à nouveau,
        // dans le portillon censé la fermer.
        const posAbonnement = corpsAuDbPret.indexOf("window.addEventListener('db-ready', executer)");
        const posRattrapage = corpsAuDbPret.search(/if\s*\(\s*window\.dbReady\s*\)/);
        expect(posAbonnement).toBeGreaterThan(-1);
        expect(posRattrapage).toBeGreaterThan(-1);
        expect(posAbonnement).toBeLessThan(posRattrapage);
    });

    it('le handler est NOMMÉ — un anonyme ne peut pas être rappelé au rattrapage', () => {
        expect(sourceMain).toMatch(/async function auDbReady\s*\(/);
        // Et il ne reste aucun écouteur brut sur db-ready dans ce fichier :
        // ce serait un second bloc, hors du portillon, donc non rattrapé.
        expect(sourceMain).not.toMatch(/addEventListener\(\s*'db-ready'/);
    });

    it('les migrations du bloc restent idempotentes — le rattrapage peut doubler', () => {
        // Si db-ready est réémis après un rattrapage, le bloc tourne deux fois.
        // Chaque migration doit donc être gardée par son drapeau.
        const debut = sourceMain.indexOf('async function auDbReady');
        const fin = sourceMain.indexOf('window.auDbPret(auDbReady');
        // ⚠ Bornes vérifiées AVANT le slice : `indexOf` rend -1 quand la forme
        // change, et `slice(x, -1)` découperait alors tout le reste du fichier —
        // l'assertion resterait verte en ayant cessé de viser le bloc. C'est
        // exactement ce qui est arrivé à ce test au passage au portillon.
        expect(debut, 'auDbReady introuvable dans main.js').toBeGreaterThan(-1);
        expect(fin, 'la remise du bloc au portillon est introuvable').toBeGreaterThan(debut);
        const bloc = sourceMain.slice(debut, fin);

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
