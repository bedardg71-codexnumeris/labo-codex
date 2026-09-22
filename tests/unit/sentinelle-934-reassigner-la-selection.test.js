import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche, position } from './_helpers/tranche.js';

// SENTINELLE #934 (22 sept. 2026) — « RÉASSIGNER LA SÉLECTION » : UNE QUESTION GROUPÉE
// QUI COMPTE, NOMME LES FICHIERS ET LISTE LES CONFLITS, PUIS ÉCRIT PAR LE GESTE UNIQUE.
//
// Vécu le 22 sept. : 24 copies importées sous la mauvaise production, corrigées une
// par une depuis « Réassocier » de la Liste des évaluations (pas depuis le tableau
// d'« Annoter et évaluer », que Grégoire n'emploie pas — consigne du jour, §1d).
//
// Quatre bords :
//   R — le récapitulatif est PUR : déjà sur la cible, ambigus (deux copies d'un même
//       élève), conflits, évaluations orphelines, à déplacer ; et son HTML compte,
//       nomme, échappe.
//   L — une ligne de la liste porte une case SEULEMENT si elle porte une copie ; la
//       case nomme le fichier ; l'étiquette est échappée.
//   S — structure : l'écriture passe par `travauxUI.ecrireReassignation` sur des
//       mesures de `travauxUI.mesurerReassignation`, sans `confirm()` en boucle ni
//       `reassocierFichier` nu ; la colonne de sélection décale la carte des
//       colonnes ; chaque rendu remet la sélection à zéro.
//   D — comportement au DOM (stub) : barre, compte, « tout sélectionner », modale :
//       « Annuler » n'écrit rien, confirmer écrit chaque mesure à déplacer.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const lire = (rel) => readFileSync(path.join(racineProjet, rel), 'utf8');
const sansCommentaires = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');

