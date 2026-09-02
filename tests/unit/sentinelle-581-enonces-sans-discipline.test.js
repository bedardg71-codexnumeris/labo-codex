/**
 * #581 · UNE RÉTROACTION NE PARLE QUE DE LA DISCIPLINE DE CELUI QUI L'ÉCRIT
 *
 * Le défaut, en une phrase : un enseignant de chimie qui compte des erreurs
 * voyait son critère rebaptisé « Français écrit » dans le PDF remis à son élève,
 * et lisait « Ta rédaction contient N erreurs de français » là où il n'y a pas
 * de rédaction. Huit littéraux dans quatre fichiers du moteur — sept nommés au
 * mandat, le huitième (`evaluation-retroaction.js`, l'état vide du volet
 * spécifique) trouvé le 2 septembre parce que la commande de contrôle du mandat
 * ne cherchait pas ce motif-là.
 *
 * Ce que ce banc verrouille, et pourquoi chaque point coûte :
 *
 *   A — LE TEXTE D'HIER, AU CARACTÈRE PRÈS. Les élèves de Grégoire ne doivent
 *       voir aucune différence. C'est la contrainte la plus dure du lot : elle
 *       interdit d'« améliorer » les phrases en passant.
 *   B — LE TEXTE DE TOUT LE MONDE. Un critère nommé autrement ne produit ni
 *       « français », ni « rédaction ». C'est l'énoncé 4 d'`OBJECTIF-COHORTE-1`.
 *   C — LES DEUX REPLIS SONT DISTINCTS. Un titre nomme ce qu'une section
 *       contient (« Erreurs annotées ») ; une phrase s'adresse à quelqu'un
 *       (« ce critère »). Les confondre donnait « Concentre-toi sur Erreurs
 *       annotées » à un élève.
 *   D — LA PROSE DE L'UTILISATEUR N'EST PAS RÉÉCRITE. Le registre refermait le
 *       trou d'un jeton retiré en repassant sur TOUT le texte : « Attention : 3
 *       erreurs ; revois ! » ressortait « Attention: 3 erreurs; revois! ». Un
 *       lot dont l'objet est de respecter la prose d'autrui ne peut pas la
 *       corriger dans son dos.
 *   E — LE SILENCE EST UN CHOIX. Une chaîne vide fait taire l'énoncé ;
 *       `undefined` — l'absence de réglage — retombe sur le défaut.
 *   F — LE TRANSPORT. Troisième fois que ce trou se creuse après #667 et #668 :
 *       ce que l'auteur·e a réglé doit ARRIVER, et le schéma reste FERMÉ.
 *   G — LA SENTINELLE DE NON-RETOUR. Aucun littéral de discipline ne revient
 *       dans les quatre fichiers du moteur.
 *
 * ⚠ A à F testent des EFFETS, pas la présence de lignes dans un fichier. G est
 * le seul point statique, et il est là pour ce qu'une assertion d'effet ne peut
 * pas voir : une chaîne réintroduite demain sur un chemin que ce banc n'exerce
 * pas. Il porte sa propre commande, et un témoin qui rend non-zéro.
 */
import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

/** Le critère de Grégoire : celui dont les textes ne doivent PAS bouger. */
function critereFrancais(extra) {
    return Object.assign({
        id: 'CR_FR', nom: 'Français écrit', ponderation: 20, type: 'algorithmique'
    }, extra || {});
}

/** Le critère d'un autre : celui pour qui le défaut existait. */
function critereChimie(extra) {
    return Object.assign({
        id: 'CR_CH', nom: 'Précision des calculs', ponderation: 20, type: 'algorithmique'
    }, extra || {});
}

let enonces;
beforeAll(() => {
    enonces = chargerScript('js/evaluation-enonces.js').enoncesAlgo;
});

/* ============================================================ A — LE TEXTE D'HIER */

