/**
 * #668 Lot 4 + #669 · LE TRANSPORT — CE QUE L'AUTEUR·E A RÉGLÉ DOIT ARRIVER
 *
 * Les deux défauts couverts ici sont la même classe que #667 : la grille
 * arrive, calcule autre chose que ce que son auteur·e a réglé, et ne dit rien.
 * Le silence est ce qui coûte, pas la bascule.
 *
 *   A — #669 · les sous-critères traversent le PARTAGE. Mesuré le 1er septembre
 *       2026 : `projeterEntite(grille, 'grille')` rendait le critère SANS
 *       `sousCriteres`, code de sortie 0. L'effet dépasse la perte des onze
 *       textes — `evaluation-calcul.js:992` choisit le MODE DE CALCUL sur
 *       `sousCriteres.length > 0`. Sans eux, le destinataire bascule du mode
 *       catégories au mode simple et perd la pondération décimale, celle-là
 *       même qui sert la demi-faute de ponctuation.
 *   B — #668 Lot 4 · les TROIS champs de projection voyagent, des deux côtés.
 *       Trois, pas deux : `modeleProjection` est le seul qui décide du modèle.
 *   C — le palier TERMINAL reste terminal. `ratioMax: null` est une valeur
 *       signifiante ; coercée en 0 elle devient un seuil, et le verdict change.
 *   D — les schémas restent FERMÉS. Un `{ type: 'object' }` nu laisserait
 *       entrer un objet arbitraire dans la base.
 *
 * ⚠ Ce banc teste des EFFETS (projection, validation, assainissement), pas la
 * présence de lignes dans un fichier. Une déclaration qu'aucun chemin ne lit
 * passerait une assertion statique sans rien transporter.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

/** Les paliers d'une grille réglée : un « sans erreur », deux seuils, un TERMINAL. */
function paliersRegles() {
    return [
        { cle: 'sans_erreur', libelle: 'Sans erreur', sansErreur: true, ratioMax: null,
          texte: 'Absence d\'erreur exceptionnelle.', texteAide: '' },
        { cle: 'excellent', libelle: 'Excellent', sansErreur: false, ratioMax: 0.3,
          texte: 'Ce ratio est excellent.', texteAide: '' },
        { cle: 'risque', libelle: 'Risqué', sansErreur: false, ratioMax: 1,
          texte: 'Ce ratio est risqué.', texteAide: 'Inscris-toi au CAF.' },
        { cle: 'echec', libelle: 'Échec', sansErreur: false, ratioMax: null,
          texte: 'Ce ratio mènerait à un échec automatique.', texteAide: 'Inscris-toi au CAF.' }
    ];
}

/** Le critère algorithmique tel qu'une grille réelle le porte, tout réglé. */
function critereRegle() {
    return {
        id: 'CR_1', nom: 'Qualité du français', ponderation: 10, type: 'algorithmique',
        facteurNormalisation: 600,
        modeleProjection: 'norme_externe',
        paramsProjection: {
            motsReference: 900, erreursTolerees: 30,
            nomServiceAide: 'Centre d\'aide en français (CAF)', lienServiceAide: ''
        },
        paliersProjection: paliersRegles(),
        // Deux sous-critères dont un à pondération DÉCIMALE : la demi-faute de
        // ponctuation. C'est elle que la bascule en mode simple faisait perdre.
        sousCriteres: [
            { id: 'sc_1', code: '1', nom: 'Syntaxe', ponderation: 1,
              retroaction: 'La plupart des erreurs concernent la construction syntaxique.' },
            { id: 'sc_3', code: '3', nom: 'Ponctuation', ponderation: 0.5,
              retroaction: 'La plupart des erreurs sont liées à l\'emploi de la ponctuation.' }
        ],
        categoriesErreurs: [
            { code: '1', nom: 'Syntaxe', retroaction: 'Ancienne structure, lue par la migration.' }
        ]
    };
}

function grilleReglee() {
    return {
        id: 'GR_TEST', nom: 'Grille de français',
        criteres: [critereRegle()],
        dateCreation: '2026-09-01T00:00:00Z',
        dansBibliotheque: true,
        metadata_cc: { auteur_original: 'Test 668', licence: 'CC BY-NC-SA 4.0', contributeurs: [] }
    };
}

