import { describe, it, expect, beforeAll } from 'vitest';
import { monterExportSandbox } from './_helpers/carte-essai-exports.js';

// LE GABARIT GÉNÉRIQUE « CALENDRIER » (#416 lot I).
//
// Six colonnes — Semaine · Séance · Date · Contenu · Évaluations · Travail
// personnel — et une ligne par rencontre. C'est le déroulement que Grégoire
// tient déjà à la main, produit par l'application.
//
// ⚠ Ce n'est pas un quatrième NIVEAU : D4 déconseille d'aller au-delà de
// trois. C'est un GABARIT, le premier à se servir des trois axes à la fois
// (granularité « séance » × six colonnes × deux formats tabulaires).
//
// ⚠ La sixième colonne est arrivée VIDE — `metadata.horsClasse` n'existait
// pas — et le lot B l'a remplie le même jour. Ce que ce fichier vérifie
// maintenant, c'est l'absence de faux positif : la carte d'essai ne marque
// aucun nœud hors classe, la colonne doit donc rester vide. Son remplissage
// est couvert par `sentinelle-hors-classe-416`.

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

    it('TRAVAIL PERSONNEL reste vide tant qu’aucun nœud n’est marqué', () => {
        // ⚠ L'intitulé de ce cas disait « le lot B n'existe pas encore ». Il
        // existe depuis le 12 août : la colonne se remplit dès qu'un nœud
        // porte `metadata.horsClasse`. Ce qu'il vérifie maintenant, c'est
        // l'absence de FAUX POSITIF — la carte d'essai n'en marque aucun, la
        // colonne doit donc rester vide. Le remplissage est couvert par
        // `sentinelle-hors-classe-416`.
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
    it('le Markdown sort en SECTIONS, pas en tableau', () => {
        // ⚠ CE CAS DISAIT L'INVERSE JUSQU'AU 12 AOÛT. Le lot I produisait un
        // tableau Markdown ; verdict terrain : « pas vraiment utilisable
        // puisque les caractères | ne sont pas alignés ». Le vrai motif est
        // en dessous — Pages n'interprète pas le Markdown, donc aucun
        // alignement n'aurait produit un tableau à l'arrivée.
        const md = exporteur.genererExport('calendrier', 'markdown', null, AVEC_MATIN);

        expect(md).toContain('### Semaine 3');
        expect(md).toContain('- **Date** : 2026-09-08');
        expect(md).not.toContain('| --- |');
    });

    it('la PREMIÈRE colonne titre la section, les autres sont des champs', () => {
        // Règle explicite, pas devinette : l'utilisateur ordonne ses colonnes,
        // donc il choisit ce qui titre.
        const md = exporteur.genererExport('calendrier', 'markdown', null, AVEC_MATIN);
        const bloc = md.split('### ')[1];

        expect(bloc.startsWith('Semaine 3')).toBe(true);
        expect(bloc).toContain('- **Séance** : A');
    });

    it('une cellule VIDE est omise — un document n’a pas de colonnes à tenir', () => {
        const md = exporteur.genererExport('calendrier', 'markdown', null, AVEC_MATIN);

        // La semaine 5 n'a rien : elle garde sa section, avec une mention.
        expect(md).toContain('### Semaine 5');
        expect(md).toContain('- *(rien de prévu)*');
        // Aucun champ vide nulle part.
        expect(md).not.toMatch(/- \*\*[^*]+\*\* : *$/m);
    });

    it('les deux formats disent la MÊME chose, dans deux mises en forme', () => {
        const tsv = exporteur.genererExport('calendrier', 'tsv', null, AVEC_MATIN);
        const md = exporteur.genererExport('calendrier', 'markdown', null, AVEC_MATIN);

        // Une seule traversée de la carte, deux formateurs : autant de sections
        // que de lignes de données.
        const sections = (md.match(/^### /gm) || []).length;
        expect(sections).toBe(tsv.trim().split('\n').length - 1);
        expect(md).toContain('Exposé magistral sur le réalisme · Atelier d’analyse en équipe');
    });

    it('le format TEXTE est REFUSÉ, il ne sort pas un document dégradé', () => {
        // Un calendrier en texte suivi n'est que le tableau en moins lisible.
        expect(exporteur.genererExport('calendrier', 'texte', null, AVEC_MATIN)).toBeNull();
    });

    it('une barre verticale dans un titre n’a plus besoin d’être échappée', () => {
        // Le tableau Markdown l'exigeait — la barre y séparait les colonnes.
        // En sections, elle n'est qu'un caractère : l'échapper ajouterait une
        // contre-oblique dans le titre de Grégoire sans raison.
        const { carte, exporteur: exp } = monterExportSandbox();
        carte.etat.noeuds.get('act-2').titre = 'Pastiche | descriptif';

        const md = exp.genererExport('calendrier', 'markdown', null, AVEC_MATIN);

        expect(md).toContain('Pastiche | descriptif');
        expect(md).not.toContain('Pastiche \\| descriptif');
    });
});
