import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #1167 — « ← Utiliser dans ma palette » sur un tampon INTÉGRÉ gardé dans la bibliothèque écrivait un doublon
// dans `tamponsPersonnalises` : la garde ne cherchait que parmi les tampons personnels.

function monter({ personnels, integres, bibliotheque }) {
    const store = { tamponsPersonnalises: personnels };
    const erreurs = [];
    const win = chargerScript('js/tampons-bibliotheque.js', {
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
        db: {
            getSync: (k, d) => (k in store ? store[k] : d),
            setSync: (k, v) => { store[k] = v; },
            get: async () => bibliotheque,
            set: async () => {}
        },
        notifications: { succes() {}, erreur: (t) => erreurs.push(t) },
        travauxOutils: { obtenirAutocollants: () => integres.concat(personnels), rechargerTamponsPersonnalises() {} }
    });
    return { win, store, erreurs };
}

describe('#1167 · « ← Utiliser » ne double pas un tampon déjà dans la palette', () => {
    const integre = { id: 'obs-fictif', nom: 'Fictif', categorie: 'observations' };

    it('un tampon intégré gardé dans la bibliothèque : rien ne s\'écrit, et l\'écran le dit', async () => {
        const b = monter({ personnels: [], integres: [integre], bibliotheque: [integre] });
        await b.win.tamponsBibliotheque.ajouterDepuisBibliotheque('obs-fictif');
        expect(b.store.tamponsPersonnalises).toEqual([]);
        expect(b.erreurs).toEqual(['Déjà présent']);
    });

    it('témoin : un tampon absent de la palette y entre', async () => {
        const b = monter({ personnels: [], integres: [integre], bibliotheque: [{ id: 'perso-1', nom: 'Neuf', categorie: 'observations' }] });
        await b.win.tamponsBibliotheque.ajouterDepuisBibliotheque('perso-1');
        expect(b.store.tamponsPersonnalises.map((t) => t.id)).toEqual(['perso-1']);
    });
});
