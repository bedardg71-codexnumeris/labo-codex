import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// LOT 2 du planificateur en grille (plan du 6 août 2026).
//
// D2 : une rangée par semaine, numérotée à gauche. D5 : les rangées DÉRIVENT
// du calendrier généré par le Cadre du trimestre (parcours chronologique de
// `calendrierComplet`) — la grille ne redemande jamais le nombre de semaines.
// Q1/Q2 : tout ce qui n'a pas d'ancrage vit dans la zone « Non planifié ».
//
// Zéro-dette du même lot : la « Vue calendrier » (rendu de la carte recyclé
// par genererSeancesHTML puis ROGNÉ en post-traitement DOM par organisateur)
// est RETIRÉE — le plan la qualifiait d'irrécupérable pour un planificateur.
// Cette sentinelle verrouille aussi son absence.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');
const sourceIndex = readFileSync(path.join(racineProjet, 'index.html'), 'utf8');

// --- Sandbox avec conteneur mesurable ----------------------------------
let store;
let elements;

function monterModule() {
    store = {};
    elements = {
        'planif-sommaire': {
            innerHTML: '',
            querySelector: () => null,
            querySelectorAll: () => []
        }
    };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : d),
        set: async (k, v) => { store[k] = v; }
    };
    // Élément factice assez riche pour survivre à reconstruireDOM (annuler()
    // repasse par lui : listeners, requêtes, dataset).
    const fauxElement = () => ({
        style: {}, dataset: {}, innerHTML: '', textContent: '',
        classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, removeEventListener() {},
        // attacherEvenements enchaîne querySelector(...).addEventListener :
        // rendre un stub, jamais null.
        querySelector: () => fauxElement(),
        querySelectorAll: () => [],
        closest: () => null, contains: () => false,
        offsetWidth: 140, offsetHeight: 50
    });
    const fauxDocument = {
        getElementById: (id) => elements[id] || null,
        querySelectorAll: () => [],
        addEventListener: () => {},
        createElement: fauxElement,
        createElementNS: fauxElement,
        body: { appendChild() {}, removeChild() {} }
    };
    const win = chargerScript('js/planification-carte.js', {
        db,
        cle: (k) => `a2026_${k}`,
        echapperHtml: (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        requestAnimationFrame: (fn) => { fn(); return 0; },
        document: fauxDocument
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, x = 0, y = 0, parent = null, enfants = [], metadata = {} } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x, y, parent, enfants, metadata, cloneSourceId: null });
}

// Calendrier minimal : Sem. 1, Sem. 2, semaine de planification, Sem. 3,
// examens. Les clés sont VOLONTAIREMENT insérées dans le désordre : l'ordre
// des rangées doit venir d'un TRI chronologique des dates, jamais de l'ordre
// d'insertion de l'objet (piège réel : un calendrier régénéré partiellement
// n'a aucune garantie d'ordre).
function poserCalendrier() {
    store['a2026_calendrierComplet'] = {
        '2026-09-08': { statut: 'cours', numeroSemaine: 3 },
        '2026-08-27': { statut: 'cours', numeroSemaine: 2 },
        '2026-09-15': { statut: 'semaine-examens' },
        '2026-08-20': { statut: 'cours', numeroSemaine: 1 },
        '2026-09-02': { statut: 'semaine-planification' },
        '2026-09-01': { statut: 'semaine-planification' }
    };
}

