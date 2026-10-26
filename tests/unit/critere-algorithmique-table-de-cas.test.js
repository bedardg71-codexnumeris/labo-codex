// LA TABLE DE CAS, LOT 3a (26 octobre 2026) — l'étape « Cas d'interprétation », ses paliers et ce que
// l'application choisit seule. Consigne `plans de travail/CONSIGNE-LOT-2026-10-26-critere-algorithmique-table-de-cas-3a.md`
// (§ 7, la preuve exigée) ; ébauche validée `plans de travail/EBAUCHE-2026-10-26-table-de-cas.html`.
//
//   A. LA RÈGLE D'ÉGALITÉ du code le plus fréquent (Grégoire, 25 oct.) : un critère NEUF prend le premier de sa
//      liste, un critère existant garde la règle d'hier — aux deux sites (mode Catégories, « principalement ») ;
//   B. LES NOMS dans le préfixe « Tu fais en moyenne… » et dans la ligne « principalement » ; sans noms, la phrase
//      d'hier, à l'octet ;
//   C. « QUAND TOUT EST MAÎTRISÉ » d'un critère neuf, selon la marque, et par « Revenir au modèle » ;
//   D. FIXER UNE LIMITE sur un critère neuf : des champs vides (aucune copie n'atteint de palier), puis les
//      paliers du 25 oct. ; un critère existant reçoit ce que le menu lui donnait ;
//   E. RETIRER PUIS FIXER retrouve ce qui était écrit ; sous « aucune », rien n'est lu ; le transport l'accepte ;
//   F. LE SEUIL EN POURCENTAGE : la conversion, le geste (virgule, arrondi, refus sans écriture) ;
//   G. LE STOCK : ce que lisent six critères existants, comparé à l'octet au relevé fait sur `c07270a6` ;
//   H. LA SIMULATION : « Égalité », le code le plus fréquent de la copie, « Voir ce que l'étudiant·e lirait à ce
//      palier », les états des conditions, la valeur des blocs ; les mots de l'atelier, au présent ou au
//      conditionnel, sans « élève ».
//
// ⚠ LA MARQUE D'UN CRITÈRE NEUF est celle des noms (`nomsAttendus`, posée à la naissance depuis l'étape 2a), pas celle
// des codes que la consigne nommait : voir `projectionAlgo.estNeuf`. Le cas G.b le tient (un critère qui porte la
// seule marque des codes lit ce qu'il lisait).
//
// BREAK-TESTS (26 oct. 2026, chacun restauré, `shasum` identique avant/après) : listés en fin de fichier.

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chargerScript } from './_helpers/charger-script.js';
import { chargerRegistres, relever } from './_helpers/releve-table-de-cas.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);

// Les registres, le miroir, la palette et l'atelier dans UN même window (le miroir et l'atelier lisent par `window`).
const win = {};
['js/evaluation-enonces.js', 'js/evaluation-formules.js', 'js/evaluation-projection.js', 'js/codes-annotation.js',
    'js/palette-algo.js', 'js/miroir-algo.js', 'js/atelier-algo.js'].forEach((f) => chargerScript(f, {}, win));
const A = win.atelierAlgo, E = win.enoncesAlgo, P = win.projectionAlgo, C = win.codesAnnotation, PA = win.paletteAlgo, M = win.miroirAlgo;
const clone = (x) => JSON.parse(JSON.stringify(x));

// Deux disciplines fictives, dont une sans texte (principe du 21 oct.) : celles de l'ébauche.
const SC = [{ id: 's1', code: '1', nom: 'Unité absente', ponderation: 1 }, { id: 's2', code: '2', nom: 'Unité erronée', ponderation: 1 },
    { id: 's3', code: '3', nom: 'Chiffres significatifs', ponderation: 1 }];
const CALCULS = {
    id: 'CC', nom: 'Unités et calculs', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
    noms: { erreurs: { singulier: 'unité manquante', pluriel: 'unités manquantes' }, mots: { singulier: 'calcul', pluriel: 'calculs' } },
    sousCriteres: SC, modeleFormule: 'penalite_par_erreur', modeleProjection: 'aucune', paramsProjection: {}
};
const MOTS = {
    id: 'CM', nom: 'Langue écrite', type: 'algorithmique', ponderation: 20, nomsAttendus: true, codesSousCriteresSeulement: true,
    noms: { erreurs: { singulier: 'erreur', pluriel: 'erreurs' }, mots: { singulier: 'mot', pluriel: 'mots' } },
    sousCriteres: SC.map((s, i) => ({ ...s, nom: ['Syntaxe', 'Ponctuation', 'Lexique'][i] })),
    modeleFormule: 'penalite_normalisee', paramsFormule: { facteurNormalisation: 500 }, modeleProjection: 'aucune', paramsProjection: {}
};
/** Le même critère, mais d'avant : sans aucune marque. */
const existant = (c) => { const x = clone(c); delete x.nomsAttendus; delete x.codesSousCriteresSeulement; x.codesDepuisSousCriteres = true; return x; };
/** Un critère neuf dont la limite est fixée et réglée. */
const avecLimite = (c, l, t, service) => {
    const x = P.fixerLimite(clone(c));
    Object.assign(x.paramsProjection, { motsReference: l, erreursTolerees: t, nomServiceAide: service || '' });
    return x;
};

