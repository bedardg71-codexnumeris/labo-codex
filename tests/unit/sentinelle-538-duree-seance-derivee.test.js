import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #538 — LA DURÉE D'UNE SÉANCE SE DÉRIVE, ELLE NE S'INVENTE PAS
// =======================================================================
//
// Constat du 26 août 2026, tranché par Grégoire le même jour.
//
// ▣ CE QUI EXISTAIT. `obtenirHeuresSeance` (saisie-presences.js) choisissait
//   entre 4 h et 2 h selon `db.getSync('formatHoraire')`. Cette clé n'est PLUS
//   ÉCRITE PAR PERSONNE depuis que le format vit dans l'entité Horaire — même
//   prémisse que #532, déjà verrouillée par sa sentinelle (cas B.b). La
//   comparaison `=== '1x4'` était donc TOUJOURS fausse : la branche « 4 heures »
//   n'a jamais été atteinte de la vie de l'application, et le repli valait
//   TOUJOURS 2 heures.
//
// ▣ CINQ VALEURS MÉTIER EN DUR, dont trois dans la même fonction :
//     · `:307` jour de cours sans séance datée            → 2
//     · `:344` format de séance non reconnu               → += 2
//     · `:348` `return totalHeures || 2`                  → 2
//     · `obtenirNombrePeriodesSeance`  → `return 2`       (en PÉRIODES)
//     · `obtenirDureeMaxSeance()`      → `return 2`       (morte, jamais appelée)
//
// ▣ CE N'ÉTAIT PAS DE L'AFFICHAGE. Ces heures alimentent le pré-remplissage du
//   tableau, le plafond du code couleur et `calculerAssiduitePourAffichage` —
//   donc l'indice d'assiduité lui-même. `genererSeancesCompletes` (horaire.js)
//   nommait déjà le repli à 2 périodes comme polluant le dénominateur
//   (commentaire « ÉTAPE 3 supprimée », FIX #220) sans que la source soit tarie.
//
// ▣ LA DÉCISION DE GRÉGOIRE : dériver de l'horaire du groupe-cours, et 0 quand
//   l'horaire ne dit rien — jamais un nombre inventé. Une dérivation est une
//   conséquence logique ; un `2` écrit dans le code est un arbitraire, et le
//   projet n'en veut aucun (cf. `feedback-zero-fallback-arbitraire`).
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. banc VIVANT — la durée vient réellement de l'horaire, et vaut 0 s'il
//      est muet (le seul cas où l'ancien code inventait) ;
//   B. la règle de la REPRISE : c'est le jour REMPLACÉ qui porte l'horaire,
//      comme dans `genererSeancesCompletes`. Diverger ici ne casserait QUE les
//      dates de reprise — là où personne ne regarde ;
//   C. aucune des cinq valeurs en dur ne revient dans la source ;
//   D. la clé morte `formatHoraire` n'est plus lue nulle part dans le module ;
//   E. une durée inconnue est DITE à l'écran, pas tue.
//
// ⚠ CE QUE CETTE SENTINELLE NE COUVRE PAS : que l'horaire de l'utilisateur soit
// correctement RATTACHÉ à son groupe-cours (`groupesCours[].horaireId`, #332).
// Si la durée sort à 0 alors qu'un horaire existe, le défaut est là, pas ici.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

const SRC_PRESENCES_BRUT = lire('js', 'saisie-presences.js');

/**
 * Le source PRIVÉ DE SES COMMENTAIRES.
 *
 * ⚠ POURQUOI CE DÉPOUILLAGE EXISTE, ET IL A ÉTÉ TROUVÉ EN ÉCRIVANT CE FICHIER.
 * Deux cas ci-dessous ont d'abord rougi sur le source brut — non pas parce que
 * les valeurs en dur étaient revenues, mais parce que les commentaires du
 * correctif CITENT ce qu'ils ont retiré (« la clé morte `formatHoraire` », « ce
 * `|| 2` était la plus discrète des trois »). Un verrou de source qui lit les
 * commentaires interdit d'EXPLIQUER le correctif dans le code — c'est-à-dire
 * qu'il pousse à effacer la mémoire du défaut pour faire passer le test. Il
 * doit donc porter sur le CODE, et sur lui seul.
 *
 * @param {string} src
 * @returns {string} le même source, commentaires remplacés par des espaces
 */
function sansCommentaires(src) {
    let sortie = '';
    let etat = 'code';       // code | ligne | bloc | chaine
    let delim = null;        // guillemet ouvrant quand etat === 'chaine'
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
        } else { // chaine
            if (c === '\\') { sortie += c + (suivant || ''); i++; continue; }
            if (c === delim) { etat = 'code'; delim = null; }
            sortie += c;
        }
    }
    return sortie;
}

