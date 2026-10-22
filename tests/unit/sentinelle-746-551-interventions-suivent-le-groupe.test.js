import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

// SENTINELLE #746 (moitié restante) ET #551 (garde seule) — consigne du 13 septembre 2026.
//
// #746 : `obtenirInterventionsEtudiant` filtrait par DA et rien d'autre. La liste des interventions suit le
// groupe-cours depuis le 12 sept. (`interventionsDuContexteActif`) ; ses huit lecteurs (profil, historique,
// graphiques, compteur de la Liste) mêlaient encore les groupes. Ils suivent désormais sans une ligne à eux.
// Avant ce lot, AUCUN banc n'éprouvait la vraie fonction dans un contexte (les autres la remplacent par
// `() => []`) : d'où ce banc, et sa contre-épreuve sur un écran réel (le compteur de la Liste, etudiants.js).
//
// #551 : `suggererObjectifIntervention` enveloppait le ternaire de garde dans un `|| 0.75` / `|| 0.64` — la
// forme que #555 lot 2 a démontée pour `defiSpecifique`. Un seuil délibérément réglé à 0 était remplacé par
// la valeur du projet. Deux montages : fonction ABSENTE (la garde tient) et fonction qui rend 0 (le 0 passe).
// Seul le second distingue le correctif de l'ancien code. Le cliquet de FORME vit dans la sentinelle #555.
//
// MONTAGE ISOLANT (§4 de la consigne) : aucune intervention `jamaisSauvegardee: true` (sinon elle disparaît
// par `_interventionsLisibles`) ; le témoin de l'autre groupe porte `groupeCoursId: 'GC2'` ET une intervention
// SANS le champ doit rester visible dans le même essai ; mode groupe-cours STRICT, coursId distincts (sinon
// `_estampillesAcceptees` accepte les deux groupes et le filtre ne cache rien).
//
// BREAK-TESTS VÉRIFIÉS le 13 septembre 2026 — journal en fin de fichier.

const GLOBAUX_INTERVENTIONS = {
    determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
    calculerMoyennesCriteres: () => ({ structure: 0.7 }), obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '',
    calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
};
const intervention = (extra) => Object.assign({ id: 'I', titre: 'T', date: '2026-09-01', heure: '', duree: 2, type: 'individuel', niveauRai: 3, contexte: 'hors-classe', description: '', etudiants: ['2000001'], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours', jamaisSauvegardee: false }, extra);
// Alice (2000001) est inscrite dans deux groupes-cours de l'enseignant : une intervention dans chacun, et une d'avant le 12 sept.
const troisInterventions = () => [
    intervention({ id: 'I_GC1', titre: 'Née sous GC1', groupeCoursId: 'GC1' }),
    intervention({ id: 'I_GC2', titre: 'Née sous GC2', groupeCoursId: 'GC2' }),
    intervention({ id: 'I_OLD', titre: 'D\'avant le lot' }),
];
/** Mode groupe-cours STRICT : aucun des deux drapeaux de mode cours, et chaque groupe dans son propre cours. */
const enGroupeCoursStrict = (store, gcId) => {
    store.test_groupesCours = [{ id: 'GC1', coursId: 'C1', trimestreId: 'test', actif: true, groupeNum: '01' }, { id: 'GC2', coursId: 'C2', trimestreId: 'test', actif: true, groupeNum: '02' }];
    const coursId = gcId === 'GC1' ? 'C1' : 'C2';
    store.infoCours = { id: coursId, nom: 'Cours banc', groupe: '01', _modeCours: false, _groupeCoursId: gcId };
    store.groupeCoursActif = { modeCours: false, id: gcId, trimestreId: 'test', coursId, groupeNum: '01' };
};
const storeAvec = (gcId) => { const s = storeBase(); s.test_interventions = troisInterventions(); enGroupeCoursStrict(s, gcId); return s; };
const idsDe = (liste) => liste.map(i => i.id).sort();

describe('#746 · obtenirInterventionsEtudiant suit le groupe-cours', () => {
    it('sous GC1 : celle de GC1 et celle d\'avant le lot ; sous GC2 : celle de GC2 et celle d\'avant — jamais celle de l\'autre', () => {
        const store = storeAvec('GC1');
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX_INTERVENTIONS });
        expect(idsDe(b.win.obtenirInterventionsEtudiant('2000001'))).toEqual(['I_GC1', 'I_OLD']);
        enGroupeCoursStrict(store, 'GC2');
        expect(idsDe(b.win.obtenirInterventionsEtudiant('2000001'))).toEqual(['I_GC2', 'I_OLD']);
        // Le magasin n'a pas bougé : aucune purge, aucun semis.
        expect(idsDe(store.test_interventions)).toEqual(['I_GC1', 'I_GC2', 'I_OLD']);
        expect(store.test_interventions.find(i => i.id === 'I_OLD').groupeCoursId).toBeUndefined();
    });
    it('sans contexte actif : tout ce qui concerne l\'élève reste visible', () => {
        const store = storeAvec('GC1'); store.infoCours = null; store.groupeCoursActif = null;
        const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX_INTERVENTIONS });
        expect(idsDe(b.win.obtenirInterventionsEtudiant('2000001'))).toEqual(['I_GC1', 'I_GC2', 'I_OLD']);
    });
    it('le filtre par DA tient toujours : un élève absent des trois n\'en voit aucune', () => {
        const b = monter(storeAvec('GC1'), { modules: ['js/interventions.js'], globaux: GLOBAUX_INTERVENTIONS });
        expect(b.win.obtenirInterventionsEtudiant('2000002')).toEqual([]);
    });
});

