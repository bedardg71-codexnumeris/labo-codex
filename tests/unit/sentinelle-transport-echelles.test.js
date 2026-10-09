import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle TRANSPORT DES ÉCHELLES (28 août 2026) — LA JUMELLE DE #511.
//
// `SCHEMAS_IMPORT` est une LISTE BLANCHE : une clé qui n'y figure pas n'est pas
// signalée, elle disparaît. #511 a posé ce filet pour les PRODUCTIONS après que
// tout leur contenu pédagogique eut voyagé vide pendant des mois. L'audit du
// 28 août (`Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md`) a trouvé le
// même trou, béant, sur les ÉCHELLES : `executerImportSelectif` perdait
//   · `seuilSuffisance` et `seuilMaitrise` — les deux repères de #555 lot 1 ;
//   · `config` — dont le seuil de réussite, imprimé sur trois PDF ;
//   · `niveaux[].valeurCalcul` — d'où un repli `(min + max) / 2` silencieux,
//     c'est-à-dire des notes calculées avec des valeurs jamais choisies ;
//   · `niveaux[].niveauSOLO` et `pratiquesCompatibles`.
//
// ⚠ CE QUI REND LE FILET NÉCESSAIRE, ET QUI EST LA VRAIE LEÇON : allonger la
// liste ne suffit pas. Le champ métier suivant sera oublié de la même façon,
// par quelqu'un qui n'aura aucune raison de penser à ce fichier en éditant
// `echelles.js`. Ce banc fait ROUGIR cet oubli au lieu de le laisser manger la
// donnée.
//
// Ce qu'il tient :
//   AA — la COUTURE côté ÉCHELLE, en ratchet : toute clé posée par la liste
//        blanche de `dupliquerEchelle` est transportée, ou inscrite avec sa raison.
//   AB — la COUTURE côté NIVEAU : idem depuis `niveauxDefaut`, la forme canonique.
//   AC — le contenu survit vraiment au passage (comportemental).
//   AD — et l'assainissement continue de mordre sur ces nouveaux champs.

let win;
beforeEach(() => { win = chargerScript('js/import-export.js'); });

/** Retire commentaires de bloc et de fin de ligne : une clé citée dans une
 *  phrase n'est pas une clé écrite (leçon des assertions statiques du projet). */
function sansCommentaires(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .map(l => l.replace(/\/\/.*$/, ''))
        .join('\n');
}

/**
 * Clés de PREMIER NIVEAU d'un littéral d'objet.
 *
 * ⚠ La profondeur se suit aux accolades, pas à l'indentation : les deux
 * littéraux d'échelle du module ne sont pas indentés pareil (l'un est dans un
 * `if`), et une extraction indentée sur l'un raterait l'autre en silence.
 * Sans ce comptage, `metadata_cc: { auteur_original: … }` ferait passer
 * `auteur_original` pour une clé d'ÉCHELLE, et le ratchet réclamerait son
 * transport au premier niveau — un faux rouge qu'on aurait « corrigé » en
 * élargissant le schéma pour rien.
 */
/**
 * Aplatit les spreads conditionnels d'un littéral : `...(x ? { k: v } : {})`
 * pose une clé de PREMIER niveau, mais l'écrit sous deux accolades de plus.
 *
 * ⚠ C'est la forme qu'emploient précisément les deux repères de #555 dans
 * `dupliquerEchelle` — les clés que ce banc existe pour surveiller. Sans cet
 * aplatissement, le ratchet ne les voyait pas et restait vert en les laissant
 * tomber du schéma : une sentinelle qui garde tout SAUF ce qui l'a motivée.
 * C'est la garde de validité AA.a qui l'a attrapé, pas la relecture.
 */
function aplatirSpreadsConditionnels(corps) {
    return corps.replace(/\.\.\.\([^{}]*\?\s*\{([^{}]*)\}\s*:\s*\{\}\)/g, '$1');
}

function clesDuLitteral(corps, profondeurCible = 1) {
    const cles = new Set();
    let profondeur = 0;
    let motCourant = '';
    for (const c of corps) {
        if (c === '{' || c === '[' || c === '(') { profondeur++; motCourant = ''; continue; }
        if (c === '}' || c === ']' || c === ')') { profondeur--; motCourant = ''; continue; }
        if (/[A-Za-z0-9_$]/.test(c)) { motCourant += c; continue; }
        if (c === ':' && profondeur === profondeurCible && /^[A-Za-z_$]/.test(motCourant)) {
            cles.add(motCourant);
        }
        // Un espace ou une tabulation sépare le mot du « : » sans le rompre
        // (`nom : valeur`) ; tout le reste, saut de ligne compris, le rompt.
        if (c !== ' ' && c !== '\t') motCourant = '';
    }
    return cles;
}

