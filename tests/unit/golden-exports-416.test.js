import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monterExportSandbox, SORTIES_USINE } from './_helpers/carte-essai-exports.js';

// =======================================================================
// GOLDEN MASTER DES SORTIES D'USINE (#416 lot G)
// =======================================================================
//
// Le lot G fond les préréglages dans les gabarits : Plan de cours, En classe,
// Preuve d'alignement et Personnalisé cessent d'être des « niveaux » pour
// devenir des listes de colonnes du générateur unique. C'est un refactor du
// SEUL générateur d'export de l'application.
//
// ⚠ SA PREUVE EST ICI, ET ELLE EST BIT-À-BIT. Si les quatre sorties d'usine
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

describe('Golden master · les sorties d’usine ne bougent pas d’un octet', () => {
    for (const { niveau, format } of SORTIES_USINE) {
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

    it('toutes les sorties d’usine sont couvertes — aucune n’échappe au filet', () => {
        // 3 documents × 3 formats, plus le Calendrier qui refuse le Texte.
        // ⚠ Le compte est passé de 12 à 11 au lot H : « personnalise » n'est
        // plus un niveau, son réglage a migré en gabarit nommé. Ce n'est pas
        // une couverture perdue, c'est un comportement retiré.
        expect(SORTIES_USINE).toHaveLength(11);
        expect(SORTIES_USINE.filter((s) => s.niveau === 'calendrier')).toHaveLength(2);
        expect(SORTIES_USINE.some((s) => s.niveau === 'personnalise')).toBe(false);
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
        // les sorties d'usine sont générées SANS groupe désigné, la carte
        // d'essai a deux groupes, et l'export ne devine pas lequel (D9). Une
        // date qui apparaîtrait ici serait une date devinée.
        for (const { niveau, format } of SORTIES_USINE) {
            expect(exporteur.genererExport(niveau, format)).not.toContain('2026-09-08');
        }
    });
});
