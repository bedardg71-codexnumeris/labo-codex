/**
 * SENTINELLE (25 nov. 2026) — TAMPONS D'OBSERVATION, LOT 3 : SUR UNE PRODUCTION.
 *
 * Consigne de lot : « Tampons d'observation », lot 3 (Cowork, 25 nov. 2026, 5 h 50) ; décisions de Grégoire du 25 nov.
 * (5 h 39, 5 h 40). Rapport : plans de travail/RAPPORT-2026-11-25-tampons-observation-lot-3.md.
 *
 * VERROUILLÉ ICI, sur le module RÉEL (js/pratiques/inscriptions-cibles.js) et sur le texte des fichiers. Les écrans sont
 * joués au navigateur : tests/integration/tampons-observation-lot-3-production.spec.js.
 *   A. La date d'une trace : l'instant de la pose, lu de l'identifiant du tampon posé ; ses replis.
 *   B. Les traces lues : par production, par jour de pose ; un tampon non reconnu n'y est pas ; plusieurs pages,
 *      plusieurs fichiers ; sans annotation, sans fichier : rien.
 *   C. « Vise une seule cible » : exactement une cible déclarée, encore dans l'ensemble.
 *   D. Sous la cible : en direct tant qu'aucune inscription non annulée n'existe pour la production et la cible.
 *   E. Ce qu'« Inscrire pour une production » copie : la forme du lot 2, chaque tampon une fois.
 *   F. Une seule source : lire n'écrit rien ; la pose, la rétroaction et le PDF ne nomment pas les inscriptions.
 *
 * RIEN EN DUR : tampons, productions et cibles sont fictifs. BREAK-TESTS : journal au rapport.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { chargerScript } from './_helpers/charger-script.js';
import { dbBanc, RACINE } from './_helpers/bac-suivi.js';

const clone = (x) => JSON.parse(JSON.stringify(x));
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

const ZOE = '2300001';
const YAN = '2300002';
const CIBLE_A = { id: 'cib-a', etiquette: 'Cible fictive A', criteres: [{ id: 'crit-a1', texte: 'Critère fictif A1', essentiel: true }, { id: 'crit-a2', texte: 'Critère fictif A2', essentiel: false }] };
const CIBLE_B = { id: 'cib-b', etiquette: 'Cible fictive B', criteres: [] };
const CIBLES = [CIBLE_A, CIBLE_B];
const P_UNE = { id: 'prod-une', titre: 'Production fictive à une cible', ciblesRenseignees: ['cib-a'] };
const P_DEUX = { id: 'prod-deux', titre: 'Production fictive à deux cibles', ciblesRenseignees: ['cib-a', 'cib-b'] };
const P_SANS = { id: 'prod-sans', titre: 'Production fictive sans cible' };
const PRODUCTIONS = [P_UNE, P_DEUX, P_SANS];
const T1 = { id: 'custom-banc-1', nom: 'Tampon fictif 1', categorieId: 'cat-banc', categorieNom: 'Catégorie fictive', critere: 'Critère fictif A1', emoji: '' };
const T2 = { id: 'custom-banc-2', nom: 'Tampon fictif 2', categorieId: 'cat-banc', categorieNom: 'Catégorie fictive', critere: '', emoji: '' };
const D_OBSERVATION = { [T1.id]: T1, [T2.id]: T2 };
const lireTampon = (id) => D_OBSERVATION[id] || null;

// Des instants à midi, heure de l'appareil : le jour lu ne dépend pas du fuseau du banc.
const midi = (a, m, j) => new Date(a, m - 1, j, 12, 0, 0).getTime();
const J1 = midi(2031, 10, 14);
const J2 = midi(2031, 10, 16);
const pose = (tamponId, instant, suite = '') => ({ id: 'STK_' + instant + suite, autocollantId: tamponId, x: 0.1, y: 0.1, width: 0.04, height: 0.04 });
const fichier = (id, da, productionId) => ({ id, etudiantDA: da, productionId, dateImport: new Date(midi(2031, 10, 1)).toISOString() });
const annotation = (fichierId, pages, dateModification) => ({ id: 'AN_' + fichierId, fichierId, pages, dateModification });

function monter(store = {}) {
    const journal = [];
    const db = dbBanc(Object.assign({}, store), journal);
    const win = {};
    chargerScript('js/pratiques/inscriptions-cibles.js', { db, cle: (k) => 'test_' + k }, win);
    return { I: win.InscriptionsCibles, journal };
}

const { I } = monter();

describe('A · la date d\'une trace : l\'instant de la pose', () => {
    it('l\'identifiant d\'un tampon posé porte l\'instant de la pose ; un clone (collé) aussi', () => {
        expect(I.instantDeLaPose({ id: 'STK_' + J1 })).toBe(J1);
        expect(I.instantDeLaPose({ id: 'STK_' + J1 + '_k3f9' })).toBe(J1);
    });

    it('un identifiant sans instant, ou d\'une autre nature : null', () => {
        for (const id of ['STK_', 'STK_abc', 'SHP_' + J1, '', null, undefined, 'STK_12']) expect(I.instantDeLaPose({ id })).toBeNull();
        expect(I.instantDeLaPose(null)).toBeNull();
    });

    it('la trace est datée du jour de la pose, pas du jour de la lecture ni de l\'import', () => {
        const t = I.tracesDesProductions([fichier('F1', ZOE, P_UNE.id)], [annotation('F1', { 0: { stickers: [pose(T1.id, J1)] } }, new Date(J2).toISOString())], ZOE, lireTampon);
        expect(t).toEqual([{ productionId: P_UNE.id, jours: [{ date: '2031-10-14', horodatage: new Date(J1).toISOString(), tampons: [T1] }] }]);
    });

    it('sans instant dans l\'identifiant : la dernière modification de l\'annotation, puis l\'import du fichier', () => {
        const sansInstant = { id: 'STK_ancien', autocollantId: T1.id };
        const parAnnotation = I.tracesDesProductions([fichier('F1', ZOE, P_UNE.id)], [annotation('F1', { 0: { stickers: [sansInstant] } }, new Date(J2).toISOString())], ZOE, lireTampon);
        expect(parAnnotation[0].jours[0].date).toBe('2031-10-16');
        const parImport = I.tracesDesProductions([fichier('F1', ZOE, P_UNE.id)], [annotation('F1', { 0: { stickers: [sansInstant] } })], ZOE, lireTampon);
        expect(parImport[0].jours[0].date).toBe('2031-10-01');
    });
});

describe('B · les traces lues sur les productions', () => {
    const fichiers = [fichier('F1', ZOE, P_UNE.id), fichier('F2', ZOE, P_DEUX.id), fichier('F3', YAN, P_UNE.id), fichier('F4', ZOE, P_SANS.id)];

    it('par production, la plus récente d\'abord ; par jour de pose ; chaque tampon une fois par jour, dans l\'ordre de pose', () => {
        const annotations = [
            annotation('F1', { 0: { stickers: [pose(T2.id, J1 + 5000), pose(T1.id, J1), pose(T1.id, J1 + 9000)] } }),
            annotation('F2', { 0: { stickers: [pose(T2.id, J1)] }, 1: { stickers: [pose(T1.id, J2)] } })];
        const t = I.tracesDesProductions(fichiers, annotations, ZOE, lireTampon);
        expect(t.map(x => x.productionId)).toEqual([P_DEUX.id, P_UNE.id]);
        expect(t[0].jours.map(j => [j.date, j.tampons.map(x => x.id)])).toEqual([['2031-10-16', [T1.id]], ['2031-10-14', [T2.id]]]);
        expect(t[1].jours.map(j => [j.date, j.tampons.map(x => x.id)])).toEqual([['2031-10-14', [T1.id, T2.id]]]);
    });

    it('un tampon que `lireTampon` ne reconnaît pas (catégorie non cochée, tampon supprimé) n\'est nulle part', () => {
        const annotations = [annotation('F1', { 0: { stickers: [pose('custom-autre', J1), pose('custom-supprime', J1 + 1)] } })];
        expect(I.tracesDesProductions(fichiers, annotations, ZOE, lireTampon)).toEqual([]);
        expect(I.tracesDesProductions(fichiers, [annotation('F1', { 0: { stickers: [pose(T1.id, J1)] } })], ZOE, () => null)).toEqual([]);
        expect(I.tracesDesProductions(fichiers, [annotation('F1', { 0: { stickers: [pose(T1.id, J1)] } })], ZOE, undefined)).toEqual([]);
    });

    it('la trace est celle de l\'étudiant·e demandé·e, et d\'aucun·e autre', () => {
        const annotations = [annotation('F3', { 0: { stickers: [pose(T1.id, J1)] } })];
        expect(I.tracesDesProductions(fichiers, annotations, ZOE, lireTampon)).toEqual([]);
        expect(I.tracesDesProductions(fichiers, annotations, YAN, lireTampon)).toHaveLength(1);
    });

    it('plusieurs pages : chacune est lue ; deux fichiers de la même production : réunis', () => {
        const deuxFichiers = [fichier('F1', ZOE, P_UNE.id), fichier('F1b', ZOE, P_UNE.id)];
        const annotations = [annotation('F1', { 0: { stickers: [] }, 3: { stickers: [pose(T1.id, J1)] } }), annotation('F1b', { 0: { stickers: [pose(T2.id, J1 + 1)] } })];
        const t = I.tracesDesProductions(deuxFichiers, annotations, ZOE, lireTampon);
        expect(t).toHaveLength(1);
        expect(t[0].jours[0].tampons.map(x => x.id)).toEqual([T1.id, T2.id]);
    });

    it('sans page annotée, sans annotation, sans fichier (une ligne de tableau), sans production : rien, et aucune erreur', () => {
        expect(I.tracesDesProductions(fichiers, [], ZOE, lireTampon)).toEqual([]);
        expect(I.tracesDesProductions(fichiers, [annotation('F1', {})], ZOE, lireTampon)).toEqual([]);
        expect(I.tracesDesProductions(fichiers, [annotation('F1', { 0: {} }), annotation('F2', null), null], ZOE, lireTampon)).toEqual([]);
        expect(I.tracesDesProductions([], [annotation('F1', { 0: { stickers: [pose(T1.id, J1)] } })], ZOE, lireTampon)).toEqual([]);
        expect(I.tracesDesProductions([fichier('F9', ZOE, '')], [annotation('F9', { 0: { stickers: [pose(T1.id, J1)] } })], ZOE, lireTampon)).toEqual([]);
        expect(I.tracesDesProductions(null, null, ZOE, lireTampon)).toEqual([]);
    });

    it('la copie lue a la forme du lot 2 : six champs, jamais l\'image', () => {
        const avecImage = (id) => Object.assign({ imageBase64: 'data:image/png;base64,AAAA', autre: 1 }, D_OBSERVATION[id]);
        const t = I.tracesDesProductions(fichiers, [annotation('F1', { 0: { stickers: [pose(T1.id, J1)] } })], ZOE, avecImage);
        expect(Object.keys(t[0].jours[0].tampons[0]).sort()).toEqual(['categorieId', 'categorieNom', 'critere', 'emoji', 'id', 'nom']);
        expect(JSON.stringify(t)).not.toMatch(/data:image|imageBase64/);
    });
});

describe('C · « vise une seule cible »', () => {
    it('exactement une cible déclarée, encore dans l\'ensemble : c\'est elle', () => {
        expect(I.cibleUnique(P_UNE, CIBLES)).toBe('cib-a');
    });

    it('deux cibles, aucune, pas de liste, ou une cible qui n\'est plus dans l\'ensemble : null', () => {
        expect(I.cibleUnique(P_DEUX, CIBLES)).toBeNull();
        expect(I.cibleUnique(P_SANS, CIBLES)).toBeNull();
        expect(I.cibleUnique({ id: 'p', ciblesRenseignees: [] }, CIBLES)).toBeNull();
        expect(I.cibleUnique({ id: 'p', ciblesRenseignees: ['cib-partie'] }, CIBLES)).toBeNull();
        expect(I.cibleUnique(null, CIBLES)).toBeNull();
        expect(I.cibleUnique(P_UNE, [])).toBeNull();
    });
});

describe('D · sous la cible : en direct, puis par l\'inscription, jamais deux fois', () => {
    const traces = (stickersUne, stickersDeux = [], stickersSans = []) => I.tracesDesProductions(
        [fichier('F1', ZOE, P_UNE.id), fichier('F2', ZOE, P_DEUX.id), fichier('F4', ZOE, P_SANS.id)],
        [annotation('F1', { 0: { stickers: stickersUne } }), annotation('F2', { 0: { stickers: stickersDeux } }), annotation('F4', { 0: { stickers: stickersSans } })], ZOE, lireTampon);
    const sous = (t, cible, liste = []) => I.tracesEnDirectSousLaCible(t, PRODUCTIONS, { liste, da: ZOE, ensembleId: 'ENS1', cible, cibles: CIBLES });
    const inscription = (plus = {}) => I.construireInscription(Object.assign({ id: 'INS1', da: ZOE, ensembleId: 'ENS1', cibleId: 'cib-a', niveau: '2', echelleId: 'E',
        date: '2031-10-20', productionId: P_UNE.id, tampons: [T1] }, plus));

    it('une production à une seule cible : la trace paraît sous cette cible, sans niveau, sans coche, d\'origine « production »', () => {
        const lues = sous(traces([pose(T1.id, J1)]), CIBLE_A);
        expect(lues).toHaveLength(1);
        expect(lues[0]).toMatchObject({ enDirect: true, id: '', da: ZOE, cibleId: 'cib-a', niveau: null, date: '2031-10-14', productionId: P_UNE.id, origine: 'production', noteBreve: '', tampons: [T1] });
        expect(lues[0].criteres.map(k => k.respecte), 'aucun critère n\'est coché du fait d\'un tampon').toEqual([null, null]);
        expect(I.estSansNiveau(lues[0])).toBe(true);
        expect(I.estUneRemarque(lues[0])).toBe(false);
    });

    it('une production à deux cibles, ou sans cible : sous aucune cible', () => {
        const t = traces([], [pose(T1.id, J1)], [pose(T2.id, J1)]);
        expect(t).toHaveLength(2);
        expect(sous(t, CIBLE_A)).toEqual([]);
        expect(sous(t, CIBLE_B)).toEqual([]);
    });

    it('la cible qu\'une production ne vise pas ne reçoit rien', () => {
        expect(sous(traces([pose(T1.id, J1)]), CIBLE_B)).toEqual([]);
    });

    it('dès qu\'une inscription non annulée existe pour la production et la cible : plus de lecture en direct sous la cible', () => {
        const t = traces([pose(T1.id, J1), pose(T2.id, J2)]);
        expect(sous(t, CIBLE_A)).toHaveLength(2);
        expect(sous(t, CIBLE_A, [inscription()])).toEqual([]);
        expect(I.estInscritePourLaProduction([inscription()], ZOE, 'ENS1', 'cib-a', P_UNE.id)).toBe(true);
    });

    it('une inscription annulée, d\'une autre personne, d\'une autre production, d\'une autre cible ou d\'un autre ensemble ne l\'éteint pas', () => {
        const t = traces([pose(T1.id, J1)]);
        const annulee = [inscription(), I.construireAnnulation({ id: 'ANN1', inscription: inscription(), date: '2031-10-21' })];
        expect(sous(t, CIBLE_A, annulee)).toHaveLength(1);
        for (const autre of [{ da: YAN }, { productionId: P_DEUX.id }, { cibleId: 'cib-b' }, { ensembleId: 'ENS2' }, { productionId: null }]) {
            expect(sous(t, CIBLE_A, [inscription(autre)]), JSON.stringify(autre)).toHaveLength(1);
        }
    });

    it('les traces en direct se rangent comme des inscriptions : la plus récente d\'abord', () => {
        const lues = sous(traces([pose(T1.id, J1), pose(T2.id, J2)]), CIBLE_A);
        expect(lues.map(x => x.date)).toEqual(['2031-10-16', '2031-10-14']);
        expect([inscription({ date: '2031-10-15' })].concat(lues).sort(I.plusRecenteDAbord).map(x => x.date)).toEqual(['2031-10-16', '2031-10-15', '2031-10-14']);
    });
});

describe('E · ce qu\'« Inscrire pour une production » copie', () => {
    it('les tampons d\'une production, tous jours confondus, chacun une fois, dans l\'ordre de pose', () => {
        const t = I.tracesDesProductions([fichier('F1', ZOE, P_UNE.id)], [annotation('F1', { 0: { stickers: [pose(T2.id, J2), pose(T1.id, J1), pose(T2.id, J1 + 1)] } })], ZOE, lireTampon);
        expect(I.tamponsDeLaProduction(t, P_UNE.id)).toEqual([T1, T2]);
        expect(I.tamponsDeLaProduction(t, P_DEUX.id)).toEqual([]);
        expect(I.tamponsDeLaProduction(null, P_UNE.id)).toEqual([]);
    });

    it('la copie entre dans l\'inscription telle quelle, sous la cible choisie, avec l\'origine « production », sans rien cocher', () => {
        const i = I.construireInscription({ id: 'INS1', da: ZOE, ensembleId: 'ENS1', cibleId: 'cib-a', niveau: null, date: '2031-10-20', productionId: P_UNE.id,
            criteres: I.etatDesCriteres(CIBLE_A, {}), tampons: [T1, T2] });
        expect(i.tampons).toEqual([T1, T2]);
        expect(i.origine).toBe('production');
        expect(i.criteres.map(k => k.respecte)).toEqual([null, null]);
        expect(I.motifsRefus(i, null), 'un tampon seul suffit, sans niveau').toEqual([]);
    });
});

describe('F · une seule source : lire n\'écrit rien', () => {
    it('lire les traces ne touche à aucun stock et ne modifie ni les fichiers ni les annotations reçus', () => {
        const { I: J, journal } = monter({ test_inscriptionsCibles: [] });
        const fichiers = [fichier('F1', ZOE, P_UNE.id)];
        const annotations = [annotation('F1', { 0: { stickers: [pose(T1.id, J1)] } })];
        const avant = clone([fichiers, annotations]);
        const t = J.tracesDesProductions(fichiers, annotations, ZOE, lireTampon);
        J.tracesEnDirectSousLaCible(t, PRODUCTIONS, { liste: [], da: ZOE, ensembleId: 'ENS1', cible: CIBLE_A, cibles: CIBLES });
        J.tamponsDeLaProduction(t, P_UNE.id);
        expect(journal).toEqual([]);
        expect([fichiers, annotations]).toEqual(avant);
    });

    it('la pose d\'un tampon, la rétroaction et le PDF ne nomment ni les inscriptions ni ce lot', () => {
        for (const f of ['js/travaux-annotation.js', 'js/evaluation-retroaction.js', 'js/travaux-export-pdf.js', 'js/travaux-stockage.js']) {
            expect(lire(f), f).not.toMatch(/InscriptionsCibles|inscriptionsCibles|tracesDesProductions|tamponDObservation/);
        }
    });

    it('les lecteurs des tampons posés pour le profil : deux fichiers, et le profil ne lit aucune annotation lui-même', () => {
        expect(lire('js/tableau-cibles.js')).toMatch(/obtenirAnnotations\(\)/);
        expect(lire('js/profil-cibles.js')).not.toMatch(/obtenirAnnotations|annotationsTravaux|autocollantId/);
        expect(lire('js/pratiques/inscriptions-cibles.js')).not.toMatch(/travauxStockage|travauxOutils|db\.getSync\(cle\('annotationsTravaux/);
    });

    it('aucun tampon, catégorie ou critère fourni par l\'application n\'est nommé dans le code du lot', () => {
        const neuf = lire('js/pratiques/inscriptions-cibles.js').split('Les tampons posés sur une production')[1].split('Ajouter (fonction pure)')[0];
        expect(neuf).not.toMatch(/['"](action|comprehension|observations|qualite|diagnostic)['"]/);
    });
});
