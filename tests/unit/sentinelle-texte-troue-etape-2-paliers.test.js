// SENTINELLE — LE TEXTE TROUÉ, ÉTAPE 2 · VOLET 1 : LE REGISTRE DE PROJECTION
// REMPLIT LES DEUX TEXTES D'UN PALIER (4 septembre 2026).
//
// Ce qu'elle tient, sur le MODULE RÉEL en Node (aucun bac à sable, aucun global
// emprunté — règle 7 du protocole) :
//   A. la palette est celle que Grégoire a arrêtée (huit badges, deux familles),
//      et rien d'autre — ni {niveau}, ni {note}, ni {lien}, ni {facteur} ;
//   B. chaque jeton rend SA valeur exacte sur les quatre couples de la carte
//      (0/460, 4/460, 15/584, 59/460), {s} compris ; sur « Sans erreur »,
//      {moyenne} est vide et part avec son espace ;
//   C. le préfixe engendré (décision de Grégoire, 17 h 15) : une phrase sans
//      jeton connu le garde À L'OCTET PRÈS ; dès qu'elle en porte un, elle est
//      entière ; le discriminant lit « Ce que l'élève lit » seulement, et un
//      jeton INCONNU ne le fait pas tomber ;
//   D. un jeton inconnu reste en place et se nomme ; un jeton connu sans valeur
//      part avec son espace de tête ; un texte sans jeton n'est pas même trimé ;
//   E. {service} dans la phrase de recommandation RESTE CE QU'IL EST
//      (apposition / complément), les autres jetons s'y remplissent ensuite ;
//      dans « Ce que l'élève lit », il suit la règle générique — décidé, dit ;
//   F. les témoins : un seul site `projectionAlgo.calculer`, et le golden #668
//      (fichier voisin) passe sans modification.
//
// BREAK-TESTS (faits le 4 septembre 2026, chacun restauré, `cmp` identique) :
//   · B — `projection` calculée sur `erreursTolerees` au lieu de `motsReference`
//     → B rougit sur les quatre couples ;
//   · B — `s` toujours 's' → B rougit sur 0/460 (« 0 erreurs ») ;
//   · C — `compose` forcé à false dans `_resultat` → C rougit (le préfixe revient
//     devant une phrase composée) ;
//   · D — `remplir` retire aussi les jetons inconnus → D rougit ;
//   · E — `remplir` appliqué à la recommandation AVANT la règle de {service}
//     → E rougit (l'apposition n'est plus reconnue) ;
//   · A — {palier} retiré de la palette → A rougit.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

const P = require(path.join(racine, 'js/evaluation-projection.js'));

const COUPLES = [[0, 460], [4, 460], [15, 584], [59, 460]];

/** Un critère EUF dont CHAQUE palier porte la même phrase composée, sans recommandation. */
const TEMPLATE = 'Palier {palier} : {erreurs} erreur{s} sur {mots} mots, soit 1 erreur tous les {moyenne} mots'
    + ' et {projection} erreurs pour {longueur} mots (seuil {seuil}, service {service}).';
function critereCompose(nom) {
    return P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: nom === undefined ? 'Passerelle +' : nom },
        P.paliersMigration().map((p) => Object.assign({}, p, { texte: TEMPLATE, texteAide: '' })));
}
/** Un critère EUF tel qu'il existe aujourd'hui — les paliers de migration, rien d'écrit. */
function critereDHier(nom) {
    return P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: nom });
}
const calc = (critere, e, m) => P.calculer(critere, { erreurs: e, mots: m });

/* ============================================================ A — LA PALETTE */

