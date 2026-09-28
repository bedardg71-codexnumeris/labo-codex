import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #540 LOT C — L'ÉCRAN AFFICHE CE QUE LE CALCUL COMPTE
// =======================================================================
//
// ▣ LA DIVERGENCE. Deux sources concurrentes disaient la durée hebdomadaire d'un
//   horaire, et rien ne les réconciliait :
//     · ce que l'ÉCRAN affichait : `nbSeances × periodesParSeance`, deux déclarations
//       multipliées l'une par l'autre, jamais confrontées aux heures saisies ;
//     · ce que l'ASSIDUITÉ comptait : la somme des `heureFin − heureDebut`, convertie
//       par la durée de période configurée (#538).
//   Un horaire annoncé « 2 périodes/séance » avec des séances de 08:00 à 11:00
//   affichait 4 périodes/semaine et en pesait 8 au dénominateur. **Le calcul avait
//   raison ; c'est l'affichage qui mentait.**
//
// ▣ LE REPLI QUI SE DÉCLENCHAIT VRAIMENT. Trois endroits mesuraient une séance à leur
//   façon, tous avec un repli à `2` quand ni `nombrePeriodes` ni `duree` n'étaient là.
//   Or `sauvegarderHoraireV2` écrit `{jour, heureDebut, heureFin, local}` — ni l'un ni
//   l'autre. Tout horaire créé par le formulaire tombait dans ce repli à CHAQUE
//   affichage. Ce n'était pas un cas limite : c'était le cas courant.
//
// ▣ ET DEUX HEURES FABRIQUÉES. `sauvegarderHoraireV2` lisait ses champs avec
//   `|| '08:00'` et `|| '10:00'` : des champs vides produisaient une séance de deux
//   heures, qui entrait ensuite au dénominateur par `obtenirHeuresPrevuesParHoraire`.
//
// ▣ DÉCISION DE GRÉGOIRE, 26 août 2026 : rendre le champ « Périodes par séance »
//   EFFECTIF. Il ne pré-remplissait rien — les lignes naissaient à 08:00 → 10:00 en dur,
//   quel que soit le choix. Il pilote désormais l'heure de fin proposée, et l'affichage
//   se lit ensuite aux heures RÉELLES. Le format « 2×2 », langage du réseau collégial,
//   reste à l'écran ; il devient ce que l'utilisateur croyait qu'il était.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. une seule mesure pour les deux — `mesurerDureeSeance` exportée et employée ;
//   B. banc VIVANT : la séance du formulaire (heureDebut/heureFin seuls) est mesurée
//      juste, là où l'ancien code rendait 2 ;
//   C. le champ est EFFECTIF — la fin proposée suit le nombre de périodes ;
//   D. aucune heure ni période fabriquée ne revient dans le fichier ;
//   E. les gardes de chargement rendent 0, jamais 2 (#538) ;
//   F. la durée d'une intervention n'est plus inventée sur le chemin d'écriture.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');

/** Voir #540 lot A : un verrou de source lit le CODE, pas les commentaires. */
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

const HTML = lire('index.html');
const SRC_HORAIRES = sansCommentaires(lire('js', 'trimestre-v2-horaires.js'));
const SRC_PRESENCES = sansCommentaires(lire('js', 'saisie-presences.js'));

/** Le module horaires, avec la VRAIE `mesurerDureeSeance` de saisie-presences.js. */
function chargerHoraires(dureePeriode = 50) {
    const presences = chargerScript('js/saisie-presences.js', {
        db: { getSync: () => null, setSync: () => {} },
        cle: (k) => k,
        obtenirDureePeriode: () => dureePeriode
    });
    return chargerScript('js/trimestre-v2-horaires.js', {
        db: { getSync: () => null, setSync: () => {} },
        cle: (k) => k,
        obtenirDureePeriode: () => dureePeriode,
        mesurerDureeSeance: presences.mesurerDureeSeance,
        notifications: { erreur: () => {}, succes: () => {} }
    });
}

// ─────────────────────────────────────────────────────────────────────
// ⚠ LES DEUX PREMIERS BANCS ONT ÉTÉ RÉVISÉS PAR LE LOT E2, LE MÊME SOIR.
//
// Le lot C avait donné UNE SEULE MESURE aux deux chaînes : l'écran Horaire cessait de
// réinventer la sienne et employait `mesurerDureeSeance`, comme le calcul d'assiduité.
// C'était le bon geste — il a fermé la divergence entre ce qui s'affichait et ce qui se
// comptait — mais il laissait les deux également faux : une période comprend sa pause,
// et diviser une durée d'horloge par la durée d'enseignement gonflait le compte dès la
// troisième période.
//
// E2 ne partage plus la mesure : il la SUPPRIME. `nombrePeriodes` est saisi sur chaque
// séance (lot E1) et se lit. Les cas qui éprouvaient la mesure partagée sont donc
// réécrits sur la lecture ; ce que le lot C a apporté de durable — plus aucun repli à 2,
// plus d'heures fabriquées à la sauvegarde — est verrouillé par les bancs D et E, qui
// n'ont pas bougé.