/* ------------------------------------------- AA — la couture, côté échelle */

/**
 * Les clés que `dupliquerEchelle` pose sur la copie écrite en base. Ce littéral
 * est LA référence des champs métier d'une échelle : son propre commentaire le
 * dit (« TOUT CHAMP MÉTIER AJOUTÉ À UNE ÉCHELLE DOIT ÊTRE AJOUTÉ ICI »), parce
 * qu'il est une liste blanche délibérée — un spread emporterait `idOriginal` et
 * la copie répondrait à l'identifiant de sa source (#542).
 */
function clesEcritesParLaDuplication() {
    const source = readFileSync(path.join(racineProjet, 'js', 'echelles.js'), 'utf8');
    const debut = source.indexOf('async function dupliquerEchelle(');
    expect(debut, 'dupliquerEchelle introuvable — le banc a perdu sa cible').toBeGreaterThan(-1);

    const ancre = source.indexOf('const nouvelleEchelle = {', debut);
    expect(ancre, 'le littéral de la copie a changé de forme — le banc a perdu sa cible').toBeGreaterThan(-1);
    const fin = source.indexOf('\n    };', ancre);
    expect(fin, 'fin du littéral introuvable').toBeGreaterThan(ancre);

    return clesDuLitteral(aplatirSpreadsConditionnels(sansCommentaires(source.slice(ancre, fin))));
}

/**
 * La SECONDE source d'échelles neuves : `sauvegarderEchelleComplete`.
 *
 * ⚠ Pourquoi deux sources et pas une. Le ratchet a d'abord été branché sur la
 * seule liste blanche de `dupliquerEchelle` — celle que le code désigne comme la
 * référence des champs métier. Un break-test a montré que ça ne suffit pas :
 * retirer `pratiquesCompatibles` du schéma ne faisait rougir QUE le cas
 * comportemental, parce que ce champ-là n'est posé que par cette fonction-ci.
 * Une source unique laissait donc une famille entière de champs hors du ratchet.
 */
function clesEcritesParLaCreationComplete() {
    const source = readFileSync(path.join(racineProjet, 'js', 'echelles.js'), 'utf8');
    const debut = source.indexOf('async function sauvegarderEchelleComplete(');
    expect(debut, 'sauvegarderEchelleComplete introuvable — le banc a perdu sa cible').toBeGreaterThan(-1);

    const ancre = source.indexOf('const nouvelleEchelle = {', debut);
    expect(ancre, 'le littéral de création a changé de forme').toBeGreaterThan(-1);
    const fin = source.indexOf('\n        };', ancre);
    expect(fin, 'fin du littéral introuvable').toBeGreaterThan(ancre);

    return clesDuLitteral(aplatirSpreadsConditionnels(sansCommentaires(source.slice(ancre, fin))));
}