describe('lot 2 · rangées dérivées du calendrier (D5)', () => {
    let api;
    beforeEach(() => { api = monterModule(); });

    it('les rangées suivent l’ordre CHRONOLOGIQUE réel, semaines spéciales incluses', () => {
        poserCalendrier();
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        // Les 3 semaines numérotées + 2 rangées spéciales, dans l'ordre.
        const nums = [...html.matchAll(/planif-grille-num">([^<]+)</g)].map((m) => m[1]);
        expect(nums).toEqual(['1', '2', '—', '3', '—']);
        expect(html.indexOf('Semaine de planification')).toBeGreaterThan(-1);
        expect(html.indexOf("Semaine d'examens")).toBeGreaterThan(html.indexOf('Semaine de planification'));
        // Aucun avis de repli : la source est le cadre.
        expect(html).not.toContain('planif-grille-avis');
    });

    it('sans calendrier, repli sur les semaines saisies — sans l’ancien avis « (Réglages) »', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', metadata: { semaine: 4 } });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        const nums = [...html.matchAll(/planif-grille-num">([^<]+)</g)].map((m) => m[1]);
        expect(nums).toEqual(['1', '2', '3', '4']);
        // L'avis qui renvoyait vers « Réglages » est remplacé (lot 2 de la carte,
        // 8 oct. 2026) par l'invitation à entrer les dates, hors du rendu de la
        // grille : `planif-planificateur-dates.spec.js` et la sentinelle de la réserve.
        expect(html).not.toContain('planif-grille-avis');
        expect(html).not.toContain('Réglages');
    });
});

describe('lot 2 · contenu des rangées et zone « Non planifié » (Q1/Q2)', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCalendrier(); });

    it('une séquence apparaît sur la rangée de son DÉBUT, une leçon sur SA semaine', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'Diagnostic', parent: 'planif-s1', metadata: { semaine: 3 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1', 'planif-l2'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        const rangees = html.split('planif-grille-rangee');
        const r1 = rangees.find((r) => r.includes('num">1<'));
        const r3 = rangees.find((r) => r.includes('num">3<'));
        expect(r1).toContain('Ouverture');       // séquence à son début
        expect(r1).toContain('Accueil');          // leçon de la semaine 1
        expect(r1).not.toContain('Diagnostic');
        expect(r3).toContain('Diagnostic');       // leçon de la semaine 3
        expect(r3).not.toContain('data-param="planif-s1"'); // la séquence n'est pas dupliquée
        // Étendue affichée sur la séquence (elle s'étale 1–3).
        expect(html).toContain('Sem. 1–3');
    });

    it('séquence vide et leçon sans semaine tombent dans « Non planifié »', () => {
        poser(api, 'planif-s9', 'sequence', { titre: 'Sem. 9 -', enfants: [] });
        poser(api, 'planif-lx', 'lecon', { titre: 'Errante', metadata: {} });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        const zone = html.slice(html.indexOf('planif-grille-nonplanifie'));
        expect(zone).toContain('Sem. 9 -');
        expect(zone).toContain('Errante');
    });

    it('les gestes de navigation de la palette sont conservés', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        // Depuis le 7 août, ces deux gestes CADRENT la carte au lieu de la
        // filtrer : `ouvrirSequence` (qui masquait tout le reste) est remplacé
        // par `cadrerSurSequence`.
        expect(html).toContain('data-action="planificationCarte.cadrerSurSequence"');
        expect(html).toContain('data-action="planificationCarte.naviguerSommaireLecon"');
        expect(html).not.toContain('planificationCarte.ouvrirSequence');
    });

    it('le déroulé d’une leçon se déplie (niveau de détail réglable)', () => {
        poser(api, 'planif-a1', 'activite', { titre: 'Atelier', parent: 'planif-l1', metadata: { duree: 50 } });
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', enfants: ['planif-a1'], metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });

        api.mettreAJourPlanificateur();
        let html = elements['planif-sommaire'].innerHTML;
        expect(html).toContain('planificationCarte.basculerDetailLecon');
        expect(html).not.toContain('Atelier');

        api.basculerDetailLecon('planif-l1');
        html = elements['planif-sommaire'].innerHTML;
        expect(html).toContain('Atelier');
        expect(html).toContain('50 min');

        api.basculerDetailLecon('planif-l1');
        expect(elements['planif-sommaire'].innerHTML).not.toContain('Atelier');
    });

    it('voie A : une sous-séquence garde son chemin et n’apparaît qu’une fois', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-sA', metadata: { semaine: 2 } });
        poser(api, 'planif-sA', 'sequence', { titre: 'Ouverture', parent: 'planif-th', enfants: ['planif-l1'] });
        poser(api, 'planif-th', 'sequence', { titre: 'Thème 1', enfants: ['planif-sA'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(html).toContain('Thème 1 › Ouverture');
        expect((html.match(/data-param="planif-sA"/g) || [])).toHaveLength(1);
    });
});