/* ============================================================ A — LA RÈGLE D'ÉGALITÉ */

describe('table de cas · A — à égalité, le premier de la liste pour un critère neuf, le premier posé pour un existant', () => {
    it('A.a `lePlusFrequent` : avec la liste, son premier parmi les égaux ; sans elle, le premier à atteindre le nombre', () => {
        const poses = ['3', '1', '3', '1'];
        expect(C.lePlusFrequent(poses, ['1', '2', '3'])).toMatchObject({ code: '1', max: 2 });
        expect(C.lePlusFrequent(poses, null)).toMatchObject({ code: '3', max: 2 });
        expect(C.lePlusFrequent(poses).egaux.sort()).toEqual(['1', '3']);
        // Sans égalité, les deux règles disent la même chose ; sans code, rien.
        expect(C.lePlusFrequent(['2', '1', '2'], ['1', '2']).code).toBe('2');
        expect(C.lePlusFrequent(['2', '1', '2']).code).toBe('2');
        expect(C.lePlusFrequent([], ['1'])).toBeNull();
        // « Premier à atteindre » n'est pas « premier posé » : 1 posé d'abord, mais 3 atteint 2 avant lui.
        expect(C.lePlusFrequent(['1', '3', '3', '1'])).toMatchObject({ code: '3' });
    });

    it('A.b le mode Catégories passe la liste des sous-critères pour un critère neuf, rien pour un existant', () => {
        const code = source('js/evaluation-calcul.js');
        expect(code).toContain('const { codeDominant, maxFreq } = _trouverCodeDominant(codesSousCriteres, _listeDesCodesSiNeuf(critereId, sousCriteres));');
        expect(code).toMatch(/function _listeDesCodesSiNeuf\(critereId, sousCriteres\) \{\n {4}const neuf = window\.enoncesAlgo && window\.enoncesAlgo\.estNeuf\(_critereEnoncesPour\(critereId\)\);\n {4}return neuf \? sousCriteres\.map\(s => s\.code\) : null;/);
        // Sans liste, la boucle d'hier, à l'identique.
        expect(code).toContain('if (liste && window.codesAnnotation && typeof window.codesAnnotation.lePlusFrequent === \'function\') {');
        expect(code).toContain('        if (frequences[code] > maxFreq) {\n            maxFreq = frequences[code];\n            codeDominant = code;');
    });

    it('A.c « principalement » : neuf, le premier de la liste ; existant, le premier compté parmi les égaux', () => {
        const S = chargerRegistres(path.join(racine, 'js')).syntheseRetroactionData;
        const stats = { erreursFr: { errfr_3: 2, errfr_1: 2 }, totalErreursFr: 4 };
        const ligne = (c) => S.construireFrancaisResume(clone(stats), { criteres: [c] }, null);
        expect(ligne(MOTS)).toBe('Langue écrite : 4 erreurs (principalement : Syntaxe)');
        expect(ligne(existant(MOTS))).toBe('Langue écrite : 4 erreurs (principalement : Lexique)');
    });
});

/* ============================================================ B — LES NOMS DANS DEUX PHRASES */

describe('table de cas · B — le préfixe et « principalement » dans les noms du critère ; sans noms, la phrase d\'hier', () => {
    it('B.a le préfixe : « 1 unité manquante à chaque 4 calculs » ; sans noms, « 1 erreur à chaque N mots », « 1 mots » compris', () => {
        const c = avecLimite(CALCULS, 12, 4);
        expect(P.calculer(c, { erreurs: 3, mots: 12 }).prefixe).toBe('Tu fais en moyenne 1 unité manquante à chaque 4 calculs.');
        expect(P.calculer(c, { erreurs: 12, mots: 12 }).prefixe).toBe('Tu fais en moyenne 1 unité manquante à chaque 1 calcul.');
        const hier = { type: 'algorithmique', nom: 'Langue' };
        expect(P.calculer(hier, { erreurs: 12, mots: 600 }).prefixe).toBe('Tu fais en moyenne 1 erreur à chaque 50 mots.');
        expect(P.calculer(hier, { erreurs: 600, mots: 600 }).prefixe).toBe('Tu fais en moyenne 1 erreur à chaque 1 mots.');
        // Un critère qui a écrit les noms du français lit la phrase d'hier, à l'octet.
        expect(P.calculer(avecLimite(MOTS, 900, 30), { erreurs: 600, mots: 600 }).prefixe).toBe('Tu fais en moyenne 1 erreur à chaque 1 mots.');
        // Un critère neuf sans ses noms : le repli, jamais « erreur ».
        const sansNoms = avecLimite({ ...CALCULS, noms: undefined }, 12, 4);
        expect(P.calculer(sansNoms, { erreurs: 3, mots: 12 }).prefixe).toBe('Tu fais en moyenne 1 élément relevé à chaque 4 éléments examinés.');
    });

    it('B.b le préfixe tombe selon les jetons de projection, pas selon les noms (décision du 4 sept.)', () => {
        const c = avecLimite(CALCULS, 12, 4);
        c.paliersProjection[4].texte = 'Trop de {nomErreurs} sur {mots} {nomMots}.';
        let x = P.calculer(c, { erreurs: 3, mots: 12 });
        expect(x.texte.startsWith('Tu fais en moyenne 1 unité manquante')).toBe(false);   // {mots} est un jeton de projection
        expect(x.texte).toContain('Trop de unités manquantes sur 12 calculs.');
        c.paliersProjection[4].texte = 'Trop de {nomErreurs}.';
        x = P.calculer(c, { erreurs: 3, mots: 12 });
        expect(x.texte).toBe('Tu fais en moyenne 1 unité manquante à chaque 4 calculs. Trop de unités manquantes. Il pourrait être utile de demander de l’aide.');
        expect(P.jetonsInconnus('{nomErreurs} {nomMots}')).toEqual([]);
    });

    it('B.c « principalement » : le nom accordé ; sans noms, « erreur(s) » d\'hier', () => {
        const S = chargerRegistres(path.join(racine, 'js')).syntheseRetroactionData;
        const st = (n) => ({ erreursFr: { errfr_2: n }, totalErreursFr: n });
        expect(S.construireFrancaisResume(st(3), { criteres: [CALCULS] }, null)).toBe('Unités et calculs : 3 unités manquantes (principalement : Unité erronée)');
        expect(S.construireFrancaisResume(st(1), { criteres: [CALCULS] }, null)).toBe('Unités et calculs : 1 unité manquante (principalement : Unité erronée)');
        const hier = { id: 'H', nom: 'Rédaction', type: 'algorithmique' };
        expect(S.construireFrancaisResume(st(3), { criteres: [hier] }, null)).toBe('Rédaction : 3 erreurs (principalement : Subordonnée employée seule)');
        expect(S.construireFrancaisResume(st(1), { criteres: [hier] }, null)).toBe('Rédaction : 1 erreur (principalement : Subordonnée employée seule)');
    });

    it('B.d la ligne de la limite dans les noms ; sans eux, celle d\'hier', () => {
        const c = avecLimite(CALCULS, 12, 4);
        expect(P.libelleSeuil(c, E.noms(c))).toBe('1 unité manquante à chaque 3 calculs (4 unités manquantes pour 12 calculs)');
        const hier = { type: 'algorithmique', nom: 'Langue' };
        expect(P.libelleSeuil(hier)).toBe('1 erreur à chaque 30 mots (30 erreurs pour 900 mots)');
        expect(P.libelleSeuil(hier, E.noms(hier))).toBe('1 erreur à chaque 30 mots (30 erreurs pour 900 mots)');
    });
});

/* ============================================================ C — QUAND TOUT EST MAÎTRISÉ */

describe('table de cas · C — « Quand tout est maîtrisé » d\'un critère neuf, et « Revenir au modèle »', () => {
    it('C.a selon la marque : « Tu pourrais encore raffiner : {critere} », sans point final ; un existant lit « Concentre-toi sur »', () => {
        expect(E.enonce(CALCULS, 'concentre', {})).toBe('Tu pourrais encore raffiner : Unités et calculs');
        expect(E.enonce(existant(CALCULS), 'concentre', {})).toBe('Concentre-toi sur Unités et calculs');
        // La seule marque des codes ne suffit pas (G.b) ; un critère qui s'appelle « Français » garde son modèle.
        expect(E.enonce({ ...existant(CALCULS), codesSousCriteresSeulement: true }, 'concentre', {})).toBe('Concentre-toi sur Unités et calculs');
        expect(E.enonce({ ...CALCULS, nom: 'Français écrit' }, 'concentre', {})).toBe('Concentre-toi sur la qualité du français');
        // Le défaut du modèle lui-même ne change pas.
        expect(E.enoncesParDefaut('generique').concentre).toBe('Concentre-toi sur {critere}');
    });

    it('C.b « Revenir au modèle » remet le texte du modèle de CE critère, sans rien écrire pour lui', async () => {
        const m = monter();
        m.win.tempCriteres = [{ ...clone(CALCULS), enonces: { concentre: 'Bravo.' } }, { ...existant(CALCULS), enonces: { concentre: 'Bravo.' } }];
        await m.win.revenirAuModeleEnonce('temp', 0, 'concentre');
        await m.win.revenirAuModeleEnonce('temp', 1, 'concentre');
        expect(m.win.tempCriteres[0].enonces).toBeUndefined();
        expect(m.win.tempCriteres[1].enonces).toBeUndefined();
        expect(E.enonce(m.win.tempCriteres[0], 'concentre', {})).toBe('Tu pourrais encore raffiner : Unités et calculs');
        expect(E.enonce(m.win.tempCriteres[1], 'concentre', {})).toBe('Concentre-toi sur Unités et calculs');
        expect(E.defautEnonce(CALCULS, 'concentre')).toBe('Tu pourrais encore raffiner : {critere}');
        // Les autres zones rédigées restent.
        m.win.tempCriteres = [{ ...clone(CALCULS), enonces: { concentre: 'Bravo.', priorite: 'À reprendre.' } }];
        await m.win.revenirAuModeleEnonce('temp', 0, 'concentre');
        expect(m.win.tempCriteres[0].enonces).toEqual({ priorite: 'À reprendre.' });
    });
});

/* ============================================================ D — FIXER UNE LIMITE */

describe('table de cas · D — un critère neuf fixe sa limite : des champs vides, puis les paliers du 25 octobre', () => {
    it('D.a les champs vides : ni 900, ni 30, ni « Centre d\'aide du collège » ; aucune copie n\'atteint de palier, pas même « Aucune occurrence »', () => {
        const c = P.fixerLimite(clone(CALCULS));
        expect(c.modeleProjection).toBe('norme_externe');
        expect(c.paramsProjection).toEqual({ nomServiceAide: '', libelleSignalement: '', lienServiceAide: '' });
        const p = P.normaliser(c);
        expect(p.params).toMatchObject({ motsReference: null, erreursTolerees: null, nomServiceAide: '' });
        for (const erreurs of [0, 1, 50]) expect(P.calculer(c, { erreurs, mots: 12 })).toMatchObject({ applicable: false, raison: 'limite-incomplete' });
        expect(P.libelleSeuil(c, E.noms(c))).toBe('');
        expect(P.limiteFixee(c)).toBe(true);
        expect(P.limiteComplete(c)).toBe(false);
        // Une seule des deux ne suffit pas ; les deux au-dessus de 0, les paliers s'appliquent.
        c.paramsProjection.motsReference = 12;
        expect(P.calculer(c, { erreurs: 0, mots: 12 }).raison).toBe('limite-incomplete');
        c.paramsProjection.erreursTolerees = 4;
        expect(P.calculer(c, { erreurs: 0, mots: 12 }).palier.libelle).toBe('Aucune occurrence');
    });

    it('D.b les paliers du 25 octobre, écrits sur le critère : noms, verdicts, aides, seuils 30-40-50-100 %', () => {
        const c = P.fixerLimite(clone(CALCULS));
        expect(c.paliersProjection.map((x) => [x.libelle, x.ratioMax, x.texte, x.texteAide])).toEqual([
            ['Aucune occurrence', null, 'C’est exceptionnel.', ''],
            ['Excellent', 0.3, 'Ce rapport est excellent.', ''],
            ['Très bien', 0.4, 'Ce rapport est très bien.', ''],
            ['Bien', 0.5, 'Ce rapport est bien.', ''],
            ['Risqué', 1, 'Ce rapport est risqué : il approche de la limite.', 'Il pourrait être utile de demander de l’aide : {service}.'],
            ['Au-delà', null, 'Ce rapport dépasse la limite fixée.', 'Il serait important de demander de l’aide : {service}.']
        ]);
        expect(c.paliersProjection[0].sansErreur).toBe(true);
        // Aucune discipline, aucun établissement.
        expect(JSON.stringify(c.paliersProjection.map((x) => [x.libelle, x.texte, x.texteAide]))).not.toMatch(/EUF|épreuve|français|Centre d'aide|erreur/i);
        // Avec un service, l'apposition le porte ; sans lui, la phrase s'arrête avant le deux-points.
        const x = avecLimite(CALCULS, 12, 4, 'Atelier des sciences');
        expect(P.calculer(x, { erreurs: 5, mots: 12 }).texte).toBe('Tu fais en moyenne 1 unité manquante à chaque 2 calculs. Ce rapport dépasse la limite fixée. Il serait important de demander de l’aide : Atelier des sciences.');
        expect(P.calculer(avecLimite(CALCULS, 12, 4), { erreurs: 0, mots: 12 }).texte).toBe('C’est exceptionnel.');
    });

    it('D.c un critère EXISTANT qui fixe sa limite reçoit ce que le menu lui donnait : 900, 30, le service, les paliers de migration', () => {
        const c = P.fixerLimite({ ...existant(CALCULS), modeleProjection: 'aucune', paramsProjection: {} });
        expect(c.paramsProjection).toMatchObject({ motsReference: 900, erreursTolerees: 30, nomServiceAide: 'Centre d\'aide du collège' });
        expect(c.paliersProjection).toBeUndefined();
        expect(P.normaliser(c).paliers).toEqual(P.paliersMigration());
    });

    it('D.d le geste (création) : « Fixer une limite » écrit, la table paraît avec des champs vides et la ligne qui le dit', async () => {
        const m = monter();
        m.win.tempCriteres = [clone(CALCULS)];
        m.win.afficherCriteresTemp();
        let html = m.liste().innerHTML;
        expect(html).toContain('Aucune limite fixée : l’étudiant·e ne lit aucun palier. C’est l’état d’un critère neuf.');
        expect(html).toContain('data-action="fixerLimiteAlgo" data-param="temp" data-param2="0"');
        await m.win.fixerLimiteAlgo('temp', 0);
        html = m.liste().innerHTML;
        expect(m.win.tempCriteres[0].paliersProjection).toHaveLength(6);
        expect(html).toMatch(/<input type="number" class="controle-form" inputmode="decimal" value="" [^>]*data-param-cle="motsReference" placeholder="ex. : 12"/);
        expect(html).toMatch(/value="" [^>]*data-param-cle="erreursTolerees"/);
        expect(html).toMatch(/<input type="text" class="controle-form" value="" [^>]*data-param-cle="nomServiceAide" placeholder="Aucun"/);
        expect(html).toContain('Écris la longueur de référence et la tolérance : les paliers s’appliquent dès que les deux dépassent 0.');
        expect(html).toContain('Longueur de référence (calculs)');
        expect(html).toContain('Tolérance sur cette longueur (unités manquantes)');
        expect(A.etapes(m.win.tempCriteres[0]).find((e) => e.id === 'paliers').reglee).toBe(false);
        // Un champ vidé reste vide : rien n'est écrit pour lui (pas de `null` qui voyage).
        m.win.modifierParamProjectionTempHandler({ value: '', dataset: { critereIndex: '0', paramCle: 'motsReference' } });
        expect('motsReference' in m.win.tempCriteres[0].paramsProjection).toBe(false);
        m.win.modifierParamProjectionTempHandler({ value: '12', dataset: { critereIndex: '0', paramCle: 'motsReference' } });
        m.win.modifierParamProjectionTempHandler({ value: '4', dataset: { critereIndex: '0', paramCle: 'erreursTolerees' } });
        expect(m.liste().innerHTML).toContain('Limite : 1 unité manquante à chaque 3 calculs (4 unités manquantes pour 12 calculs).');
    });
});

/* ============================================================ E — RETIRER PUIS FIXER */

describe('table de cas · E — « Retirer la limite » garde ce qui est écrit ; « Fixer une limite » le retrouve', () => {
    it('E.a un critère neuf réglé : retirer garde longueur, tolérance, service, signalement, lien, paliers ; fixer les retrouve', () => {
        const c = avecLimite(CALCULS, 12, 4, 'Atelier');
        c.paramsProjection.libelleSignalement = 'À revoir';
        c.paliersProjection[2].texte = 'Mon texte.';
        const avant = clone(c);
        P.retirerLimite(c);
        expect(c.modeleProjection).toBe('aucune');
        expect(c.paramsProjection).toEqual(avant.paramsProjection);
        expect(c.paliersProjection).toEqual(avant.paliersProjection);
        // Sous « aucune », rien n'est lu : ni paramètre, ni palier, ni phrase.
        expect(P.normaliser(c).params).toEqual({});
        expect(P.calculer(c, { erreurs: 3, mots: 12 })).toMatchObject({ applicable: false, raison: 'projection-desactivee' });
        expect(PA.aDesPaliers(c)).toBe(false);
        P.fixerLimite(c);
        expect(c).toEqual(avant);
    });

    it('E.b un critère existant (paliers lus, pas écrits) : retirer puis fixer retrouve ses réglages et ses paliers de migration', () => {
        const c = { id: 'X', nom: 'Langue', type: 'algorithmique', modeleProjection: 'norme_externe',
            paramsProjection: { motsReference: 600, erreursTolerees: 20, nomServiceAide: 'Atelier', libelleSignalement: '', lienServiceAide: '' } };
        const avant = clone(c);
        const phrase = P.calculer(c, { erreurs: 10, mots: 400 }).texte;
        P.fixerLimite(P.retirerLimite(c));
        expect(c).toEqual(avant);
        expect(P.calculer(c, { erreurs: 10, mots: 400 }).texte).toBe(phrase);
    });

    it('E.c les deux gestes (création) : rien ne part au retrait ; la grille d\'hier effaçait les paramètres, plus maintenant', async () => {
        const m = monter();
        m.win.tempCriteres = [avecLimite(CALCULS, 12, 4, 'Atelier')];
        const avant = clone(m.win.tempCriteres[0]);
        await m.win.retirerLimiteAlgo('temp', 0);
        expect(m.win.tempCriteres[0]).toEqual({ ...avant, modeleProjection: 'aucune' });
        expect(m.liste().innerHTML).toContain('data-action="fixerLimiteAlgo"');
        await m.win.fixerLimiteAlgo('temp', 0);
        expect(m.win.tempCriteres[0]).toEqual(avant);
    });

    it('E.d le transport accepte un critère à la limite retirée (paramètres et paliers gardés), et un critère neuf aux champs vides', () => {
        const winIE = chargerScript('js/import-export.js');
        const retire = P.retirerLimite(avecLimite(CALCULS, 12, 4, 'Atelier'));
        const vide = P.fixerLimite(clone(CALCULS));
        for (const c of [retire, vide]) {
            const g = winIE.assainirObjet({ id: 'G', nom: 'Grille', criteres: [clone(c)] }, winIE.SCHEMAS_IMPORT.grille);
            expect(g.criteres[0].modeleProjection).toBe(c.modeleProjection);
            expect(g.criteres[0].paramsProjection).toEqual(c.paramsProjection);
            expect(g.criteres[0].paliersProjection).toEqual(c.paliersProjection);
        }
        const db = { getSync: (k, d) => (d !== undefined ? d : null) };
        const w = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db }, w);
        chargerScript('js/partage-format.js', { db }, w);
        for (const c of [retire, vide]) {
            const grille = { id: 'GR_T', nom: 'Grille fictive', criteres: [clone(c)], dateCreation: '2026-10-26T00:00:00Z', dansBibliotheque: true,
                metadata_cc: { auteur_original: 'Banc 3a', licence: 'CC BY-NC-SA 4.0', contributeurs: [] } };
            const projete = w.partageFormat.projeterEntite(grille, 'grille');
            expect(projete.criteres[0].modeleProjection).toBe(c.modeleProjection);
            expect(projete.criteres[0].paliersProjection.length).toBe(6);
            const r = w.partageValidation.validerPackage({ format: 'labo-codex-partage-v1',
                manifest: { licence: 'CC BY-NC-SA 4.0', dateExport: '2026-10-26T12:00:00Z', auteur: { nom: 'Banc 3a' },
                    item_principal: { type: 'grille', id: 'GR_T' }, chaineAttribution: [], signature: null, clePublique: null, algorithme: null },
                entites: { grilles: [projete] }, references: [], medias: [] });
            expect(r.erreurs).toEqual([]);
            expect(r.valide).toBe(true);
        }
    });
});

