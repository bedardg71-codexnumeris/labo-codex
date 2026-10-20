/**
 * LE BARÈME, LOT 2 — les pièces d'aide (#1120). Consigne : plans de travail/CONSIGNE-LOT-2026-10-20-bareme-2-pieces-d-aide.md.
 *
 * Les 35 textes validés par Grégoire (20 oct. 2026, 9 h 23) vivent dans `plans de travail/TEXTES-2026-10-20-bareme.md` :
 * ce banc LIT CE FICHIER et compare chaque texte à ce qui est posé, MOT POUR MOT, là où il est posé :
 *   A1 à A4 au lexique ; B1 à B6 à l'aide « i » du barème ; C1 et C2 aux trois types ; D1 à D10 dans l'éditeur
 *   (rendu, confirmation, refus de `bareme.js`) ; E1 à E6 aux bulles, par les `data-tooltip` que l'éditeur pose ;
 *   F1 à F5 dans la section de l'onglet Aide. G1 attend (la flèche didactique ne sait ni attendre qu'un barème
 *   paraisse ni porter un lien : voir la demande) ; G2 attend le lot de la dissection.
 * Et, comme au lot de l'aide d'« Apporter mon matériel » : chaque `data-tooltip` et chaque `data-target` neufs ont
 * leur entrée au catalogue ; « barème » et « tranche » existent au lexique.
 *
 * Break-test (fait le 20 oct.) : un caractère retouché dans un texte posé (B2, puis E4) → rouge. Code restauré.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

/**
 * Les textes du fichier validé, par numéro : la valeur suit « **A1** (‹description›) : ». La description peut
 * contenir des parenthèses imbriquées ; un texte de plusieurs lignes continue sur les lignes en retrait.
 */
function textesValides() {
    const t = {};
    let courant = null;
    lire('plans de travail/TEXTES-2026-10-20-bareme.md').split('\n').forEach((ligne) => {
        const m = /^- \*\*([A-G]\d+)\*\* (.*)$/.exec(ligne);
        if (m) {
            let reste = m[2], i = 0;
            if (reste.charAt(0) === '(') {
                let prof = 0;
                for (; i < reste.length; i++) {
                    if (reste[i] === '(') prof++;
                    else if (reste[i] === ')' && --prof === 0) { i++; break; }
                }
            }
            reste = reste.slice(i).replace(/^\s*:\s?/, '');
            courant = m[1];
            t[courant] = reste ? [reste] : [];
        } else if (courant && /^ {2}\S/.test(ligne)) {
            t[courant].push(ligne.trim());
        } else if (!/^\s*$/.test(ligne)) {
            courant = null;
        }
    });
    return t;
}
const T = textesValides();
const un = (k) => { expect(T[k], k).toHaveLength(1); return T[k][0]; };
const sansHtml = (s) => s.replace(/<[^>]+>/g, '');

let win, cat;
beforeAll(() => {
    win = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }).window;
    win.console.warn = () => {};
    ['js/mots-nature.js', 'js/accompagnement.js', 'js/accompagnement-contenu-hover.js', 'js/accompagnement-contenu-popup.js',
        'js/accompagnement-contenu-terme.js'].forEach((f) => win.eval(lire(f)));
    cat = win.accompagnement.catalogue;
});

