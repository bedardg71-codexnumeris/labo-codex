import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { chargerScript } from './_helpers/charger-script.js';
import { globauxIdentiteNaturelle } from './_helpers/identite-naturelle.js';
import { suitDansLaFonction } from './_helpers/tranche.js';

// =======================================================================
// SENTINELLE #455 — le cours est GLOBAL : son identité est le CODE seul
// =======================================================================
//
// Décision de Grégoire, 19 août 2026 : « le devis ministériel ne change pas
// d'un trimestre à l'autre — le cours est global ». Deux fichiers se
// contredisaient (constat Cowork du 12 août) : `planification-donnees.js`
// (#407) posait la fiche comme globale, `_tupleCoursNaturel` (#442) mettait
// SESSION+ANNÉE dans l'identité. Sous l'ancien tuple, un « 601-101 A2026 »
// entrait à côté du 601-101 existant : deux fiches pour la même chose, une
// carte rattachée à l'une ne voyait pas les groupes de l'autre (famille
// #346/#454).
//
// Ce qui est verrouillé ici :
//   A. LE cas de la décision : une fiche legacy au même code mais à la
//      session/année DIFFÉRENTE est écartée par la fusion (avant #455,
//      elle entrait — deux tuples distincts) ;
//   B. deux CODES différents entrent toujours (le garde ne mord pas le
//      cas légitime) ;
//   C. l'identité est insensible à la casse et aux espaces ;
//   D. une fiche sans code mais à id neuf entre toujours (legacy minimal) ;
//   E. `supprimerTrimestre` ne purge PLUS le magasin global `cours` par
//      `trimestreId` — ce nettoyage aurait détruit la fiche partagée que
//      les autres trimestres pointent (la fiche réelle porte
//      `trimestreId: "h2026"` et sert A26) ;
//   F. le prédicat de doublon de l'import de cours (`cours.js`) compare le
//      CODE seul, plus session/année ;
//   G. la création au formulaire (`sauvegarderCoursV2`) porte le garde
//      anti-seconde-fiche : détection + `confirm` explicite, jamais une
//      entrée silencieuse — et depuis CT-15 (23 août 2026) la DÉTECTION est
//      celle de `CoursEntite.chercherDoublonCode`, la même que l'entité
//      applique au point d'écriture, l'ÉDITION étant gardée elle aussi.
//
// `session`/`annee`/`trimestreId` restent sur les fiches legacy comme champs
// HISTORIQUES, non décisionnels — comme le préfixe d'un id (`h2026-…`).

function chargerModule(globauxSupp = {}) {
    return chargerScript('js/trimestre-v2-cours.js', {
        db: { getSync: (k, d) => d, setSync: () => {} },
        cle: (k) => k,
        toggleDisplay: () => {},
        // CT-15 : l'identité du cours vit désormais dans identite-naturelle.js.
        ...globauxIdentiteNaturelle(),
        ...globauxSupp
    });
}

function fusionner(coursExistants, listeCours) {
    const win = chargerModule();
    return win._fusionnerListeCoursDansCours(coursExistants, listeCours);
}

function sansCommentaires(chemin) {
    return readFileSync(new URL(`../../${chemin}`, import.meta.url), 'utf-8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');
}

// La fiche réelle : créée sous h2026, pointée par le groupe-cours A26.
const FICHE_H2026 = {
    id: 'h2026-601-101-MQ-00001',
    codeCours: '601-101-MQ',
    nomCours: 'Écriture et littérature',
    session: 'H',
    annee: 2026,
    trimestreId: 'h2026'
};