describe('transport des échelles · AA — aucune clé d\'échelle ne se perd en silence', () => {
    it('AA.a le banc voit bien les clés de la copie (garde de validité)', () => {
        const cles = clesEcritesParLaDuplication();
        // Sans cette garde, une regex devenue muette rendrait un ensemble vide
        // et le ratchet passerait sans rien vérifier — le défaut trouvé sur la
        // sentinelle #506, et redit par #511.
        expect(cles.size).toBeGreaterThan(9);
        ['id', 'nom', 'niveaux', 'config', 'seuilSuffisance', 'seuilMaitrise']
            .forEach(c => expect(cles, `« ${c} » doit être vue par le banc`).toContain(c));

        const clesCreation = clesEcritesParLaCreationComplete();
        expect(clesCreation.size).toBeGreaterThan(5);
        // ⚠ 3 sept. 2026 (volet C, cases « Pratiques compatibles » retirées) : une
        // échelle NEUVE ne porte plus `pratiquesCompatibles` — la clé ne se saisit
        // plus, elle ne se supprime d'aucune donnée. Son transport reste éprouvé
        // plus bas, sur une échelle STOCKÉE qui la porte (AB, ['STD', 'SPE']).
        expect(clesCreation, 'une échelle neuve n\'écrit plus la clé').not.toContain('pratiquesCompatibles');
        ['discipline', 'metadata_cc']
            .forEach(c => expect(clesCreation, `« ${c} » doit être vue par le banc`).toContain(c));
        // `metadata_cc` est un objet : ses clés internes ne sont PAS des clés
        // d'échelle, et le ratchet ne doit pas réclamer leur transport.
        expect(clesCreation, 'clé interne de metadata_cc prise pour une clé d\'échelle')
            .not.toContain('auteur_original');
    });

    it('AA.b LE CAS QUI PORTE LE SENS : chaque clé écrite peut voyager', () => {
        const cles = new Set([
            ...clesEcritesParLaDuplication(),
            ...clesEcritesParLaCreationComplete()
        ]);
        const transportees = Object.keys(win.SCHEMAS_IMPORT.echelle);
        const exclues = Object.keys(win.CLES_ECHELLE_NON_TRANSPORTEES);

        const orphelines = [...cles].filter(c => !transportees.includes(c) && !exclues.includes(c));
        expect(orphelines,
            'clés posées par dupliquerEchelle ou sauvegarderEchelleComplete, '
            + 'ni transportées ni exclues : '
            + 'les ajouter à SCHEMAS_IMPORT.echelle, ou à CLES_ECHELLE_NON_TRANSPORTEES avec leur raison'
        ).toEqual([]);
    });

    it('AA.c une exclusion sans raison écrite n\'en est pas une', () => {
        Object.entries(win.CLES_ECHELLE_NON_TRANSPORTEES).forEach(([cle, raison]) => {
            expect(typeof raison, `« ${cle} » doit porter sa raison`).toBe('string');
            expect(raison.length, `la raison de « ${cle} » est trop courte pour en être une`).toBeGreaterThan(20);
        });
    });
});

/* --------------------------------------------- AB — la couture, côté niveau */

/**
 * La forme canonique d'un NIVEAU, telle que le module la pose : `niveauxDefaut`
 * (`echelles.js`). C'est elle que l'éditeur reproduit champ par champ.
 */
function clesCanoniquesDUnNiveau() {
    const source = readFileSync(path.join(racineProjet, 'js', 'echelles.js'), 'utf8');
    const ancre = source.indexOf('const niveauxDefaut = [');
    expect(ancre, 'niveauxDefaut introuvable — le banc a perdu sa cible').toBeGreaterThan(-1);
    const fin = source.indexOf('\n];', ancre);
    expect(fin, 'fin de niveauxDefaut introuvable').toBeGreaterThan(ancre);

    return clesDuLitteral(sansCommentaires(source.slice(ancre, fin)), 2);
}

describe('transport des échelles · AB — un niveau ne voyage pas amputé', () => {
    it('AB.a le banc voit bien les clés d\'un niveau (garde de validité)', () => {
        const cles = clesCanoniquesDUnNiveau();
        expect(cles.size).toBeGreaterThan(6);
        ['code', 'nom', 'min', 'max', 'valeurCalcul', 'niveauSOLO']
            .forEach(c => expect(cles, `« ${c} » doit être vue par le banc`).toContain(c));
    });

    it('AB.b chaque clé canonique d\'un niveau est transportée', () => {
        const cles = clesCanoniquesDUnNiveau();
        const transportees = Object.keys(win.SCHEMAS_IMPORT.echelle.niveaux.schema);
        const orphelines = [...cles].filter(c => !transportees.includes(c));
        expect(orphelines,
            'clés de niveau écrites par echelles.js mais absentes de '
            + 'SCHEMAS_IMPORT.echelle.niveaux.schema — elles disparaissent à l\'import'
        ).toEqual([]);
    });
});

/* ------------------------------- AC — le contenu survit vraiment au transport */

const ECHELLE_COMPLETE = {
    id: 'ECH_1',
    nom: 'IDME du cours',
    niveaux: [
        { code: 'I', nom: 'Incomplet', description: 'Unistructurel', niveauSOLO: 'unistructurel', min: 0, max: 64.99, valeurCalcul: 32, couleur: '#dc3545' },
        { code: 'D', nom: 'en Développement', description: 'Multistructurel', niveauSOLO: 'multistructurel', min: 65, max: 74.99, valeurCalcul: 69.5, couleur: '#fd7e14' },
        { code: 'M', nom: 'Maîtrisé', description: 'Relationnel', niveauSOLO: 'relationnel', min: 75, max: 84.99, valeurCalcul: 79.5, couleur: '#28a745' },
        { code: 'E', nom: 'Étendu', description: 'Abstrait étendu', niveauSOLO: 'abstrait_etendu', min: 85, max: 100, valeurCalcul: 92.5, couleur: '#007bff' }
    ],
    seuilSuffisance: 'D',
    seuilMaitrise: 'M',
    config: { typeEchelle: 'lettres', seuilReussite: 60, notePassage: 'D', codesPersonnalises: '' },
    pratiquesCompatibles: ['STD', 'SPE'],
    dansBibliotheque: true
};

