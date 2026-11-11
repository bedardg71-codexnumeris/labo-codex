/**
 * SENTINELLE — SUIVI LONGITUDINAL, LOT 1 : L'ONGLET « TENDANCES », LE NUAGE DE POINTS (11 nov. 2026).
 *
 * Décision de Grégoire (11 nov.) : à côté du registre, un onglet pose deux mesures face à face pour les inscrit·es.
 * RÉVISÉ le soir même, à l'aperçu : la séquence de cours est DÉCLARÉE par l'enseignant·e (rien de propre à une
 * discipline dans le code), l'écran ne commente ni les données ni l'échantillon (des comptes, aucun lien calculé),
 * et le nuage reçoit une COMPARAISON (deux mesures, un groupe) sans rien savoir des cours.
 *
 * Ce banc tient le calcul (js/suivi-tendances.js, fonctions pures) et ce que le rendu promet sans navigateur :
 *   1. la séquence déclarée — les cours offerts sont ceux du registre, sa forme, son écriture au geste seulement ;
 *   2. le choix des données — le dossier d'origine le plus récent, le résultat le plus récent (trimestre en texte
 *      libre), une note non constructible n'est pas placée et se compte, sans dossier d'origine : d'aucune cohorte ;
 *   3. les comptes des trois zones ;
 *   4. « Ce que ça dit » : des comptes accordés, et RIEN qui juge les données ;
 *   5. les filtres de cohortes ;
 *   6. le pseudonyme en anonymisation, « Voir son dossier », et ce qui s'écrit (la séquence, rien d'autre) ;
 *   7. les règles du dépôt : aucun mot de discipline en dur, une seule source pour la sphère, #540, pas d'innerHTML.
 * Tous les noms sont fictifs, et les cours du banc ne sont PAS ceux de la littérature : c'est l'essai même.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const ORIGINE = '201-NYA-05';     // un cours d'une autre discipline : rien ici ne dit « 101 »
const SUIVANT = '201-NYB-05';
const AUTRE = '201-NYC-05';

const dossier = (trimestre, trimestreNom, coursCode, P, constructible = true) => ({
    capteLe: '2026-09-18T12:00:00.000Z', trimestre, trimestreNom, coursId: 'C', coursCode, groupe: '00001',
    evaluations: [], presences: [], empreinte: { grilles: [], echelles: [] }, grillesIds: [], echellesIds: [],
    indices: { cp: P === null ? null : { actuel: { C: 90, P, noteConstructible: constructible } }, assiduite: null, patternsRaI: null }
});
const eleve = (da, nom, prenom, dossiers, resultats) => ({ da, nom, prenom, inscritLe: '2026-09-18', reprise913: true, dossiers, resultatsUlterieurs: resultats });
const registre = (eleves) => ({ format: 'registre-longitudinal', version: 1, modeles: { grilles: {}, echelles: {} },
    eleves: Object.fromEntries(eleves.map((e) => [e.da, e])) });
const note = (n, trimestre = 'H2026', cours = SUIVANT) => ({ cours, trimestre, note: n });
const sequence = (suivants = [SUIVANT]) => ({ version: 1, origine: ORIGINE, suivants });

function banc(reg, { anonyme = false, declaree = sequence() } = {}) {
    const store = storeBase();
    Object.keys(store).filter((k) => k.startsWith('test_')).forEach((k) => delete store[k]);
    Object.assign(store, { trimestres: [], cours: [], registreLongitudinal: reg });
    if (declaree) store.tendancesSequence = declaree;
    const journal = [];
    const b = monter(store, {
        journal,
        modules: ['js/registre-longitudinal.js', 'js/suivi-tendances.js'],
        objetsExportes: ['registreLongitudinal', 'tendancesLongitudinal'],
        globaux: {
            cle: (k) => 'h2026_' + k, cleSource: (k, t) => t + '_' + k,
            obtenirTrimestres: () => [], estModeAnonymisation: () => anonyme,
            calculerEtStockerIndicesCP: () => {}, calculerTousLesIndices: () => ({})
        }
    });
    b.win.estModeAnonymisation = () => anonyme;
    return Object.assign(b, { api: b.win.tendancesLongitudinal, journal, store });
}

/** Rend l'onglet dans une zone NEUVE (le faux DOM ne vide pas ses enfants) et la rend. */
function rendre(b) {
    const zone = b.document.createElement('div');
    b.win.afficherTendancesLongitudinal(zone);
    return zone;
}
const parcourir = (el, f) => { f(el); (el.children || []).forEach((c) => parcourir(c, f)); };
function toutLeTexte(el) {
    const morceaux = [];
    parcourir(el, (n) => {
        if (n.textContent) morceaux.push(n.textContent);
        Object.keys(n).filter((k) => k.startsWith('attr_')).forEach((k) => morceaux.push(String(n[k])));
    });
    return morceaux.join(' | ');
}
const trouver = (el, test) => { const t = []; parcourir(el, (n) => { if (test(n)) t.push(n); }); return t; };
const deClasse = (el, classe) => trouver(el, (n) => String(n.className || '').split(' ').includes(classe));

