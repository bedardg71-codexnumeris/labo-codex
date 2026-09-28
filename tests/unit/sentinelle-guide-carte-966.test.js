import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'node:crypto';
import { chargerScript } from './_helpers/charger-script.js';

// #966 — « LE GUIDE DIT CE QUE FAIT LA CARTE » (27 sept. 2026)
//
// Les pages 1, 2, 4, 6 et 8 du guide reprennent les textes validés par
// Grégoire, tels quels. Le banc compare le TEXTE RENDU (balises retirées) au
// texte validé, recopié ci-dessous depuis la consigne du lot
// (`plans de travail/CARTE-ALIGNEMENT-2026-09-27-4-le-guide-dit-ce-que-fait-la-carte.md`).
// ⚠ Recopié et NON lu : `plans de travail/` est ignoré par la CI.
//
// Normalisation, et rien d'autre : apostrophe courbe → droite, espace
// insécable → espace (la typographie du guide), espaces multiples → un.
// Les pages 3, 5, 7 et 9 ne changent pas : empreinte mesurée sur `main`
// (df359bf) le 27 sept., avant le lot.

let pages;

function fauxElement() {
    return {
        style: {}, dataset: {}, classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], closest: () => null
    };
}

beforeAll(() => {
    const win = chargerScript('js/planification-carte.js', {
        db: { getSync: (k, d) => d },
        cle: (k) => k,
        echapperHtml: (t) => String(t ?? ''),
        document: {
            getElementById: () => null, querySelectorAll: () => [], querySelector: () => null,
            addEventListener: () => {}, createElement: fauxElement, createElementNS: fauxElement,
            body: { appendChild() {}, removeChild() {} }
        },
        navigator: {}
    });
    pages = win.planificationCarte.GUIDE_PAGES;
});

const normaliser = (t) => t
    .replace(/<br\s*\/?>/g, ' ').replace(/<\/(p|li|div|span)>/g, ' ').replace(/<[^>]+>/g, '')
    .replace(/[’]/g, "'").replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
const texte = (i) => normaliser(pages[i].contenu);
const n = (t) => normaliser(t);

const PAGE_1 = [
    'Un principe guide toute la carte : tu évalues ce que tu enseignes, et tu enseignes ce que tu évalues, au même niveau d\'exigence. C\'est ça, l\'alignement pédagogique.',
    'La carte le rend visible sur trois étages :',
    'la compétence, ce que le programme exige (Anderson parle d\'alignement curriculaire) ;',
    'les idées maîtresses, l\'essentiel autour duquel tu organises ton contenu (Gauthier, Bissonnette et Richard) ;',
    'tes leçons, où objectifs, activités et évaluations sont reliés par un même verbe (Biggs parle d\'alignement constructif).',
    'Deux chemins mènent à une carte alignée : partir de tes objectifs et descendre jusqu\'à tes séances, comme le propose ce guide, ou bâtir d\'abord tes séances, puis relier et vérifier. La carte vérifie les liens, quel que soit l\'ordre dans lequel tu les poses.',
    'Trois signaux t\'aident à vérifier ta carte :',
    'Les badges de chaque bloc (gauche = ce qui le relie en amont, droite = ce qui le relie en aval) : ✓ quand le lien est posé (le badge prend la couleur du bloc), ! sur fond gris quand il en manque un.',
    'Le ⚠ sur une compétence ou une idée maîtresse : aucune évaluation ne vérifie encore un objectif qui s\'y rattache.',
    'Les pastilles des objectifs et des évaluations : elles disent si ce que tu enseignes est évalué, et si ce que tu évalues a été enseigné avant (pages 5 et 8).',
    'Ce guide te propose 8 repères pour construire ta carte et exporter ton plan. Tu peux le consulter à tout moment depuis la palette.',
    'Références :',
    'Anderson, L. W. (2026). Curriculum alignment (Educational Practices Series, no 37). International Academy of Education ; Bureau international d\'éducation de l\'UNESCO.',
    'Biggs, J. (2014). Constructive alignment in university teaching. HERDSA Review of Higher Education, 1, 5-22.',
    'Gauthier, C., Bissonnette, S. et Richard, M. (avec la collaboration de M. Castonguay) (2013). Enseignement explicite et réussite des élèves : la gestion des apprentissages. ERPI.'
];

