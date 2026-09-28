import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { position, tranche } from './_helpers/tranche.js';

// =======================================================================
// SENTINELLE #540 LOT A — LA PONDÉRATION EST REQUISE, ET DITE COMME TELLE
// =======================================================================
//
// Demande de Grégoire, 26 août 2026, sur capture du formulaire Cours : « le nombre
// d'heures de cours par semaine n'est pas dans les formulaires ».
//
// ▣ L'AUDIT A MONTRÉ L'INVERSE — il y est, mais dérivé et jamais vérifié.
//   `_parserPonderation` découpe déjà « 2-2-3 », et `(théorie + labo)` EST la durée
//   hebdomadaire d'enseignement : 4 h en littérature (2-2-3), 4 h en philosophie
//   (3-1-3), 5 h en chimie (3-2-3). Elle ne servait qu'à PROPOSER les heures totales,
//   sans qu'aucune règle n'exige sa présence.
//
// ▣ CE QUE GRÉGOIRE A TRANCHÉ le même jour :
//   · pondération OBLIGATOIRE, astérisque rouge, RÈGLE UNIQUE (fiche ancienne comme
//     neuve — une fiche incomplète ne s'enregistre pas tant qu'on ne la complète pas) ;
//   · UN SEUL CHAMP, pas trois : `ponderation` est stockée en CHAÎNE sur l'entité
//     cours, et trois cases obligeraient soit à recomposer la chaîne (habillage), soit
//     à changer le modèle — ce qui casserait les fiches déjà saisies ;
//   · transformation automatique vers « 2-2-3 », la forme du devis ministériel.
//
// ▣ CE QUE LE LOT A A TROUVÉ EN CHEMIN — un export orphelin.
//   `index.html` câble `data-on-input="proposerHeuresEnseignementDepuisPonderation"`,
//   et le dispatcher de `main.js` résout ce nom SUR `window`. La fonction vivait dans
//   l'IIFE sans jamais avoir été exportée : le dispatcher `console.warn`-ait et rendait
//   la main. La proposition automatique des heures ne s'est jamais déclenchée, et le
//   repère « ≈ N unités » ne bougeait pas à la frappe.
//   Famille connue : `feedback-exports-orphelins-grep-window`.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. la NORMALISATION — banc vivant sur la vraie fonction, y compris les tirets
//      Unicode d'un copier-coller de devis PDF ;
//   B. ce qu'elle REFUSE — l'ambiguïté n'est jamais devinée ;
//   C. les EXPORTS réels sur `window` (pas la présence de l'appel — leçon du 10 août) ;
//   D. les trois champs requis PORTENT leur astérisque dans index.html, et la légende
//      qui l'explique est là ;
//   E. le refus passe par `notifications.erreur`, plus par `alert()` ;
//   F. le parseur reste le SEUL juge du format.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const HTML = lire('index.html');
const SRC_COURS_BRUT = lire('js', 'trimestre-v2-cours.js');

/**
 * Le source PRIVÉ DE SES COMMENTAIRES — même patron, et même leçon, que la
 * sentinelle #538 (qui le garde privé, d'où cette seconde copie).
 *
 * ⚠ TROUVÉ EN ÉCRIVANT CE FICHIER, exactement comme là-bas : le cas « plus aucun
 * alert() » a d'abord rougi sur le source brut — non parce qu'un `alert()` était
 * revenu, mais parce que le commentaire du correctif ÉCRIT « et non plus par
 * `alert()` ». Un verrou qui lit les commentaires interdit d'expliquer le correctif
 * dans le code : il pousse à effacer la mémoire du défaut pour faire passer le test.
 * Il porte donc sur le CODE, et sur lui seul.
 */