const api = banc(registre([])).api;
const comparer = (reg, suivant = SUIVANT) => api.preparer(reg, api.comparaisonDeCours(ORIGINE, suivant));

describe('Tendances — la séquence déclarée par l\'enseignant·e', () => {
    const reg = registre([
        eleve('1', 'Bouleau', 'Fictanne', [dossier('a2025', 'Automne 2025', ORIGINE, 72), dossier('h2026', 'Hiver 2026', '  201-nya-05 ', 60)], [note(80), note(70, 'A2026', AUTRE)]),
        eleve('2', 'Cèdre', 'Fictbob', [dossier('a2025', 'Automne 2025', '109-101-MQ', 65)], [note(61, 'H2026', '201-nyb-05')])
    ]);

    it('les cours offerts sont ceux que le registre connaît : dossiers pour l\'origine, résultats pour les suivants', () => {
        expect(api.coursConnus(reg)).toEqual({ origines: ['109-101-MQ', ORIGINE], suivants: [SUIVANT, AUTRE] });
    });
    it('un cours se compare à la casse, aux accents et aux espaces près ; son écriture affichée reste la première vue', () => {
        expect(api.cleDeCours('  201-NYA-05 ')).toBe(api.cleDeCours('201-nya-05'));
        expect(api.cleDeCours('Écriture  et littérature')).toBe('ecriture et litterature');
        expect(api.dossierDuCours(reg.eleves['1'], ORIGINE).nb).toBe(2);
        expect(api.dossierDuCours(reg.eleves['1'], '201-NYA').nb).toBe(0);   // pas de « contient » : le cours entier
    });
    it('une séquence absente, étrangère ou abîmée se lit comme vide, sans doublon, et l\'origine n\'est pas son propre suivant', () => {
        expect(api.sequencePropre(null)).toEqual({ version: 1, origine: '', suivants: [] });
        expect(api.sequencePropre('n\'importe quoi')).toEqual({ version: 1, origine: '', suivants: [] });
        expect(api.sequencePropre({ origine: ' A ', suivants: ['B', 'b', 'a', 7, 'C'] })).toEqual({ version: 1, origine: 'A', suivants: ['B', 'C'] });
        expect([api.sequenceComplete(api.sequencePropre({ origine: 'A' })), api.sequenceComplete(api.sequencePropre({ origine: 'A', suivants: ['B'] }))]).toEqual([false, true]);
    });
    it('rien n\'est déclaré : l\'onglet invite à déclarer, n\'affiche aucun nuage, et n\'écrit rien', () => {
        const b = banc(reg, { declaree: null });
        const zone = rendre(b);
        expect(toutLeTexte(zone)).toContain('Choisis un cours d\'origine et au moins un cours suivant pour voir le nuage.');
        expect(deClasse(zone, 'tend-cible').length + deClasse(zone, 'tend-plan').length).toBe(0);
        // La déclaration est offerte : la liste des origines, une bascule par cours suivant connu, aucune enfoncée.
        const liste = deClasse(zone, 'tend-origine')[0];
        expect(liste.children.map((o) => [o.value, o.textContent])).toEqual([['', 'Choisir…'], ['109-101-MQ', '109-101-MQ'], [ORIGINE, ORIGINE]]);
        expect(deClasse(deClasse(zone, 'tend-sequence')[0], 'tend-bascule').map((x) => [x.dataset.cours, x['attr_aria-pressed']])).toEqual([[SUIVANT, 'false'], [AUTRE, 'false']]);
        expect(b.journal).toEqual([]);
        expect('tendancesSequence' in b.store).toBe(false);
    });
    it('déclarer écrit la séquence, sous SA clé, et rien d\'autre ; retirer un suivant aussi', async () => {
        const b = banc(reg, { declaree: null });
        await b.win.declarerOrigineTendances({ value: ORIGINE });
        await b.win.declarerSuivantTendances({ dataset: { cours: SUIVANT } });
        await b.win.declarerSuivantTendances({ dataset: { cours: AUTRE } });
        expect(b.store.tendancesSequence).toEqual({ version: 1, origine: ORIGINE, suivants: [SUIVANT, AUTRE] });
        await b.win.declarerSuivantTendances({ dataset: { cours: SUIVANT } });
        expect(b.store.tendancesSequence.suivants).toEqual([AUTRE]);
        expect([...new Set(b.journal.map((e) => e.k))]).toEqual(['tendancesSequence']);
        expect(b.store.registreLongitudinal).toEqual(reg);
    });
    it('la clé est globale : inscrite à CLES_GLOBALES (trimestres.js)', () => {
        expect(api.NOM_CLE).toBe('tendancesSequence');
        const globales = tranche(readFileSync(path.join(RACINE, 'js/trimestres.js'), 'utf8'), 'const CLES_GLOBALES = [', '];');
        expect(globales).toContain("'tendancesSequence'");
    });
});