const LIGNE_PAGE_2 = 'Ces niveaux sont les processus cognitifs de la taxonomie révisée d\'Anderson et Krathwohl, du plus simple au plus exigeant : mémoriser, comprendre, appliquer, analyser, évaluer, créer. Le verbe que tu choisis ici, tes activités devront le faire exercer et tes évaluations devront l\'exiger.';

const PAGE_4 = [
    'Tes leçons structurent ton cours dans le temps : chacune porte sa semaine et sa séance.',
    'Glisse des Leçons sur le canevas et pose leur semaine dans l\'Inspecteur.',
    'Relie chaque leçon à une ou plusieurs idées maîtresses. Le verbe « se concrétise dans » apparaît. C\'est ce lien qui fait remonter tes objectifs et tes évaluations jusqu\'à la compétence.',
    'Facultatif : une Séquence regroupe des leçons qui poursuivent les mêmes idées maîtresses. Elle aide à voir ton cours par blocs, mais l\'alignement n\'en a pas besoin. Tu peux déplacer une leçon d\'une séquence à l\'autre en la glissant.'
];

const LIGNE_PAGE_6 = 'Ces quatre types viennent de la taxonomie révisée d\'Anderson et Krathwohl. Si tu connais plutôt les connaissances déclaratives, procédurales et conditionnelles : les déclaratives regroupent les factuelles et les conceptuelles, et les conditionnelles (quand et pourquoi agir) relèvent de la métacognitive.';

const PAGE_8 = [
    'L\'évaluation ferme la boucle : elle vérifie ce que tu as enseigné, au niveau que tu as visé, ni plus, ni moins.',
    'Glisse une Évaluation dans la leçon où elle a lieu.',
    'Dans l\'Inspecteur, coche les objectifs qu\'elle vérifie : ceux de cette leçon ou d\'une leçon précédente.',
    'Choisis son niveau cognitif. Il devrait correspondre au verbe de ces objectifs.',
    'Chaque évaluation porte une pastille qui dit où elle en est :',
    '! Aucun objectif relié : cette évaluation ne dit pas ce qu\'elle vérifie.',
    '✕ Un objectif vérifié n\'est servi par aucun bloc : il n\'a pas été enseigné.',
    '⚠ Un objectif vérifié n\'est servi qu\'après cette évaluation.',
    // 28 sept. 2026 : la légende est rendue par la fonction de la carte ; elle porte
    // le cinquième état décidé par Grégoire (« ? »), texte accepté mot pour mot.
    '? Impossible de dire si chaque objectif a été enseigné avant : une leçon n\'a pas encore sa semaine ou sa séance, ou l\'évaluation n\'est dans aucune leçon.',
    '✓ Chaque objectif vérifié a été enseigné avant cette évaluation.',
    'Ta carte est alignée quand chaque objectif est servi et vérifié, et que chaque évaluation ne vérifie que des objectifs déjà enseignés.'
];

describe('#966 — le guide garde neuf pages', () => {
    it('neuf pages, titres des pages 1, 4 et 8 inchangés', () => {
        expect(pages).toHaveLength(9);
        expect(n(pages[0].titre)).toBe('Construis ta carte d\'alignement');
        expect(n(pages[3].titre)).toBe('Organise dans le temps');
        expect(n(pages[7].titre)).toBe('Vérifie que c\'est acquis');
    });
});

