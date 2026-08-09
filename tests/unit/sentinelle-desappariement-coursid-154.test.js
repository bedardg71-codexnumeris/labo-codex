import { describe, it, expect, vi, afterEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #154 — un filtre qui avale TOUT doit le dire
// =======================================================================
//
// Terrain du 9 août 2026 (Grégoire, Chrome) : les 11 productions H26
// portaient le coursId d'AVANT la migration des ids de cours
// (COURS1766455789356) ; le cours actif s'appelait h2026-601-101-MQ-00001.
// Le filtre de obtenirDonneesSelonMode rendait 0 production — « Aucune
// production configurée », indice C à 0 % — SANS UNE LIGNE DE CONSOLE.
// Résurgence du #346 (copie de navigateur jamais migrée) restée invisible
// parce que l'app confond « tu n'as pas de données » et « tes données
// pointent sur un modèle antérieur ».
//
// Ce qui est verrouillé ici :
//   A. quand le filtre coursId écarte TOUS les items et qu'AUCUN de leurs
//      coursId n'existe dans le magasin `cours`, un console.warn [#154]
//      nomme la clé, les ids inconnus et le script de réparation ;
//   B. une seule fois par clé et par session (pas un flot) ;
//   C. AUCUN warn quand les items écartés appartiennent à un AUTRE cours
//      réel du magasin — c'est le fonctionnement normal en multi-cours ;
//   D. le warn n'altère pas le comportement : le retour reste identique.

function chargerModes(store) {
    const db = {
        getSync: (k, def) => (k in store ? store[k] : def),
        setSync: (k, v) => { store[k] = v; }
    };
    const win = chargerScript('js/modes.js', {
        db, cle: (k) => k,
        obtenirPreference: () => null,
        sauvegarderPreference: () => {}
    });
    win.cle = (k) => k;
    return win;
}

// Contexte type du terrain : GC actif sur le cours consolidé, productions
// restées sur l'id pré-migration.
function storeTerrain() {
    return {
        cours: [{ id: 'h2026-601-101-MQ-00001', codeCours: '601-101-MQ' }],
        infoCours: { id: 'h2026-601-101-MQ-00001', groupe: '00008' },
        groupesCours: [{ id: 'GC_1', actif: true, coursId: 'h2026-601-101-MQ-00001', groupeNum: '00008' }],
        productions: [
            { id: 'p1', coursId: 'COURS1766455789356' },
            { id: 'p2', coursId: 'COURS1766455789356' }
        ]
    };
}

afterEach(() => vi.restoreAllMocks());

describe('#154 · A — le désappariement total est ANNONCÉ', () => {
    it('tout écarté + coursId inconnus du magasin → console.warn [#154] avec la clé et l’id', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const win = chargerModes(storeTerrain());
        const resultat = win.obtenirDonneesSelonMode('productions');
        expect(resultat).toEqual([]);
        const messages = warn.mock.calls.map(c => String(c[0]));
        const m154 = messages.filter(m => m.includes('[#154]'));
        expect(m154.length, 'aucun warn [#154] émis — la rupture est redevenue silencieuse').toBe(1);
        expect(m154[0]).toContain('productions');
        expect(m154[0]).toContain('COURS1766455789356');
        expect(m154[0]).toContain('reparation-154');
    });
});

describe('#154 · B — une fois par clé, pas un flot', () => {
    it('la deuxième lecture de la même clé est silencieuse', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const win = chargerModes(storeTerrain());
        win.obtenirDonneesSelonMode('productions');
        win.obtenirDonneesSelonMode('productions');
        const m154 = warn.mock.calls.map(c => String(c[0])).filter(m => m.includes('[#154]'));
        expect(m154.length).toBe(1);
    });
});

describe('#154 · C — pas de faux positif', () => {
    it('items d’un AUTRE cours réel du magasin → silence (multi-cours normal)', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const store = storeTerrain();
        store.cours.push({ id: 'h2026-601-102-MQ-00001', codeCours: '601-102-MQ' });
        store.productions = [{ id: 'p1', coursId: 'h2026-601-102-MQ-00001' }];
        const win = chargerModes(store);
        expect(win.obtenirDonneesSelonMode('productions')).toEqual([]);
        const m154 = warn.mock.calls.map(c => String(c[0])).filter(m => m.includes('[#154]'));
        expect(m154.length, 'warn émis sur un filtrage multi-cours légitime').toBe(0);
    });

    it('filtre partiel (il reste des items) → silence', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const store = storeTerrain();
        store.productions.push({ id: 'p3', coursId: 'h2026-601-101-MQ-00001' });
        const win = chargerModes(store);
        expect(win.obtenirDonneesSelonMode('productions').length).toBe(1);
        const m154 = warn.mock.calls.map(c => String(c[0])).filter(m => m.includes('[#154]'));
        expect(m154.length).toBe(0);
    });

    it('clé légitimement vide (zéro item au départ) → silence', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const store = storeTerrain();
        store.productions = [];
        const win = chargerModes(store);
        expect(win.obtenirDonneesSelonMode('productions')).toEqual([]);
        const m154 = warn.mock.calls.map(c => String(c[0])).filter(m => m.includes('[#154]'));
        expect(m154.length).toBe(0);
    });
});

describe('#154 · D — le warn ne change RIEN au comportement', () => {
    it('le retour filtré est identique, warn émis ou pas', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        const win = chargerModes(storeTerrain());
        expect(win.obtenirDonneesSelonMode('productions')).toEqual([]);
        // et le chemin sain rend bien ses données
        const storeSain = storeTerrain();
        storeSain.productions = [{ id: 'p1', coursId: 'h2026-601-101-MQ-00001' }];
        const winSain = chargerModes(storeSain);
        expect(winSain.obtenirDonneesSelonMode('productions').length).toBe(1);
    });
});
