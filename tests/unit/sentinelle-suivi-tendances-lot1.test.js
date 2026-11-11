/**
 * SENTINELLE — SUIVI LONGITUDINAL, LOT 1 : L'ONGLET « TENDANCES », LE NUAGE DE POINTS (11 nov. 2026).
 *
 * Décision de Grégoire (11 nov.) : à côté du registre, un onglet montre si les étudiant·es de son 101 réussissent
 * ensuite le 102, puis le 103. Ce banc tient le CALCUL (js/suivi-tendances.js, fonctions pures) et ce que le rendu
 * promet sans navigateur :
 *   1. le choix des données — le dossier de 101 le plus récent, le résultat le plus récent (trimestre en texte libre),
 *      une note de 101 non constructible n'est pas placée et se compte, sans dossier de 101 on n'est d'aucune cohorte ;
 *   2. les comptes des trois zones ;
 *   3. le r de Pearson ;
 *   4. les trois phrases de « Ce que ça dit », leurs seuils et leurs accords ;
 *   5. les filtres de saison ;
 *   6. le pseudonyme en anonymisation, « Voir son dossier », et la lecture seule (aucune écriture) ;
 *   7. les règles du dépôt sur le fichier neuf (une seule source pour la sphère, #540, pas d'innerHTML).
 * Tous les noms sont fictifs. Chaque essai a son break-test (rapport du lot).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const dossier = (trimestre, trimestreNom, coursCode, P, constructible = true) => ({
    capteLe: '2026-09-18T12:00:00.000Z', trimestre, trimestreNom, coursId: 'C', coursCode, groupe: '00001',
    evaluations: [], presences: [], empreinte: { grilles: [], echelles: [] }, grillesIds: [], echellesIds: [],
    indices: { cp: P === null ? null : { actuel: { C: 90, P, noteConstructible: constructible } }, assiduite: null, patternsRaI: null }
});
const eleve = (da, nom, prenom, dossiers, resultats) => ({ da, nom, prenom, inscritLe: '2026-09-18', reprise913: true, dossiers, resultatsUlterieurs: resultats });
const registre = (eleves) => ({ format: 'registre-longitudinal', version: 1, modeles: { grilles: {}, echelles: {} },
    eleves: Object.fromEntries(eleves.map((e) => [e.da, e])) });
const r102 = (note, trimestre = 'H2026') => ({ cours: '601-102-MQ', trimestre, note });

function banc(reg, anonyme = { actif: false }) {
    const store = storeBase();
    Object.keys(store).filter((k) => k.startsWith('test_')).forEach((k) => delete store[k]);
    Object.assign(store, { trimestres: [], cours: [], registreLongitudinal: reg });
    const journal = [];
    const b = monter(store, {
        journal,
        modules: ['js/registre-longitudinal.js', 'js/suivi-tendances.js'],
        objetsExportes: ['registreLongitudinal', 'tendancesLongitudinal'],
        globaux: {
            cle: (k) => 'h2026_' + k, cleSource: (k, t) => t + '_' + k,
            obtenirTrimestres: () => [], estModeAnonymisation: () => anonyme.actif,
            calculerEtStockerIndicesCP: () => {}, calculerTousLesIndices: () => ({})
        }
    });
    b.win.estModeAnonymisation = () => anonyme.actif;
    return Object.assign(b, { api: b.win.tendancesLongitudinal, journal });
}

/** Rend l'onglet dans une zone NEUVE (le faux DOM ne vide pas ses enfants) et la rend. */
function rendre(b) {
    const zone = b.document ? b.document.createElement('div') : null;
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

/** n billes de 101 réussi dont le r de Pearson avec la note suivante est piloté par `pente` et `bruit`. */
function nuage(n, f) {
    return Array.from({ length: n }, (_, i) => ({ da: String(i), cohorte: 'a2025', x: 60 + i * 2, y: f(i) }));
}

const api = banc(registre([])).api;

describe('Tendances — le choix des données', () => {
    const reg = registre([
        // Deux dossiers de 101 : le plus récent (Automne 2025) l'emporte sur l'hiver de la même année.
        eleve('1', 'Bouleau', 'Fictanne', [dossier('a2025', 'Automne 2025', '601-101-MQ', 72), dossier('h2025', 'Hiver 2025', '601-101-MQ', 41)], [r102(80)]),
        // Deux résultats de 102 : le plus récent, lu dans le texte libre ; le 103 ne compte pas pour le 102.
        eleve('2', 'Cèdre', 'Fictbob', [dossier('a2024', 'Automne 2024', '601-101-MQ', 65.4)],
            [r102(48, 'Hiver 2025'), r102(66, 'A25'), { cours: '601-103-MQ', trimestre: 'H2026', note: 90 }]),
        // Note de 101 non constructible : pas placé·e, compté·e.
        eleve('3', 'Dorine', 'Fictcam', [dossier('a2024', 'Automne 2024', '601-101-MQ', 55, false)], [r102(70)]),
        // Pas de dossier de 101 (un 102 donné par l'enseignant·e) : d'aucune cohorte.
        eleve('4', 'Épinette', 'Fictdev', [dossier('h2026', 'Hiver 2026', '601-102-MQ', 77)], [r102(88)]),
        // Un dossier de 101, aucune note du cours : la cohorte existe, sans note.
        eleve('5', 'Frêne', 'Fictéva', [dossier('h2026', 'Hiver 2026', '601-101-MQ', 81)], [{ cours: '601-102-MQ', trimestre: 'A2026', note: 'EC' }])
    ]);
    const d = api.preparer(reg, '102');

    it('une bille par inscrit·e qui a une note de 101 constructible et une note chiffrée du cours', () => {
        expect(d.points.map((p) => p.da).sort()).toEqual(['1', '2']);
    });
    it('deux dossiers de 101 : le plus récent, et le point le sait', () => {
        const p = d.points.find((x) => x.da === '1');
        expect([p.x, p.cohorte, p.nbDossiers101]).toEqual([72, 'a2025', 2]);
    });
    it('deux résultats du même cours : le plus récent par le trimestre en texte libre', () => {
        const p = d.points.find((x) => x.da === '2');
        expect([p.x, p.y, p.nbResultats, p.trimestreResultat]).toEqual([65.4, 66, 2, 'A25']);
        expect(api.preparer(reg, '103').points.map((x) => [x.da, x.y])).toEqual([['2', 90]]);
    });
    it('note de 101 non constructible : non placé·e, compté·e ; sans dossier de 101 : ni l\'un ni l\'autre', () => {
        expect(d.nonPlaces).toEqual([{ da: '3', cohorte: 'a2024' }]);
        expect(d.points.concat(d.nonPlaces).some((p) => p.da === '4')).toBe(false);
    });
    it('les cohortes sont les trimestres de 101, dans le temps, chacune avec sa saison, sa teinte et « a des notes »', () => {
        expect(d.cohortes.map((c) => [c.id, c.saison, c.teinte, c.aDesNotes])).toEqual([
            ['a2024', 'automne', 0, true], ['a2025', 'automne', 1, true], ['h2026', 'hiver', 2, false]]);
    });
    it('le trimestre en texte libre se lit : année, saison, ordre', () => {
        expect(api.lireTrimestre('Hiver 2026')).toEqual({ annee: 2026, saison: 'hiver', rang: 20261 });
        expect(api.lireTrimestre('a2025').rang).toBe(20253);
        expect(api.lireTrimestre('É26').saison).toBe('ete');
        expect(api.lireTrimestre('bientôt').rang).toBe(-1);
        expect(api.lireTrimestre('H2026').rang).toBeGreaterThan(api.lireTrimestre('A2025').rang);
    });
    it('à trimestre illisible ou égal, le dernier saisi l\'emporte', () => {
        expect(api.resultatDuCours([r102(50, '?'), r102(61, '?')], '102').note).toBe(61);
        expect(api.resultatDuCours([r102(70, 'H2026'), r102(61, '?')], '102').note).toBe(70);
    });
    it('une note hors de l\'échelle se pose au bord, et le dit', () => {
        expect(api.position(35, api.AXE_SUITE)).toEqual({ pourcent: 0, horsEchelle: true });
        expect(api.position(75, api.AXE_101)).toEqual({ pourcent: 50, horsEchelle: false });
    });
});

describe('Tendances — les comptes des zones', () => {
    it('réussite aux deux, réussite en 101 et échec ensuite, sous 60 en 101 ; 60 réussit', () => {
        const points = [{ x: 60, y: 60 }, { x: 85, y: 91 }, { x: 60, y: 59.9 }, { x: 59.9, y: 95 }, { x: 52, y: 44 }, { x: 59, y: 60 }];
        expect(api.compterZones(points)).toEqual({ reussite: 2, echecSuite: 1, sous60: 3 });
    });
});

describe('Tendances — le r de Pearson', () => {
    it('vaut 1 et -1 sur une droite, et la valeur attendue sur un jeu connu', () => {
        expect(api.pearson(nuage(5, (i) => 50 + i * 3))).toBeCloseTo(1, 10);
        expect(api.pearson(nuage(5, (i) => 90 - i * 3))).toBeCloseTo(-1, 10);
        // x = 1..5, y = 2, 4, 5, 4, 5 : r = 0,7746 (exemple classique).
        const jeu = [2, 4, 5, 4, 5].map((y, i) => ({ x: i + 1, y }));
        expect(api.pearson(jeu)).toBeCloseTo(0.7746, 4);
    });
    it('ne se calcule pas sous deux billes, ni quand une note ne varie pas', () => {
        expect(api.pearson([{ x: 70, y: 70 }])).toBeNull();
        expect(api.pearson(nuage(6, () => 75))).toBeNull();
    });
});

describe('Tendances — « Ce que ça dit »', () => {
    const dire = (points, plus = {}) => api.phrases(points, Object.assign({ cours: '102', nbNonPlaces: 0, saisonsMelees: false }, plus));

    it('ce qu\'on voit : k des m, accordé', () => {
        const pts = (reussis, echecs) => [...Array(reussis).fill({ x: 70, y: 80 }), ...Array(echecs).fill({ x: 70, y: 50 }), { x: 55, y: 90 }];
        expect(dire(pts(3, 2))[0]).toBe('3 des 5 étudiant·es qui ont réussi ton 101 ont aussi réussi le 102.');
        expect(dire(pts(1, 4))[0]).toBe('1 des 5 étudiant·es qui ont réussi ton 101 a aussi réussi le 102.');
        expect(dire(pts(0, 4))[0]).toBe('Aucun·e des 4 étudiant·es qui ont réussi ton 101 n\'a réussi le 102.');
        expect(dire(pts(1, 0))[0]).toBe('L\'étudiant·e qui a réussi ton 101 a aussi réussi le 102.');
        expect(dire(pts(0, 1))[0]).toBe('L\'étudiant·e qui a réussi ton 101 n\'a pas réussi le 102.');
        expect(dire(pts(0, 0))[0]).toBe('Aucun·e des étudiant·es affiché·es n\'a réussi ton 101.');
    });

    it('le lien : trop tôt sous 15 billes, même sur une droite parfaite', () => {
        expect(dire(nuage(14, (i) => 60 + i))[1]).toBe('Avec 14 étudiant·es, il est trop tôt pour dire si la note de 101 annonce celle de 102.');
        expect(dire(nuage(1, () => 70))[1]).toBe('Avec 1 étudiant·e, il est trop tôt pour dire si la note de 101 annonce celle de 102.');
        expect(dire(nuage(15, (i) => 60 + i))[1]).not.toContain('trop tôt');
    });

    it('le lien : quatre phrases selon le r, aux seuils de 0,3 et de 0,5', () => {
        expect(api.SEUILS).toEqual({ BILLES_MIN_POUR_DIRE_UN_LIEN: 15, R_LIEN_LEGER: 0.3, R_LIEN_NET: 0.5 });
        // Une pente, plus un bruit alterné : l'ampleur du bruit règle le r.
        const jeu = (bruit, sens = 1) => nuage(16, (i) => 70 + sens * i + (i % 2 ? bruit : -bruit));
        const cas = [
            [jeu(2), 0.5, 1, 'En général, plus la note de 101 est haute, plus celle de 102 l\'est aussi.'],
            [jeu(8.5), 0.5, 1, 'En général, plus la note de 101 est haute, plus celle de 102 l\'est aussi.'],
            [jeu(10), 0.3, 0.5, 'La note de 101 annonce un peu celle de 102, sans plus.'],
            [jeu(14), 0.3, 0.5, 'La note de 101 annonce un peu celle de 102, sans plus.'],
            [jeu(40), -0.3, 0.3, 'Les notes de 101 n\'annoncent pas clairement celles de 102.'],
            [jeu(10, -1), -1, -0.3, 'Les notes de 101 et de 102 vont plutôt en sens inverse : à regarder de près.']
        ];
        cas.forEach(([points, min, max, phrase]) => {
            const r = api.pearson(points);
            expect(r, phrase).toBeGreaterThanOrEqual(min);
            expect(r, phrase).toBeLessThan(max);
            expect(dire(points)[1]).toBe(phrase);
        });
        // Une note qui ne varie pas : aucun r, donc aucun lien clair.
        expect(dire(nuage(15, () => 75))[1]).toBe('Les notes de 101 n\'annoncent pas clairement celles de 102.');
    });

    it('la limite, toujours ; les saisons mêlées et les non placé·es s\'y ajoutent, accordés', () => {
        const base = ' c\'est peu : c\'est une piste, pas une preuve. Les notes de 103 viennent d\'un autre correcteur, avec une autre façon de noter.';
        expect(dire(nuage(12, (i) => 60 + i), { cours: '103' })[2]).toBe('12 étudiant·es,' + base);
        expect(dire(nuage(1, () => 70), { cours: '103' })[2]).toBe('1 étudiant·e,' + base);
        expect(dire(nuage(3, (i) => 60 + i), { saisonsMelees: true, nbNonPlaces: 2 })[2]).toMatch(
            /façon de noter\. Tu mêles des groupes d'automne et d'hiver ; ceux d'hiver sont hors séquence\. 2 inscrit·es n'ont pas de note de 101 calculable et ne sont pas placé·es\.$/);
        expect(dire(nuage(3, (i) => 60 + i), { nbNonPlaces: 1 })[2]).toMatch(/façon de noter\. 1 inscrit·e n'a pas de note de 101 calculable et n'est pas placé·e\.$/);
    });
});

describe('Tendances — les filtres de saison', () => {
    const cohortes = [{ id: 'a2024', saison: 'automne' }, { id: 'h2025', saison: 'hiver' }, { id: 'a2025', saison: 'automne' }];

    it('à l\'ouverture : les cohortes d\'automne ; sans automne, toutes', () => {
        expect(api.selectionParDefaut(cohortes)).toEqual(['a2024', 'a2025']);
        expect(api.selectionParDefaut([cohortes[1]])).toEqual(['h2025']);
    });
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
    it('le filtre garde les billes des cohortes cochées, compte leurs non placé·es et voit le mélange des saisons', () => {
        const donnees = { cohortes, points: [{ da: '1', cohorte: 'a2024' }, { da: '2', cohorte: 'h2025' }], nonPlaces: [{ da: '3', cohorte: 'h2025' }, { da: '4', cohorte: 'a2025' }] };
        expect(api.filtrer(donnees, ['a2024', 'a2025'])).toEqual({ points: [{ da: '1', cohorte: 'a2024' }], nbNonPlaces: 1, saisonsMelees: false });
        const tout = api.filtrer(donnees, ['a2024', 'h2025', 'a2025']);
        expect([tout.points.length, tout.nbNonPlaces, tout.saisonsMelees]).toEqual([2, 2, true]);
    });
});

describe('Tendances — le rendu : pseudonyme, « Voir son dossier », lecture seule', () => {
    const reg = () => registre([
        eleve('2000001', 'Genévrier', 'Fictlou', [dossier('a2025', 'Automne 2025', '601-101-MQ', 78)], [r102(81)]),
        eleve('2000002', 'Mélèze', 'Fictnoé', [dossier('a2025', 'Automne 2025', '601-101-MQ', 58)], [r102(64)])
    ]);

    it('chaque bille est un bouton nommé : le nom, la cohorte, les deux notes', () => {
        const b0 = banc(reg());
        const zone = rendre(b0);
        const cibles = deClasse(zone, 'tend-cible');
        expect(cibles.map((c) => [c.tagName, c.attr_type || c.type, c['attr_aria-label']])).toEqual([
            ['BUTTON', 'button', 'Genévrier, Fictlou, Automne 2025, 101 : 78 · 102 : 81'],
            ['BUTTON', 'button', 'Mélèze, Fictnoé, Automne 2025, 101 : 58 · 102 : 64']]);
        // La bille est celle du suivi des groupes : la classe de la sphère, plus la teinte de la cohorte.
        expect(cibles[0].children.map((c) => c.className)).toEqual(['barre-etudiant tend-bille tend-teinte-0']);
        // La place porte les deux notes : 78 sur l'axe de 50 à 100, 81 sur l'axe de 40 à 100.
        expect(b0.api.seuilReussite()).toBe(60);
        expect(parseFloat(cibles[0].style.left)).toBeCloseTo(56, 6);
        expect(parseFloat(cibles[0].style.top)).toBeCloseTo(100 - (81 - 40) / 60 * 100, 6);   // depuis le haut : une note haute est en haut
    });

    it('toucher une bille ouvre sa bulle au bon nom ; un second toucher la ferme', () => {
        const b = banc(reg());
        b.win.ouvrirBilleTendances({ dataset: { da: '2000002' } });
        let zone = rendre(b);
        const bulle = deClasse(zone, 'tend-bulle');
        expect(bulle.length).toBe(1);
        expect(toutLeTexte(bulle[0])).toContain('Mélèze, Fictnoé | Automne 2025 | 101 : 58 · 102 : 64');
        expect(toutLeTexte(bulle[0])).not.toContain('Genévrier');
        expect(deClasse(zone, 'tend-cible').map((c) => c['attr_aria-expanded'])).toEqual(['false', 'true']);
        b.win.ouvrirBilleTendances({ dataset: { da: '2000002' } });
        zone = rendre(b);
        expect(deClasse(zone, 'tend-bulle').length).toBe(0);
    });

    it('en anonymisation : le pseudonyme partout, aucun nom ni prénom', () => {
        const b = banc(reg(), { actif: true });
        b.win.ouvrirBilleTendances({ dataset: { da: '2000001' } });
        const rendu = toutLeTexte(rendre(b));
        ['Genévrier', 'Fictlou', 'Mélèze', 'Fictnoé'].forEach((nom) => expect(rendu, nom).not.toContain(nom));
        expect(rendu).toContain('Élève R1, Automne 2025, 101 : 78 · 102 : 81');
        expect(rendu).toContain('Élève R2, Automne 2025');
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
        const onglets = deClasse(rendu, 'rl-onglet');
        expect(onglets.map((o) => [o.textContent, o['attr_aria-selected']])).toEqual([['Registre', 'true'], ['Tendances', 'false']]);
        const lignes = deClasse(rendu, 'rl-eleve');
        const ouverts = lignes.map((li) => [li.dataset.da, !!deClasse(li, 'rl-dossier')[0].open]);
        expect(ouverts).toEqual([['2000001', false], ['2000002', true]]);
    });

    it('lecture seule : ouvrir l\'onglet, filtrer, toucher une bille, voir un dossier n\'écrivent RIEN', () => {
        const b = banc(reg());
        b.win.choisirOngletLongitudinal({ dataset: { onglet: 'tendances' } });
        b.win.choisirCoursTendances({ dataset: { cours: '103' } });
        b.win.choisirSaisonTendances({ dataset: { saison: 'toutes' } });
        b.win.basculerCohorteTendances({ dataset: { cohorte: 'a2025' } });
        b.win.ouvrirBilleTendances({ dataset: { da: '2000001' } });
        b.win.fermerBulleTendances();
        b.win.voirDossierTendances({ dataset: { da: '2000001' } });
        expect(b.journal).toEqual([]);
    });

    it('registre vide, ou sans note ultérieure : un état vide dit quoi faire', () => {
        expect(toutLeTexte(rendre(banc(registre([]))))).toContain('Inscris d\'abord des étudiant·es dans l\'onglet « Registre »');
        const sansNote = registre([eleve('2000001', 'Genévrier', 'Fictlou', [dossier('a2025', 'Automne 2025', '601-101-MQ', 78)], [])]);
        const rendu = toutLeTexte(rendre(banc(sansNote)));
        expect(rendu).toContain('Aucune note de 102 ou de 103 au registre.');
        expect(rendu).not.toContain('tend-cible');
    });

    it('une cohorte sans note pour le cours choisi garde sa puce, avec « pas encore de note »', () => {
        const r = reg();
        r.eleves['2000003'] = eleve('2000003', 'Noyer', 'Fictzoé', [dossier('h2026', 'Hiver 2026', '601-101-MQ', 70)], []);
        const puces = deClasse(rendre(banc(r)), 'tend-puce');
        expect(puces.map((p) => [p.dataset.cohorte, p['attr_aria-pressed'], toutLeTexte(p).includes('pas encore de note')])).toEqual([
            ['a2025', 'true', false], ['h2026', 'false', true]]);
    });
});

describe('Tendances — les règles du dépôt sur le fichier neuf', () => {
    const js = readFileSync(path.join(RACINE, 'js/suivi-tendances.js'), 'utf8');
    const css = readFileSync(path.join(RACINE, 'styles.css'), 'utf8');
    const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');

    it('le module bâtit par le DOM : ni innerHTML, ni handler en ligne, ni console.log, ni écriture', () => {
        const code = sansCommentaires(js).replace(/(^|[^:])\/\/.*$/gm, '$1');
        ['innerHTML', 'insertAdjacentHTML', 'console.log', 'onclick', 'db.set', 'setSync', 'localStorage'].forEach((mot) => expect(code, mot).not.toContain(mot));
    });
    it('les mots de l\'écran disent « étudiant·es », jamais « élèves »', () => {
        const mots = banc(registre([])).win.MOTS_TENDANCES_LONGITUDINAL;
        const tous = Object.values(mots).map((m) => (typeof m === 'function' ? m(2, 3, '102') : String(m))).join(' ');
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