describe('barème 2 · le fichier des textes est bien lu', () => {
    it('35 textes, de A1 à G2', () => {
        expect(Object.keys(T)).toEqual(['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'C1', 'C2',
            'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'F1', 'F2', 'F3', 'F4', 'F5', 'G1', 'G2']);
        expect(T.B4).toHaveLength(4);
        expect(T.F3).toHaveLength(4);
    });
});

describe('barème 2 · A — le lexique', () => {
    const terme = (k) => cat['terme-' + k] && cat['terme-' + k].terme;

    it('A1 « Barème » et A2 « Tranche », termes neufs, catégorie Structure, voir Conception > Grilles', () => {
        expect(terme('bareme')).toMatchObject({ terme: 'Barème', categorie: 'Structure', voir: 'Conception > Grilles', definition: un('A1') });
        expect(terme('tranche')).toMatchObject({ terme: 'Tranche', categorie: 'Structure', voir: 'Conception > Grilles', definition: un('A2') });
    });

    it('A3 et A4 remplacent les définitions d’« Échelle de performance » et de « Type de critère »', () => {
        expect(terme('echelle-de-performance').definition).toBe(un('A3'));
        expect(terme('type-de-critere').definition).toBe(un('A4'));
    });
});

describe('barème 2 · B — l’aide « i » du barème', () => {
    it('B1 à B6 : titre, deux textes, l’exemple (une ligne par ligne), le conseil, les trois « Voir aussi »', () => {
        const aide = cat['grille-bareme'].popup;
        expect(aide.titre).toBe(un('B1'));
        expect(aide.sections.map((s) => s.type)).toEqual(['texte', 'texte', 'exemple', 'conseil']);
        expect(aide.sections[0].contenu).toBe(un('B2'));
        expect(aide.sections[1].contenu).toBe(un('B3'));
        expect([aide.sections[2].titre, ...aide.sections[2].contenu.split('<br>')]).toEqual(T.B4);
        expect(aide.sections[3].contenu).toBe(un('B5'));
        expect(aide.voirAussi).toEqual(['construction-echelles', 'echelle-plage-notes', 'grille-type-critere-detail']);
        expect(aide.voirAussi.map((k) => cat[k].popup.titre).join(' · ')).toBe(un('B6'));
    });
});

describe('barème 2 · C — les trois types disent ce que fait l’application', () => {
    it('C1 : les trois lignes de l’aide « Type de critère d’évaluation », le nom du type en gras, suivi du deux-points', () => {
        const items = cat['grille-type-critere-detail'].popup.sections[0].items;
        expect(items.map(sansHtml)).toEqual(T.C1);
        items.forEach((it, i) => expect(it.startsWith('<strong>' + T.C1[i].split(' :')[0] + '</strong> :'), it).toBe(true));
    });

    it('C2 : la bulle du champ « Type de critère »', () => {
        expect(cat['cn-grille-type-critere'].hover).toBe(un('C2'));
    });
});

/* ---------------------------------------------------------------- l'éditeur, rendu pour de vrai */

function vraiEchapperHtml(document) {
    const src = lire('js/config.js');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, document, console, stockage, stockage);
}

const K = 'a2032_grillesTemplates';
function monterEditeur() {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
    const document = dom.window.document;
    const grille = { id: 'GRILLE_BANC', nom: 'Grille fictive', type: 'analytique', criteres: [
        { id: 'CR_1', nom: 'Critère fictif', type: 'analytique', ponderation: 3, bareme: [
            { id: 'TR_a', nom: 'Partiel', pointsMin: null, pointsMax: null, texte: 'Un texte fictif.' },
            { id: 'TR_b', nom: '', pointsMin: 3, pointsMax: 4, texte: 'Un autre texte fictif.' }] }] };
    const store = { [K]: [grille] };
    const journal = [];
    const db = {
        get: async (k) => store[k], getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d),
        set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
        modifier: async (k, f, d) => { const r = await f(k in store ? JSON.parse(JSON.stringify(store[k])) : d); if (r !== undefined) store[k] = r; return r; }
    };
    const echapperHtml = vraiEchapperHtml(document);
    const w = { echapperHtml };
    chargerScript('js/ui-blocs.js', { document }, w);
    chargerScript('js/bareme.js', {}, w);
    chargerScript('js/grilles.js', {
        db, cle: (k) => 'a2032_' + k, document, echapperHtml, confirm: (m) => { journal.push(m); return false; },
        genererIdUnique: (p) => p + 'banc', notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null
    }, w);
    w.afficherCriteresGrille(JSON.parse(JSON.stringify(grille)));
    return { w, document, journal, carte: document.querySelector('#listeCriteres .item-liste') };
}

describe('barème 2 · D — les mots de l’éditeur, tels que validés', () => {
    it('D1 : les libellés, à l’écran ; D2 : les deux marques ; D3 : la confirmation du retrait', async () => {
        const { w, carte, journal } = monterEditeur();
        const libelles = T.D1[0].split(' · ').map((x) => x.replace(/ \([^)]*\)$/, ''));
        const [titre, nom, points, texte, ajouter, retirer] = libelles;
        expect(carte.querySelector('.grille-attendu-titre').textContent.trim()).toBe(titre);
        const t0 = carte.querySelector('.grille-bareme-tranche');
        expect([...t0.querySelectorAll('.grille-bareme-champ')].map((l) => l.childNodes[0].textContent.trim())).toEqual([nom, points, texte]);
        expect(carte.querySelector('[data-action="ajouterTrancheBareme"]').textContent).toBe(ajouter);
        expect(t0.querySelector('[data-action="retirerTrancheBareme"]').getAttribute('title')).toBe(retirer);
        const marques = T.D2.map((x) => x.replace(/ \([^)]*\)$/, ''));
        expect(marques).toEqual(['à compléter', 'hors barème']);
        expect([...carte.querySelectorAll('.grille-bareme-marque')].map((p) => p.textContent)).toEqual(marques);   // TR_b : 3 à 4 sur une pondération de 3
        await w.retirerTrancheBareme('GRILLE_BANC', 0, 'TR_a');
        expect(journal).toEqual([un('D3')]);
    });

    it('D4 à D10 : les refus de `bareme.js`, les valeurs insérées à la place de ‹…›', () => {
        const B = chargerScript('js/bareme.js').bareme;
        expect(B.REFUS.trop).toBe(un('D4'));
        expect(B.REFUS.texteLong).toBe(un('D5'));
        expect(B.REFUS.pointsIllisibles).toBe(un('D6'));
        expect(B.REFUS.pointsNegatifs).toBe(un('D7'));
        expect(B.REFUS.pointsHorsBornes(7)).toBe(un('D8').replace('‹N›', '7'));
        expect(B.REFUS.chevauchement({ nom: 'Partiel', pointsMin: 3, pointsMax: 4 })).toBe(un('D9').replace('‹Nom›', 'Partiel').replace('‹3 à 4›', '3 à 4'));
        expect(B.REFUS.nomLong).toBe(un('D10'));
    });
});