describe('lot 3 · déplacement dans la grille', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCalendrier(); });

    function poserSequenceDispersee() {
        poser(api, 'planif-l1', 'lecon', { titre: 'A', parent: 'planif-s1', metadata: { semaine: 2 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'B', parent: 'planif-s1', metadata: { semaine: 3 } });
        poser(api, 'planif-l3', 'lecon', { titre: 'C', parent: 'planif-s1', metadata: {} }); // non planifiée
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1', 'planif-l2', 'planif-l3'] });
    }

    it('déplacer une séquence CONSERVE les écarts relatifs de ses leçons', () => {
        poserSequenceDispersee();
        // Étendue 2–3, déposée sur la rangée 1 : delta -1.
        expect(api.deplacerSequenceVersSemaine('planif-s1', 1, 3)).toBe(true);
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l1'))).toBe(1);
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l2'))).toBe(2);
        // La leçon non planifiée n'est PAS inventée.
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l3'))).toBeNull();
    });

    it('bornes : le delta se CALE — jamais de semaine 0, jamais au-delà du cadre', () => {
        poserSequenceDispersee();
        // Cible 1 déjà appliquée ci-dessus ; ici étendue 2–3 avec max 3 :
        // cible 3 pousserait B en semaine 4 → calé pour que B finisse à 3.
        expect(api.deplacerSequenceVersSemaine('planif-s1', 3, 3)).toBe(false); // delta calé à 0 : 2–3 est déjà collé au plafond
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l2'))).toBe(3);
    });

    it('déposer sur « Non planifié » désancre le bloc entier', () => {
        poserSequenceDispersee();
        expect(api.deplacerSequenceVersSemaine('planif-s1', null, 3)).toBe(true);
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l1'))).toBeNull();
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l2'))).toBeNull();
        expect(api.etendueTemporelleParId('planif-s1')).toBeNull();
    });

    it('un bloc entièrement NON planifié déposé sur une rangée s’y ancre en entier', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'A', parent: 'planif-s1', metadata: {} });
        poser(api, 'planif-l2', 'lecon', { titre: 'B', parent: 'planif-s1', metadata: {} });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1', 'planif-l2'] });

        expect(api.deplacerSequenceVersSemaine('planif-s1', 2, 3)).toBe(true);
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l1'))).toBe(2);
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l2'))).toBe(2);
    });

    it('voie A : les leçons des SOUS-séquences bougent avec le bloc', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'A', parent: 'planif-sA', metadata: { semaine: 1 } });
        poser(api, 'planif-sA', 'sequence', { titre: 'Ouverture', parent: 'planif-th', enfants: ['planif-l1'] });
        poser(api, 'planif-th', 'sequence', { titre: 'Thème', enfants: ['planif-sA'] });

        expect(api.deplacerSequenceVersSemaine('planif-th', 3, 3)).toBe(true);
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l1'))).toBe(3);
    });

    it('ANNULATION : chaque branche mutante enregistre l’undo AVANT d’écrire', () => {
        // (La restauration effective par ⌘Z traverse reconstruireDOM — elle
        // est prouvée par la sonde Chromium, pas par le bac à sable.)
        const corps = sourceCarte.slice(
            sourceCarte.indexOf('function deplacerSequenceVersSemaine'),
            sourceCarte.indexOf('function deposerDansGrille')
        );
        const branches = corps.split('enregistrerPourUndo()');
        // 3 branches mutantes (désancrage, bloc non planifié, décalage) = 4 morceaux.
        expect(branches).toHaveLength(4);
        branches.slice(1).forEach((apres) => {
            // L'écriture suit l'enregistrement, jamais l'inverse.
            expect(apres.indexOf('ecrire(')).toBeGreaterThan(-1);
        });
        const depot = sourceCarte.slice(
            sourceCarte.indexOf('function deposerDansGrille'),
            sourceCarte.indexOf('function initialiserDragGrille')
        );
        expect(depot).toMatch(/enregistrerPourUndo\(\);\s*\n\s*definirSemaineLecon/);
    });

    it('déposer une LEÇON écrit sa semaine (plafonnée au cadre) ; Q3 : le canevas ne bouge pas', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'A', x: 340, y: 300, metadata: { semaine: 1 } });
        const avant = { x: 340, y: 300 };

        expect(api.deposerDansGrille('lecon', 'planif-l1', 9)).toBe(true); // cadre : max 3
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l1'))).toBe(3);
        expect(api.deposerDansGrille('lecon', 'planif-l1', null)).toBe(true);
        expect(api.semaineDeLecon(api.etat.noeuds.get('planif-l1'))).toBeNull();
        // Q3 : l'ordre logique change, la position sur la carte ne change pas.
        expect(api.etat.noeuds.get('planif-l1').x).toBe(avant.x);
        expect(api.etat.noeuds.get('planif-l1').y).toBe(avant.y);
    });

    it('AUTO-DÉFILEMENT : une rangée hors de la fenêtre reste atteignable', () => {
        // Bug terrain (Grégoire, 6 août soir) : « le planificateur est trop
        // petit sur la hauteur, je ne peux pas déplacer les éléments du bas
        // vers le haut ». Cause : .planif-nav-contenu plafonne la hauteur, et
        // rangeeSousPointeur ne voit QUE le visible — une rangée défilée hors
        // fenêtre était une cible de dépôt inatteignable.
        const drag = sourceCarte.slice(
            sourceCarte.indexOf('function initialiserDragGrille'),
            sourceCarte.indexOf('function mettreAJourPlanificateur')
        );
        // Zone de bord + vitesse progressive (geste précis près du bord).
        expect(drag).toMatch(/ZONE_BORD/);
        expect(drag).toMatch(/VITESSE_MAX/);
        expect(drag).toMatch(/zone\.scrollTop \+= _vitesseDefilement/);
        // Évalué à chaque déplacement du pointeur.
        expect(drag).toMatch(/evaluerDefilement\(e\.clientY\);/);
        // Boucle rAF autonome : défile même pointeur IMMOBILE (sinon il
        // faudrait remuer la souris pour avancer).
        expect(drag).toMatch(/function boucleDefilement\(\)[\s\S]*?requestAnimationFrame/);
        expect(drag).toMatch(/boucleDefilement\(\);\s*\n\s*\}\);/);
        // Et il s'arrête au relâchement (pas de rAF orphelin).
        expect(drag).toMatch(/arreterDefilement\(\);/);
        expect(drag).toMatch(/cancelAnimationFrame\(_rafDefilement\)/);
    });

    it('la hauteur de la palette n’est plus le goulot (plafond relevé)', () => {
        const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
        const regle = tranche(css, '.planif-nav-contenu {', '.planif-sommaire {');
        expect(regle).toMatch(/max-height: min\(720px, 70vh\)/);
        expect(regle).not.toMatch(/min\(420px, 55vh\)/);
    });

    it('le câblage du glisser existe : cibles sur les rangées, délégation unique', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'A', metadata: { semaine: 1 } });
        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;
        expect(html).toMatch(/data-grille-semaine="1"/);
        expect(html).toMatch(/data-grille-type="lecon" data-grille-id="planif-l1"/);
        expect(sourceCarte).toMatch(/function initialiserDragGrille\(\)/);
        expect(sourceCarte).toMatch(/initialiserDragGrille\(\);/);
        // Le simple clic reste la navigation : seuil de mouvement avant drag.
        expect(sourceCarte).toMatch(/< 5\) return;[\s\S]*?planif-grille-item-drag/);
    });
});