function pkgAvec(grille) {
    return {
        format: 'labo-codex-partage-v1',
        manifest: {
            licence: 'CC BY-NC-SA 4.0',
            dateExport: '2026-09-01T12:00:00Z',
            auteur: { nom: 'Test 668' },
            item_principal: { type: 'grille', id: 'GR_TEST' },
            chaineAttribution: [],
            signature: null, clePublique: null, algorithme: null
        },
        entites: { grilles: [grille] },
        references: [],
        medias: []
    };
}

let win;
beforeAll(() => {
    const db = { getSync: (cle, defaut) => (defaut !== undefined ? defaut : null) };
    win = chargerScript('js/partage-schemas.js');
    chargerScript('js/partage-validation.js', { db }, win);
    chargerScript('js/partage-format.js', { db }, win);
});

let winIE;
beforeEach(() => { winIE = chargerScript('js/import-export.js'); });

/* ------------------------------------ A — #669 · les sous-critères traversent */

describe('#669 · A — le partage n\'ampute plus la grille de ses rétroactions', () => {
    it('A.a les deux sous-critères et leurs textes survivent à la projection', () => {
        const projete = win.partageFormat.projeterEntite(grilleReglee(), 'grille');
        const c = projete.criteres[0];
        expect(c.sousCriteres).toHaveLength(2);
        expect(c.sousCriteres[0].retroaction)
            .toBe('La plupart des erreurs concernent la construction syntaxique.');
        expect(c.sousCriteres[1].retroaction)
            .toBe('La plupart des erreurs sont liées à l\'emploi de la ponctuation.');
    });

    it('A.b la pondération DÉCIMALE arrive intacte — la demi-faute de ponctuation', () => {
        const projete = win.partageFormat.projeterEntite(grilleReglee(), 'grille');
        expect(projete.criteres[0].sousCriteres[1].ponderation).toBe(0.5);
    });

    // ⚠ CE TEST EST LE CŒUR DE #669, et il ne porte pas sur les textes.
    // `evaluation-calcul.js:992` lit `critere.sousCriteres.length > 0` pour
    // choisir son mode. Un transport qui rendrait un tableau VIDE passerait
    // A.a en apparence (rien à comparer) et basculerait quand même le
    // destinataire en mode simple, sans un mot.
    it('A.c le critère arrive du bon CÔTÉ de la bascule mode catégories / mode simple', () => {
        const projete = win.partageFormat.projeterEntite(grilleReglee(), 'grille');
        const c = projete.criteres[0];
        expect(Array.isArray(c.sousCriteres)).toBe(true);
        expect(c.sousCriteres.length > 0, 'sans ceci, le mode bascule en silence').toBe(true);
    });

    it('A.d l\'ancienne structure passe aussi : c\'est elle que la migration lit', () => {
        const projete = win.partageFormat.projeterEntite(grilleReglee(), 'grille');
        expect(projete.criteres[0].categoriesErreurs).toEqual([
            { code: '1', nom: 'Syntaxe', retroaction: 'Ancienne structure, lue par la migration.' }
        ]);
    });

    it('A.e le drapeau `_categoriesmigrees` NE voyage PAS, et c\'est voulu', () => {
        const grille = grilleReglee();
        grille.criteres[0]._categoriesmigrees = true;
        const projete = win.partageFormat.projeterEntite(grille, 'grille');
        // Tout champ préfixé `_` est interdit au partage (état interne).
        // Sans conséquence : la garde de la migration est `!critere.sousCriteres`,
        // et ceux-ci voyagent désormais.
        expect(projete.criteres[0]._categoriesmigrees).toBeUndefined();
    });

    it('A.f un package portant ces champs est VALIDE — ils ne font pas rejeter', () => {
        const pkg = pkgAvec(win.partageFormat.projeterEntite(grilleReglee(), 'grille'));
        const r = win.partageValidation.validerPackage(pkg);
        expect(r.erreurs, 'aucune erreur attendue').toEqual([]);
        expect(r.valide).toBe(true);
    });
});

/* --------------------------- B — #668 Lot 4 · la projection EUF voyage */

