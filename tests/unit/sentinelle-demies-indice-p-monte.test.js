import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { pontsResolution } from './_helpers/ponts-resolution.js';   // lot N1a (21 sept. 2026)

// SENTINELLE (21 sept. 2026, décision de Grégoire) — UNE NOTE EXACTEMENT EN ,5 MONTE : 57,5 → 58.
//
// Trouvaille de 1.152.2 (#723) : l'indice P passait par `Math.round(noteFinale / 100 * 100)`, et
// l'aller-retour perd quatre demies à la virgule flottante — 57,5 / 100 * 100 rend 57,49999999999999.
// Mesuré sous node sur les 1 001 valeurs à une décimale de 0 à 100 : 14,5 → 14, 28,5 → 28, 56,5 → 56,
// 57,5 → 57, et rien d'autre. Le fichier d'export pour Léa, le profil et le Comparateur lisent cet entier
// (`simulerIndices`) ; l'indice P stocké du trimestre en cours vient du site jumeau
// (`calculerEtStockerIndicesCP`). Les DEUX passent désormais par `arrondirIndiceSurCent` (js/portfolio.js),
// la même expression que le niveau imprimé de 1.150.0 (`niveauDuPourcentage`, #701).
//
// BREAK-TESTS attendus, un à la fois, tous rouges : un seul des deux sites corrigé (l'un, puis l'autre) ;
// l'ancien aller-retour remis dans la fonction ; `Math.floor` ; demi vers le pair (14,5 → 14 le dénonce,
// 57,5 → 58 ne le verrait pas seul). ; nettoyage au millième au lieu du millionième (59,4996 → 59 le dénonce).

const DA = '1234567';

/* Chaîne complète du banc #394 / #723 : registre → instance STD → portfolio → profil → export.
   Sans terminale, le portfolio vaut 100 % : la note finale EST la moyenne des artefacts retenus. */
