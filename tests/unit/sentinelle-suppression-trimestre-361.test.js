import { describe, it, expect, beforeEach, vi } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// #361 — sentinelle suppression définitive de trimestre (2 juillet 2026).
// Remplace le stub supprimerTrimestreActif (alert « pas encore disponible »).
// ZONE SENSIBLE (perte de données) — contrat verrouillé :
//  1. GARDE ANTI-ACTIF : supprimer le trimestre ACTIF est REFUSÉ et ne touche
//     à AUCUNE donnée (cette sentinelle doit ROUGIR si la garde est contournée) ;
//  2. la suppression d'un trimestre inactif efface UNIQUEMENT ses clés
//     (union IDB + localStorage + memoryCache ; id exact, préfixe `<id>_`,
//     id inclus), jamais celles des autres trimestres ni le registre ;
//  3. le registre `trimestres` est nettoyé de son entrée, db.flush() est
//     appelé (durabilité) — et le global `cours` N'EST PLUS touché (#455,
//     19 août 2026 : la fiche de cours est globale, son `trimestreId` legacy
//     est historique et non décisionnel ; l'ancien nettoyage aurait détruit
//     la fiche partagée que les autres trimestres pointent encore) ;
//  4. parcours UI : garde anti-actif AVANT toute confirmation ; nom ressaisi
//     inexact → annulation sans suppression.
//  5. RÉANCRÉ à #1007 (2 oct. 2026) — LE FILET EST UN CODEX À PART : après la
//     garde anti-actif, `Codex.ecrireAPartAvantSuppression` d'abord (la phrase
//     du trimestre) ; rien d'écrit (Annuler, échec, module absent) → aucune
//     question, aucune suppression ; écrit → confirmation, nom, suppression,
//     aucun téléchargement. Le refus « codex pas à jour » du lot I bis est retiré.
//     Ici, l'ordre des gestes avec des doublures. Le COMPORTEMENT sur la vraie
//     page est jugé par tests/integration/1007-codex-a-part-avant-suppression.spec.js.

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

    it('nettoie le registre, PRÉSERVE le global cours (#455), et draine (flush)', async () => {
        const res = await win.supprimerTrimestre('a2024');

        expect(res.success).toBe(true);
        expect(res.nbCles).toBe(4);
        expect(stores.get('trimestres').map(t => t.id)).toEqual(['h2026']);
        // #455 : la fiche de cours est GLOBALE — même celle dont le
        // `trimestreId` legacy pointe le trimestre supprimé SURVIT (c'est un
        // champ historique ; la fiche réelle de Grégoire porte "h2026" et
        // sert A26). L'ancien contrat la détruisait.
        expect(stores.get('cours').map(c => c.id)).toEqual(['C-A24', 'C-H26']);
        expect(flushAppele).toBe(true);
    });
});

describe('#361 · confirmerSuppressionTrimestre (parcours UI, trimestre-v2-liste.js)', () => {
    let win;
    let alertes;
    let supprimerTrimestreMock;
    let reponses;   // { confirm: [...], prompt: [...] }
    let questions;  // les textes passés à confirm()
    let codexAPart; // les phrases passées à Codex.ecrireAPartAvantSuppression
    let codexEcrit; // ce que rend le codex à part

    function creerUI(avecCodex) {
        alertes = [];
        questions = [];
        codexAPart = [];
        codexEcrit = true;
        supprimerTrimestreMock = vi.fn(async () => ({ success: true, nbCles: 4, nom: 'Automne 2024' }));

        win = chargerScript('js/trimestre-v2-liste.js', {
            obtenirTrimestres: () => REGISTRE(),
            obtenirTrimestreActif: () => REGISTRE().find(t => t.actif),
            supprimerTrimestre: supprimerTrimestreMock,
            Codex: avecCodex ? { ecrireAPartAvantSuppression: async (phrase) => { codexAPart.push(phrase); return codexEcrit; } } : undefined,
            alert: (msg) => { alertes.push(String(msg)); },
            confirm: (msg) => { questions.push(String(msg)); return reponses.confirm.shift(); },
            prompt: () => reponses.prompt.shift()
        });
    }

    beforeEach(() => {
        reponses = { confirm: [], prompt: [] };
        creerUI(true);
    });

    it('zéro-dette : le stub supprimerTrimestreActif et la garde « codex à jour » sont retirés', () => {
        expect(win.supprimerTrimestreActif).toBeUndefined();
        // Fonctions privées (jamais posées sur window) : lues dans la source.
        const source = readFileSync(path.resolve(__dirname, '..', '..', 'js', 'trimestre-v2-liste.js'), 'utf8');
        expect(source).not.toMatch(/etatDuCodexPourSuppression|refuserSuppressionCodexPasAJour|fais d'abord une copie de ce fichier/);
        expect(typeof win.confirmerSuppressionTrimestre).toBe('function');
    });

    it('garde anti-actif AVANT tout : alerte, ni codex à part, ni suppression', async () => {
        await win.confirmerSuppressionTrimestre('h2026');

        expect(alertes.join(' ')).toMatch(/ne peut pas être supprimé/i);
        expect(supprimerTrimestreMock).not.toHaveBeenCalled();
        expect(codexAPart).toEqual([]);
        expect(questions).toEqual([]);
    });

    it('nom ressaisi inexact → suppression annulée', async () => {
        reponses.confirm = [true];
        reponses.prompt = ['Automne 2025']; // faute de frappe

        await win.confirmerSuppressionTrimestre('a2024');

        expect(questions.length).toBe(1); // le parcours a bien atteint la saisie du nom
        expect(alertes.join(' ')).toMatch(/ne correspond pas/i);
        expect(supprimerTrimestreMock).not.toHaveBeenCalled();
    });

    it('codex à part écrit : sa phrase, puis la confirmation (sans la phrase du codex à jour), le nom, la suppression', async () => {
        reponses.confirm = [true];
        reponses.prompt = ['Automne 2024']; // nom exact

        await win.confirmerSuppressionTrimestre('a2024');
        await new Promise(r => setTimeout(r, 0));

        expect(codexAPart).toEqual([
            'Supprimer le trimestre « Automne 2024 » efface pour de bon ses étudiant·es, ses évaluations, ses présences, ses productions, ses captures et ses modèles.'
        ]);
        expect(questions).toEqual([
            'Supprimer définitivement le trimestre « Automne 2024 » ? Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles.'
        ]);
        expect(supprimerTrimestreMock).toHaveBeenCalledWith('a2024');
        expect(alertes.join(' ')).toMatch(/supprimé/i);
    });

    for (const [cas, avecCodex] of [['codex à part non écrit (Annuler ou échec)', true], ['module du codex absent', false]]) {
        it(`${cas} : ni question, ni suppression`, async () => {
            creerUI(avecCodex);
            codexEcrit = false;
            reponses.confirm = [true];
            reponses.prompt = ['Automne 2024'];

            await win.confirmerSuppressionTrimestre('a2024');
            await new Promise(r => setTimeout(r, 0));

            expect(codexAPart).toHaveLength(avecCodex ? 1 : 0);
            expect(questions).toEqual([]);
            expect(supprimerTrimestreMock).not.toHaveBeenCalled();
        });
    }
});
