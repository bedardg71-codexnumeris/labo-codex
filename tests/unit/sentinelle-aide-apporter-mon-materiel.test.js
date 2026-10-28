/**
 * SENTINELLE — l'aide et l'accompagnement d'« Apporter mon matériel » (consigne du 19 oct. 2026, soir :
 * `plans de travail/CONSIGNE-LOT-2026-10-19-aide-apporter-mon-materiel.md`, textes validés par Grégoire à 19 h 01).
 *
 *   · chaque `data-tooltip` et chaque `data-aide` de l'onglet (index.html ET materiel-dissection.js, qui
 *     pose les bulles des outils et du formulaire de création) a son entrée au VRAI catalogue ;
 *   · les six termes des étiquettes existent au lexique, et leur définition est celle de la section de
 *     l'onglet Aide, mot pour mot (deux copies, un banc) ; « Niveau » ne se confond pas avec « Niveau RàI » ;
 *   · l'étape « Conception » de la visite correspond à `conception-materiel` (#1092) ;
 *   · aucun texte neuf ne dit « dissection ».
 *
 * Le vrai accompagnement.js et les trois vrais catalogues, dans une fenêtre jsdom.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const INDEX = lire('index.html');
const DISSECTION = lire('js/materiel-dissection.js');

/** La tranche de index.html entre deux marques (la première occurrence de chacune). */
function tranche(texte, debut, fin) {
    const i = texte.indexOf(debut);
    expect(i, debut).toBeGreaterThan(-1);
    const j = texte.indexOf(fin, i);
    expect(j, fin).toBeGreaterThan(i);
    return texte.slice(i, j);
}
const ONGLET = tranche(INDEX, '<div id="conception-materiel" class="sous-section">', '<!-- fin sous-section conception-materiel -->');
const CARTE = tranche(INDEX, '<div class="carte accordeon" id="accordeon-aide-apporter-grille">', '<!-- Carte: Créer une échelle de performance -->');

const TERMES = ['critere', 'element-observable', 'descripteur', 'niveau-de-performance', 'points', 'ponderation'];
const BULLES_JS = ['materiel-outil-couper', 'materiel-outil-rattacher', 'materiel-nom-grille', 'materiel-compte', 'materiel-creer'];

let win, cat;
beforeAll(() => {
    win = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only' }).window;
    win.console.warn = () => {};
    ['js/mots-nature.js', 'js/accompagnement.js', 'js/accompagnement-contenu-hover.js', 'js/accompagnement-contenu-popup.js',
        'js/accompagnement-contenu-terme.js'].forEach((f) => win.eval(lire(f)));
    cat = win.accompagnement.catalogue;
});

const cles = (texte, attr) => [...texte.matchAll(new RegExp(attr + '="([^"]+)"', 'g'))].map((m) => m[1]);

describe('« Apporter mon matériel » — les bulles et l’aide « i » ont leur entrée au catalogue', () => {
    it('le catalogue est bien chargé (la tranche n’est pas vide)', () => {
        expect(Object.keys(cat).length).toBeGreaterThan(300);
        expect(cles(ONGLET, 'data-tooltip').length).toBe(6);
        expect(cles(ONGLET, 'data-aide')).toEqual(['conception-materiel', 'conception-materiel']);
    });

    it('chaque data-tooltip de l’onglet, dans index.html, a sa bulle', () => {
        cles(ONGLET, 'data-tooltip').forEach((c) => {
            expect(cat[c] && cat[c].hover, c).toBeTruthy();
        });
    });

    it('chaque bulle posée par materiel-dissection.js est écrite dans le fichier et a sa bulle', () => {
        BULLES_JS.forEach((c) => {
            expect(DISSECTION, c).toContain('\'' + c + '\'');
            expect(cat[c] && cat[c].hover, c).toBeTruthy();
        });
        // Les deux outils de la palette passent par leur table, un par outil de materiel-dissection-lecture.js.
        expect(DISSECTION).toContain('BULLES_OUTILS = { couper: \'materiel-outil-couper\', rattacher: \'materiel-outil-rattacher\' }');
        expect(DISSECTION).toContain('if (BULLES_OUTILS[t.k]) b.setAttribute(\'data-tooltip\', BULLES_OUTILS[t.k]);');
    });

    it('la bulle du menu décrit l’onglet d’aujourd’hui, plus l’assistant retiré', () => {
        expect(cat['nav-conception-materiel'].hover).toContain('tu montres à l’application ce que veut dire chaque morceau');
        expect(cat['nav-conception-materiel'].hover).not.toContain('ce qu’elle en a compris');
    });

    it('l’aide « i » a son titre, ses trois sections et ses trois « Voir aussi », qui existent tous', () => {
        const aide = cat['conception-materiel'].popup;
        expect(aide.titre).toBe('Apporter mon matériel');
        expect(aide.sections.map((s) => s.type)).toEqual(['texte', 'texte', 'conseil']);
        expect(aide.voirAussi).toEqual(['construction-grilles', 'construction-echelles', 'grille-type-critere-detail']);
        aide.voirAussi.forEach((c) => expect(cat[c] && cat[c].popup, c).toBeTruthy());
    });
});

