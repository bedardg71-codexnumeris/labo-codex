import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =======================================================================
// SENTINELLE #540 LOT E1 — LA SÉANCE PORTE SES PÉRIODES, ON NE LES DÉDUIT PLUS
// =======================================================================
//
// ▣ CE QUE GRÉGOIRE A APPORTÉ, ET QUI N'ÉTAIT NULLE PART DANS LE CODE.
//   « Une heure qui dure 60 minutes, c'est une période de 50 minutes plus 10 minutes de
//   pause. Dans d'autres collèges, 55 plus 5. » Une période comprend sa pause ; son
//   empreinte à l'horaire n'est pas sa durée d'enseignement.
//
// ▣ CE QUE ÇA RÉVÉLAIT. Tout le dépôt convertissait un temps d'horloge en périodes en
//   divisant par la seule durée d'enseignement :
//       08:00 → 11:00  =  180 / 50 = 3,6 → 4 périodes   (la réponse est 3)
//       13:00 → 17:00  =  240 / 50 = 4,8 → 5 périodes   (la réponse est 4)
//   L'erreur croît avec la durée, et le bloc de quatre heures — cas courant en
//   littérature — comptait cinq périodes. Ce nombre EST le dénominateur de l'assiduité :
//   un élève pouvait être compté absent d'une période qui n'existe pas.
//
// ▣ LA QUESTION QUI A TRANCHÉ. Grégoire : « je me demande si la durée de la période est
//   pertinente et si elle ne crée pas davantage de confusion. » L'audit lui a donné
//   raison : ce champ n'existait que comme PONT entre deux unités — l'horaire se saisit
//   en heures d'horloge, la présence en périodes. Et un ratio est invariant par unité :
//   `dureePeriode` ne servait pas à CALCULER l'assiduité, seulement à réconcilier deux
//   modes de saisie. La correspondance période ↔ minutes n'est pas une conversion, c'est
//   une convention locale.
//
// ▣ DÉCISION : le pont disparaît. Les heures et le nombre de périodes sont deux données,
//   toutes deux lues sur l'horaire officiel, toutes deux saisies. Plus de conversion.
//
// ⮕ CE QUI EST VERROUILLÉ ICI :
//   A. le champ GLOBAL « Périodes par séance » a disparu — un format ne se déclare plus
//      pour tout un horaire ;
//   B. chaque séance porte le sien, et la sauvegarde le REFUSE absent ;
//   C. il voyage jusqu'au cache que lit l'assiduité (le maillon qui manquait) ;
//   D. les séances d'AVANT se complètent par REPRISE d'une déclaration, jamais par
//      redivision des heures ;
//   E. le module d'horaire ne convertit plus rien.

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
const SRC_HORAIRE = sansCommentaires(lire('js', 'horaire.js'));

const corpsDe = (src, nom) => {
    const i = src.indexOf(`function ${nom}(`);
    expect(i, `${nom} renommée ou retirée sans mettre à jour cette sentinelle`).toBeGreaterThan(-1);
    const fin = src.indexOf('\n}\n', i);
    return src.slice(i, fin > i ? fin + 2 : src.indexOf('\n}', i));
};

// ─────────────────────────────────────────────────────────────────────
describe('#540-E1/A — plus de format déclaré pour tout un horaire', () => {
    it('le champ global a disparu de l\'écran', () => {
        expect(HTML).not.toContain('v2-hor-periodesParSeance');
        expect(HTML).not.toContain('Périodes par séance');
    });

    it('et du module', () => {
        expect(SRC_HORAIRES).not.toContain('v2-hor-periodesParSeance');
    });

    it('l\'entité horaire ne l\'écrit plus', () => {
        const corps = corpsDe(SRC_HORAIRES, 'sauvegarderHoraireV2');
        // Ni dans la branche modification, ni dans la branche création.
        expect(corps).not.toMatch(/^\s*periodesParSeance,\s*$/m);
    });
});

