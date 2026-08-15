import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE — recherche dans la Carte d'alignement (15 août 2026)
// =======================================================================
//
// Demande de Grégoire : « un champ de recherche dans la toolbar de la carte
// d'alignement afin de trouver des mots clés dans la carte ». Arbitrages
// retenus par lui le même jour : la recherche mord AUSSI sur le libellé du
// type de bloc (« montre-moi toutes les évaluations »), et les résultats
// s'affichent en liste ET en halos sur le canevas.
//
// Ce qui est verrouillé ici :
//   A. les quatre gisements de texte sont fouillés — titre, description,
//      objectifs de leçon, ET libellé du type ;
//   B. accents et casse sont repliés dans les DEUX sens, un texte DÉCOMPOSÉ
//      (la forme que produit macOS) est trouvé comme un texte composé, et
//      l'extrait affiché tombe sur les bonnes lettres du texte D'ORIGINE ;
//   C. le seuil de deux caractères existe et n'est jamais silencieux ;
//   D. l'ordre des résultats est celui de la LECTURE de la carte, pas celui
//      de la création — c'est lui que suit « Entrée = suivant » ;
//   E. le résultat dit OÙ le mot a été trouvé (sinon une correspondance de
//      type se lit comme une correspondance de contenu) ;
//   F. cliquets de source : le halo ne peut pas repasser sous `:hover` dans
//      la cascade, et la liste échappe les données utilisateur.
//
// ⚠ CE QUE CETTE SENTINELLE NE COUVRE PAS, et pourquoi : le rendu réel du
// halo (contraste contre les douze fonds du canevas) et les gestes clavier
// ont été éprouvés AU NAVIGATEUR, pas ici — un bac à sable sans mise en page
// ne peut pas mesurer un `box-shadow`. Voir le bloc du 15 août dans
// SESSION.md pour les mesures.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const css = readFileSync(path.join(racine, 'styles.css'), 'utf8');
const html = readFileSync(path.join(racine, 'index.html'), 'utf8');

let api;

function monterModule() {
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '', value: '', hidden: false,
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const db = {
        getSync: (k, d) => (d !== undefined ? d : null),
        setSync: () => {}, get: async (k, d) => d, set: async () => {}
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? ''),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => [],
            addEventListener: () => {},
            createElement: fauxElement,
            createElementNS: fauxElement,
            execCommand: () => true,
            body: { appendChild() {}, removeChild() {} }
        }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'Test' }] }),
        sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    api = win.planificationCarte;
    return api;
}

function poserNoeud(id, type, extra) {
    const n = Object.assign({
        id, type, titre: '', description: '', x: 0, y: 0,
        parent: null, enfants: [], metadata: {}, cloneSourceId: null
    }, extra || {});
    api.etat.noeuds.set(id, n);
    return n;
}

const ids = (res) => res.map((r) => r.id);

beforeEach(() => {
    monterModule();
});

// -----------------------------------------------------------------------
describe('recherche · A — les quatre gisements de texte sont fouillés', () => {
    it('trouve dans le TITRE', () => {
        poserNoeud('n1', 'expose', { titre: 'Les postures de lecture' });
        expect(ids(api.chercherDansCarte('postures'))).toEqual(['n1']);
    });

    it('trouve dans la DESCRIPTION', () => {
        // La description ne s'affiche nulle part sur le bloc : sans la
        // fouiller, un mot-clé qui n'y vit que là serait introuvable — et
        // l'enseignant n'aurait aucun moyen de savoir pourquoi.
        poserNoeud('n1', 'expose', { titre: 'Séance 3', description: 'Marqueurs du discours' });
        expect(ids(api.chercherDansCarte('discours'))).toEqual(['n1']);
    });

    it('trouve dans un OBJECTIF de leçon', () => {
        poserNoeud('n1', 'lecon', {
            titre: 'Leçon 2',
            metadata: { objectifs: [{ id: 'o1', texte: 'Repérer les marqueurs de relation' }] }
        });
        expect(ids(api.chercherDansCarte('relation'))).toEqual(['n1']);
    });

    it('trouve par le LIBELLÉ DU TYPE — arbitrage de Grégoire', () => {
        // « Montre-moi toutes les évaluations. » Le bloc ne porte le mot
        // « évaluation » NULLE PART dans son texte : il ne peut être trouvé
        // que par son type.
        poserNoeud('n1', 'evaluation', { titre: 'Dissertation finale' });
        expect(ids(api.chercherDansCarte('evaluation'))).toEqual(['n1']);
    });

    it('un bloc qui ne correspond nulle part n’est PAS retourné', () => {
        poserNoeud('n1', 'expose', { titre: 'Les postures de lecture' });
        expect(api.chercherDansCarte('dissertation')).toEqual([]);
    });
});