describe('Tendances — le choix des données', () => {
    const reg = registre([
        // Deux dossiers du cours d'origine : le plus récent (Automne 2025) l'emporte sur l'hiver de la même année.
        eleve('1', 'Bouleau', 'Fictanne', [dossier('a2025', 'Automne 2025', ORIGINE, 72), dossier('h2025', 'Hiver 2025', ORIGINE, 41)], [note(80)]),
        // Deux résultats du cours suivant : le plus récent, lu dans le texte libre ; l'autre cours ne compte pas pour lui.
        eleve('2', 'Cèdre', 'Fictbob', [dossier('a2024', 'Automne 2024', ORIGINE, 65.4)], [note(48, 'Hiver 2025'), note(66, 'A25'), note(90, 'H2026', AUTRE)]),
        // Note d'origine non constructible : pas placé·e, compté·e.
        eleve('3', 'Dorine', 'Fictcam', [dossier('a2024', 'Automne 2024', ORIGINE, 55, false)], [note(70)]),
        // Pas de dossier du cours d'origine : d'aucune cohorte.
        eleve('4', 'Épinette', 'Fictdev', [dossier('h2026', 'Hiver 2026', SUIVANT, 77)], [note(88)]),
        // Un dossier d'origine, aucune note chiffrée du cours suivant : la cohorte existe, sans note.
        eleve('5', 'Frêne', 'Fictéva', [dossier('h2026', 'Hiver 2026', ORIGINE, 81)], [{ cours: SUIVANT, trimestre: 'A2026', note: 'EC' }])
    ]);
    const d = comparer(reg);

    it('une bille par inscrit·e qui a ses deux mesures', () => {
        expect(d.points.map((p) => p.da).sort()).toEqual(['1', '2']);
    });
    it('deux dossiers du cours d\'origine : le plus récent, et le point le sait', () => {
        const p = d.points.find((x) => x.da === '1');
        expect([p.x, p.cohorte, p.nbX]).toEqual([72, 'a2025', 2]);
    });
    it('deux résultats du même cours : le plus récent par le trimestre en texte libre', () => {
        const p = d.points.find((x) => x.da === '2');
        expect([p.x, p.y, p.nbY]).toEqual([65.4, 66, 2]);
        expect(comparer(reg, AUTRE).points.map((x) => [x.da, x.y])).toEqual([['2', 90]]);
    });
    it('note d\'origine non constructible : non placé·e, compté·e ; sans dossier d\'origine : ni l\'un ni l\'autre', () => {
        expect(d.nonPlaces).toEqual([{ da: '3', cohorte: 'a2024' }]);
        expect(d.points.concat(d.nonPlaces).some((p) => p.da === '4')).toBe(false);
    });
    it('les cohortes sont les trimestres du cours d\'origine, dans le temps, chacune avec sa saison, sa teinte et « a des notes »', () => {
        expect(d.cohortes.map((c) => [c.id, c.saison, c.teinte, c.aDesNotes])).toEqual([
            ['a2024', 'automne', 0, true], ['a2025', 'automne', 1, true], ['h2026', 'hiver', 2, false]]);
    });
    it('le nuage ne sait rien des cours : une comparaison quelconque (deux mesures, un groupe) le nourrit', () => {
        const parProgramme = { nomX: 'x', nomY: 'y',
            groupeDe: (e) => ({ id: e.nom[0], nom: 'Groupe ' + e.nom[0], saison: null, rang: e.nom.charCodeAt(0) }),
            lireX: (e) => ({ valeur: Number(e.da) * 10, nb: 1 }), lireY: (e) => (e.da === '5' ? null : { valeur: Number(e.da), nb: 1 }) };
        const libre = api.preparer(reg, parProgramme);
        expect(libre.points.map((p) => [p.da, p.cohorte, p.x, p.y])).toEqual([['1', 'B', 10, 1], ['2', 'C', 20, 2], ['3', 'D', 30, 3], ['4', 'É', 40, 4]]);
        expect(libre.cohortes.map((c) => [c.nom, c.aDesNotes])).toEqual([['Groupe B', true], ['Groupe C', true], ['Groupe D', true], ['Groupe F', false], ['Groupe É', true]]);
    });
    it('le trimestre en texte libre se lit : année, saison, ordre', () => {
        expect(api.lireTrimestre('Hiver 2026')).toEqual({ annee: 2026, saison: 'hiver', rang: 20261 });
        expect(api.lireTrimestre('a2025').rang).toBe(20253);
        expect(api.lireTrimestre('É26').saison).toBe('ete');
        expect(api.lireTrimestre('bientôt').rang).toBe(-1);
        expect(api.lireTrimestre('H2026').rang).toBeGreaterThan(api.lireTrimestre('A2025').rang);
    });
    it('à trimestre illisible ou égal, le dernier saisi l\'emporte', () => {
        expect(api.resultatDuCours([note(50, '?'), note(61, '?')], SUIVANT).note).toBe(61);
        expect(api.resultatDuCours([note(70, 'H2026'), note(61, '?')], SUIVANT).note).toBe(70);
    });
    it('une note hors de l\'échelle se pose au bord, et le dit', () => {
        expect(api.position(35, api.AXE_Y)).toEqual({ pourcent: 0, horsEchelle: true });
        expect(api.position(75, api.AXE_X)).toEqual({ pourcent: 50, horsEchelle: false });
    });
});

