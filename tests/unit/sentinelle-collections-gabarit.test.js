// SENTINELLE — LES COLLECTIONS DE PARAMÈTRES DANS LE GABARIT (lot B du 5 septembre 2026, volet 2)
// Carte : `plans de travail/CARTE-2026-09-05-collections.md` (§b, §c, §d). Le gabarit réel
// (`js/grilles.js`) et le module réel (`js/collections-projection.js`) sur une base factice.
//
//   A. LE MENU — sans collection, rien de plus ; avec : « Mes collections » APRÈS les modèles
//      livrés, une option `collection:<id>` par jeu, la liste sous le menu avec sa corbeille, la
//      ligne qui dit la copie ; noms échappés ;
//   B. LE CHOIX — le handler (grille et création) reconnaît `collection:` et COPIE ; un id disparu
//      n'écrit rien et le dit ; après la copie le menu montre le modèle, pas la collection ;
//   C. LE GESTE — le bouton sous les paliers (pas sous « Aucune projection ») ; la section inline,
//      son état en mémoire qui survit au redessin ; enregistrer écrit, ferme, liste ; un nom pris
//      se dit sans écrire et garde le nom tapé ; un nom vide se marque ;
//   D. LA SUPPRESSION — après confirmation, la collection part, la grille qui l'a copiée ne bouge pas ;
//   E. jetons et CSS scopé.
//
// BREAK-TESTS (faits le 5 septembre 2026, chacun restauré, `cmp` identique) :
//   · le handler grille traite `collection:<id>` comme un modèle → B.a rougit ;
//   · l'optgroup rendu même sans collection → A.a rougit ;
//   · enregistrer ne ferme pas la section → C.b rougit.

import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { jetonAuMoins } from './_helpers/jeton-anticache.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');
const require = createRequire(import.meta.url);
const E = require(path.join(racine, 'js/evaluation-enonces.js'));
const P = require(path.join(racine, 'js/evaluation-projection.js'));
const clone = (v) => JSON.parse(JSON.stringify(v));

/* ------------------------------------------------------------------ harnais */

const echapper = (t) => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function fauxElement() {
    return {
        value: '', innerHTML: '', textContent: '', style: {}, dataset: {},
        classList: { _c: new Set(), add(c) { this._c.add(c); }, remove(c) { this._c.delete(c); }, contains(c) { return this._c.has(c); }, toggle() {} },
        querySelectorAll: () => [], querySelector: () => null,
        addEventListener() {}, appendChild() {}, setAttribute() {}, focus() {}
    };
}

function fauxDocument() {
    const elements = {};
    const doc = {
        _elements: elements, _input: null, activeElement: null,
        getElementById: (id) => (elements[id] || (elements[id] = fauxElement())),
        querySelector: (sel) => (typeof sel === 'string' && sel.indexOf('input[data-collection-nom') === 0) ? doc._input : null,
        querySelectorAll: () => [],
        body: { appendChild() {}, removeChild() {} },
        createElement: () => fauxElement(),
        addEventListener() {}, removeEventListener() {}
    };
    return doc;
}

const CLE_G = 'a2026_grillesTemplates';
const CLE_C = 'a2026_collectionsProjection';