// -----------------------------------------------------------------------
describe('recherche · B — accents, casse, et l’invariant de longueur', () => {
    it('sans accent trouve AVEC accent', () => {
        poserNoeud('n1', 'expose', { titre: 'Analyse littéraire' });
        expect(ids(api.chercherDansCarte('litteraire'))).toEqual(['n1']);
    });

    it('avec accent trouve SANS accent', () => {
        // Le repli doit jouer dans les deux sens : Grégoire tape avec accents
        // sur son Mac, mais ses imports peuvent en manquer.
        poserNoeud('n1', 'expose', { titre: 'Analyse litteraire' });
        expect(ids(api.chercherDansCarte('littéraire'))).toEqual(['n1']);
    });

    it('la casse est indifférente', () => {
        poserNoeud('n1', 'expose', { titre: 'DISSERTATION Critique' });
        expect(ids(api.chercherDansCarte('dissertation critique'))).toEqual(['n1']);
    });

    it('⚠ un texte DÉCOMPOSÉ (la forme de macOS) est quand même trouvé', () => {
        // LE cas qui commande toute la conception de la normalisation, et le
        // seul qui distingue vraiment les implémentations possibles.
        // « é » peut arriver DÉJÀ SÉPARÉ — « e » + U+0301 — c'est la forme
        // que produit macOS, celle de Grégoire, et elle voyage par
        // copier-coller depuis le Finder, un PDF ou une note. À l'écran les
        // deux formes sont IDENTIQUES : un titre introuvable serait
        // incompréhensible pour lui.
        const decompose = 'Litte\u0301rature et socie\u0301te\u0301';
        expect(decompose).not.toBe('Littérature et société');   // vraiment décomposé
        expect(decompose.normalize('NFC')).toBe('Littérature et société');
        poserNoeud('n1', 'expose', { titre: decompose });
        expect(ids(api.chercherDansCarte('societe'))).toEqual(['n1']);
        expect(ids(api.chercherDansCarte('littérature'))).toEqual(['n1']);
    });

    it('⚠ l’extrait tombe sur les BONNES lettres, accents compris', () => {
        // La contrepartie : on cherche dans le texte replié mais on affiche
        // un extrait découpé dans le texte D'ORIGINE. Sans table d'index, la
        // fenêtre glisse d'une lettre par accent rencontré avant la
        // trouvaille — ici il y en a quatre, donc le décalage serait visible.
        poserNoeud('n1', 'expose', { titre: 'Élève éprouvé à l’été : marqueurs de relation' });
        const ex = api.chercherDansCarte('marqueurs')[0].extrait;
        expect(ex.motif).toBe('marqueurs');
        expect(ex.avant.endsWith('été : ')).toBe(true);
        expect(ex.apres.startsWith(' de relation')).toBe(true);
    });

    it('⚠ … y compris quand le texte est décomposé', () => {
        // Même vérification sur la forme NFD : c'est là que la table d'index
        // gagne vraiment, puisque texte replié et texte d'origine n'ont même
        // plus la même longueur.
        const titre = 'E\u0301le\u0300ve e\u0301prouve\u0301 : marqueurs de relation';
        poserNoeud('n1', 'expose', { titre });
        const r = api.chercherDansCarte('marqueurs')[0];
        expect(r.extrait.motif).toBe('marqueurs');
        expect(r.extrait.apres.startsWith(' de relation')).toBe(true);
        // Et le texte replié est bien PLUS COURT que l'original : la preuve
        // qu'aucune égalité de longueur ne pouvait tenir ici.
        expect(api.normaliserRecherche(titre).length).toBeLessThan(titre.length);
    });

    it('le motif affiché conserve les accents du texte d’origine', () => {
        // On cherche sans accent, on doit lire AVEC : c'est le texte de
        // l'enseignant qu'on lui montre, pas sa version dépliée.
        poserNoeud('n1', 'expose', { titre: 'Analyse littéraire du poème' });
        const ex = api.chercherDansCarte('litteraire')[0].extrait;
        expect(ex.motif).toBe('littéraire');
    });
});