describe('#540-C/A — la mesure des heures existe toujours, mais ne compte plus de périodes', () => {
    it('mesurerDureeSeance reste exportée — elle mesure des heures d\'horloge', () => {
        // Toujours utile : `obtenirHeuresPrevuesParHoraire` s'en sert pour l'affichage
        // d'une durée. Ce qui a disparu, c'est son emploi pour COMPTER des périodes.
        expect(SRC_PRESENCES).toContain('window.mesurerDureeSeance = mesurerDureeSeance');
    });

    it('mais le module horaires ne l\'emploie plus pour compter', () => {
        const i = SRC_HORAIRES.indexOf('function periodesDeLaSeance');
        const corps = SRC_HORAIRES.slice(i, SRC_HORAIRES.indexOf('\n}', i));
        expect(corps).not.toContain('mesurerDureeSeance');
        expect(corps).not.toContain('dureePeriode');
    });
});

describe('#540-C/B — les périodes se LISENT sur la séance (banc vivant)', () => {
    const win = chargerHoraires(50);

    it('une séance qui dit ses périodes les rend', () => {
        expect(win.periodesDeLaSeance({ jour: 'Lundi', heureDebut: '08:00', heureFin: '11:00', nombrePeriodes: 3 })).toBe(3);
    });

    it('LE CAS QUI MENTAIT : trois heures sans périodes ne valent plus 4 — elles valent 0', () => {
        // L'ancienne chaîne divisait 180 min par 50 et arrondissait à 4. La réponse est 3,
        // et personne ne peut la déduire des heures : on ne répond donc pas.
        expect(win.periodesDeLaSeance({ jour: 'Lundi', heureDebut: '08:00', heureFin: '11:00' })).toBe(0);
    });

    it('une séance MUETTE rend 0 — jamais 2', () => {
        expect(win.periodesDeLaSeance({ jour: 'Lundi' })).toBe(0);
        expect(win.periodesDeLaSeance({})).toBe(0);
        expect(win.periodesDeLaSeance(null)).toBe(0);
    });

    it('la durée de période N\'INFLUE PLUS — preuve qu\'aucune division ne subsiste', () => {
        const seance = { heureDebut: '08:00', heureFin: '10:30', nombrePeriodes: 2 };
        for (const d of [50, 60, 75]) {
            expect(chargerHoraires(d).periodesDeLaSeance(seance), `réglage ${d} min`).toBe(2);
        }
    });

    it('le total hebdomadaire additionne les périodes déclarées', () => {
        const seances = [
            { jour: 'Lundi', heureDebut: '08:00', heureFin: '10:00', nombrePeriodes: 2 },
            { jour: 'Jeudi', heureDebut: '13:00', heureFin: '16:00', nombrePeriodes: 3 }
        ];
        expect(win.periodesParSemaine(seances)).toBe(5);
    });

    it('une séance incomplète ne contribue pas au total, et ne l\'annule pas non plus', () => {
        const seances = [
            { jour: 'Lundi', nombrePeriodes: 2 },
            { jour: 'Jeudi', heureDebut: '13:00', heureFin: '16:00' }   // sans périodes
        ];
        expect(win.periodesParSemaine(seances)).toBe(2);
        expect(win.periodesParSemaine([{ jour: 'Lundi' }, {}])).toBe(0);
        expect(win.periodesParSemaine(null)).toBe(0);
    });
});