describe('texte troué 2 · A — la palette est celle que Grégoire a arrêtée', () => {
    const palette = P.listerReperes();

    // ↻ Lot 3a de la table de cas (26 oct. 2026, consigne § 3.8) : les zones des paliers acceptent aussi les deux
    // noms de l'enseignant·e, comme le décompte — dix badges, les deux noms en fin de liste, famille « posée ».
    it('A.a dix badges, dans cet ordre : service · seuil · longueur | erreurs · mots · moyenne · projection · palier | les deux noms', () => {
        expect(palette.map((r) => r.jeton)).toEqual([
            '{service}', '{seuil}', '{longueur}',
            '{erreurs}', '{mots}', '{moyenne}', '{projection}', '{palier}',
            '{nomErreurs}', '{nomMots}'
        ]);
    });

    it('A.b deux familles : les cinq posés (bleu, dont les deux noms), les cinq remplis (vert)', () => {
        expect(palette.filter((r) => r.famille === 'posee').map((r) => r.jeton)).toEqual(['{service}', '{seuil}', '{longueur}', '{nomErreurs}', '{nomMots}']);
        expect(palette.filter((r) => r.famille === 'remplie').map((r) => r.jeton)).toEqual(['{erreurs}', '{mots}', '{moyenne}', '{projection}', '{palier}']);
    });

    it('A.c ce qui n\'est PAS offert : le niveau IDME, la note, le lien, le facteur — et {s}, qui est un accord', () => {
        const jetons = palette.map((r) => r.jeton);
        for (const interdit of ['{niveau}', '{note}', '{lien}', '{facteur}', '{s}']) expect(jetons).not.toContain(interdit);
        // Le rendu, lui, connaît {s} : un texte qui porte {erreurs} porte l'accord.
        expect(P.JETONS).toContain('{s}');
        expect(P.JETONS.length).toBe(11);   // lot 3a : + {nomErreurs}, {nomMots}
    });

    it('A.d chaque badge est un jeton que le rendu connaît, et porte un libellé et une aide', () => {
        for (const r of palette) {
            expect(P.JETONS, r.jeton).toContain(r.jeton);
            expect(r.libelle.length, r.jeton).toBeGreaterThan(3);
            expect(r.aide.length, r.jeton).toBeGreaterThan(10);
            expect(r.espaceDeTete).toBe(false);
        }
        // La palette rendue est une COPIE : la modifier ne touche pas le registre.
        palette[0].jeton = '{cassé}';
        expect(P.listerReperes()[0].jeton).toBe('{service}');
    });
});

/* ==================================================== B — CHAQUE JETON, SA VALEUR */

describe('texte troué 2 · B — chaque jeton rend sa valeur exacte, sur les quatre couples de la carte', () => {
    const c = critereCompose();
    const ATTENDU = {
        '0/460':  'Palier Sans erreur : 0 erreur sur 460 mots, soit 1 erreur tous les mots et 0 erreurs pour 900 mots (seuil 30, service Passerelle +).',
        '4/460':  'Palier Excellent : 4 erreurs sur 460 mots, soit 1 erreur tous les 115 mots et 8 erreurs pour 900 mots (seuil 30, service Passerelle +).',
        '15/584': 'Palier Risqué : 15 erreurs sur 584 mots, soit 1 erreur tous les 39 mots et 23 erreurs pour 900 mots (seuil 30, service Passerelle +).',
        '59/460': 'Palier Échec : 59 erreurs sur 460 mots, soit 1 erreur tous les 8 mots et 115 erreurs pour 900 mots (seuil 30, service Passerelle +).'
    };

    COUPLES.forEach(([e, m]) => {
        it(`B.${e}/${m} — la phrase composée, remplie, sans préfixe engendré`, () => {
            const r = calc(c, e, m);
            expect(r.applicable).toBe(true);
            expect(r.texte).toBe(ATTENDU[`${e}/${m}`]);
            expect(r.compose).toBe(true);
            expect(r.prefixe).toBe('');
        });
    });

    it('B.j les valeurs elles-mêmes, pour 15 / 584 — celles de la carte, §b', () => {
        expect(calc(c, 15, 584).jetons).toEqual({
            service: 'Passerelle +', seuil: '30', longueur: '900',
            erreurs: '15', mots: '584', moyenne: '39', projection: '23', palier: 'Risqué', s: 's',
            nomErreurs: 'erreurs', nomMots: 'mots'   // lot 3a : un critère sans noms lit « erreur » et « mot »
        });
    });

    it('B.z sur « Sans erreur », {moyenne} est VIDE et part avec son espace ; {projection} vaut 0 ; {s} est vide', () => {
        const r = calc(c, 0, 460);
        expect(r.jetons.moyenne).toBe('');
        expect(r.jetons.projection).toBe('0');
        expect(r.jetons.s).toBe('');
        expect(r.texte).toContain('tous les mots');       // pas « tous les  mots »
        expect(r.texte).not.toContain('  ');
    });

    it('B.p {projection} est le NOMBRE seul, et il suit la longueur de référence réglée', () => {
        const large = P.appliquerAuCritere({}, 'norme_externe', { motsReference: 600, erreursTolerees: 30 },
            [{ cle: 'x', ratioMax: null, texte: '{projection}' }]);
        expect(calc(large, 15, 584).texte).toBe('15');      // 600 × 15 / 584 = 15,4
        expect(calc(critereCompose(), 15, 584).jetons.projection).toBe('23');   // 900 × 15 / 584 = 23,1
    });

    it('B.s {s} suit {erreurs} : une erreur, pas de s ; une demi-faute non plus ; deux, oui', () => {
        const un = P.appliquerAuCritere({}, 'norme_externe', {}, [{ cle: 'x', ratioMax: null, texte: '{erreurs} erreur{s}' }]);
        expect(calc(un, 1, 300).texte).toBe('1 erreur');
        expect(calc(un, 0.5, 300).texte).toBe('0,5 erreur');   // #1137 (22 oct.) : la virgule
        expect(calc(un, 2, 300).texte).toBe('2 erreurs');
    });

    it('B.n une copie non corrigée n\'a AUCUN texte ni jeton — la projection ne conclut pas', () => {
        const r = calc(c, null, null);
        expect(r.applicable).toBe(false);
        expect(r.texte).toBe('');
        expect(r.jetons).toBeNull();
        expect(r.compose).toBe(false);
    });
});

