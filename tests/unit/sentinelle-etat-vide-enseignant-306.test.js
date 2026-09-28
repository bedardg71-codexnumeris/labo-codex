import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #306 — Enseignant·e suit le patron « état vide masqué »
// =======================================================================
//
// Décision de Grégoire, 19 août 2026 (la question UX restée ouverte à la
// livraison #306 du 3 juillet) : « aligner Enseignant·e sur le patron des
// trois autres ». Avant : Cours / Horaire / Groupe-cours affichaient un
// état vide et cachaient leur formulaire tant que rien n'était sélectionné,
// mais Enseignant·e montrait son formulaire EN PERMANENCE, même vide.
//
// Ce qui est verrouillé ici :
//   A. au chargement SANS aucun profil : état vide visible, formulaire caché ;
//   B. sélectionner un profil OUVRE le formulaire (mode « Modifier ») ;
//   C. revenir à « — Sélectionner — » referme le formulaire ;
//   D. « + Nouveau profil » OUVRE le formulaire (mode « Créer ») ;
//   E. « Annuler » referme le formulaire ET désélectionne (patron Cours) ;
//   F. supprimer le profil referme le formulaire ;
//   G. le HTML livre l'état vide et un formulaire `u-hide` PAR DÉFAUT ;
//   H. au chargement AVEC un profil : l'auto-sélection du premier profil est
//      CONSERVÉE — le formulaire s'ouvre rempli (comportement historique).

const UHIDE = 'u-hide';