function monter(grilles, collections, opts) {
    const store = { [CLE_G]: clone(grilles) };
    if (collections) store[CLE_C] = clone(collections);
    const ecrits = [];
    const notes = [];
    const confirmations = [];
    const db = {
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { ecrits.push(k); store[k] = v; },
        setSync: (k, v) => { ecrits.push(k); store[k] = v; },
        modifier: async (k, mutateur, defaut) => {
            const valeur = (k in store ? clone(store[k]) : defaut);
            const resultat = await mutateur(valeur);
            if (resultat === undefined) return undefined;
            ecrits.push(k);
            store[k] = resultat;
            return resultat;
        }
    };
    const document = fauxDocument();
    const globaux = {
        db, document,
        cle: (k) => 'a2026_' + k,
        echapperHtml: echapper,
        genererIdUnique: (p) => (p || 'ID_') + Math.random().toString(36).slice(2, 8),
        alert() {}, confirm: (m) => { confirmations.push(m); return !(opts && opts.refuser); },
        notifications: { succes: (m, d) => notes.push(['succes', m, d]), erreur: (m, d) => notes.push(['erreur', m, d]), info: (m) => notes.push(['info', m]), warning: (m, d) => notes.push(['warning', m, d]) }, // lot E1 : la VRAIE méthode (warning) ; « avertissement » n'existe pas
        BibliothequeUI: { obtenirAuteurActif: () => 'banc', forgerInspireDe: () => null,
                          filtrerParModeDemo: (l) => l, repertoires: { rendre() {} } },
        obtenirIdentiteCCUtilisateur: () => 'banc',
        grilleTemplateActuelle: null
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    // Lot E1 (D3) : un champ refusé est dit par le témoin commun — le vrai module, affichage journalisé.
    chargerScript('js/temoin-enregistrement.js', { document: globaux.document }, win);
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre: (raison) => notes.push(['nonEnregistre', raison]) };
    chargerScript('js/grilles.js', globaux, win);
    chargerScript('js/collections-projection.js', globaux, win);
    win.formulesAlgo = require(path.join(racine, 'js/evaluation-formules.js'));
    win.enoncesAlgo = E;
    win.projectionAlgo = P;
    win.codesAnnotation = require(path.join(racine, 'js/codes-annotation.js'));
    win.estRessourceSupprimee = () => false;
    win.IDS_GABARITS_HARDCODES = [];
    return { win, store, document, ecrits, notes, confirmations, liste: () => document.getElementById('listeCriteres') };
}

const ALGO = { id: 'CR', nom: 'Rigueur', type: 'algorithmique', ponderation: 20, modeleProjection: 'norme_externe',
               paramsProjection: { nomServiceAide: 'Passerelle +', motsReference: 900, erreursTolerees: 30 },
               paliersProjection: P.paliersMigration().map((p) => (p.cle === 'risque' ? { ...p, texte: 'Bilan : {projection} erreurs sur {mots} mots.' } : p)) };
const G1 = { id: 'G1', nom: 'Philo', dansBibliotheque: true, criteres: [ALGO] };
const NEUF = { id: 'CR2', nom: 'Langue', type: 'algorithmique', ponderation: 30, modeleProjection: 'aucune', paramsProjection: {} };
const G2 = { id: 'G2', nom: 'Neuve', dansBibliotheque: true, criteres: [NEUF] };
const EUF = { id: 'coll_euf', nom: 'EUF <b>2026</b>', dateCreation: '2026-09-05T13:00:00.000Z', modeleId: 'norme_externe',
              params: { motsReference: 900, erreursTolerees: 30, nomServiceAide: 'Passerelle +', lienServiceAide: '' },
              paliers: clone(ALGO.paliersProjection) };
const PHILO = { id: 'coll_philo', nom: 'Philo', dateCreation: '2026-09-05T13:01:00.000Z', modeleId: 'norme_externe',
                params: { motsReference: 600, erreursTolerees: 20, nomServiceAide: 'Le CAF', lienServiceAide: '' }, paliers: clone(P.paliersMigration()) };

const carteProjection = (html, id) => {
    const i = html.indexOf('data-pli="' + (id || 'CR') + ':projection"');
    if (i < 0) return '';
    const suivant = html.indexOf('class="carte accordeon gabarit-algo-carte', i + 10);
    return html.slice(i, suivant < 0 ? undefined : suivant);
};
function rendu(m, grille) {
    m.win.afficherCriteresGrille(clone(grille));
    const html = m.liste().innerHTML;
    return { html, projection: carteProjection(html, grille.criteres[0].id) };
}
const selectDe = (projection) => (projection.match(/<select class="controle-form" data-on-change="modifierModeleProjection(?:Grille|Temp)Handler"[\s\S]*?<\/select>/) || [''])[0];

/* ============================================================ A — LE MENU */