describe('barème 2 · E — les bulles de l’éditeur', () => {
    it('E1 à E6 : posées par data-tooltip sur Nom, Points, Texte, « + Ajouter une tranche » et les deux marques', () => {
        const { carte } = monterEditeur();
        const bulle = (el) => cat[el.getAttribute('data-tooltip')].hover;
        const t0 = carte.querySelector('.grille-bareme-tranche');
        expect(bulle(t0.querySelector('[data-champ="nom"]'))).toBe(un('E1'));
        expect(bulle(t0.querySelector('[data-champ="points"]'))).toBe(un('E2'));
        expect(bulle(t0.querySelector('[data-champ="texte"]'))).toBe(un('E3'));
        expect(bulle(carte.querySelector('[data-action="ajouterTrancheBareme"]'))).toBe(un('E4'));
        expect([...carte.querySelectorAll('.grille-bareme-marque')].map(bulle)).toEqual([un('E5'), un('E6')]);
    });

    it('chaque data-tooltip et chaque data-target que pose le barème a son entrée au catalogue', () => {
        const { carte } = monterEditeur();
        const bloc = carte.querySelector('.grille-attendu');
        const bulles = [...bloc.querySelectorAll('[data-tooltip]')].map((x) => x.getAttribute('data-tooltip'));
        expect(new Set(bulles).size).toBe(6);
        bulles.forEach((c) => expect(cat[c] && cat[c].hover, c).toBeTruthy());
        const cibles = [...bloc.querySelectorAll('.primo-aide[data-target]')].map((x) => x.getAttribute('data-target'));
        expect(cibles).toEqual(['grille-bareme']);
        // L'icône « i » est à côté du titre « Barème ».
        expect(bloc.querySelector('.grille-attendu-titre .primo-aide[data-target="grille-bareme"]')).not.toBeNull();
        cibles.forEach((c) => expect(cat[c] && cat[c].popup, c).toBeTruthy());
        cat['grille-bareme'].popup.voirAussi.forEach((c) => expect(cat[c] && cat[c].popup, c).toBeTruthy());
    });
});

describe('barème 2 · F — la section de l’onglet Aide', () => {
    const INDEX = lire('index.html');
    const i = INDEX.indexOf('<div class="carte accordeon" id="accordeon-aide-bareme">');
    const CARTE = INDEX.slice(i, INDEX.indexOf('<!-- Carte: Créer une échelle de performance -->', i));
    const doc = new JSDOM(CARTE).window.document;
    const texte = (sel) => doc.querySelector(sel).textContent.replace(/\s+/g, ' ').trim();

    it('sous « Configuration », après « Apporter une grille que tu as déjà »', () => {
        expect(i).toBeGreaterThan(INDEX.indexOf('id="accordeon-aide-apporter-grille"'));
        expect(i).toBeGreaterThan(-1);
    });

    it('F1 à F5, mot pour mot ; F3 en tableau à deux colonnes, une rangée par intitulé', () => {
        expect(texte('.carte-titre-bleu').replace(/^▼\s*/, '')).toBe(un('F1'));
        expect(texte('#aide-bareme-f2')).toBe(un('F2'));
        expect([...doc.querySelectorAll('#aide-bareme-tableau thead th')].map((x) => x.textContent)).toEqual(['', 'Échelle de performance', 'Barème']);
        const rangees = [...doc.querySelectorAll('#aide-bareme-tableau tbody tr')].map((tr) =>
            tr.querySelector('th').textContent + ' : ' + [...tr.querySelectorAll('td')].map((x) => x.textContent).join(' | '));
        expect(rangees).toEqual(T.F3);
        expect(texte('#aide-bareme-f4')).toBe(un('F4'));
        expect(texte('#aide-bareme-f5')).toBe(un('F5'));
        // Le tableau défile dans son propre conteneur s'il le faut (l'iPad debout).
        expect(doc.querySelector('#aide-bareme-tableau').parentElement.classList.contains('u-overflow-x-auto')).toBe(true);
    });

    it('la recherche de l’onglet Aide la trouve par « barème » et par « tranche » (le texte de la carte)', () => {
        const contenu = doc.querySelector('.carte').textContent.toLowerCase();
        expect(contenu).toContain('barème');
        expect(contenu).toContain('tranche');
    });
});

describe('barème 2 · G — ce qui attend', () => {
    it('G1 n’est posé nulle part (aucun mécanisme existant ne l’affiche comme demandé) ; G2 attend la dissection', () => {
        const js = ['js/accompagnement.js', 'js/accompagnement-contenu-hover.js', 'js/accompagnement-contenu-popup.js', 'js/grilles.js', 'js/materiel.js'].map(lire).join('\n');
        expect(js).not.toContain(un('G1'));
        expect(js).not.toContain(un('G2'));
    });
});
