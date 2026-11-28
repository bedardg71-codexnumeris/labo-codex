/**
 * LE DEVIS MINISTÉRIEL DANS « APPORTER MON MATÉRIEL » (lot du 28 nov. 2026) — la lecture d'un devis collé.
 *
 * Demande de Grégoire (28 nov., 7 h 26 à 7 h 55). Les cinq jeux d'essai de tests/fixtures/devis/ sont cinq devis
 * réels du ministère (documents publics), extraits par `pdftotext` : ce que ce banc NE prouve PAS, c'est l'ordre
 * que rend le geste de copie d'Aperçu, de Safari ou de l'iPad (porte terrain).
 *
 * Ce que ce banc verrouille :
 *   L — LIRE par repères : le numéro, l'énoncé, le contexte, les éléments, leurs critères, sur les cinq devis.
 *   H — HONNÊTETÉ : rien d'inventé, rien de perdu. Chaque mot du collage est dans le modèle ou dans `ecartees` ;
 *       le sort mélangé de 000Z n'est pas reconstruit.
 *   G — GESTES : 000Z se remet en ordre en DEUX gestes ; retirer, c'est mettre de côté.
 *   F — LA FICHE : `elementsCompetence` reste un élément par ligne (son lecteur, planification-export.js, le
 *       découpe par lignes) et correspond à `devisCompetence` ; l'aller-retour ne perd rien.
 *   S — SÉCURITÉ : l'écran ne pose un texte collé dans la page que par `echapperHtml`.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const devis = (code) => readFileSync(path.join(racine, 'tests', 'fixtures', 'devis', code + '.txt'), 'utf8');

let D;
beforeAll(() => { D = chargerScript('js/devis-lecture.js').devisLecture; });

const mots = (t) => String(t).normalize('NFC').replace(/[•\f]/g, ' ').split(/\s+/).filter(Boolean);
/** Tous les mots que porte un modèle, écartés compris. */
function motsDuModele(m) {
    return mots([m.numero, m.enonce].concat(m.contexte, m.ecartees, ...m.elements.map((e) => [e.texte].concat(e.criteres))).join(' '));
}

describe('L — lire par repères, sur les cinq devis', () => {
    it('4EF0 (formation générale, une page) : 6 éléments, 17 critères, dans l’ordre ; pas de contexte', () => {
        const m = D.lire(devis('4EF0'));
        expect(m.reconnu).toBe(true);
        expect(m.numero).toBe('4EF0');
        expect(m.enonce).toBe('Analyser des textes littéraires.');
        expect(m.contexte).toEqual([]);
        expect(m.elements.map((e) => e.criteres.length)).toEqual([1, 2, 1, 3, 8, 2]);
        // Une phrase coupée en fin de ligne est recousue, dans un élément comme dans un critère.
        expect(m.elements[4].texte).toBe('Rédiger une analyse littéraire, un commentaire composé ou une explication de textes.');
        expect(m.elements[1].criteres[1]).toBe('Classement approprié des principales manifestations thématiques et stylistiques.');
        // Le bloc « Activités d'apprentissage » n'est pas pris pour des critères.
        expect(m.elements[5].criteres).toEqual(['Utilisation appropriée de stratégies de révision.', 'Correction appropriée du texte.']);
        expect(m.ecartees).toContain('Pondération : 2-2-3 ou 1-3-3');
    });

    it('01FB : le code sur la ligne suivante, les numéros sans point, un contexte en phrases', () => {
        const m = D.lire(devis('01FB'));
        expect(m.numero).toBe('01FB');
        expect(m.enonce).toBe('Traduire un matériau musical.');
        expect(m.contexte).toEqual([
            'À partir de textes musicaux propres aux langages populaire, jazz et classique.',
            'À partir d\'extraits d\'œuvres ou d\'œuvres simples.'
        ]);
        expect(m.elements.map((e) => e.texte)).toEqual(['Solfier à première vue un matériau musical.', 'Reproduire par écrit un matériau musical entendu.']);
        expect(m.elements.map((e) => e.criteres.length)).toEqual([2, 6]);
        // Le pied de page vient après un vide, sous une phrase finie : mis de côté, pas collé au dernier critère.
        expect(m.elements[1].criteres[5]).toBe('Reproduction écrite de rythmes propres aux différents langages de la musique.');
        expect(m.ecartees).toEqual(['Formation spécifique', 'Tronc commun', 'Techniques professionnelles de musique et chanson', '65']);
    });

    it('0013 : « Éléments » tout court, un contexte en puces, une puce qui se poursuit par un nombre', () => {
        const m = D.lire(devis('0013'));
        expect(m.numero).toBe('0013');
        expect(m.enonce).toBe('Apprécier diverses formes d’art issues de pratiques d’ordre esthétique.');
        expect(m.contexte).toEqual(['Individuellement.', 'À partir d’une production artistique désignée.', 'À l’occasion d’un commentaire écrit d’environ 750 mots.']);
        expect(m.elements.map((e) => e.criteres.length)).toEqual([1, 1, 1]);
    });

    it('01FL (deux pages) : le pied de page et le code répétés sont écartés, les éléments se suivent de 1 à 6', () => {
        const m = D.lire(devis('01FL'));
        expect(m.numero).toBe('01FL');
        expect(m.enonce).toBe('Gérer sa carrière.');
        expect(m.contexte).toHaveLength(4);
        expect(m.elements.map((e) => e.criteres.length)).toEqual([3, 2, 3, 2, 3, 4]);
        expect(m.elements[4].texte).toBe('Appliquer des stratégies de gestion du travail.');
        expect(m.elements[3].criteres[1]).toMatch(/théâtre musical\.$/);
        expect(m.ecartees.filter((l) => l === 'Tronc commun')).toHaveLength(2);
        expect(m.ecartees.join(' ')).not.toMatch(/01FL/);
    });

    it('rien de reconnaissable : `reconnu` est faux, et le texte reste dans les lignes mises de côté', () => {
        const m = D.lire('Bonjour,\nvoici ma liste d’épicerie.');
        expect(m.reconnu).toBe(false);
        expect(m.ecartees).toEqual(['Bonjour,', 'voici ma liste d’épicerie.']);
        expect(D.lire('').reconnu).toBe(false);
        expect(D.lire(null).reconnu).toBe(false);
    });

    it('les repères se lisent sans accents, en NFD, avec des fins de ligne Windows, une puce ou un numéro seuls sur leur ligne', () => {
        const texte = ('Code : 4ef0\r\nEnonce de la competence\r\nAnalyser.\r\nEléments de la compétence\r\n1.\r\nLire le texte.\r\n•\r\nLecture juste.\r\n').normalize('NFD');
        const m = D.lire(texte);
        expect(m.numero).toBe('4EF0');
        expect(m.enonce).toBe('Analyser.');
        expect(m.elements).toEqual([{ texte: 'Lire le texte.', criteres: ['Lecture juste.'] }]);
    });
});

