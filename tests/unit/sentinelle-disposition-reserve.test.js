import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');
const sourceCss = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

// LA RÉSERVE « NON PLANIFIÉ » DU PLANIFICATEUR — et les dates à côté du titre.
//
// Le 7 août 2026, deux dispositions au choix : la réserve sous la grille, ou en
// colonne à gauche. ▣ LE 8 OCT. 2026 (lot 2 du chantier de la carte, décision
// de Grégoire), la colonne est RETIRÉE : on ne pouvait pas y glisser une leçon
// qui arrivait à la hauteur de la réserve. Reste la verticale seule. La
// préférence `planifReserveDisposition` qu'elle écrivait n'est plus lue — et
// n'est pas effacée.
//
// ⚠ CE QUE CETTE SENTINELLE VERROUILLE EN PRIORITÉ : le dépôt « ici =
// désancrer » repose sur l'attribut `data-grille-semaine=""` ; un rendu qui le
// changerait casserait le dépôt en silence, sans qu'aucun test de rendu ne bouge.

let store;
let elements;
let prefs;
let datesEl;
let invitationEl;

function monterModule() {
    store = {};
    prefs = {};
    datesEl = { textContent: '' };
    invitationEl = { hidden: true };
    elements = {
        'planif-sommaire': { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] },
        'planif-dates-trimestre': datesEl,
        'planif-invitation-dates': invitationEl
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        querySelector: () => fauxElement(), querySelectorAll: () => [],
        closest: () => null, contains: () => false, offsetWidth: 140, offsetHeight: 50
    });
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => [], addEventListener: () => {},
        createElement: fauxElement, createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument,
        obtenirPreference: (k) => prefs[k],
        definirPreference: (k, v) => { prefs[k] = v; }
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x: 0, y: 0, parent, enfants, metadata, cloneSourceId: null });
}

function poserCadre() {
    store['a2026_calendrierComplet'] = {
        '2026-08-20': { statut: 'cours', numeroSemaine: 1 },
        '2026-08-27': { statut: 'cours', numeroSemaine: 2 }
    };
}

/** Une carte avec une leçon placée et une leçon en réserve. */
function poserCarteMixte(api) {
    poser(api, 'planif-l1', 'lecon', { titre: 'Placée', metadata: { semaine: 1 } });
    poser(api, 'planif-lx', 'lecon', { titre: 'En réserve', metadata: {} });
}

const rendu = () => elements['planif-sommaire'].innerHTML;

let api;
beforeEach(() => { api = monterModule(); poserCadre(); });

describe('Réserve · une seule disposition : sous la grille', () => {
    it('la réserve suit la grille et il n’y a pas d’enveloppe', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const html = rendu();

        expect(html).not.toContain('planif-cotecote');
        expect(html).not.toContain('planif-reserve-colonne');
        // La grille vient AVANT la réserve.
        expect(html.indexOf('planif-grille-rangee')).toBeLessThan(html.indexOf('planif-grille-nonplanifie'));
    });

    it('une préférence « gauche » enregistrée avant le 8 oct. ne change RIEN au rendu', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const sansPref = rendu();

        prefs.planifReserveDisposition = 'gauche';
        api.mettreAJourPlanificateur();
        expect(rendu()).toBe(sansPref);
        // Rien n'est effacé : la valeur reste là où l'usager l'avait laissée.
        expect(prefs.planifReserveDisposition).toBe('gauche');
    });

    it('plus aucune fonction de disposition n’est exposée', () => {
        expect(api.dispositionReserve).toBeUndefined();
        expect(api.basculerDispositionReserve).toBeUndefined();
        expect(api.LARGEUR_RESERVE_COLONNE).toBeUndefined();
        expect(sourceCarte).not.toMatch(/obtenirPreference\(['"]planifReserveDisposition/);
    });

    it('les div sont équilibrés — un div ouvert casserait tout ce qui suit', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        const html = rendu();
        expect((html.match(/<div/g) || []).length).toBe((html.match(/<\/div>/g) || []).length);
    });
});