describe('collections · A — le menu de projection', () => {
    it('A.a sans collection : ni sous-titre, ni liste, ni ligne d\'aide — les modèles livrés seuls ; le bouton d\'enregistrement est là', () => {
        const m = monter([G1]);
        const { projection } = rendu(m, G1);
        const select = selectDe(projection);
        expect(select).toContain('<option value="norme_externe" selected>');
        expect(select).toContain('<option value="aucune">');
        expect(select).not.toContain('optgroup');
        expect(projection).not.toContain('collections-liste');
        expect(projection).not.toContain('collections-aide');
        expect(projection).toContain('data-action="ouvrirSaisieCollectionProjection" data-param="G1" data-param2="0"');
        expect(projection).toContain('Enregistrer ces paliers sous un nom…');
    });

    it('A.b avec collections : « Mes collections » APRÈS les modèles, une option par jeu, la liste avec corbeille, la ligne de la copie — noms échappés', () => {
        const m = monter([G1], [PHILO, EUF]);
        const { projection } = rendu(m, G1);
        const select = selectDe(projection);
        expect(select).toContain('<optgroup label="Mes collections">');
        expect(select.indexOf('<optgroup')).toBeGreaterThan(select.indexOf('<option value="aucune">'));
        expect(select).toContain('<option value="collection:coll_euf">EUF &lt;b&gt;2026&lt;/b&gt;</option>');
        expect(select).toContain('<option value="collection:coll_philo">Philo</option>');
        expect(select).not.toContain('<b>2026</b>');
        // Par nom : EUF avant Philo.
        expect(select.indexOf('coll_euf')).toBeLessThan(select.indexOf('coll_philo'));
        // La liste, avec la corbeille et son triplet ; puis la ligne d'aide. ↻ 21 oct. 2026 (constat 11, Grégoire,
        // 8 h 31) : sous son titre « Mes collections », en fin de carte, après « Enregistrer ces paliers sous un nom… »
        // — plus sous le menu, où « Labo Anatomie » se lisait comme une propriété du critère.
        const liste = projection.slice(projection.indexOf('collections-liste'), projection.indexOf('collections-aide'));
        expect(projection.indexOf('collections-liste')).toBeGreaterThan(projection.indexOf('</select>'));
        expect(projection).toContain('<h4 class="collections-titre">Mes collections</h4>');
        expect(projection.indexOf('collections-titre')).toBeGreaterThan(projection.indexOf('data-action="ouvrirSaisieCollectionProjection"'));
        expect(projection.indexOf('collections-liste')).toBeGreaterThan(projection.indexOf('collections-titre'));
        expect(projection.indexOf('collections-titre')).toBeGreaterThan(projection.indexOf('+ Ajouter un palier'));
        expect((liste.match(/class="collection-ligne"/g) || []).length).toBe(2);
        expect(liste).toContain('<span class="collection-nom">EUF &lt;b&gt;2026&lt;/b&gt;</span>');
        expect(liste).toMatch(/data-action="supprimerCollectionProjection" data-param="coll_euf" data-param2="G1" data-param3="0"/);
        expect(liste).toMatch(/title="Supprimer la collection « EUF &lt;b&gt;2026&lt;\/b&gt; »"/);
        expect(liste).toContain('icons8-trash.svg');
        expect(projection).toContain('collections-aide">Choisir une collection copie ses paliers et ses réglages dans ce critère. Corriger ou supprimer la collection ensuite ne change pas cette grille, ni ce qu\'un élève a déjà lu.</small>');
        // Sous « Aucune projection » aussi (le menu est le même), et en création (cible `temp`).
        const { projection: sansProj } = rendu(m, G2);
        expect(selectDe(sansProj)).toContain('<optgroup label="Mes collections">');
        expect(sansProj).toMatch(/data-action="supprimerCollectionProjection" data-param="coll_euf" data-param2="G2" data-param3="0"/);
        m.win.tempCriteres = [{ ...ALGO, id: 'T' }];
        m.win.afficherCriteresTemp();
        const temp = carteProjection(m.liste().innerHTML, 'T');
        expect(selectDe(temp)).toContain('<option value="collection:coll_euf">');
        expect(temp).toMatch(/data-action="supprimerCollectionProjection" data-param="coll_euf" data-param2="temp" data-param3="0"/);
    });
});

/* ============================================================ B — LE CHOIX */