describe('Tendances — les comptes des zones', () => {
    it('réussite aux deux, réussite à l\'origine et échec ensuite, sous le seuil à l\'origine ; le seuil réussit', () => {
        expect(api.seuilReussite()).toBe(60);
        const points = [{ x: 60, y: 60 }, { x: 85, y: 91 }, { x: 60, y: 59.9 }, { x: 59.9, y: 95 }, { x: 52, y: 44 }, { x: 59, y: 60 }];
        expect(api.compterZones(points)).toEqual({ reussite: 2, echecSuite: 1, sousLeSeuil: 3 });
    });
});

describe('Tendances — « Ce que ça dit » : des comptes, aucun jugement', () => {
    const dire = (points, nbNonPlaces = 0) => api.phrases(points, { origine: ORIGINE, suivant: SUIVANT, nbNonPlaces });
    const pts = (reussis, echecs) => [...Array(reussis).fill({ x: 70, y: 80 }), ...Array(echecs).fill({ x: 70, y: 50 }), { x: 55, y: 90 }];

    it('le compte de réussite, accordé, aux noms des cours déclarés', () => {
        expect(dire(pts(3, 2))).toEqual(['3 des 5 étudiant·es qui ont réussi le 201-NYA-05 ont aussi réussi le 201-NYB-05.']);
        expect(dire(pts(1, 4))[0]).toBe('1 des 5 étudiant·es qui ont réussi le 201-NYA-05 a aussi réussi le 201-NYB-05.');
        expect(dire(pts(0, 4))[0]).toBe('Aucun·e des 4 étudiant·es qui ont réussi le 201-NYA-05 n\'a réussi le 201-NYB-05.');
        expect(dire(pts(1, 0))[0]).toBe('L\'étudiant·e qui a réussi le 201-NYA-05 a aussi réussi le 201-NYB-05.');
        expect(dire(pts(0, 1))[0]).toBe('L\'étudiant·e qui a réussi le 201-NYA-05 n\'a pas réussi le 201-NYB-05.');
        expect(dire(pts(0, 0))[0]).toBe('Aucun·e des étudiant·es affiché·es n\'a réussi le 201-NYA-05.');
    });
    it('le compte des non placé·es s\'ajoute quand il y en a, accordé', () => {
        expect(dire(pts(3, 2), 2)[1]).toBe('2 inscrit·es n\'ont pas de note de 201-NYA-05 calculable et ne sont pas placé·es.');
        expect(dire(pts(3, 2), 1)[1]).toBe('1 inscrit·e n\'a pas de note de 201-NYA-05 calculable et n\'est pas placé·e.');
    });
    it('l\'écran ne commente ni les données ni l\'échantillon, à 2 billes comme à 40 (décision du 11 nov.)', () => {
        const droite = (n) => Array.from({ length: n }, (_, i) => ({ x: 60 + i, y: 60 + i }));
        [2, 14, 15, 40].forEach((n) => {
            const dites = dire(droite(n), 3);
            expect(dites.length, String(n)).toBe(2);
            expect(dites.join(' '), String(n)).not.toMatch(/peu|preuve|piste|trop tôt|annonce|en général|correcteur|façon de noter|hors séquence|tendance/i);
        });
        // Le calcul de corrélation est RETIRÉ, pas masqué.
        expect(['pearson', 'SEUILS'].filter((nom) => nom in api)).toEqual([]);
    });
});

