import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { pontsResolution } from './_helpers/ponts-resolution.js';   // lot N1a (21 sept. 2026)

// SENTINELLE #723 (21 sept. 2026, tranché par Grégoire) — le fichier d'export des résultats finaux
// sert à reporter les notes dans Léa : il GARDE la note arrondie à l'entier, et sa colonne le DIT
// (« Note finale (arrondie à l'entier) »), pour qu'un 88 à côté d'un 87,6 au profil ne passe plus
// pour une erreur. Aucune valeur ne change : seul le libellé de la colonne.
//
// Trois choses jugées : (1) le libellé ; (2) les lignes de données, identiques OCTET POUR OCTET à
// ce que le code d'avant produisait — les valeurs ci-dessous ont été CAPTURÉES sur HEAD (b87dfffc)
// avant l'édition, pas recopiées du code neuf ; (3) l'arrondi est au plus proche, sur le vrai
// `simulerIndices` (js/portfolio.js) : 75,7 → 76, et 74,5 → 75 comme au niveau imprimé (1.150.0).

const LIBELLE = 'Note finale (arrondie à l\'entier)';

// Capturé sur HEAD : trois élèves (virgule dans un nom, tentative de formule, note non constructible).
const LIGNES_DE_HEAD =
    '1,"Tremblay, fils",Zoé,01,601-101,A2026,STD,"PAN ""tous""",77,final,1\r\n' +
    '2,\'=Gagnon,Léo,01,601-101,A2026,STD,"PAN ""tous""",75,provisoire,\r\n' +
    '3,Roy,Max,01,601-101,A2026,STD,"PAN ""tous""",,non constructible,\r\n';
const ENTETE_DE_HEAD = '﻿DA,Nom,Prénom,Groupe,Cours,Trimestre,Pratique (code),Pratique (nom),Note finale,Statut,Non comptées\r\n';

function csvDuBanc() {
    const X = chargerScript('js/export-resultats-finaux.js')._exportResultats;
    const notes = {
        '1': { P: 77, noteConstructible: true, details: {}, ecartees: { total: 1 } },
        '2': { P: 75, noteConstructible: true, details: { estProvisoire: true } },
        '3': { P: 0, noteConstructible: false }
    };
    return X.genererCSVSynthese(
        [{ da: '1', nom: 'Tremblay, fils', prenom: 'Zoé' }, { da: '2', nom: '=Gagnon', prenom: 'Léo' }, { da: '3', nom: 'Roy', prenom: 'Max' }],
        // E7 (28 oct. 2026) : « Notes finalisées » cochée, sans quoi l'élève 1 sortirait « provisoire » — ce banc juge le libellé.
        { pratiqueId: 'p', pratiqueCode: 'STD', pratiqueNom: 'PAN "tous"', groupe: '01', cours: '601-101', trimestre: 'A2026', notesFinales: true },
        (da) => notes[da]);
}

describe('#723 · la colonne de la note dit qu\'elle est arrondie à l\'entier', () => {
    it('le libellé de la 9e colonne, dans ENTETES_SYNTHESE et dans le CSV produit', () => {
        const X = chargerScript('js/export-resultats-finaux.js')._exportResultats;
        expect(X.ENTETES_SYNTHESE[8]).toBe(LIBELLE);
        const entete = csvDuBanc().split('\r\n')[0];
        expect(entete.split(',')[8]).toBe(LIBELLE);
    });

    it('l\'en-tête ne diffère de celui de HEAD que par ce libellé ; les lignes de données sont identiques octet pour octet', () => {
        const csv = csvDuBanc();
        const finEntete = csv.indexOf('\r\n') + 2;
        expect(csv.slice(0, finEntete)).toBe(ENTETE_DE_HEAD.replace(',Note finale,', ',' + LIBELLE + ','));
        expect(csv.slice(finEntete)).toBe(LIGNES_DE_HEAD);
    });
});

