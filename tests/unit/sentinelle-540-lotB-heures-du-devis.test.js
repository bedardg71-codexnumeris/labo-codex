import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #540 LOT B, RÉVISÉE LE 14 NOV. 2026 — LES HEURES D'UN COURS SONT CELLES DU DEVIS
// =======================================================================
//
// ▣ CE QUI EXISTAIT. #540 lot B (26 août 2026) avait remplacé `(théorie + labo) * 15` par
//   les semaines RÉELLES du calendrier, au motif qu'un quinze écrit dans le code était un
//   chiffre inventé (même famille que #366 et #538).
//
// ▣ CE QUE GRÉGOIRE A VÉCU (essai novice du 14 nov. 2026). Un trimestre de sept semaines
//   proposait 28 h pour un cours 2-2-3, au lieu de 60. Fait donné : un cours donné en
//   session intensive (l'été, tous les jours, peu de semaines) a le MÊME total d'heures
//   qu'en trimestre ordinaire. Le quinze est une convention du devis, pas un compte du
//   calendrier. Pour compter des semaines, `calculerStatistiquesCalendrier` reste seule juge.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. la proposition est (théorie + labo) × 15, quel que soit le calendrier (7, 11, 15
//      semaines, ou aucun) ;
//   B. elle ne remplit qu'un champ VIDE : le champ est modifiable et fait foi ;
//   C. la proposition et le repère ne lisent plus le calendrier ;
//   D. le repère dit la base du calcul : « (2 + 2) × 15 = 60 h » ;
//   E. l'aide contextuelle dit la même règle.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const HTML = lire('index.html');
const SRC_BRUT = lire('js', 'trimestre-v2-cours.js');

/** Voir la sentinelle #540 lot A : un verrou de source lit le CODE, pas les commentaires. */
function sansCommentaires(src) {
    let sortie = '', etat = 'code', delim = null;
    for (let i = 0; i < src.length; i++) {
        const c = src[i], suivant = src[i + 1];
        if (etat === 'code') {
            if (c === '/' && suivant === '/') { etat = 'ligne'; sortie += '  '; i++; continue; }
            if (c === '/' && suivant === '*') { etat = 'bloc'; sortie += '  '; i++; continue; }
            if (c === '"' || c === "'" || c === '`') { etat = 'chaine'; delim = c; }
            sortie += c;
        } else if (etat === 'ligne') {
            if (c === '\n') { etat = 'code'; sortie += c; } else { sortie += ' '; }
        } else if (etat === 'bloc') {
            if (c === '*' && suivant === '/') { etat = 'code'; sortie += '  '; i++; }
            else { sortie += (c === '\n' ? c : ' '); }
        } else {
            if (c === '\\') { sortie += c + (suivant || ''); i++; continue; }
            if (c === delim) { etat = 'code'; delim = null; }
            sortie += c;
        }
    }
    return sortie;
}
const SRC = sansCommentaires(SRC_BRUT);

/**
 * Charge le module avec un calendrier DONNÉ — banc vivant.
 * `calculerStatistiquesCalendrier` est la vraie, extraite de trimestre-v2.js.
 */
function chargerAvecCalendrier(calendrier, dom = null) {
    const vraiTrimestreV2 = chargerScript('js/trimestre-v2.js', {
        db: { getSync: () => null, setSync: () => {} },
        cle: (k) => k
    });
    const globaux = {
        db: { getSync: (k) => (k === 'calendrierComplet' ? calendrier : null), setSync: () => {} },
        cle: (k) => k,
        calculerStatistiquesCalendrier: vraiTrimestreV2.calculerStatistiquesCalendrier,
        notifications: { erreur: () => {}, succes: () => {} }
    };
    // ⚠ `document` doit être injecté AU CHARGEMENT. `chargerScript` le passe en
    // paramètre de la Function : le réassigner sur le window rendu après coup ne
    // touche pas la référence que l'IIFE a déjà capturée. (Quatre cas de ce banc
    // ont d'abord rougi pour cette raison — le test était faux, pas le code.)
    if (dom) globaux.document = { getElementById: (id) => dom[id] || null };
    return chargerScript('js/trimestre-v2-cours.js', globaux);
}

/** Fabrique un calendrier de N semaines de cours (5 jours chacune). */
function calendrierDe(nbSemaines) {
    const cal = {};
    let jour = 1;
    for (let s = 1; s <= nbSemaines; s++) {
        for (let j = 0; j < 5; j++) {
            cal['2026-01-' + String(jour++).padStart(2, '0')] =
                { statut: 'cours', numeroSemaine: s };
        }
    }
    return cal;
}

// ─────────────────────────────────────────────────────────────────────