/* ==================================================== C — LE PRÉFIXE ENGENDRÉ */

describe('texte troué 2 · C — le préfixe engendré : gardé sans jeton, retiré dès qu\'il y en a un', () => {
    const NOM_A_L_EPOQUE = 'Centre d\'aide en français (CAF)';

    it('C.a un critère d\'hier rend À L\'OCTET PRÈS ce qu\'il rendait — le golden #668, rejoué ici sur un cas', () => {
        const r = calc(critereDHier(NOM_A_L_EPOQUE), 15, 584);
        expect(' ' + r.texte).toBe(' Tu fais en moyenne 1 erreur à chaque 39 mots. En prévision de l\'EUF, ce ratio est risqué parce qu\'il est près du seuil de l\'échec. Il est recommandé de t\'inscrire au Centre d\'aide en français (CAF).');
        expect(r.compose).toBe(false);
        expect(r.prefixe).toBe('Tu fais en moyenne 1 erreur à chaque 39 mots.');
        // Les quatre couples : jamais composés, et le préfixe est là sauf à zéro erreur.
        COUPLES.forEach(([e, m]) => {
            const x = calc(critereDHier(NOM_A_L_EPOQUE), e, m);
            expect(x.compose, `${e}/${m}`).toBe(false);
            if (e === 0) expect(x.prefixe).toBe('');
            else expect(x.prefixe).toMatch(/^Tu fais en moyenne 1 erreur à chaque \d+ mots\.$/);
        });
    });

    it('C.b dès que « Ce que l\'élève lit » porte un jeton connu, la phrase est ENTIÈRE : aucun préfixe', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, [{ cle: 'x', ratioMax: null, texte: 'Tu as {erreurs} erreurs.' }]);
        const r = calc(c, 15, 584);
        expect(r.texte).toBe('Tu as 15 erreurs.');
        expect(r.prefixe).toBe('');
        expect(r.compose).toBe(true);
    });

    it('C.c {moyenne} remet la mesure où l\'enseignant·e la veut — à la fin, ici', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, [{ cle: 'x', ratioMax: null, texte: 'Ce ratio est risqué : 1 erreur à chaque {moyenne} mots.' }]);
        expect(calc(c, 15, 584).texte).toBe('Ce ratio est risqué : 1 erreur à chaque 39 mots.');
    });

    it('C.d le discriminant ne lit QUE « Ce que l\'élève lit » : une recommandation composée sous un verdict d\'hier garde le préfixe', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, [{ cle: 'x', ratioMax: null, texte: 'Verdict.', texteAide: 'Tu as {erreurs} erreur{s}.' }]);
        const r = calc(c, 15, 584);
        expect(r.texte).toBe('Tu fais en moyenne 1 erreur à chaque 39 mots. Verdict. Tu as 15 erreurs.');
        expect(r.compose).toBe(false);
    });

    it('C.e « aucun jeton CONNU », pas « aucune accolade » : un {truc} inconnu ne fait pas tomber le préfixe', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, [{ cle: 'x', ratioMax: null, texte: 'Bravo {truc}.' }]);
        const r = calc(c, 15, 584);
        expect(r.texte).toBe('Tu fais en moyenne 1 erreur à chaque 39 mots. Bravo {truc}.');
        expect(r.compose).toBe(false);
    });

    it('C.f {s} seul compte comme un jeton connu', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, [{ cle: 'x', ratioMax: null, texte: 'Erreur{s}.' }]);
        expect(calc(c, 15, 584).texte).toBe('Erreurs.');
        expect(P.porteJetonConnu('Erreur{s}.')).toBe(true);
        expect(P.porteJetonConnu('Erreur.')).toBe(false);
        expect(P.porteJetonConnu('')).toBe(false);
        expect(P.porteJetonConnu(null)).toBe(false);
    });
});

/* ============================================ D — INCONNU EN PLACE, CONNU VIDE RETIRÉ */