// -----------------------------------------------------------------------
describe('recherche · C — le seuil de deux caractères, jamais silencieux', () => {
    it('une seule lettre ne retourne rien', () => {
        // Avec les libellés de type dans le corpus, une lettre allume la
        // quasi-totalité de la carte : le résultat n'apprend rien.
        poserNoeud('n1', 'expose', { titre: 'Les postures de lecture' });
        expect(api.chercherDansCarte('l')).toEqual([]);
    });

    it('deux lettres cherchent', () => {
        poserNoeud('n1', 'expose', { titre: 'Les postures de lecture' });
        expect(ids(api.chercherDansCarte('le'))).toEqual(['n1']);
    });

    it('le seuil est ANNONCÉ à l’écran, pas subi', () => {
        // Un seuil muet se lit comme une panne. Le message existe dans la
        // source et cite le nombre, pour qu'il suive une éventuelle révision
        // du seuil au lieu de mentir.
        expect(sourceCarte).toMatch(/la recherche démarre à ' \+ RECHERCHE_MIN \+ ' caractères/);
    });

    it('un terme vide ou blanc ne retourne rien', () => {
        poserNoeud('n1', 'expose', { titre: 'Les postures de lecture' });
        expect(api.chercherDansCarte('')).toEqual([]);
        expect(api.chercherDansCarte('   ')).toEqual([]);
        expect(api.chercherDansCarte(null)).toEqual([]);
        expect(api.chercherDansCarte(undefined)).toEqual([]);
    });
});

// -----------------------------------------------------------------------
describe('recherche · D — l’ordre est celui de la lecture de la carte', () => {
    it('les résultats sortent de haut en bas, puis de gauche à droite', () => {
        // C'est l'ordre que suit « Entrée = résultat suivant ». L'ordre de
        // création ne veut rien dire à l'œil : deux blocs voisins à l'écran
        // peuvent avoir été posés à trois semaines d'écart.
        poserNoeud('bas',          'expose', { titre: 'marqueurs bas',    x: 100, y: 900 });
        poserNoeud('haut-droite',  'expose', { titre: 'marqueurs hd',     x: 800, y: 100 });
        poserNoeud('haut-gauche',  'expose', { titre: 'marqueurs hg',     x: 100, y: 100 });
        expect(ids(api.chercherDansCarte('marqueurs')))
            .toEqual(['haut-gauche', 'haut-droite', 'bas']);
    });
});

// -----------------------------------------------------------------------
describe('recherche · E — le résultat dit OÙ le mot a été trouvé', () => {
    it('une correspondance de TYPE est étiquetée « type », pas « titre »', () => {
        // Sans cette étiquette, chercher « evaluation » remonterait des
        // dizaines de blocs sans qu'on comprenne pourquoi — c'est la
        // contrepartie de l'arbitrage « fouiller aussi le type ».
        poserNoeud('n1', 'evaluation', { titre: 'Dissertation finale' });
        expect(api.chercherDansCarte('evaluation')[0].ou).toEqual(['type']);
    });

    it('un bloc qui correspond par plusieurs champs les liste TOUS', () => {
        poserNoeud('n1', 'lecon', {
            titre: 'Marqueurs',
            description: 'Les marqueurs de relation',
            metadata: { objectifs: [{ id: 'o1', texte: 'Repérer des marqueurs' }] }
        });
        const r = api.chercherDansCarte('marqueurs')[0];
        expect(r.ou).toEqual(['titre', 'description', 'objectif']);
    });

    it('⚠ le CONTENU prime sur le type pour l’extrait affiché', () => {
        // Quand un bloc correspond des deux façons, montrer l'extrait du
        // type serait montrer une information déjà affichée à côté du titre :
        // l'utilisateur croirait à une seconde trouvaille.
        poserNoeud('n1', 'evaluation', { titre: 'Grille d’evaluation maison' });
        const r = api.chercherDansCarte('evaluation')[0];
        expect(r.ou[0]).toBe('titre');
        expect(r.extrait.libelle).toBe('titre');
    });

    it('le champ « type » vient EN DERNIER dans les gisements', () => {
        // C'est ce qui garantit la règle ci-dessus, à la source.
        const n = poserNoeud('n1', 'evaluation', { titre: 'x', description: 'y' });
        const champs = api.champsCherchables(n);
        expect(champs[champs.length - 1].ou).toBe('type');
    });
});