/* ============================================================ F — LE SEUIL EN POURCENTAGE */

describe('table de cas · F — le seuil se règle en pourcentage de la limite, et s\'enregistre en ratio', () => {
    it('F.a la conversion : virgule ou point, arrondi au dixième ; ≤ 0 ou illisible, null', () => {
        expect(P.ratioDuPourcent('30')).toBe(0.3);
        expect(P.ratioDuPourcent('7,5')).toBe(0.075);
        expect(P.ratioDuPourcent(' 33,33 % ')).toBe(0.333);
        expect(P.ratioDuPourcent('100')).toBe(1);
        expect(P.ratioDuPourcent('150')).toBe(1.5);
        for (const x of ['0', '-3', '', 'abc', '3,4,5', null, '0,04']) expect(P.ratioDuPourcent(x), String(x)).toBeNull();
        expect(P.pourcentDuRatio(0.3)).toBe(30);
        expect(P.pourcentDuRatio(0.075)).toBe(7.5);
        expect(P.pourcentDuRatio(1)).toBe(100);
        expect(P.pourcentDuRatio(null)).toBeNull();
        // Aller-retour : les seuils de migration se relisent tels quels.
        for (const p of P.paliersMigration().filter((x) => x.ratioMax !== null)) expect(P.ratioDuPourcent(String(P.pourcentDuRatio(p.ratioMax)))).toBe(p.ratioMax);
    });

    it('F.b le geste : « 7,5 » écrit 0,075 ; « 0 », « -3 », « abc » ne écrivent rien ; la table montre « Jusqu\'à 30 % de la limite » et ce que ça vaut', () => {
        const m = monter();
        m.win.tempCriteres = [avecLimite(CALCULS, 12, 4)];
        const el = (value) => ({ value, type: 'text', dataset: { critereIndex: '0', palierIndex: '1', champ: 'seuilPourcent' } });
        m.win.modifierPalierProjectionTempHandler(el('7,5'));
        expect(m.win.tempCriteres[0].paliersProjection[1].ratioMax).toBe(0.075);
        const avant = clone(m.win.tempCriteres[0]);
        for (const v of ['0', '-3', 'abc', '']) {
            m.win.modifierPalierProjectionTempHandler(el(v));
            expect(m.win.tempCriteres[0], v).toEqual(avant);
        }
        m.win.modifierPalierProjectionTempHandler(el('30'));
        const html = m.liste().innerHTML;
        expect(html).toMatch(/<strong>Jusqu’à<\/strong>\s*<input type="text" inputmode="decimal" class="controle-form table-cas-seuil"[^>]*value="30"[^>]*data-champ="seuilPourcent"/);
        expect(html).toContain('soit au plus 1 unité manquante à chaque 10 calculs');
        expect(html).toContain('<strong>Rien de compté</strong><span class="table-cas-petit">0 unité manquante</span>');
        expect(html).toContain('plus de 4 unités manquantes pour 12 calculs');
    });

    it('F.c ajouter et retirer un palier : le palier neuf naît au-dessus du dernier seuil ; retirer l\'ôte du critère', () => {
        const m = monter();
        m.win.tempCriteres = [avecLimite(CALCULS, 12, 4)];
        m.win.ajouterPalierProjectionTemp(0);
        const p = P.normaliser(m.win.tempCriteres[0]).paliers;
        expect(p).toHaveLength(7);
        expect(p.map((x) => x.libelle)).toEqual(['Aucune occurrence', 'Excellent', 'Très bien', 'Bien', 'Risqué', 'Nouveau palier', 'Au-delà']);
        expect(p[5].ratioMax).toBe(1.1);
        m.win.supprimerPalierProjectionTemp(0, 5);
        expect(P.normaliser(m.win.tempCriteres[0]).paliers.map((x) => x.libelle)).toEqual(['Aucune occurrence', 'Excellent', 'Très bien', 'Bien', 'Risqué', 'Au-delà']);
    });
});

