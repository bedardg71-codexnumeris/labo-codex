import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

// SENTINELLE #910 — LA LISTE « ÉCHELLE » DE L'ASSISTANT DE PRATIQUE.
//
// CE QUI CLOCHAIT (trouvaille du lot 34, mesurée le 19 sept. 2026). La liste
// écrivait le nom de l'échelle dans un gabarit sans `echapperHtml` (règle de
// sécurité n° 1 : un nom peut venir d'un partage importé), et lisait
// `echellesTemplates` sans le filtre « dans la bibliothèque » que portent
// l'éditeur de pratique et la question d'adoption (#898).
//
// ⚠ LE PIÈGE. `restaurerValeursEtape` remet la valeur par `element.value = …`.
// Si l'échelle d'une pratique existante est retirée de la bibliothèque et que
// le filtre l'écarte, l'option n'existe plus, le <select> retombe sur « -- » et
// la pratique rouverte perd son échelle en silence à l'enregistrement. Le
// filtre seul serait une régression sur des données réelles : l'échelle DÉJÀ
// CHOISIE reste offerte, sans mot neuf à l'écran.
//
// Ce banc exécute le VRAI wizard et le VRAI prédicat (`pratiques-bibliotheque.js`)
// dans le même bac à sable, et rend l'étape par `afficherEtapeWizardV2` : la
// restauration jugée ici est celle de l'application, pas une copie.

const ECH = (id, nom, extra = {}) => ({
    id, nom,
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 59, valeurCalcul: 40 },
        { code: 'M', nom: 'Maîtrisé', min: 60, max: 100, valeurCalcul: 80 }
    ],
    ...extra
});

const texteVisible = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// L'environnement Vitest est `node` : un <select> fidèle sur le seul point jugé
// ici — comme dans un navigateur, `value = x` ne prend que si une <option> de
// cette valeur existe dans le rendu ; sinon le select retombe sur la première.
function monter({ echelles, reponses = {} }) {
    const store = { 'a2026_echellesTemplates': echelles, 'a2026_pratiquesConfigurables': [] };
    const elements = {};
    const conteneur = { id: 'wizard-v2-contenu', innerHTML: '', style: {}, classList: { add() {}, remove() {}, contains: () => false, toggle() {} } };
    let valeurSelect = '';
    let poses = 0;   // combien de fois la restauration a ÉCRIT dans le select
    const select = {
        id: 'wizardv2-echelleId',
        get value() { return valeurSelect; },
        get poses() { return poses; },
        set value(x) {
            poses++;
            const offertes = [...conteneur.innerHTML.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]);
            valeurSelect = offertes.includes(String(x)) ? String(x) : '';
        }
    };
    const element = (id) => {
        if (id === 'wizard-v2-contenu') return conteneur;
        if (id === 'wizardv2-echelleId') {
            // Le select n'existe que si le rendu courant le porte.
            return conteneur.innerHTML.includes('id="wizardv2-echelleId"') ? select : null;
        }
        if (!elements[id]) {
            elements[id] = {
                id, value: '', innerHTML: '', textContent: '', style: {}, disabled: false,
                classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
                // bloc 3 (15 oct. 2026) : le titre de l'étape porte sa bulle
                setAttribute() {}, removeAttribute() {}
            };
        }
        return elements[id];
    };
    const globaux = {
        db: {
            get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        notifications: { succes: () => {}, info: () => {}, avertissement: () => {}, erreur: () => {} },
        toggleDisplay: () => {},
        document: {
            getElementById: element,
            querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    };
    const win = chargerScript('js/pratiques-bibliotheque.js', globaux);
    chargerScript('js/wizard-pratique-v2.js', globaux, win);

    win.wizardState.reponses = Object.assign(
        { typePratique: 'standards', approcheEvaluation: 'par-artefacts', nom: 'Test' }, reponses);
    win.wizardState.etapeActuelle = 'echelle-performance';
    win.wizardState.historique = [];
    const rendre = () => { win.afficherEtapeWizardV2('echelle-performance'); return conteneur.innerHTML; };
    return { win, rendre, select };
}

const valeursOffertes = (html) => [...html.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]).filter(Boolean);