describe('#540-C/C — le format ne se déclare plus globalement', () => {
    // ⚠ CE BANC A ÉTÉ RÉVISÉ PAR LE LOT E1, LE MÊME SOIR.
    //
    // Le lot C avait rendu le champ global « Périodes par séance » EFFECTIF : il pilotait
    // l'heure de fin proposée, calculée par `début + N × durée de période`. Grégoire a
    // ensuite montré qu'une période comprend sa PAUSE (50 + 10, ou 55 + 5 ailleurs) : la
    // dérivation était donc fausse dès la troisième période, et le champ global lui-même
    // n'avait plus de raison d'être. E1 l'a retiré, et chaque séance porte ses périodes.
    //
    // Les trois cas d'origine visaient la dérivation ; ils sont remplacés par ce qu'ils
    // protégeaient vraiment — qu'aucun format ne soit DÉCLARÉ pour tout un horaire, et
    // qu'aucune période ne soit déduite d'une durée.

    it('le champ global a disparu du module et de l\'écran', () => {
        expect(SRC_HORAIRES).not.toContain('v2-hor-periodesParSeance');
        expect(HTML).not.toContain('v2-hor-periodesParSeance');
    });

    it('chaque ligne de séance porte SON nombre de périodes', () => {
        const i = SRC_HORAIRES.indexOf('function mettreAJourSeancesHoraireV2');
        const corps = SRC_HORAIRES.slice(i, SRC_HORAIRES.indexOf('\n}', i));
        expect(corps).toContain('-periodes');
    });

    it('la sauvegarde écrit `nombrePeriodes` sur la séance, et le REFUSE absent', () => {
        const i = SRC_HORAIRES.indexOf('function sauvegarderHoraireV2');
        const corps = SRC_HORAIRES.slice(i, SRC_HORAIRES.indexOf('\n}\n', i) + 2);
        expect(corps).toContain('nombrePeriodes');
        expect(corps).toContain('_refuserHoraireV2(');   // lot E2 : le refus passe par le témoin commun
    });

    it('le résumé additionne les périodes SAISIES, sans convertir', () => {
        const i = SRC_HORAIRES.indexOf('function majResumeFormatHoraireV2');
        expect(i).toBeGreaterThan(-1);
        const corps = SRC_HORAIRES.slice(i, SRC_HORAIRES.indexOf('\n}', i));
        expect(corps).toContain('-periodes');
        expect(corps).not.toMatch(/nbSeances\s*\*\s*periodesParSeance/);
        // Plus aucune division par une durée : c'est tout l'objet du lot E.
        expect(corps).not.toContain('dureePeriode');
    });

    it('le nombre de périodes du cache vient de la SÉANCE, pas d\'un calcul', () => {
        // `genererSeancesCompletes` perdait les heures (`debut` vs `heureDebut`) et ne
        // propageait aucune période : le dénominateur de l'assiduité ne pouvait pas voir
        // ce que l'utilisateur avait déclaré à l'écran Horaire.
        const SRC_HORAIRE_JS = sansCommentaires(lire('js', 'horaire.js'));
        const i = SRC_HORAIRE_JS.indexOf('function genererSeancesCompletes');
        const corps = SRC_HORAIRE_JS.slice(i, SRC_HORAIRE_JS.indexOf('\n}\n', i) + 2);
        expect(corps).toContain('nombrePeriodes: seance.nombrePeriodes');
        expect(corps).toContain('seance.heureDebut');
    });
});

describe('#540-C/D — plus rien n\'est fabriqué dans le module horaires', () => {
    it('les heures par défaut sont NOMMÉES, et n\'existent qu\'au formulaire', () => {
        // ⚠ RÉVISÉ PAR E1. Le lot C dérivait la fin par défaut et interdisait « 10:00 » ;
        // E1 a retiré la durée de période qui permettait cette dérivation, et la fin
        // redevient un défaut de formulaire — VISIBLE et modifiable, comme le début.
        //
        // La règle qui compte n'a pas bougé, et c'est elle qu'on verrouille : un défaut
        // de SAISIE se voit à l'écran et se corrige ; une valeur relue en silence sur un
        // champ vide entre dans les données sans que personne ne la regarde. Les deux
        // heures ci-dessous sont des constantes NOMMÉES du rendu du formulaire, chacune
        // employée une seule fois — et la sauvegarde, elle, n'en fabrique aucune (cas
        // suivant).
        expect(SRC_HORAIRES).toContain('DEBUT_PAR_DEFAUT');
        expect(SRC_HORAIRES).toContain('FIN_PAR_DEFAUT');
        expect((SRC_HORAIRES.match(/'08:00'/g) || []).length).toBe(1);
        expect((SRC_HORAIRES.match(/'10:00'/g) || []).length).toBe(1);
    });

    it('aucun repli à 2 périodes ne subsiste dans les mesures', () => {
        // ⚠ RENFORCÉ après un break-test qui N'A PAS ROUGI : la première version cherchait
        // la chaîne littérale `return sum + 2`, et laissait donc passer le même repli
        // écrit `sum + 2` dans un reduce inline. Un verrou de source qui vise une
        // FORMULATION plutôt qu'un COMPORTEMENT ne verrouille rien. On vise désormais les
        // fonctions d'affichage, et on y interdit toute constante de périodes.
        const corpsDe = (nom) => {
            const i = SRC_HORAIRES.indexOf(`function ${nom}(`);
            expect(i, `${nom} renommée ou retirée sans mettre à jour cette sentinelle`).toBeGreaterThan(-1);
            return SRC_HORAIRES.slice(i, SRC_HORAIRES.indexOf('\n}', i));
        };

        for (const nom of ['chargerSeancesV2', 'mettreAJourCarteResumeHoraireV2']) {
            const corps = corpsDe(nom);
            // On vise l'ACCUMULATION d'une constante — `sum + 2`, `acc + 2`, `total + 2`.
            // (Une première version interdisait tout `: 2` et rougissait sur la table des
            // jours, `{ 'Mardi': 2, ... }` : un verrou qui crie faux se fait désarmer.)
            expect(corps, `${nom} accumule encore une constante de périodes`)
                .not.toMatch(/\b(sum|acc|total|totalPeriodes|totalHeures)\s*\+\s*\d/);
            expect(corps, `${nom} doit passer par la mesure partagée`)
                .toMatch(/periodesParSemaine|periodesDeLaSeance|mesurerDureeSeance/);
        }
    });

    it('la sauvegarde REFUSE un début manquant au lieu de l\'inventer', () => {
        const i = SRC_HORAIRES.indexOf('function sauvegarderHoraireV2');
        const corps = SRC_HORAIRES.slice(i, SRC_HORAIRES.indexOf('\n}\n', i) + 2);
        expect(corps).toContain('_refuserHoraireV2(');   // lot E2 : le refus passe par le témoin commun
        expect(corps).not.toContain("'08:00'");
        expect(corps).not.toContain("'10:00'");
    });
});

