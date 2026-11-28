/**
 * « PAR STANDARDS » EN VUE SIMPLE, À L'ESSAI (mandat du 21 nov. 2026 ; décision de Grégoire, 14 h 19 : « il faut que la
 * vue simple soit fonctionnelle avant la release »). Rapport : `plans de travail/RAPPORT-2026-11-21-par-standards-vue-simple.md`.
 * Le parcours se juge sous navigateur (`tests/integration/vue-simple.spec.js`, describe « à l'essai ») ; ici, ce qui se
 * juge sans lui.
 *
 * V1. La famille se lit au TYPE, jamais au nom. Pour toute pratique qui n'est pas de la famille `cibles`, la lecture neuve
 *     rend EXACTEMENT ce que rendait l'ancienne (`_famille` de js/vue-simple.js au commit 4d653e9f, recopiée ici) : les
 *     modèles actuels et le stock (les pratiques nommées « Par standards » par l'ancien modèle, du 10 au 21 nov., qui sont de
 *     la famille « par sélection de productions ») gardent leurs écrans.
 * V2. Les deux cartes actuelles sont mot pour mot celles d'avant ; la troisième porte « À l'essai ».
 * V3. Les cibles, une par ligne ; les refus ; les poids (égaux d'office, jamais touchés s'ils ont été réglés).
 * V4. Le réglage garde chaque cible ENTIÈRE (énoncé, critères, poids, « terminale » de la vue étendue).
 * V5. Rien ne s'efface : la vue simple n'écrit ni les inscriptions ni l'ensemble en direct ; la question du retrait est
 *     celle de l'assistant (une seule source) ; « CIB » ne s'affiche pas.
 *
 * Break-tests : rapport, section « La preuve ».
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const W = { addEventListener() {} };
const D = chargerScript('js/vue-simple-donnees.js', {}, W).VueSimpleDonnees;
const IC = chargerScript('js/pratiques/inscriptions-cibles.js', { db: { getSync: () => [] }, cle: (k) => k, echapperHtml: (s) => String(s) }, {}).InscriptionsCibles;
const VS = lire('js/vue-simple.js');

/** `_famille` de js/vue-simple.js au commit 4d653e9f (avant ce lot), sans le groupe : la référence de V1. */
function familleAvantLeLot(p) {
    const type = p ? String((p.configuration && p.configuration.type) || p.type || (p.config && p.config.type) || '') : '';
    if (/standard/i.test(type)) return 'standards';
    if (/sp[ée]cification/i.test(type)) return 'specifications';
    return 'autre';
}

const CORPUS = [
    { nom: 'Par sélection de productions', type: 'standards', configuration: { type: 'standards' } },
    { nom: 'Par standards', type: 'standards', configuration: { type: 'standards' } },                 // le stock du 10 au 21 nov.
    { nom: 'Par standards', configuration: { type: 'standards' } },
    { nom: 'Par standards', type: 'standards' },
    { nom: 'Par spécifications', type: 'specifications', configuration: { type: 'specifications' } },
    { nom: 'Par standards', type: 'specifications', configuration: { type: 'specifications' } },
    { nom: 'Sommative', type: 'sommative', configuration: { type: 'sommative' } },
    { nom: 'Dénotation', type: 'denotation', configuration: { type: 'denotation' } },
    { nom: 'Ancienne', config: { type: 'STANDARDS' } },
    { nom: 'Spécification', type: 'Spécifications' },
    { nom: 'Sans type' },
    {},
    null
];