describe('#668 Lot 4 · B — la projection réglée arrive telle qu\'elle a été réglée', () => {
    it('B.a les TROIS champs traversent le partage', () => {
        const c = win.partageFormat.projeterEntite(grilleReglee(), 'grille').criteres[0];
        expect(c.modeleProjection).toBe('norme_externe');
        expect(c.paramsProjection).toEqual({
            motsReference: 900, erreursTolerees: 30,
            nomServiceAide: 'Centre d\'aide en français (CAF)', lienServiceAide: ''
        });
        expect(c.paliersProjection).toHaveLength(4);
    });

    // ⚠ Sans `modeleProjection`, `normaliser` reconstitue un modèle
    // (`evaluation-projection.js:315`) : les paramètres transportés seraient
    // lus par un modèle que l'auteur·e n'a pas choisi. Transporter deux
    // champs sur trois est un défaut, pas une demi-mesure.
    it('B.b `modeleProjection` est déclaré des DEUX côtés, pas seulement au partage', () => {
        const critereCritere = winIE.SCHEMAS_IMPORT.grille.criteres.schema;
        expect(critereCritere.modeleProjection, 'absent du schéma d\'import').toBeTruthy();
        expect(critereCritere.paramsProjection).toBeTruthy();
        expect(critereCritere.paliersProjection).toBeTruthy();
    });

    it('B.c les trois champs traversent l\'import/export', () => {
        const apres = winIE.assainirObjet(grilleReglee(), winIE.SCHEMAS_IMPORT.grille);
        const c = apres.criteres[0];
        expect(c.modeleProjection).toBe('norme_externe');
        expect(c.paramsProjection.motsReference).toBe(900);
        expect(c.paramsProjection.erreursTolerees).toBe(30);
        expect(c.paliersProjection).toHaveLength(4);
        expect(c.paliersProjection[1].texte).toBe('Ce ratio est excellent.');
    });

    it('B.d le texte long d\'un palier n\'est pas tronqué à la borne des chaînes courtes', () => {
        const grille = grilleReglee();
        const long = 'Mot '.repeat(300).trim(); // ~1200 caractères
        grille.criteres[0].paliersProjection[1].texte = long;
        const apres = winIE.assainirObjet(grille, winIE.SCHEMAS_IMPORT.grille);
        expect(apres.criteres[0].paliersProjection[1].texte).toBe(long);
    });
});

/* ------------------------------- C — le palier terminal reste terminal */

describe('#668 Lot 4 · C — `ratioMax: null` est une valeur, pas un vide', () => {
    it('C.a le palier terminal survit à la projection de partage', () => {
        const c = win.partageFormat.projeterEntite(grilleReglee(), 'grille').criteres[0];
        const terminal = c.paliersProjection.find(p => p.cle === 'echec');
        expect(terminal.ratioMax, 'coercé, il deviendrait un SEUIL').toBeNull();
    });

    it('C.b la validation ACCEPTE le null — sans `nullable`, tout package serait rejeté', () => {
        const pkg = pkgAvec(win.partageFormat.projeterEntite(grilleReglee(), 'grille'));
        const r = win.partageValidation.validerPackage(pkg);
        expect(r.erreurs.filter(e => String(e.message).includes('null'))).toEqual([]);
        expect(r.valide).toBe(true);
    });

    // ⚠ Le type `'number'` du dialecte d'import coerce `null` en `0`. Un
    // `ratioMax` à 0 n'est pas un palier terminal : c'est un seuil, et
    // `_palierNeuf` (`grilles.js:4874`) lit les paliers BRUTS sans passer par
    // le rattrapage de `_paliersRetenus`. D'où le type `numberOrNull`.
    it('C.c l\'import préserve le null au lieu de le coercer en 0', () => {
        const apres = winIE.assainirObjet(grilleReglee(), winIE.SCHEMAS_IMPORT.grille);
        const paliers = apres.criteres[0].paliersProjection;
        expect(paliers.find(p => p.cle === 'echec').ratioMax).toBeNull();
        expect(paliers.find(p => p.cle === 'sans_erreur').ratioMax).toBeNull();
    });

    it('C.d et un vrai seuil reste ce nombre — le type ne rend pas tout null', () => {
        const apres = winIE.assainirObjet(grilleReglee(), winIE.SCHEMAS_IMPORT.grille);
        const paliers = apres.criteres[0].paliersProjection;
        expect(paliers.find(p => p.cle === 'excellent').ratioMax).toBe(0.3);
        expect(paliers.find(p => p.cle === 'risque').ratioMax).toBe(1);
    });

    it('C.e une valeur non numérique tombe à 0, elle ne devient pas null', () => {
        const grille = grilleReglee();
        grille.criteres[0].paliersProjection[1].ratioMax = 'du texte';
        const apres = winIE.assainirObjet(grille, winIE.SCHEMAS_IMPORT.grille);
        expect(apres.criteres[0].paliersProjection[1].ratioMax).toBe(0);
    });
});