describe('#540-C/E — les gardes de chargement rendent 0, jamais 2', () => {
    const fichiers = [
        ['js', 'indices.js'],
        ['js', 'etudiants.js'],
        ['js', 'profil-etudiant-sections-affichage.js']
    ];

    it('aucune garde `obtenirNombrePeriodesSeance` ne se replie sur 2', () => {
        const coupables = [];
        for (const f of fichiers) {
            const src = sansCommentaires(lire(...f));
            const re = /obtenirNombrePeriodesSeance\([^)]*\)\s*:\s*(\d+)/g;
            let m;
            while ((m = re.exec(src)) !== null) {
                if (m[1] !== '0') coupables.push(`${f.join('/')} → : ${m[1]}`);
            }
        }
        expect(coupables, coupables.join(' | ')).toEqual([]);
    });

    it('et il y a bien des gardes à surveiller (garde anti-silence)', () => {
        const total = fichiers.reduce((n, f) => {
            const src = sansCommentaires(lire(...f));
            return n + (src.match(/obtenirNombrePeriodesSeance\([^)]*\)\s*:\s*\d+/g) || []).length;
        }, 0);
        expect(total).toBeGreaterThanOrEqual(5);
    });
});

describe('#540-C/F — la durée d\'une intervention n\'est plus inventée', () => {
    const SRC_INTERVENTIONS = sansCommentaires(lire('js', 'interventions.js'));

    // Le chemin d'ÉCRITURE des présences, et lui seul.
    const iTransfert = SRC_INTERVENTIONS.indexOf('function transfererPresencesVersModule');
    const CORPS_TRANSFERT = SRC_INTERVENTIONS.slice(iTransfert, SRC_INTERVENTIONS.indexOf('\n}', iTransfert));

    it('la sentinelle vise bien la fonction de report', () => {
        expect(iTransfert).toBeGreaterThan(-1);
        expect(CORPS_TRANSFERT).toContain('ajouterPresencesIntervention');
    });

    it('le report des présences refuse une durée absente', () => {
        expect(CORPS_TRANSFERT).not.toContain('intervention.duree || 2');
        expect(CORPS_TRANSFERT).toContain('parseFloat(intervention.duree)');
    });

    it('les DÉFAUTS DE FORMULAIRE, eux, restent — ils proposent, ils ne comptent pas', () => {
        // ⚠ DISTINCTION ASSUMÉE, et c'est le cœur du lot C. Un défaut de SAISIE propose
        // une valeur que l'utilisateur voit et peut corriger (comme 08:00 pour une heure
        // de début) ; une valeur inventée au moment de CALCULER ou d'ÉCRIRE entre dans
        // les données sans que personne ne l'ait vue. Les premiers restent, les seconds
        // partent. Sans ce cas, la sentinelle pousserait à retirer aussi les défauts de
        // formulaire — ce qui n'a jamais été la règle du projet.
        expect(SRC_INTERVENTIONS).toContain('data.duree || 2');       // creerIntervention
        expect(SRC_INTERVENTIONS).toContain('intervention.duree || 2'); // champ du formulaire
    });
});