describe('#581 · A — les élèves de Grégoire ne voient aucune différence', () => {
    /**
     * ⚠ CES QUATRE CHAÎNES SONT COPIÉES DES SITES D'ORIGINE, PAS DU REGISTRE.
     * Les relire depuis `enoncesAlgo` rendrait le test tautologique : il
     * passerait quel que soit le texte. Elles viennent de `git show
     * 6f9bb69a:js/evaluation-calcul.js` (l. 680), `…:js/evaluation-retroaction.js`
     * (l. 785, 854, 487).
     */
    it('A.a le décompte, mode simple — au caractère près', () => {
        expect(enonces.enonce(critereFrancais(), 'decompte', { erreurs: 12, mots: 500 }))
            .toBe('Ta rédaction contient 12 erreurs de français pour 500 mots.');
    });

    it('A.b le décompte porte la mention pondérée EXACTEMENT où elle était', () => {
        // Mode catégories : « …de français (5.5 points) pour 500 mots. »
        expect(enonces.enonce(critereFrancais(), 'decompte',
            { erreurs: 12, mots: 500, points: ' (5.5 points)' }))
            .toBe('Ta rédaction contient 12 erreurs de français (5.5 points) pour 500 mots.');
    });

    it('A.c le singulier reste le singulier, et zéro n\'est pas un pluriel', () => {
        expect(enonces.enonce(critereFrancais(), 'decompte', { erreurs: 1, mots: 500 }))
            .toBe('Ta rédaction contient 1 erreur de français pour 500 mots.');
        expect(enonces.enonce(critereFrancais(), 'decompte', { erreurs: 0, mots: 500 }))
            .toBe('Ta rédaction contient 0 erreur de français pour 500 mots.');
    });

    it('A.d le défi prioritaire, ce qui reste à travailler, et l\'état vide', () => {
        expect(enonces.enonce(critereFrancais(), 'priorite', {}))
            .toBe('la qualité du français écrit est à travailler en priorité');
        expect(enonces.enonce(critereFrancais(), 'concentre', {}))
            .toBe('Concentre-toi sur la qualité du français');
        expect(enonces.enonce(critereFrancais(), 'aucune', {}))
            .toBe('Aucun tampon ni erreur de français annotés.');
    });

    it('A.e le nom est lu SANS accent ni casse, et le mot est entier', () => {
        // « FRANCAIS », « Qualité du français » : même modèle, mêmes textes.
        expect(enonces.normaliser({ nom: 'FRANCAIS' }).modeleId).toBe('discipline_francais');
        expect(enonces.normaliser({ nom: 'Qualité du français' }).modeleId).toBe('discipline_francais');
        // ⚠ La frontière est le MOT, pas la sous-chaîne : « Franchise » ne passe pas.
        expect(enonces.normaliser({ nom: 'Franchise du propos' }).modeleId).toBe('generique');
    });
});

/* ================================================= B — LE TEXTE DE TOUT LE MONDE */

describe('#581 · B — un critère nommé autrement ne parle plus de français', () => {
    const CLES = ['decompte', 'priorite', 'concentre', 'aucune'];

    it('B.a aucun des quatre énoncés ne contient « français »', () => {
        CLES.forEach(cle => {
            const texte = enonces.enonce(critereChimie(), cle, { erreurs: 12, mots: 500 });
            expect(texte.toLowerCase(), `énoncé « ${cle} »`).not.toMatch(/fran[çc]ais/);
        });
    });

    it('B.b « rédaction » disparaît aussi — elle est aussi fausse que « français »', () => {
        CLES.forEach(cle => {
            const texte = enonces.enonce(critereChimie(), cle, { erreurs: 12, mots: 500 });
            expect(texte.toLowerCase(), `énoncé « ${cle} »`).not.toMatch(/rédaction/);
        });
    });

    it('B.c le décompte ne porte PAS le nom du critère — décision du 2 sept. 2026', () => {
        // Le nom titre déjà le panneau et la ligne du PDF où cette phrase sort ;
        // le répéter dans la phrase ne dit rien de plus à l'élève.
        expect(enonces.enonce(critereChimie(), 'decompte', { erreurs: 12, mots: 500 }))
            .toBe('Ta production contient 12 erreurs pour 500 mots.');
    });

    it('B.d les phrases qui le demandent portent bien le nom, tel qu\'il est écrit', () => {
        expect(enonces.enonce(critereChimie(), 'priorite', {}))
            .toBe('Précision des calculs est à travailler en priorité');
        expect(enonces.enonce(critereChimie(), 'concentre', {}))
            .toBe('Concentre-toi sur Précision des calculs');
    });

    it('B.e un modèle explicite SUPPLANTE le nom — le code choisit un défaut, pas un verdict', () => {
        // Un critère nommé « Français écrit » dont l'auteur·e a choisi le
        // modèle générique obtient le générique. Le nom n'est qu'un défaut.
        const c = critereFrancais({ modeleEnonces: 'generique' });
        expect(enonces.enonce(c, 'concentre', {})).toBe('Concentre-toi sur Français écrit');
        // Et l'inverse : un critère de chimie qui CHOISIT les textes d'origine.
        const inv = critereChimie({ modeleEnonces: 'discipline_francais' });
        expect(enonces.enonce(inv, 'concentre', {})).toBe('Concentre-toi sur la qualité du français');
    });
});