function sansCommentaires(src) {
    let sortie = '';
    let etat = 'code';
    let delim = null;
    for (let i = 0; i < src.length; i++) {
        const c = src[i];
        const suivant = src[i + 1];
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

const SRC_COURS = sansCommentaires(SRC_COURS_BRUT);

function chargerCours() {
    return chargerScript('js/trimestre-v2-cours.js', {
        db: { getSync: () => null, setSync: () => {} },
        notifications: { erreur: () => {}, succes: () => {} }
    });
}

// ─────────────────────────────────────────────────────────────────────
// A. LA NORMALISATION — banc VIVANT
// ─────────────────────────────────────────────────────────────────────
describe('#540-A — « 2-2-3 » quel que soit le chemin de saisie', () => {
    const win = chargerCours();
    const norm = (s) => win._normaliserPonderation(s);

    it('la forme du devis passe telle quelle', () => {
        expect(norm('2-2-3')).toBe('2-2-3');
    });

    it('les espaces sont un séparateur admis', () => {
        expect(norm('2 2 3')).toBe('2-2-3');
        expect(norm('  3   1   3  ')).toBe('3-1-3');
    });

    it('la forme compacte à TROIS chiffres est admise', () => {
        expect(norm('223')).toBe('2-2-3');
        expect(norm('323')).toBe('3-2-3');
    });

    it('les tirets Unicode d\'un copier-coller de devis PDF sont admis', () => {
        // U+2010 hyphen, U+2011 non-breaking, U+2013 en-dash, U+2014 em-dash, U+2212 minus
        expect(norm('2‐2‐3')).toBe('2-2-3');
        expect(norm('2‑2‑3')).toBe('2-2-3');
        expect(norm('2–2–3')).toBe('2-2-3');
        expect(norm('2—2—3')).toBe('2-2-3');
        expect(norm('2−2−3')).toBe('2-2-3');
    });

    it('la barre oblique est admise', () => {
        expect(norm('2/2/3')).toBe('2-2-3');
    });

    it('la virgule SÉPARE quand il n\'y a pas de tiret', () => {
        expect(norm('2,2,3')).toBe('2-2-3');
    });

    it('la virgule reste DÉCIMALE quand un tiret sépare déjà', () => {
        // Le cas qui se disloquerait en cinq morceaux si l'ordre était inversé
        expect(norm('1,5-1,5-3')).toBe('1.5-1.5-3');
    });

    it('le point décimal est rendu au point (ce que parseFloat lit)', () => {
        expect(norm('1.5-1.5-3')).toBe('1.5-1.5-3');
    });

    it('pas de zéro décoratif', () => {
        expect(norm('2.0-2.0-3.0')).toBe('2-2-3');
    });

    it('le zéro est une valeur légitime (cours sans laboratoire)', () => {
        expect(norm('3-0-3')).toBe('3-0-3');
    });

    it('les trois cas réels de Grégoire donnent la bonne durée hebdomadaire', () => {
        const p = win._parserPonderation;
        expect(p(norm('2-2-3')).theorie + p(norm('2-2-3')).labo).toBe(4);  // littérature
        expect(p(norm('3-1-3')).theorie + p(norm('3-1-3')).labo).toBe(4);  // philosophie
        expect(p(norm('3-2-3')).theorie + p(norm('3-2-3')).labo).toBe(5);  // chimie
    });
});

// ─────────────────────────────────────────────────────────────────────
// B. CE QU'ELLE REFUSE — on ne devine jamais
// ─────────────────────────────────────────────────────────────────────
describe('#540-B — l\'ambiguïté est refusée, pas devinée', () => {
    const win = chargerCours();
    const norm = (s) => win._normaliserPonderation(s);

    it('la forme compacte à QUATRE chiffres est ambiguë → refus', () => {
        // « 1023 » : 10-2-3 ? 1-0-23 ? On refuse plutôt que de choisir.
        expect(norm('1023')).toBeNull();
    });

    it('deux nombres ne font pas une pondération', () => {
        expect(norm('2-2')).toBeNull();
    });

    it('quatre nombres non plus', () => {
        expect(norm('2-2-3-1')).toBeNull();
    });

    it('du texte est refusé', () => {
        expect(norm('deux-deux-trois')).toBeNull();
        expect(norm('abc')).toBeNull();
    });

    it('le négatif est refusé', () => {
        expect(norm('-2-2-3')).toBeNull();
        expect(norm('2--2-3')).toBeNull();
    });

    it('le vide et le nul sont refusés sans lever', () => {
        expect(norm('')).toBeNull();
        expect(norm('   ')).toBeNull();
        expect(norm(null)).toBeNull();
        expect(norm(undefined)).toBeNull();
    });

    it('ce que la normalisation rend est TOUJOURS lisible par le parseur', () => {
        const entrees = ['2-2-3', '2 2 3', '223', '1,5-1,5-3', '3/0/3', '2–2–3'];
        for (const e of entrees) {
            const n = win._normaliserPonderation(e);
            expect(n, `« ${e} » doit se normaliser`).not.toBeNull();
            expect(win._parserPonderation(n), `« ${n} » doit être lisible`).not.toBeNull();
        }
    });
});

// ─────────────────────────────────────────────────────────────────────
// C. LES EXPORTS RÉELS (pas la présence de l'appel)
// ─────────────────────────────────────────────────────────────────────
describe('#540-C — les handlers sont joignables depuis window', () => {
    const win = chargerCours();

    it('le handler câblé en data-on-input EST exporté (bug trouvé au lot A)', () => {
        expect(typeof win.proposerHeuresEnseignementDepuisPonderation).toBe('function');
    });

    it('le handler câblé en data-on-change EST exporté', () => {
        expect(typeof win.normaliserPonderationCoursV2).toBe('function');
    });

    it('tout data-on-* du champ pondération pointe une fonction exportée', () => {
        // Le dispatcher de main.js résout le nom SUR window : un nom non exporté
        // est un handler mort et silencieux.
        const bloc = HTML.slice(HTML.indexOf('id="v2-ponderation"'));
        const champ = bloc.slice(0, bloc.indexOf('>') + 1);
        const noms = [...champ.matchAll(/data-on-[a-z]+="([^"]+)"/g)].map(m => m[1]);
        expect(noms.length).toBeGreaterThanOrEqual(2);
        for (const nom of noms) {
            expect(typeof win[nom], `${nom} doit être exporté sur window`).toBe('function');
        }
    });
});

// ─────────────────────────────────────────────────────────────────────
// D. L'OBLIGATION EST DITE À L'ÉCRAN
// ─────────────────────────────────────────────────────────────────────
describe('#540-D — les trois champs requis portent leur astérisque', () => {
    // Le formulaire Cours : du bandeau d'édition aux boutons d'action.
    const debut = HTML.indexOf('id="v2-bandeauModeEdition"');
    const fin = HTML.indexOf('data-action="sauvegarderCoursV2"');
    const formulaire = HTML.slice(debut, fin);

    const labelDe = (idChamp) => {
        const i = formulaire.indexOf('id="' + idChamp + '"');
        const avant = formulaire.slice(0, i);
        return avant.slice(avant.lastIndexOf('<label'));
    };

    it('le formulaire cours est bien délimité par le test', () => {
        expect(debut).toBeGreaterThan(-1);
        expect(fin).toBeGreaterThan(debut);
    });

    it('Pondération porte l\'astérisque', () => {
        expect(labelDe('v2-ponderation')).toContain('champ-requis');
    });

    it('Code du cours porte l\'astérisque (refusé depuis toujours, jamais dit)', () => {
        expect(labelDe('v2-codeCours')).toContain('champ-requis');
    });

    it('Discipline porte l\'astérisque (refusée depuis toujours, jamais dit)', () => {
        expect(labelDe('v2-disciplineCours')).toContain('champ-requis');
    });

    it('un champ NON requis n\'en porte pas — la marque garde son sens', () => {
        expect(labelDe('v2-nomCours')).not.toContain('champ-requis');
        expect(labelDe('v2-heuresEnseignement')).not.toContain('champ-requis');
    });

    it('la légende qui explique l\'astérisque est présente', () => {
        expect(formulaire).toContain('Champ obligatoire');
        expect(formulaire).toContain('legende-marques');
    });
});

// ─────────────────────────────────────────────────────────────────────
// E + F. LE REFUS, ET LE JUGE UNIQUE
// ─────────────────────────────────────────────────────────────────────
describe('#540-E — le refus est dit, sans dialogue natif', () => {
    // Corps RÉEL de sauvegarderCoursV2 — du `async function` au `\n}` qui la ferme.
    // Une fenêtre à taille fixe déborderait sur les fonctions suivantes et ferait
    // rougir ce banc pour du code qui ne le concerne pas.
    const i = SRC_COURS.indexOf('async function sauvegarderCoursV2');
    const corps = SRC_COURS.slice(i, SRC_COURS.indexOf('\n}', i));

    it('la sentinelle vise bien la fonction (et pas un fragment vide)', () => {
        expect(i).toBeGreaterThan(-1);
        expect(corps.length).toBeGreaterThan(500);
    });

    it('les trois champs sont refusés à l\'enregistrement', () => {
        expect(corps).toContain('!d.codeCours');
        expect(corps).toContain('!d.discipline');
        expect(corps).toContain('!d.ponderation');
    });

    it('une pondération illisible est refusée séparément du vide', () => {
        expect(corps).toContain('_parserPonderation(d.ponderation)');
    });

    // ↻ Lot E2 (28 sept. 2026, D3) : le refus passe par le témoin commun (« Non enregistré –
    // ‹geste› : ‹raison› »), par `_refuserCoursV2`, et plus par notifications.erreur.
    it('le refus passe par le témoin commun (_refuserCoursV2), pas par un toast', () => {
        expect(corps).toContain('_refuserCoursV2(');
        expect(corps).not.toContain('notifications.erreur');
        const refus = tranche(SRC_COURS, 'function _refuserCoursV2', '\n}');
        expect(refus).toContain('temoinEnregistrement.nonEnregistre');
    });

    it('plus aucun alert() dans la validation', () => {
        expect(corps).not.toMatch(/\balert\s*\(/);
    });

    it('la règle est UNIQUE : aucun contournement pour les fiches existantes', () => {
        // Une exemption s'écrirait forcément en regardant si on est en édition.
        const i = position(corps, '!d.ponderation');
        const zoneRefus = corps.slice(Math.max(0, i - 800), i + 600);
        expect(zoneRefus.length, 'la zone autour du refus').toBeGreaterThan(1000);
        expect(zoneRefus).not.toContain('coursEnEditionV2');
    });
});

describe('#540-F — le parseur reste le seul juge du format', () => {
    const win = chargerCours();

    it('la normalisation ne valide jamais ce que le parseur refuserait', () => {
        // Banc vivant : on éprouve un large échantillon, jamais de divergence.
        const echantillon = ['2-2-3', '2 2 3', '223', '1023', 'abc', '', '2-2',
                             '1,5-1,5-3', '-1-2-3', '3-0-3', '2/2/3', '2.0-2.0-3.0'];
        for (const e of echantillon) {
            const n = win._normaliserPonderation(e);
            if (n !== null) {
                expect(win._parserPonderation(n), `« ${e} » → « ${n} »`).not.toBeNull();
            }
        }
    });
});