/* ============================================================ G — LE STOCK */

describe('table de cas · G — un critère existant lit ce qu\'il lisait, à l\'octet', () => {
    it('G.a six critères existants, 66 copies chacun : projection, énoncés, limite, « principalement » — égaux au relevé de c07270a6', () => {
        const avant = JSON.parse(source('tests/fixtures/table-de-cas-3a-avant.json'));
        const maintenant = relever(chargerRegistres(path.join(racine, 'js')));
        expect(Object.keys(maintenant)).toHaveLength(6);
        expect(maintenant).toEqual(avant);
    });

    it('G.b la seule marque des codes (née le 21 ou le 22 oct., avant celle des noms) ne fait pas un critère neuf', () => {
        const codesSeulement = { ...existant(CALCULS), codesSousCriteresSeulement: true, codesDepuisSousCriteres: undefined, noms: undefined };
        expect(P.estNeuf(codesSeulement)).toBe(false);
        expect(E.estNeuf(codesSeulement)).toBe(false);
        expect(E.enonce(codesSeulement, 'concentre', {})).toBe('Concentre-toi sur Unités et calculs');
        expect(P.fixerLimite({ ...codesSeulement }).paramsProjection.motsReference).toBe(900);
    });
});

/* ============================================================ H — LA SIMULATION */

