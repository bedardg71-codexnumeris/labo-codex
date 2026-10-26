/**
 * #668 · LA PROJECTION EUF APPARTIENT AU GABARIT, PAS AU CODE
 *
 * ⚠⚠ CE FICHIER PORTE UN GOLDEN, ET SON ORACLE VA DISPARAÎTRE.
 *
 * Les chaînes ci-dessous ont été EXTRAITES DE LA FONCTION VIVANTE
 * `genererRetroactionEUF` (js/evaluation-calcul.js) le 1er septembre 2026,
 * avant que le Lot 2 ne la supprime. Une fois la fonction partie, plus
 * personne ne pourra refaire la mesure : l\'affirmation « le registre
 * reproduit l\'existant au caractère près » ne serait plus vérifiable, elle
 * serait seulement répétée.
 *
 * ⮕ Ces littéraux SONT l\'oracle, désormais. Ne jamais les « mettre à jour »
 * pour faire passer un test : un écart ici veut dire que le registre a changé
 * de comportement, et c\'est exactement ce que cette sentinelle existe pour
 * empêcher. Les modifier demande la même délibération qu\'un changement de
 * note déjà remise à un élève.
 *
 * Ce que le fichier verrouille, dans l\'ordre où ça peut se perdre :
 *   A. l\'équivalence au caractère près avec le comportement d\'avant #668 ;
 *   B. les quatre frontières de palier, prises des DEUX côtés ;
 *   C. le palier zéro erreur, et ce qui n\'est PAS applicable ;
 *   D. le paramétrage agit — sinon le gabarit serait décoratif ;
 *   E. l\'ordre des paliers, qui décide du verdict ;
 *   F. le nom du service, et sa disparition propre ;
 *   G. le module reste pur.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

const P = require(path.join(racine, 'js/evaluation-projection.js'));

/**
 * L\'ancienne fonction renvoyait un fragment PRÉFIXÉ D\'UNE ESPACE, parce
 * qu\'elle était concaténée derrière « Ta rédaction contient N erreurs… ».
 * Le registre, lui, rend une phrase autonome : le PDF du Lot 6 en a besoin
 * comme paragraphe, pas comme queue de phrase. L\'espace appartient donc au
 * site de concaténation, pas au texte. Cet adaptateur rétablit la forme
 * historique — et c\'est LUI qu\'on compare au golden, pas autre chose.
 */
// ↻ 2 SEPT. 2026 (#690) — LE GOLDEN DECLARE DESORMAIS LE NOM D'ALORS, AU LIEU
// DE L'HERITER DU DEFAUT. Les vingt chaines ci-dessous n'ont pas bouge d'un
// caractere : c'est l'ORACLE, et il reste ce qu'il etait. Ce qui a change, c'est
// d'ou vient « Centre d'aide en français (CAF) » quand on le rejoue. Il venait
// du `defaut` declare du parametre `nomServiceAide` — que Gregoire a change ce
// jour-la pour « Centre d'aide du college », parce que le service n'existe plus
// et que l'etablissement d'un autre enseignant n'en a peut-etre aucun.
// ⮕ Le golden mesure l'EQUIVALENCE DU CALCUL, pas la valeur d'un defaut de
// libelle. Le lui faire heriter etait une dependance tacite : le jour ou le
// defaut bouge pour une raison editoriale, vingt cas rougissent et la vraie
// mesure — les paliers, les frontieres, les arrondis — se trouve noyee. Le nom
// d'alors est donc PASSE, en clair, une fois pour toutes ; le defaut vivant est
// verrouille separement au cas F.
const NOM_DU_SERVICE_A_L_EPOQUE = 'Centre d\'aide en français (CAF)';

function commeAvant(erreurs, mots, critere) {
    const base = critere || P.appliquerAuCritere({}, 'norme_externe', {
        nomServiceAide: NOM_DU_SERVICE_A_L_EPOQUE
    });
    const r = P.calculer(base, { erreurs, mots });
    return r.applicable ? ' ' + r.texte : '';
}

// ---------------------------------------------------------------------
// A. LE GOLDEN
// ---------------------------------------------------------------------

