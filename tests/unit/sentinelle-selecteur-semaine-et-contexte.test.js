import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche, suitDansLaFonction } from './_helpers/tranche.js';

// LA PAIRE DU 7 AOÛT — le sélecteur de semaine, et l'étiquette de contexte.
//
// (1) SÉLECTEUR DE SEMAINE. Le champ existait déjà, dans l'inspecteur, en
//     saisie libre — et personne ne le remplissait : l'enseignant compensait en
//     écrivant « Sem. 11 » dans ses titres. Motif de F1 et F3 une troisième
//     fois. Le sélecteur le remet là où le travail se fait.
//     ⮕ Ce qui est verrouillé ici : les DEUX gestes (sélecteur et glisser)
//       passent par la même porte `deposerDansGrille()`, donc ils ne peuvent
//       pas diverger ; et sur une SÉQUENCE rien de nouveau n'est stocké —
//       l'étendue reste dérivée, la contradiction séquence/leçons retirée le
//       6 août ne se rouvre pas.
//
// (2) ÉTIQUETTE DE CONTEXTE. Sur la semaine 11 de Grégoire, le nom de la
//     séquence apparaissait TROIS fois : une comme séquence, et une sur
//     chacune de ses deux leçons. L'étiquette sert à la leçon affichée LOIN de
//     sa séquence ; quand la séquence est dans la même rangée, c'est du bruit.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

let store;
let elements;

function monterModule() {
    store = {};
    elements = {
        'planif-sommaire': { innerHTML: '', querySelector: () => null, querySelectorAll: () => [] }
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
        document: fauxDocument
    });
    win.cle = (k) => `a2026_${k}`;
    win.planificationDonnees = { getIndex: () => ({ active: 'carte_1' }), sauvegarderCarte: () => {}, chargerCarte: () => null };
    return win.planificationCarte;
}

function poser(api, id, type, { titre = type, parent = null, enfants = [], metadata = {}, x = 0, y = 0 } = {}) {
    api.etat.noeuds.set(id, { id, type, titre, x, y, parent, enfants, metadata, cloneSourceId: null });
}

function poserCadre() {
    store['a2026_calendrierComplet'] = {
        '2026-08-20': { statut: 'cours', numeroSemaine: 1 },
        '2026-08-27': { statut: 'cours', numeroSemaine: 2 },
        '2026-09-03': { statut: 'cours', numeroSemaine: 3 }
    };
}

const zoneNonPlanifie = (html) => {
    const i = html.indexOf('planif-grille-nonplanifie');
    return i === -1 ? '' : html.slice(i);
};
const zoneGrille = (html) => {
    const i = html.indexOf('planif-grille-nonplanifie');
    return i === -1 ? html : html.slice(0, i);
};
/** La rangée de la semaine `num`, isolée. */
function rangee(html, num) {
    const parts = zoneGrille(html).split('planif-grille-rangee');
    return parts.find((p) => p.includes('num">' + num + '<')) || '';
}

// =======================================================================
// (2) L'ÉTIQUETTE DE CONTEXTE
// =======================================================================
describe('Étiquette de contexte · elle ne se répète plus dans sa propre rangée', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCadre(); });

    it('une leçon affichée AVEC sa séquence n’en répète pas le nom', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Introduction', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'Étude', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Kanatuut', enfants: ['planif-l1', 'planif-l2'] });

        api.mettreAJourPlanificateur();
        const r1 = rangee(elements['planif-sommaire'].innerHTML, 1);

        // La séquence est là, ses deux leçons aussi…
        expect(r1).toContain('Kanatuut');
        expect(r1).toContain('Introduction');
        expect(r1).toContain('Étude');
        // …mais son nom n'apparaît qu'UNE fois : plus d'étiquette de contexte.
        expect(r1).not.toContain('planif-grille-contexte');
        // Compter `>Kanatuut<` et non `Kanatuut` : le nom figure AUSSI dans
        // l'attribut `title` du bloc, qui n'est pas une répétition visible.
        expect((r1.match(/>Kanatuut</g) || []).length).toBe(1);
    });

    it('une leçon LOIN de sa séquence garde son étiquette — c’est sa raison d’être', () => {
        // La séquence commence en semaine 1 (sa première leçon) ; celle-ci vit
        // en semaine 3, seule, sans repère visible de son appartenance.
        poser(api, 'planif-l1', 'lecon', { titre: 'Introduction', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'Étude', parent: 'planif-s1', metadata: { semaine: 3 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Kanatuut', enfants: ['planif-l1', 'planif-l2'] });

        api.mettreAJourPlanificateur();
        const html = elements['planif-sommaire'].innerHTML;

        expect(rangee(html, 1)).not.toContain('planif-grille-contexte');
        expect(rangee(html, 3)).toContain('planif-grille-contexte');
        expect(rangee(html, 3)).toContain('Kanatuut');
    });

    it('une leçon SANS séquence n’invente pas d’étiquette', () => {
        poser(api, 'planif-lx', 'lecon', { titre: 'Isolée', metadata: { semaine: 2 } });

        api.mettreAJourPlanificateur();

        expect(rangee(elements['planif-sommaire'].innerHTML, 2)).not.toContain('planif-grille-contexte');
    });

    it('dans « Non planifié », l’étiquette reste — la séquence n’y est pas forcément', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Introduction', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-lx', 'lecon', { titre: 'Errante', parent: 'planif-s1', metadata: {} });
        poser(api, 'planif-s1', 'sequence', { titre: 'Kanatuut', enfants: ['planif-l1', 'planif-lx'] });

        api.mettreAJourPlanificateur();
        const zone = zoneNonPlanifie(elements['planif-sommaire'].innerHTML);

        expect(zone).toContain('Errante');
        expect(zone).toContain('planif-grille-contexte');
    });
});

