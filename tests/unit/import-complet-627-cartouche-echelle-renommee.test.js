import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #627 (12 oct. 2026, relecture de Cowork) — UN COMPORTEMENT FIGÉ, PAS UN CORRECTIF.
//
// Import complet : une cartouche identique à une cartouche en place, dont seule l'échelle
// a été renommée pour conflit, est rebranchée sur l'échelle reçue — donc différente de
// celle en place — donc importée À CÔTÉ, sous un id neuf. C'est voulu : elle désigne
// l'échelle qui arrive avec elle, pas l'échelle locale du même id (l'import sélectif
// faisait déjà ainsi). C'est l'inverse du choix #654 pour les PRODUCTIONS identiques en
// place, qui gardent leur cartouche. Cet essai fige les deux, de bout en bout, par le vrai
// chemin : le choix du fichier dans la fenêtre d'import (ouvrirModalImport → previsualiserImport),
// puis « Importer » (executerImportConfigComplete).

class FauxFileReader {
    readAsText(fichier) { this.onload({ target: { result: fichier.texte } }); }
}

function monter(stock) {
    const magasin = new Map(Object.entries(stock).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))]));
    const db = {
        getSync: (k, d) => (magasin.has(k) ? JSON.parse(JSON.stringify(magasin.get(k))) : d),
        setSync: (k, v) => { magasin.set(k, JSON.parse(JSON.stringify(v))); },
        flush: async () => {}
    };
    const element = () => ({ innerHTML: '', value: '', style: {}, classList: { add() {}, remove() {} },
        appendChild() {}, remove() {}, addEventListener() {}, setAttribute() {}, parentElement: { remove() {} } });
    const elements = {};
    const document = {
        getElementById: (id) => (elements[id] = elements[id] || element()),
        querySelector: () => null, querySelectorAll: () => [],
        createElement: element, body: { appendChild() {} }, addEventListener() {}
    };
    let n = 0;
    const succes = [];
    const w = chargerScript('js/import-export.js', {
        db, document, FileReader: FauxFileReader,
        cle: (k) => k,
        genererIdUnique: (p) => p + 'NEUF_' + (++n),
        echapperHtml: (t) => String(t),
        notifications: { succes(m) { succes.push(m); }, warning() {}, erreur() {} },
        confirm: () => false, alert() {}
    });
    return { w, magasin, elements, succes };
}

const ECHELLE_LOCALE = { id: 'E1', nom: 'Échelle locale', niveaux: [{ code: 'I', nom: 'Insuffisant' }] };
const ECHELLE_RECUE = { id: 'E1', nom: 'Échelle reçue', niveaux: [{ code: 'M', nom: 'Maîtrise' }] };
const GRILLE = { id: 'G1', nom: 'Grille commune' };
const CARTOUCHE = { id: 'C1', nom: 'Cartouche commune', grilleId: 'G1', echelleId: 'E1' };
const PRODUCTION = { id: 'P1', titre: 'Dissertation', grilleId: 'G1', cartoucheId: 'C1' };

async function importer(stock, contenu) {
    const { w, magasin, elements, succes } = monter(stock);
    const config = { metadata: { type: 'configuration-complete', nom: 'Essai fictif' }, contenu };
    w.ouvrirModalImport();
    await elements.fichierImport.onchange({ target: { files: [
        { name: 'config-fictive.json', type: 'application/json', size: 10, texte: JSON.stringify(config) }] } });
    await w.executerImportConfigComplete();
    expect(succes, 'l\'import est allé au bout').toHaveLength(1);
    return magasin;
}

describe('#627 · import complet — cartouche identique dont l\'échelle a été renommée', () => {
    it('la cartouche reçue pointe l\'échelle reçue et s\'importe à côté de celle en place', async () => {
        const m = await importer(
            { echellesTemplates: [ECHELLE_LOCALE], grillesTemplates: [GRILLE], cartouches_G1: [CARTOUCHE] },
            { echelles: [ECHELLE_RECUE], grilles: [GRILLE], cartouches: { G1: [CARTOUCHE] } }
        );
        const echelles = m.get('echellesTemplates');
        expect(echelles.map(e => e.id)).toEqual(['E1', 'ECH_NEUF_1']);
        const cartouches = m.get('cartouches_G1');
        expect(cartouches, 'deux cartouches : celle en place et la reçue').toHaveLength(2);
        expect(cartouches[0]).toMatchObject({ id: 'C1', echelleId: 'E1' });
        expect(cartouches[1].id, 'la reçue reçoit un id neuf').not.toBe('C1');
        expect(cartouches[1].echelleId, 'elle désigne l\'échelle reçue, pas la locale').toBe('ECH_NEUF_1');
    });

    it('témoin : sans renommage d\'échelle, la cartouche identique n\'est pas réimportée', async () => {
        const m = await importer(
            { echellesTemplates: [ECHELLE_LOCALE], grillesTemplates: [GRILLE], cartouches_G1: [CARTOUCHE] },
            { echelles: [ECHELLE_LOCALE], grilles: [GRILLE], cartouches: { G1: [CARTOUCHE] } }
        );
        expect(m.get('cartouches_G1')).toHaveLength(1);
    });

    it('#654 en regard : une production identique en place garde sa cartouche', async () => {
        const m = await importer(
            { echellesTemplates: [ECHELLE_LOCALE], grillesTemplates: [GRILLE], cartouches_G1: [CARTOUCHE], productions: [PRODUCTION] },
            { echelles: [ECHELLE_RECUE], grilles: [GRILLE], cartouches: { G1: [CARTOUCHE] }, productions: [PRODUCTION] }
        );
        const prods = m.get('productions');
        expect(prods, 'pas de production jumelle').toHaveLength(1);
        expect(prods[0].cartoucheId).toBe('C1');
    });
});