/* L'arrondi, sur le vrai moteur : chaîne complète du banc #394 (registre → instance → portfolio → profil). */
const DA = '1234567';
function chaine(notesArtefacts, methodeSelection, nombreARetenir) {
    const productions = [
        { id: 'PF', type: 'portfolio', ponderation: 60, titre: 'Portfolio' },
        { id: 'TERM', type: 'terminale', ponderation: 40, numero: 9, titre: 'Analyse finale' }
    ];
    const evaluationsSauvegardees = [{ etudiantDA: DA, productionId: 'TERM', noteFinale: 82, ponderationCouverte: 100, verrouillee: true, remplaceeParId: null }];
    notesArtefacts.forEach((n, i) => {
        productions.push({ id: 'A' + (i + 1), type: 'artefact-portfolio', numero: i + 1, titre: 'Artefact ' + (i + 1) });
        evaluationsSauvegardees.push({ etudiantDA: DA, productionId: 'A' + (i + 1), noteFinale: n, ponderationCouverte: 100, verrouillee: true, remplaceeParId: null });
    });
    const store = {
        productions, evaluationsSauvegardees,
        groupeEtudiants: [{ da: DA, nom: 'Test', prenom: 'Étudiant' }],
        pratiquesConfigurables: [{ id: 'standards', nom: 'STD de test',
            configuration: { type: 'standards', portfolio: { nombreARetenir, minimumCompletion: 1, methodeSelection } } }]
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; }
    };
    const cle = (k) => k;
    const win = chargerScript('js/pratiques/pratique-registre.js', { db, cle });
    const ponts = {
        db, cle, obtenirDonneesSelonMode: (k) => (k in store ? store[k] : null),
        estEtudiantExclu: () => false,
        obtenirTypePratiqueActive: () => 'standards',
        obtenirPratiqueActiveGroupeCours: () => 'standards', ...pontsResolution(win, () => 'standards'),
        obtenirPratiqueParId: (...a) => win.obtenirPratiqueParId(...a),
        obtenirConfigPratiqueActive: (...a) => win.obtenirConfigPratiqueActive(...a),
        calculerDetailsNoteFinale: (...a) => win.calculerDetailsNoteFinale(...a)
    };
    chargerScript('js/pratiques/pratique-pan-standards.js', ponts, win);
    chargerScript('js/portfolio.js', ponts, win);
    chargerScript('js/profil-etudiant-actions.js', ponts, win);
    chargerScript('js/export-resultats-finaux.js', {}, win);
    return win;
}
function noteExportee(win) {
    return win._exportResultats.construireLignesSynthese([{ da: DA, nom: 'Test', prenom: 'Étudiant' }], { pratiqueId: 'standards' }, win.simulerIndices)[0][8];
}

describe('#723 · l\'entier écrit est l\'arrondi AU PLUS PROCHE de la note du profil', () => {
    it('75,7 au profil → 76 à l\'export (un plancher écrirait 75)', () => {
        // « récents », 4 sur 5 : (60+78+70+78)/4 = 71,5 → 71,5 × 0,6 + 82 × 0,4 = 75,7
        const win = chaine([85, 60, 78, 70, 78], 'recents', 4);
        expect(win.calculerDetailsNoteFinale(DA).noteFinale).toBeCloseTo(75.7, 6);
        expect(noteExportee(win)).toBe(76);
    });

    it('74,5 au profil → 75 à l\'export, comme au niveau imprimé (1.150.0)', () => {
        // « tous » : (69+70)/2 = 69,5 → (69,5 × 60 + 82 × 40) / 100 = 74,5
        const win = chaine([69, 70], 'tous', 2);
        expect(win.calculerDetailsNoteFinale(DA).noteFinale).toBe(74.5);
        expect(noteExportee(win)).toBe(75);
    });

    it('77,32 au profil (#715, « tous ») → 77 à l\'export', () => {
        const win = chaine([85, 60, 78, 70, 78], 'tous', 4);
        expect(win.calculerDetailsNoteFinale(DA).noteFinale).toBeCloseTo(77.32, 6);
        expect(noteExportee(win)).toBe(77);
    });
});