describe('transport des échelles · AC — importer une échelle ne l\'ampute plus', () => {
    it('AC.a LE CAS DE #555 : les deux repères de maîtrise survivent', () => {
        const apres = win.assainirObjet(ECHELLE_COMPLETE, win.SCHEMAS_IMPORT.echelle);
        expect(apres.seuilSuffisance).toBe('D');
        expect(apres.seuilMaitrise).toBe('M');
    });

    it('AC.b LE CAS QUI TOUCHE LES NOTES : valeurCalcul survit, sur TOUS les niveaux', () => {
        const apres = win.assainirObjet(ECHELLE_COMPLETE, win.SCHEMAS_IMPORT.echelle);
        expect(apres.niveaux.map(n => n.valeurCalcul)).toEqual([32, 69.5, 79.5, 92.5]);
        // Le repli `(min + max) / 2` aurait rendu 32.495, 69.995, 79.995, 92.5 :
        // le DERNIER niveau coïncide. Un banc qui ne regarderait que lui serait
        // vert sur une échelle amputée.
        expect(apres.niveaux[0].valeurCalcul).not.toBe((0 + 64.99) / 2);
    });

    it('AC.c l\'étiquette SOLO et la configuration suivent', () => {
        const apres = win.assainirObjet(ECHELLE_COMPLETE, win.SCHEMAS_IMPORT.echelle);
        expect(apres.niveaux.map(n => n.niveauSOLO))
            .toEqual(['unistructurel', 'multistructurel', 'relationnel', 'abstrait_etendu']);
        expect(apres.config).toEqual({
            typeEchelle: 'lettres', seuilReussite: 60, notePassage: 'D', codesPersonnalises: ''
        });
        expect(apres.pratiquesCompatibles).toEqual(['STD', 'SPE']);
    });

    it('AC.d une échelle SANS repères n\'en fabrique pas', () => {
        const sansReperes = { ...ECHELLE_COMPLETE };
        delete sansReperes.seuilSuffisance;
        delete sansReperes.seuilMaitrise;
        const apres = win.assainirObjet(sansReperes, win.SCHEMAS_IMPORT.echelle);
        // Une clé présente et vide se lit « défini », et c'est faux : c'est la
        // règle que `modifierRepereEchelle` applique en base (echelles.js).
        expect('seuilSuffisance' in apres).toBe(false);
        expect('seuilMaitrise' in apres).toBe(false);
    });
});

/* --------------------------------- AD — l'assainissement mord sur ces champs */

describe('transport des échelles · AD — élargir la liste n\'ouvre pas une porte', () => {
    it('AD.a un repère porteur de balise est assaini, pas recopié', () => {
        // Charge courte : la charge longue, qu'une troncature couperait en deux,
        // est tenue par `sentinelle-585-assainir-avant-de-tronquer.test.js`
        // (#585, corrigé le 9 oct. 2026 : les balises partent avant la
        // troncature ; constat d'origine au §12 de
        // `Rapports/AUDIT-copies-echelle-reperes-2026-08-28.md`).
        const hostile = { ...ECHELLE_COMPLETE, seuilMaitrise: '<b>M</b>' };
        const apres = win.assainirObjet(hostile, win.SCHEMAS_IMPORT.echelle);
        expect(apres.seuilMaitrise).not.toContain('<');
        expect(apres.seuilMaitrise).toBe('M');
    });

    it('AD.b les chaînes de config et de niveau sont assainies aussi', () => {
        const hostile = {
            ...ECHELLE_COMPLETE,
            config: { ...ECHELLE_COMPLETE.config, codesPersonnalises: '<script>alert(1)</script>I,D' },
            niveaux: [{ ...ECHELLE_COMPLETE.niveaux[0], niveauSOLO: '<b>unistructurel</b>' }]
        };
        const apres = win.assainirObjet(hostile, win.SCHEMAS_IMPORT.echelle);
        expect(apres.config.codesPersonnalises).toBe('alert(1)I,D');
        expect(apres.niveaux[0].niveauSOLO).toBe('unistructurel');
    });

    it('AD.c un type inattendu ne passe pas pour une valeur', () => {
        const hostile = { ...ECHELLE_COMPLETE, seuilMaitrise: { toString: () => 'M' } };
        const apres = win.assainirObjet(hostile, win.SCHEMAS_IMPORT.echelle);
        expect(apres.seuilMaitrise).toBe('');
    });
});