const GOLDEN = [
    { nom: "zéro erreur, texte mesuré", erreurs: 0, mots: 460, attendu: " En prévision de l'EUF, l'absence d'erreur est exceptionnelle." },
    // LA SEULE LIGNE DE CE GOLDEN QUI A ETE DEPLACEE, ET VOICI POURQUOI.
    // ---------------------------------------------------------------------
    // L'ancienne fonction rendait ICI « l'absence d'erreur est exceptionnelle ».
    // Elle testait `erreurs === 0` AVANT `mots === 0`, et le cas etait MORT :
    // le site d'appel coupait sur `if (mots === 0) return;`.
    //
    // #667 l'a rendu VIVANT le matin meme — mesure, pas suppose. La garde du
    // mode simple est devenue `if (motsRequisSimple && mots === 0)`, ou
    // `motsRequisSimple` vient de `modele.utiliseMots`, et le modele neuf
    // `penalite_par_erreur` porte `utiliseMots: false`. Un critere ou
    // l'enseignant·e a regle « la longueur ne compte pas ici », sans un seul mot
    // saisi, annoncait donc a l'eleve que son absence d'erreur est exceptionnelle
    // EN PREVISION D'UNE EPREUVE CALIBREE SUR UN NOMBRE DE MOTS.
    //
    // `utiliseMots` est un attribut du modele de NOTE. Le besoin en mots de la
    // PROJECTION est inconditionnel : « 1 erreur / N mots » n'a aucun sens sans
    // N. La garde vit donc dans le registre, au-dessus du palier zero.
    //
    // CE N'EST PAS UN GOLDEN « MIS A JOUR POUR FAIRE PASSER UN TEST ». C'est une
    // deviation decidee, dont l'etendue est MESUREE et VERROUILLEE plus bas :
    // l'empreinte prouve qu'elle touche CE couple et aucun autre, 1 sur 481 401.
    // Decision du 1er septembre 2026, §6bis de la consigne.
    { nom: "zéro erreur ET zéro mot — DÉVIATION NOMMÉE, voir ci-dessus", erreurs: 0, mots: 0, attendu: "" },
    { nom: "zéro mot, erreurs saisies", erreurs: 59, mots: 0, attendu: "" },
    { nom: "excellent — frontière EXACTE 100", erreurs: 1, mots: 100, attendu: " Tu fais en moyenne 1 erreur à chaque 100 mots. En prévision de l'EUF, ce ratio est excellent." },
    { nom: "excellent — large", erreurs: 4, mots: 460, attendu: " Tu fais en moyenne 1 erreur à chaque 115 mots. En prévision de l'EUF, ce ratio est excellent." },
    { nom: "très bien — juste sous 100", erreurs: 100, mots: 9999, attendu: " Tu fais en moyenne 1 erreur à chaque 100 mots. En prévision de l'EUF, ce ratio est très bien." },
    { nom: "très bien — frontière EXACTE 75", erreurs: 4, mots: 300, attendu: " Tu fais en moyenne 1 erreur à chaque 75 mots. En prévision de l'EUF, ce ratio est très bien." },
    { nom: "bien — juste sous 75", erreurs: 400, mots: 29999, attendu: " Tu fais en moyenne 1 erreur à chaque 75 mots. En prévision de l'EUF, ce ratio est bien." },
    { nom: "bien — frontière EXACTE 60", erreurs: 5, mots: 300, attendu: " Tu fais en moyenne 1 erreur à chaque 60 mots. En prévision de l'EUF, ce ratio est bien." },
    { nom: "risqué — juste sous 60", erreurs: 500, mots: 29999, attendu: " Tu fais en moyenne 1 erreur à chaque 60 mots. En prévision de l'EUF, ce ratio est risqué parce qu'il est près du seuil de l'échec. Il est recommandé de t'inscrire au Centre d'aide en français (CAF)." },
    { nom: "risqué — frontière EXACTE 30", erreurs: 10, mots: 300, attendu: " Tu fais en moyenne 1 erreur à chaque 30 mots. En prévision de l'EUF, ce ratio est risqué parce qu'il est près du seuil de l'échec. Il est recommandé de t'inscrire au Centre d'aide en français (CAF)." },
    { nom: "risqué — la copie réelle 601-101", erreurs: 15, mots: 584, attendu: " Tu fais en moyenne 1 erreur à chaque 39 mots. En prévision de l'EUF, ce ratio est risqué parce qu'il est près du seuil de l'échec. Il est recommandé de t'inscrire au Centre d'aide en français (CAF)." },
    { nom: "échec — juste sous 30", erreurs: 1000, mots: 29999, attendu: " Tu fais en moyenne 1 erreur à chaque 30 mots. En prévision de l'EUF, ce ratio mènerait à un échec automatique. Il est fortement recommandé de t'inscrire au Centre d'aide en français (CAF)." },
    { nom: "échec — franc", erreurs: 59, mots: 460, attendu: " Tu fais en moyenne 1 erreur à chaque 8 mots. En prévision de l'EUF, ce ratio mènerait à un échec automatique. Il est fortement recommandé de t'inscrire au Centre d'aide en français (CAF)." },
    { nom: "échec — une erreur par mot", erreurs: 100, mots: 100, attendu: " Tu fais en moyenne 1 erreur à chaque 1 mots. En prévision de l'EUF, ce ratio mènerait à un échec automatique. Il est fortement recommandé de t'inscrire au Centre d'aide en français (CAF)." },
    { nom: "décimal — demi-faute, excellent", erreurs: 2.5, mots: 300, attendu: " Tu fais en moyenne 1 erreur à chaque 120 mots. En prévision de l'EUF, ce ratio est excellent." },
    { nom: "décimal — demi-faute, frontière 30", erreurs: 9.5, mots: 285, attendu: " Tu fais en moyenne 1 erreur à chaque 30 mots. En prévision de l'EUF, ce ratio est risqué parce qu'il est près du seuil de l'échec. Il est recommandé de t'inscrire au Centre d'aide en français (CAF)." },
    { nom: "décimal — demi-faute, échec", erreurs: 30.5, mots: 584, attendu: " Tu fais en moyenne 1 erreur à chaque 19 mots. En prévision de l'EUF, ce ratio mènerait à un échec automatique. Il est fortement recommandé de t'inscrire au Centre d'aide en français (CAF)." },
    { nom: "une seule erreur, texte long", erreurs: 1, mots: 3000, attendu: " Tu fais en moyenne 1 erreur à chaque 3000 mots. En prévision de l'EUF, ce ratio est excellent." },
    { nom: "arrondi — 1 erreur / 39,x mots", erreurs: 15, mots: 590, attendu: " Tu fais en moyenne 1 erreur à chaque 39 mots. En prévision de l'EUF, ce ratio est risqué parce qu'il est près du seuil de l'échec. Il est recommandé de t'inscrire au Centre d'aide en français (CAF)." }
];

