import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #648 (3 septembre 2026) — SUPPRIMER UNE ÉCHELLE EST UN REMPLACEMENT.
//
// Décision de Grégoire : « On supprime une échelle pour la remplacer par une
// autre. Une évaluation ne tient pas s'il n'y a pas d'échelle. Le geste est
// incomplet, il doit être suivi d'un remplacement ou d'une correction. »
//
// Ce que la sentinelle verrouille, sur la VRAIE fonction chargée en bac à sable
// (magasins forgés en mémoire — aucune donnée réelle n'est ouverte, jamais) :
//   A — la compatibilité de deux échelles se juge sur leurs CODES de niveaux,
//       parce qu'une évaluation stocke son niveau par code ;
//   B — le compte nomme TOUT ce qui nomme l'échelle dans le trimestre actif,
//       les pratiques sous leur vrai champ (`configuration.echelleId`) ;
//   C — le cœur : rien ne la nomme → la question d'avant, sans un mot de plus ;
//       trimestre archivé → refus qui nomme les notes remises, rien d'écrit ;
//       aucun successeur aux mêmes codes → refus qui nomme les codes, rien
//       d'écrit ; successeur choisi → tout suit, l'ancienne part, et le compte
//       annoncé AVANT est le compte écrit ; Annuler → rien d'écrit ;
//   D — les trois gestes de Conception passent par ce cœur, la section 2
//       (Bibliothèque seule) n'y passe pas, et l'onglet Données fait la même
//       mesure et le même remplacement.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const nettoyer = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const echellesSrc = nettoyer(readFileSync(path.join(racineProjet, 'js', 'echelles.js'), 'utf8'));
const donneesV2Src = nettoyer(readFileSync(path.join(racineProjet, 'js', 'donnees-v2.js'), 'utf8'));
const indexHtml = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

function corps(src, nom) {
    let i = src.indexOf('function ' + nom + '(');
    expect(i, nom + ' doit exister').toBeGreaterThan(-1);
    if (src.slice(Math.max(0, i - 6), i) === 'async ') i -= 6;
    // Le corps commence à l'accolade qui suit la liste des paramètres : un
    // paramètre par défaut `options = {}` porte une paire d'accolades qui
    // fermerait la fonction à zéro caractère.
    let j = src.indexOf('{', src.indexOf(')', i)), prof = 0, vu = false;
    for (; j < src.length; j++) {
        if (src[j] === '{') { prof++; vu = true; }
        else if (src[j] === '}') { prof--; if (vu && prof === 0) break; }
    }
    return src.slice(i, j + 1);
}

/* ------------------------------------------------------------------ montage */

const IDME = (id, nom, extra = []) => ({
    id, nom,
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 59 },
        { code: 'D', nom: 'En développement', min: 60, max: 69 },
        { code: 'M', nom: 'Maîtrise', min: 70, max: 84 },
        { code: 'E', nom: 'Étendu', min: 85, max: 100 },
        ...extra
    ]
});
const ECH_A = () => IDME('ECH_A', 'IDME A');
const ECH_B = () => IDME('ECH_B', 'IDME B', [{ code: '0', nom: 'Non recevable', min: 0, max: 0 }]);
const ECH_C = () => ({ id: 'ECH_C', nom: 'Lettres', niveaux: ['N1', 'N2', 'N3', 'N4', 'N5'].map(c => ({ code: c, nom: c })) });
const ECH_VIDE = () => ({ id: 'ECH_VIDE', nom: 'Brouillon', niveaux: [{ code: '', nom: '' }, { code: '', nom: '' }] });

function magasins() {
    return {
        a2026_echellesTemplates: [ECH_A(), ECH_B(), ECH_C(), ECH_VIDE()],
        a2026_evaluationsSauvegardees: [
            { id: 'E1', echelleId: 'ECH_A' }, { id: 'E2', echelleId: 'ECH_A' }, { id: 'E3', echelleId: 'ECH_C' }
        ],
        a2026_productions: [{ id: 'P1', echelleId: 'ECH_A' }, { id: 'P2', echelleId: 'ECH_B' }],
        a2026_pratiquesConfigurables: [
            { id: 'PR1', configuration: { echelleId: 'ECH_A' } },
            { id: 'PR2', echelleId: 'ECH_A' },                       // forme ancienne, au premier niveau
            { id: 'PR3', configuration: { echelleId: 'ECH_C' } }
        ],
        a2026_grillesTemplates: [{ id: 'G1', echelleId: 'ECH_A' }, { id: 'G2' }],
        a2026_cartouches_G1: [{ id: 'C1', echelleId: 'ECH_A' }],
        a2026_cartouches_G2: [{ id: 'C2', echelleId: 'ECH_B' }]
    };
}