// -----------------------------------------------------------------------
describe('recherche · F — cliquets de source et de cascade', () => {
    it('⚠ le halo est déclaré APRÈS `.planif-noeud:hover` dans la cascade', () => {
        // LE défaut qui a été mordu au navigateur le 15 août.
        // `.planif-noeud:hover` et `.planif-noeud.planif-noeud--trouve`
        // pèsent EXACTEMENT le même poids (0,2,0) : c'est l'ordre qui
        // tranche. Déclaré avant, le halo s'éteignait dès que le curseur
        // passait sur le bloc trouvé — au moment précis où on le regarde.
        const posHover = css.indexOf('.planif-noeud:hover');
        const posTrouve = css.indexOf('.planif-noeud.planif-noeud--trouve');
        expect(posHover).toBeGreaterThan(-1);
        expect(posTrouve).toBeGreaterThan(-1);
        expect(posTrouve).toBeGreaterThan(posHover);
    });

    it('⚠ le halo porte DEUX liserés, un clair et un sombre', () => {
        // Mesuré le 15 août sur les 12 fonds du canevas × 2 modes : l'ambre
        // seul tombait à 1,19:1 sur « Brume » (invisible), et l'ambre + un
        // seul liseré laissait passer les cinq fonds mi-tons. Retirer un
        // liseré rouvrirait exactement ces cas — d'où ce cliquet.
        const bloc = css.slice(
            css.indexOf('.planif-noeud.planif-noeud--trouve {'),
            css.indexOf('.planif-noeud.planif-noeud--trouve-actif {')
        );
        expect(bloc).toContain('var(--alerte-bordure-attention)');
        expect(bloc).toMatch(/rgba\(255,\s*255,\s*255/);
        expect(bloc).toMatch(/rgba\(0,\s*0,\s*0/);
    });

    it('le halo N’UTILISE PAS le bleu de la sélection', () => {
        // « Trouvé » et « sélectionné » sont deux états distincts : la
        // recherche allume justement des blocs qu'on n'a pas sélectionnés.
        const bloc = css.slice(
            css.indexOf('.planif-noeud.planif-noeud--trouve {'),
            css.indexOf('.planif-noeud.selected.planif-noeud--trouve,')
        );
        expect(bloc).not.toContain('--planif-couleur-selection');
    });

    it('la liste des résultats ÉCHAPPE toutes les données utilisateur', () => {
        // Règle non négociable du projet : tout innerHTML qui injecte du
        // texte saisi passe par echapperHtml(). Titre, libellé de type,
        // couleur, id et les trois tronçons de l'extrait — six insertions.
        const rendu = sourceCarte.slice(
            sourceCarte.indexOf('function rendreResultatsRecherche()'),
            sourceCarte.indexOf('function allerAuResultat(')
        );
        expect(rendu).toContain('echapperHtml(titre)');
        expect(rendu).toContain('echapperHtml(r.label)');
        expect(rendu).toContain('echapperHtml(r.id)');
        expect(rendu).toContain('echapperHtml(ex.avant)');
        expect(rendu).toContain('echapperHtml(ex.motif)');
        expect(rendu).toContain('echapperHtml(ex.apres)');
        // Aucune concaténation de champ de résultat SANS échappement.
        expect(rendu).not.toMatch(/\+\s*r\.(titre|label|id)\s*\+/);
    });

    it('le champ est un `type="search"` — donc utilisable en mode archive', () => {
        // La règle CSS `body.mode-archive input:not([type="search"])` gèle
        // les saisies. Chercher dans une carte archivée ne modifie rien :
        // le type n'est pas décoratif, il porte cette exemption.
        expect(html).toMatch(/<input type="search" id="planif-recherche-champ"/);
    });

    it('le champ vit DANS la barre d’outils de la carte', () => {
        // C'est la demande, littéralement : « dans la toolbar ».
        const barre = html.slice(
            html.indexOf('<div class="planif-header-toolbar">'),
            html.indexOf('<!-- Zone de travail -->')
        );
        expect(barre).toContain('id="planif-recherche-zone"');
        expect(barre).toContain('id="planif-recherche-champ"');
    });

    it('aucun handler inline dans la zone de recherche', () => {
        // CSP `script-src \'self\'` : zéro onclick=/onchange= dans le HTML.
        const zone = html.slice(
            html.indexOf('id="planif-recherche-zone"'),
            html.indexOf('<div class="planif-toolbar-droite">')
        );
        expect(zone).not.toMatch(/\son[a-z]+=/);
    });

    it('le cache de normalisation se vide quand la carte est reconstruite', () => {
        // Le cache porte sur les TEXTES de la carte. S'il survivait à une
        // reconstruction, un titre corrigé continuerait d'être cherché sous
        // son ancienne forme — une recherche qui ment sur l'état courant.
        const reconstruire = sourceCarte.slice(
            sourceCarte.indexOf('function reconstruireDOM()'),
            sourceCarte.indexOf('function restaurerSnapshot(')
        );
        expect(reconstruire).toContain('_cacheNormalisation.clear()');
        expect(reconstruire).toContain('rafraichirRecherche()');
    });

    it('le surlignage périme la copie de la loupe', () => {
        // La loupe montre une COPIE prise une fois. Sans invalidation, elle
        // afficherait la carte d'AVANT la recherche : les halos y seraient
        // absents, or c'est justement à la loupe qu'on veut les lire.
        const surligner = sourceCarte.slice(
            sourceCarte.indexOf('function appliquerSurlignageRecherche()'),
            sourceCarte.indexOf('function messageRecherche()')
        );
        expect(surligner).toContain('_loupeCopieValide = false');
    });
});
