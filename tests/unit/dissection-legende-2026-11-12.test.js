/**
 * LA LÉGENDE DE LA DISSECTION (12 nov. 2026, relais de la conversation du Projet, 11 h 25) — points 2, 3 et 4.
 *
 *   L — point 2 : la légende remplace le surligneur. Aucun « surligneur », « surligne », « surligné » ni « palette » dans
 *       ce que l'écran de la dissection donne à lire : le texte de « Apporter mon matériel » (accueil et dissection,
 *       commentaires HTML exclus), ses attributs lus (aria-label, title, placeholder), et les chaînes de
 *       `materiel-dissection.js` et `materiel-dissection-lecture.js` (commentaires exclus ; les identifiants
 *       `dissection-palette…` ne sont pas du texte).
 *   P — point 3 : « Pondération » et « Points » portent un exemple de forme ; « Points » posé sur un « / N », l'aide dit
 *       qu'il ressemble au poids d'un critère et propose « Pondération » sur ce morceau, même quand la grille est lisible.
 *   R — point 4 : des points sans réponse ; l'aide désigne la réponse libre de la même CASE (« Résume quelques
 *       événements »), pas le premier morceau libre de la rangée (« · Repérage des événements principaux ») ; sans
 *       réponse libre dans la case, la phrase sans morceau.
 *
 * Break-tests (faits le 12 nov.) : voir le rapport du lot, « Bancs et break-tests » (second relais).
 * Grilles FICTIVES (aucun texte réel).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { chargerScript } from './_helpers/charger-script.js';

const RACINE = resolve(__dirname, '../..');
const lire = (f) => readFileSync(resolve(RACINE, f), 'utf8');
const fenetreDom = new JSDOM('<!doctype html><html><body></body></html>').window;
const INTERDITS = /surligne|surligné|palette/i;

let D;
beforeAll(() => {
    const w = chargerScript('js/materiel-lecture.js', { DOMParser: fenetreDom.DOMParser });
    chargerScript('js/materiel-assistant.js', {}, w);
    chargerScript('js/materiel-dissection-lecture.js', { DOMParser: fenetreDom.DOMParser }, w);
    D = w.materielDissectionLecture;
});

function tableau(rangees) {
    let n = 0;
    return { mode: 'table', rows: rangees.map((r) => r.map((c) => {
        const cs = typeof c[0] === 'number' ? c[0] : 1;
        const lignes = typeof c[0] === 'number' ? c.slice(1) : c;
        return { cs, rs: 1, lines: lignes.map((t) => ({ id: 'm' + (++n), t })) };
    })) };
}
const idDe = (doc, t) => { const M = D.morceaux(doc); return M.ordre.find((id) => M.texte[id] === t); };
const liensDe = (doc, paires) => Object.fromEntries(paires.map(([t, type]) => [idDe(doc, t), type]));
function aideDe(doc, liens) {
    const R = D.comprendre(doc, liens, {});
    const manques = D.creation(R, { nomsGrilles: [] }, undefined, { compte: 'points', valeurs: {} }).manques;
    return D.aide({ doc, liens, rattachements: {}, manque: manques[0] || null, enCodes: false });
}

// Une valeur d'état du geste au doigt (`gesteTactile`, phase 'surligne'), jamais affichée : du code, pas du texte.
const PHASE = "'surligne'";

/** Les chaînes d'un fichier JS, ses commentaires retirés. */
function chaines(src) {
    const sans = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\s\/\/ .*$/gm, '');
    return sans.match(/'(?:[^'\\\n]|\\.)*'/g) || [];
}

describe('L — la légende, nulle part le surligneur', () => {
    it('L.a : le texte et les attributs lus de « Apporter mon matériel » (index.html)', () => {
        const doc = new JSDOM(lire('index.html')).window.document;
        const zone = doc.getElementById('conception-materiel');
        expect(zone, 'la sous-section existe').toBeTruthy();
        const texte = zone.textContent.replace(/\s+/g, ' ');
        // 13 nov. 2026 (la carte d'aide) : les consignes ont quitté la page ; la carte les dit (`consignes`).
        expect(texte).not.toContain('Touche une étiquette dans la légende.');
        expect(lire('js/materiel-dissection.js')).toContain("aucune: 'Touche une étiquette dans la légende.'");
        expect(texte.match(new RegExp('.{0,40}(' + INTERDITS.source + ').{0,40}', 'gi')) || []).toEqual([]);
        const attributs = [...zone.querySelectorAll('[aria-label], [title], [placeholder]')]
            .flatMap((e) => ['aria-label', 'title', 'placeholder'].map((a) => e.getAttribute(a)).filter(Boolean));
        expect(attributs.filter((a) => INTERDITS.test(a))).toEqual([]);
        expect(zone.querySelector('#dissection-palette').getAttribute('aria-label')).toBe('Légende');
        expect(zone.querySelector('.dissection-legende-titre').textContent).toBe('Légende');
    });
    it('L.b : les chaînes de la dissection (commentaires exclus, identifiants exclus)', () => {
        const fautives = ['js/materiel-dissection.js', 'js/materiel-dissection-lecture.js'].flatMap((f) =>
            chaines(lire(f)).filter((c) => c !== PHASE && INTERDITS.test(c.replace(/dissection-palette[\w-]*/g, ''))).map((c) => f + ' : ' + c));
        expect(fautives).toEqual([]);
    });
});

