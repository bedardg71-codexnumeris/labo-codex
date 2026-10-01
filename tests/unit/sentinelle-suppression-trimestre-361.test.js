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
//  3. le registre `trimestres` est nettoyé de son entrée, db.flush() est
//     appelé (durabilité) — et le global `cours` N'EST PLUS touché (#455,
//     19 août 2026 : la fiche de cours est globale, son `trimestreId` legacy
//     est historique et non décisionnel ; l'ancien nettoyage aurait détruit
//     la fiche partagée que les autres trimestres pointent encore) ;
//  4. parcours UI : garde anti-actif AVANT toute confirmation ; nom ressaisi
//     inexact → annulation sans suppression.
//  5. RÉANCRÉ au lot I bis (D9, 30 sept. 2026) — LE FILET EST LE CODEX : la
//     suppression est REFUSÉE tant que le codex n'est pas à jour (pas de codex :
//     même refus), par une fenêtre dont le bouton lance la mise à jour ; codex à
//     jour → confirmation, nom, suppression, et PLUS AUCUN téléchargement
//     (l'ancien point 4 disait « export de sauvegarde PUIS suppression »).
//     Ici, l'ordre des gestes avec des doublures. Le COMPORTEMENT sur la vraie
//     page (ce que l'application contient après) est jugé par
//     tests/integration/lot-i-bis-suppression-trimestre-codex-a-jour.spec.js.

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
    let exporterMock;
    let reponses;   // { confirm: [...], prompt: [...] }
    let questions;  // les textes passés à confirm()
    let refus;      // les fenêtres de refus ouvertes (options de demanderAction)
    let gesteDuRefus; // ce que l'usager choisit dans la fenêtre de refus
    let misesAJour; // appels de Codex.actionEnregistrer

    const A_JOUR = { actif: true, modificationsNonSauvees: false };
    const PAS_A_JOUR = { actif: true, modificationsNonSauvees: true };
    const SANS_CODEX = { actif: false, modificationsNonSauvees: false };

    function creerUI(etatCodex) {
        alertes = [];
        questions = [];
        refus = [];
        misesAJour = 0;
        gesteDuRefus = null;
        supprimerTrimestreMock = vi.fn(async () => ({ success: true, nbCles: 4, nom: 'Automne 2024' }));
        exporterMock = vi.fn(() => ({ success: true, nomFichier: 'x.json' }));

        win = chargerScript('js/trimestre-v2-liste.js', {
            obtenirTrimestres: () => REGISTRE(),
            obtenirTrimestreActif: () => REGISTRE().find(t => t.actif),
            supprimerTrimestre: supprimerTrimestreMock,
            exporterTrimestreArchive: exporterMock,
            Codex: etatCodex === undefined ? undefined : { etat: () => etatCodex, actionEnregistrer: () => { misesAJour++; } },
            uiDialogues: { demanderAction: (options) => { refus.push(options); return Promise.resolve(gesteDuRefus); } },
            alert: (msg) => { alertes.push(String(msg)); },
            confirm: (msg) => { questions.push(String(msg)); return reponses.confirm.shift(); },
            prompt: () => reponses.prompt.shift()
        });
    }

    beforeEach(() => {
        reponses = { confirm: [], prompt: [] };
        creerUI(A_JOUR);
    });

    it('zéro-dette : le stub supprimerTrimestreActif est retiré', () => {
        expect(win.supprimerTrimestreActif).toBeUndefined();
        expect(typeof win.confirmerSuppressionTrimestre).toBe('function');
    });

    it('garde anti-actif AVANT toute confirmation : alerte, aucune suppression', () => {
        win.confirmerSuppressionTrimestre('h2026');

        expect(alertes.join(' ')).toMatch(/ne peut pas être supprimé/i);
        expect(supprimerTrimestreMock).not.toHaveBeenCalled();
        expect(refus).toEqual([]);
        expect(questions).toEqual([]);
    });

    it('nom ressaisi inexact → suppression annulée', () => {
        reponses.confirm = [true];
        reponses.prompt = ['Automne 2025']; // faute de frappe

        win.confirmerSuppressionTrimestre('a2024');

        expect(questions.length).toBe(1); // le parcours a bien atteint la saisie du nom
        expect(alertes.join(' ')).toMatch(/ne correspond pas/i);
        expect(supprimerTrimestreMock).not.toHaveBeenCalled();
    });

    it('codex à jour : la confirmation (mots validés), le nom, puis la suppression — aucun téléchargement', async () => {
        reponses.confirm = [true];
        reponses.prompt = ['Automne 2024']; // nom exact

        win.confirmerSuppressionTrimestre('a2024');
        await new Promise(r => setTimeout(r, 0));

        expect(refus).toEqual([]);
        expect(questions).toEqual([
            'Supprimer définitivement le trimestre « Automne 2024 » ? Toutes ses données seront effacées : étudiant·es, évaluations, présences, productions, captures et modèles. Ton codex à jour les contient encore : garde ce fichier.'
        ]);
        expect(supprimerTrimestreMock).toHaveBeenCalledWith('a2024');
        expect(exporterMock).not.toHaveBeenCalled();
        expect(alertes.join(' ')).toMatch(/supprimé/i);
    });

    for (const [cas, etat, texte] of [
        ['codex pas à jour', PAS_A_JOUR, 'Supprimer un trimestre efface ses données pour de bon. Ton codex n\'a pas tes derniers changements : mets-le à jour, puis recommence.'],
        ['sans codex', SANS_CODEX, 'Supprimer un trimestre efface ses données pour de bon. Tu n\'as pas encore de codex : crée-le avec le bouton ci-dessous, puis recommence.'],
        ['module du codex absent', undefined, 'Supprimer un trimestre efface ses données pour de bon. Tu n\'as pas encore de codex : crée-le avec le bouton ci-dessous, puis recommence.']
    ]) {
        it(`${cas} : refus AVANT toute confirmation, aucune suppression, et le bouton nomme le geste`, async () => {
            creerUI(etat);
            reponses.confirm = [true];
            reponses.prompt = ['Automne 2024'];

            win.confirmerSuppressionTrimestre('a2024');
            await new Promise(r => setTimeout(r, 0));

            expect(refus.length).toBe(1);
            expect(refus[0].titre).toBe('Mets d\'abord ton codex à jour');
            expect(refus[0].message).toBe(texte);
            expect(refus[0].actions).toEqual([{ valeur: 'mettre-a-jour', texte: 'Mettre à jour le codex', principal: true }]);
            expect(questions).toEqual([]);
            expect(supprimerTrimestreMock).not.toHaveBeenCalled();
            expect(exporterMock).not.toHaveBeenCalled();
            expect(misesAJour).toBe(0); // la fenêtre fermée sans choisir ne lance rien
        });
    }

    it('le bouton du refus lance la mise à jour du codex par le chemin du menu, et ne supprime rien', async () => {
        creerUI(PAS_A_JOUR);
        gesteDuRefus = 'mettre-a-jour';

        win.confirmerSuppressionTrimestre('a2024');
        await new Promise(r => setTimeout(r, 0));

        expect(misesAJour).toBe(1);
        expect(supprimerTrimestreMock).not.toHaveBeenCalled();
    });
});