describe('V1. La famille se lit au type, jamais au nom', () => {
    it('hors de la famille `cibles`, la lecture neuve rend ce que rendait l\'ancienne, pour chaque pratique du corpus', () => {
        CORPUS.forEach((p) => expect([p && p.nom, D.familleDeLaPratique(p)]).toEqual([p && p.nom, familleAvantLeLot(p)]));
    });

    it('une pratique nommée « Par standards » de la famille par sélection reste de cette famille (le stock n\'est pas relu)', () => {
        expect(D.familleDeLaPratique({ nom: 'Par standards', type: 'standards', configuration: { type: 'standards' } })).toBe('standards');
    });

    it('la famille `cibles` se reconnaît à son type, quel que soit le nom', () => {
        ['Par standards', 'Par spécifications', 'Ma pratique', ''].forEach((nom) =>
            expect(D.familleDeLaPratique({ nom, type: 'cibles', configuration: { type: 'cibles' } })).toBe('cibles'));
        expect(D.FAMILLES.CIBLES).toBe('cibles');
    });

    it('l\'écran lit la famille par cette seule fonction : plus aucune expression sur le type dans js/vue-simple.js', () => {
        const famille = tranche(VS, 'function _famille(groupe) {', '\n    }');
        expect(famille).toContain('D().familleDeLaPratique(_pratiqueDuGroupe(groupe))');
        expect(VS).not.toMatch(/\/standard\/i|\/sp\[ée\]cification\/i/);
    });
});

