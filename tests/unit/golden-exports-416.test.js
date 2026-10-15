import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monterExportSandbox, SORTIES_GENERIQUES, DATE_ESSAI } from './_helpers/carte-essai-exports.js';

// =======================================================================
// GOLDEN MASTER DES SORTIES GÉNÉRIQUES (#416 lot G)
// =======================================================================
//
// Le lot G fond les préréglages dans les gabarits : Plan de cours, En classe,
// Preuve d'alignement et Personnalisé cessent d'être des « niveaux » pour
// devenir des listes de colonnes du générateur unique. C'est un refactor du
// SEUL générateur d'export de l'application.
//
// ⚠ SA PREUVE EST ICI, ET ELLE EST BIT-À-BIT. Si les quatre sorties génériques
// sortent identiques à l'octet près, la fonte n'a rien changé POUR
// L'UTILISATEUR — quoi qu'il soit arrivé à la structure du code.
//
// Le harnais `harnais-parite-exports-424` vérifie autre chose et reste
// nécessaire : il dit ce que CHAQUE NIVEAU doit montrer (contrats D4), par
// tokens. Un refactor peut le garder vert en déplaçant une colonne, en
// changeant une espace, en réordonnant deux lignes. Celui-ci ne le peut pas.
//
// ⚠ SI CE TEST ROUGIT PENDANT LE LOT G : ne pas régénérer les références.
// Un octet qui bouge est un comportement qui a changé sans avoir été décidé.
// S'arrêter et le dire — c'est le signal, pas un obstacle.
//
// Régénération DÉLIBÉRÉE (nouveau comportement voulu, décidé, écrit) :
//   node scripts/figer-golden-exports-416.mjs

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dossierRef = path.resolve(__dirname, '..', 'fixtures', 'golden-exports-416');

let exporteur;

beforeAll(() => { exporteur = monterExportSandbox().exporteur; });

describe('Golden master · les sorties génériques ne bougent pas d’un octet', () => {
    for (const { niveau, format } of SORTIES_GENERIQUES) {
        it(`${niveau} · ${format} — identique à la référence`, () => {
            const chemin = path.join(dossierRef, `${niveau}.${format}.txt`);
            expect(
                existsSync(chemin),
                `Référence absente : ${niveau}.${format}.txt — la figer avec ` +
                '`node scripts/figer-golden-exports-416.mjs` AVANT de refactorer, jamais après.'
            ).toBe(true);

            expect(exporteur.genererExport(niveau, format)).toBe(readFileSync(chemin, 'utf8'));
        });
    }

    it('toutes les sorties génériques sont couvertes — aucune n’échappe au filet', () => {
        // 3 documents × 3 formats, plus le Calendrier qui refuse le Texte.
        // ⚠ Le compte est passé de 12 à 11 au lot H : « personnalise » n'est
        // plus un niveau, son réglage a migré en gabarit nommé. Ce n'est pas
        // une couverture perdue, c'est un comportement retiré.
        expect(SORTIES_GENERIQUES).toHaveLength(11);
        expect(SORTIES_GENERIQUES.filter((s) => s.niveau === 'calendrier')).toHaveLength(2);
        expect(SORTIES_GENERIQUES.some((s) => s.niveau === 'personnalise')).toBe(false);
    });
});

