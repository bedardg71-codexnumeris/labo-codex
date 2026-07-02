import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// #361 — sentinelle suppression définitive de trimestre (2 juillet 2026).
// Remplace le stub supprimerTrimestreActif (alert « pas encore disponible »).
// ZONE SENSIBLE (perte de données) — contrat verrouillé :
//  1. GARDE ANTI-ACTIF : supprimer le trimestre ACTIF est REFUSÉ et ne touche
//     à AUCUNE donnée (cette sentinelle doit ROUGIR si la garde est contournée) ;
//  2. la suppression d'un trimestre inactif efface UNIQUEMENT ses clés
//     (union IDB + localStorage + memoryCache ; id exact, préfixe `<id>_`,
//     id inclus), jamais celles des autres trimestres ni le registre ;
//  3. le registre `trimestres` et le global `cours` sont nettoyés de leurs
//     entrées, db.flush() est appelé (durabilité) ;
//  4. parcours UI : garde anti-actif AVANT toute confirmation ; nom ressaisi
//     inexact → annulation sans suppression ; parcours complet → export de
//     sauvegarde PUIS suppression.

const REGISTRE = () => ([
    { id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true },
    { id: 'a2024', nom: 'Automne 2024', session: 'A', annee: 2024, actif: false }
]);

let stores;      // stockage clé→valeur (sync)
let clesIDB;     // ce que db.keys() (IndexedDB) rend
let supprimees;  // clés passées à db.remove
let flushAppele;
let db;

function creerDb() {
    stores = new Map();
    stores.set('trimestres', REGISTRE());
    stores.set('cours', [
        { id: 'C-A24', trimestreId: 'a2024', nom: 'Cours A24' },
        { id: 'C-H26', trimestreId: 'h2026', nom: 'Cours H26' }
    ]);
    clesIDB = [
        'trimestres',
        'h2026_groupeEtudiants',
        'h2026_evaluationsSauvegardees',
        'a2024_groupeEtudiants',
        'a2024_evaluationsSauvegardees',
        'a2024',
        'cleSansRapport'
    ];
    supprimees = [];
    flushAppele = false;

    db = {
        getSync: (k, d) => (stores.has(k) ? stores.get(k) : (d !== undefined ? d : null)),
        setSync: (k, v) => { stores.set(k, v); },
        keys: async () => [...clesIDB],
        remove: async (k) => { supprimees.push(k); },
        flush: async () => { flushAppele = true; },
        memoryCache: new Map([
            ['a2024_snapshots_GC123', {}],
            ['h2026_presences', []]
        ])
    };
    return db;
}

describe('#361 · supprimerTrimestre (cœur, trimestres.js)', () => {
    let win;

    beforeEach(() => {
        win = chargerScript('js/trimestres.js', {
            db: creerDb(),
            obtenirDonneesSelonMode: () => []
        });
    });

    it('GARDE ANTI-ACTIF : refuse le trimestre actif et ne touche à RIEN', async () => {
        const res = await win.supprimerTrimestre('h2026');

        expect(res.success).toBe(false);
        expect(res.error).toMatch(/ACTIF/i);
        expect(supprimees).toEqual([]);                       // aucune clé effacée
        expect(stores.get('trimestres')).toHaveLength(2);     // registre intact
        expect(stores.get('cours')).toHaveLength(2);          // global intact
    });

    it('trimestre inexistant → refus, rien touché', async () => {
        const res = await win.supprimerTrimestre('x9999');
        expect(res.success).toBe(false);
        expect(supprimees).toEqual([]);
    });

    it('supprime UNIQUEMENT les clés du trimestre visé (union IDB + memoryCache)', async () => {
        const res = await win.supprimerTrimestre('a2024');

        expect(res.success).toBe(true);
        expect(supprimees.sort()).toEqual([
            'a2024',
            'a2024_evaluationsSauvegardees',
            'a2024_groupeEtudiants',
            'a2024_snapshots_GC123'   // vue par memoryCache SEULEMENT — l'union est obligatoire
        ]);
        // Jamais les clés d'un autre trimestre, ni le registre, ni les clés neutres
        expect(supprimees).not.toContain('h2026_groupeEtudiants');
        expect(supprimees).not.toContain('trimestres');
        expect(supprimees).not.toContain('cleSansRapport');
    });

    it('nettoie le registre + le global cours, et draine (flush)', async () => {
        const res = await win.supprimerTrimestre('a2024');

        expect(res.success).toBe(true);
        expect(res.nbCles).toBe(4);
        expect(stores.get('trimestres').map(t => t.id)).toEqual(['h2026']);
        expect(stores.get('cours').map(c => c.id)).toEqual(['C-H26']);
        expect(flushAppele).toBe(true);
    });
});