describe('« Apporter mon matériel » — le lexique et la section de l’onglet Aide disent la même chose', () => {
    const terme = (k) => cat['terme-' + k] && cat['terme-' + k].terme;

    it('les six termes existent, avec une définition', () => {
        TERMES.forEach((k) => {
            expect(terme(k), k).toBeTruthy();
            expect(terme(k).definition.length, k).toBeGreaterThan(20);
        });
    });

    it('« Niveau (de performance) » ne se confond pas avec « Niveau RàI »', () => {
        expect(terme('niveau-de-performance').terme).toBe('Niveau (de performance)');
        expect(terme('niveau-rai').terme).toBe('Niveau RàI');
    });

    it('chaque définition est celle de la liste des étiquettes de l’Aide, mot pour mot (première lettre mise à part)', () => {
        const liste = tranche(CARTE, '<ul id="aide-apporter-grille-etiquettes">', '</ul>');
        const lignes = [...liste.matchAll(/<li><strong>([^<]+)<\/strong> : ([^<]+)<\/li>/g)];
        expect(lignes.length).toBe(6);
        lignes.forEach((m, i) => {
            const t = terme(TERMES[i]);
            expect(t.terme.startsWith(m[1]), m[1]).toBe(true);
            const def = t.definition.charAt(0).toLowerCase() + t.definition.slice(1);
            // ↻ #1152, lot 3 (28 oct. 2026) : « Pondération » porte deux sens ; le premier, celui du 19 oct., reste mot pour
            // mot en tête (consigne CONSIGNE-LOT-2026-10-28-aide-lot-3-un-seul-glossaire.md, §2.2). Les cinq autres : égalité.
            if (TERMES[i] === 'ponderation') expect(def.startsWith(m[2] + ' Pour une production'), m[1]).toBe(true);
            else expect(def, m[1]).toBe(m[2]);
        });
    });
});

describe('« Apporter mon matériel » — la visite guidée passe par l’onglet (#1092)', () => {
    it('l’étape « Conception » correspond à conception-materiel, et toujours aux autres', () => {
        const etape = win.accompagnement.etapesTour.find((e) => e.titre === 'Conception');
        expect(etape.correspond('conception-materiel')).toBe(true);
        expect(etape.correspond('conception-productions')).toBe(true);
        expect(etape.correspond('conception-carte')).toBe(false);
        expect(etape.texte).toContain('« Apporter mon matériel » les y range');
        // Une seule étape correspond à l'onglet : le panneau n'hésite pas entre deux.
        expect(win.accompagnement.etapesTour.filter((e) => e.correspond('conception-materiel')).length).toBe(1);
    });
});

describe('« Apporter mon matériel » — aucun texte neuf ne dit « dissection »', () => {
    it('ni les bulles, ni l’aide « i », ni les termes, ni la section de l’Aide, ni l’étape, ni la phrase de la logique', () => {
        const textes = [
            ...cles(ONGLET, 'data-tooltip').concat(BULLES_JS, ['nav-conception-materiel']).map((c) => cat[c].hover),
            JSON.stringify(cat['conception-materiel'].popup),
            ...TERMES.map((k) => JSON.stringify(cat['terme-' + k].terme)),
            CARTE.replace(/<!--[\s\S]*?-->/g, ''),
            win.accompagnement.etapesTour.find((e) => e.titre === 'Conception').texte,
            tranche(DISSECTION, 'if (b.logique === \'deux\')', '\n')
        ];
        expect(textes.join(' ').length).toBeGreaterThan(3000);
        textes.forEach((t) => expect(t.toLowerCase()).not.toContain('dissection'));
    });

    it('la phrase de la logique « les deux » ne dit plus que l’application ne convertirait rien', () => {
        const phrase = tranche(DISSECTION, 'if (b.logique === \'deux\')', '\n');
        expect(phrase).not.toContain('Elle ne convertirait rien');
        expect(phrase).toContain('Ce serait à toi de dire laquelle donne le résultat d’une copie.');
    });
});