describe('texte troué 2 · D — un jeton inconnu reste et se nomme ; un jeton connu sans valeur part avec son espace', () => {
    it('D.a `jetonsInconnus` nomme ce que le registre ne connaît pas, une fois chacun, dans l\'ordre', () => {
        expect(P.jetonsInconnus('A {truc} {erreurs} {machin} {truc}.')).toEqual(['{truc}', '{machin}']);
        expect(P.jetonsInconnus(TEMPLATE)).toEqual([]);
        expect(P.jetonsInconnus('')).toEqual([]);
        expect(P.jetonsInconnus(undefined)).toEqual([]);
        // Une accolade ouverte sans fermante, ou avec une espace dedans, n'est pas un jeton.
        expect(P.jetonsInconnus('{pas un jeton} {ni')).toEqual([]);
    });

    it('D.b au rendu, l\'inconnu reste EN PLACE — un élève le lirait ; c\'est le gabarit qui le dit', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, [{ cle: 'x', ratioMax: null, texte: '{erreurs} erreurs, {truc}.' }]);
        expect(calc(c, 15, 584).texte).toBe('15 erreurs, {truc}.');
    });

    it('D.c un jeton connu sans valeur part avec l\'espace qui le précède, et rien d\'autre', () => {
        expect(P.remplir('Va au {service} vite ; oui !', { service: '' })).toBe('Va au vite ; oui !');
        expect(P.remplir('Attention : {erreurs} erreurs ; revois !', { erreurs: 3 })).toBe('Attention : 3 erreurs ; revois !');
    });

    it('D.d un texte sans jeton connu n\'est PAS touché — pas même ses espaces', () => {
        expect(P.remplir('  x {truc} ', {})).toBe('  x {truc} ');
        expect(P.remplir('', {})).toBe('');
        expect(P.remplir(undefined, {})).toBe('');
    });
});

/* ============================================ E — {service} RESTE CE QU'IL EST */

describe('texte troué 2 · E — {service} garde sa règle de place dans la recommandation ; générique dans le verdict', () => {
    const paliers = (texte, texteAide) => [{ cle: 'x', libelle: 'Échec', ratioMax: null, texte, texteAide }];

    it('E.a nom VIDE, {service} en COMPLÉMENT : la recommandation part ENTIÈRE, jetons compris', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: '' },
            paliers('Verdict {erreurs}.', 'Inscris-toi au {service}. Tu as {erreurs} erreurs.'));
        expect(calc(c, 15, 584).texte).toBe('Verdict 15.');
    });

    it('E.b nom VIDE, {service} en APPOSITION : l\'apposition part seule, puis les autres jetons se remplissent', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: '' },
            paliers('Verdict.', 'Va au service d\'aide de ton collège : {service}. Tu as {erreurs} erreur{s}.'));
        expect(calc(c, 15, 584).texte).toBe('Tu fais en moyenne 1 erreur à chaque 39 mots. Verdict. Va au service d\'aide de ton collège. Tu as 15 erreurs.');
    });

    it('E.c nom réglé : {service} est remplacé, et les autres jetons aussi', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: 'Passerelle +' },
            paliers('{palier}.', 'Inscris-toi au {service} : {projection} erreurs pour {longueur} mots.'));
        expect(calc(c, 15, 584).texte).toBe('Échec. Inscris-toi au Passerelle + : 23 erreurs pour 900 mots.');
    });

    it('E.d dans « Ce que l\'élève lit », un {service} sans nom suit la règle générique — décidé seul, dit dans le code', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: '' },
            paliers('Va voir le {service}. Tu as {erreurs} erreurs.', ''));
        expect(calc(c, 15, 584).texte).toBe('Va voir le. Tu as 15 erreurs.');
        expect(lire('js/evaluation-projection.js')).toMatch(/\{service\} compris : un nom vide l'efface avec son espace/);
    });
});

/* ============================================================ F — LES TÉMOINS */

describe('texte troué 2 · F — les témoins', () => {
    it('F.a un seul site appelle `projectionAlgo.calculer`, et il passe erreurs et mots — le calcul n\'a pas bougé', () => {
        const src = lire('js/evaluation-calcul.js');
        expect((src.match(/projectionAlgo\.calculer\(/g) || []).length).toBe(1);
        // ↻ Étape 4c (27 oct. 2026) : les jetons des calculs pour les phrases s'y ajoutent (`calculs`) ; erreurs et mots, eux, n'ont pas bougé.
        expect(src).toMatch(/_critereDeGrille\(critereId\), \{ erreurs: erreurs, mots: mots, calculs: calculs \}/);
    });

    it('F.b le registre ne lit toujours ni DOM, ni db, ni le facteur de normalisation', () => {
        const src = lire('js/evaluation-projection.js').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(src).not.toMatch(/\bdocument\./);
        expect(src).not.toMatch(/\bdb\./);
        expect(src).not.toMatch(/facteurNormalisation/);
    });

    it('F.c le rendu est le même par `calculer` et par `remplir` sur les jetons du résultat — une seule source', () => {
        const c = critereCompose();
        const r = calc(c, 4, 460);
        expect(P.remplir(TEMPLATE, r.jetons)).toBe(r.texte);
    });
});