/* ----------------------------- AE — le canal de PARTAGE, même couture (#583/#680) */

// Le canal de partage (`SCHEMA_ENTITE.echelle`, partage-schemas.js) est une SECONDE
// liste blanche, et elle a oublié de la même façon : les deux repères de maîtrise y
// sont restés absents du 28 août au 25 sept. 2026, alors que ce banc les gardait
// déjà côté import-export. C'est la cinquième fois (#511, 28 août, #667, #668, #583)
// qu'un champ se perd ainsi. Le relevé des champs connus d'une échelle est fait UNE
// fois, ici, pour les deux canaux : chacun doit les transporter ou les exclure.
//
// « Connu de l'application » = écrit par echelles.js (AA) OU connu du canal
// d'import-export (transporté ou exclu). Le second ensemble est ce qui attrape les
// champs d'état local (`dateImport`, `verrouille`…) que la création ne pose pas.

function clesConnuesDUneEchelle() {
    return new Set([
        ...clesEcritesParLaDuplication(),
        ...clesEcritesParLaCreationComplete(),
        ...Object.keys(win.SCHEMAS_IMPORT.echelle),
        ...Object.keys(win.CLES_ECHELLE_NON_TRANSPORTEES)
    ]);
}

describe('transport des échelles · AE — le partage ne perd aucun champ d\'échelle en silence', () => {
    let schemas;
    beforeEach(() => { schemas = chargerScript('js/partage-schemas.js').partageSchemas; });

    it('AE.a LE CAS QUI PORTE LE SENS : chaque champ connu est partagé, ou exclu avec sa raison', () => {
        const partages = Object.keys(schemas.SCHEMA_ENTITE.echelle.champs);
        const exclus = Object.keys(schemas.CHAMPS_ECHELLE_NON_PARTAGES);
        const orphelins = [...clesConnuesDUneEchelle()].filter(c => !partages.includes(c) && !exclus.includes(c));
        expect(orphelins,
            'champs d\'échelle ni partagés ni exclus : les ajouter à SCHEMA_ENTITE.echelle '
            + '(partage-schemas.js), ou à CHAMPS_ECHELLE_NON_PARTAGES avec leur raison'
        ).toEqual([]);
    });

    it('AE.b les deux repères et les champs retenus de #680 sont DÉCLARÉS (pas exclus)', () => {
        const partages = Object.keys(schemas.SCHEMA_ENTITE.echelle.champs);
        ['seuilSuffisance', 'seuilMaitrise', 'description', 'discipline']
            .forEach(c => expect(partages, `« ${c} » doit voyager`).toContain(c));
    });

    it('AE.c un niveau voyage entier : toute clé de niveau connue est déclarée', () => {
        const partages = Object.keys(schemas.SCHEMA_ENTITE.echelle.champs.niveaux.schema);
        const connues = new Set([...clesCanoniquesDUnNiveau(), ...Object.keys(win.SCHEMAS_IMPORT.echelle.niveaux.schema)]);
        const orphelines = [...connues].filter(c => !partages.includes(c));
        expect(orphelines, 'clés de niveau connues mais absentes de SCHEMA_ENTITE.echelle.niveaux').toEqual([]);
    });

    it('AE.d la configuration voyage entière', () => {
        const partages = Object.keys(schemas.SCHEMA_ENTITE.echelle.champs.config.schema);
        const orphelines = Object.keys(win.SCHEMAS_IMPORT.echelle.config.schema).filter(c => !partages.includes(c));
        expect(orphelines).toEqual([]);
    });

    it('AE.e une exclusion porte sa raison, et ne contredit pas le schéma', () => {
        const partages = Object.keys(schemas.SCHEMA_ENTITE.echelle.champs);
        Object.entries(schemas.CHAMPS_ECHELLE_NON_PARTAGES).forEach(([cle, raison]) => {
            expect(typeof raison, `« ${cle} » doit porter sa raison`).toBe('string');
            expect(raison.length, `la raison de « ${cle} » est trop courte pour en être une`).toBeGreaterThan(20);
            expect(partages, `« ${cle} » est à la fois exclu et déclaré`).not.toContain(cle);
        });
    });
});