describe('#668 · A — équivalence au caractère près avec le comportement d\'avant', () => {
    GOLDEN.forEach((c) => {
        it(`${c.nom} (${c.erreurs} err / ${c.mots} mots)`, () => {
            expect(commeAvant(c.erreurs, c.mots)).toBe(c.attendu);
        });
    });

    // POURQUOI UNE EMPREINTE EN PLUS DES CAS NOMMES. Vingt cas nommes couvrent
    // les branches et les frontieres, mais pas la surface. Une derive sur
    // l'arrondi, ou sur un intervalle que personne n'a nomme, passerait entre
    // eux. Les cas nommes disent OU ca casse ; l'empreinte dit QUE ca casse.

    // Calculee sur les sorties de `genererRetroactionEUF` ELLE-MEME, le
    // 1er septembre 2026. Elle decrit le comportement HISTORIQUE.
    const EMPREINTE_HISTORIQUE = '08ece479c49b884356d78607bc898aa2228724afbd92ee89c54574896fba3cba';

    // Le texte que l'ancienne fonction rendait sur le couple devie — conserve
    // ici pour pouvoir REJOUER l'histoire, jamais pour etre rendu a un eleve.
    const TEXTE_HISTORIQUE_ZERO_ZERO = " En prévision de l'EUF, l'absence d'erreur est exceptionnelle.";

    it("l'empreinte prouve que la déviation touche UN couple, et aucun autre", async () => {
        // On rejoue le balayage sur le registre d'aujourd'hui en REMETTANT a la
        // main la seule reponse qu'on a decide de changer. Si l'empreinte
        // historique revient, c'est que tout le reste est intact au caractere
        // pres : 481 400 couples inchanges, 1 devie, et la preuve tient en une
        // ligne. Si elle ne revient pas, une SECONDE divergence s'est glissee
        // quelque part — et les cas nommes ci-dessus diront laquelle.
        const { createHash } = await import('node:crypto');
        const h = createHash('sha256');
        const rejoue = (e, m) => (e === 0 && m === 0) ? TEXTE_HISTORIQUE_ZERO_ZERO : commeAvant(e, m);
        for (let e = 0; e <= 200; e++) {
            for (let m = 0; m <= 1200; m++) h.update(e + '|' + m + '|' + rejoue(e, m) + '\n');
        }
        for (let demi = 1; demi <= 400; demi++) {
            const e = demi / 2;
            for (let m = 1; m <= 600; m++) h.update(e + '|' + m + '|' + rejoue(e, m) + '\n');
        }
        expect(h.digest('hex')).toBe(EMPREINTE_HISTORIQUE);
    });

    it('la déviation est NOMMÉE : le registre dit pourquoi il ne conclut pas', () => {
        const r = P.calculer({}, { erreurs: 0, mots: 0 });
        expect(r.applicable).toBe(false);
        expect(r.raison).toBe('mots-absents');
        expect(r.texte).toBe('');
        // et le palier zero erreur reste vivant des qu'un texte a ete mesure
        expect(P.calculer({}, { erreurs: 0, mots: 1 }).palier.cle).toBe('sans_erreur');
    });

    it("le besoin en mots de la projection ne dépend d'AUCUNE formule", () => {
        // C'est le couplage que #667 a cree par accident, et que cette
        // sentinelle refuse de laisser revenir : `utiliseMots` appartient au
        // modele de NOTE ; la projection a son propre besoin, inconditionnel.
        // Commentaires retires avant d'asserter : le commentaire de la deviation
        // PARLE de `utiliseMots` pour expliquer le couplage qu'il refuse. Sans
        // ce filtrage, l'assertion echouerait sur la phrase qui la justifie.
        const codeSeul = lire('js/evaluation-projection.js')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        expect(codeSeul).not.toContain('utiliseMots');
        for (const modele of ['penalite_normalisee', 'ratio_cible', 'penalite_par_erreur']) {
            const critere = { modeleFormule: modele };
            expect(P.calculer(critere, { erreurs: 0, mots: 0 }).applicable, modele).toBe(false);
            expect(P.calculer(critere, { erreurs: 3, mots: 0 }).applicable, modele).toBe(false);
        }
    });
});

// ---------------------------------------------------------------------
// B. LES FRONTIÈRES
// ---------------------------------------------------------------------
// Le registre décide sur un RATIO NORMALISÉ là où l'ancien code décidait sur
// des mots-par-erreur. C'est une réécriture de comparaisons en virgule
// flottante : elle pouvait déplacer un verdict d'un côté à l'autre d'un seuil.
// Ces cas prennent les quatre frontières des DEUX côtés — une frontière testée
// d'un seul côté ne prouve pas où elle est.

describe('#668 · B — les quatre frontières, prises des deux côtés', () => {
    const palier = (erreurs, mots) => P.calculer({}, { erreurs, mots }).palier.cle;

    it('les seuils tombent juste : les divisions rendent EXACTEMENT les littéraux', () => {
        // Si l'une de ces égalités devenait fausse, une frontière se déplacerait
        // d'un cas — et aucun cas nommé ne le dirait forcément.
        expect(900 / 30 / 100).toBe(0.3);
        expect(900 / 30 / 75).toBe(0.4);
        expect(900 / 30 / 60).toBe(0.5);
        expect(900 / 30 / 30).toBe(1);
    });

    it('ratio = 0,3 (100 mots/erreur) est INCLUS dans « excellent »', () => {
        expect(P.calculer({}, { erreurs: 1, mots: 100 }).ratio).toBe(0.3);
        expect(palier(1, 100)).toBe('excellent');
        expect(palier(100, 9999)).toBe('tres_bien');      // 99,99 mots/erreur
    });

    it('ratio = 0,4 (75 mots/erreur) est INCLUS dans « très bien »', () => {
        expect(P.calculer({}, { erreurs: 4, mots: 300 }).ratio).toBe(0.4);
        expect(palier(4, 300)).toBe('tres_bien');
        expect(palier(400, 29999)).toBe('bien');          // 74,9975 mots/erreur
    });

    it('ratio = 0,5 (60 mots/erreur) est INCLUS dans « bien »', () => {
        expect(P.calculer({}, { erreurs: 5, mots: 300 }).ratio).toBe(0.5);
        expect(palier(5, 300)).toBe('bien');
        expect(palier(500, 29999)).toBe('risque');        // 59,998 mots/erreur
    });

    it('ratio = 1,0 (30 mots/erreur, le seuil de l\'EUF) est INCLUS dans « risqué »', () => {
        expect(P.calculer({}, { erreurs: 10, mots: 300 }).ratio).toBe(1);
        expect(palier(10, 300)).toBe('risque');
        expect(palier(1000, 29999)).toBe('echec');        // 29,999 mots/erreur
    });

    it('la somme pondérée décimale (demi-faute de ponctuation) déplace le ratio', () => {
        // 0,5 par erreur de ponctuation : le ratio doit suivre la somme
        // pondérée, pas le nombre brut de codes saisis.
        const entier = P.calculer({}, { erreurs: 10, mots: 600 });
        const demi = P.calculer({}, { erreurs: 5, mots: 600 });
        expect(entier.ratio).toBeCloseTo(0.5, 10);
        expect(demi.ratio).toBeCloseTo(0.25, 10);
        expect(P.calculer({}, { erreurs: 9.5, mots: 285 }).palier.cle).toBe('risque');
        expect(P.calculer({}, { erreurs: 30.5, mots: 584 }).palier.cle).toBe('echec');
    });

    it('le ratio ne lit JAMAIS le facteur de normalisation du cours', () => {
        // Les deux normes cohabitent : celle qui NOTE (600 mots en 601-101) et
        // celle de l'EUF (900). Un critère réglé à 600 doit être situé face à
        // 900 — sinon le dispositif perd sa raison d'être.
        const a = { facteurNormalisation: 600, paramsFormule: { facteurNormalisation: 600 } };
        const b = { facteurNormalisation: 300, paramsFormule: { facteurNormalisation: 300 } };
        const donnees = { erreurs: 15, mots: 584 };
        expect(P.calculer(a, donnees).ratio).toBe(P.calculer(b, donnees).ratio);
        expect(P.calculer(a, donnees).texte).toBe(P.calculer({}, donnees).texte);
    });
});

