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
 *   A — ACTIVITÉS D'APPRENTISSAGE : discipline, pondération, unités, heures ou périodes, précisions, quand le devis
 *       les porte ; une valeur que rien ne rattache à son libellé n'est pas devinée.
 *   R — LA RÉSERVE (correctif du 28 nov., 8 h 08 : « numériser ne touche aucun cours ») : un devis se range par son
 *       code ; un devis du même code est remplacé à sa place, les autres ne bougent pas ; rien n'est supprimé ;
 *       l'aller-retour ne perd rien ; AUCUN fichier du lot ne lit ni n'écrit la fiche d'un cours.
 *   S — SÉCURITÉ : l'écran ne pose un texte collé dans la page que par `echapperHtml`.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const devis = (code) => readFileSync(path.join(racine, 'tests', 'fixtures', 'devis', code + '.txt'), 'utf8');

let D;
beforeAll(() => { D = chargerScript('js/devis-lecture.js').devisLecture; });

const mots = (t) => String(t).normalize('NFC').replace(/[•\f]/g, ' ').split(/\s+/).filter(Boolean);
/** Tous les mots que porte un modèle, écartés compris. */
function motsDuModele(m) {
    return mots([m.numero, m.enonce].concat(m.contexte, m.ecartees, Object.values(m.activites || {}), ...m.elements.map((e) => [e.texte].concat(e.criteres))).join(' '));
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
        expect(m.elements.flatMap((e) => e.criteres).join(' ')).not.toMatch(/Pondération|Discipline/);
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
        const intitules = ['Code', ':', 'Objectif', 'Standard', 'Énoncé', 'de', 'la', 'compétence', 'Contexte', 'réalisation', 'Éléments', 'Critères', 'performance', 'Activités', 'd’apprentissage',
            'Discipline', 'Pondération', 'Unités', 'Précision', 'Précisions', 'Périodes', 'd’enseignement', 'Nombre', 'd’heures-contact', 'd’unités'];
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
        const m = D.copie({ numero: 'X1', enonce: 'É.', contexte: [], elements: [{ texte: 'A', criteres: ['c1', 'Pied de page'] }], ecartees: [] });
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

describe('A — les activités d’apprentissage', () => {
    it('4EF0 : la discipline, la pondération, les unités et la précision, valeur sur la ligne ou sur la suivante', () => {
        expect(D.lire(devis('4EF0')).activites).toEqual({
            discipline: 'Français, langue d’enseignement et littérature', ponderation: '2-2-3 ou 1-3-3', unites: '2⅓', heures: '',
            precisions: 'Les textes littéraires analysés appartiennent à deux époques distinctes et à deux genres différents.'
        });
    });

    it('000Z : les périodes d’enseignement, les unités, des précisions sur plusieurs lignes recousues', () => {
        const a = D.lire(devis('000Z')).activites;
        expect([a.heures, a.unites, a.discipline, a.ponderation]).toEqual(['45', '2', '', '']);
        expect(a.precisions).toMatch(/^L’acquisition d’une langue moderne/);
        expect(a.precisions).toMatch(/à l’exception des codes 601, 602, 603 et 604\.$/);
    });

    it('0013 : les libellés sans leur valeur ne sont pas devinés, les nombres en vrac restent de côté', () => {
        const m = D.lire(devis('0013'));
        expect(m.activites).toEqual({ discipline: '', ponderation: '', unites: '', heures: '', precisions: '' });
        expect(m.ecartees).toEqual(expect.arrayContaining(['48', '45', '2']));
    });

    it('un devis de formation spécifique n’en porte pas ; le champ se retouche à la main', () => {
        const m = D.lire(devis('01FL'));
        expect(Object.values(m.activites).join('')).toBe('');
        expect(D.retoucher(m, { zone: 'activite', champ: 'heures' }, '60').activites.heures).toBe('60');
        expect(D.retoucher(m, { zone: 'activite', champ: 'constructor' }, 'x').activites).toEqual(m.activites);
    });
});

describe('R — la réserve de devis', () => {
    const opts = (n, idOuvert) => ({ idNeuf: 'DEVIS_' + n, maintenant: '2026-11-28T13:0' + n + ':00.000Z', idOuvert });
    const pour = (code) => D.pourReserve(D.lire(devis(code)));

    it('ce que la réserve garde : le code, l’énoncé, le contexte, les éléments et leurs critères, les activités ; pas les lignes mises de côté', () => {
        const d = pour('4EF0');
        expect(Object.keys(d).sort()).toEqual(['activites', 'code', 'contexte', 'elements', 'enonce']);
        expect(d.code).toBe('4EF0');
        expect(d.elements).toHaveLength(6);
        expect(d.elements.reduce((n, e) => n + e.criteres.length, 0)).toBe(17);
        expect(d.activites.ponderation).toBe('2-2-3 ou 1-3-3');
        const net = D.pourReserve({ numero: ' 00ab ', enonce: 'É.', contexte: ['', 'Seul.'], elements: [{ texte: '', criteres: [] }, { texte: 'A', criteres: ['', 'c'] }], ecartees: ['77'] });
        expect(net).toEqual({ code: '00AB', enonce: 'É.', contexte: ['Seul.'], elements: [{ texte: 'A', criteres: ['c'] }], activites: { discipline: '', ponderation: '', unites: '', heures: '', precisions: '' } });
    });

    it('plusieurs devis se rangent côte à côte, chacun avec son id et ses dates', () => {
        let r = D.ranger(undefined, pour('4EF0'), opts(1));
        r = D.ranger(r, pour('000Z'), opts(2));
        expect(r.map((d) => [d.id, d.code, d.dateCreation])).toEqual([['DEVIS_1', '4EF0', '2026-11-28T13:01:00.000Z'], ['DEVIS_2', '000Z', '2026-11-28T13:02:00.000Z']]);
    });

    it('recoller un devis dont le code est déjà rangé : `place` nomme l’ancien sans rien écrire ; `ranger` le remplace À SA PLACE, les autres ne bougent pas', () => {
        const depart = D.ranger(D.ranger([], pour('4EF0'), opts(1)), pour('000Z'), opts(2));
        const gele = JSON.stringify(depart);
        const neuf = Object.assign(pour('4EF0'), { enonce: 'Énoncé corrigé.' });
        const p = D.place(depart, neuf);
        expect(p.ancien.enonce).toBe('Analyser des textes littéraires.');
        const r = D.ranger(depart, neuf, opts(3));
        expect(JSON.stringify(depart)).toBe(gele);   // ni `place` ni `ranger` ne modifient la réserve reçue
        expect(r).toHaveLength(2);
        expect(r[0]).toMatchObject({ id: 'DEVIS_1', code: '4EF0', enonce: 'Énoncé corrigé.', dateCreation: '2026-11-28T13:01:00.000Z', dateModification: '2026-11-28T13:03:00.000Z' });
        expect(r[1]).toEqual(depart[1]);
    });

    it('un devis rouvert reprend sa place, même si son code est corrigé ; le code d’un AUTRE devis est un conflit, et rien ne se range', () => {
        const depart = D.ranger(D.ranger([], pour('4EF0'), opts(1)), pour('000Z'), opts(2));
        const corrige = Object.assign(pour('4EF0'), { code: '4EF1' });
        const r = D.ranger(depart, corrige, opts(3, 'DEVIS_1'));
        expect(r.map((d) => [d.id, d.code])).toEqual([['DEVIS_1', '4EF1'], ['DEVIS_2', '000Z']]);
        const conflit = Object.assign(pour('4EF0'), { code: '000z' });
        expect(D.place(depart, conflit, 'DEVIS_1').conflit.id).toBe('DEVIS_2');
        expect(D.ranger(depart, conflit, opts(3, 'DEVIS_1'))).toBeNull();
        expect(D.ranger(depart, Object.assign(pour('4EF0'), { code: '' }), opts(3))).toBeNull();   // sans code : rien ne se range
    });

    it('aller-retour : un devis rangé se rouvre tel quel', () => {
        const d = pour('01FL');
        const rouvert = D.depuisReserve(D.ranger([], d, opts(1))[0]);
        expect(rouvert.ecartees).toEqual([]);
        expect(D.pourReserve(rouvert)).toEqual(d);
    });

    it('une réserve venue d’ailleurs et mal formée ne casse rien, et n’apporte que des textes', () => {
        expect(D.reserveSure('pas un tableau')).toEqual([]);
        const r = D.reserveSure([null, 7, [], { id: 'D1', code: ' 4ef0 ', enonce: 3, contexte: 'x', elements: [null, { texte: 'A', criteres: ['ok', { x: 1 }, 3] }], activites: { heures: 45, unites: '2' } }]);
        expect(r).toEqual([{ id: 'D1', code: '4EF0', enonce: '', contexte: [], elements: [{ texte: 'A', criteres: ['ok'] }], activites: { discipline: '', ponderation: '', unites: '2', heures: '', precisions: '' } }]);
    });

    it('un fichier reçu, confronté à la réserve : neuf, identique ou différent ; rien n’est écrit, un doublon du fichier n’est pas proposé', () => {
        const mienne = D.ranger(D.ranger([], pour('4EF0'), opts(1)), pour('000Z'), opts(2));
        const gele = JSON.stringify(mienne);
        const autre = Object.assign(pour('000Z'), { enonce: 'Un autre énoncé.', id: 'DEVIS_DU_COLLEGUE' });
        const fichier = [Object.assign(pour('4EF0'), { id: 'X', dateCreation: 'autre date' }), autre, pour('01FB'), pour('01FB'), Object.assign(pour('01FL'), { code: '' })];
        const c = D.confronter(mienne, fichier);
        expect(c.map((x) => [x.devis.code, x.etat])).toEqual([['4EF0', 'identique'], ['000Z', 'different'], ['01FB', 'neuf']]);
        expect(c[1].ancien.enonce).toBe('Communiquer dans une langue moderne de façon restreinte.');
        expect(c[2].ancien).toBeNull();
        expect(JSON.stringify(mienne)).toBe(gele);
        expect(D.memeContenu(pour('4EF0'), Object.assign(pour('4EF0'), { id: 'autre', dateModification: 'x' }))).toBe(true);
        expect(D.confronter(mienne, 'pas un tableau')).toEqual([]);
        // Ranger le devis différent le remplace à sa place, sous l'id d'ici, pas celui du fichier.
        const r = D.ranger(mienne, c[1].devis, opts(3));
        expect(r.map((d) => [d.id, d.code, d.enonce])).toEqual([['DEVIS_1', '4EF0', 'Analyser des textes littéraires.'], ['DEVIS_2', '000Z', 'Un autre énoncé.']]);
    });

    it('la démonstration a sa réserve, sous le préfixe de la démo ; l’écran ne nomme jamais une clé en dur', () => {
        expect(D.CLE_RESERVE_DEMO).toBe('demo_devisMinisteriels');
        const ecran = readFileSync(path.join(racine, 'js', 'materiel-devis.js'), 'utf8');
        expect(tranche(ecran, 'function cleReserve() {', '}')).toMatch(/enDemo\(\) \? L\(\)\.CLE_RESERVE_DEMO : L\(\)\.CLE_RESERVE/);
        expect(ecran.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(/['"](demo_)?devisMinisteriels['"]/);
    });

    it('la réserve est une clé GLOBALE, hors trimestre ; aucun fichier du lot ne touche la fiche d’un cours', () => {
        expect(D.CLE_RESERVE).toBe('devisMinisteriels');
        const trimestres = readFileSync(path.join(racine, 'js', 'trimestres.js'), 'utf8');
        const globales = tranche(trimestres, 'const CLES_GLOBALES = [', '];');
        expect(globales).toMatch(/'devisMinisteriels'/);
        for (const f of ['js/devis-lecture.js', 'js/materiel-devis.js']) {
            const code = readFileSync(path.join(racine, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
            expect(code, f).not.toMatch(/CoursEntite|numeroCompetence|elementsCompetence|devisCompetence|['"]cours['"]/);
        }
        expect(readFileSync(path.join(racine, 'js', 'entites', 'cours-entite.js'), 'utf8')).not.toMatch(/devisCompetence|devisMinisteriels/);
    });
});

describe('S — l’écran ne pose rien de collé dans la page sans l’échapper', () => {
    const source = readFileSync(path.join(racine, 'js', 'materiel-devis.js'), 'utf8');

    it('aucun handler inline, aucun console.log, une seule écriture', () => {
        expect(source).not.toMatch(/\son(click|change|input|paste)\s*=/);
        expect(source).not.toMatch(/console\.log/);
        expect(source.match(/modifierEtAnnoncer\(/g)).toHaveLength(2);   // « Ranger ce devis », et l'import par cases
        expect(source.match(/modifierEtAnnoncer\(cleReserve\(\)/g)).toHaveLength(2);   // jamais une clé en dur : la démo a sa réserve
        expect(source).not.toMatch(/db\.(set|setSync|modifier|remove|removeSync)\(/);
    });

    it('un devis piégé dans la réserve n’entre pas tel quel dans la liste de l’accueil', async () => {
        const piege = '<img src=x onerror=alert(1)>';
        const elements = {};
        const noeud = (id) => (elements[id] || (elements[id] = { id, innerHTML: '', value: '', dataset: {}, classList: { add() {}, remove() {}, toggle() {} },
            addEventListener() {}, querySelector() { return null; }, focus() {} }));
        const document = { getElementById: noeud, querySelector: () => null, readyState: 'complete' };
        const echapperHtml = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const db = { get: async () => [{ id: 'D"1', code: piege, enonce: piege, contexte: [piege], elements: [{ texte: piege, criteres: [piege] }] }] };
        const w = chargerScript('js/devis-lecture.js');
        chargerScript('js/materiel-devis.js', { document, echapperHtml, db, scrollTo() {}, scrollY: 0 }, w);
        await w.materielDevis.rafraichirAccueil();
        expect(noeud('materiel-devis-ranges').innerHTML).toContain('&lt;IMG');
        expect(noeud('materiel-devis-ranges').innerHTML).not.toMatch(/<img/i);
        expect(noeud('materiel-devis-ranges').innerHTML).toContain('data-param-id="D&quot;1"');
    });
});