describe('Dates du trimestre · à côté du titre, ou l’invitation', () => {
    it('avec « Début » et « Fin du trimestre » : les dates, l’invitation cachée', () => {
        store['a2026_cadreCalendrier'] = { dateDebut: '2026-08-25', finCours: '2026-12-08', finTrimestre: '2026-12-19' };
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        expect(datesEl.textContent).toBe(' · du 25 août au 19 décembre 2026');
        expect(invitationEl.hidden).toBe(true);
    });

    it('sans fin du trimestre : pas de dates, l’invitation paraît (finCours ne la remplace pas)', () => {
        store['a2026_cadreCalendrier'] = { dateDebut: '2026-08-25', finCours: '2026-12-08' };
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        expect(datesEl.textContent).toBe('');
        expect(invitationEl.hidden).toBe(false);
    });

    it('l’invitation paraît AUSSI sur une carte vide (avant le retour anticipé du rendu)', () => {
        api.mettreAJourPlanificateur();
        expect(invitationEl.hidden).toBe(false);
    });

    it('l’ancien avis « (Réglages) » a disparu du rendu', () => {
        delete store['a2026_calendrierComplet']; // le cas qui le déclenchait
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        expect(rendu()).not.toContain('Réglages');
        // Le gabarit de l'ancien avis, pas sa phrase : le commentaire qui raconte
        // le retrait la cite, et c'est très bien ainsi.
        expect(sourceCarte).not.toContain('<div class="planif-grille-avis">Semaines dérivées');
    });
});

// =======================================================================
// #929 — LA ZONE SE REND MÊME VIDE (tranché par Grégoire, 20 sept. 2026)
// =======================================================================
//
// RENVERSEMENT ASSUMÉ. Jusqu'au 20 sept., cette sentinelle affirmait l'inverse
// (« sans rien en réserve, aucune colonne vide n'est fabriquée ») — c'était une
// décision du 7 août, pas un oubli. Le terrain l'a défaite : tout planifié, le
// bouton de disposition pivotait sans rien avoir à déplacer (dix clics dans le
// journal de Grégoire), et la seule cible de désancrage avait disparu — plus
// aucune leçon ne pouvait quitter le calendrier par le glisser.
const PHRASE_ZONE_VIDE = 'Glisse ici une leçon pour la retirer du calendrier.';

