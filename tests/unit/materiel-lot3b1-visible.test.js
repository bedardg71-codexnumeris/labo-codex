/**
 * « APPORTER MON MATÉRIEL », LOT 3b1 — ce que l'assistant écrit se voit dans l'application.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3b1-visible.md.
 *
 * Ce que ce banc verrouille :
 *   L — LE BLOC EN LECTURE (`grilles.js`, rendreAttenduCritere) : présent seulement s'il y a des
 *       données ; niveau nommé par l'échelle, dans son ordre ; échelle disparue → le code ;
 *       retours à la ligne gardés ; tout texte échappé ; pas de doublon pour un critère algorithmique.
 *   H — UN CRITÈRE SANS DONNÉES : le HTML de la liste des critères est celui d'avant, à l'octet.
 *   C — LA CONFIRMATION : le résumé de la création porte les identifiants des objets créés.
 *   T — LES DEUX TEXTES « fichier d'origine » (validés par Grégoire, 17 oct., 8 h 53).
 */
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

function vraiEchapperHtml(document) {
    const src = readFileSync(path.join(racine, 'js', 'config.js'), 'utf8');
    const fabriquer = new Function('window', 'document', 'console', 'localStorage', 'sessionStorage',
        '"use strict";\n' + src + '\nreturn echapperHtml;');
    const stockage = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };
    return fabriquer({ addEventListener() {}, removeEventListener() {} }, document, console, stockage, stockage);
}

const cle = (k) => 'a2032_' + k;
const ECHELLE = { id: 'ECH_BANC', nom: 'Échelle du banc', niveaux: [
    { code: 'I', nom: 'Incomplet' }, { code: 'D', nom: 'En développement' }, { code: 'M', nom: 'Maîtrisé' }, { code: 'E', nom: 'Étendu' }] };

function monter(echelles = [ECHELLE]) {
    const dom = new JSDOM('<!doctype html><html><body><div id="listeCriteres"></div></body></html>');
    const store = { [cle('echellesTemplates')]: echelles };
    const db = { getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : d), get: async (k) => store[k], modifier: async () => {}, set: async () => {} };   // les écritures de chargement (migrations) : sans objet ici
    const win = chargerScript('js/grilles.js', {
        db, cle, document: dom.window.document, echapperHtml: vraiEchapperHtml(dom.window.document),
        notifications: { succes() {}, erreur() {}, info() {} }, grilleTemplateActuelle: null
    });
    win.boutonsReordonnerBloc = () => '<span>ordre</span>';
    win.boutonRetirerBloc = () => '<span>retirer</span>';
    return { win, dom };
}

const critere = (extra) => Object.assign({ id: 'CR_1', nom: 'Clarté', description: '', ponderation: 50, type: 'holistique',
    formule: '', niveauSOLO: 'multistructurel', verrouille: false }, extra);
const AVEC = critere({
    descripteurs: { echelleId: 'ECH_BANC', parNiveau: { E: 'Texte étendu.', I: 'Ligne un.\nLigne deux.', M: 'Texte maîtrisé.' } },
    sousCriteres: [{ id: 'SC_1', code: '0', nom: 'Annoncer le plan', ponderation: 1, retroaction: '' },
        { id: 'SC_2', code: '1', nom: 'Conclure', ponderation: 1, retroaction: '' }]
});

function bloc(win, c, dom) {
    const div = dom.window.document.createElement('div');
    div.innerHTML = win.rendreAttenduCritere(c);
    return div;
}