function chaine(notesArtefacts, terminale) {
    const productions = [{ id: 'PF', type: 'portfolio', ponderation: terminale === undefined ? 100 : 60, titre: 'Portfolio' }];
    const evaluationsSauvegardees = [];
    if (terminale !== undefined) {
        productions.push({ id: 'TERM', type: 'terminale', ponderation: 40, numero: 9, titre: 'Analyse finale' });
        evaluationsSauvegardees.push({ etudiantDA: DA, productionId: 'TERM', noteFinale: terminale, ponderationCouverte: 100, verrouillee: true, remplaceeParId: null });
    }
    for (let i = 0; i < notesArtefacts.length; i++) {
        productions.push({ id: 'A' + (i + 1), type: 'artefact-portfolio', numero: i + 1, titre: 'Artefact ' + (i + 1) });
    }
    notesArtefacts.forEach((n, i) => {
        evaluationsSauvegardees.push({ etudiantDA: DA, productionId: 'A' + (i + 1), noteFinale: n, ponderationCouverte: 100, verrouillee: true, remplaceeParId: null });
    });
    const store = {
        productions, evaluationsSauvegardees,
        groupeEtudiants: [{ da: DA, nom: 'Test', prenom: 'Étudiant' }],
        pratiquesConfigurables: [{ id: 'standards', nom: 'STD de test',
            configuration: { type: 'standards', portfolio: { nombreARetenir: notesArtefacts.length, minimumCompletion: 1, methodeSelection: 'tous' } } }]
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
    return { win, store };
}

/* Les trois lectures de l'entier : ce que lisent le profil et le Comparateur (`simulerIndices().P`),
   ce que l'export écrit dans sa 9e colonne, ce que l'écrivain stocke dans `indicesCP`. */
function lesTroisEntiers({ win, store }) {
    const simule = win.simulerIndices(DA, 'standards').P;
    const exporte = win._exportResultats.construireLignesSynthese(
        [{ da: DA, nom: 'Test', prenom: 'Étudiant' }], { pratiqueId: 'standards' }, win.simulerIndices)[0][8];
    win.calculerEtStockerIndicesCP();
    const stocke = store.indicesCP[DA].actuel.P;
    return { simule, exporte, stocke };
}

describe('demies · une note exactement en ,5 monte, aux trois lectures, sur le vrai moteur', () => {
    // La moyenne de deux entiers voisins vaut exactement la demie : (57 + 58) / 2 = 57,5.
    [[14, 15, 15], [28, 29, 29], [56, 57, 57], [57, 58, 58], [74, 75, 75], [59, 60, 60]].forEach(([a, b, attendu]) => {
        it(`${a},5 → ${attendu} au profil, à l'export et dans l'indice stocké`, () => {
            const banc = chaine([a, b]);
            expect(banc.win.calculerDetailsNoteFinale(DA).noteFinale).toBe(a + 0.5); // le montage donne bien la demie
            expect(lesTroisEntiers(banc)).toEqual({ simule: attendu, exporte: attendu, stocke: attendu });
        });
    });

    it('une note qui n\'est pas en ,5 ne bouge pas : 57,49 → 57 ; 57,51 → 58', () => {
        const dessous = chaine([57.49]);
        expect(dessous.win.calculerDetailsNoteFinale(DA).noteFinale).toBeCloseTo(57.49, 9);
        expect(lesTroisEntiers(dessous)).toEqual({ simule: 57, exporte: 57, stocke: 57 });
        const dessus = chaine([57.51]);
        expect(dessus.win.calculerDetailsNoteFinale(DA).noteFinale).toBeCloseTo(57.51, 9);
        expect(lesTroisEntiers(dessus)).toEqual({ simule: 58, exporte: 58, stocke: 58 });
    });
});

describe('demies · le nettoyage reste au MILLIONIÈME : une note à quatre décimales sous la demie ne monte pas', () => {
    // Trou de preuve trouvé par la relecture croisée de Cowork (21 sept. 2026) : un nettoyage au millième (1e3) au
    // lieu du millionième passait les dix essais — aucun ne posait une note juste SOUS une demie, à quatre décimales.
    // 59,4996 n'est pas 59,5 : c'est 59. Un nettoyage trop large ferait d'un échec une réussite.
    [[59.4996, 59], [57.4996, 57], [14.4996, 14], [59.5004, 60]].forEach(([note, attendu]) => {
        it(`${String(note).replace('.', ',')} → ${attendu} aux trois lectures`, () => {
            const banc = chaine([note]);
            expect(banc.win.calculerDetailsNoteFinale(DA).noteFinale).toBeCloseTo(note, 9);
            expect(lesTroisEntiers(banc)).toEqual({ simule: attendu, exporte: attendu, stocke: attendu });
        });
    });
});

describe('demies · le seuil de 60 : une note qui VAUT 59,5 donne 60, même abîmée par la virgule flottante', () => {
    // Tranché par Grégoire le 21 sept. 2026, chiffre en main. Mesuré sur le VRAI moteur (portfolio 60, terminale 40,
    // notes au dixième) : parmi les notes qui valent 59,5, celles que le calcul sort à 59,499999999999986 et que
    // l'ancien aller-retour rendait à 59 — 857 sur 61 424 à deux productions, 36 189 sur 1 081 186 à trois, 12 819 sur
    // 574 894 à quatre (1,4 à 3,3 %). Depuis ce lot : 60, comme le niveau imprimé de 1.150.0.
    // ⚠ C'est une réussite : ne pas défaire sans lui. (À un seul cran de bruit, 59,49999999999999, l'ancien code
    // retombait sur 60 par chance ; le montage ci-dessous est à deux crans, celui qui tombait.)
    it('32,3 et 99,1 au portfolio, 50,2 à la terminale : le moteur sort 59,4999…, les trois lectures disent 60', () => {
        const banc = chaine([32.3, 99.1], 50.2);
        const note = banc.win.calculerDetailsNoteFinale(DA).noteFinale;
        expect(note).toBeLessThan(59.5);          // le montage reproduit bien le bruit…
        expect(note).toBeGreaterThan(59.4999999);
        expect(Math.round(note / 100 * 100)).toBe(59); // … et c'est bien un cas que l'ancien arrondi faisait tomber
        expect(lesTroisEntiers(banc)).toEqual({ simule: 60, exporte: 60, stocke: 60 });
    });
});

describe('demies · contre-épreuve sur TOUTES les valeurs à une décimale, de 0 à 100', () => {
    it('l\'entier rendu par les deux sites = le demi vers le haut calculé EN ENTIERS (dixièmes), 1 001 valeurs', () => {
        const banc = chaine([0]);
        const ecarts = [];
        for (let dixiemes = 0; dixiemes <= 1000; dixiemes++) {
            banc.store.evaluationsSauvegardees[0].noteFinale = dixiemes / 10;
            const attendu = Math.floor((dixiemes + 5) / 10); // aucun flottant : 575 → 58, 574 → 57
            const note = banc.win.calculerDetailsNoteFinale(DA).noteFinale;
            if (Math.abs(note - dixiemes / 10) > 1e-9) ecarts.push(`montage : ${dixiemes / 10} lu ${note}`);
            const { simule, exporte, stocke } = lesTroisEntiers(banc);
            if (simule !== attendu || exporte !== attendu || stocke !== attendu) {
                ecarts.push(`${dixiemes / 10} → profil ${simule}, export ${exporte}, stocké ${stocke} (attendu ${attendu})`);
            }
        }
        expect(ecarts).toEqual([]);
    });

    it('la fonction seule, sur 0-1 : les 1 001 valeurs passées par l\'aller-retour ÷ 100, et C à 23 / 40', () => {
        const { win, store } = chaine([0]);
        // La fonction n'est pas exportée : on la juge par le repli `calculerPerformance` d'une pratique
        // factice, qui rend un indice sur 0-1 comme le font les familles SOM / SPE / DEN.
        let decimalP = 0, decimalC = 0;
        const factice = { obtenirCode: () => 'SOM', calculerCompletion: () => decimalC, calculerPerformance: () => decimalP };
        const vrai = win.obtenirPratiqueParId;
        const vraieResolution = win.resoudrePratiqueActive;
        const ecarts = [];
        try {
            win.obtenirPratiqueParId = (id) => (id === 'factice' ? factice : vrai(id));
            for (let dixiemes = 0; dixiemes <= 1000; dixiemes++) {
                decimalP = (dixiemes / 10) / 100;
                const P = win.simulerIndices(DA, 'factice').P;
                const attendu = Math.floor((dixiemes + 5) / 10);
                if (P !== attendu) ecarts.push(`${dixiemes / 10} → ${P} (attendu ${attendu})`);
            }
            decimalC = 23 / 40; // 57,5 % de remises : tombait à 57 par le même aller-retour
            expect(win.simulerIndices(DA, 'factice').C).toBe(58);
            // Le site jumeau : l'écrivain résout la pratique active par LA résolution du registre
            // (lot N1a, 21 sept. 2026) — la factice y répond aussi.
            win.resoudrePratiqueActive = () => ({ etat: 'ok', idBrut: 'factice', id: 'factice', donnees: null, configuration: null, pratique: factice });
            win.calculerEtStockerIndicesCP();
            expect(store.indicesCP[DA].actuel.C).toBe(58);
        } finally {
            win.obtenirPratiqueParId = vrai;
            win.resoudrePratiqueActive = vraieResolution;
        }
        expect(ecarts).toEqual([]);
    });
});