function charger(store, { confirmReponse = true, promptReponse = null, archive = false } = {}) {
    const appels = { confirms: [], prompts: [], alertes: [], notifiees: [] };
    const db = {
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; },
        setSync: (c, v) => { store[c] = v; },
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        }
    };
    const win = chargerScript('js/echelles.js', {
        db,
        cle: (k) => 'a2026_' + k,
        confirm: (q) => { appels.confirms.push(q); return confirmReponse; },
        prompt: (q) => { appels.prompts.push(q); return promptReponse; },
        alert: (m) => { appels.alertes.push(m); },
        document: {
            getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} }, appendChild() {} }),
            addEventListener() {}
        },
        notifications: {
            succes: (t, d) => appels.notifiees.push(String(t) + ' ' + String(d || '')),
            erreur: () => {}, info: () => {}, warning: () => {}
        },
        echapperHtml: (t) => String(t == null ? '' : t)
    });
    win.estTrimestreArchive = () => archive;
    return { win, appels, store };
}

const photo = (store) => JSON.stringify(store);

/* ------------------------------------------------------------------ A */

describe('#648 · A — deux échelles sont compatibles par leurs CODES de niveaux', () => {
    const { win } = charger({});
    it('mêmes codes, ou codes en plus chez le successeur : compatibles', () => {
        expect(win.comparerCodesEchelles(ECH_A(), ECH_B())).toEqual({ compatibles: true, manquants: [] });
        expect(win.comparerCodesEchelles(ECH_A(), ECH_A())).toEqual({ compatibles: true, manquants: [] });
    });
    it('des codes absents chez le successeur : incompatibles, et ils sont nommés', () => {
        expect(win.comparerCodesEchelles(ECH_A(), ECH_C())).toEqual({ compatibles: false, manquants: ['I', 'D', 'M', 'E'] });
    });
    it('les codes vides ne comptent pas : une échelle sans codes se remplace par n\'importe laquelle', () => {
        expect(win.comparerCodesEchelles(ECH_VIDE(), ECH_C()).compatibles).toBe(true);
    });
});

/* ------------------------------------------------------------------ B */

describe('#648 · B — le compte nomme TOUT ce qui nomme l\'échelle', () => {
    const { win } = charger({});
    const m = () => {
        const s = magasins();
        return {
            evaluations: s.a2026_evaluationsSauvegardees, productions: s.a2026_productions,
            pratiques: s.a2026_pratiquesConfigurables, grilles: s.a2026_grillesTemplates,
            cartouchesParGrille: { G1: s.a2026_cartouches_G1, G2: s.a2026_cartouches_G2 }
        };
    };
    it('évaluations, productions, pratiques (sous configuration.echelleId ET au premier niveau), grilles, cartouches', () => {
        expect(win.compterPorteursEchelleDans('ECH_A', m())).toEqual({ evaluations: 2, productions: 1, pratiques: 2, grilles: 1, cartouches: 1, total: 7 });
        expect(win.compterPorteursEchelleDans('ECH_B', m())).toEqual({ evaluations: 0, productions: 1, pratiques: 0, grilles: 0, cartouches: 1, total: 2 });
        expect(win.compterPorteursEchelleDans('ECH_X', m()).total).toBe(0);
    });
    it('la lecture synchrone des magasins (onglet Données) rend le même compte que la lecture asynchrone', async () => {
        const { win: w2 } = charger(magasins());
        const sync = win.compterPorteursEchelleDans('ECH_A', w2.lireMagasinsEchelleSync());
        const async_ = win.compterPorteursEchelleDans('ECH_A', await w2.lireMagasinsEchelle());
        expect(sync).toEqual(async_);
        expect(sync.total).toBe(7);
    });
    it('la phrase pour l\'enseignant', () => {
        expect(win.decrirePorteursEchelle({ evaluations: 2, productions: 1, pratiques: 2, grilles: 1, cartouches: 1 }))
            .toBe('2 évaluations, 1 production, 2 pratiques de notation, 1 grille et 1 cartouche');
        expect(win.decrirePorteursEchelle({ evaluations: 1 })).toBe('1 évaluation');
    });
});

/* ------------------------------------------------------------------ C */