/* ================================================ C — LES DEUX REPLIS SONT DISTINCTS */

describe('#581 · C — un titre et une phrase ne disent pas l\'absence pareil', () => {
    it('C.a le titre d\'une section sans critère lisible nomme ce qu\'elle contient', () => {
        expect(enonces.libelleCritere(null)).toBe('Erreurs annotées');
        expect(enonces.libelleCritere({ nom: '   ' })).toBe('Erreurs annotées');
    });

    it('C.b une PHRASE sans nom ne dit jamais « Erreurs annotées »', () => {
        // Le défaut mesuré le 2 septembre : « Concentre-toi sur Erreurs annotées ».
        ['decompte', 'priorite', 'concentre'].forEach(cle => {
            const texte = enonces.enonce({ type: 'algorithmique' }, cle, { erreurs: 12, mots: 500 });
            expect(texte, `énoncé « ${cle} »`).not.toMatch(/Erreurs annotées/);
        });
        expect(enonces.enonce({ type: 'algorithmique' }, 'concentre', {}))
            .toBe('Concentre-toi sur ce critère');
    });

    it('C.c le titre porte le nom du critère dès qu\'il y en a un', () => {
        expect(enonces.libelleCritere(critereChimie())).toBe('Précision des calculs');
    });

    it('C.d le critère algorithmique est trouvé dans la grille, et l\'absence rend null', () => {
        const grille = { criteres: [{ id: 'x', type: 'standard', nom: 'Cohérence' }, critereChimie()] };
        expect(enonces.critereAlgorithmique(grille).nom).toBe('Précision des calculs');
        expect(enonces.critereAlgorithmique({ criteres: [] })).toBe(null);
        expect(enonces.critereAlgorithmique(null)).toBe(null);
    });
});

/* ============================================ D — LA PROSE DE L'UTILISATEUR EST INTOUCHÉE */

describe('#581 · D — le registre ne corrige pas la typographie d\'autrui', () => {
    it('D.a l\'espace française avant « ; : ! ? » survit', () => {
        // Mesuré le 2 septembre : le nettoyage global rendait
        // « Attention: 3 erreurs; revois ton travail! »
        expect(enonces.rendre('Attention : {erreurs} erreurs ; revois ton travail !', { erreurs: 3 }))
            .toBe('Attention : 3 erreurs ; revois ton travail !');
    });

    it('D.b un jeton retiré referme SON trou, et rien d\'autre', () => {
        expect(enonces.rendre('Revois {critere}, puis recommence.', { critere: '' }))
            .toBe('Revois, puis recommence.');
        expect(enonces.rendre('Ta production contient {erreurs} erreur{s}{points} pour {mots} mots.',
            { erreurs: 12, s: 's', mots: 500 }))
            .toBe('Ta production contient 12 erreurs pour 500 mots.');
    });

    it('D.c un jeton non fourni n\'atteint JAMAIS l\'élève sous forme d\'accolades', () => {
        const texte = enonces.rendre('Il reste {critere} et {inconnu} à voir.', {});
        expect(texte).not.toMatch(/\{critere\}/);
        // Un jeton que le registre ne connaît pas n'est pas le sien : il reste.
        expect(texte).toMatch(/\{inconnu\}/);
    });
});

/* ================================================== E — LE SILENCE EST UN CHOIX */