describe('#910 · la liste « échelle » de l\'assistant de pratique', () => {

    it('le banc juge le VRAI prédicat : celui de la question d\'adoption (#898), chargé dans le même bac', () => {
        const { win } = monter({ echelles: [ECH('A', 'Alpha'), ECH('B', 'Bêta', { dansBibliotheque: false })] });
        expect(win.obtenirEchellesOffertesAdoption().map((e) => e.id)).toEqual(['A']);
    });

    it('un nom d\'échelle portant des balises rend du TEXTE, pas une balise', () => {
        const { rendre } = monter({ echelles: [
            ECH('A', 'Cotation <b>gras</b>'),
            ECH('B', '"><img src=x onerror=alert(1)>')
        ] });
        const html = rendre();
        expect(html).not.toContain('<b>gras</b>');
        expect(html).not.toContain('<img');
        expect(html).toContain('Cotation &lt;b&gt;gras&lt;/b&gt; (2 niveaux)');
        expect(html).toContain('&quot;&gt;&lt;img src=x onerror=alert(1)&gt; (2 niveaux)');
        // Les deux échelles restent offertes : l'échappement ne retire rien.
        expect(valeursOffertes(html)).toEqual(['A', 'B']);
    });

    it('une échelle retirée de la bibliothèque n\'est plus offerte ; les autres le restent, dans leur ordre', () => {
        const { rendre } = monter({ echelles: [
            ECH('A', 'Alpha'),
            ECH('B', 'Bêta', { dansBibliotheque: false }),
            ECH('C', 'Gamma', { dansBibliotheque: true }),
            ECH('D', 'Delta')
        ] });
        const html = rendre();
        expect(valeursOffertes(html)).toEqual(['A', 'C', 'D']);
        expect(texteVisible(html)).not.toContain('Bêta');
    });

    it('LE PIÈGE — l\'échelle retirée MAIS déjà choisie reste offerte ET sélectionnée après la restauration', () => {
        const { rendre, select } = monter({
            echelles: [
                ECH('A', 'Alpha'),
                ECH('B', 'Bêta', { dansBibliotheque: false }),
                ECH('Z', 'Oméga', { dansBibliotheque: false })
            ],
            reponses: { echelleId: 'B' }
        });
        const html = rendre();
        // La choisie est là, à sa place ; l'AUTRE retirée ne revient pas avec elle.
        expect(valeursOffertes(html)).toEqual(['A', 'B']);
        // `afficherEtapeWizardV2` a rendu PUIS restauré : le select porte l'échelle.
        expect(select.value).toBe('B');
        // Sans mot neuf : le libellé est celui des autres options.
        expect(html).toContain('>Bêta (2 niveaux)</option>');
        expect(texteVisible(html)).not.toMatch(/retir/i);
    });

    it('témoin du select fidèle : une échelle choisie qui n\'existe plus du tout retombe sur « -- » (hors lot, inchangé)', () => {
        const { rendre, select } = monter({ echelles: [ECH('A', 'Alpha')], reponses: { echelleId: 'DISPARUE' } });
        const html = rendre();
        expect(valeursOffertes(html)).toEqual(['A']);
        // La restauration a bien écrit dans le select : le vide n'est pas un select jamais atteint.
        expect(select.poses).toBe(1);
        expect(select.value).toBe('');
    });

    it('bibliothèque vide APRÈS le filtre : le message existant, mot pour mot, et aucune liste', () => {
        const { rendre } = monter({ echelles: [
            ECH('B', 'Bêta', { dansBibliotheque: false }),
            ECH('Z', 'Oméga', { dansBibliotheque: false })
        ] });
        const html = rendre();
        expect(html).not.toContain('<select');
        expect(texteVisible(html)).toContain(
            'Aucune échelle de performance n\'a été créée. Tu pourras en créer une dans Conception → Échelles de performance.');
    });

    it('tout est retiré SAUF que l\'une est la choisie : la liste, pas le message', () => {
        const { rendre, select } = monter({
            echelles: [ECH('B', 'Bêta', { dansBibliotheque: false }), ECH('Z', 'Oméga', { dansBibliotheque: false })],
            reponses: { echelleId: 'Z' }
        });
        const html = rendre();
        expect(valeursOffertes(html)).toEqual(['Z']);
        expect(select.value).toBe('Z');
        expect(texteVisible(html)).not.toContain('Aucune échelle de performance');
    });
});