describe('#648 · C — le cœur : supprimerOuRemplacerEchelle', () => {
    it('C.1 témoin négatif : rien ne la nomme → la question d\'avant, sans un mot de plus, et elle part', async () => {
        const { win, appels, store } = charger(magasins(), { confirmReponse: true });
        const r = await win.supprimerOuRemplacerEchelle('ECH_VIDE', { questionSimple: 'Supprimer cette échelle ?' });
        expect(appels.confirms).toEqual(['Supprimer cette échelle ?']);
        expect(appels.prompts).toEqual([]);
        expect(appels.alertes).toEqual([]);
        expect(r).toEqual({ supprimee: true, nb: null, successeur: null });
        expect(store.a2026_echellesTemplates.map(e => e.id)).toEqual(['ECH_A', 'ECH_B', 'ECH_C']);
    });

    it('C.1b témoin négatif, refusée : rien ne bouge', async () => {
        const { win, store } = charger(magasins(), { confirmReponse: false });
        const avant = photo(store);
        const r = await win.supprimerOuRemplacerEchelle('ECH_VIDE', { questionSimple: 'Q ?' });
        expect(r.supprimee).toBe(false);
        expect(photo(store)).toBe(avant);
    });

    it('C.2 trimestre archivé : refus qui nomme ce qui serait touché, rien d\'écrit, aucune question', async () => {
        const { win, appels, store } = charger(magasins(), { archive: true, promptReponse: '1' });
        const avant = photo(store);
        const r = await win.supprimerOuRemplacerEchelle('ECH_A');
        expect(r.supprimee).toBe(false);
        expect(r.refusee).toBe('archive');
        expect(appels.alertes).toHaveLength(1);
        expect(appels.alertes[0]).toContain('archivé');
        expect(appels.alertes[0]).toContain('2 évaluations');
        expect(appels.alertes[0]).toContain('notes déjà remises');
        expect(appels.prompts).toEqual([]);
        expect(appels.confirms).toEqual([]);
        expect(photo(store)).toBe(avant);
    });

    it('C.3 aucun successeur aux mêmes codes : refus qui nomme les codes, rien d\'écrit', async () => {
        const s = magasins();
        s.a2026_echellesTemplates = [ECH_A(), ECH_C()];
        const { win, appels, store } = charger(s, { promptReponse: '1' });
        const avant = photo(store);
        const r = await win.supprimerOuRemplacerEchelle('ECH_A');
        expect(r.supprimee).toBe(false);
        expect(r.refusee).toBe('aucun-successeur');
        expect(appels.alertes[0]).toContain('(I, D, M, E)');
        expect(appels.alertes[0]).toContain("Rien n'a été modifié");
        expect(appels.prompts).toEqual([]);
        expect(photo(store)).toBe(avant);
    });

    it('C.4 successeur choisi : tout ce qui la nomme suit, l\'ancienne part, et le compte annoncé est le compte écrit', async () => {
        const { win, appels, store } = charger(magasins(), { promptReponse: '1' });
        const r = await win.supprimerOuRemplacerEchelle('ECH_A', { questionSimple: 'Q ?' });

        // La question : le compte AVANT, les seuls successeurs compatibles, et le nombre d'écartées.
        expect(appels.confirms).toEqual([]);
        expect(appels.prompts).toHaveLength(1);
        const q = appels.prompts[0];
        expect(q).toContain("Supprimer l'échelle «IDME A», c'est la remplacer : 2 évaluations, 1 production, 2 pratiques de notation, 1 grille et 1 cartouche suivront.");
        expect(q).toContain('1. IDME B');
        expect(q).not.toContain('Lettres');
        // ECH_C (codes disjoints) et ECH_VIDE (aucun code) sont écartées : deux.
        expect(q).toContain("2 autre(s) échelle(s) du trimestre n'ont pas les mêmes niveaux");

        // Ce qui a suivi — chaque porteur, sous son vrai champ.
        expect(store.a2026_evaluationsSauvegardees.map(e => e.echelleId)).toEqual(['ECH_B', 'ECH_B', 'ECH_C']);
        expect(store.a2026_productions.map(p => p.echelleId)).toEqual(['ECH_B', 'ECH_B']);
        expect(store.a2026_pratiquesConfigurables[0].configuration.echelleId).toBe('ECH_B');
        expect(store.a2026_pratiquesConfigurables[1].echelleId).toBe('ECH_B');
        expect(store.a2026_pratiquesConfigurables[2].configuration.echelleId).toBe('ECH_C');
        expect(store.a2026_grillesTemplates[0].echelleId).toBe('ECH_B');
        expect(store.a2026_cartouches_G1[0].echelleId).toBe('ECH_B');
        expect(store.a2026_cartouches_G2[0].echelleId).toBe('ECH_B');   // nommait déjà ECH_B : intouchée
        // L'ancienne est partie, les autres restent.
        expect(store.a2026_echellesTemplates.map(e => e.id)).toEqual(['ECH_B', 'ECH_C', 'ECH_VIDE']);
        // Le compte rendu est celui qui a été écrit — le même que celui annoncé.
        expect(r.supprimee).toBe(true);
        expect(r.successeur.id).toBe('ECH_B');
        expect(r.nb).toEqual({ evaluations: 2, productions: 1, pratiques: 2, grilles: 1, cartouches: 1, total: 7 });
        // Et le message d'après le dit.
        win.notifierEchelleSupprimee(r);
        expect(appels.notifiees[0]).toContain('«IDME B» prend la place : 2 évaluations, 1 production, 2 pratiques de notation, 1 grille et 1 cartouche suivent.');
    });

    it('C.5 Annuler à la question du successeur : rien d\'écrit', async () => {
        for (const reponse of [null, '', '9', 'abc']) {
            const { win, store } = charger(magasins(), { promptReponse: reponse });
            const avant = photo(store);
            const r = await win.supprimerOuRemplacerEchelle('ECH_A');
            expect(r.supprimee, `réponse ${JSON.stringify(reponse)}`).toBe(false);
            expect(photo(store), `réponse ${JSON.stringify(reponse)}`).toBe(avant);
        }
    });

    it('C.6 le message d\'après, sans remplacement : « Échelle supprimée » (sentinelle 468 y tient)', () => {
        const { win, appels } = charger({});
        win.notifierEchelleSupprimee({ supprimee: true, nb: null, successeur: null });
        expect(appels.notifiees[0]).toContain('Échelle supprimée');
    });
});

