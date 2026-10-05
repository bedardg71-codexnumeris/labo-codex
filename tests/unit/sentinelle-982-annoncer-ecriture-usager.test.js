import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// ═══════════════════════════════════════════════════════════════════════════
// #982 — « ENREGISTRÉ » PARTOUT (5 oct. 2026, décision de Grégoire de 18 h 32)
// Les gestes de l'usager qui écrivaient hors du témoin (liste figée par
// sentinelle-lot-F-gestes-hors-temoin.test.js) appellent désormais
// `annoncerEcritureUsager(cle)` (`modes.js`) :
//   - le codex est prévenu TOUT DE SUITE, comme avant (`signalerEcritureUsager`) ;
//   - les clés reçues dans une courte fenêtre (100 ms, relancée à chaque appel) forment UN
//     geste : un seul « Enregistré », après la dernière (mesuré : la suppression d'une
//     ressource fait jusqu'à quatre raccords ; une boucle d'import, N) ;
//   - la règle du lot 1 : grosse clé → « Enregistré » au commit ; échec → « Non enregistré » ;
//   - les commits attendus sont CAPTURÉS à l'appel : un échec survenu pendant la fenêtre ne
//     se fait pas effacer par un « Enregistré » à la fin.
//
// `modes.js` RÉEL ; `db` et le témoin sont des doublures qui enregistrent.
// ═══════════════════════════════════════════════════════════════════════════

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
const FENETRE = 160;   // > 100 ms

function deferred() {
    let resolve, reject;
    const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
    promise.catch(() => {});
    return { promise, resolve, reject };
}

function monter() {
    const appels = [];
    const signaux = [];
    const attentes = new Map();
    let cleEchec = null;
    const db = {
        getSync: () => null, setSync: () => true,
        get: async () => null, set: async () => {}, removeSync: () => {},
        enregistrerGardeEcriture: () => {}, surEcriture: () => {}, surEchecEcriture: () => {},
        commitEnAttente: (k) => attentes.get(k) || null
    };
    const cle = (k) => 'a2026_' + k;
    const win = {
        addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'a2026', cle,
        signalerEcritureUsager: (k) => signaux.push(k),
        temoinEnregistrement: {
            enregistre: (k) => { appels.push(['enregistre', k]); if (k === cleEchec) cleEchec = null; },
            nonEnregistre: (raison, geste, k) => { appels.push(['nonEnregistre', raison, geste, k]); cleEchec = k; },
            fermer: () => {}, fermerSi: (k) => { if (k === cleEchec) cleEchec = null; },
            echecSur: (k) => cleEchec !== null && k === cleEchec
        }
    };
    const notifications = { succes() {}, erreur() {}, warning() {}, info() {} };
    chargerScript('js/modes.js', { db, cle, notifications, obtenirPreference: () => null, definirPreference: () => {} }, win);
    const commit = (k, grosse) => { const d = deferred(); attentes.set(k, { commit: d.promise, grosse }); return d; };
    const enregistres = () => appels.filter((a) => a[0] === 'enregistre');
    return { win, appels, signaux, attentes, commit, enregistres };
}

describe('#982 · annoncerEcritureUsager : un geste, un « Enregistré »', () => {
    it('le codex est prévenu tout de suite ; « Enregistré » après la fenêtre, une fois', async () => {
        const b = monter();
        b.win.annoncerEcritureUsager('cours');
        expect(b.signaux).toEqual(['cours']);
        expect(b.enregistres()).toEqual([]);
        await attendre(FENETRE);
        expect(b.enregistres()).toEqual([['enregistre', 'cours']]);
    });

    it('plusieurs raccords d\'un même geste (la suppression d\'une ressource) : UN « Enregistré », sur la dernière clé', async () => {
        const b = monter();
        b.win.annoncerEcritureUsager('ressourcesSupprimees');
        b.win.annoncerEcritureUsager('bibliothequeGrilles');
        await attendre(20);
        b.win.annoncerEcritureUsager('repertoires');
        b.win.annoncerEcritureUsager('a2026_grillesTemplates');
        await attendre(FENETRE);
        expect(b.enregistres()).toEqual([['enregistre', 'a2026_grillesTemplates']]);
        expect(b.signaux).toHaveLength(4);
    });

    it('une liste de clés : un seul « Enregistré »', async () => {
        const b = monter();
        b.win.annoncerEcritureUsager(['a2026_groupesCours', 'groupeCoursActif']);
        await attendre(FENETRE);
        expect(b.enregistres()).toEqual([['enregistre', 'groupeCoursActif']]);
    });

    it('deux gestes séparés par plus que la fenêtre : deux « Enregistré »', async () => {
        const b = monter();
        b.win.annoncerEcritureUsager('cours');
        await attendre(FENETRE);
        b.win.annoncerEcritureUsager('cours');
        await attendre(FENETRE);
        expect(b.enregistres()).toHaveLength(2);
    });
});

describe('#982 · la règle du lot 1 s\'applique aux gestes hors témoin', () => {
    it('grosse clé : rien avant son commit, même après la fenêtre ; « Enregistré » au commit', async () => {
        const b = monter();
        const d = b.commit('a2026_fichiersTravaux', true);
        b.win.annoncerEcritureUsager('a2026_fichiersTravaux');
        await attendre(FENETRE);
        expect(b.enregistres()).toEqual([]);
        d.resolve();
        await attendre(0);
        expect(b.enregistres()).toEqual([['enregistre', 'a2026_fichiersTravaux']]);
    });

    it('un commit qui échoue : « Non enregistré » avec sa clé, jamais « Enregistré »', async () => {
        const b = monter();
        const d = b.commit('a2026_productions', false);
        b.win.annoncerEcritureUsager('a2026_productions');
        d.reject(Object.assign(new Error('quota'), { name: 'QuotaExceededError' }));
        await attendre(FENETRE);
        expect(b.enregistres()).toEqual([]);
        const e = b.appels.find((a) => a[0] === 'nonEnregistre');
        expect(e[1]).toMatch(/mémoire du navigateur est pleine/);
        expect(e[3]).toBe('a2026_productions');
    });

    it('le commit est CAPTURÉ à l\'appel : échoué et oublié de db pendant la fenêtre, il fait quand même dire l\'échec', async () => {
        const b = monter();
        const d = b.commit('a2026_productions', false);
        b.win.annoncerEcritureUsager('a2026_productions');
        d.reject(new Error('connexion'));
        b.attentes.delete('a2026_productions');   // db oublie un commit terminé
        await attendre(FENETRE);
        expect(b.enregistres()).toEqual([]);
        expect(b.appels.some((a) => a[0] === 'nonEnregistre' && a[3] === 'a2026_productions')).toBe(true);
    });
});