describe('P — « Points » posé sur un « / N »', () => {
    it('P.a : les précisions donnent un exemple de forme', () => {
        expect(D.TYPE.ponderation.precision).toBe('Sur combien il se note (par ex. « / 10 »)');
        expect(D.TYPE.points.precision).toBe('Ce qu’elle vaut, en chiffres (par ex. « 3 », « 4-5 »)');
        expect([D.TYPE.ponderation.nom, D.TYPE.points.nom]).toEqual(['Pondération', 'Points']);
    });
    const GRILLE = () => tableau([
        [[3, 'Grille fictive de lecture']],
        [['Compréhension'], ['Résume l’essentiel', '3'], ['/ 10']],
        [['Appréciation'], ['Donne une opinion', '2'], ['/ 5']]
    ]);
    const BASE = [['Grille fictive de lecture', 'titre'], ['Compréhension', 'critere'], ['Appréciation', 'critere'],
        ['Résume l’essentiel', 'descripteur'], ['3', 'points'], ['Donne une opinion', 'descripteur'], ['2', 'points'], ['/ 5', 'ponderation']];
    it('P.b : « Points » sur « / 10 » : l’aide le dit, « Pondération » sur ce morceau', () => {
        const doc = GRILLE();
        const a = aideDe(doc, liensDe(doc, BASE.concat([['/ 10', 'points']])));
        expect(a).toMatchObject({ sorte: 'pointsSurPonderation', etiquette: 'ponderation', morceau: idDe(doc, '/ 10') });
        expect(a.phrase).toBe('« / 10 » ressemble au poids d’un critère (sur combien il se note), pas à ce que vaut une réponse : prends « Pondération », puis touche « / 10 ».');
    });
    it('P.c : corrigé en « Pondération », la grille est prête ; « 3 » en « Points » ne déclenche rien', () => {
        const doc = GRILLE();
        expect(aideDe(doc, liensDe(doc, BASE.concat([['/ 10', 'ponderation']]))).sorte).toBe('pret');
    });
});

describe('R — des points sans réponse : la réponse de leur case', () => {
    // L'exercice de l'exemple, comme sur l'iPad à 11 h 03 : la bulle a fait prendre « Titre », puis « Points », posé sur
    // « 2 » ; le critère est étiqueté, ni les éléments observables ni les réponses ne le sont.
    it('R.a : un élément observable libre avant la réponse : l’aide désigne la réponse, dans la case des points', () => {
        const doc = D.exempleDoc();
        const liens = liensDe(doc, [['Journal de lecture', 'titre'], ['L’étudiant·e résume l’œuvre avec justesse', 'critere'], ['2', 'points']]);
        expect(liens[idDe(doc, '· Repérage des événements principaux')], 'l’élément observable reste libre').toBeUndefined();
        const a = aideDe(doc, liens);
        expect(a.sorte).toBe('sansPlace');
        expect(a.etiquette).toBe('descripteur');
        expect(a.morceau).toBe(idDe(doc, 'Résume quelques événements'));
        expect(a.phrase).toBe('« 2 » n’a aucune réponse à qui donner ces points : prends « Descripteur », puis touche « Résume quelques événements ».');
    });
    it('R.b : aucune réponse libre dans la case : la phrase sans morceau', () => {
        const doc = tableau([
            [[3, 'Grille fictive']],
            [['Critère fictif', '· Un élément libre'], ['Une réponse déjà ailleurs'], ['4']]
        ]);
        const a = aideDe(doc, liensDe(doc, [['Grille fictive', 'titre'], ['Critère fictif', 'critere'], ['Une réponse déjà ailleurs', 'niveau'], ['4', 'points']]));
        if (a.sorte === 'sansPlace' && a.etiquette === 'descripteur') {
            expect(a.morceau).toBeNull();
            expect(a.phrase).toBe('« 4 » n’a aucune réponse à qui donner ces points : prends « Descripteur », puis touche la réponse qu’ils valent.');
        } else {
            throw new Error('premier manque inattendu : ' + a.sorte + ' / ' + a.phrase);
        }
    });
});