/* ------------------------------------------------------------------ D */

describe('#648 · D — les chemins : trois passent par le cœur, la section 2 n\'y passe pas, Données fait pareil', () => {
    it('la liste, la zone d\'édition et la section 1 appellent supprimerOuRemplacerEchelle', () => {
        for (const nom of ['supprimerEchelle', 'supprimerEchelleDepuisSidebar', 'supprimerEchelleDefinitivement']) {
            expect(corps(echellesSrc, nom), nom).toContain('supprimerOuRemplacerEchelle(');
            expect(corps(echellesSrc, nom), nom + ' : plus de retrait local').not.toMatch(/(?:db\.modifier|modifierEtAnnoncer)\(cle\('echellesTemplates'\)/);
        }
    });
    it('la section 2 (Bibliothèque seule) ne remplace rien : les évaluations lisent l\'ancrage, pas la Bibliothèque', () => {
        const c = corps(echellesSrc, 'supprimerEchelleDeBibliothequePartagee');
        expect(c).not.toContain('supprimerOuRemplacerEchelle(');
        expect(c).not.toContain('remplacerEchellePartout(');
    });
    it('le cœur est le seul à retirer de l\'ancrage, par la file, après ses questions', () => {
        const c = corps(echellesSrc, 'supprimerOuRemplacerEchelle');
        // Lot E1 : la même file, annoncée par le témoin (`modifierEtAnnoncer`).
        expect(c).toMatch(/(?:db\.modifier|modifierEtAnnoncer)\(cle\('echellesTemplates'\)/);
        expect(c.indexOf('prompt(')).toBeLessThan(c.search(/(?:db\.modifier|modifierEtAnnoncer)\(cle\('echellesTemplates'\)/));
        expect(c).toContain('remplacerEchellePartout(');
    });
    it('l\'ancienne garde à un seul porteur a disparu, et son export avec', () => {
        expect(echellesSrc).not.toContain('function verifierUtilisationEchelle(');
        expect(echellesSrc).not.toContain('window.verifierUtilisationEchelle');
        for (const nom of ['comparerCodesEchelles', 'compterPorteursEchelleDans', 'lireMagasinsEchelleSync', 'decrirePorteursEchelle', 'remplacerEchellePartout', 'supprimerOuRemplacerEchelle']) {
            expect(echellesSrc, nom + ' exporté').toContain('window.' + nom + ' = ' + nom + ';');
        }
    });
    it('onglet Données : même compte, mêmes successeurs, même remplacement — et plus jamais `p.echelleId` seul', () => {
        const garde = corps(donneesV2Src, 'verifierDependancesEchelle');
        expect(garde).toContain('window.compterPorteursEchelleDans(');
        expect(garde).toContain('window.comparerCodesEchelles(');
        expect(garde).toContain('window.estTrimestreArchive');
        expect(garde).not.toContain('pratiques.filter(p => p.echelleId');
        const acte = corps(donneesV2Src, 'confirmerSuppressionRessource');
        expect(acte).toContain('window.remplacerEchellePartout(');
        expect(acte.indexOf('window.remplacerEchellePartout(')).toBeLessThan(acte.indexOf('succes = await supprimerEchelleDefinitivement(id)'));
        expect(indexHtml).toContain('id="select-echelle-remplacement"');
    });
});
