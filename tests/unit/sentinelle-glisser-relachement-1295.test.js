import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// #1295 (19 nov. 2026) — le relâchement d'un glisser prend la position RÉELLE du pointeur.
//
// `throttleRAF` gardait le PREMIER mouvement d'une image et jetait les suivants ; le relâchement
// ne relisait pas sa position, et l'image en attente s'appliquait APRÈS le dépôt. Le banc
// navigateur : tests/integration/planif-glisser-relachement-1295.spec.js. Ici :
//   A. le contrat de la vraie fonction (tirée du fichier, exécutée sur une horloge d'images simulée) ;
//   B. le cliquet : tout mouvement limité par throttleRAF et rangé dans une variable est vidé ou
//      remplacé au relâchement — un glisser neuf qui l'oublierait rougit ici.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = readFileSync(path.join(__dirname, '..', '..', 'js', 'planification-carte.js'), 'utf8');

function monter() {
    const code = tranche(source, 'function throttleRAF(fn) {', '\n// === CLÉ DE STOCKAGE SÉANCES', { longueurMin: 200 });
    let suivant = 1;
    const images = new Map();
    const requestAnimationFrame = (cb) => { const id = suivant++; images.set(id, cb); return id; };
    const cancelAnimationFrame = (id) => { images.delete(id); };
    const image = () => { const cbs = [...images.values()]; images.clear(); cbs.forEach((cb) => cb()); };
    const fabrique = new Function('requestAnimationFrame', 'cancelAnimationFrame',
        code + '\nreturn { throttleRAF: throttleRAF, appliquerPositionDuRelachement: appliquerPositionDuRelachement };');
    return { ...fabrique(requestAnimationFrame, cancelAnimationFrame), image, enAttente: () => images.size };
}

describe('#1295 A — throttleRAF : une image, un traitement, le DERNIER mouvement', () => {
    it('trois mouvements dans la même image : un seul traitement, avec le dernier', () => {
        const { throttleRAF, image } = monter();
        const recus = [];
        const limite = throttleRAF((e) => recus.push(e.x));
        limite({ x: 1 }); limite({ x: 2 }); limite({ x: 3 });
        expect(recus).toEqual([]);
        image();
        expect(recus).toEqual([3]);
        image();
        expect(recus, 'rien ne repart sans mouvement neuf').toEqual([3]);
    });

    it('vider() applique tout de suite le mouvement en attente, et l’image ne le rejoue pas', () => {
        const { throttleRAF, image, enAttente } = monter();
        const recus = [];
        const limite = throttleRAF((e) => recus.push(e.x));
        limite({ x: 4 }); limite({ x: 5 });
        limite.vider();
        expect(recus).toEqual([5]);
        expect(enAttente()).toBe(0);
        image();
        expect(recus).toEqual([5]);
        limite.vider();
        expect(recus, 'vider sans attente ne fait rien').toEqual([5]);
    });

    it('annuler() retire le mouvement en attente', () => {
        const { throttleRAF, image } = monter();
        const recus = [];
        const limite = throttleRAF((e) => recus.push(e.x));
        limite({ x: 6 });
        limite.annuler();
        image();
        expect(recus).toEqual([]);
    });

    it('au pointerup, la position du relâchement s’applique, et l’image en attente est retirée', () => {
        const { throttleRAF, appliquerPositionDuRelachement, image } = monter();
        const recus = [];
        const fn = (e) => recus.push(e.x);
        const limite = throttleRAF(fn);
        limite({ x: 7 }); limite({ x: 8 });
        appliquerPositionDuRelachement(limite, fn, { type: 'pointerup', x: 9 });
        expect(recus).toEqual([9]);
        image();
        expect(recus, 'aucun mouvement ne s’applique après le relâchement').toEqual([9]);
    });

    it('au pointercancel, seul le dernier mouvement reçu s’applique (sa position n’est pas fiable)', () => {
        const { throttleRAF, appliquerPositionDuRelachement, image } = monter();
        const recus = [];
        const fn = (e) => recus.push(e.x);
        const limite = throttleRAF(fn);
        limite({ x: 10 }); limite({ x: 11 });
        appliquerPositionDuRelachement(limite, fn, { type: 'pointercancel', x: 0 });
        expect(recus).toEqual([11]);
        image();
        expect(recus).toEqual([11]);
    });
});

describe('#1295 B — cliquet : chaque mouvement limité est vidé ou remplacé au relâchement', () => {
    const declarations = [...source.matchAll(/var (\w+) = throttleRAF\((\w+)\);/g)].map((m) => ({ limite: m[1], fn: m[2] }));

    it('les six glisser limités de la carte sont tous comptés (un glisser neuf entre ici)', () => {
        expect(declarations.map((d) => d.limite).sort()).toEqual(
            ['onMoveBThrottled', 'onMoveCThrottled', 'onMoveDThrottled', 'onMoveGroupeThrottled', 'onMoveThrottled', 'surDeplacement']);
    });

    it.each(declarations.map((d) => [d.limite, d.fn]))('%s : son relâchement appelle appliquerPositionDuRelachement ou vider()', (limite, fn) => {
        const remplace = source.includes(`appliquerPositionDuRelachement(${limite}, ${fn}, `);
        const vide = source.includes(`${limite}.vider();`);
        expect(remplace || vide).toBe(true);
    });

    it('aucun throttleRAF anonyme n’écoute un pointermove (il ne pourrait pas être vidé)', () => {
        expect(source).not.toMatch(/addEventListener\('pointermove',\s*throttleRAF\(/);
    });
});