// =======================================================================
// (1) LE SÉLECTEUR DE SEMAINE
// =======================================================================
describe('Sélecteur de semaine · ce qu’il rend', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCadre(); });

    it('une leçon porte un sélecteur, avec SA semaine pour valeur', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', metadata: { semaine: 3 } });
        const html = api.selecteurSemaineHTML(api.etat.noeuds.get('planif-l1'));

        expect(html).toContain('planif-noeud-semaine');
        expect(html).toContain('data-semaine-noeud="planif-l1"');
        expect(html).toContain('>S3<');
    });

    it('une leçon non planifiée affiche un tiret, pas « S0 » ni du vide', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', metadata: {} });
        const html = api.selecteurSemaineHTML(api.etat.noeuds.get('planif-l1'));

        expect(html).toContain('value=""');
        expect(html).toContain('>—<');
    });

    it('une séquence affiche le DÉBUT de son étendue — dérivé, jamais stocké', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'A', parent: 'planif-s1', metadata: { semaine: 2 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'B', parent: 'planif-s1', metadata: { semaine: 3 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Bloc', enfants: ['planif-l1', 'planif-l2'] });

        const html = api.selecteurSemaineHTML(api.etat.noeuds.get('planif-s1'));

        expect(html).toContain('>S2<');
        // La séquence ne porte AUCUNE semaine à elle : c'est la garantie que
        // `semaineDebut`/`semaineFin`, retirés le 6 août, ne reviennent pas.
        expect(api.etat.noeuds.get('planif-s1').metadata.semaine).toBeUndefined();
    });

    it('les autres types de nœuds n’en portent pas', () => {
        poser(api, 'planif-a1', 'activite', { titre: 'Atelier' });
        poser(api, 'planif-e1', 'evaluation', { titre: 'Examen' });

        expect(api.selecteurSemaineHTML(api.etat.noeuds.get('planif-a1'))).toBe('');
        expect(api.selecteurSemaineHTML(api.etat.noeuds.get('planif-e1'))).toBe('');
    });

    it('le rendu est PARESSEUX — une seule option, pas la liste entière', () => {
        // `reconstruireDOM()` passe souvent et une carte porte des dizaines de
        // blocs : écrire quinze options par bloc à chaque passage serait du
        // travail jeté. La liste se peuple au premier contact.
        poser(api, 'planif-l1', 'lecon', { titre: 'Accueil', metadata: { semaine: 3 } });
        const html = api.selecteurSemaineHTML(api.etat.noeuds.get('planif-l1'));

        expect((html.match(/<option/g) || []).length).toBe(1);
    });
});