describe('lot 3b1 · L — le bloc « Ce qui est attendu à chaque niveau », en lecture', () => {
    it('L.a rien pour un critère sans descripteurs ni sous-critères', () => {
        const { win } = monter();
        expect(win.rendreAttenduCritere(critere())).toBe('');
        expect(win.rendreAttenduCritere(critere({ descripteurs: { echelleId: 'ECH_BANC', parNiveau: { I: '  ' } }, sousCriteres: [] }))).toBe('');
    });

    it('L.b chaque niveau nommé par l’échelle, dans SON ordre, puis son texte ; puis les sous-critères dans l’ordre', () => {
        const { win, dom } = monter();
        const div = bloc(win, AVEC, dom);
        expect([...div.querySelectorAll('.grille-attendu-titre')].map(h => h.textContent)).toEqual(['Ce qui est attendu à chaque niveau', 'Sous-critères']);
        expect([...div.querySelectorAll('.grille-attendu-niveau strong')].map(s => s.textContent)).toEqual(['Incomplet', 'Maîtrisé', 'Étendu']);
        expect([...div.querySelectorAll('.grille-attendu-niveau p')].map(p => p.textContent)).toEqual(['Ligne un.\nLigne deux.', 'Texte maîtrisé.', 'Texte étendu.']);
        expect([...div.querySelectorAll('.grille-attendu-sous li')].map(li => li.textContent)).toEqual(['Annoncer le plan', 'Conclure']);
        expect(div.querySelectorAll('input, textarea, select, button')).toHaveLength(0);   // lecture seule
        expect(div.textContent.toLowerCase()).not.toContain('descripteur');
    });

    it('L.c l’échelle n’existe plus : le code seul, dans l’ordre écrit', () => {
        const { win, dom } = monter([]);
        const div = bloc(win, AVEC, dom);
        expect([...div.querySelectorAll('.grille-attendu-niveau strong')].map(s => s.textContent)).toEqual(['E', 'I', 'M']);
    });

    it('L.d tout texte est échappé (un <img onerror> dans un texte de niveau et un sous-critère)', () => {
        const { win, dom } = monter();
        const piege = '<img src=x onerror="window.__pwn=1">';
        const div = bloc(win, critere({ descripteurs: { echelleId: 'ECH_BANC', parNiveau: { I: piege } }, sousCriteres: [{ nom: piege }] }), dom);
        expect(div.querySelector('img')).toBeNull();
        expect(div.querySelector('.grille-attendu-niveau p').textContent).toBe(piege);
        expect(div.querySelector('.grille-attendu-sous li').textContent).toBe(piege);
    });

    it('L.e critère algorithmique : ses sous-critères ont déjà leur place éditable, pas de liste en double', () => {
        const { win } = monter();
        expect(win.rendreAttenduCritere(critere({ type: 'algorithmique', sousCriteres: AVEC.sousCriteres }))).toBe('');
    });
});

describe('lot 3b1 · H — un critère sans données s’affiche exactement comme avant', () => {
    it('H.a la liste des critères : l’appel au bloc est collé au gabarit, sans un caractère de plus ; il rend « » sans données', () => {
        // Le gabarit d'avant le lot 3b1, à l'octet, PLUS l'appel ; comme il rend '' pour un critère
        // sans données, le HTML de ce critère est celui d'avant.
        const src = readFileSync(path.join(racine, 'js', 'grilles.js'), 'utf8');
        expect(src).toContain('            ${rendreCartesGabaritAlgo(critere, { mode: "grille", index: index, grilleId: grille.id })}${rendreAttenduCritere(critere)}\n        </div>\n    `).join(\'\');');
        const { win, dom } = monter();
        win.afficherCriteresGrille({ id: 'GR_BANC', criteres: [critere(), critere({ id: 'CR_2', nom: 'Structure' })] });
        const html = dom.window.document.getElementById('listeCriteres').innerHTML;
        expect(html).not.toContain('grille-attendu');
        expect(html).toContain('</div>\n            \n        </div>');   // gabarit algo vide, puis rien, puis la fin de la carte
    });

    it('H.b un critère qui porte des données : le bloc paraît sur SA carte, après sa rangée', () => {
        const { win, dom } = monter();
        win.afficherCriteresGrille({ id: 'GR_BANC', criteres: [critere(), AVEC] });
        const cartes = dom.window.document.querySelectorAll('#listeCriteres .item-liste');
        expect(cartes[0].querySelector('.grille-attendu')).toBeNull();
        expect(cartes[1].querySelector('.critere-rangee + .grille-attendu')).not.toBeNull();
    });
});

describe('lot 3b1 · C et T — la confirmation, les textes', () => {
    it('C.a le résumé de la création porte les identifiants de la grille, de l’échelle, de la cartouche', () => {
        const src = readFileSync(path.join(racine, 'js', 'materiel-creation.js'), 'utf8');
        expect(src).toContain("ids: { grille: o.grille.id, echelle: o.echelle.id, cartouche: o.cartouche ? o.cartouche.id : null }");
    });

    it('T.a l’étape 1 de l’accueil et le message « aucun tableau » parlent du fichier d’origine', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).toContain('Ouvre ta grille dans son fichier d’origine (Word, Pages ou un autre traitement de texte), sélectionne le tableau entier, et non seulement le texte de ses cases, puis copie-le. Copié depuis un PDF, il arriverait sans ses cases, en texte désordonné.');
        const L = chargerScript('js/materiel-lecture.js', {}).materielLecture;
        expect(L.MESSAGE_SANS_TABLEAU).toBe('L’application n’a pas trouvé de tableau dans ce que tu as collé. Si ta grille vient d’un PDF, ce serait la cause : un PDF ne transmet que du texte, sans ses cases. Tu pourrais la copier depuis son fichier d’origine (Word, Pages ou un autre traitement de texte), en sélectionnant le tableau entier, ou la taper à la main.');
    });
});