const domCours = (ponderation, heures = '') => ({
    'v2-ponderation': { value: ponderation },
    'v2-heuresEnseignement': { value: heures },
    'v2-repereHeures': { textContent: '' },
    'v2-repereUnites': { textContent: '' }
});

describe('#540-B/A — la proposition est (théorie + labo) × 15, quel que soit le calendrier', () => {
    it('trimestre de SEPT semaines (session intensive) : 60 h proposées pour un 2-2-3, pas 28', () => {
        const dom = domCours('2-2-3');
        chargerAvecCalendrier(calendrierDe(7), dom).proposerHeuresEnseignementDepuisPonderation();
        expect(dom['v2-heuresEnseignement'].value).toBe(60);
        expect(dom['v2-repereHeures'].textContent).toBe('(2 + 2) × 15 = 60 h');
    });

    it.each([[11], [15]])('trimestre de %i semaines : 60 h aussi', (n) => {
        const dom = domCours('2-2-3');
        chargerAvecCalendrier(calendrierDe(n), dom).proposerHeuresEnseignementDepuisPonderation();
        expect(dom['v2-heuresEnseignement'].value).toBe(60);
    });

    it('sans calendrier : la proposition se fait quand même (le calendrier n\'y est pour rien)', () => {
        const dom = domCours('3-2-3');
        chargerAvecCalendrier(null, dom).proposerHeuresEnseignementDepuisPonderation();
        expect(dom['v2-heuresEnseignement'].value).toBe(75);
    });
});

describe('#540-B/B — le champ est modifiable et fait foi', () => {
    it('une valeur déjà saisie n\'est jamais écrasée', () => {
        const dom = domCours('2-2-3', '45');
        chargerAvecCalendrier(calendrierDe(7), dom).proposerHeuresEnseignementDepuisPonderation();
        expect(dom['v2-heuresEnseignement'].value).toBe('45');
    });

    it('sans pondération lisible : rien n\'est proposé', () => {
        const dom = domCours('2-2');
        chargerAvecCalendrier(calendrierDe(15), dom).proposerHeuresEnseignementDepuisPonderation();
        expect(dom['v2-heuresEnseignement'].value).toBe('');
    });
});

describe('#540-B/C — ni la proposition ni le repère ne lisent le calendrier', () => {
    /** Corps réel d'une fonction nommée, code seul. */
    const corpsDe = (nom) => {
        const i = SRC.indexOf(`function ${nom}(`);
        expect(i, `${nom} renommée ou retirée sans mettre à jour cette sentinelle`).toBeGreaterThan(-1);
        return SRC.slice(i, SRC.indexOf('\n}', i));
    };

    it.each([['proposerHeuresEnseignementDepuisPonderation'], ['majRepereHeuresCours']])('%s', (nom) => {
        const corps = corpsDe(nom);
        expect(corps).toContain('SEMAINES_DU_DEVIS');
        expect(corps).not.toMatch(/calendrier|calculerStatistiquesCalendrier/i);
    });

    it('le compteur de semaines qui les nourrissait est retiré, pas laissé dormant', () => {
        expect(SRC).not.toContain('_semainesDuTrimestreActif');
        expect(SRC).toMatch(/const SEMAINES_DU_DEVIS = 15;/);
    });
});

describe('#540-B/D — le repère dit la base du calcul', () => {
    it('le champ du repère existe dans le formulaire', () => {
        expect(HTML).toContain('id="v2-repereHeures"');
    });

    it('la formule est lisible, et la même sans calendrier', () => {
        for (const calendrier of [calendrierDe(15), calendrierDe(7), null]) {
            const dom = domCours('3-2-3');
            chargerAvecCalendrier(calendrier, dom).majRepereHeuresCours();
            expect(dom['v2-repereHeures'].textContent).toBe('(3 + 2) × 15 = 75 h');
        }
    });

    it('sans pondération lisible : le repère se tait', () => {
        const dom = domCours('n\'importe quoi');
        dom['v2-repereHeures'].textContent = 'reste d\'un affichage précédent';
        chargerAvecCalendrier(calendrierDe(15), dom).majRepereHeuresCours();
        expect(dom['v2-repereHeures'].textContent).toBe('');
    });
});

describe('#540-B/E — l\'aide contextuelle dit la même règle', () => {
    const AIDE = lire('js', 'accompagnement-contenu-popup.js');

    it('elle multiplie par 15 et dit que le calendrier n\'y change rien', () => {
        const i = AIDE.indexOf("Les heures d'enseignement sont le temps");
        expect(i).toBeGreaterThan(-1);
        const passage = AIDE.slice(i, i + 700);
        expect(passage).toContain('en multipliant par 15');
        expect(passage).toContain('ne dépend pas de ton calendrier');
        expect(passage).not.toContain('compte les semaines');
    });
});
