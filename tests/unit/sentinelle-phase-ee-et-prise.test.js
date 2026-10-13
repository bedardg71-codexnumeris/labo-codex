import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { suitDansLaFonction } from './_helpers/tranche.js';

// ═══════════════════════════════════════════════════════════════════════════
// CHANGER DE TYPE SANS RECRÉER LE BLOC
//
// 15 août 2026 — « Quand je monte un alignement, il serait pratique de pouvoir
// changer de phase d'enseignement sans nécessairement créer un nouveau bloc et
// y coller le contenu. » Suivi de la bonne question : « est-ce que ça aurait un
// effet sur la prise qu'on peut avoir sur un bloc dans son en-tête ? » Oui —
// et c'est l'objet de la moitié de ce fichier.
//
// 16 août 2026 — GÉNÉRALISÉ À TOUS LES TYPES, à sa demande. Le fichier garde
// son nom parce qu'il garde son objet : la permutation et la prise. Ce qui
// change, c'est que la borne n'est plus « les cinq phases » mais « la famille »,
// et que la poignée est passée en PREMIER élément de toute en-tête.
// ═══════════════════════════════════════════════════════════════════════════

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = readFileSync(path.join(racine, 'js', 'planification-carte.js'), 'utf8');
const cssBrut = readFileSync(path.join(racine, 'styles.css'), 'utf8');