// Déblocage du 7 août (identifié le 6 au soir, §5.3 du document de méthode) :
// les éléments d'une même semaine se lisaient EMPILÉS. Ils passent côte à côte
// — rendu pur, aucun type, aucune migration. La contrainte tenue est que ce ne
// soit PAS la « deux colonnes imposée » écartée la veille : un élément seul
// garde sa pleine largeur, et une leçon dépliée aussi.
/**
 * Contenu du `.planif-grille-bloc` qui englobe `marqueur`, par comptage des
 * <div> ouverts/fermés. Lire l'imbrication RÉELLE est le seul moyen de
 * distinguer « le déroulé est dans le bloc » de « il est juste après » — deux
 * rendus identiques en ordre de caractères, opposés à l'écran.
 */
function contenuBlocContenant(html, marqueur) {
    const iMarqueur = html.indexOf(marqueur);
    if (iMarqueur === -1) throw new Error('marqueur absent du rendu : ' + marqueur);
    const iBloc = html.lastIndexOf('<div class="planif-grille-bloc', iMarqueur);
    if (iBloc === -1) throw new Error('aucune enveloppe de bloc avant le marqueur');

    let profondeur = 0;
    const jeton = /<div\b|<\/div>/g;
    jeton.lastIndex = iBloc;
    let m;
    while ((m = jeton.exec(html)) !== null) {
        profondeur += m[0] === '</div>' ? -1 : 1;
        if (profondeur === 0) return html.slice(iBloc, m.index + m[0].length);
    }
    throw new Error('enveloppe de bloc non refermée');
}