describe('Tendances — les filtres de cohortes', () => {
    const cohortes = [{ id: 'a2024', saison: 'automne' }, { id: 'h2025', saison: 'hiver' }, { id: 'a2025', saison: 'automne' }];

    it('un bouton de saison coche d\'un toucher les cohortes de sa saison', () => {
        expect(api.cohortesDeSaison(cohortes, 'hiver')).toEqual(['h2025']);
        expect(api.cohortesDeSaison(cohortes, 'toutes')).toEqual(['a2024', 'h2025', 'a2025']);
    });
    it('un bouton de saison est enfoncé quand la sélection est EXACTEMENT la sienne', () => {
        expect(api.saisonEnfoncee(cohortes, ['a2025', 'a2024'], 'automne')).toBe(true);
        expect(api.saisonEnfoncee(cohortes, ['a2024'], 'automne')).toBe(false);
        expect(api.saisonEnfoncee(cohortes, ['a2024', 'a2025', 'h2025'], 'automne')).toBe(false);
        expect(api.saisonEnfoncee(cohortes, ['a2024', 'a2025', 'h2025'], 'toutes')).toBe(true);
        expect(api.saisonEnfoncee([cohortes[0]], [], 'hiver')).toBe(false);
    });
    it('le filtre garde les billes des cohortes cochées et compte leurs non placé·es', () => {
        const donnees = { cohortes, points: [{ da: '1', cohorte: 'a2024' }, { da: '2', cohorte: 'h2025' }], nonPlaces: [{ da: '3', cohorte: 'h2025' }, { da: '4', cohorte: 'a2025' }] };
        expect(api.filtrer(donnees, ['a2024', 'a2025'])).toEqual({ points: [{ da: '1', cohorte: 'a2024' }], nbNonPlaces: 1 });
        expect(api.filtrer(donnees, ['a2024', 'h2025', 'a2025']).nbNonPlaces).toBe(2);
    });
});

