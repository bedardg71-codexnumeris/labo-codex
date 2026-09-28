import { describe, it, expect, beforeEach } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE — un horaire qu'on vient de CRÉER doit être supprimable
// =======================================================================
//
// Retour terrain du 21 août 2026 (porte 2.4 du lot Cadre) : « Il n'y a pas
// de possibilité de supprimer l'horaire <b>ZZ</b> ». Grégoire venait de le
// créer pour éprouver l'échappement, et s'est retrouvé avec un horaire de
// test coincé dans ses données réelles.
//
// Le mécanisme : le bouton Supprimer porte `u-hide` dans index.html et n'est
// démasqué que par `editerHoraireV2` (mode édition). Après une CRÉATION, la
// sauvegarde repositionnait bien le menu déroulant sur le nouvel horaire —
// mais poser `select.value` par code ne déclenche PAS l'événement `change`,
// donc `changerHoraireSelectionneV2` n'était jamais appelée et le formulaire
// restait en mode création : aucun bouton Supprimer, jusqu'à ce qu'on
// sélectionne un AUTRE horaire puis qu'on revienne.
//
// Ce qui est verrouillé ici :
//   A. après création, le bouton Supprimer est VISIBLE ;
//   B. après création, le formulaire est en mode édition (titre + libellé) ;
//   C. après une MODIFICATION, le bouton reste visible (pas de régression).

const UHIDE = 'u-hide';

function creerElement(classes = [], valeur = '') {
    const set = new Set(classes);
    return {
        value: valeur, textContent: '', innerHTML: '',
        focus() {}, scrollIntoView() {},
        classList: {
            add: (c) => set.add(c),
            remove: (c) => set.delete(c),
            contains: (c) => set.has(c),
            toggle: (c, force) => {
                if (force === undefined) { set.has(c) ? set.delete(c) : set.add(c); }
                else if (force) { set.add(c); } else { set.delete(c); }
                return set.has(c);
            }
        }
    };
}

// Reflète l'état LIVRÉ par index.html : bouton Supprimer `u-hide` par défaut.
function creerDom() {
    const ids = {
        'v2-btnSupprimerHoraire': creerElement([UHIDE]),
        'v2-selectHoraire': creerElement(),
        'v2-titreFormHoraire': creerElement(),
        'v2-btnCreerHoraire': creerElement(),
        'v2-carteResumeHoraire': creerElement(),
        'v2-horaireEtatVide': creerElement(),
        'v2-formulaireHoraire': creerElement(),
        'v2-hor-groupeAssocie': creerElement([], '00001'),
        'v2-hor-nom': creerElement([], 'Mar-Jeu'),
        'v2-hor-nbSeances': creerElement([], '1'),
        'v2-hor-seance-0-jour': creerElement([], 'Mardi'),
        'v2-hor-seance-0-debut': creerElement([], '10:00'),
        'v2-hor-seance-0-fin': creerElement([], '12:00'),
        // #540 lot E1 (26 août 2026) : le champ global « Périodes par séance » a disparu
        // au profit d'un nombre de périodes PAR séance, désormais requis à
        // l'enregistrement — une période comprend sa pause, elle ne se déduit pas des
        // heures. Sans ce champ, `sauvegarderHoraireV2` refuse et ce banc ne créait plus
        // rien : ses trois cas rougissaient sur l'absence du bouton Supprimer, pas sur
        // ce qu'ils verrouillent.
        'v2-hor-seance-0-periodes': creerElement([], '2'),
        'v2-hor-seance-0-local': creerElement([], 'A-101'),
        'v2-seancesHoraireContainer': creerElement(),
        'v2-seancesContainer': creerElement()
    };
    return {
        ids,
        document: {
            getElementById: (id) => ids[id] || null,
            addEventListener() {}, removeEventListener() {},
            querySelector: () => null, querySelectorAll: () => [],
            createElement: () => creerElement(),
            body: { addEventListener() {}, classList: creerElement().classList, style: {} },
            documentElement: { addEventListener() {} }
        }
    };
}

function estVisible(el) { return !el.classList.contains(UHIDE); }

describe('Terrain 2.4 · un horaire créé est immédiatement supprimable', () => {
    let dom, win, stores;

    function charger(horaires = []) {
        dom = creerDom();
        stores = { a2026_horaires: horaires, a2026_horaireHebdo: [], a2026_groupeEtudiants: [] };
        win = chargerScript('js/trimestre-v2-horaires.js', {
            document: dom.document,
            db: {
                getSync: (k, d) => (k in stores ? stores[k] : d),
                setSync: (k, v) => { stores[k] = v; }
            },
            cle: (n) => 'a2026_' + n,
            echapperHtml: (s) => String(s == null ? '' : s),
            echapperAttribut: (s) => String(s == null ? '' : s),
            genererIdUnique: (p) => p + 'NEUF',
            calculerHeureFin: () => '12:00',
            fusionnerSeancesHoraires: (hs) =>
                (hs || []).flatMap(h => (h && h.seances) || []),
            notifications: { succes() {}, erreur() {} },
            estEnModeDemo: () => false
        });
        // hub résiduel appelé en fin de sauvegarde
        win.populerDropdownsAssemblageV2 = () => {};
    }

    beforeEach(() => charger());

    it('A · le bouton Supprimer est VISIBLE juste après la création', () => {
        const btn = dom.ids['v2-btnSupprimerHoraire'];
        expect(estVisible(btn)).toBe(false); // état livré par index.html

        win.sauvegarderHoraireV2();

        expect(
            estVisible(btn),
            'Après création, aucun bouton Supprimer : l\'horaire est coincé dans les données.'
        ).toBe(true);
    });

    it('B · le formulaire passe en mode édition (titre ; « Créer l\'horaire » se cache, lot E2)', () => {
        win.sauvegarderHoraireV2();

        expect(dom.ids['v2-titreFormHoraire'].textContent).toBe('Modifier l\'horaire');
        expect(dom.ids['v2-btnCreerHoraire'].classList.contains('u-hide')).toBe(true);
    });

    it('C · l\'horaire est bien enregistré et retrouvable par son id', () => {
        win.sauvegarderHoraireV2();

        expect(stores.a2026_horaires).toHaveLength(1);
        expect(stores.a2026_horaires[0].id).toBe('HOR_NEUF');
        expect(stores.a2026_horaires[0].nom).toBe('Mar-Jeu');
    });

    it('D · après une MODIFICATION, le bouton reste visible (pas de régression)', () => {
        charger([{ id: 'HOR_X', nom: 'Ancien', groupeAssocie: '00001', periodesParSeance: 2, seances: [] }]);
        const btn = dom.ids['v2-btnSupprimerHoraire'];

        // chemin reel du menu deroulant (editerHoraireV2 n'est pas exportee)
        win.changerHoraireSelectionneV2('HOR_X');
        expect(estVisible(btn)).toBe(true);

        win.sauvegarderHoraireV2();
        expect(estVisible(btn)).toBe(true);
        expect(stores.a2026_horaires).toHaveLength(1);
    });
});