describe('#455 · le cours est global : identité = code seul', () => {

    it('A · le cas de la décision : un « 601-101 d\'automne » n\'entre PAS à côté du 601-101 existant', () => {
        const automne = {
            id: 'a2026-601-101-MQ-00001',
            codeCours: '601-101-MQ',
            session: 'A',
            annee: 2026
        };

        const { ajouts, doublonsTuple, collisionsId } = fusionner([FICHE_H2026], [automne]);

        // Avant #455, le tuple `601-101-MQ|A2026` différait de
        // `601-101-MQ|H2026` : la fiche entrait, et deux cours coexistaient
        // pour la même chose.
        expect(ajouts).toHaveLength(0);
        expect(collisionsId).toHaveLength(0);
        expect(doublonsTuple).toHaveLength(1);
        expect(doublonsTuple[0]).toMatchObject({
            legacyId: 'a2026-601-101-MQ-00001',
            v2Id: FICHE_H2026.id
        });
    });

    it('B · deux codes différents entrent toujours (le garde ne mord pas le légitime)', () => {
        const autreCours = { id: 'COURS_601_102', codeCours: '601-102-MQ', session: 'A', annee: 2026 };

        const { ajouts, doublonsTuple, collisionsId } = fusionner([FICHE_H2026], [autreCours]);

        expect(ajouts).toEqual([autreCours]);
        expect(doublonsTuple).toHaveLength(0);
        expect(collisionsId).toHaveLength(0);
    });

    it('C · l\'identité est insensible à la casse et aux espaces', () => {
        const memeCodeMalSaisi = { id: 'AUTRE_ID', codeCours: '  601-101-mq ' };

        const { ajouts, doublonsTuple } = fusionner([FICHE_H2026], [memeCodeMalSaisi]);

        expect(ajouts).toHaveLength(0);
        expect(doublonsTuple).toHaveLength(1);
    });

    it('D · une fiche sans code mais à id neuf entre toujours (legacy minimal)', () => {
        const sansCode = { id: 'LEGACY_SANS_CODE', titre: 'Vieille fiche' };

        const { ajouts } = fusionner([FICHE_H2026], [sansCode]);

        expect(ajouts).toEqual([sansCode]);
    });

    it('E · supprimerTrimestre ne purge plus le magasin global `cours` par trimestreId', () => {
        const source = sansCommentaires('js/trimestres.js');

        // Le prédicat exact du nettoyage retiré. S'il revient sous une autre
        // forme, la seconde assertion attrape toute réécriture du magasin
        // global depuis ce fichier.
        expect(source).not.toMatch(/\.trimestreId\s*!==/);
        expect(source).not.toMatch(/setSync\(\s*['"]cours['"]/);
    });

    it('F · l\'import de cours dédoublonne par code seul, plus par session/année', () => {
        const source = sansCommentaires('js/cours.js');

        // Le prédicat vivant. CT-15 (23 août) : ce n'est plus un `===` brut
        // sur `codeCours` — c'était précisément le trou, « 601-101-mq »
        // s'installait à côté de « 601-101-MQ ». L'import passe par la même
        // clé que le formulaire et que l'entité.
        expect(suitDansLaFonction(source, /trouverDoublonNaturel\(/, /cleNaturelleCours/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
        // …et plus AUCUNE comparaison de période dans un prédicat de doublon.
        expect(source).not.toMatch(/session\s*===\s*coursImporte\.session/);
        expect(source).not.toMatch(/annee\s*===\s*coursImporte\.annee/);
        // Ni retour au `===` brut, qui rouvrirait le trou de casse.
        expect(source).not.toMatch(/codeCours\s*===\s*coursImporte\.codeCours/);
    });

    it('G · la création au formulaire porte le garde anti-seconde-fiche (détection + confirm)', () => {
        const source = sansCommentaires('js/trimestre-v2-cours.js');

        // Corps de la fonction, ancré en début de ligne (leçon du 10 août :
        // tout motif de sentinelle s'ancre) jusqu'à sa fermeture en colonne 0.
        const corps = source.match(/^async function sauvegarderCoursV2[\s\S]*?\n\}/m);
        expect(corps).not.toBeNull();
        // CT-15 (23 août) : la DÉTECTION a déménagé dans `CoursEntite`, qui la
        // refait au point d'écriture. Le formulaire, lui, garde ce qu'il est
        // seul à pouvoir faire — POSER LA QUESTION.
        expect(corps[0]).toMatch(/CoursEntite\.chercherDoublonCode\(/);
        expect(corps[0]).toMatch(/confirm\(/);
        // Et l'édition est gardée elle aussi : renommer le code d'une fiche
        // pour lui donner celui d'une autre fabrique le même doublon.
        expect(corps[0]).toMatch(/exclureId:\s*coursEnEditionV2/);
    });
});