describe('Tendances — le rendu', () => {
    const reg = () => registre([
        eleve('2000001', 'Genévrier', 'Fictlou', [dossier('a2025', 'Automne 2025', ORIGINE, 78)], [note(81), note(74, 'A2026', AUTRE)]),
        eleve('2000002', 'Mélèze', 'Fictnoé', [dossier('h2025', 'Hiver 2025', ORIGINE, 58)], [note(64)])
    ]);
    const enfonces = (zone) => deClasse(deClasse(zone, 'tend-filtres')[0], 'tend-bascule').filter((x) => x['attr_aria-pressed'] === 'true')
        .map((x) => x.dataset.cours || x.dataset.saison || x.dataset.cohorte);

    it('à l\'ouverture, TOUTES les cohortes sont affichées : aucune saison n\'est choisie d\'office', () => {
        const zone = rendre(banc(reg()));
        expect(enfonces(zone)).toEqual(['toutes', 'h2025', 'a2025']);
        expect(deClasse(zone, 'tend-cible').length).toBe(2);
    });
    it('les saisons sont des raccourcis de sélection ; une saison sans cohorte n\'a pas de bouton', () => {
        const b = banc(reg());
        b.win.choisirSaisonTendances({ dataset: { saison: 'hiver' } });
        expect(enfonces(rendre(b))).toEqual(['hiver', 'h2025']);
        const r = reg();
        delete r.eleves['2000002'];
        const boutons = deClasse(deClasse(rendre(banc(r)), 'tend-filtres')[0], 'tend-bascule').map((x) => x.dataset.saison).filter(Boolean);
        expect(boutons).toEqual(['toutes', 'automne']);
    });
    it('les mots prennent les noms des cours déclarés : axes, zones, étiquette de la bille', () => {
        const zone = rendre(banc(reg()));
        const texte = toutLeTexte(zone);
        ['Note finale en 201-NYA-05', 'Note en 201-NYB-05', 'Réussite en 201-NYA-05 et en 201-NYB-05', 'Réussite en 201-NYA-05, échec en 201-NYB-05', 'Sous 60 en 201-NYA-05']
            .forEach((mot) => expect(texte, mot).toContain(mot));
        const cibles = deClasse(zone, 'tend-cible');
        expect(cibles.map((c) => [c.tagName, c.attr_type || c.type, c['attr_aria-label']])).toEqual([
            ['BUTTON', 'button', 'Genévrier, Fictlou, Automne 2025, 201-NYA-05 : 78 · 201-NYB-05 : 81'],
            ['BUTTON', 'button', 'Mélèze, Fictnoé, Hiver 2025, 201-NYA-05 : 58 · 201-NYB-05 : 64']]);
        // La bille est celle du suivi des groupes : la classe de la sphère, plus la teinte de la cohorte.
        expect(cibles[0].children.map((c) => c.className)).toEqual(['barre-etudiant tend-bille tend-teinte-1']);
        // La place porte les deux notes : 78 sur l'axe de 50 à 100, 81 sur l'axe de 40 à 100 (depuis le haut).
        expect(parseFloat(cibles[0].style.left)).toBeCloseTo(56, 6);
        expect(parseFloat(cibles[0].style.top)).toBeCloseTo(100 - (81 - 40) / 60 * 100, 6);
    });
    it('deux cours suivants déclarés : un filtre « Cours suivant » ; un seul : pas de filtre', () => {
        const b = banc(reg(), { declaree: sequence([SUIVANT, AUTRE]) });
        const choix = (zone) => deClasse(deClasse(zone, 'tend-filtres')[0], 'tend-bascule').filter((x) => x.dataset.cours).map((x) => [x.dataset.cours, x['attr_aria-pressed']]);
        expect(choix(rendre(b))).toEqual([[SUIVANT, 'true'], [AUTRE, 'false']]);
        b.win.choisirSuivantTendances({ dataset: { cours: AUTRE } });
        const zone = rendre(b);
        expect(choix(zone)).toEqual([[SUIVANT, 'false'], [AUTRE, 'true']]);
        expect(deClasse(zone, 'tend-cible').map((c) => c['attr_aria-label'])).toEqual(['Genévrier, Fictlou, Automne 2025, 201-NYA-05 : 78 · 201-NYC-05 : 74']);
        expect(choix(rendre(banc(reg())))).toEqual([]);
    });
    it('toucher une bille ouvre sa bulle au bon nom ; un second toucher la ferme', () => {
        const b = banc(reg());
        b.win.ouvrirBilleTendances({ dataset: { da: '2000002' } });
        let zone = rendre(b);
        const bulle = deClasse(zone, 'tend-bulle');
        expect(bulle.length).toBe(1);
        expect(toutLeTexte(bulle[0])).toContain('Mélèze, Fictnoé | Hiver 2025 | 201-NYA-05 : 58 | 201-NYB-05 : 64');
        expect(toutLeTexte(bulle[0])).not.toContain('Genévrier');
        expect(deClasse(zone, 'tend-cible').map((c) => c['attr_aria-expanded'])).toEqual(['false', 'true']);
        b.win.ouvrirBilleTendances({ dataset: { da: '2000002' } });
        zone = rendre(b);
        expect(deClasse(zone, 'tend-bulle').length).toBe(0);
    });
    it('en anonymisation : le pseudonyme partout, aucun nom ni prénom', () => {
        const b = banc(reg(), { anonyme: true });
        b.win.ouvrirBilleTendances({ dataset: { da: '2000001' } });
        const rendu = toutLeTexte(rendre(b));
        ['Genévrier', 'Fictlou', 'Mélèze', 'Fictnoé'].forEach((nom) => expect(rendu, nom).not.toContain(nom));
        expect(rendu).toContain('Élève R1, Automne 2025, 201-NYA-05 : 78 · 201-NYB-05 : 81');
        expect(rendu).toContain('Élève R2, Hiver 2025');
    });
    it('« Voir son dossier » ramène à l\'onglet « Registre », sur le dossier ouvert de cet·te étudiant·e', () => {
        const b = banc(reg());
        b.win.choisirOngletLongitudinal({ dataset: { onglet: 'tendances' } });
        b.win.ouvrirBilleTendances({ dataset: { da: '2000002' } });
        const lien = deClasse(rendre(b), 'tend-bulle-dossier')[0];
        expect([lien.textContent, lien['attr_data-action'], lien.dataset.da]).toEqual(['Voir son dossier', 'voirDossierTendances', '2000002']);
        const conteneur = b.elements['registre-longitudinal-conteneur'];
        const avant = conteneur.children.length;
        b.win.voirDossierTendances(lien);
        // Le faux DOM empile les rendus : on lit le dernier (ce que ce geste vient de poser).
        const rendu = { children: conteneur.children.slice(avant) };
        expect(deClasse(rendu, 'rl-onglet').map((o) => [o.textContent, o['attr_aria-selected']])).toEqual([['Registre', 'true'], ['Tendances', 'false']]);
        expect(deClasse(rendu, 'rl-eleve').map((li) => [li.dataset.da, !!deClasse(li, 'rl-dossier')[0].open])).toEqual([['2000001', false], ['2000002', true]]);
    });
    it('ouvrir l\'onglet, filtrer, toucher une bille, voir un dossier n\'écrivent RIEN', () => {
        const b = banc(reg(), { declaree: sequence([SUIVANT, AUTRE]) });
        b.win.choisirOngletLongitudinal({ dataset: { onglet: 'tendances' } });
        b.win.choisirSuivantTendances({ dataset: { cours: AUTRE } });
        b.win.choisirSaisonTendances({ dataset: { saison: 'toutes' } });
        b.win.basculerCohorteTendances({ dataset: { cohorte: 'a2025' } });
        b.win.ouvrirBilleTendances({ dataset: { da: '2000001' } });
        b.win.fermerBulleTendances();
        b.win.voirDossierTendances({ dataset: { da: '2000001' } });
        expect(b.journal).toEqual([]);
    });
    it('registre vide : un état vide dit quoi faire, sans déclaration à remplir', () => {
        const zone = rendre(banc(registre([]), { declaree: null }));
        expect(toutLeTexte(zone)).toContain('Inscris d\'abord des étudiant·es dans l\'onglet « Registre »');
        expect(deClasse(zone, 'tend-sequence').length).toBe(0);
    });
    it('aucune note ultérieure au registre : la déclaration le dit, à la place des cours suivants', () => {
        const sansNote = registre([eleve('2000001', 'Genévrier', 'Fictlou', [dossier('a2025', 'Automne 2025', ORIGINE, 78)], [])]);
        expect(toutLeTexte(rendre(banc(sansNote, { declaree: null })))).toContain('Aucune note ultérieure au registre.');
    });
    it('une cohorte sans note pour le cours suivant garde sa puce, avec « pas encore de note »', () => {
        const r = reg();
        r.eleves['2000003'] = eleve('2000003', 'Noyer', 'Fictzoé', [dossier('h2026', 'Hiver 2026', ORIGINE, 70)], []);
        const puces = deClasse(rendre(banc(r)), 'tend-puce');
        expect(puces.map((p) => [p.dataset.cohorte, p['attr_aria-pressed'], toutLeTexte(p).includes('pas encore de note')])).toEqual([
            ['h2025', 'true', false], ['a2025', 'true', false], ['h2026', 'true', true]]);
    });
});

