import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// =====================================================================
// #793 — APRÈS UN IMPORT, LES CINQ BIBLIOTHÈQUES CONDUISENT L'ŒIL (11 oct. 2026)
// =====================================================================
//
// Les grilles redessinaient leur bibliothèque PUIS pointaient la carte importée (rapport
// testeur du 8 sept.). Les cartouches, échelles, pratiques et productions redessinaient
// seulement : la carte arrivait en fin de liste, hors de vue. Le geste vit maintenant dans
// `BibliothequeUI.conduireAuxImportes`, appelé par les cinq `confirmerImportX`.
//   A — le geste : rafraîchir, pointer, et dire quand un filtre masque le résultat ;
//   B — les cinq confirmations l'appellent, chacune avec SA modale et ses ids.
// Le rendu réel des grilles reste éprouvé par import-grilles-conduit-a-la-carte.spec.js.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

function monter({ modaleOuverte = true, cartes = [], masquage = false, avecCase = true } = {}) {
    const pointees = [];
    let defilee = 0;
    const carte = (id) => ({
        id, classList: { add: (c) => pointees.push(id + ':' + c), remove() {} },
        scrollIntoView: () => { defilee++; }
    });
    const document = {
        getElementById: (id) => (modaleOuverte && id === 'modalBiblio' ? {
            // La case « Masquer… » de la modale redessinée : présente (grilles, échelles, cartouches) ou non.
            querySelector: (sel) => (avecCase && sel.includes('biblio-toggle-deja-present') ? { checked: masquage } : null)
        } : null),
        querySelectorAll: (sel) => {
            const m = /data-biblio-item-id="([^"]+)"/.exec(sel);
            return m && cartes.includes(m[1]) ? [carte(m[1])] : [];
        },
        querySelector: () => null, addEventListener() {}, removeEventListener() {}
    };
    const w = chargerScript('js/bibliotheque-ui.js', { document, setTimeout: () => 0 });
    w.BibliothequeUI.estMasquerDejaPresentActif = () => masquage;
    return { w, pointees, defilee: () => defilee };
}

describe('#793 · A — conduireAuxImportes', () => {
    it('A.a modale ouverte : rafraîchie, puis la carte importée pointée ; aucune phrase', async () => {
        const { w, pointees, defilee } = monter({ cartes: ['ECH_1'] });
        let rafraichie = 0;
        const ligne = await w.BibliothequeUI.conduireAuxImportes('modalBiblio', async () => { rafraichie++; }, ['ECH_1']);
        expect(rafraichie).toBe(1);
        expect(pointees).toEqual(['ECH_1:biblio-carte--pointee']);
        expect(defilee()).toBe(1);
        expect(ligne).toBe(null);
    });

    it('A.b modale fermée : rien n\'est redessiné ni pointé', async () => {
        const { w, pointees } = monter({ modaleOuverte: false, cartes: ['ECH_1'] });
        let rafraichie = 0;
        const ligne = await w.BibliothequeUI.conduireAuxImportes('modalBiblio', () => { rafraichie++; }, ['ECH_1']);
        expect(rafraichie).toBe(0);
        expect(pointees).toEqual([]);
        expect(ligne).toBe(null);
    });

    it('A.c aucune carte ne porte l\'import, case « Masquer » cochée : la phrase le dit', async () => {
        const { w } = monter({ cartes: [], masquage: true });
        const ligne = await w.BibliothequeUI.conduireAuxImportes('modalBiblio', () => {}, ['ECH_1']);
        expect(ligne).toContain('décoche « Masquer les éléments déjà dans ta sélection »');
    });

    it('A.d aucune carte, case présente mais décochée (un dossier, un autre filtre) : rien n\'est dit', async () => {
        const { w } = monter({ cartes: [], masquage: false });
        expect(await w.BibliothequeUI.conduireAuxImportes('modalBiblio', () => {}, ['ECH_1'])).toBe(null);
    });

    it('A.d bis les GRILLES gardent leur phrase d\'avant (repliFiltre), les autres non', async () => {
        const { w } = monter({ cartes: [], masquage: false });
        expect(await w.BibliothequeUI.conduireAuxImportes('modalBiblio', () => {}, ['G1'], { repliFiltre: true }))
            .toBe('Aucune n\'apparaît dans la liste : un filtre d\'affichage les masque ici.');
        const src = readFileSync(path.join(racine, 'js', 'grilles.js'), 'utf8');
        expect(src).toContain("idsImportes, { repliFiltre: true })");
        for (const f of ['echelles.js', 'cartouches.js', 'pratiques-gestion.js', 'productions-import-export.js']) {
            expect(readFileSync(path.join(racine, 'js', f), 'utf8'), f).not.toContain('repliFiltre');
        }
    });

    it('A.e aucune carte, préférence cochée mais modale SANS case (Productions, Pratiques) : rien n\'est dit', async () => {
        const { w } = monter({ cartes: [], masquage: true, avecCase: false });
        expect(await w.BibliothequeUI.conduireAuxImportes('modalBiblio', () => {}, ['ECH_1'])).toBe(null);
    });
});

describe('#793 · B — les cinq confirmations d\'import passent par le geste', () => {
    const FAMILLES = [
        ['grilles.js', 'confirmerImportGrilles', 'modalBibliothequeGrilles'],
        ['echelles.js', 'confirmerImportEchelles', 'modalBibliothequeEchelles'],
        ['cartouches.js', 'confirmerImportCartouches', 'modalBibliothequeCartouches'],
        ['pratiques-gestion.js', 'confirmerImportPratiques', 'modalBibliothequePratiques'],
        ['productions-import-export.js', 'confirmerImportProductions', 'modalBibliothequeProductions']
    ];
    FAMILLES.forEach(([fichier, fonction, modale]) => {
        it(`B · ${fonction}`, () => {
            const src = readFileSync(path.join(racine, 'js', fichier), 'utf8');
            const corps = tranche(src, 'window.' + fonction + ' = async function', '\n};');
            expect(corps).toMatch(new RegExp("conduireAuxImportes\\(\\s*'" + modale + "'"));
            expect(corps).toMatch(/idsImportes\.push\(/);
            expect(corps).toMatch(/ligneMasquee \|\| /);
        });
    });
});