describe('table de cas · H — la simulation de ce que l\'étudiant·e lirait', () => {
    it('H.a « Égalité » : deux codes posés deux fois chacun, le second de la liste posé le premier — seulement avec deux codes', () => {
        const eg = A.copiesDeReference(CALCULS).find((c) => c.cle === 'egalite');
        expect(eg).toMatchObject({ libelle: 'Égalité', erreurs: 4, erreursFormule: 4 });
        expect(eg.poses).toEqual(['errfr_2', 'errfr_1', 'errfr_2', 'errfr_1']);
        expect(eg.codes.map((c) => [c.code, c.nombre])).toEqual([['2', 2], ['1', 2]]);
        expect(A.copiesDeReference({ ...CALCULS, sousCriteres: SC.slice(0, 1) }).map((c) => c.cle)).not.toContain('egalite');
        expect(A.copiesDeReference({ id: 'H', nom: 'x', type: 'algorithmique', ponderation: 20 }).map((c) => c.cle)).not.toContain('egalite');
    });

    it('H.b le plus fréquent de la copie : neuf, le premier de la liste ; existant, le premier posé — et la ligne « principalement »', () => {
        const eg = (c) => A.copiesDeReference(c).find((x) => x.cle === 'egalite');
        const neuf = A.dominantDeLaCopie(CALCULS, eg(CALCULS));
        expect(neuf.code).toMatchObject({ code: '1', nom: 'Unité absente' });
        expect(neuf.egaux.map((x) => x.code)).toEqual(['2']);
        expect(neuf.liste).toBe(true);
        const ancien = existant(CALCULS);
        expect(A.dominantDeLaCopie(ancien, eg(ancien)).code.code).toBe('2');
        expect(A.lecture(CALCULS, eg(CALCULS)).recurrent).toBe('Unités et calculs : 4 unités manquantes (principalement : Unité absente)');
        expect(A.lecture(ancien, eg(ancien)).recurrent).toBe('Unités et calculs : 4 unités manquantes (principalement : Unité erronée)');
        // Une copie dont le compte est tapé ne dit pas l'ordre de ses codes : pas de « principalement ».
        expect(A.lecture(CALCULS, A.copieAvec(eg(CALCULS), { erreurs: 3 })).recurrent).toBe('Unités et calculs : 3 unités manquantes');
    });

    it('H.c « Voir ce que l\'étudiant·e lirait à ce palier » : une copie qui atteint chaque palier, par le calcul ; sans limite, rien', () => {
        const c = avecLimite(CALCULS, 12, 4, 'Atelier');
        const p = P.normaliser(c).paliers;
        p.forEach((pal, i) => {
            const r = A.copiePourPalier(c, { erreurs: 1, mots: 12 }, i);
            expect(r.raison, pal.libelle).toBe('');
            expect(P.calculer(c, { erreurs: r.copie.erreurs, mots: r.copie.mots }).palier.cle).toBe(pal.cle);
        });
        // Un seuil que le compte entier ne permet pas : l'étendue s'allonge.
        const fin = avecLimite(CALCULS, 12, 4);
        fin.paliersProjection.splice(2, 0, { cle: 'serre', libelle: 'Serré', ratioMax: 0.31, texte: 'Serré.', texteAide: '' });
        const i = P.normaliser(fin).paliers.findIndex((x) => x.cle === 'serre');
        const r = A.copiePourPalier(fin, { erreurs: 1, mots: 12 }, i);
        expect(r.copie.mots).toBeGreaterThan(12);
        expect(P.calculer(fin, r.copie).palier.cle).toBe('serre');
        expect(A.copiePourPalier(P.fixerLimite(clone(CALCULS)), {}, 1)).toEqual({ copie: null, raison: 'limite' });
        expect(A.copiePourPalier(CALCULS, {}, 0).raison).toBe('limite');
    });

    it('H.d les états des conditions, au conditionnel : défi, tout maîtrisé, aucune annotation, signalement', () => {
        const c = avecLimite(CALCULS, 12, 4, '');
        c.paramsProjection.libelleSignalement = 'Revoir les unités';
        c.paliersProjection[5].leveSignalement = true;
        const lire = (erreurs) => A.lecture(c, { erreurs, erreursFormule: erreurs, mots: 12, codes: [] });
        const beaucoup = lire(40);   // la note tombe à 0 (pénalité fixe), au-delà de la limite
        expect(beaucoup.etats).toEqual({ recurrent: 'oui', priorite: 'oui', concentre: 'depend', aucune: 'non', signalement: 'oui' });
        expect(beaucoup.signalement).toBe('Revoir les unités');
        expect(beaucoup.prioriteSuite).toBe(' (Unités et calculs : 40 unités manquantes sur 12 calculs, Incomplet)');
        expect(beaucoup.concentre + beaucoup.concentreSuite).toBe('Tu pourrais encore raffiner : Unités et calculs (40 unités manquantes).');
        expect(lire(0).etats).toEqual({ recurrent: 'non', priorite: 'non', concentre: 'non', aucune: 'oui', signalement: 'non' });
        expect(lire(1).etats.signalement).toBe('non');
        expect(A.TEXTES.apercu.etats).toEqual({ oui: 's’afficherait', non: 'ne s’afficherait pas', depend: 'dépendrait des autres critères' });
    });

    it('H.e la valeur de chaque bloc sur la copie fictive (« Après la flèche ») ; vide quand il n\'en a pas', () => {
        const c = avecLimite(CALCULS, 12, 4, 'Atelier');
        const v = A.valeursDesBlocs(c, { erreurs: 3, erreursFormule: 3, mots: 12 });
        expect(v).toMatchObject({ '{critere}': 'Unités et calculs', '{nomErreurs}': 'unités manquantes', '{nomMots}': 'calculs',
            '{erreurs}': '3', '{mots}': '12', '{points}': '', '{service}': 'Atelier', '{seuil}': '4', '{longueur}': '12',
            '{moyenne}': '4', '{palier}': 'Risqué' });
        const z = A.valeursDesBlocs(c, { erreurs: 0, erreursFormule: 0, mots: 12 });
        expect(z['{moyenne}']).toBe('');
        expect(z['{palier}']).toBe('Aucune occurrence');
        expect(A.valeursDesBlocs(CALCULS, { erreurs: 3, erreursFormule: 3, mots: 12 })['{service}']).toBe('');
        expect(PA.blocs(c).find((b) => b.jeton === '{moyenne}').nom).toBe('Moyenne de calculs par unité manquante');
    });

    it('H.f les mots de l\'atelier : la chaîne et ses cinq noms, au présent ou au conditionnel, jamais le futur ; « étudiant·e », jamais « élève »', () => {
        expect(A.etapes(CALCULS).map((e) => e.libelle)).toEqual(['Ce que tu relèves et comptes', 'Codes utilisés', 'Note calculée', 'Cas d’interprétation', 'Ce que l’étudiant·e lit']);
        const tous = [];
        const parcourir = (x) => {
            if (typeof x === 'string') tous.push(x);
            else if (typeof x === 'function') tous.push(String(x));
            else if (x && typeof x === 'object') Object.values(x).forEach(parcourir);
        };
        parcourir(A.TEXTES); parcourir(PA.TEXTES);
        const texte = tous.join(' ');
        expect(texte).not.toMatch(/élève/);
        expect(texte).not.toMatch(/\b(lira|liras|liront|sera|seront|paraîtra|paraîtront|verra|apparaîtra|affichera)\b/);
        expect(texte).toContain('Simulation de ce que l’étudiant·e lirait');
    });
});