describe('H — honnêteté : rien d’inventé, rien de perdu', () => {
    it.each(['4EF0', '01FB', '0013', '01FL', '000Z'])('%s : chaque mot du collage est dans le modèle, hors les intitulés reconnus', (code) => {
        const m = D.lire(devis(code));
        const intitules = ['Code', ':', 'Objectif', 'Standard', 'Énoncé', 'de', 'la', 'compétence', 'Contexte', 'réalisation', 'Éléments', 'Critères', 'performance', 'Activités', 'd’apprentissage'];
        const rendus = motsDuModele(m);
        const compte = (liste) => liste.reduce((c, w) => { c[w] = (c[w] || 0) + 1; return c; }, {});
        const attendus = compte(mots(devis(code).replace(/^(\d{1,2})[.)]?\s+(?=[A-ZÀ-Þ])/gm, '')));
        const eus = compte(rendus);
        const perdus = Object.keys(attendus).filter((w) => !intitules.includes(w) && (eus[w] || 0) < attendus[w] && w !== m.numero);
        expect(perdus, 'mots du collage absents du modèle').toEqual([]);
        // Rien d'inventé : aucun mot du modèle qui ne soit dans le collage.
        const source = new Set(mots(devis(code)));
        expect(rendus.filter((w) => !source.has(w) && !source.has(w + '.') && w !== m.numero)).toEqual([]);
    });

    it('000Z (sort mélangé) : l’ordre du collage est gardé tel quel, l’élément 1 reste sans critère', () => {
        const m = D.lire(devis('000Z'));
        expect(m.numero).toBe('000Z');
        expect(m.contexte).toEqual([]);
        expect(m.elements.map((e) => e.criteres.length)).toEqual([0, 3, 14, 6]);
        expect(m.elements[2].criteres[7]).toMatch(/^Pour les langues modernes qui utilisent l’alphabet latin/);
        expect(m.elements[2].criteres[11]).toBe('Identification juste des mots et des expressions idiomatiques.');
        // Une fin de critère qui revient d'un critère à l'autre (« simples. ») n'est pas prise pour un pied de page.
        expect(m.elements[2].criteres[5]).toBe('Enchaînement cohérent d’une suite de phrases simples.');
        expect(m.elements[3].criteres[4]).toBe('Enchaînement cohérent d’une suite de phrases simples.');
        expect(m.ecartees.filter((l) => l === 'Formation générale complémentaire')).toHaveLength(2);
    });
});

