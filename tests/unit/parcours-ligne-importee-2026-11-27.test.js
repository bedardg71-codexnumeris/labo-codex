// =======================================================================
// « RECEVOIR LES PRODUCTIONS », ÉTAPE « LA LISTE », ET « AUTOMATISER TES COMMENTAIRES », ÉTAPE « POSER TES CODES » :
// LA LIGNE DÉSIGNÉE
// =======================================================================
// Vu le 22 nov. 2026 : à l'étape « La liste » de « Recevoir » (« Nous faisons »), le halo et la flèche désignaient la
// première ligne qui offre « Annoter », déjà « Évalué », alors que la consigne parle de « la ligne d'une production
// importée ». Le parcours vise maintenant une ligne au statut « Importé » quand il y en a une ; sinon, comme avant, la
// première qui offre « Annoter ». « Poser tes codes » (« Automatiser tes commentaires », « Nous faisons ») désignait de
// la même façon : aligné.
// La Liste est rendue ici telle que `js/liste-evaluations.js` l'écrit (la pastille du statut, le menu « Actions… ») ;
// la dernière section confronte ce rendu au fichier, pour qu'un changement de la Liste fasse rougir ce banc.
// Break-test (27 nov. 2026) : voir le rapport du lot (plans de travail/RAPPORT-2026-11-27-parcours.md).

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

const PROD = 'PROD_1';
const LIBELLES = { importe: 'Importé', annote: 'Annoté', evalue: 'Évalué', 'non-recu': 'Non reçu' };

/** Une ligne de la Liste, comme `genererLigneEvaluation` l'écrit : sa pastille de statut et, s'il a un fichier, son menu. */
function ligne(da, statut, { fichier, production = PROD } = {}) {
    const menu = fichier
        ? `<select class="eval-actions-select" data-on-change="executerActionEval"><option value="">Actions...</option>`
          + `<option value="annoter|${fichier}|${production}">Annoter</option><option value="renommer|${fichier}">Renommer</option></select>`
        : '<span class="texte-muted">-</span>';
    return `<tr data-evaluation-id="" data-da="${da}" data-production-id="${production}">`
        + `<td class="td-left">${da}</td><td class="td-center"><span class="travaux-badge-pill ${statut}" title="">${LIBELLES[statut]}</span></td>`
        + `<td class="td-center">${menu}</td></tr>`;
}

function page(lignes) {
    const dom = new JSDOM(`<!doctype html><body><div id="evaluations-liste"><table><tbody>${lignes.join('')}</tbody></table></div></body>`, { url: 'http://localhost/' });
    const doc = dom.window.document;
    doc.body.classList.toggle = () => {};
    return doc;
}

function fenetreDe(prefs) {
    return {
        innerWidth: 1180,
        Assistance: { enregistrer() {}, etatDe: () => ({ etat: 'en-cours' }), etatModeleDe: () => ({ etat: 'a-faire' }), definirEtat() {}, definirEtatModele() {} },
        ParcoursMoteur: { visible: (e) => !!e, etapeCourante: () => null, actif: () => false, joue: () => false },
        addEventListener() {},
        prefs
    };
}

function charger(fichier, doc, prefs, plus = {}) {
    const fenetre = fenetreDe(prefs);
    const globaux = Object.assign({
        obtenirPreference: (k) => (prefs[k] ? JSON.parse(JSON.stringify(prefs[k])) : null),
        definirPreference: (k, v) => { prefs[k] = v; },
        estEnModeDemo: () => false,
        obtenirDonneesSelonMode: () => []
    }, plus);
    const noms = Object.keys(globaux);
    new Function('window', 'document', ...noms, lire(fichier))(fenetre, doc, ...noms.map((n) => globaux[n]));
    return fenetre;
}

/** « La liste », de « Recevoir », sur cette Liste. */
function laListe(lignes) {
    const doc = page(lignes);
    const f = charger('js/parcours-recevoir.js', doc, { parcoursRecevoir: { voie: 'fichiers', fichiersAvant: [], verrousAvant: [] } });
    const e = f.ParcoursRecevoir.voies().fichiers[2];
    expect(e.titre).toBe('La liste');
    return { e, doc };
}