/* ------------------------------------------------------------ le harnais de grilles.js */

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}
function monter() {
    const elements = {};
    const document = {
        activeElement: null,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: () => null, querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} },
        createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
    const store = {};
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
        modifier: async (k, mutateur, defaut) => { const r = await mutateur(k in store ? store[k] : defaut); if (r !== undefined) store[k] = r; return r; }
    };
    const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const globaux = {
        db, document, cle: (k) => 'a2026_' + k, echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: () => true,
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null, filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc', grilleTemplateActuelle: null
    };
    const w = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/grilles.js', globaux, w);
    Object.assign(w, { formulesAlgo: win.formulesAlgo, enoncesAlgo: E, projectionAlgo: P, codesAnnotation: C, atelierAlgo: A, paletteAlgo: PA });
    w.estRessourceSupprimee = () => false;
    w.IDS_GABARITS_HARDCODES = [];
    return { win: w, store, liste: () => document.getElementById('listeCriteres') };
}

// BREAK-TESTS (26 oct. 2026) — chaque mutation faite seule, puis restaurée (`shasum` identique avant/après ; le
// script de la session a fait les douze à la suite) ; ce qui rougit, mesuré :
//   · `lePlusFrequent` ignore la liste (rend toujours le premier à atteindre)          → A.a, H.b ;
//   · `codePrincipal` (la ligne « principalement ») ignore la liste                    → A.c ;
//   · `prefixeMoyenne` sans le test « noms du français » (accorde toujours)             → B.a (« 1 mots » d'hier) ;
//   · `construireFrancaisResume` qui écrit toujours `${total} erreur(s)`               → B.c ;
//   · `_enoncesParDefautDe` qui lit la marque des codes au lieu de celle des noms       → C.a, G.a, G.b ;
//   · `revenirAuModeleEnonce` qui écrit le défaut du modèle générique (pas du critère)  → C.b ;
//   · `fixerLimite` sans le chemin du critère neuf (les défauts 900 / 30)               → B.b, D.a, D.b, D.d, E.a, E.d, F.c, H.c, H.d, H.e ;
//   · `calculer` sans la garde `limite-incomplete`                                     → D.a ;
//   · `retirerLimite` par `appliquerAuCritere(…, 'aucune')` (ce que faisait le menu)    → E.a, E.b, E.c, E.d ;
//   · `ratioDuPourcent` sans le refus de ≤ 0                                           → F.a, F.b ;
//   · `_copieEgalite` qui pose le premier de la liste d'abord                           → H.a, H.b ;
//   · `copiePourPalier` sans l'allongement de l'étendue                                 → H.c.