const SRC_PRESENCES = sansCommentaires(SRC_PRESENCES_BRUT);

/** Corps d'une fonction nommée, du `function X(` jusqu'au `\n}` qui la ferme. */
function corpsDe(nom) {
    const debut = SRC_PRESENCES.indexOf(`function ${nom}(`);
    expect(debut, `${nom} a été renommée ou retirée sans mettre à jour cette sentinelle`).toBeGreaterThan(-1);
    return SRC_PRESENCES.slice(debut, SRC_PRESENCES.indexOf('\n}', debut));
}

/* ------------------------------------------------------------------ banc A */

/**
 * Monte le module et rend `obtenirNombrePeriodesSeance` — le SEUL des quatre
 * points d'entrée de la famille qui soit exporté sur `window`, et qui traverse
 * `obtenirHeuresPrevuesParHoraire` de bout en bout : lecture de l'horaire,
 * choix du jour visé, mesure de la séance, conversion en périodes.
 *
 * `obtenirSeancesCompletes` rend `{}` : aucune séance DATÉE pour cette date,
 * c'est-à-dire exactement le cas où l'ancien code répondait « 2 ».
 */
function monter({ horaire = [], jour = null, statut = 'cours', jourRemplace = null, dureePeriode = 50 } = {}) {
    return chargerScript('js/saisie-presences.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null), setSync: () => {} },
        cle: (k) => `a2026_${k}`,
        obtenirSeancesHoraire: () => horaire,
        obtenirSeancesCompletes: () => ({}),
        obtenirDureePeriode: () => dureePeriode,
        // Ce que le CALENDRIER dit de la date. `null` = date inconnue du
        // calendrier : le helper doit alors retomber sur le jour réel de la date.
        obtenirInfosJour: () => (jour === null ? null : { statut, jourSemaine: jour, jourRemplace, numeroSemaine: 3 }),
        dateLocaleYMD: () => '2026-08-26',
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    });
}

// ⚠ CE BANC A ÉTÉ RÉVISÉ PAR #540 LOT E2, LE MÊME JOUR (26 août 2026).
//
// #538 avait remplacé un `2` en dur par une DÉRIVATION : la durée d'une séance se lisait
// dans l'horaire, en heures, puis se convertissait en périodes par la durée de période.
// C'était un progrès — on ne fabriquait plus de dénominateur — mais la conversion
// elle-même était fausse : Grégoire a montré le soir même qu'une période comprend sa
// PAUSE (50 + 10 ici, 55 + 5 ailleurs). Diviser une durée d'horloge par la seule durée
// d'enseignement rendait 4 périodes pour un bloc de 08:00 à 11:00, qui en fait trois.
//
// E2 supprime la conversion : `nombrePeriodes` est SAISI sur chaque séance (lot E1) et
// se lit. Les cas ci-dessous qui éprouvaient la DÉRIVATION sont donc réécrits sur la
// LECTURE ; ceux qui éprouvaient le choix du jour, l'agrégation ou le refus d'inventer
// sont conservés tels quels — c'est ce que #538 protégeait vraiment, et ça n'a pas bougé.
const LUNDI_2P = [{ id: 1, jour: 'Lundi', debut: '08:00', nombrePeriodes: 2 }];

