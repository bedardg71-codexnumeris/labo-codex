import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tranche } from './_helpers/tranche.js';

// ═══════════════════════════════════════════════════════════════════════════
// LE SKILL DU MODULE DOIT DIRE LE VRAI VOCABULAIRE (16 août 2026)
//
// ⚠⚠ CE FICHIER NAÎT D'UNE DÉRIVE QUI A DURÉ DES MOIS. `SKILL_Alignement.md`
// listait SEPT identifiants de liens — `vise`, `mobilise`, `prerequis_de`,
// `evalue_par`, `soutenu_par`, `revise_dans`, `sequence_avant` — dont AUCUN
// n'existait plus dans `TYPES_LIENS`. Tous avaient été renommés ; ils ne
// survivent que dans les tables de migration. Et le tableau des phases nommait
// « Modelage » et « Objectivation » là où l'app affiche « Modélisation » et
// « Clôture ».
//
// ⮕ Un skill est lu par une session AVANT qu'elle ne touche au code. Quand il
// ment sur le vocabulaire, il ne se contente pas d'être inutile : il induit
// activement en erreur, et rien ne rougit. Ces cas verrouillent les deux
// vocabulaires que le code peut trancher tout seul.
//
// ⚠ Ce qui relève du CADRE PÉDAGOGIQUE (taxonomie des connaissances, catégories
// sans type de nœud) n'est PAS testé ici : ce sont des décisions de Grégoire,
// pas des faits de code. Le skill les porte comme questions ouvertes.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const skill = readFileSync(
    path.join(racine, '.claude', 'skills', 'alignement', 'SKILL.md'), 'utf8');
const carte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');

/** Les identifiants de liens RÉELLEMENT vivants, lus dans TYPES_LIENS. */
function verbesVivants() {
    const bloc = carte.slice(carte.indexOf('const TYPES_LIENS'),
        carte.indexOf('var TYPES_CONNAISSANCE'));
    return [...bloc.matchAll(/id:\s*'([a-z_]+)'/g)].map((m) => m[1]);
}

/** Les libellés des cinq phases, lus dans TYPES. */
function libellesPhases() {
    const bloc = carte.slice(carte.indexOf('const TYPES = {'), carte.indexOf('const RETROACTIONS'));
    return ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture']
        .map((t) => {
            const m = bloc.match(new RegExp("'" + t + "':\\s*\\{\\s*label:\\s*'([^']+)'"));
            return m ? m[1] : null;
        });
}

describe('SKILL_Alignement · le vocabulaire documenté est celui du code', () => {

    it('⚠⚠ chaque verbe de lien VIVANT est documenté dans le skill', () => {
        const vivants = verbesVivants();
        expect(vivants.length, 'TYPES_LIENS est introuvable ou vide').toBeGreaterThan(5);
        const absents = vivants.filter((v) => !skill.includes('`' + v + '`'));
        expect(absents,
            'ces verbes existent dans le code et ne sont nulle part dans le skill'
        ).toEqual([]);
    });

    it('⚠⚠ aucun verbe MORT n’est présenté comme vivant', () => {
        // Les anciens noms ont le droit de figurer — le skill doit dire qu'ils
        // sont legacy. Ce qu'il ne doit plus faire, c'est les lister dans le
        // TABLEAU des types de liens, où une session vient chercher quoi écrire.
        const tableau = tranche(skill, '| Type de lien |', 'Anciens identifiants');
        expect(tableau, 'le tableau des types de liens est introuvable').toBeTruthy();
        for (const mort of ['vise', 'mobilise', 'prerequis_de', 'evalue_par',
                            'soutenu_par', 'revise_dans', 'sequence_avant']) {
            expect(tableau, `« ${mort} » est mort et figure encore dans le tableau`)
                .not.toMatch(new RegExp('`' + mort + '`'));
        }
    });

    it('⚠ les cinq phases portent le libellé que Grégoire LIT dans le menu', () => {
        // « Modelage » et « Objectivation » sont les noms de la littérature ;
        // l'application affiche « Modélisation » et « Clôture ». Le skill peut
        // citer les deux, mais il doit porter celui de l'écran.
        //
        // ⚠⚠ PORTÉE RESTREINTE AU TABLEAU DES PHASES, et c'est le break-test qui
        // l'a exigé. Le premier jet cherchait le libellé dans TOUT le document :
        // remettre « Objectivation » dans le tableau le laissait VERT, parce que
        // « Clôture » apparaît ailleurs dans le skill. L'assertion nommait
        // l'invariant et en testait un plus faible — le piège que ce projet a
        // déjà rencontré trois fois.
        const debutT = skill.indexOf('| Phase (app) |');
        expect(debutT, 'le tableau des phases a disparu du skill').toBeGreaterThan(-1);
        const tableau = skill.slice(debutT, skill.indexOf('\n\n', debutT));
        for (const label of libellesPhases()) {
            expect(label, 'un libellé de phase est introuvable dans TYPES').toBeTruthy();
            expect(tableau, `la phase « ${label} » de l’app manque au TABLEAU des phases`)
                .toContain(label);
        }
    });

    it('les familles permutables du skill sont celles du code', () => {
        // Si une famille s'élargit dans le code sans que le skill suive, la
        // prochaine session raisonnera sur une borne périmée — et c'est
        // précisément la borne qui protège les données.
        const bloc = skill.slice(skill.indexOf('| Famille | Membres permutables'));
        expect(bloc, 'le tableau des familles a disparu du skill').toBeTruthy();
        for (const jeton of ['--planif-couleur-intention', '--planif-couleur-connaissance',
                             '--planif-couleur-deroulement', '--planif-couleur-organisation',
                             '--planif-couleur-verification']) {
            expect(bloc, `le jeton ${jeton} manque au tableau des familles`).toContain(jeton);
        }
        // Et la borne qui compte le plus : Séquence/Leçon NON permutables.
        expect(bloc).toMatch(/PAS permutables/);
    });

    it('le skill dit que la visée est un MODIFICATEUR, jamais deux types', () => {
        // C'est la mise en garde la plus coûteuse à réapprendre : deux types
        // tueraient en silence la moisson des productions et les sections
        // d'export.
        // ⚠ `indexOf` VÉRIFIÉ, et pas juste passé à `slice`. Premier jet :
        // l'aiguille portait une apostrophe typographique là où le skill a une
        // apostrophe droite → `indexOf` rendait -1, `slice(-1)` rendait « \n »,
        // et `toBeTruthy()` l'acceptait. L'oracle validait un saut de ligne.
        const depart = skill.indexOf("La visée d'une évaluation");
        expect(depart, 'la section sur la visée a disparu du skill').toBeGreaterThan(-1);
        const bloc = skill.slice(depart);
        expect(bloc).toMatch(/productionId/);
        expect(bloc).toMatch(/silence/i);
    });
});