describe('Golden master · il ne doit RIEN devoir au jour où on le lance', () => {
    // ⚠ CE BLOC EXISTE À CAUSE DU 13 AOÛT 2026 AU MATIN. Le hook pré-push a
    // refusé de pousser : six sorties rouges, sur un arbre IDENTIQUE à celui
    // de la veille. Rien n'avait changé — sauf la date. Les rendeurs Texte et
    // Markdown écrivent « Exporté le <jour> », et le golden master avait figé
    // le 12 août.
    //
    // ⮕ Un filet qui rougit tout seul chaque matin finit par être contourné,
    // et c'est ce jour-là qu'il aurait manqué. L'horloge du sandbox est donc
    // figée, et ces cas-ci vérifient qu'elle l'est RESTÉE — sinon la
    // périssabilité reviendrait sans que personne ne s'en aperçoive avant le
    // lendemain.

    it('les sorties datées portent la date FIGÉE, pas celle d’aujourd’hui', () => {
        const attendue = new Date(DATE_ESSAI).toLocaleDateString('fr-CA');
        const aujourdhui = new Date().toLocaleDateString('fr-CA');

        expect(exporteur.genererExport('sommaire', 'texte')).toContain('Exporté le ' + attendue);
        expect(exporteur.genererExport('sommaire', 'markdown')).toContain('Exporté le ' + attendue);

        // Le jour où ce cas tombe parce que les deux dates coïncident, il ne
        // prouve plus rien — mais il ne peut pas mentir non plus.
        // On cherche « Exporté le <jour> », pas la date nue : la carte d'essai porte
        // une échéance fixe (2026-10-15), qui a fait rougir ce cas le 15 oct. 2026.
        if (aujourdhui !== attendue) {
            expect(exporteur.genererExport('sommaire', 'texte')).not.toContain('Exporté le ' + aujourdhui);
        }
    });

    it('AUCUNE référence ne contient la date du jour', () => {
        // La garde générale : si une sortie se remettait à dater du jour, ce
        // cas le dirait le matin même, avec la raison écrite.
        const aujourdhui = new Date().toLocaleDateString('fr-CA');
        if (aujourdhui === new Date(DATE_ESSAI).toLocaleDateString('fr-CA')) return;

        for (const { niveau, format } of SORTIES_GENERIQUES) {
            expect(
                readFileSync(path.join(dossierRef, `${niveau}.${format}.txt`), 'utf8'),
                `${niveau}.${format} contient la date du jour — le golden master est redevenu périssable.`
            ).not.toContain('Exporté le ' + aujourdhui);
        }
    });

    it('la résolution des dates de séance N’EST PAS figée, elle', () => {
        // ⚠ L'horloge du sandbox ne fige que `new Date()` SANS argument.
        // Figer aussi `new Date(chaîne)` casserait la dérivation des dates de
        // séance — le lot C tout entier.
        const plan = exporteur.construirePlan({ groupeCoursId: 'GC_MATIN' });
        expect(plan.sequences[0].lecons[0].date).toBe('2026-09-08');
    });
});

describe('Golden master · ce que les références contiennent VRAIMENT', () => {
    // Un golden master ne dit pas ce qu'il protège : il fige des octets. Ces
    // quelques cas nomment ce qui doit s'y trouver, pour qu'une référence
    // régénérée à tort ne passe pas inaperçue.

    it('la carte d’essai couvre les deux états dégradés de la date', () => {
        const tsv = exporteur.genererExport('alignement', 'tsv');
        // « Leçon nichée » a une semaine mais pas de rang ; « Récupération
        // libre » n'a ni l'une ni l'autre. Les deux doivent sortir.
        expect(tsv).toContain('Leçon nichée');
        expect(tsv).toContain('Récupération libre');
    });

    it('deux leçons partagent la semaine 3 avec des rangs différents', () => {
        // C'est le cas d'usage du lot A : sans rang, ces deux leçons étaient
        // indistinguables dans un calendrier.
        const plan = exporteur.construirePlan({ groupeCoursId: 'GC_MATIN' });
        const lecons = plan.sequences[0].lecons;
        expect(lecons.map((l) => [l.semaine, l.rangSeance])).toEqual([[3, 1], [3, 2]]);
    });

    it('la date dérivée suit le groupe demandé, et les références n’en portent AUCUNE', () => {
        const matin = exporteur.construirePlan({ groupeCoursId: 'GC_MATIN' });
        const soir = exporteur.construirePlan({ groupeCoursId: 'GC_SOIR' });

        expect(matin.sequences[0].lecons[0].date).toBe('2026-09-08');
        expect(soir.sequences[0].lecons[0].date).toBe('2026-09-09');

        // ⚠ Le Calendrier PORTE une colonne Date depuis le lot I — et pourtant
        // aucune référence n'en contient. Ce n'est pas une contradiction :
        // les sorties génériques sont générées SANS groupe désigné, la carte
        // d'essai a deux groupes, et l'export ne devine pas lequel (D9). Une
        // date qui apparaîtrait ici serait une date devinée.
        for (const { niveau, format } of SORTIES_GENERIQUES) {
            expect(exporteur.genererExport(niveau, format)).not.toContain('2026-09-08');
        }
    });
});