describe('#361 · confirmerSuppressionTrimestre (parcours UI, trimestre-v2-liste.js)', () => {
    let win;
    let alertes;
    let supprimerTrimestreMock;
    let exporterMock;
    let reponses; // { confirm: [...], prompt: [...] }

    function creerUI(exporter) {
        alertes = [];
        supprimerTrimestreMock = vi.fn(async () => ({ success: true, nbCles: 4, nom: 'Automne 2024' }));
        exporterMock = exporter || vi.fn(() => ({ success: true, nomFichier: 'x.json' }));

        win = chargerScript('js/trimestre-v2-liste.js', {
            obtenirTrimestres: () => REGISTRE(),
            obtenirTrimestreActif: () => REGISTRE().find(t => t.actif),
            supprimerTrimestre: supprimerTrimestreMock,
            exporterTrimestreArchive: exporterMock,
            alert: (msg) => { alertes.push(String(msg)); },
            confirm: () => reponses.confirm.shift(),
            prompt: () => reponses.prompt.shift()
        });
    }

    beforeEach(() => {
        reponses = { confirm: [], prompt: [] };
        creerUI();
    });

    it('zéro-dette : le stub supprimerTrimestreActif est retiré', () => {
        expect(win.supprimerTrimestreActif).toBeUndefined();
        expect(typeof win.confirmerSuppressionTrimestre).toBe('function');
    });

    it('garde anti-actif AVANT toute confirmation : alerte, aucune suppression', () => {
        win.confirmerSuppressionTrimestre('h2026');

        expect(alertes.join(' ')).toMatch(/ne peut pas être supprimé/i);
        expect(supprimerTrimestreMock).not.toHaveBeenCalled();
        expect(exporterMock).not.toHaveBeenCalled();
    });

    it('nom ressaisi inexact → suppression annulée', () => {
        reponses.confirm = [true];
        reponses.prompt = ['Automne 2025']; // faute de frappe

        win.confirmerSuppressionTrimestre('a2024');

        expect(alertes.join(' ')).toMatch(/ne correspond pas/i);
        expect(supprimerTrimestreMock).not.toHaveBeenCalled();
    });

    it('parcours complet : export de sauvegarde PUIS suppression', async () => {
        reponses.confirm = [true];
        reponses.prompt = ['Automne 2024']; // nom exact

        win.confirmerSuppressionTrimestre('a2024');
        await new Promise(r => setTimeout(r, 0));

        expect(exporterMock).toHaveBeenCalledWith('a2024');
        expect(supprimerTrimestreMock).toHaveBeenCalledWith('a2024');
        expect(exporterMock.mock.invocationCallOrder[0])
            .toBeLessThan(supprimerTrimestreMock.mock.invocationCallOrder[0]);
        expect(alertes.join(' ')).toMatch(/supprimé/i);
    });

    it('export raté + refus de continuer sans filet → aucune suppression', () => {
        creerUI(vi.fn(() => ({ success: false, error: 'boom' })));
        reponses.confirm = [true, false]; // continuer ; puis REFUS de supprimer sans export
        reponses.prompt = ['Automne 2024'];

        win.confirmerSuppressionTrimestre('a2024');

        expect(supprimerTrimestreMock).not.toHaveBeenCalled();
    });
});