describe('#929 · la zone « Non planifié » se rend même vide', () => {
    function poserToutPlanifie() {
        poser(api, 'planif-l1', 'lecon', { titre: 'Placée', metadata: { semaine: 1 } });
    }
    /** La zone seule, de son ouverture à la fin du rendu ou à la grille qui suit. */
    function zone(html) {
        const debut = html.indexOf('<div class="planif-grille-nonplanifie');
        if (debut < 0) return '';
        const grille = html.indexOf('planif-grille-rangee', debut);
        return grille < 0 ? html.slice(debut) : html.slice(debut, grille);
    }

    it('titre, phrase validée, APRÈS la grille', () => {
        poserToutPlanifie();
        api.mettreAJourPlanificateur();
        const html = rendu();

        expect(zone(html)).toContain('planif-grille-nonplanifie-titre">Non planifié<');
        expect(zone(html)).toContain(PHRASE_ZONE_VIDE);
        expect(html).not.toContain('planif-cotecote');
        expect(html.indexOf('planif-grille-rangee')).toBeLessThan(html.indexOf('planif-grille-nonplanifie'));
    });

    it('vide ou pleine, la cible de dépôt porte le MÊME balisage', () => {
        const ouverture = (html) => html.match(/<div class="planif-grille-nonplanifie[^>]*>/)[0];

        poserToutPlanifie();
        api.mettreAJourPlanificateur();
        const vide = ouverture(rendu());

        poser(api, 'planif-lx', 'lecon', { titre: 'En réserve', metadata: {} });
        api.mettreAJourPlanificateur();
        const pleine = ouverture(rendu());

        expect(vide).toBe(pleine);
        expect(vide).toContain('data-grille-semaine=""');
    });

    it('la phrase disparaît dès qu’un élément entre dans la zone', () => {
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();

        expect(rendu()).not.toContain(PHRASE_ZONE_VIDE);
        expect(rendu()).not.toContain('planif-grille-nonplanifie-vide');
    });

    it('les div restent équilibrés, zone vide', () => {
        poserToutPlanifie();
        api.mettreAJourPlanificateur();
        const html = rendu();
        expect((html.match(/<div/g) || []).length).toBe((html.match(/<\/div>/g) || []).length);
    });

    it('la phrase a une règle CSS — une classe jamais définie n’est pas un lot fini', () => {
        expect(sourceCss).toMatch(/\.planif-grille-nonplanifie-vide\s*\{[^}]*flex:\s*0 0 100%/);
    });
});

describe('Réserve · la cible du GLISSER', () => {
    it('la cible de dépôt « désancrer » porte data-grille-semaine=""', () => {
        // C'est LE point critique : le dépôt repose sur cet attribut. Un rendu
        // qui le changerait casserait le désancrage en silence.
        poserCarteMixte(api);
        api.mettreAJourPlanificateur();
        expect(rendu()).toContain('planif-grille-nonplanifie" data-grille-semaine=""');
        expect(rendu()).toContain('data-grille-semaine="1"');
        expect(rendu()).toContain('data-grille-semaine="2"');
    });
});

describe('Barre de palette · le titre absorbe la place libre', () => {
    it('`flex: 1` sur le titre', () => {
        const regle = /\.planif-palette-titre\s*\{[^}]*\}/.exec(sourceCss);
        expect(regle).toBeTruthy();
        expect(regle[0]).toMatch(/flex:\s*1/);
    });

    it('le bouton de disposition (◧) a disparu, CSS compris — et sa classe de style avec lui', () => {
        expect(sourceIndex).not.toContain('planif-btn-disposition-reserve');
        expect(sourceCss).not.toMatch(/^#planif-btn-disposition-reserve/m);
        // Il était le dernier porteur de `.planif-palette-toggle` (8 oct. 2026).
        expect(sourceIndex).not.toContain('planif-palette-toggle');
        expect(sourceCss).not.toMatch(/^\.planif-palette-toggle/m);
    });
});

// =======================================================================
// UNE CLASSE DE STYLE NE DÉSIGNE PAS UN BOUTON — correctif du 7 août
// =======================================================================
//
// Second constat terrain de Grégoire : « il n'y a plus de disposition verticale
// une fois qu'on a choisi l'horizontale ». Cause :
// `palette.querySelector('.planif-palette-toggle')` rend le PREMIER élément de
// cette classe. Depuis l'ajout du bouton de disposition, c'était LUI — donc le
// comportement « replier » s'y attachait, réécrivait son libellé en « + » / « − »
// (d'où le glyphe ◧ disparu des captures), et le vrai bouton de repli ne faisait
// plus rien. Le bouton de disposition devenait inatteignable : un aller sans
// retour.
//
// ▣ GÉNÉRAL — une classe qui sert à STYLER ne peut pas servir à DÉSIGNER. Dès
// qu'un deuxième élément la porte, tout `querySelector` sur elle devient un pari
// sur l'ordre du DOM.

// ▣ MISE À JOUR DU 7 AOÛT (soir) — le mécanisme de repli est RETIRÉ : afficher
// ou masquer une palette se commande depuis la barre d'outils. Les assertions
// qui portaient sur `.planif-palette-replier` sont donc supprimées plutôt que
// laissées vraies-pour-rien : une assertion dont le sujet a disparu est un
// faux-vert, pas une garde.
//
// CE QUI SURVIT, et qui est le vrai invariant : le code ne doit JAMAIS désigner
// un bouton par `.planif-palette-toggle`. La règle est intacte et reste
// mordante — c'est elle qui rattrapera le jour où un deuxième bouton rejoindra
// la barre et où quelqu'un tendra la main vers la classe de style.

describe('Sélecteurs · désigner et styler sont deux rôles distincts', () => {
    it('aucun comportement ne se branche sur la classe de STYLE', () => {
        expect(sourceCarte).not.toContain("querySelector('.planif-palette-toggle')");
        expect(sourceCarte).not.toContain('querySelector(".planif-palette-toggle")');
    });

    it('les boutons qui portent un comportement sont désignés par leur id', () => {
        // Chaque bouton de la barre de palette et de la barre d'outils est
        // atteint par getElementById — une identité, pas une apparence.
        for (const id of ['planif-btn-palette-noeuds',
                          'planif-btn-palette-planificateur']) {
            expect(sourceIndex).toContain(`id="${id}"`);
        }
    });

    it('le mécanisme de repli a bien disparu du DOM, du CSS et du comportement', () => {
        // Le HTML et le CSS ne doivent plus porter la moindre trace : là-bas,
        // toute occurrence est vivante.
        expect(sourceIndex).not.toContain('planif-palette-replier');
        expect(sourceCss).not.toContain('planif-palette-replie');
        // Dans le JS, on vise l'USAGE et non la chaîne : le commentaire qui
        // raconte le retrait mentionne la classe, et c'est très bien ainsi —
        // une sentinelle qui interdirait d'en parler effacerait la mémoire du
        // piège en même temps que le code.
        expect(sourceCarte).not.toMatch(/querySelector\(['"]\.planif-palette-replier/);
        expect(sourceCarte).not.toMatch(/classList\.\w+\(['"]planif-palette-replie/);
    });
});