// ---------------------------------------------------------------------
// C. LE PALIER ZÉRO, ET CE QUI N'EST PAS APPLICABLE
// ---------------------------------------------------------------------

describe('#668 · C — zéro erreur, zéro mot, et le refus de deviner', () => {
    it('zéro erreur atteint un palier DÉDIÉ, pas le meilleur palier de ratio', () => {
        const r = P.calculer({}, { erreurs: 0, mots: 460 });
        expect(r.applicable).toBe(true);
        expect(r.palier.cle).toBe('sans_erreur');
        expect(r.ratio).toBe(0);
        expect(r.motsParErreur).toBeNull();
        expect(r.prefixe).toBe('');     // aucune moyenne à annoncer
    });

    it('zéro mot avec des erreurs : le code DIT qu\'il ne peut pas conclure', () => {
        const r = P.calculer({}, { erreurs: 59, mots: 0 });
        expect(r.applicable).toBe(false);
        expect(r.raison).toBe('mots-absents');
        expect(r.texte).toBe('');
        expect(r.palier).toBeNull();
    });

    it('« Aucune projection » refuse NOMMÉMENT, il ne rend pas du vide par accident', () => {
        const muet = P.appliquerAuCritere({}, 'aucune', {});
        const r = P.calculer(muet, { erreurs: 15, mots: 584 });
        expect(r.applicable).toBe(false);
        expect(r.raison).toBe('projection-desactivee');
        expect(r.texte).toBe('');
    });

    it('un modèle INCONNU (grille d\'une version plus récente) ne casse rien, et se DIT', () => {
        // Le nom du service est réglé DES DEUX CÔTÉS, à la même valeur : ce que
        // ce cas mesure est le repli du modèle, pas le libellé du défaut. Sans
        // ça, il comparerait deux choses qui diffèrent pour une raison qui n'est
        // pas la sienne (2 sept. 2026, #690).
        const futur = P.appliquerAuCritere({ modeleProjection: 'norme_du_futur' },
            'norme_du_futur', { nomServiceAide: NOM_DU_SERVICE_A_L_EPOQUE });
        futur.modeleProjection = 'norme_du_futur';
        expect(P.normaliser(futur).herite).toBe(true);
        expect(P.normaliser(futur).modeleId).toBe('norme_externe');
        expect(commeAvant(15, 584, futur)).toBe(commeAvant(15, 584));
    });

    it('le repli est SIGNALÉ (`herite`), il ne se fait pas en douce', () => {
        expect(P.normaliser({}).herite).toBe(true);
        expect(P.normaliser({ modeleProjection: 'norme_externe' }).herite).toBe(false);
    });
});

// ---------------------------------------------------------------------
// D. LE PARAMÉTRAGE AGIT
// ---------------------------------------------------------------------
// Sans ces cas, le gabarit pourrait être entièrement décoratif : la sentinelle
// A serait verte, et le registre appliquerait ses défauts quoi qu'on règle.
// C'est LE défaut que #667 a trouvé sur la formule, et qu'il faut refuser ici.