describe('#746 · contre-épreuve sur un écran réel : le compteur de la Liste (etudiants.js)', () => {
    // Montage du banc d'audit du 6 sept. (section 2), SANS le `obtenirInterventionsEtudiant: () => []` : c'est
    // la vraie fonction d'interventions.js que la Liste appelle.
    const monterListe = (store) => monter(store, {
        modules: ['js/interpretation-config.js', 'js/contexte-qualification.js', 'js/interventions.js', 'js/etudiants.js', 'js/trimestre-v2-etudiants.js'],
        globaux: Object.assign({}, GLOBAUX_INTERVENTIONS, {
            determinerNiveauRaiPedagogique: () => ({ niveau: 1, pattern: 'Stable', label: 'Universel' }), calculerCorrelationPearson: () => 0,
            calculerTousLesIndices: () => ({ A: 90, C: 100, P: 80, noteConstructible: true }),
            calculerEtSauvegarderIndicesAssiduite() {}, calculerEtStockerIndicesCP() {},
            obtenirConfigPratiqueActive: () => ({ portfolio: { minimumCompletion: 3 } }), obtenirTypePratiqueActive: () => 'standards',
            obtenirTermeProduction: () => 'artefact', obtenirCodePratique: () => 'STD'
        })
    });
    // Les lignes naissent par createElement('tr') + appendChild : on lit les enfants du tbody.
    const compteurDe = (b, da) => {
        const ligne = b.document.getElementById('tbody-suivi-liste').children.find(tr => tr.innerHTML.includes('>' + da + '<'));
        expect(ligne, 'la ligne de ' + da + ' est rendue').toBeTruthy();
        const m = ligne.innerHTML.match(/📋 (\d+)/);
        return m ? Number(m[1]) : 0;
    };

    it('Alice, sous GC1 : 2 interventions (GC1 + celle d\'avant le lot), pas 3', () => {
        const store = storeAvec('GC1');
        store.test_groupeEtudiants.forEach(e => { if (e.coursId === 'GC1') e.coursId = 'C1'; });
        const b = monterListe(store);
        b.win.afficherListeEtudiantsConsultation();
        expect(compteurDe(b, '2000001')).toBe(2);
        expect(compteurDe(b, '2000002')).toBe(0);
    });
});