describe('7 août · côte à côte dans la rangée', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCalendrier(); });

    it('chaque élément d’une rangée est enveloppé dans un bloc (flux latéral)', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'Annotation', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1', 'planif-l2'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;
        const r1 = html.split('planif-grille-rangee').find((r) => r.includes('num">1<'));

        // Séquence + 2 leçons de la semaine 1 = 3 blocs dans la même rangée.
        expect((r1.match(/class="planif-grille-bloc/g) || [])).toHaveLength(3);
        expect(r1).toContain('Accueil');
        expect(r1).toContain('Annotation');
    });

    it('une leçon DÉPLIÉE reprend la pleine largeur (son déroulé se lit en hauteur)', () => {
        poser(api, 'planif-a1', 'activite', { titre: 'Atelier', parent: 'planif-l1', metadata: { duree: 50 } });
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', enfants: ['planif-a1'], metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });

        api.mettreAJourPlanificateur();
        expect(elements['planif-sommaire'].innerHTML).not.toContain('planif-grille-bloc--large');

        api.basculerDetailLecon('planif-l1');
        expect(elements['planif-sommaire'].innerHTML).toContain('planif-grille-bloc--large');

        api.basculerDetailLecon('planif-l1');
        expect(elements['planif-sommaire'].innerHTML).not.toContain('planif-grille-bloc--large');
    });

    it('le déroulé reste SOLIDAIRE de sa leçon (DANS le même bloc, pas à côté)', () => {
        // Sans l'enveloppe, le déroulé deviendrait un frère de la leçon dans le
        // flux flex et s'afficherait à sa DROITE au lieu de dessous. Il faut
        // donc vérifier l'IMBRICATION réelle : un simple ordre de position ne
        // distingue pas « dans le bloc » de « juste après le bloc ».
        poser(api, 'planif-a1', 'activite', { titre: 'Atelier', parent: 'planif-l1', metadata: { duree: 50 } });
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', enfants: ['planif-a1'], metadata: { semaine: 1 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'Annotation', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1', 'planif-l2'] });

        api.basculerDetailLecon('planif-l1');
        const html = elements['planif-sommaire'].innerHTML;

        const bloc = contenuBlocContenant(html, 'data-grille-id="planif-l1"');
        expect(bloc).toContain('Accueil');
        expect(bloc).toContain('planif-grille-detail');
        expect(bloc).toContain('Atelier');
        // Et il ne débordera pas sur la leçon voisine.
        expect(bloc).not.toContain('Annotation');
    });

    it('la zone « Non planifié » profite du même flux, titre en pleine largeur', () => {
        poser(api, 'planif-lx', 'lecon', { titre: 'Errante A', metadata: {} });
        poser(api, 'planif-ly', 'lecon', { titre: 'Errante B', metadata: {} });

        api.mettreAJourPlanificateur();
        const zone = elements['planif-sommaire'].innerHTML;
        const nonPlanifie = zone.slice(zone.indexOf('planif-grille-nonplanifie'));

        expect((nonPlanifie.match(/class="planif-grille-bloc/g) || [])).toHaveLength(2);
        expect(nonPlanifie).toContain('planif-grille-nonplanifie-titre');
    });

    it('le glisser survit à l’enveloppe : la cible reste l’item, pas le bloc', () => {
        // Le glisser résout sa prise par closest('[data-grille-id]') : l'attribut
        // doit rester sur l'ITEM. S'il migrait sur l'enveloppe, le lot 3 casserait.
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Ouverture', enfants: ['planif-l1'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(html).not.toMatch(/class="planif-grille-bloc[^"]*"[^>]*data-grille-id/);
        expect(html).toMatch(/planif-som-lecon[^>]*data-grille-type="lecon"/);
        // La rangée reste la cible de dépôt (résolution géométrique par Y).
        expect(html).toContain('data-grille-semaine="1"');
    });
});

describe('lot 2 · zéro-dette — l’ancienne Vue calendrier est morte', () => {
    it('plus AUCUNE trace du rendu recyclé ni du post-traitement DOM', () => {
        expect(sourceCarte).not.toMatch(/genererSeancesHTML/);
        expect(sourceCarte).not.toMatch(/genererLeconBloc/);
        expect(sourceIndex).not.toMatch(/org-calendrier-contenu/);
        expect(sourceIndex).not.toMatch(/planif-org-calendrier/);
    });

    it('la palette s’appelle Planificateur et rend la grille', () => {
        expect(sourceIndex).toMatch(/⠿<\/span>Planificateur</);
        expect(sourceCarte).toMatch(/function mettreAJourPlanificateur\(\)/);
        expect(sourceCarte).not.toMatch(/function mettreAJourSommaire\(\)/);
    });

    // (« l'en-tête de dates réelles de l'Organisateur survit » : plus
    // maintenant — la page entière est partie, #424 Lot G.)
});