/* --------------------------------------- D — les schémas restent fermés */

describe('#668 Lot 4 · D — schémas FERMÉS, jamais `{ type: object }` nu', () => {
    it('D.a un champ inconnu glissé dans `paramsProjection` n\'entre pas', () => {
        const grille = grilleReglee();
        grille.criteres[0].paramsProjection.charge = { utile: '<script>alert(1)</script>' };
        const apres = winIE.assainirObjet(grille, winIE.SCHEMAS_IMPORT.grille);
        expect(apres.criteres[0].paramsProjection.charge).toBeUndefined();
        expect(apres.criteres[0].paramsProjection.motsReference).toBe(900);
    });

    it('D.b un champ inconnu glissé dans un PALIER n\'entre pas non plus', () => {
        const grille = grilleReglee();
        grille.criteres[0].paliersProjection[1].charge = 'arbitraire';
        const apres = winIE.assainirObjet(grille, winIE.SCHEMAS_IMPORT.grille);
        expect(apres.criteres[0].paliersProjection[1].charge).toBeUndefined();
    });

    it('D.c un champ inconnu est rejeté par la validation du partage', () => {
        const projete = win.partageFormat.projeterEntite(grilleReglee(), 'grille');
        projete.criteres[0].paramsProjection.charge = 'arbitraire';
        const r = win.partageValidation.validerPackage(pkgAvec(projete));
        expect(r.valide, 'un schéma fermé doit refuser ce qu\'il ne déclare pas').toBe(false);
    });

    it('D.d une balise dans un texte de palier est assainie au passage', () => {
        const grille = grilleReglee();
        grille.criteres[0].paliersProjection[1].texte = '<img src=x onerror=alert(1)>';
        const apres = winIE.assainirObjet(grille, winIE.SCHEMAS_IMPORT.grille);
        expect(apres.criteres[0].paliersProjection[1].texte).not.toContain('<');
    });

    // Assertion statique — commentaires RETIRÉS d'abord : un commentaire qui
    // PARLE d'un objet nu ferait échouer une assertion qui cherche du code.
    // ⚠ PORTÉE : le schéma `grille` SEUL, qui est le périmètre du Lot 4.
    // `pratique` porte trois objets nus (`configuration`, `ponderation`,
    // `seuils`) qui sont un choix ÉCRIT et assumé — « modélisation exhaustive
    // trop coûteuse pour le bénéfice, copié brut, trade-off accepté ». Les
    // faire échouer ici ferait rougir ce banc pour une décision qu'il ne juge
    // pas. Élargir la portée demande de rouvrir cette décision d'abord.
    it('D.e aucun `type: object` sans schéma dans le schéma de GRILLE', () => {
        const src = readFileSync(path.join(racine, 'js', 'import-export.js'), 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        const debut = src.indexOf('\n    grille: {');
        const fin = src.indexOf('\n    echelle: {', debut);
        expect(debut, 'schéma `grille` introuvable — le banc a perdu sa cible').toBeGreaterThan(-1);
        expect(fin, 'borne de fin introuvable — le banc a perdu sa cible').toBeGreaterThan(debut);
        const bloc = src.slice(debut, fin);
        // `{ type: 'object' }` fermant sans `schema` sur la même déclaration.
        expect(bloc.match(/type:\s*'object'\s*\}/g) || [],
            'un objet nu recopie la valeur telle quelle').toEqual([]);
        // Témoin du zéro : le MÊME motif, privé de son accolade fermante,
        // trouve bien les objets légitimes de ce bloc. Sans lui, ce zéro ne
        // dirait pas si le schéma est fermé ou si la cible a bougé.
        expect((bloc.match(/type:\s*'object'/g) || []).length,
            'témoin : le motif doit mordre ailleurs').toBeGreaterThan(0);
    });
});