function echapperHtmlReel(texte) {
    if (texte == null) return '';
    return String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const A2 = 'PROD_A2', A2R = 'PROD_A2R';
const PRODUCTIONS = [{ id: A2, titre: 'Artefact 2' }, { id: A2R, titre: 'Artefact 2 (rév)' }];
const ETUDIANTS = [
    { da: '2000001', nom: 'Allache', prenom: 'Sara' },
    { da: '2000002', nom: 'Roy', prenom: 'Camille' },
    { da: '2000003', nom: 'Gagnon', prenom: 'Léa' }
];

/** Une mesure telle que `travauxUI.mesurerReassignation` la rend. */
function mesure(id, da, nomFichier, extra) {
    const e = ETUDIANTS.find(x => x.da === da);
    return Object.assign({
        fichierId: id, association: { productionId: A2R }, fichier: { id, etudiantDA: da, productionId: A2, nomFichier },
        changeEleve: false, changeProduction: true, nomFichier, nomProduction: 'Artefact 2 (rév)',
        nomEleve: e ? e.prenom + ' ' + e.nom : da, conflit: false, fichierExistant: null, nomExistant: '', evaluationOrpheline: false
    }, extra || {});
}

function chargerListe({ fichiers = [], document = undefined, travauxUI = undefined, notifications = undefined } = {}) {
    const globaux = {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: echapperHtmlReel,
        obtenirLibelleStatut: (s) => s,
        obtenirDonneesSelonMode: (k) => (k === 'productions' ? PRODUCTIONS : []),
        obtenirEtudiantsCoursActif: () => ETUDIANTS.slice(),
        setTimeout: () => 0,
        notifications: notifications || { succes() {}, erreur() {}, info() {}, warning() {} },
        travauxStockage: {
            obtenirFichiersTravaux: () => fichiers, obtenirFichiersGroupeActif: () => fichiers,
            obtenirFichierParId: (id) => fichiers.find(f => f.id === id) || null, obtenirCorbeille: () => []
        }
    };
    if (document) globaux.document = document;
    if (travauxUI) globaux.travauxUI = travauxUI;
    return chargerScript('js/liste-evaluations.js', globaux, { addEventListener() {}, removeEventListener() {}, pluriel: (n, s, p) => (n > 1 ? p : s) });
}

/* --------------------------------------------------------- R — récapitulatif pur */

describe('#934 · R — le récapitulatif trie ce que le geste fera, et son HTML le dit', () => {
    const win = chargerListe();

    it('R.a déjà sur la cible, ambigus (deux copies d\'un même élève), conflits, orphelines, à déplacer', () => {
        const mesures = [
            mesure('F_sara', '2000001', 'Allache_A2.pdf', { conflit: true, fichierExistant: { id: 'F_sara_rev' }, nomExistant: 'Allache_A2_rev.jpg' }),
            mesure('F_camille', '2000002', 'Roy_A2.pdf', { evaluationOrpheline: true }),
            mesure('F_lea_1', '2000003', 'Gagnon_A2_p1.jpg'),
            mesure('F_lea_2', '2000003', 'Gagnon_A2_p2.jpg'),
            mesure('F_deja', '2000002', 'Roy_deja_la.pdf', { changeProduction: false }),
            null
        ];
        const r = win._composerRecapReassignation(mesures);
        expect(r.aDeplacer.map(m => m.fichierId)).toEqual(['F_sara', 'F_camille']);
        expect(r.conflits.map(m => m.fichierId)).toEqual(['F_sara']);
        expect(r.orphelines.map(m => m.fichierId)).toEqual(['F_camille']);
        expect(r.dejaSurCible.map(m => m.fichierId)).toEqual(['F_deja']);
        expect(r.ambigus.map(m => m.fichierId)).toEqual(['F_lea_1', 'F_lea_2']);
    });

    it('R.b une copie déjà sur la cible ne rend pas ambiguë celle du même élève qui bouge', () => {
        const r = win._composerRecapReassignation([
            mesure('F_deja', '2000002', 'Roy_deja_la.pdf', { changeProduction: false }),
            mesure('F_camille', '2000002', 'Roy_A2.pdf')
        ]);
        expect(r.aDeplacer.map(m => m.fichierId)).toEqual(['F_camille']);
        expect(r.ambigus).toEqual([]);
    });

    it('R.c le HTML compte les copies, nomme élève et fichier, nomme chaque conflit (existant → arrivant), et échappe', () => {
        const r = win._composerRecapReassignation([
            mesure('F_sara', '2000001', 'Allache_<A2>.pdf', { conflit: true, fichierExistant: { id: 'F_sara_rev' }, nomExistant: 'Allache_A2_rev.jpg' }),
            mesure('F_camille', '2000002', 'Roy_A2.pdf', { evaluationOrpheline: true }),
            mesure('F_lea', '2000003', 'Gagnon_A2.jpg')
        ]);
        const html = win._genererRecapReassignationHTML(r, 'Artefact 2 <rév>');
        expect(html).toContain('<strong>3 copies</strong>');
        expect(html).toContain('Artefact 2 &lt;rév&gt;');
        expect(html).not.toContain('<A2>');
        expect(html).toContain('Sara Allache — Allache_&lt;A2&gt;.pdf');
        expect(html).toContain('Camille Roy — Roy_A2.pdf');
        expect(html).toContain('<strong>1 conflit</strong>');
        expect(html).toContain('Sara Allache : Allache_A2_rev.jpg → remplacé par Allache_&lt;A2&gt;.pdf');
        expect(html).toContain('corbeille');
        expect(html).toContain('1 évaluation sur l’ancienne production perdra sa copie');
    });

    it('R.d rien à déplacer : le HTML le dit, et nomme les ambigus', () => {
        const r = win._composerRecapReassignation([mesure('F_1', '2000003', 'a.jpg'), mesure('F_2', '2000003', 'b.jpg')]);
        const html = win._genererRecapReassignationHTML(r, 'Artefact 2 (rév)');
        expect(html).toContain('Aucune copie à déplacer');
        expect(html).toContain('<strong>2 copies non déplacées</strong>');
        expect(html).toContain('Choisis-en une');
    });
});

/* ---------------------------------------------------- L — la case d'une ligne */

describe('#934 · L — une ligne porte une case seulement si elle porte une copie', () => {
    const HOSTILE = '"><img src=x onerror=alert(1)>';
    const FICHIERS = [{ id: 'FT_sara', etudiantDA: '2000001', productionId: A2, nomFichier: 'Allache_A2.pdf' }];
    const ligne = (extra) => Object.assign({
        da: '2000001', nom: 'Allache', prenom: 'Sara', productionId: A2, productionNom: 'Artefact 2',
        statut: 'non-evalue', statutRemise: 'non-remis', statutWorkflow: 'importe', niveauFinal: '-', noteChiffree: null, evaluationId: null
    }, extra || {});

    it('L.a ligne avec copie (match strict élève × production) : une case qui nomme le fichier', () => {
        const win = chargerListe({ fichiers: FICHIERS });
        const html = win._genererLigneHTML(ligne());
        expect(html).toMatch(/<td class="td-center eval-td-selection"><input type="checkbox" class="eval-selection-cb" data-fichier-id="FT_sara" data-on-change="mettreAJourSelectionEval"/);
        expect(win._trouverFichierDeLigne(ligne()).id).toBe('FT_sara');
    });

    it('L.b ligne « Non reçu » (sans copie) : la cellule existe, vide', () => {
        const win = chargerListe({ fichiers: FICHIERS });
        const html = win._genererLigneHTML(ligne({ productionId: A2R, productionNom: 'Artefact 2 (rév)' }));
        expect(html).toContain('<td class="td-center eval-td-selection"></td>');
        expect(html).not.toContain('eval-selection-cb');
    });

    it('L.c l\'étiquette de la case est échappée', () => {
        const win = chargerListe({ fichiers: FICHIERS });
        const html = win._genererLigneHTML(ligne({ prenom: HOSTILE }));
        expect(html).not.toContain('<img');
        expect(html).toMatch(/aria-label="Sélectionner la copie de &quot;&gt;&lt;img/);
    });

    it('L.d la case et le menu Actions parlent du même fichier', () => {
        const win = chargerListe({ fichiers: FICHIERS });
        const html = win._genererLigneHTML(ligne());
        expect(html).toContain('data-fichier-id="FT_sara"');
        expect(html).toContain('value="associer|FT_sara|2000001"');
    });
});

/* ---------------------------------------------------------------- S — structure */

describe('#934 · S — l\'écriture passe par le geste unique, une question groupée, et la carte des colonnes suit', () => {
    const src = sansCommentaires(lire('js/liste-evaluations.js'));
    const html = lire('index.html');
    // Découpes par tranche() (#858) : un marqueur disparu JETTE, la tranche ne peut pas être vide.
    const corpsDe = (nom) => tranche(src, 'function ' + nom + '(', '\nfunction ', { longueurMin: 200 });

    it('S.a reassignerSelectionEval mesure, puis écrit par ecrireReassignation ; aucun confirm(), aucun reassocierFichier', () => {
        const corps = corpsDe('reassignerSelectionEval');
        const posMesure = corps.indexOf('travauxUI.mesurerReassignation(');
        const posEcrit = corps.indexOf('travauxUI.ecrireReassignation(');
        expect(posMesure).toBeGreaterThan(-1);
        expect(posEcrit).toBeGreaterThan(posMesure);
        expect(corps).not.toContain('confirm(');
        expect(corps).not.toContain('reassocierFichier(');
        expect(corps).not.toContain('reassocierFichiersBatch(');
        expect(corps).not.toContain('deplacerEnCorbeille(');
    });

    it('S.b la première colonne est la sélection : l\'en-tête la porte avant « DA », la carte des colonnes part de 2, la ligne a autant de cellules que l\'en-tête', () => {
        const entete = tranche(html, 'id="entete-evaluations"', '</tr>', { longueurMin: 500 });
        expect(position(entete, 'id="eval-tout-selectionner"')).toBeLessThan(position(entete, 'data-param="da"'));
        const nbTh = (entete.match(/<th\b/g) || []).length;
        const carte = tranche(src, 'const colonneIndexMap', '};', { longueurMin: 80 });
        expect(carte).toMatch(/'da':\s*2/);
        expect(carte).toMatch(/'note':\s*9/);
        const win = chargerListe();
        const ligne = win._genererLigneHTML({ da: 'D', nom: 'N', prenom: 'P', productionId: A2, productionNom: 'x', statut: 'non-evalue', statutRemise: 'non-remis', statutWorkflow: 'non-recu', niveauFinal: '-', noteChiffree: null, evaluationId: null });
        expect((ligne.match(/<td\b/g) || []).length).toBe(nbTh);
        expect(nbTh).toBe(10);
    });

    it('S.c chaque rendu remet la sélection à zéro, et la barre existe dans la page', () => {
        expect(corpsDe('afficherTableauEvaluations')).toContain('mettreAJourSelectionEval()');
        expect(html).toContain('id="eval-barre-selection"');
        expect(html).toContain('data-action="reassignerSelectionEval"');
        expect(html).toContain('data-action="viderSelectionEval"');
        expect(html).toContain('data-on-change="basculerToutSelectionnerEval"');
    });
});

/* ------------------------------------------------------ D — comportement au DOM */

function elementGenerique(extra) {
    const ecouteurs = {};
    return Object.assign({
        value: '', textContent: '', innerHTML: '', checked: false, disabled: false, indeterminate: false, style: {}, dataset: {},
        classList: { classes: new Set(), add(c) { this.classes.add(c); }, remove(c) { this.classes.delete(c); }, contains(c) { return this.classes.has(c); }, toggle(c, force) { if (force === undefined) force = !this.classes.has(c); if (force) this.classes.add(c); else this.classes.delete(c); return force; } },
        ecouteurs,
        addEventListener(type, fn) { ecouteurs[type] = fn; },
        removeEventListener() {}, appendChild() {}, remove() {}, querySelectorAll: () => [], querySelector: () => null,
        setAttribute() {}, getAttribute() { return null; }, dispatchEvent() {}
    }, extra || {});
}

function monterDOM({ cases, mesuresParId = {}, ecrire = () => true } = {}) {
    const journal = { ecrits: [], notifs: [] };
    const overlays = [];
    const registre = {
        'eval-barre-selection': elementGenerique(), 'eval-barre-selection-compte': elementGenerique(),
        'eval-btn-reassigner-selection': elementGenerique(), 'eval-tout-selectionner': elementGenerique(),
        'reassigner-selection-cible': elementGenerique(), 'reassigner-selection-recap': elementGenerique(),
        'reassigner-selection-btn-confirmer': elementGenerique(), 'reassigner-selection-overlay': null
    };
    registre['eval-barre-selection'].classList.add('u-hide');
    const document = {
        addEventListener() {}, removeEventListener() {}, querySelector: () => null,
        querySelectorAll: (sel) => {
            if (sel === '#corps-tableau-evaluations .eval-selection-cb') return cases;
            if (sel === '#corps-tableau-evaluations .eval-selection-cb:checked') return cases.filter(c => c.checked);
            return [];
        },
        getElementById: (id) => (id in registre ? registre[id] : elementGenerique()),
        createElement: () => { const o = elementGenerique({ retire: false }); o.remove = () => { o.retire = true; }; overlays.push(o); return o; },
        body: elementGenerique(), documentElement: elementGenerique()
    };
    const win = chargerListe({
        document,
        travauxUI: {
            mesurerReassignation: (id, assoc) => (mesuresParId[id] ? Object.assign({}, mesuresParId[id], { association: assoc }) : null),
            ecrireReassignation: (m) => { journal.ecrits.push(m.fichierId); return ecrire(m); }
        },
        notifications: { succes: (t) => journal.notifs.push(['succes', t]), erreur: (t) => journal.notifs.push(['erreur', t]), info() {}, warning() {} }
    });
    return { win, journal, overlays, registre, cases };
}

const caseDe = (id, checked) => elementGenerique({ checked: !!checked, getAttribute: (a) => (a === 'data-fichier-id' ? id : null) });

describe('#934 · D — la barre suit les cases, et la modale n\'écrit qu\'à la confirmation', () => {
    it('D.a aucune case cochée : barre masquée, « tout » décoché ; deux cochées : compte et bouton nomment N', () => {
        const cases = [caseDe('F1'), caseDe('F2'), caseDe('F3')];
        const { win, registre } = monterDOM({ cases });
        win.mettreAJourSelectionEval();
        expect(registre['eval-barre-selection'].classList.contains('u-hide')).toBe(true);
        expect(registre['eval-tout-selectionner'].checked).toBe(false);
        cases[0].checked = true; cases[1].checked = true;
        win.mettreAJourSelectionEval();
        expect(registre['eval-barre-selection'].classList.contains('u-hide')).toBe(false);
        expect(registre['eval-barre-selection-compte'].textContent).toBe('2 copies sélectionnées');
        expect(registre['eval-btn-reassigner-selection'].textContent).toBe('Réassigner la sélection (2)');
        expect(registre['eval-tout-selectionner'].indeterminate).toBe(true);
        cases[2].checked = true;
        win.mettreAJourSelectionEval();
        expect(registre['eval-tout-selectionner'].checked).toBe(true);
        expect(registre['eval-tout-selectionner'].indeterminate).toBe(false);
    });

    it('D.b « tout sélectionner » coche toutes les cases affichées ; « tout décocher » les vide ; deux lignes sur un même fichier comptent pour une', () => {
        const cases = [caseDe('F1'), caseDe('F2'), caseDe('F2')];
        const { win, registre } = monterDOM({ cases });
        registre['eval-tout-selectionner'].checked = true;
        win.basculerToutSelectionnerEval(registre['eval-tout-selectionner']);
        expect(cases.every(c => c.checked)).toBe(true);
        expect(registre['eval-barre-selection-compte'].textContent).toBe('2 copies sélectionnées');
        win.viderSelectionEval();
        expect(cases.some(c => c.checked)).toBe(false);
        expect(registre['eval-barre-selection'].classList.contains('u-hide')).toBe(true);
    });

    const MESURES = {
        F_sara: mesure('F_sara', '2000001', 'Allache_A2.pdf', { conflit: true, fichierExistant: { id: 'F_sara_rev' }, nomExistant: 'Allache_A2_rev.jpg' }),
        F_camille: mesure('F_camille', '2000002', 'Roy_A2.pdf'),
        F_lea: mesure('F_lea', '2000003', 'Gagnon_A2.jpg')
    };

    it('D.c la modale : cible choisie ⇒ la question nomme les copies et le conflit, le bouton compte ; « Annuler » n\'écrit rien', () => {
        const cases = [caseDe('F_sara', true), caseDe('F_camille', true), caseDe('F_lea', true)];
        const { win, journal, overlays, registre } = monterDOM({ cases, mesuresParId: MESURES });
        win.reassignerSelectionEval();
        expect(overlays).toHaveLength(1);
        expect(overlays[0].innerHTML).toContain('Réassigner 3 copies');
        // Le bouton naît désactivé (attribut du gabarit) : sans cible, rien à confirmer.
        expect(overlays[0].innerHTML).toContain('id="reassigner-selection-btn-confirmer" disabled');
        registre['reassigner-selection-cible'].value = A2R;
        registre['reassigner-selection-cible'].ecouteurs.change();
        const recap = registre['reassigner-selection-recap'].innerHTML;
        expect(recap).toContain('<strong>3 copies</strong>');
        expect(recap).toContain('Artefact 2 (rév)');
        expect(recap).toContain('Sara Allache : Allache_A2_rev.jpg → remplacé par Allache_A2.pdf');
        expect(registre['reassigner-selection-btn-confirmer'].disabled).toBe(false);
        expect(registre['reassigner-selection-btn-confirmer'].textContent).toBe('Réassigner 3 copies');
        // « Annuler » : la modale part, rien n'a été écrit.
        overlays[0].remove();
        expect(journal.ecrits).toEqual([]);
        expect(journal.notifs).toEqual([]);
    });

    it('D.d confirmer : chaque mesure à déplacer s\'écrit par ecrireReassignation (l\'ambiguë non), la modale se ferme, une notification compte', () => {
        const cases = [caseDe('F_sara', true), caseDe('F_camille', true), caseDe('F_lea', true), caseDe('F_lea_2', true)];
        const mesures = Object.assign({}, MESURES, { F_lea_2: mesure('F_lea_2', '2000003', 'Gagnon_A2_p2.jpg') });
        const { win, journal, overlays, registre } = monterDOM({ cases, mesuresParId: mesures });
        win.reassignerSelectionEval();
        registre['reassigner-selection-cible'].value = A2R;
        registre['reassigner-selection-cible'].ecouteurs.change();
        expect(registre['reassigner-selection-btn-confirmer'].textContent).toBe('Réassigner 2 copies');
        registre['reassigner-selection-btn-confirmer'].ecouteurs.click();
        expect(journal.ecrits).toEqual(['F_sara', 'F_camille']);
        expect(overlays[0].retire).toBe(true);
        expect(journal.notifs).toEqual([['succes', '2 copies réassignées vers « Artefact 2 (rév) »']]);
    });

    it('D.e sans cible, confirmer ne fait rien ; sans travauxUI, la modale ne s\'ouvre pas', () => {
        const cases = [caseDe('F_sara', true)];
        const { win, journal, registre } = monterDOM({ cases, mesuresParId: MESURES });
        win.reassignerSelectionEval();
        registre['reassigner-selection-btn-confirmer'].ecouteurs.click();
        expect(journal.ecrits).toEqual([]);
        const sans = chargerListe({ document: { addEventListener() {}, removeEventListener() {}, querySelector: () => null, querySelectorAll: (s) => (s.endsWith(':checked') ? [caseDe('F', true)] : [caseDe('F', true)]), getElementById: () => elementGenerique(), createElement: () => { throw new Error('la modale ne doit pas s\'ouvrir'); }, body: elementGenerique(), documentElement: elementGenerique() } });
        expect(() => sans.reassignerSelectionEval()).not.toThrow();
    });
});
