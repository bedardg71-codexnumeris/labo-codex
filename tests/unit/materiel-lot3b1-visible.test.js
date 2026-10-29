/**
 * « APPORTER MON MATÉRIEL », LOT 3b1 — ce que l'assistant écrit se voit dans l'application.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-17-apporter-mon-materiel-3b1-visible.md.
 *
 * Ce que ce banc verrouille :
 *   L — LE BLOC EN LECTURE (`grilles.js`, rendreAttenduCritere) : présent seulement s'il y a des
 *       données ; niveau nommé par l'échelle, dans son ordre ; échelle disparue → le code ;
 *       retours à la ligne gardés ; tout texte échappé ; pas de doublon pour un critère algorithmique.
 *   H — UN CRITÈRE SANS DONNÉES : ↻ 20 oct. (Grégoire, 13 h 56) — il montre sa section « Sous-critères », vide,
 *       avec son bouton d'ajout ; un critère algorithmique, rien (son gabarit a la liste). Les sous-critères se
 *       modifient : voir sentinelle-sous-criteres-editables.test.js.
 *   C — LA CONFIRMATION : le résumé de la création porte les identifiants des objets créés.
 *   T — LE TEXTE « fichier d'origine » de l'accueil (validé par Grégoire, 17 oct., 8 h 53 ; son jumeau, le message « aucun tableau », est parti le 19 oct. avec l'assistant).
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
    div.innerHTML = win.rendreAttenduCritere(c, { grilleId: 'GR_BANC', index: 0 });   // lot 13 : le contexte des handlers
    return div;
}

describe('lot 3b1 · L — le bloc « Ce qui est attendu à chaque niveau », en lecture', () => {
    it('L.a rien pour un critère sans descripteurs ni sous-critères', () => {
        const { win } = monter();
        expect(win.rendreAttenduCritere(critere())).toBe('');
        // Lot 13 (19 oct.) : une réponse au texte vide se montre (on vient de l'ajouter) ; sans aucune, rien.
        expect(win.rendreAttenduCritere(critere({ descripteurs: { echelleId: 'ECH_BANC', parNiveau: {} }, sousCriteres: [] }))).toBe('');
    });

    it('L.b chaque niveau nommé par l’échelle, dans SON ordre, puis son texte ; puis les sous-critères dans l’ordre', () => {
        const { win, dom } = monter();
        const div = bloc(win, AVEC, dom);
        expect([...div.querySelectorAll('.grille-attendu-titre')].map(h => h.textContent)).toEqual(['Ce qui est attendu à chaque niveau', 'Sous-critères']);
        expect([...div.querySelectorAll('.grille-attendu-niveau strong')].map(s => s.textContent)).toEqual(['Incomplet', 'Maîtrisé', 'Étendu']);
        expect([...div.querySelectorAll('.grille-attendu-niveau textarea')].map(t => t.value)).toEqual(['Ligne un.\nLigne deux.', 'Texte maîtrisé.', 'Texte étendu.']);
        // 20 oct. : les sous-critères se modifient (le nom seul), dans l'ordre.
        expect([...div.querySelectorAll('.grille-sous-critere input')].map(x => x.value)).toEqual(['Annoncer le plan', 'Conclure']);
        // Lot 13 (19 oct.) : lié à une échelle, le texte seul se modifie — ni points, ni corbeille, ni ajout ; l'écran le dit.
        expect(div.querySelectorAll('.grille-attendu-niveau textarea')).toHaveLength(3);
        expect(div.querySelectorAll('.grille-attendu-niveaux input, .grille-attendu-niveaux select, .grille-attendu-niveaux button')).toHaveLength(0);
        expect(div.querySelector('.grille-attendu-mention').textContent).toBe('Les niveaux viennent de l’échelle « Échelle du banc » : ici, seul leur texte se modifie.');
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
        expect(div.querySelector('.grille-attendu-niveau textarea').value).toBe(piege);
        expect(div.querySelector('.grille-sous-critere input').value).toBe(piege);
    });

    it('L.e critère algorithmique : ses sous-critères ont déjà leur place éditable, pas de liste en double', () => {
        const { win } = monter();
        expect(win.rendreAttenduCritere(critere({ type: 'algorithmique', sousCriteres: AVEC.sousCriteres }))).toBe('');
    });
});

describe('lot 3b1 · H — un critère sans données (↻ 20 oct. : sa section « Sous-critères », vide)', () => {
    it('H.a la liste des critères : l’appel au bloc est collé au gabarit ; un critère sans données montre la section vide et son bouton ; un algorithmique, rien', () => {
        const src = readFileSync(path.join(racine, 'js', 'grilles.js'), 'utf8');
        expect(src).toContain('            ${rendreCartesGabaritAlgo(critere, { mode: "grille", index: index, grilleId: grille.id, criteres: grille.criteres })}${rendreAttenduCritere(critere, { grilleId: grille.id, index: index })}\n        </div>\n    `).join(\'\');');
        const { win, dom } = monter();
        win.afficherCriteresGrille({ id: 'GR_BANC', criteres: [critere(), critere({ id: 'CR_2', nom: 'Structure', type: 'algorithmique' })] });
        const cartes = dom.window.document.querySelectorAll('#listeCriteres .item-liste');
        expect([...cartes[0].querySelectorAll('.grille-attendu-titre')].map(h => h.textContent)).toEqual(['Sous-critères']);
        expect(cartes[0].querySelectorAll('.grille-sous-critere')).toHaveLength(0);
        expect(cartes[0].querySelector('.grille-attendu [data-action="ajouterSousCritere"]')).not.toBeNull();
        expect(cartes[1].querySelector('.grille-attendu')).toBeNull();
    });

    it('H.b un critère qui porte des données : le bloc paraît sur SA carte, après sa rangée', () => {
        const { win, dom } = monter();
        win.afficherCriteresGrille({ id: 'GR_BANC', criteres: [critere(), AVEC] });
        const cartes = dom.window.document.querySelectorAll('#listeCriteres .item-liste');
        expect(cartes[0].querySelectorAll('.grille-attendu-niveau')).toHaveLength(0);
        expect(cartes[1].querySelector('.critere-rangee + .grille-attendu')).not.toBeNull();
        expect(cartes[1].querySelectorAll('.grille-sous-critere')).toHaveLength(2);
    });
});

describe('lot 3b1 · C et T — la confirmation, les textes', () => {
    it('C.a le résumé de la création porte les identifiants de la grille et de l’échelle', () => {
        const src = readFileSync(path.join(racine, 'js', 'materiel-creation.js'), 'utf8');
        // Étape 5 (17 oct.) : une grille en points n'a pas d'échelle — son identifiant est alors null.
        // ↻ #1152, lot 5 (29 oct. 2026) : la branche des rétroactions de l'ancien assistant est retirée (code mort, plans de travail/TEXTES-2026-10-28-textes-d-ecran.md).
        expect(src).toContain("ids: { grille: o.grille.id, echelle: o.echelle ? o.echelle.id : null }");
    });

    // 19 oct. 2026 : le message « aucun tableau » est parti avec l'assistant en sept étapes, qui seul l'affichait.
    it('T.a l’étape 1 de l’accueil parle du fichier d’origine', () => {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        expect(html).toContain('Ouvre ta grille dans son fichier d’origine (Word, Pages ou un autre traitement de texte), sélectionne le tableau entier – pas seulement le texte de ses cases (ou ses cellules), mais bien le tableau –, puis copie-le. Le texte copié d’un PDF est accepté aussi, mais il arrive sans ses cases : le fichier d’origine donne un meilleur résultat.');
    });
});