function creerElement(classes = []) {
    const set = new Set(classes);
    return {
        value: '', textContent: '', innerHTML: '',
        focus() {},
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

// Reflète l'état LIVRÉ par index.html : état vide visible, formulaire u-hide.
function creerDom() {
    const ids = {
        'enseignant-etat-vide': creerElement(),
        'enseignant-formulaire-edition': creerElement([UHIDE]),
        'v2-selectEnseignant': creerElement(),
        'v2-titreFormEnseignant': creerElement(),
        'v2-btnCreerEnseignant': creerElement([UHIDE])
    };
    ['prenom', 'nom', 'courriel', 'institution', 'departement', 'discipline', 'siteWeb']
        .forEach(ch => { ids['v2-ens-' + ch] = creerElement(); });
    return {
        ids,
        document: {
            getElementById: (id) => ids[id] || null,
            addEventListener() {}, removeEventListener() {},
            querySelector: () => null, querySelectorAll: () => [],
            body: { addEventListener() {}, classList: creerElement().classList, style: {} },
            documentElement: { addEventListener() {} }
        }
    };
}

const PROFIL = {
    id: 'ENS_TEST_1',
    prenom: 'Grégoire', nom: 'Bédard',
    courriel: 'g@cegep.qc.ca', institution: 'Cégep'
};

function estVisible(el) { return !el.classList.contains(UHIDE); }

describe('#306 · Enseignant·e : patron « état vide masqué »', () => {
    let dom, win, confirms;

    function charger(enseignants = []) {
        dom = creerDom();
        confirms = [];
        win = chargerScript('js/trimestre-v2-enseignants.js', {
            document: dom.document,
            db: {
                _stores: { enseignants },
                getSync(k, d) { return k in this._stores ? this._stores[k] : d; },
                setSync(k, v) { this._stores[k] = v; }
            },
            echapperHtml: (s) => String(s),
            // CT-09 (21 août 2026) : le dropdown échappe désormais l'id en
            // contexte d'attribut. Dans le navigateur, echapperAttribut est un
            // global de js/securite-echappement.js ; ici on le stubbe comme
            // echapperHtml, ce test-ci portant sur l'état vide, pas sur
            // l'échappement (couvert par securite-echappement-CT29.test.js).
            echapperAttribut: (s) => String(s),
            genererIdUnique: (p) => p + 'X1',
            notifications: { succes() {}, erreur() {} },
            confirm: () => { confirms.push(1); return true; }
        });
    }

    beforeEach(() => charger());

    it('A · chargement sans aucun profil : état vide visible, formulaire caché', () => {
        win.chargerProfilEnseignantV2();

        expect(estVisible(dom.ids['enseignant-etat-vide'])).toBe(true);
        expect(estVisible(dom.ids['enseignant-formulaire-edition'])).toBe(false);
    });

    it('B · sélectionner un profil ouvre le formulaire en mode « Modifier »', () => {
        charger([PROFIL]);
        dom.ids['v2-selectEnseignant'].value = PROFIL.id;

        win.chargerEnseignantSelectionneV2();

        expect(estVisible(dom.ids['enseignant-formulaire-edition'])).toBe(true);
        expect(estVisible(dom.ids['enseignant-etat-vide'])).toBe(false);
        expect(dom.ids['v2-titreFormEnseignant'].textContent).toBe('Modifier le profil');
        expect(dom.ids['v2-ens-prenom'].value).toBe('Grégoire');
    });

    it('C · revenir à « — Sélectionner — » referme le formulaire', () => {
        charger([PROFIL]);
        dom.ids['v2-selectEnseignant'].value = PROFIL.id;
        win.chargerEnseignantSelectionneV2();

        dom.ids['v2-selectEnseignant'].value = '';
        win.chargerEnseignantSelectionneV2();

        expect(estVisible(dom.ids['enseignant-etat-vide'])).toBe(true);
        expect(estVisible(dom.ids['enseignant-formulaire-edition'])).toBe(false);
    });

    it('D · « + Nouveau profil » ouvre le formulaire en création (« Créer le profil », lot E2)', async () => {
        await win.nouveauProfilEnseignantV2();

        expect(estVisible(dom.ids['enseignant-formulaire-edition'])).toBe(true);
        expect(estVisible(dom.ids['enseignant-etat-vide'])).toBe(false);
        expect(dom.ids['v2-titreFormEnseignant'].textContent).toBe('Nouveau profil');
        expect(estVisible(dom.ids['v2-btnCreerEnseignant'])).toBe(true);
    });

    it('E · « Fermer » (ex-« Annuler », lot E2) referme le formulaire ET désélectionne (patron Cours)', async () => {
        charger([PROFIL]);
        dom.ids['v2-selectEnseignant'].value = PROFIL.id;
        win.chargerEnseignantSelectionneV2();

        await win.fermerFicheEnseignantV2();

        expect(estVisible(dom.ids['enseignant-etat-vide'])).toBe(true);
        expect(estVisible(dom.ids['enseignant-formulaire-edition'])).toBe(false);
        expect(dom.ids['v2-selectEnseignant'].value).toBe('');
        expect(dom.ids['v2-ens-prenom'].value).toBe('');
    });

    it('F · supprimer le profil referme le formulaire', async () => {
        charger([PROFIL]);
        dom.ids['v2-selectEnseignant'].value = PROFIL.id;
        win.chargerEnseignantSelectionneV2();

        await win.supprimerProfilEnseignantV2();

        expect(confirms).toHaveLength(1);   // la confirmation a bien eu lieu
        expect(estVisible(dom.ids['enseignant-etat-vide'])).toBe(true);
        expect(estVisible(dom.ids['enseignant-formulaire-edition'])).toBe(false);
    });

    it('G · le HTML livre l\'état vide et un formulaire caché par défaut', () => {
        const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf-8');

        expect(html.match(/id="enseignant-etat-vide" class="etat-vide-formulaire"/g)).toHaveLength(1);
        expect(html.match(/id="enseignant-formulaire-edition" class="u-hide"/g)).toHaveLength(1);
    });

    it('H · chargement AVEC un profil : l\'auto-sélection ouvre le formulaire rempli', () => {
        charger([PROFIL]);

        win.chargerProfilEnseignantV2();

        expect(dom.ids['v2-selectEnseignant'].value).toBe(PROFIL.id);
        expect(estVisible(dom.ids['enseignant-formulaire-edition'])).toBe(true);
        expect(dom.ids['v2-ens-prenom'].value).toBe('Grégoire');
    });
});