describe('#668 · D — ce qui est réglé dans le gabarit est ce qui juge', () => {
    const donnees = { erreurs: 15, mots: 584 };   // la copie réelle : 1 err / 39 mots

    it('changer la NORME déplace le verdict, sans toucher aux paliers', () => {
        const euf = P.appliquerAuCritere({}, 'norme_externe', { motsReference: 900, erreursTolerees: 30 });
        const severe = P.appliquerAuCritere({}, 'norme_externe', { motsReference: 900, erreursTolerees: 15 });
        const large = P.appliquerAuCritere({}, 'norme_externe', { motsReference: 500, erreursTolerees: 30 });

        expect(P.calculer(euf, donnees).palier.cle).toBe('risque');
        expect(P.calculer(severe, donnees).palier.cle).toBe('echec');
        expect(P.calculer(large, donnees).palier.cle).toBe('bien');
        // et les trois verdicts sont bien DIFFÉRENTS deux à deux
        expect(new Set([euf, severe, large].map((c) => P.calculer(c, donnees).palier.cle)).size).toBe(3);
    });

    it('un palier réécrit par l\'enseignant·e change la phrase rendue', () => {
        const perso = P.appliquerAuCritere({}, 'norme_externe', {}, [
            { cle: 'sans_erreur', sansErreur: true, ratioMax: null, texte: 'Aucune erreur : bravo.' },
            { cle: 'ok', ratioMax: 0.5, texte: 'Ton ratio tient la route.' },
            { cle: 'a_travailler', ratioMax: null, texte: 'Il faut consolider avant l\'épreuve.' }
        ]);
        expect(P.calculer(perso, donnees).texte).toContain('Il faut consolider avant l\'épreuve.');
        expect(P.calculer(perso, donnees).texte).not.toContain('EUF');
        expect(P.calculer(perso, { erreurs: 2, mots: 900 }).texte).toContain('Ton ratio tient la route.');
        expect(P.calculer(perso, { erreurs: 0, mots: 900 }).texte).toBe('Aucune erreur : bravo.');
    });

    it('le seuil se dit dans les DEUX unités — le ratio ne se montre jamais seul', () => {
        expect(P.libelleSeuil({})).toBe('1 erreur à chaque 30 mots (30 erreurs pour 900 mots)');
        const c = P.appliquerAuCritere({}, 'norme_externe', { motsReference: 1000, erreursTolerees: 20 });
        expect(P.libelleSeuil(c)).toBe('1 erreur à chaque 50 mots (20 erreurs pour 1000 mots)');
        // et un ratio de palier se retraduit en mots par erreur, pour le gabarit
        expect(P.motsParErreurDuRatio({}, 0.3)).toBe(100);
        expect(P.motsParErreurDuRatio({}, 1)).toBe(30);
    });

    it('une valeur hors bornes est ramenée dans les bornes, pas acceptée telle quelle', () => {
        expect(P.appliquerAuCritere({}, 'norme_externe', { erreursTolerees: -5 })
            .paramsProjection.erreursTolerees).toBe(1);
        expect(P.appliquerAuCritere({}, 'norme_externe', { motsReference: 'abc' })
            .paramsProjection.motsReference).toBe(900);
    });

    it('appliquerAuCritere n\'écrit PAS une copie des paliers par défaut', () => {
        // Règle #667 : migration à la lecture, aucune écriture de masse. Une
        // copie écrite figerait les défauts et les rendrait immodifiables d'un
        // seul endroit.
        const c = P.appliquerAuCritere({}, 'norme_externe', {});
        expect(c.paliersProjection).toBeUndefined();
        expect(P.normaliser(c).paliers.length).toBe(6);
    });
});

// ---------------------------------------------------------------------
// E. L'ORDRE DES PALIERS DÉCIDE DU VERDICT
// ---------------------------------------------------------------------

describe('#668 · E — un gabarit réordonné ne fabrique pas de faux verdict', () => {
    const DESORDRE = [
        { cle: 'echec', ratioMax: null, texte: 'Échec.' },
        { cle: 'bien', ratioMax: 0.5, texte: 'Bien.' },
        { cle: 'sans_erreur', sansErreur: true, ratioMax: null, texte: 'Aucune erreur.' },
        { cle: 'excellent', ratioMax: 0.3, texte: 'Excellent.' },
        { cle: 'risque', ratioMax: 1, texte: 'Risqué.' },
        { cle: 'tres_bien', ratioMax: 0.4, texte: 'Très bien.' }
    ];

    it('les paliers sont rendus dans l\'ordre CROISSANT des seuils', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, DESORDRE);
        expect(P.normaliser(c).paliers.map((p) => p.cle))
            .toEqual(['sans_erreur', 'excellent', 'tres_bien', 'bien', 'risque', 'echec']);
    });

    it('et le verdict suit cet ordre, pas l\'ordre de saisie', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, DESORDRE);
        // Sans le tri, la première ligne (« echec », seuil terminal) ou
        // « bien » seraient rencontrées avant « excellent ».
        expect(P.calculer(c, { erreurs: 3, mots: 500 }).palier.cle).toBe('excellent');
        expect(P.calculer(c, { erreurs: 7, mots: 500 }).palier.cle).toBe('bien');
        expect(P.calculer(c, { erreurs: 40, mots: 500 }).palier.cle).toBe('echec');
        expect(P.calculer(c, { erreurs: 0, mots: 500 }).palier.cle).toBe('sans_erreur');
    });

    it('un palier illisible est ÉCARTÉ, jamais deviné', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', {}, [
            { cle: 'sans_erreur', sansErreur: true, ratioMax: null, texte: 'Rien.' },
            { ratioMax: 0.5, texte: 'Sans clé : ignoré.' },
            null,
            'une chaîne',
            { cle: 'fin', ratioMax: null, texte: 'Fin.' }
        ]);
        expect(P.normaliser(c).paliers.map((p) => p.cle)).toEqual(['sans_erreur', 'fin']);
    });
});

// ---------------------------------------------------------------------
// F. LE NOM DU SERVICE D'AIDE
// ---------------------------------------------------------------------
// Le Centre d'aide en français n'existe plus au collège : il est devenu
// Passerelle +, et la transition n'est pas finie. L'application disait donc à
// des élèves de s'inscrire à un service disparu — l'exemple type de ce que ce
// chantier corrige. Le nom vide n'est PAS un cas dégradé : c'est une transition
// en cours, et le rendu doit être propre.