describe('#581 · E — vider une zone fait taire l\'énoncé, ne le remet pas au défaut', () => {
    it('E.a une chaîne VIDE est un réglage, et elle est respectée', () => {
        const c = critereChimie({ modeleEnonces: 'generique', enonces: { concentre: '' } });
        expect(enonces.enonce(c, 'concentre', {})).toBe('');
        // Les autres clés ne sont pas emportées par le silence de celle-là.
        expect(enonces.enonce(c, 'priorite', {})).toBe('Précision des calculs est à travailler en priorité');
    });

    it('E.b `undefined` — l\'absence de réglage — retombe sur le défaut', () => {
        const c = critereChimie({ modeleEnonces: 'generique', enonces: { concentre: undefined } });
        expect(enonces.enonce(c, 'concentre', {})).toBe('Concentre-toi sur Précision des calculs');
    });

    it('E.c un texte propre est rendu tel quel, jetons remplis', () => {
        const c = critereChimie({
            modeleEnonces: 'generique',
            enonces: { decompte: 'Il reste {erreurs} imprécision{s} sur {mots} points.' }
        });
        expect(enonces.enonce(c, 'decompte', { erreurs: 3, mots: 40 }))
            .toBe('Il reste 3 imprécisions sur 40 points.');
    });

    it('E.d `appliquerAuCritere` N\'ÉCRIT PAS les défauts dans les données', () => {
        // Les recopier les figerait : une correction du registre n'atteindrait
        // plus les grilles enregistrées, et chaque grille partagée
        // transporterait quatre phrases que personne n'a écrites.
        const c = critereChimie();
        enonces.appliquerAuCritere(c, 'generique', enonces.enoncesParDefaut('generique'));
        expect(c.modeleEnonces).toBe('generique');
        expect(c.enonces).toBeUndefined();

        // Un texte qui DIFFÈRE du défaut, lui, est bien écrit — et seul.
        enonces.appliquerAuCritere(c, 'generique',
            Object.assign(enonces.enoncesParDefaut('generique'), { concentre: 'Revois tes calculs.' }));
        expect(Object.keys(c.enonces)).toEqual(['concentre']);
    });

    it('E.f un modèle inconnu ne fait pas taire le critère — il retombe et le DIT', () => {
        const c = critereChimie({ modeleEnonces: 'modele_dune_version_future' });
        const p = enonces.normaliser(c);
        expect(p.herite).toBe(true);
        expect(p.modeleId).toBe('generique');
        expect(enonces.enonce(c, 'concentre', {})).toBe('Concentre-toi sur Précision des calculs');
    });
});

/* ========================================================== F — LE TRANSPORT */

describe('#581 · F — ce que l\'auteur·e a réglé ARRIVE chez le destinataire', () => {
    function critereRegleEnonces() {
        return critereChimie({
            modeleEnonces: 'generique',
            enonces: { concentre: 'Revois la conduite du calcul.', decompte: '' }
        });
    }
    function grilleReglee() {
        return {
            id: 'GR_581', nom: 'Grille de chimie',
            criteres: [critereRegleEnonces()],
            dateCreation: '2026-09-02T00:00:00Z',
            dansBibliotheque: true,
            metadata_cc: { auteur_original: 'Test 581', licence: 'CC BY-NC-SA 4.0', contributeurs: [] }
        };
    }

    let win, winIE;
    beforeAll(() => {
        const db = { getSync: (cle, defaut) => (defaut !== undefined ? defaut : null) };
        win = chargerScript('js/partage-schemas.js');
        chargerScript('js/partage-validation.js', { db }, win);
        chargerScript('js/partage-format.js', { db }, win);
    });
    beforeEach(() => { winIE = chargerScript('js/import-export.js'); });

    it('F.a le PARTAGE transporte le modèle ET les textes', () => {
        const c = win.partageFormat.projeterEntite(grilleReglee(), 'grille').criteres[0];
        expect(c.modeleEnonces).toBe('generique');
        expect(c.enonces.concentre).toBe('Revois la conduite du calcul.');
    });

    it('F.b une chaîne VIDE traverse le partage — c\'est un réglage, pas une absence', () => {
        const c = win.partageFormat.projeterEntite(grilleReglee(), 'grille').criteres[0];
        expect(c.enonces.decompte).toBe('');
    });

    it('F.c l\'IMPORT transporte le modèle ET les textes', () => {
        const g = winIE.assainirObjet(grilleReglee(), winIE.SCHEMAS_IMPORT.grille);
        expect(g.criteres[0].modeleEnonces).toBe('generique');
        expect(g.criteres[0].enonces.concentre).toBe('Revois la conduite du calcul.');
    });

    it('F.d les DEUX schémas restent FERMÉS — un champ étranger n\'entre pas', () => {
        const gr = grilleReglee();
        gr.criteres[0].enonces.charge_utile = '<script>alert(1)</script>';

        const partage = win.partageFormat.projeterEntite(gr, 'grille').criteres[0];
        expect(partage.enonces.charge_utile).toBeUndefined();

        const imp = winIE.assainirObjet(gr, winIE.SCHEMAS_IMPORT.grille).criteres[0];
        expect(imp.enonces.charge_utile).toBeUndefined();
    });

    it('F.e `modeleEnonces` est déclaré des DEUX côtés — sans lui, les textes seraient lus sous un autre modèle', () => {
        expect(win.partageSchemas.SCHEMA_ENTITE.grille.champs.criteres.schema.modeleEnonces).toBeDefined();
        expect(winIE.SCHEMAS_IMPORT.grille.criteres.schema.modeleEnonces).toBeDefined();
    });
});