/** « Poser tes codes », d'« Automatiser tes commentaires », sur cette Liste (la production du parcours porte sa grille). */
function poserTesCodes(lignes) {
    const doc = page(lignes);
    const productions = [{ id: PROD, grilleId: 'G1' }, { id: 'PROD_AILLEURS', grilleId: 'G2' }];
    const f = charger('js/parcours-commentaires.js', doc, { parcoursCommentaires: { grilleId: 'G1' } }, {
        db: { getSync: (k, d) => d }, cle: (n) => 'a2026_' + n,
        obtenirDonneesSelonMode: (n) => (n === 'productions' ? productions : [])
    });
    const e = f.ParcoursCommentaires.etapes.poser;
    expect(e.titre).toBe('Poser tes codes');
    return { e, doc };
}

/** Ce que l'étape désigne : le DA de la ligne du halo (son menu « Actions… »), et celui de la zone que la bulle évite. */
function designe(e) {
    const menu = e.contour(), zones = e.zones();
    return {
        halo: menu && menu.matches('select.eval-actions-select') ? menu.closest('tr').dataset.da : null,
        zone: zones.length === 1 && zones[0] && zones[0].matches('tr') ? zones[0].dataset.da : null
    };
}

describe('« Recevoir », « La liste » : la ligne d’une production importée', () => {
    it('la première ligne est « Évalué » : le halo et la flèche vont à la ligne « Importé » (le cas vu le 22 nov.)', () => {
        const { e } = laListe([ligne('1000001', 'evalue', { fichier: 'F_1' }), ligne('1000002', 'non-recu'), ligne('1000003', 'importe', { fichier: 'F_3' })]);
        expect(designe(e)).toEqual({ halo: '1000003', zone: '1000003' });
    });

    it('aucune ligne « Importé » : comme avant, la première qui offre « Annoter »', () => {
        const { e } = laListe([ligne('1000001', 'evalue', { fichier: 'F_1' }), ligne('1000002', 'annote', { fichier: 'F_2' })]);
        expect(designe(e)).toEqual({ halo: '1000001', zone: '1000001' });
    });

    it('« Annoté » n’est pas « Importé » : la ligne « Importé » d’après est préférée', () => {
        const { e } = laListe([ligne('1000001', 'annote', { fichier: 'F_1' }), ligne('1000002', 'importe', { fichier: 'F_2' })]);
        expect(designe(e)).toEqual({ halo: '1000002', zone: '1000002' });
    });
});

describe('« Automatiser tes commentaires », « Poser tes codes » : aligné', () => {
    it('sur les lignes de la production du parcours, la ligne « Importé » est préférée à la première, déjà « Évalué »', () => {
        const { e } = poserTesCodes([
            ligne('1000009', 'importe', { fichier: 'F_9', production: 'PROD_AILLEURS' }),
            ligne('1000001', 'evalue', { fichier: 'F_1' }), ligne('1000003', 'importe', { fichier: 'F_3' })
        ]);
        expect(designe(e)).toEqual({ halo: '1000003', zone: '1000003' });
    });

    it('aucune ligne « Importé » de la production du parcours : la première qui offre « Annoter », comme avant', () => {
        const { e } = poserTesCodes([
            ligne('1000009', 'importe', { fichier: 'F_9', production: 'PROD_AILLEURS' }),
            ligne('1000001', 'evalue', { fichier: 'F_1' }), ligne('1000002', 'annote', { fichier: 'F_2' })
        ]);
        expect(designe(e)).toEqual({ halo: '1000001', zone: '1000001' });
    });
});

describe('la Liste rendue ici est celle de js/liste-evaluations.js', () => {
    const LISTE = lire('js/liste-evaluations.js');
    it('la pastille du statut porte l’identifiant du statut en classe, et « importe » se dit « Importé »', () => {
        expect(LISTE).toContain('<span class="travaux-badge-pill ${echapperHtml(statutW)}"');
        expect(LISTE).toContain("'importe': 'Importé'");
    });
    it('le menu « Actions… » offre « Annoter » par une option `annoter|fichier|production`', () => {
        expect(LISTE).toContain('<option value="annoter|${echapperHtml(fichierId)}|${echapperHtml(prodId)}">Annoter</option>');
        expect(LISTE).toContain('<select class="eval-actions-select" data-on-change="executerActionEval">');
    });
});