describe('collections · B — choisir une collection COPIE ses valeurs dans le critère', () => {
    it('B.a grille enregistrée : le handler reconnaît `collection:<id>`, la grille reçoit modèle, paramètres et paliers — copiés ; le menu montre ensuite le modèle', async () => {
        const m = monter([G2], [EUF]);
        rendu(m, G2);
        await m.win.modifierModeleProjectionGrilleHandler({ value: 'collection:coll_euf', dataset: { grilleId: 'G2', critereIndex: '0' } });
        const c = m.store[CLE_G][0].criteres[0];
        expect(c.modeleProjection).toBe('norme_externe');
        // #790 (8 sept. 2026) — LA RÉTRO-COMPAT SE LIT ICI, et c'est pour ça que l'oracle
        // n'est plus `EUF.params` tel quel : `EUF` est une collection enregistrée AVANT
        // que `libelleSignalement` existe. Elle s'applique quand même, et le paramètre
        // neuf arrive à son défaut (vide = aucun signalement levé). Une collection
        // partagée par un collègue en juin se pose donc toujours, sans rien lever.
        expect(c.paramsProjection).toEqual({ ...EUF.params, libelleSignalement: '' });
        // L'oracle : ce que le registre écrit pour la même entrée (les paliers sont normalisés à l'écriture).
        expect(c.paliersProjection).toEqual(P.appliquerAuCritere({}, 'norme_externe', EUF.params, EUF.paliers).paliersProjection);
        expect(c.paliersProjection.length).toBe(6);
        expect(c.paliersProjection.find((p) => p.cle === 'risque').texte).toBe('Bilan : {projection} erreurs sur {mots} mots.');
        expect(m.ecrits).toEqual([CLE_G]);
        // La copie : muter la collection en stock ne touche pas la grille.
        m.store[CLE_C][0].paliers[4].texte = 'Changé.';
        m.store[CLE_C][0].params.nomServiceAide = 'Autre';
        expect(m.store[CLE_G][0].criteres[0].paliersProjection[4].texte).toBe('Bilan : {projection} erreurs sur {mots} mots.');
        expect(m.store[CLE_G][0].criteres[0].paramsProjection.nomServiceAide).toBe('Passerelle +');
        // Le rendu suit : le modèle copié est sélectionné, six paliers, le service réglé.
        const projection = carteProjection(m.liste().innerHTML, 'CR2');
        expect(selectDe(projection)).toContain('<option value="norme_externe" selected>');
        expect(selectDe(projection)).not.toMatch(/collection:coll_euf"[^>]*selected/);
        expect((projection.match(/class="sous-critere-item palier-projection"/g) || []).length).toBe(6);
        expect(projection).toContain('value="Passerelle +"');
        expect(m.notes.filter((n) => n[0] === 'warning')).toEqual([]);
    });

    it('B.b un id disparu : rien n\'est écrit, le critère ne bouge pas, et on le dit', async () => {
        const m = monter([G2], [EUF]);
        rendu(m, G2);
        const avant = JSON.stringify(m.store[CLE_G]);
        await m.win.modifierModeleProjectionGrilleHandler({ value: 'collection:coll_disparue', dataset: { grilleId: 'G2', critereIndex: '0' } });
        expect(JSON.stringify(m.store[CLE_G])).toBe(avant);
        expect(m.ecrits).toEqual([]);
        expect(m.notes.some((n) => n[0] === 'warning' && /n'existe plus/.test(n[1]))).toBe(true);
    });

    it('B.c en création : le handler temp copie dans `tempCriteres` ; un modèle livré passe toujours par le chemin d\'avant', () => {
        const m = monter([], [EUF]);
        m.win.tempCriteres = [{ ...NEUF, id: 'T' }];
        m.win.afficherCriteresTemp();
        m.win.modifierModeleProjectionTempHandler({ value: 'collection:coll_euf', dataset: { critereIndex: '0' } });
        const t = m.win.tempCriteres[0];
        expect(t.modeleProjection).toBe('norme_externe');
        expect(t.paramsProjection.nomServiceAide).toBe('Passerelle +');
        expect(t.paliersProjection.length).toBe(6);
        expect(t.paliersProjection).not.toBe(m.store[CLE_C][0].paliers);
        expect(m.ecrits).toEqual([]);
        // Puis « Aucune projection » au menu : les paliers copiés partent, comme avant ce lot.
        m.win.modifierModeleProjectionTempHandler({ value: 'aucune', dataset: { critereIndex: '0' } });
        expect(m.win.tempCriteres[0].modeleProjection).toBe('aucune');
        expect(m.win.tempCriteres[0].paliersProjection).toBeUndefined();
    });
});

/* ============================================================ C — LE GESTE */

describe('collections · C — enregistrer sous un nom, inline, avec un état en mémoire', () => {
    it('C.a le bouton n\'est rendu que sous un modèle qui projette ; ouvrir rend la section, dont l\'état survit au redessin ; annuler la ferme ; rien dans la grille', async () => {
        const m = monter([G1, G2]);
        expect(rendu(m, G2).projection).not.toContain('ouvrirSaisieCollectionProjection');
        expect(rendu(m, G1).projection).toContain('ouvrirSaisieCollectionProjection');
        const avant = JSON.stringify(m.store[CLE_G]);
        await m.win.ouvrirSaisieCollectionProjection('G1', 0);
        let projection = carteProjection(m.liste().innerHTML, 'CR');
        expect(projection).toContain('class="collection-saisie"');
        expect(projection).toMatch(/<input type="text" id="collection-nom-CR"[^>]*value=""[^>]*data-collection-nom="CR"/);
        expect(projection).toContain('data-action="enregistrerCollectionProjection" data-param="G1" data-param2="0"');
        expect(projection).toContain('data-action="annulerSaisieCollectionProjection" data-param="G1" data-param2="0"');
        expect(projection).not.toContain('ouvrirSaisieCollectionProjection');
        // Un redessin (une frappe ailleurs) garde la section ouverte.
        projection = rendu(m, G1).projection;
        expect(projection).toContain('class="collection-saisie"');
        await m.win.annulerSaisieCollectionProjection('G1', 0);
        projection = carteProjection(m.liste().innerHTML, 'CR');
        expect(projection).not.toContain('collection-saisie');
        expect(projection).toContain('ouvrirSaisieCollectionProjection');
        expect(JSON.stringify(m.store[CLE_G])).toBe(avant);
        expect(m.ecrits).toEqual([]);
    });

    it('C.b enregistrer : la collection est écrite sous sa clé avec les réglages du critère, la section se ferme, le menu la liste, une notification le dit', async () => {
        const m = monter([G1]);
        rendu(m, G1);
        await m.win.ouvrirSaisieCollectionProjection('G1', 0);
        m.document._input = Object.assign(fauxElement(), { value: '  EUF  ' });
        await m.win.enregistrerCollectionProjection('G1', 0);
        expect(m.ecrits).toEqual([CLE_C]);
        expect(m.store[CLE_C].length).toBe(1);
        const c = m.store[CLE_C][0];
        expect(c.nom).toBe('EUF');
        expect(c.modeleId).toBe('norme_externe');
        expect(c.params.nomServiceAide).toBe('Passerelle +');
        expect(c.paliers).toEqual(P.normaliser(ALGO).paliers);
        const projection = carteProjection(m.liste().innerHTML, 'CR');
        expect(projection).not.toContain('collection-saisie');
        expect(projection).toContain('ouvrirSaisieCollectionProjection');
        expect(selectDe(projection)).toContain('<option value="collection:' + c.id + '">EUF</option>');
        expect(m.notes.some((n) => n[0] === 'succes' && n[1] === 'Collection « EUF » enregistrée.')).toBe(true);
        // La grille, elle, n'a pas bougé.
        expect(m.store[CLE_G][0].criteres[0]).toEqual(ALGO);
    });

    it('C.c un nom pris (trim, sans casse) : rien d\'écrit, le message rendu dans la section, le nom tapé conservé', async () => {
        const m = monter([G1], [EUF, PHILO]);
        rendu(m, G1);
        await m.win.ouvrirSaisieCollectionProjection('G1', 0);
        m.document._input = Object.assign(fauxElement(), { value: ' philo ' });
        await m.win.enregistrerCollectionProjection('G1', 0);
        expect(m.ecrits).toEqual([]);
        expect(m.store[CLE_C].length).toBe(2);
        const projection = carteProjection(m.liste().innerHTML, 'CR');
        expect(projection).toContain('class="collection-saisie"');
        expect(projection).toContain('collection-saisie-message">Une collection porte déjà ce nom.</small>');
        expect(projection).toMatch(/value=" philo "[^>]*data-collection-nom="CR"/);
    });

    it('C.d un nom vide : le champ se marque, rien d\'écrit, la section reste', async () => {
        const m = monter([G1]);
        rendu(m, G1);
        await m.win.ouvrirSaisieCollectionProjection('G1', 0);
        const input = Object.assign(fauxElement(), { value: '   ' });
        m.document._input = input;
        await m.win.enregistrerCollectionProjection('G1', 0);
        expect(input.classList.contains('champ-refuse')).toBe(true);
        expect(m.ecrits).toEqual([]);
        expect(CLE_C in m.store).toBe(false);
        expect(m.notes.some((n) => n[0] === 'nonEnregistre' && n[1] === 'donne un nom à la collection.')).toBe(true);   // lot E1
    });
});

/* ============================================================ D — LA SUPPRESSION */

describe('collections · D — supprimer une collection, après confirmation, ne touche aucune grille', () => {
    it('D.a la collection part du stock, le rendu suit ; la grille qui l\'avait copiée garde ses paliers ; un id inconnu ne demande rien', async () => {
        const m = monter([G2], [EUF]);
        rendu(m, G2);
        await m.win.modifierModeleProjectionGrilleHandler({ value: 'collection:coll_euf', dataset: { grilleId: 'G2', critereIndex: '0' } });
        const copie = JSON.stringify(m.store[CLE_G][0].criteres[0]);
        await m.win.supprimerCollectionProjection('coll_euf', 'G2', 0);
        expect(m.confirmations).toEqual(['Supprimer la collection « EUF <b>2026</b> » ? Les grilles qui l\'ont copiée ne changent pas.']);
        expect(m.store[CLE_C]).toEqual([]);
        expect(JSON.stringify(m.store[CLE_G][0].criteres[0])).toBe(copie);
        const projection = carteProjection(m.liste().innerHTML, 'CR2');
        expect(projection).not.toContain('optgroup');
        expect(projection).not.toContain('collections-liste');
        expect((projection.match(/class="sous-critere-item palier-projection"/g) || []).length).toBe(6);
        await m.win.supprimerCollectionProjection('coll_inconnue', 'G2', 0);
        expect(m.confirmations.length).toBe(1);
    });

    it('D.b un refus à la confirmation ne supprime rien, et n\'écrit rien', async () => {
        const m = monter([G1], [EUF], { refuser: true });
        rendu(m, G1);
        await m.win.supprimerCollectionProjection('coll_euf', 'G1', 0);
        expect(m.confirmations.length).toBe(1);
        expect(m.store[CLE_C].length).toBe(1);
        expect(m.ecrits).toEqual([]);
        expect(selectDe(carteProjection(m.liste().innerHTML, 'CR'))).toContain('collection:coll_euf');
    });
});

/* ============================================================ E — JETONS, CSS */

describe('collections · E — jetons et règles scopées', () => {
    it('E.a grilles.js et styles.css ont bougé ; les classes vivent sous #listeCriteres ; la corbeille garde ses 44 px', () => {
        const html = source('index.html');
        { const j = jetonAuMoins(html, 'js/grilles.js', '20260905c'); expect(j.ok, j.message).toBe(true); }
        { const j = jetonAuMoins(html, 'styles.css', '20260905c'); expect(j.ok, j.message).toBe(true); }
        const css = source('styles.css');
        for (const c of ['collections-liste', 'collection-ligne', 'collections-aide', 'collection-saisie', 'collection-saisie-rangee', 'collection-saisie-message', 'collection-bouton-enregistrer']) {
            expect(css, c).toContain('#listeCriteres .' + c + ' {');
        }
        expect(css).toMatch(/#listeCriteres \.btn-icone-nu,\s*#listeCriteres \.pipeline-btn-reorder \{[^}]*min-height: 44px/);
        const code = source('js/grilles.js');
        const lot = code.slice(code.indexOf('function rendreSaisieCollectionProjection'), code.indexOf('function _direCollectionDisparue'));
        expect(lot.length).toBeGreaterThan(1000);
        expect(lot).not.toMatch(/prompt\(|alert\(/);
        expect(lot).not.toMatch(/onclick=|onchange=/);
        expect((code.match(/_idCollectionChoisie\(/g) || []).length).toBe(3);   // la déclaration + les deux handlers
    });
});