describe('#538 · A — la durée vient de l\'horaire, ou elle n\'existe pas', () => {

    it('A.a horaire muet → 0 période, PAS 2 (c\'est le cas que l\'ancien code inventait)', () => {
        const win = monter({ horaire: [], jour: 'Lundi' });
        expect(
            win.obtenirNombrePeriodesSeance('2026-08-24'),
            'avant #538 : `return 2` en dur — un dénominateur d\'assiduité fabriqué de toutes pièces'
        ).toBe(0);
    });

    it('A.b l\'horaire dit 2 périodes ce lundi → 2', () => {
        const win = monter({ horaire: LUNDI_2P, jour: 'Lundi' });
        expect(win.obtenirNombrePeriodesSeance('2026-08-24')).toBe(2);
    });

    it('A.c un jour que l\'horaire ne couvre pas → 0, jamais un repli', () => {
        const win = monter({ horaire: LUNDI_2P, jour: 'Jeudi' });
        expect(win.obtenirNombrePeriodesSeance('2026-08-27')).toBe(0);
    });

    it('A.d la casse du nom de jour ne décide de rien', () => {
        const win = monter({ horaire: [{ id: 1, jour: 'LUNDI', debut: '08:00', nombrePeriodes: 2 }], jour: 'lundi' });
        expect(win.obtenirNombrePeriodesSeance('2026-08-24')).toBe(2);
    });

    it('A.e deux séances le même jour s\'ADDITIONNENT (une seule serait un sous-compte)', () => {
        const win = monter({
            horaire: [
                { id: 1, jour: 'Lundi', debut: '08:00', nombrePeriodes: 2 },
                { id: 2, jour: 'Lundi', debut: '13:00', nombrePeriodes: 1 }
            ],
            jour: 'Lundi'
        });
        // #540 lot E2 : 3, et non 4. L'ancienne chaîne divisait 3 h par 50 min et
        // arrondissait à 4 — une période de plus au dénominateur, tous les lundis.
        expect(win.obtenirNombrePeriodesSeance('2026-08-24')).toBe(3);
    });

    it('A.f une séance qui ne dit PAS ses périodes ne vaut rien, même avec des heures', () => {
        // ⚠ CAS RETOURNÉ PAR E2, et c'est le cœur du lot. Il vérifiait qu'une séance
        // écrite en `debut`/`fin` « se mesure quand même » — précisément la mesure qu'on
        // retire. Les heures ne disent pas les périodes : entre 08:00 et 10:00 il peut y
        // avoir deux périodes de 50 min et deux pauses, ou autre chose selon le collège.
        // On ne devine plus ; l'écran Horaire signale la séance à compléter (lot E1).
        const win = monter({ horaire: [{ id: 1, jour: 'Lundi', debut: '08:00', fin: '10:00' }], jour: 'Lundi' });
        expect(win.obtenirNombrePeriodesSeance('2026-08-24')).toBe(0);
    });

    it('A.g les HEURES, elles, restent lisibles — pour l\'affichage, pas pour compter', () => {
        // La mesure du temps d'horloge n'a pas disparu : `obtenirHeuresPrevuesParHoraire`
        // la fait toujours, et c'est légitime — c'est une durée, pas un décompte de
        // périodes. E2 sépare les deux grandeurs au lieu de passer de l'une à l'autre.
        const win = monter({ horaire: [{ id: 1, jour: 'Lundi', heureDebut: '08:00', heureFin: '10:00' }], jour: 'Lundi' });
        expect(win.obtenirHeuresPrevuesParHoraire('2026-08-24')).toBe(2);
        // Mais elle ne fabrique aucune période pour autant.
        expect(win.obtenirNombrePeriodesSeance('2026-08-24')).toBe(0);
    });

    it('A.h une séance illisible ne vaut pas 2 h : elle ne vaut rien', () => {
        const win = monter({ horaire: [{ id: 1, jour: 'Lundi', local: 'B-241' }], jour: 'Lundi' });
        expect(win.obtenirNombrePeriodesSeance('2026-08-24')).toBe(0);
    });

    it('A.i la durée de période N\'INFLUE PLUS sur le compte des périodes', () => {
        // ⚠ CAS RETOURNÉ PAR E2. Il vérifiait que le réglage était respecté par la
        // conversion ; il vérifie maintenant qu'aucune conversion n'a lieu. Le même
        // horaire rend le même nombre, quel que soit le réglage — c'est la preuve que la
        // division a bien disparu de cette chaîne.
        for (const dureePeriode of [50, 55, 60, 75, 90]) {
            const win = monter({ horaire: LUNDI_2P, jour: 'Lundi', dureePeriode });
            expect(
                win.obtenirNombrePeriodesSeance('2026-08-24'),
                `le réglage ${dureePeriode} min ne doit plus rien changer`
            ).toBe(2);
        }
    });

    it('A.j date inconnue du calendrier → le jour RÉEL de la date fait foi', () => {
        const win = monter({ horaire: LUNDI_2P, jour: null });
        expect(win.obtenirNombrePeriodesSeance('2026-08-24'), '2026-08-24 est un lundi').toBe(2);
        expect(win.obtenirNombrePeriodesSeance('2026-08-27'), '2026-08-27 est un jeudi').toBe(0);
    });
});

/* --------------------------------------------------- B — la règle de la reprise */

describe('#538 · B — une reprise porte l\'horaire du jour REMPLACÉ', () => {

    it('B.a vendredi qui reprend un lundi → l\'horaire du lundi s\'applique', () => {
        const win = monter({ horaire: LUNDI_2P, jour: 'Vendredi', statut: 'reprise', jourRemplace: 'Lundi' });
        expect(
            win.obtenirNombrePeriodesSeance('2026-08-28'),
            'sans la règle du jour remplacé, seules les dates de REPRISE sortiraient à 0 — ' +
            'un trou invisible partout ailleurs. Même règle que genererSeancesCompletes (horaire.js).'
        ).toBe(2);
    });

    it('B.b une reprise SANS jour remplacé retombe sur son jour réel', () => {
        const win = monter({ horaire: LUNDI_2P, jour: 'Vendredi', statut: 'reprise', jourRemplace: null });
        expect(win.obtenirNombrePeriodesSeance('2026-08-28')).toBe(0);
    });
});

/* ------------------------------------------- C — aucune valeur en dur ne revient */

