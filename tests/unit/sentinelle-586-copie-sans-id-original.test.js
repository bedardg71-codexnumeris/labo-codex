import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =====================================================================
// #586 — UNE COPIE NE RÉPOND PAS À L'IDENTIFIANT DE SA SOURCE (11 oct. 2026)
// =====================================================================
//
// `idOriginal` est la trace d'un AJOUT depuis la bibliothèque : les résolveurs trouvent un
// élément par `x.id === id || x.idOriginal === id`, et le PREMIER du tableau gagne. Une copie
// faite par « Dupliquer » qui l'emporte devient une jumelle : les deux répondent au même id.
// `dupliquerEchelle` s'en protégeait (liste blanche, #555) ; la barre latérale, la
// bibliothèque et « Dupliquer et éditer » l'emportaient. Option B de Grégoire (28 août) : les
// CINQ familles. Chaque chemin de duplication par étalement ou clone retire désormais le champ,
// à côté de `auteurOriginal`. Les chemins à liste blanche (dupliquerGrille, dupliquerEchelle,
// dupliquerPratique) ne le recopiaient déjà pas.
// Source seulement : les jumelles déjà écrites chez l'utilisateur restent.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('#586 · A — chaque copie qui retire `auteurOriginal` retire aussi `idOriginal`', () => {
    const fichiers = readdirSync(path.join(racine, 'js')).filter((f) => f.endsWith('.js'));
    const sites = [];
    fichiers.forEach((f) => {
        const lignes = readFileSync(path.join(racine, 'js', f), 'utf8').split('\n');
        lignes.forEach((l, i) => {
            const m = /^\s*delete (\w+)\.auteurOriginal;/.exec(l);
            if (m) sites.push({ f, ligne: i + 1, v: m[1], suivante: lignes[i + 1] || '' });
        });
    });

    it('A.a les huit sites recensés le 11 oct. sont tous trouvés', () => {
        expect(sites.map((s) => s.f).sort()).toEqual([
            'bibliotheque-ui.js', 'bibliotheque-ui.js', 'cartouches.js', 'echelles.js',
            'grilles.js', 'pratiques-gestion.js', 'pratiques-gestion.js', 'productions-liste.js'
        ]);
    });

    it('A.b chacun est suivi de `delete <copie>.idOriginal`', () => {
        const fautifs = sites.filter((s) => !new RegExp('^\\s*delete ' + s.v + '\\.idOriginal;').test(s.suivante));
        expect(fautifs.map((s) => s.f + ':' + s.ligne)).toEqual([]);
    });
});

describe('#586 · B — forkerItem (« Dupliquer et éditer », cinq familles)', () => {
    const w = chargerScript('js/bibliotheque-ui.js', { genererIdUnique: (p) => p + 'NEUF', nommerCopie: (n) => n + ' (copie)' });

    it('B.a la copie d\'une échelle ajoutée depuis la bibliothèque ne porte plus son idOriginal', () => {
        const source = { id: 'ECH_LOCALE', idOriginal: 'ECH_BIBLIO', nom: 'Échelle fictive', niveaux: [{ code: 'M' }] };
        const copie = w.BibliothequeUI.forkerItem(source, 'ECH_', []);
        expect(copie.id).not.toBe('ECH_LOCALE');
        expect('idOriginal' in copie).toBe(false);
        expect(source.idOriginal).toBe('ECH_BIBLIO');
        expect(copie.niveaux).toEqual([{ code: 'M' }]);
    });
});