describe('#668 · F — le service d\'aide est un réglage, et son absence se rend proprement', () => {
    const donnees = { erreurs: 15, mots: 584 };

    it('le nom réglé remplace le jeton', () => {
        const c = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: 'Passerelle +' });
        expect(P.calculer(c, donnees).texte).toContain('Passerelle +');
        expect(P.calculer(c, donnees).texte).not.toContain('Centre d\'aide');
    });

    it('nom VIDE, jeton en COMPLÉMENT : la phrase part entière', () => {
        // « t'inscrire au {service}. » ne tient pas debout sans nom. Elle part,
        // plutôt que de laisser « t'inscrire au . » sous les yeux d'un élève.
        const c = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: '' });
        const t = P.calculer(c, donnees).texte;
        expect(t).toContain('près du seuil de l\'échec.');
        expect(t).not.toContain('inscrire');
        expect(t).not.toContain(P.JETON_SERVICE);
        expect(t.trim()).toMatch(/l'échec\.$/);
    });

    it('nom VIDE, jeton en APPOSITION : seule l\'apposition part, la phrase reste vraie', () => {
        // Décision 6bis : le gabarit LIVRÉ emploie l'apposition, parce que le
        // nom peut rester vide longtemps et qu'une phrase qui dégrade vers une
        // phrase encore utile vaut mieux qu'une phrase qui disparaît.
        // ↻ Lot 4, C.3 (4 sept. 2026) : un critère NEUF naît sans projection ; ce cas lit
        // donc la norme externe CHOISIE, avec les paliers en apposition du gabarit.
        // ↻ Lot 3a (26 oct. 2026) : les paliers d'un critère neuf sont ceux du 25 oct. — « Il pourrait être
        // utile de demander de l’aide : {service}. » ; sans nom, l'apposition part.
        const neuf = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: '' }, P.paliersGabaritNeuf());
        const t = P.calculer(neuf, donnees).texte;
        expect(t).toContain('Il pourrait être utile de demander de l’aide.');
        expect(t).not.toContain(P.JETON_SERVICE);
        expect(t).not.toMatch(/[:—–-]\s*\./);
    });

    it('et dans le gabarit livré, inscrire un nom AGIT — sinon le réglage serait décoratif', () => {
        const neuf = P.appliquerAuCritere({}, 'norme_externe', { nomServiceAide: '' }, P.paliersGabaritNeuf());
        neuf.paramsProjection.nomServiceAide = 'Passerelle +';
        const t = P.calculer(neuf, donnees).texte;
        expect(t).toContain('demander de l’aide : Passerelle +.');
    });

    it('le gabarit livré ne charrie AUCUN nom d\'établissement', () => {
        // Deux voies, à ne pas confondre (§6) : la migration reproduit « CAF »
        // au mot près ; le gabarit neuf ne le porte nulle part.
        const brut = JSON.stringify(P.gabaritNeuf()) + JSON.stringify(P.paliersGabaritNeuf());
        expect(brut).not.toMatch(/CAF|Centre d'aide|Passerelle/);
        // Lot 4, C.3 : le fragment neuf, c'est « aucune » — et rien d'autre.
        expect(P.gabaritNeuf()).toEqual({ modeleProjection: 'aucune', paramsProjection: {} });

        // …tandis que la MIGRATION le porte — c'est voulu, et il n'est écrit
        // qu'à UN endroit : le défaut déclaré du paramètre. Les paliers, eux,
        // ne portent que le jeton. Un seul lieu à corriger le jour où le nom
        // change pour de bon.
        expect(JSON.stringify(P.paliersMigration())).not.toMatch(/CAF|Centre d'aide/);
        expect(JSON.stringify(P.paliersMigration())).toContain(P.JETON_SERVICE);
    });

    // ↻ 2 SEPT. 2026 (#690) — CE QUE LE DEFAUT NE DOIT PLUS NOMMER.
    // Ce cas remplace celui qui verrouillait « Centre d'aide en français (CAF) »
    // comme defaut. Ce n'est pas un desarmement : la garde a change de sujet
    // parce que la decision a change. Le defaut est le texte servi a l'enseignant
    // qui n'a rien regle — et un enseignant qui n'enseigne pas le francais, dont
    // l'etablissement n'a ni CAF ni services adaptes, le lisait quand meme.
    // Ce qui est garde maintenant : le defaut existe, il atteint bien l'eleve sur
    // un critere migre, et il ne nomme NI discipline NI etablissement.
    it('le défaut servi à qui n\'a rien réglé ne nomme aucune discipline', () => {
        const defaut = P.normaliser({}).params.nomServiceAide;
        expect(defaut).toBe('Centre d\'aide du collège');
        expect(defaut).not.toMatch(/français|CAF|EUF|littérature/i);
        // et c'est bien ce nom-là qui atteint l'élève sur un critère migré
        expect(P.calculer({}, donnees).texte).toContain('Centre d\'aide du collège.');
    });

    it('aucun libellé de réglage ne nomme une discipline', () => {
        const modele = P.obtenirModele('norme_externe');
        const service = modele.parametres.filter(function(p) {
            return p.cle === 'nomServiceAide' || p.cle === 'lienServiceAide';
        });
        expect(service.length).toBe(2);
        service.forEach(function(p) {
            expect(p.libelle, p.cle).not.toMatch(/français|CAF|EUF|littérature/i);
        });
    });

    it('le lien voyage À PART, il n\'entre jamais dans le texte', () => {
        // Le PDF du Lot 6 décidera de sa présentation. Un lien collé dans une
        // phrase produit un « [lien] » orphelin ou un deux-points suspendu.
        const c = P.appliquerAuCritere({}, 'norme_externe', {
            nomServiceAide: 'Passerelle +', lienServiceAide: 'https://exemple.ca/inscription'
        });
        const r = P.calculer(c, donnees);
        expect(r.lienServiceAide).toBe('https://exemple.ca/inscription');
        expect(r.texte).not.toContain('http');
        expect(r.texte).not.toContain('[lien]');
    });
});

// ---------------------------------------------------------------------
// G. LE MODULE RESTE PUR
// ---------------------------------------------------------------------