describe('Sélecteur de semaine · les deux gestes ne peuvent pas diverger', () => {
    it('le changement passe par deposerDansGrille — la porte du glisser', () => {
        // Si le sélecteur écrivait directement `definirSemaineLecon`, il
        // sauterait le calage sur le cadre ET le déplacement de séquence : les
        // deux gestes se mettraient à produire des résultats différents.
        const bloc = tranche(sourceCarte, "var selSemaine = el.querySelector('.planif-noeud-semaine')", '// === POIGNÉE DE REDIMENSIONNEMENT');
        expect(bloc).toMatch(/addEventListener\(\s*'change'/);
        expect(bloc).toContain('deposerDansGrille(donnees.type, id, cible)');
        expect(bloc).not.toContain('definirSemaineLecon');
    });

    it('la pression sur le sélecteur n’enclenche pas le déplacement du bloc', () => {
        // Au doigt, la pression et le glisser sont le même début de geste :
        // sans stopPropagation, le sélecteur serait inutilisable sur iPad.
        const bloc = tranche(sourceCarte, "var selSemaine = el.querySelector('.planif-noeud-semaine')", '// === POIGNÉE DE REDIMENSIONNEMENT');
        expect(suitDansLaFonction(bloc, /'pointerdown', 'mousedown', 'click'/, /stopPropagation/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});

describe('Sélecteur de semaine · l’INSPECTEUR resynchronise le bloc (#150, terrain 8 août)', () => {
    // Terrain Grégoire : « changer un numéro de semaine dans l'inspecteur n'a
    // aucun effet sur la feuille dans le canevas ». La valeur était sauvegardée
    // — seul l'AFFICHAGE du bloc ne suivait pas : le chemin bloc→inspecteur
    // passait par reconstruireDOM, le chemin inverse ne rafraîchissait rien.

    function blocInspecteurSemaine() {
        const debut = sourceCarte.indexOf("extra.querySelector('#planif-panneau-semaine')");
        expect(debut).toBeGreaterThan(-1);
        const fin = sourceCarte.indexOf('});', sourceCarte.indexOf("addEventListener('input'", debut));
        expect(fin).toBeGreaterThan(debut);
        return sourceCarte.slice(debut, fin + 3);
    }

    it('le handler input de l’inspecteur appelle la synchro du bloc', () => {
        const bloc = blocInspecteurSemaine();
        expect(bloc).toContain('synchroniserSelecteurSemaine(id)');
    });

    it('… et remonte aux séquences ancêtres, dont la semaine est DÉRIVÉE', () => {
        // Une leçon déplacée en semaine 3 change l'étendue de sa séquence :
        // synchroniser le seul bloc leçon laisserait la séquence mentir.
        const bloc = blocInspecteurSemaine();
        expect(suitDansLaFonction(bloc, /parent/, /sequence/, /synchroniserSelecteurSemaine/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });

    it('… SANS reconstruireDOM — le handler est sur `input`, le focus doit survivre', () => {
        // reconstruireDOM pendant la frappe détruirait le champ en cours de
        // saisie : « 12 » deviendrait « 1 », perte de focus à chaque chiffre.
        const bloc = blocInspecteurSemaine();
        expect(bloc).not.toContain('reconstruireDOM');
    });

    it('la synchro ramène le <select> à l’état NON PEUPLÉ — liste paresseuse oblige', () => {
        // Poser `.value` sans repeupler échouerait en silence : avant le
        // premier contact, le <select> n'a qu'une seule option. L'état de
        // premier rendu (une option + dataset.peuple effacé) est le seul état
        // sûr — la liste complète revient au prochain contact.
        expect(suitDansLaFonction(sourceCarte, /function synchroniserSelecteurSemaine/, /delete select\.dataset\.peuple/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
    });
});

describe('Sélecteur de semaine · déplacer une séquence ne lui donne pas de semaine', () => {
    let api;
    beforeEach(() => { api = monterModule(); poserCadre(); });

    it('déplacer la séquence décale ses leçons et préserve leurs écarts', () => {
        poser(api, 'planif-l1', 'lecon', { titre: 'A', parent: 'planif-s1', metadata: { semaine: 1 } });
        poser(api, 'planif-l2', 'lecon', { titre: 'B', parent: 'planif-s1', metadata: { semaine: 2 } });
        poser(api, 'planif-s1', 'sequence', { titre: 'Bloc', enfants: ['planif-l1', 'planif-l2'] });

        api.deposerDansGrille('sequence', 'planif-s1', 2);

        expect(api.etat.noeuds.get('planif-l1').metadata.semaine).toBe(2);
        expect(api.etat.noeuds.get('planif-l2').metadata.semaine).toBe(3);
        // Et toujours rien sur la séquence elle-même.
        expect(api.etat.noeuds.get('planif-s1').metadata.semaine).toBeUndefined();
    });
});