describe('#551 · un seuil IDME réglé à zéro reste à zéro dans la suggestion d\'objectif', () => {
    const DEFAUTS = { 'idme.insuffisant': 0.64, 'idme.developpement': 0.75, 'idme.maitrise': 0.85, defiSpecifique: 0.70 };
    const suggestion = ({ seuils, moyenne }) => {
        const globaux = Object.assign({}, GLOBAUX_INTERVENTIONS, { calculerMoyennesCriteres: () => ({ structure: moyenne }), obtenirSeuil: seuils ? (n) => seuils[n] : undefined });
        const b = monter(storeBase(), { modules: ['js/interventions.js'], globaux,
            elements: { objectifVise: elementDom({ value: '' }) },
            selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]:checked': [elementDom({ value: '2000001', checked: true })], '.critere-cible-cb:checked': [elementDom({ value: 'Structure', checked: true })] } });
        b.win.suggererObjectifIntervention('I');
        return b.document.getElementById('objectifVise').value;
    };

    it('(a) obtenirSeuil ABSENTE : la garde tient, et les valeurs de dernier recours sont celles de SEUILS_PAR_DEFAUT', () => {
        expect(suggestion({ seuils: null, moyenne: 0.5 })).toBe('Amener Structure à 64\u00A0%');
        expect(suggestion({ seuils: null, moyenne: 0.7 })).toBe('Amener Structure à 75\u00A0%');
    });
    it('(b) idme.insuffisant réglé à 0 : aucun élève n\'est sous ce seuil — la suggestion vise 75 %, pas 64 %', () => {
        expect(suggestion({ seuils: Object.assign({}, DEFAUTS, { 'idme.insuffisant': 0 }), moyenne: 0.5 })).toBe('Amener Structure à 75\u00A0%');
    });
    it('(b) idme.developpement réglé à 0 : le seuil est à 0 % — la suggestion le dit, sans le remplacer par 75 %', () => {
        // Sous l'ancienne forme `|| 0.75`, la moyenne 0,7 retomberait sous 75 % : « Amener Structure à 75 % ». Ce cas
        // distingue donc toujours le correctif #551 de l'ancien code, lettres retirées ou non.
        expect(suggestion({ seuils: Object.assign({}, DEFAUTS, { 'idme.developpement': 0 }), moyenne: 0.7 })).toBe('Stabiliser Structure au-dessus de 0\u00A0%');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS — 13 septembre 2026. Mutations une à une sur js/interventions.js (chaque mutation
// comptée « posée » avant lecture), ce banc + sentinelle-555 relancés, fichier restauré à empreinte SHA-256 identique.
//   M1 #746 : retour au filtre par DA seul                               → 2 rouges (la fonction, le compteur de la Liste)
//   M2 #746 : « tout filtré » (les interventions sans groupeCoursId aussi) → 3 rouges
//   M7 #746 : filtre par DA retiré                                        → 2 rouges (« un élève absent… », le compteur)
//   M3 #551 : ancienne forme `: null) || 0.75` sur idme.developpement     → 2 rouges ((b) developpement, 555 cas 5 bis)
//   M4 #551 : ancienne forme `: null) || 0.64` sur idme.insuffisant       → 2 rouges ((b) insuffisant, 555 cas 5 bis)
//   M5 #551 : garde de chargement retirée                                 → 2 rouges ((a), 555 cas 5 bis)
//   M6 #551 : miroir de dernier recours divergent (0.64 → 0.65)            → 2 rouges ((a), 555 cas 5 bis)
// 14/14 verts une fois restauré. Chaque essai neuf a rougi au moins une fois.
//
// 13 sept. 2026, 14 h 30 — #551 MOITIÉ AFFICHÉE (la suggestion ne nomme plus de lettre). Banc jetable $HOME/banc-551 :
// js/ + ce fichier + sentinelle-lot-5-interventions-cadrage-11 + sentinelle-audit-aide-lot-E + les huit sentinelle-555-*
// (98 essais). Mutations sur js/interventions.js, une à une, motif trouvé exactement une fois avant écriture.
//   Ma : 1re phrase → 'Amener ' + … + ' au seuil D (' + … + '%)'  → 2 rouges ((a), lot-5 B « déplacé à 0,66 »)
//   Mb : 2e phrase  → 'Amener ' + … + ' au seuil M (' + … + '%)'  → 3 rouges ((a), (b) insuffisant, lot-5 B « par défaut »)
//   Mc : 3e phrase  → 'Stabiliser ' + … + ' au-dessus du seuil M (' + … + '%)' → 1 rouge ((b) developpement)
//   Md : `(… : null) || 0.75` sur idme.developpement           → 2 rouges ((b) developpement, 555 cas 5 bis) — #551 tient
//   Me : `(… : null) || 0.64` sur idme.insuffisant             → 2 rouges ((b) insuffisant, 555 cas 5 bis)
//   Mf : 1re phrase lit `Math.round(0.64 * 100)` en dur         → 1 rouge (lot-5 B « déplacé à 0,66 ») — le couplage par le nombre
// 98/98 verts une fois restauré (cmp identique).