/* ============================================ G — LA SENTINELLE DE NON-RETOUR */

describe('#581 · G — aucun littéral de discipline ne revient dans le moteur', () => {
    /**
     * Le geste que ce point reproduit, et qui doit rester rejouable à la main :
     *
     *   grep -nEi "français|francais" js/synthese-retroaction-rendu.js \
     *     js/synthese-retroaction-data.js js/evaluation-retroaction.js \
     *     js/evaluation-calcul.js
     *
     * ⚠ Les COMMENTAIRES sont exclus, et c'est délibéré : ils décrivent le
     * défaut corrigé, et les effacer priverait la prochaine session du motif.
     * Ce sont les chaînes de CODE qui sont interdites.
     */
    const FICHIERS_MOTEUR = [
        'js/synthese-retroaction-rendu.js',
        'js/synthese-retroaction-data.js',
        'js/evaluation-retroaction.js',
        'js/evaluation-calcul.js'
    ];

    /** Retire les commentaires `//` et `/* *\/`, garde le code. */
    function codeSeul(source) {
        return source
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .split('\n')
            .filter(l => !/^\s*(\/\/|\*)/.test(l))
            .join('\n');
    }

    /**
     * Les lignes de CODE portant un mot ACCENTUÉ de discipline.
     *
     * ⚠ LA CÉDILLE ET L'ACCENT SONT LE DISCRIMINANT, ET C'EST DÉLIBÉRÉ. Une
     * première version extrayait les littéraux de chaîne par expression
     * régulière ; elle avalait des blocs entiers de code sur le premier
     * gabarit multiligne venu, et a rendu un faux rouge le 2 septembre. Or un
     * IDENTIFIANT JavaScript ne porte ici ni « ç » ni « é »
     * (`_compterErreursFrancaisBilan`, `recurrents.francais` s'écrivent sans),
     * tandis qu'un texte lu par un élève les porte forcément. Le critère est
     * donc plus simple ET plus sûr que l'analyse : ce qui reste après lui est
     * du texte, pas du code.
     * ⮕ Ce qu'il NE couvre pas, et l'assume : un littéral qui écrirait
     * « francais » sans cédille. Il serait fautif en français avant de l'être ici.
     */
    function lignesFautives(rel, motif) {
        return codeSeul(readFileSync(path.join(racine, rel), 'utf8'))
            .split('\n')
            .filter(l => motif.test(l));
    }

    it('G.a aucun des quatre fichiers ne porte « français » dans son CODE', () => {
        FICHIERS_MOTEUR.forEach(rel => {
            expect(lignesFautives(rel, /français/i),
                `${rel} porte encore un littéral de discipline`).toEqual([]);
        });
    });

    it('G.b ni « rédaction », qui est aussi fausse pour qui corrige une partition', () => {
        FICHIERS_MOTEUR.forEach(rel => {
            expect(lignesFautives(rel, /rédaction/i),
                `${rel} porte encore « rédaction »`).toEqual([]);
        });
    });

    it('G.c TÉMOIN — le même motif rend NON-ZÉRO là où il doit rendre non-zéro', () => {
        // ⚠ Un zéro sans témoin ressemble à une bonne nouvelle. Si la fonction
        // `codeSeul` se mettait à tout avaler, G.a et G.b passeraient sur un
        // fichier vide. Le registre, LUI, doit porter ces chaînes : c'est sa
        // raison d'être. Ce témoin échoue si la mesure a cessé de mesurer.
        expect(lignesFautives('js/evaluation-enonces.js', /français/i).length).toBeGreaterThan(0);
        expect(lignesFautives('js/evaluation-enonces.js', /rédaction/i).length).toBeGreaterThan(0);
    });

    it('G.d le registre est CHARGÉ par index.html, avant tous ses consommateurs', () => {
        // Un registre que rien ne charge rend `window.enoncesAlgo` indéfini, et
        // chaque site d'appel jetterait. Mesuré le 2 septembre : le module
        // existait sur disque et n'était référencé nulle part.
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        const pos = (f) => html.indexOf(`js/${f}.js`);
        expect(pos('evaluation-enonces')).toBeGreaterThan(-1);
        ['grilles', 'evaluation-calcul', 'evaluation-retroaction', 'synthese-retroaction-data']
            .forEach(consommateur => {
                expect(pos('evaluation-enonces'),
                    `le registre doit être chargé avant ${consommateur}.js`)
                    .toBeLessThan(pos(consommateur));
            });
    });
});
