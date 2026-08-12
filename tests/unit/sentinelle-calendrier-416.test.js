import { describe, it, expect, beforeAll } from 'vitest';
import { monterExportSandbox } from './_helpers/carte-essai-exports.js';

// LE GABARIT D'USINE « CALENDRIER » (#416 lot I).
//
// Six colonnes — Semaine · Séance · Date · Contenu · Évaluations · Travail
// personnel — et une ligne par rencontre. C'est le déroulement que Grégoire
// tient déjà à la main, produit par l'application.
//
// ⚠ Ce n'est pas un quatrième NIVEAU : D4 déconseille d'aller au-delà de
// trois. C'est un GABARIT, le premier à se servir des trois axes à la fois
// (granularité « séance » × six colonnes × deux formats tabulaires).
//
// ⚠ La sixième colonne sort VIDE tant que le lot B n'existe pas. C'est un
// compromis arbitré le 12 août, pas un défaut : les cas ci-dessous le figent
// pour qu'il se voie, et pour que le jour où elle se remplit, quelqu'un
// décide au lieu de constater.

let exporteur;

beforeAll(() => { exporteur = monterExportSandbox().exporteur; });

function lignesTSV(tsv) {
    return tsv.replace(/\n$/, '').split('\n').map(function(l) { return l.split('\t'); });
}

const AVEC_MATIN = { groupeCoursId: 'GC_MATIN' };

describe('Les six colonnes (#416 lot I)', () => {
    it('l’en-tête est exactement celui du déroulement tenu à la main', () => {
        const entete = exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN).split('\n')[0];
        expect(entete.split('\t')).toEqual([
            'Semaine', 'Séance', 'Date', 'Contenu', 'Évaluations', 'Travail personnel'
        ]);
    });

    it('CONTENU dit ce qui se PASSE, jamais le nom de la production rattachée', () => {
        // « Pastiche descriptif » est rattaché au « Quiz de lecture » par
        // l'Organisateur. Annoncer le quiz dans la colonne Contenu ferait
        // croire à l'étudiant qu'il vient passer un quiz — il vient écrire.
        const table = lignesTSV(exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN));
        const ligne = table.find(function(l) { return l[1] === 'B'; });

        expect(ligne[3]).toBe('Pastiche descriptif');
        expect(ligne[3]).not.toContain('Quiz de lecture');
    });

    it('ÉVALUATIONS dit le nom de la PRODUCTION, celui que l’étudiant reconnaît', () => {
        const table = lignesTSV(exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN));
        const ligne = table.find(function(l) { return l[1] === 'A' && l[0] === '3'; });

        expect(ligne[4]).toBe('Dissertation critique');
    });

    it('TRAVAIL PERSONNEL sort vide — le lot B n’existe pas encore', () => {
        const table = lignesTSV(exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN));
        expect(table.slice(1).every(function(l) { return l[5] === ''; })).toBe(true);
    });

    it('la date et le rang sortent, et suivent le groupe demandé', () => {
        const matin = lignesTSV(exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN));
        const soir = lignesTSV(exporteur.genererExport('calendrier', 'tsv', null, { groupeCoursId: 'GC_SOIR' }));

        expect(matin[1].slice(0, 3)).toEqual(['3', 'A', '2026-09-08']);
        expect(soir[1].slice(0, 3)).toEqual(['3', 'A', '2026-09-09']);
    });
});

describe('Ce qui a une ligne, et ce qui n’en a pas (#416 lot I)', () => {
    it('une semaine sans rien de prévu GARDE sa ligne', () => {
        // « Semaine 5, rien de prévu » est une information qu'un enseignant
        // veut voir. La retirer masquerait du travail non planifié.
        const table = lignesTSV(exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN));
        const semaine5 = table.find(function(l) { return l[0] === '5'; });

        expect(semaine5).toBeDefined();
        expect(semaine5.slice(1)).toEqual(['', '', '', '', '']);
    });

    it('une ligne ENTIÈREMENT vide est retirée — c’est un artefact, pas une info', () => {
        // « Récupération libre » n'a ni semaine, ni rang, ni contenu : dans un
        // calendrier à six colonnes elle sort en six cellules vides.
        const table = lignesTSV(exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN));
        const vides = table.slice(1).filter(function(l) {
            return l.every(function(c) { return c === ''; });
        });

        expect(vides).toHaveLength(0);
    });

    it('la leçon ainsi retirée existe bel et bien ailleurs', () => {
        // Sinon le cas précédent passerait pour une raison qui n'est pas la
        // bonne — et on aurait masqué une leçon sans s'en apercevoir.
        expect(exporteur.genererExport('alignement', 'tsv')).toContain('Récupération libre');
    });

    it('ce qui n’est pas une rencontre n’a pas de ligne', () => {
        const tsv = exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN);
        expect(tsv).not.toContain('Lecture obligatoire du recueil');
        expect(tsv).not.toContain('Le narrateur omniscient');
    });
});

describe('Les deux formats, et celui qui est refusé (#416 lot I)', () => {
    it('le Markdown sort en TABLEAU, pas en sections', () => {
        const md = exporteur.genererExport('calendrier', 'markdown', null, AVEC_MATIN);
        const lignes = md.split('\n');

        expect(lignes[0]).toBe('| Semaine | Séance | Date | Contenu | Évaluations | Travail personnel |');
        expect(lignes[1]).toBe('| --- | --- | --- | --- | --- | --- |');
        expect(md).not.toContain('### ');
    });

    it('les deux formats disent la MÊME chose, dans deux mises en forme', () => {
        const tsv = exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN);
        const md = exporteur.genererExport('calendrier', 'markdown', null, AVEC_MATIN);

        // Une seule traversée de la carte, deux formateurs : le nombre de
        // lignes doit coïncider (au trait de séparation Markdown près).
        expect(md.trim().split('\n').length).toBe(tsv.trim().split('\n').length + 1);
        expect(md).toContain('Exposé magistral sur le réalisme · Atelier d’analyse en équipe');
    });

    it('le format TEXTE est REFUSÉ, il ne sort pas un document dégradé', () => {
        // Un calendrier en texte suivi n'est que le tableau en moins lisible.
        expect(exporteur.genererExport('calendrier', 'texte', null, AVEC_MATIN)).toBeNull();
    });

    it('une barre verticale dans un titre n’ouvre pas une colonne de plus', () => {
        const { carte, exporteur: exp } = monterExportSandbox();
        const n = carte.etat.noeuds.get('act-2');
        n.titre = 'Pastiche | descriptif';

        const md = exp.genererExport('calendrier', 'markdown', null, AVEC_MATIN);
        const ligne = md.split('\n').find(function(l) { return l.includes('Pastiche'); });

        expect(ligne).toContain('Pastiche \\| descriptif');
        // Six colonnes : sept barres, pas huit.
        expect((ligne.match(/(?<!\\)\|/g) || []).length).toBe(7);
    });
});