describe('#668 · G — aucune dépendance, aucune surface d\'exécution neuve', () => {
    // Les commentaires PARLENT de DOM et de db : les retirer avant d'asserter,
    // sinon l'assertion échouerait sur une phrase qui explique la règle.
    const sansCommentaires = (src) =>
        src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const code = sansCommentaires(lire('js/evaluation-projection.js'));

    it('aucune expression interprétée', () => {
        expect(code).not.toMatch(/\beval\s*\(/);
        expect(code).not.toMatch(/new\s+Function\s*\(/);
        expect(code).not.toMatch(/set(Timeout|Interval)\s*\(\s*['"]/);
    });

    it('ni DOM, ni db, ni evaluationEnCours', () => {
        expect(code).not.toMatch(/\bdocument\./);
        // ↻ Lot 3a (26 oct. 2026) : le registre lit les deux noms de l'enseignant·e à leur source, le registre
        // des énoncés (`window.enoncesAlgo`, ou `require` en Node) — un registre, pas le DOM.
        expect(code).not.toMatch(/\bwindow\.(?!projectionAlgo|enoncesAlgo)/);
        expect(code).not.toMatch(/\bdb\./);
        expect(code).not.toMatch(/evaluationEnCours/);
        expect(code).not.toMatch(/localStorage|indexedDB/);
    });

    it('le registre ne lit JAMAIS le facteur de normalisation du cours', () => {
        // La norme qui NOTE et la norme de l'EUF sont deux choses. Si une ligne
        // d'ici lit facteurNormalisation, c'est un bug, pas une optimisation.
        expect(code).not.toContain('facteurNormalisation');
    });

    it('il s\'expose sous les deux formes, comme le registre de formules', () => {
        expect(typeof P.calculer).toBe('function');
        expect(typeof P.normaliser).toBe('function');
        expect(P.MODELE_PAR_DEFAUT).toBe('norme_externe');
        expect(P.listerModeles().map((m) => m.id)).toEqual(['norme_externe', 'aucune']);
    });
});

// ---------------------------------------------------------------------
// H. LE BRANCHEMENT (Lot 2) — UN SEUL LIEU DE VÉRITÉ POUR LE TEXTE
// ---------------------------------------------------------------------
// Le registre ne sert à rien tant que quelqu'un d'autre calcule la même chose
// ailleurs. Ces assertions verrouillent la disparition des copies, pas leur
// remplacement : un alias laissé derrière ferait revenir le problème.

describe('#668 · H — la règle ne vit plus qu\'à un seul endroit', () => {
    const sansCommentaires = (src) =>
        src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

    it('`genererRetroactionEUF` a DISPARU du code applicatif — pas d\'alias', () => {
        // Zéro-dette : la fonction ne doit pas survivre sous un autre nom, ni
        // en repli « au cas où ». Les commentaires peuvent la nommer pour
        // raconter d'où l'on vient ; le code, non.
        for (const f of ['js/evaluation-calcul.js', 'js/evaluation-retroaction.js',
                         'scripts/reparation-donnees-algorithmiques.js']) {
            expect(sansCommentaires(lire(f)), f).not.toContain('genererRetroactionEUF');
        }
    });

    it('aucun site ne réécrit les paliers de l\'EUF à la main', () => {
        // Les cinq verdicts étaient des chaînes littérales en quatre endroits.
        // Si l'un d'eux revient, c'est que quelqu'un a recopié plutôt qu'appelé.
        for (const f of ['js/evaluation-calcul.js', 'js/evaluation-retroaction.js',
                         'js/grilles.js', 'scripts/reparation-donnees-algorithmiques.js']) {
            const code = sansCommentaires(lire(f));
            expect(code, f).not.toContain('ce ratio est excellent');
            expect(code, f).not.toContain('mènerait à un échec automatique');
            expect(code, f).not.toContain('Centre d\'aide en français');
        }
    });

    it('les DEUX appelants passent par le registre, et ils sont bien deux', () => {
        const code = sansCommentaires(lire('js/evaluation-calcul.js'));
        expect((code.match(/_projectionEUF\(/g) || []).length).toBe(3);   // 1 déclaration + 2 appels
        expect(code).toContain('window.projectionAlgo.calculer(');
    });

    it('le script de réparation REFUSE d\'écrire sans les registres', () => {
        // Il écrit dans les données réelles. Un repli silencieux le ferait
        // réparer selon une règle que le gabarit ne pilote plus — c'est-à-dire
        // détruire proprement.
        const code = lire('scripts/reparation-donnees-algorithmiques.js');
        const codeSeul = sansCommentaires(code);
        expect(code).toMatch(/throw new Error\('\[reparation-algo\] REFUS/);
        expect(codeSeul).toContain('window.formulesAlgo.calculer(');

        // ⚠ VÉRIFIER L'APPEL, PAS SEULEMENT LA DÉCLARATION. Une première version
        // de cette assertion cherchait `exigerRegistres` dans le fichier : elle
        // restait VERTE quand on retirait l'appel, puisque la déclaration porte
        // le même nom. Trouvé par break-test. On compte donc les DEUX.
        expect(codeSeul).toMatch(/function\s+exigerRegistres\s*\(/);
        expect(codeSeul).toMatch(/^\s*exigerRegistres\s*\(\s*\)\s*;/m);

        // ⚠ ET LE MOTIF DE LA FORMULE EN DUR NE VISE PAS UN NOM DE VARIABLE.
        // La première version cherchait `/ mots * facteur` : réécrire la même
        // formule avec la constante 500 la contournait. C'est la MULTIPLICATION
        // après une division par les mots qui trahit la pénalité recopiée.
        expect(codeSeul).not.toMatch(/\/\s*mots\s*\*/);
    });

    it('le registre est chargé AVANT ses deux consommateurs dans index.html', () => {
        const html = lire('index.html');
        const registre = html.indexOf('js/evaluation-projection.js');
        expect(registre).toBeGreaterThan(-1);
        expect(registre).toBeLessThan(html.indexOf('js/grilles.js?'));
        expect(registre).toBeLessThan(html.indexOf('js/evaluation-calcul.js?'));
    });

    it('le registre est servi sous un jeton anti-cache, comme ses voisins', () => {
        // ⚠ CETTE ASSERTION EXIGEAIT L'ÉGALITÉ DES DEUX JETONS. C'était trop fort,
        // et elle a rougi à tort le 1er septembre : `evaluation-calcul.js` avait
        // été modifié (garde #671) et pas le registre. Deux fichiers ne bougent
        // pas toujours ensemble — coupler leurs jetons, c'est forcer à bumper un
        // fichier intact, ce que la sentinelle anti-cache du dépôt refuse par
        // ailleurs. L'invariant réel : le registre EST servi sous un jeton, et
        // c'est `sentinelle-anticache-fichiers-modifies` qui vérifie que tout
        // fichier MODIFIÉ en porte un du jour du build.
        const html = lire('index.html');
        const jeton = (f) => (html.match(new RegExp(f.replace(/\./g, '\\.') + '\\?v=([A-Za-z0-9]+)')) || [])[1];
        expect(jeton('js/evaluation-projection.js')).toMatch(/^\d{8}[a-z]+$/);
    });
});

// ---------------------------------------------------------------------
// I. LE GABARIT (Lot 3) — CE QUI EST OFFERT À L'ÉCRAN
// ---------------------------------------------------------------------

describe('#668 · I — le bloc projection du gabarit', () => {
    const grilles = lire('js/grilles.js');
    const sansCommentaires = (src) =>
        src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const code = sansCommentaires(grilles);

    it('les deux écrans de grille rendent le bloc, par le MÊME appel', () => {
        // Comme pour la formule (#667) : un seul rendu, deux contextes. Deux
        // rendus divergeraient le jour où l'un des deux serait modifié seul.
        // `${...}` : on compte les APPELS dans les gabarits, pas la déclaration.
        // Lot 4 (4 sept. 2026) : les deux écrans appellent `rendreCartesGabaritAlgo`, qui
        // seul rend le bloc (dans sa carte « Projection ») — un rendu, deux contextes.
        expect((code.match(/\$\{rendreCartesGabaritAlgo\(critere,/g) || []).length).toBe(2);
        expect((code.match(/(?<!function )rendreBlocProjectionAlgo\(critere, ctx\)/g) || []).length).toBe(1);   // l'appel, pas la déclaration
        expect(code).toContain('mode: "temp"');
        expect(code).toContain('mode: "grille"');
    });

    it('les dix handlers du bloc sont exportés — sinon il ne réagit à rien', () => {
        // Un export manquant produit un ReferenceError MUET : le champ ne fait
        // simplement rien, et l'enseignant·e croit avoir réglé quelque chose.
        [
            // ↻ Lot 3a (26 oct. 2026) : le menu du modèle est parti ; « Fixer / Retirer la limite » et
            // « Reprendre une de tes collections… » le remplacent.
            'fixerLimiteAlgo', 'retirerLimiteAlgo', 'reprendreCollectionProjectionHandler',
            'modifierParamProjectionTempHandler', 'modifierPalierProjectionTempHandler',
            'modifierParamProjectionGrilleHandler', 'modifierPalierProjectionGrilleHandler',
            'ajouterPalierProjectionTemp', 'supprimerPalierProjectionTemp',
            'ajouterPalierProjectionGrille', 'supprimerPalierProjectionGrille'
        ].forEach((h) => {
            expect(code, h).toContain('window.' + h + ' = ' + h + ';');
        });
    });

    it('zéro handler inline : tout passe par data-on-change ou data-action', () => {
        // Le bloc injecte du texte libre en innerHTML. Un onclick= dans cette
        // zone serait une surface d'exécution offerte au contenu saisi.
        const bloc = code.slice(code.indexOf('function rendreBlocProjectionAlgo'),
                                code.indexOf('function modifierProjectionCritereGrille'));
        expect(bloc.length).toBeGreaterThan(500);
        expect(bloc).not.toMatch(/\bon(click|change|input|blur|focus)\s*=/);
        expect(bloc).toContain('data-on-change=');
        expect(bloc).toContain('data-action=');
    });

    it('tout texte saisi par l\'enseignant·e est échappé avant injection', () => {
        const bloc = code.slice(code.indexOf('function rendreBlocProjectionAlgo'),
                                code.indexOf('function modifierProjectionCritereGrille'));
        // Les quatre porteurs de texte libre : libellé, verdict, phrase d'aide,
        // et le nom du service. Aucun ne doit atteindre le DOM sans esc().
        // ↻ Lot 3a : la recommandation passe par `aide` (`const aide = pal.texteAide || ''`), échappée de même.
        ['pal.libelle', 'pal.texte', 'aide'].forEach((champ) => {
            const motif = new RegExp('\\$\\{esc\\(' + champ.replace('.', '\\.'), 'g');
            expect(bloc, champ).toMatch(motif);
        });
        expect(bloc).toContain("const aide = pal.texteAide || '';");
        expect(bloc).toContain('esc(p.params[cleParam])');
    });

    it('un seuil illisible est REFUSÉ, jamais interprété comme zéro', () => {
        // Un palier qui glisse vers 0 changerait silencieusement les verdicts
        // de toutes les copies suivantes.
        expect(code).toContain('if (isNaN(n) || n <= 0) return false;');
        expect(code).toContain('marquerChampRefuse');
    });

    it('fixer la limite d\'un critère existant repart des défauts du modèle — comme le menu d\'hier', () => {
        // ↻ Lot 3a (26 oct. 2026) : le menu « Modèle de projection » est parti ; « Fixer une limite » fait ce
        // qu'il faisait pour un critère existant — les défauts déclarés, les paliers de migration (lus).
        const c = P.fixerLimite({ type: 'algorithmique', modeleProjection: 'aucune', paramsProjection: {} });
        expect(c.modeleProjection).toBe('norme_externe');
        expect(c.paramsProjection).toMatchObject({ motsReference: 900, erreursTolerees: 30, nomServiceAide: 'Centre d\'aide du collège' });
        expect(c.paliersProjection).toBeUndefined();
        expect(P.normaliser(c).paliers).toEqual(P.paliersMigration());
        expect(code).toContain('window.projectionAlgo.fixerLimite(c);');
    });

    it('l\'écriture côté grille enregistrée est UNIQUE, pas trois appels', () => {
        // Trois écritures séparées laisseraient, entre deux, une grille dont
        // les paliers ne correspondent pas à leur modèle.
        expect(code).toContain('async function modifierProjectionCritereGrille');
        expect(code).toMatch(/await db\.modifier\(cle\('grillesTemplates'\)/);
    });

    it('le jeton anti-cache de grilles.js a suivi sa modification', () => {
        const html = lire('index.html');
        const j = (f) => (html.match(new RegExp(f.replace(/\./g, '\\.') + '\\?v=([A-Za-z0-9]+)')) || [])[1];
        expect(j('js/grilles\\.js')).toBe(j('js/evaluation-projection\\.js'));
    });
});