describe('Tendances — les règles du dépôt sur le fichier neuf', () => {
    const js = readFileSync(path.join(RACINE, 'js/suivi-tendances.js'), 'utf8');
    const css = readFileSync(path.join(RACINE, 'styles.css'), 'utf8');
    const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
    const code = sansCommentaires(js).replace(/(^|[^:])\/\/.*$/gm, '$1');

    it('RIEN de propre à une discipline dans le code : ni numéro de cours, ni « ton cours », ni saison « hors séquence »', () => {
        ['101', '102', '103', '601', 'ton 1', 'hors séquence', 'correcteur', 'façon de noter'].forEach((mot) => expect(code, mot).not.toContain(mot));
    });
    it('le module bâtit par le DOM : ni innerHTML, ni handler en ligne, ni console.log ; une seule écriture, celle de sa clé', () => {
        ['innerHTML', 'insertAdjacentHTML', 'console.log', 'onclick', 'setSync', 'localStorage'].forEach((mot) => expect(code, mot).not.toContain(mot));
        expect(code.match(/db\.set\([^)]*/g)).toEqual(['db.set(NOM_CLE, sequencePropre(sequence']);
    });
    it('les mots de l\'écran disent « étudiant·es », jamais « élèves »', () => {
        const mots = banc(registre([])).win.MOTS_TENDANCES_LONGITUDINAL;
        const tous = Object.values(mots).map((m) => (typeof m === 'function' ? m(2, 3, 'A', 'B') : String(m))).join(' ');
        expect(tous).not.toMatch(/[ée]l[èe]ve/i);
        expect(tous).toContain('étudiant·es');
    });
    it('une seule source pour la sphère : les règles de la bille ne recopient ni le dégradé ni l\'ombre', () => {
        const regles = sansCommentaires(css).match(/[^{}]*\.tend-[^{}]*\{[^{}]*\}/g) || [];
        expect(regles.length).toBeGreaterThan(40);
        const bille = regles.filter((r) => r.includes('.tend-bille'));
        expect(bille.length).toBeGreaterThan(3);
        bille.forEach((r) => { expect(r).not.toMatch(/gradient|box-shadow/); });
        expect(bille.join('\n')).toMatch(/animation:\s*none/);
    });
    it('#540 : aucun survol des règles de l\'onglet hors de @media (hover: hover)', () => {
        const propre = sansCommentaires(css);
        const hors = propre.replace(/@media\s*\(hover:\s*hover\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
        const survols = (hors.match(/[^{}]*:hover[^{}]*\{/g) || []).filter((s) => /\.tend-|\.rl-onglet/.test(s));
        expect(survols).toEqual([]);
        expect(propre).toMatch(/@media\s*\(hover:\s*hover\)\s*\{[^@]*\.tend-cible:hover/);
    });
    it('la palette des cohortes compte au moins six teintes, autant que le module en attend', () => {
        const teintes = new Set((css.match(/--tend-cohorte-\d+:/g) || []));
        expect(teintes.size).toBeGreaterThanOrEqual(6);
        expect(teintes.size).toBe(api.NB_TEINTES);
        for (let i = 0; i < api.NB_TEINTES; i++) expect(css).toContain('.tend-teinte-' + i + ' {');
    });
});