describe('V2. Les cartes des modèles', () => {
    const cartes = tranche(VS, 'modeles: [', '        ],');

    it('les deux cartes actuelles sont celles d\'avant, mot pour mot, dans le même ordre', () => {
        // ↻ 27 nov. 2026 (trois familles, texte 16) : le titre du modèle devient « Hybride » ; le texte dessous ne change pas.
        // ↻ 28 nov. 2026 (décision de Grégoire, 8 h 40) : « Cumulative par niveaux » ; le texte dessous ne change toujours pas.
        expect(cartes).toContain(`            { famille: 'standards', modele: 'STD-n-meilleurs', titre: 'Cumulative par niveaux', texte: 'Chaque production reçoit un niveau. La note est le cumul de tous ces niveaux ; tu peux ensuite ne retenir que les meilleurs ou les plus récents.', lien: 'Choisir ce modèle' },
            { famille: 'specifications', modele: 'SPE-simple', titre: 'Par spécifications', texte: 'Chaque production est acceptable ou non acceptable. La note dépend du nombre de productions acceptables.', lien: 'Choisir les spécifications' },`);
    });

    it('la troisième : « Par standards », famille `cibles`, la mention « À l\'essai » (lue sans survol : un paragraphe de la carte)', () => {
        // Release 1.253.0 (21 nov. 2026) : la mention est allumée par UNE constante, commune à la vue étendue
        // (`EnsemblesCibles.A_L_ESSAI`) ; le détail est verrouillé par sentinelle-par-standards-a-l-essai.test.js.
        expect(cartes).toMatch(/\{ famille: 'cibles', modele: 'par-standards', titre: 'Par standards', essai: true, /);
        expect(tranche(VS, 'function _choixModeleHTML() {', '\n    }')).toContain('<p class="vs-etape-essai">${esc(window.EnsemblesCibles.MOT_A_L_ESSAI)}</p>');
    });
});

describe('V3. Les cibles, une par ligne', () => {
    it('chaque ligne non vide devient une étiquette, sans ses espaces ; 80 caractères au plus', () => {
        expect(D.etiquettesDepuisLignes('  Analyser un texte  \r\n\n  \nRédiger\n')).toEqual(['Analyser un texte', 'Rédiger']);
        expect(D.etiquettesDepuisLignes('x'.repeat(90))).toEqual(['x'.repeat(80)]);
        expect(D.etiquettesDepuisLignes(null)).toEqual([]);
    });

    it('les refus : aucune cible, une étiquette vide, deux pareilles (sans égard à la casse)', () => {
        expect(D.refusDesCibles([])).toEqual({ refus: 'aucuneCible' });
        expect(D.refusDesCibles(['A', '  '])).toEqual({ refus: 'cibleSansEtiquette' });
        expect(D.refusDesCibles(['Analyser', 'analyser'])).toEqual({ refus: 'cibleEnDouble' });
        expect(D.refusDesCibles(['A', 'B'])).toBeNull();
    });

    it('une cible née en vue simple : poids égaux (1), énoncé vide, aucun critère, pas terminale', () => {
        let n = 0;
        expect(D.ciblesNeuves(['A', 'B'], () => 'c' + (++n))).toEqual([
            { id: 'c1', etiquette: 'A', enonce: '', criteres: [], poids: 1, terminale: false },
            { id: 'c2', etiquette: 'B', enonce: '', criteres: [], poids: 1, terminale: false }]);
    });

    it('le poids d\'une cible ajoutée : le poids commun si tous sont égaux, sinon 1 (la règle de l\'assistant)', () => {
        expect(D.poidsDUneCibleNeuve([1, 1])).toBe(1);
        expect(D.poidsDUneCibleNeuve([2, 2, 2])).toBe(2);
        expect(D.poidsDUneCibleNeuve([2, 1])).toBe(1);
        expect(D.poidsDUneCibleNeuve([])).toBe(1);
        expect(D.poidsEgaux([{ poids: 1 }, { poids: 1 }])).toBe(true);
        expect(D.poidsEgaux([{ poids: 2 }, { poids: 1 }])).toBe(false);
    });
});

describe('V4. Le réglage garde chaque cible entière', () => {
    const anciennes = [
        { id: 'a', etiquette: 'A', enonce: 'Énoncé réglé en vue étendue', criteres: [{ id: 'k', texte: 'Cite', essentiel: true }], poids: 2, terminale: false },
        { id: 'b', etiquette: 'B', enonce: '', criteres: [], poids: 1, terminale: true }
    ];

    it('renommer : seule l\'étiquette change ; énoncé, critères, poids et « terminale » restent', () => {
        const b = D.brouillonDesCibles(anciennes);
        // ↻ 22 nov. 2026 (critères en vue simple) : le brouillon porte les critères de chaque cible, identités comprises.
        expect(b).toEqual({ cibles: [{ id: 'a', etiquette: 'A', criteres: [{ id: 'k', texte: 'Cite', essentiel: true }] }, { id: 'b', etiquette: 'B', criteres: [] }] });
        b.cibles[0].etiquette = '  A2 ';
        expect(D.ciblesReglees(anciennes, b)).toEqual([Object.assign({}, anciennes[0], { etiquette: 'A2' }), anciennes[1]]);
    });

    it('ajouter quand les poids ont été réglés (inégaux) : ils ne bougent pas, la neuve prend 1', () => {
        const b = D.gestesCibles.ajouter(D.brouillonDesCibles(anciennes), 'c');
        b.cibles[2].etiquette = 'C';
        expect(D.ciblesReglees(anciennes, b).map((c) => [c.id, c.poids])).toEqual([['a', 2], ['b', 1], ['c', 1]]);
    });

    it('retirer : la cible quitte le brouillon (la question des inscriptions se pose à l\'enregistrement) ; l\'ancien brouillon n\'est pas muté', () => {
        const b = D.brouillonDesCibles(anciennes);
        const apres = D.gestesCibles.retirer(b, 0);
        expect(apres.cibles.map((c) => c.id)).toEqual(['b']);
        expect(b.cibles).toHaveLength(2);
        expect(D.gestesCibles.retirer(b, 5)).toBe(b);
    });
});

describe('V5. Rien ne s\'efface ; une seule question ; « CIB » ne s\'affiche pas', () => {
    it('la vue simple n\'écrit ni les inscriptions ni l\'ensemble en direct : leurs écrivains seulement', () => {
        expect(VS).not.toMatch(/cle\('inscriptionsCibles'\)|cle\('ensemblesCibles'\)/);
        const creer = tranche(VS, 'async function creerParStandards() {', '\n    }');
        expect(creer).toContain('EC.enregistrer({ id: ensembleId');
        // Les deux autres écritures AJOUTENT (l'échelle de départ, la pratique) : rien n'est retiré ni réécrit.
        expect(creer.match(/modifierEtAnnoncer\(cle\('(\w+)'\), \(lues\) => \(lues \|\| \[\]\)\.concat\(\[/g)).toHaveLength(2);
        const regler = tranche(VS, 'async function _enregistrerCibles(pratique, b) {', '\n    }');
        expect(regler).toContain('IC.questionRetraitCibles(IC.ciblesRetireesInscrites(');
        expect(regler).toContain('window.EnsemblesCibles.enregistrer(');
        expect(regler).toContain('D().ciblesReglees(ensemble.cibles, b)');
    });

    it('la question du retrait est celle de l\'assistant, lue à une seule source (InscriptionsCibles)', () => {
        const q = IC.questionRetraitCibles([{ cible: { id: 'a', etiquette: 'Analyser' }, niveaux: 1, remarques: 0, eleves: 1 }]);
        expect(q).toEqual({ titre: 'Retirer une cible', texteConfirmer: 'Retirer quand même',
            message: 'Tu retires une cible qui porte des inscriptions.\n\n« Analyser » : 1 niveau inscrit pour 1 étudiant·e\n\n'
                + 'Ses inscriptions restent enregistrées, mais cette cible ne sera plus montrée au tableau.\n\nRetirer quand même ?' });
        expect(IC.questionRetraitCibles([])).toBeNull();
        expect(lire('js/wizard-pratique-v2.js')).toContain('IC.questionRetraitCibles(retraits)');
    });

    it('« CIB », comme texte, n\'apparaît dans js/vue-simple.js qu\'au champ `pratiques` de la pratique (une donnée, jamais affichée)', () => {
        expect(VS.match(/['"`]CIB['"`]/g)).toEqual(["'CIB'"]);
        expect(VS).toContain("pratiques: ['CIB']");
    });
});

// 22 nov. 2026 (décision de Grégoire, 9 h 14) : les critères d'une cible se règlent en vue simple. Une seule source :
// l'ensemble de cibles de la vue étendue (`criteres: [{ id, texte, essentiel }]`). Retirer un critère ne touche aucune
// inscription : chacune garde le texte des critères qu'elle a jugés (`InscriptionsCibles.etatDesCriteres`).
describe('V4 bis. Les critères d\'une cible, au réglage de la vue simple', () => {
    const anciennes = [
        { id: 'a', etiquette: 'A', enonce: 'Énoncé', criteres: [{ id: 'k1', texte: 'Cite', essentiel: true }, { id: 'k2', texte: 'Explique', essentiel: false }], poids: 2, terminale: true },
        { id: 'b', etiquette: 'B', enonce: '', criteres: [], poids: 1, terminale: false }
    ];

    it('ajouter, renommer, cocher « essentiel », retirer : les identités restent, le reste de la cible aussi', () => {
        let b = D.brouillonDesCibles(anciennes);
        b = D.gestesCibles.critereAjouter(b, 1, 'k3');
        b.cibles[1].criteres[0].texte = '  Nomme  ';
        b.cibles[1].criteres[0].essentiel = true;
        b.cibles[0].criteres[1].texte = 'Explique avec précision';
        b = D.gestesCibles.critereRetirer(b, 0, 0);
        const r = D.ciblesReglees(anciennes, b);
        expect(r[0]).toEqual(Object.assign({}, anciennes[0], { criteres: [{ id: 'k2', texte: 'Explique avec précision', essentiel: false }] }));
        expect(r[1]).toEqual(Object.assign({}, anciennes[1], { criteres: [{ id: 'k3', texte: 'Nomme', essentiel: true }] }));
    });

    it('une ligne de critère laissée vide n\'est pas un critère ; l\'ancien brouillon n\'est jamais muté', () => {
        const b0 = D.brouillonDesCibles(anciennes);
        const b1 = D.gestesCibles.critereAjouter(b0, 0, 'k9');
        expect(b0.cibles[0].criteres).toHaveLength(2);
        expect(D.ciblesReglees(anciennes, b1)[0].criteres.map((k) => k.id)).toEqual(['k1', 'k2']);
        expect(D.gestesCibles.critereRetirer(b0, 5, 0)).toBe(b0);
    });

    it('une cible neuve peut naître avec ses critères ; un brouillon sans critères garde ceux de l\'ancienne', () => {
        const b = D.gestesCibles.critereAjouter(D.gestesCibles.ajouter(D.brouillonDesCibles(anciennes), 'c'), 2, 'k4');
        b.cibles[2].etiquette = 'C';
        b.cibles[2].criteres[0].texte = 'Structure';
        expect(D.ciblesReglees(anciennes, b)[2]).toEqual({ id: 'c', etiquette: 'C', enonce: '', criteres: [{ id: 'k4', texte: 'Structure', essentiel: false }], poids: 1, terminale: false });
        expect(D.ciblesReglees(anciennes, { cibles: [{ id: 'a', etiquette: 'A' }] })[0].criteres).toEqual(anciennes[0].criteres);
    });
});