describe('G — les gestes de correction', () => {
    it('000Z se remet en ordre en DEUX gestes : « cette ligne et les suivantes » vers le contexte, puis vers l’élément 1', () => {
        const lu = D.lire(devis('000Z'));
        const g1 = D.deplacer(lu, { zone: 'element', e: 2, i: 7 }, { zone: 'contexte' }, true);
        const g2 = D.deplacer(g1, { zone: 'contexte', i: 4 }, { zone: 'element', e: 0 }, true);
        expect(g2.contexte).toHaveLength(4);
        expect(g2.contexte[3]).toBe('À l’aide d’outils de référence.');
        expect(g2.elements.map((e) => e.criteres.length)).toEqual([3, 3, 7, 6]);
        expect(g2.elements[0].criteres[0]).toBe('Identification juste des mots et des expressions idiomatiques.');
        // Un geste rend un modèle neuf : celui d'avant ne bouge pas (« Annuler le dernier geste »).
        expect(lu.elements[2].criteres).toHaveLength(14);
        expect(motsDuModele(g2).sort()).toEqual(motsDuModele(lu).sort());
    });

    it('retirer une ligne la met de côté ; elle se replace, ou devient un élément', () => {
        const m = { numero: 'X1', enonce: 'É.', contexte: [], elements: [{ texte: 'A', criteres: ['c1', 'Pied de page'] }], ecartees: [] };
        const retire = D.deplacer(m, { zone: 'element', e: 0, i: 1 }, { zone: 'ecartees' });
        expect(retire.elements[0].criteres).toEqual(['c1']);
        expect(retire.ecartees).toEqual(['Pied de page']);
        expect(D.deplacer(retire, { zone: 'ecartees', i: 0 }, { zone: 'element', e: 0 }).elements[0].criteres).toEqual(['c1', 'Pied de page']);
        expect(D.enElement(retire, 0).elements[1]).toEqual({ texte: 'Pied de page', criteres: [] });
        // Une adresse qui ne désigne rien ne change rien.
        expect(D.deplacer(m, { zone: 'element', e: 0, i: 9 }, { zone: 'contexte' })).toEqual(D.copie(m));
        expect(D.deplacer(m, { zone: 'element', e: 5, i: 0 }, { zone: 'contexte' })).toEqual(D.copie(m));
    });

    it('ajouter, retoucher, monter, retirer un élément (son texte et ses critères vont de côté)', () => {
        let m = D.ajouterElement(D.modeleVide());
        m = D.retoucher(m, { zone: 'elementTexte', e: 0 }, 'Second');
        m = D.ajouterLigne(m, { zone: 'element', e: 0 });
        m = D.retoucher(m, { zone: 'element', e: 0, i: 0 }, 'critère du second');
        m = D.retoucher(D.ajouterElement(m), { zone: 'elementTexte', e: 1 }, 'Premier');
        m = D.bougerElement(m, 1, -1);
        expect(m.elements.map((e) => e.texte)).toEqual(['Premier', 'Second']);
        m = D.retoucher(D.retoucher(m, { zone: 'numero' }, '00AB'), { zone: 'enonce' }, 'Énoncé');
        expect([m.numero, m.enonce]).toEqual(['00AB', 'Énoncé']);
        const sans = D.retirerElement(m, 1);
        expect(sans.elements).toHaveLength(1);
        expect(sans.ecartees).toEqual(['Second', 'critère du second']);
    });
});