describe('#540-E1/B — chaque séance porte ses périodes, et c\'est exigé', () => {
    it('la ligne de séance a son champ', () => {
        const corps = corpsDe(SRC_HORAIRES, 'mettreAJourSeancesHoraireV2');
        expect(corps).toContain('-periodes');
        expect(corps).toContain('type="number"');
    });

    it('le champ naît VIDE — la donnée qui pilote le dénominateur se saisit à l\'œil ouvert', () => {
        const corps = corpsDe(SRC_HORAIRES, 'mettreAJourSeancesHoraireV2');
        // Un `value="2"` sur ce champ-là serait un format déclaré qui revient par la porte
        // de derrière : personne ne le regarderait, et il compterait quand même.
        // ⚠ RENFORCÉ après un break-test qui N'A PAS ROUGI : la première version exigeait
        // un `$` littéral (`value="${...}"`) et laissait donc passer un `value="2"` en dur
        // — précisément la forme la plus probable du retour en arrière. On refuse
        // maintenant TOUT attribut `value` non vide sur ce champ, quelle qu'en soit la
        // provenance. Délimité à la balise elle-même, pas à une fenêtre approximative.
        const debut = corps.indexOf('-periodes"');
        expect(debut, 'champ périodes introuvable').toBeGreaterThan(-1);
        const balise = corps.slice(debut, corps.indexOf('>', debut));
        expect(balise, 'le champ périodes naît pré-rempli').not.toMatch(/value\s*=/);
    });

    it('la sauvegarde l\'écrit sur la séance', () => {
        const corps = corpsDe(SRC_HORAIRES, 'sauvegarderHoraireV2');
        expect(corps).toMatch(/seances\.push\(\{[^}]*nombrePeriodes/);
    });

    it('et le REFUSE absent, plutôt que d\'en proposer un', () => {
        const corps = corpsDe(SRC_HORAIRES, 'sauvegarderHoraireV2');
        expect(corps).toMatch(/nombrePeriodes\s*>\s*0/);
        expect(corps).toContain('_refuserHoraireV2(');   // lot E2 : le refus passe par le témoin commun
    });

    it('la régénération des lignes ne perd pas une saisie (leçon #460)', () => {
        const corps = corpsDe(SRC_HORAIRES, 'changerFormatSeancesHoraireV2');
        expect(corps).toContain('periodes');
    });
});

describe('#540-E1/C — le nombre voyage jusqu\'au cache de l\'assiduité', () => {
    it('genererSeancesCompletes propage nombrePeriodes', () => {
        const corps = corpsDe(SRC_HORAIRE, 'genererSeancesCompletes');
        expect(corps).toContain('nombrePeriodes: seance.nombrePeriodes');
    });

    it('et ne perd plus les heures des séances du formulaire', () => {
        // Elles portent `heureDebut`/`heureFin`, jamais `debut`/`fin` : la projection
        // écrivait `debut: undefined` et une fin calculée à partir de rien.
        const corps = corpsDe(SRC_HORAIRE, 'genererSeancesCompletes');
        expect(corps).toContain('seance.heureDebut');
        expect(corps).toContain('seance.heureFin');
    });
});

describe('#540-E1/D — les séances d\'avant se complètent par REPRISE, pas par calcul', () => {
    it('le chargement reprend la déclaration de l\'horaire', () => {
        const corps = corpsDe(SRC_HORAIRES, 'editerHoraireV2');
        expect(corps).toContain('horaire.periodesParSeance');
    });

    it('et ne redivise JAMAIS les heures pour les deviner', () => {
        const corps = corpsDe(SRC_HORAIRES, 'editerHoraireV2');
        // Rediviser propagerait exactement le faux que ce lot retire.
        expect(corps).not.toContain('dureePeriode');
        expect(corps).not.toContain('mesurerDureeSeance');
        expect(corps).not.toMatch(/\*\s*60\s*\)\s*\//);
    });
});

describe('#540-E1/E — le module d\'horaire ne convertit plus', () => {
    it('le résumé du formulaire additionne, il ne divise pas', () => {
        const corps = corpsDe(SRC_HORAIRES, 'majResumeFormatHoraireV2');
        expect(corps).not.toContain('dureePeriode');
        expect(corps).not.toMatch(/\*\s*60\s*\)\s*\//);
    });

    it('le résumé DIT ce qui manque au lieu d\'annoncer un total partiel', () => {
        const corps = corpsDe(SRC_HORAIRES, 'majResumeFormatHoraireV2');
        expect(corps).toContain('incompletes');
    });
});