// ⚠⚠ LES COMMENTAIRES SONT RETIRÉS, ET CE N'EST PAS DE L'HYGIÈNE.
// Ce fichier lit le CSS comme du texte. Le 16 août, la prose des commentaires
// s'est mise à contenir des renvois de la forme « cf. `.planif-noeud-prise
// { margin-right }` » — et `css.match(/\.planif-noeud-prise\s*\{[^}]*\}/)`
// attrapait CE renvoi, pas la règle. Deux cas rougissaient en désignant une
// accolade de commentaire, avec un message qui ne pouvait pas mettre sur la
// piste. Un oracle qui lit du source doit lire le CODE : mieux documenter le
// projet ne doit jamais casser ses tests.
const css = cssBrut.replace(/\/\*[\s\S]*?\*\//g, '');

let store;
let win;
function monter() {
    store = {};
    win = chargerScript('js/planification-carte.js', {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => k,
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (f) => { f(); return 0; }
    });
    win.cle = (k) => k;
    win.planificationDonnees = {
        getIndex: () => ({ active: 'c1' }), sauvegarderCarte: () => {}, chargerCarte: () => null
    };
    return win.planificationCarte;
}

function poser(api, id, type, extra) {
    api.etat.noeuds.set(id, Object.assign({
        id, type, titre: 'Bloc', x: 0, y: 0, parent: null, enfants: [],
        metadata: {}, cloneSourceId: null
    }, extra || {}));
    return api.etat.noeuds.get(id);
}

/** Un représentant par famille permutable, pour les cas qui doivent toutes les couvrir. */
const REPRESENTANTS = [
    ['competence', 'idee-maitresse'],
    ['factuelle', 'metacognitive'],
    ['expose', 'revision'],
    ['pratique-guidee', 'pratique-autonome']
];

describe('A · la permutation de type, et sa BORNE', () => {
    let api;
    beforeEach(() => { api = monter(); });

    it('permute à l’intérieur de CHAQUE famille', () => {
        REPRESENTANTS.forEach(([depuis, vers], i) => {
            poser(api, 'n' + i, depuis);
            expect(api.definirTypeNoeud('n' + i, vers), depuis + ' → ' + vers).toBe(true);
            expect(api.etat.noeuds.get('n' + i).type).toBe(vers);
        });
    });

    it('les cinq phases sont EXACTEMENT celles de la méthode', () => {
        expect(api.PHASES_EE).toEqual(
            ['ouverture', 'modelisation', 'pratique-guidee', 'pratique-autonome', 'cloture']);
    });

    it('⚠ REFUSE de sortir de la famille — la borne est dans la PORTE', () => {
        // Bornage décidé par Grégoire le 15 août et RECONDUIT le 16 : la
        // permutation s'arrête à la famille. Exposé et Pratique guidée sont
        // techniquement interchangeables (même `TYPES_ACTIVITE`, même durée,
        // mêmes objectifs servis), mais passer de l'un à l'autre n'est plus un
        // changement de phase, c'est un changement de MÉTHODE.
        //
        // ⚠ La borne est vérifiée DANS la porte, pas seulement dans le <select>
        // qui l'appelle : un menu, un raccourci ou un import qui l'appellerait
        // demain hériterait sinon d'une liberté que personne n'a décidée.
        poser(api, 'n1', 'pratique-guidee');
        expect(api.definirTypeNoeud('n1', 'activite')).toBe(false);
        expect(api.definirTypeNoeud('n1', 'evaluation')).toBe(false);
        expect(api.definirTypeNoeud('n1', 'factuelle')).toBe(false);
        expect(api.etat.noeuds.get('n1').type).toBe('pratique-guidee');

        // Et une connaissance ne devient pas une intention curriculaire.
        poser(api, 'n2', 'factuelle');
        expect(api.definirTypeNoeud('n2', 'competence')).toBe(false);
        expect(api.etat.noeuds.get('n2').type).toBe('factuelle');
    });

    it('⚠ Séquence et Leçon n’ont PAS de famille — « elles ne sont pas intervertibles »', () => {
        // Décision de Grégoire, 16 août. Une leçon porte une semaine, un rang de
        // séance et des objectifs qu'une séquence n'a pas : permuter les
        // orphelinerait. La porte doit refuser, et l'en-tête ne doit pas offrir
        // de menu du tout.
        expect(api.famillePermutableDe('sequence')).toBeNull();
        expect(api.famillePermutableDe('lecon')).toBeNull();
        poser(api, 'n1', 'lecon');
        expect(api.definirTypeNoeud('n1', 'sequence')).toBe(false);
        expect(api.etat.noeuds.get('n1').type).toBe('lecon');
    });

    it('la durée et les objectifs servis SURVIVENT à la permutation', () => {
        // C'est ce qui rend la permutation sûre : les membres d'une famille sont
        // dans les mêmes tables. Si l'un en sortait, une permutation perdrait une
        // durée en silence.
        poser(api, 'n1', 'ouverture', { metadata: { duree: 25, objectifsServis: ['obj-1'] } });
        api.definirTypeNoeud('n1', 'cloture');
        const m = api.etat.noeuds.get('n1').metadata;
        expect(m.duree).toBe(25);
        expect(m.objectifsServis).toEqual(['obj-1']);
    });

    it('⚠⚠ TOUTES les tables du module répondent uniformément DANS une famille', () => {
        // L'invariant qui autorise la généralisation du 16 août, et le seul qui
        // la rende sûre. Si un type entrait demain dans `TYPES_AVEC_DUREE` sans
        // ses frères, une permutation perdrait sa durée — et rien d'autre ici ne
        // le dirait.
        const TABLES = ['TYPES_AVEC_DUREE', 'TYPES_HORS_CLASSE',
            'TYPES_AVEC_NIVEAU_COGNITIF', 'TYPES_SERVANTS_OBJECTIF'];
        api.FAMILLES_PERMUTABLES.forEach((famille) => {
            TABLES.forEach((nomTable) => {
                const table = api[nomTable];
                const dedans = famille.filter((t) => table.indexOf(t) !== -1);
                expect(dedans.length === 0 || dedans.length === famille.length,
                    `${nomTable} coupe la famille [${famille}] en deux : ` +
                    `[${dedans}] y sont, les autres non. Une permutation y perdrait des données.`
                ).toBe(true);
            });
        });
    });

    it('un clone suit le type de sa source', () => {
        // ⚠ LE CLONE EST FABRIQUÉ PAR LE MODULE, pas posé à la main. Première
        // version : un nœud avec `cloneSourceId` écrit directement dans la
        // Map. Le test échouait — et il avait RAISON de le faire : les clones
        // se résolvent par `_cloneIndex`, un index privé alimenté à la
        // création. Un clone fabriqué à la main n'y est pas, donc le cas ne
        // testait pas la propagation, il testait mon montage.
        win.planificationDonnees.chargerCarte = () => ({
            compteur: 2, compteurLiens: 0, liens: [],
            noeuds: [
                { id: 'src', type: 'modelisation', titre: 'Bloc', x: 0, y: 0,
                  parent: null, enfants: [], metadata: {}, cloneSourceId: null },
                { id: 'copie', type: 'modelisation', titre: 'Bloc', x: 60, y: 60,
                  parent: null, enfants: [], metadata: {}, cloneSourceId: 'src' }
            ]
        });
        api.chargerCarte('c1');
        // ⚠ Le chargeur PRÉFIXE les ids (`src` → `planif-src`).
        const src = 'planif-src', copie = 'planif-copie';
        expect(api.etat.noeuds.get(copie), 'la carte d’essai ne s’est pas chargée').toBeTruthy();
        expect(api.etat.noeuds.get(copie).cloneSourceId).toBe(src);

        api.definirTypeNoeud(src, 'cloture');
        expect(api.etat.noeuds.get(copie).type).toBe('cloture');
    });
});

describe('A bis · la VISÉE d’une évaluation — un modificateur, pas un type', () => {
    let api;
    beforeEach(() => { api = monter(); });

    it('⚠⚠ le TYPE reste `evaluation` — c’est lui qui porte le pont vers les productions', () => {
        // LA raison d'être du modificateur. `main.js` moissonne « le nœud
        // Évaluation unique de la leçon » par `type === 'evaluation'`, et
        // l'export classe ses sections pareil. Deux types nommés autrement, et
        // les deux cessent de fonctionner EN SILENCE.
        poser(api, 'n1', 'evaluation');
        api.definirViseeEvaluation('n1', 'formative');
        expect(api.etat.noeuds.get('n1').type).toBe('evaluation');
        expect(api.etat.noeuds.get('n1').metadata.visee).toBe('formative');
    });

    it('⚠ « non choisi » n’est PAS « certificative » — le plan de cours n’affirme que ce qui est posé', () => {
        // Le menu doit bien montrer une entrée, donc il montre « certificative ».
        // Mais le LIBELLÉ, lui, part dans les exports : tant que Grégoire ne
        // s'est pas prononcé, il reste « Évaluation », comme avant le 16 août.
        const n = poser(api, 'n1', 'evaluation');
        expect(api.viseeChoisie(n)).toBeNull();
        expect(api.viseeEvaluation(n)).toBe('certificative');
        expect(api.obtenirLabelNoeud(n)).toBe('Évaluation');

        // Dès qu'il choisit — MÊME « certificative » — le libellé se précise.
        expect(api.definirViseeEvaluation('n1', 'certificative')).toBe(true);
        expect(api.obtenirLabelNoeud(api.etat.noeuds.get('n1'))).toBe('Évaluation certificative');
    });

    it('refuse une visée hors liste, et refuse sur un bloc qui n’est pas une évaluation', () => {
        poser(api, 'n1', 'evaluation');
        expect(api.definirViseeEvaluation('n1', 'diagnostique')).toBe(false);
        poser(api, 'n2', 'activite');
        expect(api.definirViseeEvaluation('n2', 'formative')).toBe(false);
        expect(api.etat.noeuds.get('n2').metadata.visee).toBeUndefined();
    });
});

describe('B · LA PRISE — ce que le sélecteur retire, la poignée le rend', () => {
    let api;
    beforeEach(() => { api = monter(); });

    it('⚠ la poignée est le PREMIER élément de TOUTE en-tête', () => {
        // Demande de Grégoire, 16 août : « je veux qu'elle soit le premier
        // élément à gauche dans l'entête ». Y compris sur Séquence et Leçon, qui
        // gardent un libellé inerte — la prise ne doit pas dépendre du contenu.
        ['pratique-autonome', 'factuelle', 'competence', 'expose', 'evaluation', 'lecon', 'sequence']
            .forEach((type, i) => {
                poser(api, 'n' + i, type);
                const html = api.contenuNoeudHTML(api.etat.noeuds.get('n' + i));
                expect(html, type + ' : pas de poignée').toContain('planif-noeud-prise');
                // PREMIER : rien d'autre de l'en-tête ne la précède.
                const enTete = html.indexOf('planif-noeud-entete');
                const prise = html.indexOf('planif-noeud-prise');
                const select = html.indexOf('<select');
                const libelle = html.indexOf('planif-noeud-type"');
                [select, libelle].forEach((pos) => {
                    if (pos !== -1) {
                        expect(prise, type + ' : la poignée n’est pas en tête').toBeLessThan(pos);
                    }
                });
                expect(prise).toBeGreaterThan(enTete);
            });
    });

    it('chaque famille offre SES frères, et seulement eux', () => {
        poser(api, 'n1', 'pratique-autonome');
        const phase = api.contenuNoeudHTML(api.etat.noeuds.get('n1'));
        api.PHASES_EE.forEach((t) => expect(phase).toContain('value="' + t + '"'));
        expect(phase).not.toContain('value="activite"');
        expect(phase).not.toContain('value="evaluation"');

        poser(api, 'n2', 'factuelle');
        const conn = api.contenuNoeudHTML(api.etat.noeuds.get('n2'));
        ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive']
            .forEach((t) => expect(conn).toContain('value="' + t + '"'));
        expect(conn).not.toContain('value="competence"');

        // Une évaluation offre ses DEUX visées, jamais un type.
        poser(api, 'n3', 'evaluation');
        const eval3 = api.contenuNoeudHTML(api.etat.noeuds.get('n3'));
        expect(eval3).toContain('planif-noeud-visee');
        expect(eval3).toContain('value="formative"');
        expect(eval3).toContain('value="certificative"');
        expect(eval3).not.toContain('value="evaluation"');
    });

    it('⚠ Séquence et Leçon gardent un libellé INERTE — aucun menu', () => {
        ['sequence', 'lecon'].forEach((type, i) => {
            poser(api, 'c' + i, type);
            const html = api.contenuNoeudHTML(api.etat.noeuds.get('c' + i));
            expect(html, type).toContain('planif-noeud-type"');
            expect(html, type + ' : un menu est apparu là où il ne doit pas y en avoir')
                .not.toContain('planif-noeud-type-select');
        });
    });

    it('⚠ le SÉLECTEUR coupe le geste, la POIGNÉE le laisse passer', () => {
        // Le glisser part d'un `pointerdown` sur le bloc entier. Un <select> doit
        // donc couper la propagation, sinon il est inutilisable au doigt — mais
        // c'est exactement ce qui lui retire son rôle de PRISE. La poignée ne
        // porte AUCUN écouteur : c'est ce qui la rend saisissable.
        // ⮕ L'asymétrie EST le correctif. « Harmoniser » les deux le défait.
        expect(source).toMatch(
            /selecteur\.addEventListener\(evt, function\(e\) \{ e\.stopPropagation\(\); \}\)/);
        // ⚠ ORACLE REFAIT (15 août). Le premier cherchait « pas d'addEventListener
        // dans les 400 caractères suivant `planif-noeud-prise` » — il rougissait
        // sur un COMMENTAIRE qui nomme la poignée près d'un écouteur voisin. Il
        // mesurait la prose, pas le code. Celui-ci dit la vraie condition :
        // AUCUN code ne va chercher la poignée, donc personne ne peut lui poser
        // d'écouteur.
        expect(source).not.toMatch(/querySelector\w*\(['"][^'"]*planif-noeud-prise/);
        expect(source).not.toMatch(/getElementsByClassName\(['"]planif-noeud-prise/);
    });

    it('la poignée offre une vraie cible tactile, sans peser sur l’en-tête', () => {
        const base = css.match(/\.planif-noeud-prise\s*\{[^}]*\}/);
        const apres = css.match(/\.planif-noeud-prise::after\s*\{[^}]*\}/);
        const entete = css.match(/\.planif-noeud-entete\s*\{[^}]*\}/);
        expect(base, 'règle de la poignée introuvable').toBeTruthy();
        expect(apres, 'la cible tactile de la poignée a disparu').toBeTruthy();
        expect(apres[0]).toMatch(/position:\s*absolute/);
        // Sans `position: relative` sur la poignée, les décalages se résolvent
        // contre un ancêtre lointain et la zone atterrit ailleurs, en silence.
        expect(base[0]).toMatch(/position:\s*relative/);

        const px = (bloc, prop) => {
            const m = bloc.match(new RegExp('(?:^|[;{\\s])' + prop + ':\\s*(-?[\\d.]+)px'));
            return m ? parseFloat(m[1]) : null;
        };
        // ⚠⚠ LA CONTRAINTE A CHANGÉ DE CÔTÉ LE 16 AOÛT. La poignée débordait de
        // 28 px à GAUCHE, dans le couloir nu que l'en-tête réservait à la
        // pastille d'entrée. Ce couloir est passé à DROITE de la poignée, qui
        // occupe désormais le coin. Le débord droit reprend donc ce couloir —
        // mais il doit s'arrêter AVANT le sélecteur, qui coupe la propagation :
        // au-delà, la poignée lui volerait ses clics.
        const couloir = px(base[0], 'margin-right');
        const gap = px(entete[0], 'gap');
        expect(couloir, 'le couloir de la pastille d’entrée a disparu').toBeGreaterThan(0);
        expect(-px(apres[0], 'right'),
            'le débord droit dépasse le couloir : il recouvre le sélecteur'
        ).toBeLessThanOrEqual(couloir + gap);
        // Et à gauche, il ne sort pas du bloc : le padding gauche de l'en-tête
        // est tout ce qui reste de son côté.
        const padGauche = entete[0].match(/padding:\s*[\d.]+px\s+[\d.]+px\s+[\d.]+px\s+([\d.]+)px/);
        expect(padGauche, 'le padding gauche de l’en-tête n’est plus explicite').toBeTruthy();
        expect(-px(apres[0], 'left'),
            'le débord gauche sort du bloc'
        ).toBeLessThanOrEqual(parseFloat(padGauche[1]));
    });

    it('⚠ la pastille d’entrée se range à DROITE de la poignée, sans la recouvrir', () => {
        // Les deux valeurs se lisent ensemble : changer l'une sans l'autre les
        // fait se chevaucher, et le symptôme serait « la poignée ne se saisit
        // plus » — sur le geste que Grégoire a signalé comme le plus risqué.
        const badge = css.match(/\.planif-badge-entree\s*\{[^}]*\}/);
        expect(badge, 'la pastille d’entrée a disparu').toBeTruthy();
        const gauche = parseFloat(badge[0].match(/left:\s*([\d.]+)px/)[1]);
        const entete = css.match(/\.planif-noeud-entete\s*\{[^}]*\}/)[0];
        const padGauche = parseFloat(
            entete.match(/padding:\s*[\d.]+px\s+[\d.]+px\s+[\d.]+px\s+([\d.]+)px/)[1]);
        expect(gauche, 'la pastille est repassée devant la poignée')
            .toBeGreaterThan(padGauche);
    });

    it('⚠ le libellé ne se TRONQUE jamais — une famille = une couleur', () => {
        // LE fait qui commande cette règle : depuis le 16 août, TOUS les types
        // d'une famille partagent un jeton. La couleur ne distingue donc RIEN à
        // l'intérieur d'une famille : le texte est l'unique discriminant. Un
        // premier essai laissait le sélecteur rétrécir — mesuré à 99 px, il
        // affichait « PRATIQUE … » pour guidée COMME pour autonome.
        const FAMILLES = {
            'enseignement-explicite': ['ouverture', 'modelisation', 'pratique-guidee',
                'pratique-autonome', 'cloture'],
            'intention': ['competence', 'idee-maitresse'],
            'connaissance': ['factuelle', 'conceptuelle', 'procedurale', 'metacognitive'],
            'organisation': ['sequence', 'lecon'],
            'deroulement': ['expose', 'activite', 'soutien', 'revision']
        };
        Object.entries(FAMILLES).forEach(([jeton, types]) => {
            types.forEach((t) => {
                expect(css, `--planif-couleur-${t} ne pointe plus vers la famille ${jeton}`)
                    .toMatch(new RegExp(
                        '--planif-couleur-' + t + ':\\s*var\\(--planif-couleur-' + jeton + '\\)'));
            });
        });
        // ⚠ Et le jeton retiré ne doit pas revenir par la bande : « préalable »
        // était la dernière nuance intra-famille du module.
        expect(css).not.toMatch(/--planif-couleur-prerequis:\s*#/);

        const bloc = css.match(/\.planif-noeud-type-select,\s*\.planif-noeud-visee\s*\{[^}]*\}/);
        expect(bloc, 'règle du sélecteur introuvable').toBeTruthy();
        // ⚠ PLANCHER PROPORTIONNEL depuis le 16 août. Un plancher FIXE calibré
        // sur « Pratique autonome » réserverait 130 px à « Exposé » et pousserait
        // la durée à la ligne sur des blocs où tout tient — une régression sur
        // toute la carte au moment où le sélecteur s'étend à tous les types.
        expect(bloc[0], 'le plancher est redevenu fixe : les familles courtes vont déborder')
            .toMatch(/min-width:\s*calc\(var\(--planif-select-ch/);
        // Le repli vaut « Pratique autonome » (17), donc l'ancien comportement.
        expect(bloc[0]).toMatch(/--planif-select-ch,\s*17\)/);
        // Il ne doit pas s'ÉTIRER non plus : sinon il pousse la durée à la ligne
        // même sur un bloc assez large pour les deux.
        expect(bloc[0]).toMatch(/flex:\s*0\s+1\s+auto/);
        // Et l'en-tête doit pouvoir passer à la ligne, sinon le plancher
        // ci-dessus fait déborder la durée hors du bloc au lieu de la descendre.
        expect(css.match(/\.planif-noeud-entete\s*\{[^}]*\}/)[0]).toMatch(/flex-wrap:\s*wrap/);
    });

    it('le plancher annoncé suit bien le plus long libellé de la famille', () => {
        // Sans ce cas, `plancherSelecteur` pourrait rendre une constante et la
        // règle CSS ci-dessus resterait verte en ne protégeant plus rien.
        poser(api, 'n1', 'expose');           // famille courte : « Activité » = 8
        poser(api, 'n2', 'pratique-guidee');  // famille longue : « Pratique autonome » = 17
        const court = api.contenuNoeudHTML(api.etat.noeuds.get('n1'));
        const long = api.contenuNoeudHTML(api.etat.noeuds.get('n2'));
        const lire = (h) => parseInt(h.match(/--planif-select-ch:\s*(\d+)/)[1], 10);
        expect(lire(court)).toBe(8);
        expect(lire(long)).toBe(17);
        expect(lire(court)).toBeLessThan(lire(long));
    });
});

describe('C · le verbe devenu inexact est DIT, jamais réécrit (verdict 3.4)', () => {
    let api;
    beforeEach(() => { api = monter(); });

    it('⚠⚠ la permutation ne touche AUCUN verbe de lien', () => {
        // Un verbe posé est une donnée de l'enseignant. Le corriger en douce
        // serait pire que de le laisser inexact, parce que la correction serait
        // invisible.
        poser(api, 'src', 'conceptuelle');
        poser(api, 'cbl', 'ouverture');
        api.etat.liens.set('l1', { id: 'l1', source: 'src', cible: 'cbl', type: 'se_reactive_dans' });
        api.definirTypeNoeud('cbl', 'modelisation');
        expect(api.etat.liens.get('l1').type).toBe('se_reactive_dans');
    });

    it('reconnaît qu’un verbe accordé cesse de l’être', () => {
        // « Se réactive dans » se suggère sur une Ouverture (TYPES_REACTIVATION).
        // Devenue Modélisation, la suggestion tombe à « s'acquiert par » — le
        // verbe posé n'est plus celui que le module proposerait.
        poser(api, 'src', 'conceptuelle');
        poser(api, 'cbl', 'ouverture');
        const lien = { id: 'l1', source: 'src', cible: 'cbl', type: 'se_reactive_dans' };
        api.etat.liens.set('l1', lien);
        expect(api.verbeEstSuggere(lien), 'accordé avant la permutation').toBe(true);
        api.definirTypeNoeud('cbl', 'modelisation');
        expect(api.verbeEstSuggere(api.etat.liens.get('l1')),
            'désaccordé après la permutation').toBe(false);
    });

    it('⚠ ne signale QUE la bascule accordé → désaccordé', () => {
        // Un verbe qui divergeait DÉJÀ est un choix délibéré. Le compter
        // reviendrait à reprocher à Grégoire, à chaque permutation, un verbe
        // qu'il a posé exprès. C'est la raison du relevé pris AVANT.
        // `.+?` et non `[^\]]+` : l'index est lui-même entre crochets
        // (`accordeAvant[entrySV[0]]`), donc une classe qui exclut `]` s'arrête
        // au mauvais crochet.
        expect(source).toMatch(/accordeAvant\[.+?\]\s*&&\s*!verbeEstSuggere/);
        // Et le relevé est bien pris AVANT l'écriture, pas après — sans quoi il
        // compterait l'état d'arrivée contre lui-même et ne dirait jamais rien.
        expect(suitDansLaFonction(source, /releverVerbesDeNoeud\(id\)/, /paire\[1\]\(id/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});