describe('F — vers la fiche du cours, et depuis elle', () => {
    it('`elementsCompetence` : un élément par ligne, numéroté, que son lecteur découpe comme avant', () => {
        const f = D.versFiche(D.lire(devis('4EF0')));
        expect(f.numeroCompetence).toBe('4EF0');
        expect(f.competence).toBe('Analyser des textes littéraires.');
        // Le découpage de planification-export.js, mot pour mot.
        const lignes = String(f.elementsCompetence || '').split('\n').map((l) => l.trim()).filter(Boolean);
        expect(lignes).toHaveLength(6);
        expect(lignes[0]).toBe('1. Reconnaître le propos du texte.');
        expect(f.devisCompetence.elements.map((e) => e.texte)).toEqual(lignes.map((l) => l.replace(/^\d+\. /, '')));
        expect(f.devisCompetence.elements.reduce((n, e) => n + e.criteres.length, 0)).toBe(17);
        expect(f.devisCompetence).not.toHaveProperty('ecartees');
    });

    it('les lignes vides partent ; les lignes mises de côté ne vont pas dans la fiche', () => {
        const f = D.versFiche({ numero: ' 00AB ', enonce: 'É.', contexte: ['', 'Seul.'], elements: [{ texte: '', criteres: [] }, { texte: 'A', criteres: ['', 'c'] }], ecartees: ['77'] });
        expect(f).toEqual({ numeroCompetence: '00AB', competence: 'É.', elementsCompetence: '1. A', devisCompetence: { contexte: ['Seul.'], elements: [{ texte: 'A', criteres: ['c'] }] } });
    });

    it('aller-retour : ce que la fiche a reçu se relit tel quel', () => {
        const lu = D.lire(devis('01FL'));
        const relu = D.depuisFiche(D.versFiche(lu));
        expect(relu.aDuContenu).toBe(true);
        expect(relu.aUnDevis).toBe(true);
        expect(relu.ecartees).toEqual([]);
        expect(D.versFiche(relu)).toEqual(D.versFiche(lu));
    });

    it('une fiche remplie à la main, sans devis : ses lignes deviennent des éléments sans critères ; une fiche vide n’a rien à remplacer', () => {
        const m = D.depuisFiche({ numeroCompetence: '4EF0', competence: 'Analyser', elementsCompetence: '• Reconnaître le propos\n• Repérer des thèmes\n' });
        expect(m.elements).toEqual([{ texte: 'Reconnaître le propos', criteres: [] }, { texte: 'Repérer des thèmes', criteres: [] }]);
        expect(m.aDuContenu).toBe(true);
        expect(m.aUnDevis).toBe(false);
        expect(D.depuisFiche({ codeCours: '601-101-MQ' }).aDuContenu).toBe(false);
        expect(D.depuisFiche(null).aDuContenu).toBe(false);
    });

    it('`elementsCompetence` retouché à la main après le devis : il fait foi, et ce que le devis portait d’autre reste visible', () => {
        const fiche = D.versFiche({ numero: 'X', enonce: 'É', contexte: [], elements: [{ texte: 'A', criteres: ['a1'] }, { texte: 'B', criteres: ['b1'] }], ecartees: [] });
        fiche.elementsCompetence = '1. A\n2. C';
        const m = D.depuisFiche(fiche);
        expect(m.elements).toEqual([{ texte: 'A', criteres: ['a1'] }, { texte: 'C', criteres: [] }]);
        expect(m.ecartees).toEqual(['B', 'b1']);
    });

    it('un `devisCompetence` venu d’ailleurs et mal formé ne casse rien, et n’apporte que des textes', () => {
        const m = D.depuisFiche({ elementsCompetence: 'A', devisCompetence: { contexte: 'pas un tableau', elements: [null, 7, { texte: 'A', criteres: ['ok', { x: 1 }, 3] }] } });
        expect(m.contexte).toEqual([]);
        expect(m.elements).toEqual([{ texte: 'A', criteres: ['ok'] }]);
    });
});

describe('S — l’écran ne pose rien de collé dans la page sans l’échapper', () => {
    const source = readFileSync(path.join(racine, 'js', 'materiel-devis.js'), 'utf8');

    it('aucun handler inline, aucun console.log, une seule écriture', () => {
        expect(source).not.toMatch(/\son(click|change|input|paste)\s*=/);
        expect(source).not.toMatch(/console\.log/);
        expect(source.match(/mettreAJour\(/g)).toHaveLength(1);
        expect(source).not.toMatch(/db\.(set|setSync|modifier)\(/);
    });

    it('le nom d’un cours piégé n’entre pas dans la page tel quel (le collage piégé : materiel-devis.spec.js, dans WebKit)', () => {
        const piege = '<img src=x onerror=alert(1)>';
        const elements = {};
        const noeud = (id) => (elements[id] || (elements[id] = { id, innerHTML: '', value: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
            addEventListener() {}, querySelector() { return null; }, focus() {} }));
        const document = { getElementById: noeud, querySelector: () => null };
        const echapperHtml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const cours = { id: 'C<1>', codeCours: piege, nomCours: piege, nature: 'cours', numeroCompetence: piege, competence: piege, elementsCompetence: piege };
        const CoursEntite = { CLE: 'cours', obtenirTous: async () => [cours], obtenirParId: async () => cours, genererLibelle: (c) => c.codeCours + ' - ' + c.nomCours, mettreAJour: async () => null };
        const w = chargerScript('js/devis-lecture.js');
        chargerScript('js/materiel-devis.js', { document, echapperHtml, CoursEntite, scrollTo() {}, scrollY: 0 }, w);
        return (async () => {
            w.CoursEntite = CoursEntite;
            await w.materielDevis.ouvrir();
            expect(noeud('materiel-devis').innerHTML).toContain('&lt;img');
            expect(noeud('materiel-devis').innerHTML).not.toContain('<img');
        })();
    });
});