describe('#538 · C — les cinq valeurs métier en dur ne reviennent pas', () => {

    it('C.a obtenirHeuresSeance ne lit plus la clé morte `formatHoraire`', () => {
        expect(/getSync\(\s*['"]formatHoraire['"]/.test(corpsDe('obtenirHeuresSeance'))).toBe(false);
    });

    it('C.b la clé morte n\'est lue NULLE PART dans le module', () => {
        expect(
            /getSync\(\s*['"]formatHoraire['"]/.test(SRC_PRESENCES),
            'trois lectures, zéro écriture : toute lecture de cette clé est une condition toujours vraie'
        ).toBe(false);
    });

    it('C.c obtenirHeuresSeance ne rend aucun littéral de repli', () => {
        const corps = corpsDe('obtenirHeuresSeance');
        expect(/return\s+\d/.test(corps.replace(/return 0;/g, '')), 'un `return <nombre>` autre que 0 est une durée inventée').toBe(false);
        expect(/\|\|\s*[1-9]/.test(corps), 'le `|| 2` de la garde finale était la plus discrète des trois').toBe(false);
        expect(/\?\s*4\s*:\s*2/.test(corps), 'la ternaire 4/2 pilotée par la clé morte').toBe(false);
    });

    it('C.d obtenirNombrePeriodesSeance ne rend plus 2 périodes par défaut', () => {
        const corps = corpsDe('obtenirNombrePeriodesSeance');
        expect(/return\s+2\s*;/.test(corps)).toBe(false);
    });

    it('C.e obtenirDureeMaxSeance reste RETIRÉE (elle n\'était appelée nulle part)', () => {
        expect(
            /function\s+obtenirDureeMaxSeance\s*\(/.test(SRC_PRESENCES),
            'un plafond de séance ne se décrète pas dans le code : il se lit dans l\'horaire'
        ).toBe(false);
    });

    it('C.f la lecture de l\'horaire reste la source unique — en périodes depuis E2', () => {
        // ⚠ RÉVISÉ PAR #540 LOT E2. Ce cas comptait les appels à
        // `obtenirHeuresPrevuesParHoraire`, qui était alors le seul chemin vers l'horaire :
        // on y mesurait des heures, puis on divisait pour obtenir des périodes.
        //
        // E2 a séparé les deux grandeurs. `obtenirPeriodesPrevuesParHoraire` lit les
        // périodes SAISIES, sa sœur mesure toujours les heures d'horloge pour l'affichage,
        // et plus aucune division ne relie l'une à l'autre. Ce qui compte n'a pas changé :
        // il n'existe qu'UNE porte vers l'horaire pour chaque grandeur, et le repli à 2
        // n'est revenu par aucune.
        const enPeriodes = (SRC_PRESENCES.match(/obtenirPeriodesPrevuesParHoraire\(/g) || []).length;
        const enHeures = (SRC_PRESENCES.match(/obtenirHeuresPrevuesParHoraire\(/g) || []).length;
        expect(enPeriodes, 'définition + le repli d\'obtenirNombrePeriodesSeance').toBeGreaterThanOrEqual(2);
        expect(enHeures, 'définition + les points d\'affichage').toBeGreaterThanOrEqual(3);
    });

    it('C.g PLUS AUCUNE division ne convertit une durée en périodes (#540 lot E2)', () => {
        // Le verrou de fond du lot E : une période comprend sa pause, donc aucune durée
        // d'horloge ne peut rendre un nombre de périodes. Les conversions qui subsistent
        // dans ce module font l'ALLER-RETOUR sur `heures`, un champ que la saisie écrit
        // elle-même comme `periodesPresentes × dureePeriode / 60` — même diviseur des deux
        // côtés, donc valeur d'origine retrouvée quel que soit le réglage.
        const corps = corpsDe('obtenirNombrePeriodesSeance');
        expect(corps).not.toMatch(/\*\s*60\s*\)\s*\//);
        expect(corps).not.toContain('dureePeriode');
        expect(corps).toContain('obtenirPeriodesPrevuesParHoraire');
    });
});

/* ------------------------------------------------ D — le trou est dit, pas comblé */

describe('#538 · D — une durée inconnue se dit à l\'écran', () => {

    it('D.a l\'en-tête de saisie porte une mention explicite', () => {
        expect(/MENTION_DUREE_INCONNUE\s*=\s*'[^']+'/.test(SRC_PRESENCES)).toBe(true);
        const corps = corpsDe('mettreAJourEnteteDateSeance');
        expect(
            corps.includes('MENTION_DUREE_INCONNUE'),
            'sans cette mention, formaterHeuresAffichage(0) rend \'\' et le trou est silencieux — ' +
            'l\'utilisateur saisit alors des présences sur une séance dont la durée est inconnue'
        ).toBe(true);
    });
});