describe('#966 — les textes validés, tels quels', () => {
    it('page 1 : remplacée, TOUT le texte et rien d\'autre, sans le lien unesdoc', () => {
        expect(texte(0)).toBe(n(PAGE_1.join(' ')));
        expect(pages[0].contenu).not.toMatch(/unesdoc|<a /);
    });

    it('page 2 : le texte actuel est gardé, la ligne s\'ajoute juste après le sélecteur de niveau cognitif', () => {
        const t = texte(1);
        const iSelecteur = t.indexOf('sélecteur de niveau cognitif');
        const iLigne = t.indexOf(n(LIGNE_PAGE_2));
        expect(iSelecteur).toBeGreaterThan(-1);
        expect(iLigne).toBeGreaterThan(iSelecteur);
        expect(t.endsWith(n(LIGNE_PAGE_2))).toBe(true);
        expect(t).toContain('Chaque cours vise des compétences');
    });

    it('page 4 : remplacée, tout le texte et rien d\'autre', () => {
        expect(texte(3)).toBe(n(PAGE_4.join(' ')));
    });

    it('page 6 : la ligne s\'ajoute après la liste des quatre types, le reste est gardé', () => {
        const t = texte(5);
        const iListe = t.indexOf('s\'autoévaluer.)');
        const iLigne = t.indexOf(n(LIGNE_PAGE_6));
        expect(iListe).toBeGreaterThan(-1);
        expect(iLigne).toBe(iListe + 's\'autoévaluer.)'.length + 1);
        expect(t).toContain('Si tu hésites entre Factuelle et Conceptuelle');
    });

    it('page 8 : remplacée, tout le texte et rien d\'autre ; plus de « se vérifie par »', () => {
        expect(texte(7)).toBe(n(PAGE_8.join(' ')));
        expect(pages[7].contenu).not.toContain('se vérifie par');
    });

    it('page 8 : la légende est celle des pastilles d\'évaluation (mêmes classes que la carte)', () => {
        for (const cle of ['aucun', 'nonEnseigne', 'apres', 'incertain', 'avant']) {
            expect(pages[7].contenu).toContain('planif-eval-pastille--' + cle);
        }
    });

    it('mise en forme des autres pages : noms de blocs et d\'outils en gras, verbe de lien en italique', () => {
        expect(pages[3].contenu).toContain('<strong>Leçons</strong>');
        expect(pages[3].contenu).toContain('<strong>Séquence</strong>');
        expect(pages[3].contenu).toContain('<strong>Inspecteur</strong>');
        expect(pages[3].contenu).toContain('<em>« se concrétise dans »</em>');
        expect(pages[7].contenu).toContain('<strong>Évaluation</strong>');
        expect(pages[7].contenu).toContain('<strong>Inspecteur</strong>');
    });
});

// Page 5 : deux retouches acceptées par Grégoire le 28 sept. (mot pour mot), le
// reste de la page inchangé. Les apostrophes typographiques sont celles de la page.
const P5_POINT3_AVANT = '<li>Dans l’<strong>Inspecteur</strong> d’une activité, d’un exposé ou d’une évaluation de cette leçon, coche les <strong>objectifs servis</strong>. C’est ainsi que tu vérifies qu’aucun objectif ne reste sans moyen.</li>';
const P5_POINT3 = '<li>Dans l’<strong>Inspecteur</strong> d’une activité ou d’un exposé de cette leçon, coche les <strong>objectifs servis</strong> ; dans celui d’une évaluation, les <strong>objectifs vérifiés</strong>, ceux de sa leçon ou d’une leçon placée avant elle. C’est ainsi que tu vérifies qu’aucun objectif ne reste sans moyen.</li>';
const P5_POINT4_AVANT = 'Le bloc doit être dans la même leçon que l’objectif.</li>';
const P5_POINT4 = 'Une activité ou un exposé doit être dans la même leçon que l’objectif ; une évaluation, dans cette leçon ou une leçon placée après.</li>';

describe('#966 — les pages 3, 7 et 9 ne changent pas ; la page 5, de ses deux retouches seulement', () => {
    const empreinte = (titre, contenu) => crypto.createHash('sha256').update(titre + '|' + contenu).digest('hex').slice(0, 16);
    it('pages 3, 7 et 9 : même empreinte qu\'avant le lot (mesurée sur main, df359bf)', () => {
        expect([2, 6, 8].map((i) => empreinte(pages[i].titre, pages[i].contenu))).toEqual(['4f95ffea44a91cab', '1e4fe6a19353548d', '6e57061b206939f8']);
    });
    it('page 5 : les deux phrases acceptées le 28 sept., une fois chacune', () => {
        expect(pages[4].contenu.split(P5_POINT3).length - 1).toBe(1);
        expect(pages[4].contenu.split(P5_POINT4).length - 1).toBe(1);
        expect(pages[4].contenu).not.toContain('Le bloc doit être dans la même leçon');
    });
    it('page 5 : les deux phrases remises à l\'ancienne, on retrouve l\'empreinte d\'avant (rien d\'autre n\'a bougé)', () => {
        const ancienne = pages[4].contenu.replace(P5_POINT3, P5_POINT3_AVANT).replace(P5_POINT4, P5_POINT4_AVANT);
        expect(empreinte(pages[4].titre, ancienne)).toBe('8fe3a8e048b00535');
    });
});
