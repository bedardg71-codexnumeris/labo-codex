/**
 * SENTINELLE #770 — RÈGLE 1 DANS L'ANIMATION : NOMS, QUESTIONS ET CATÉGORIES ENTRENT ÉCHAPPÉS DANS LES MODALES.
 *
 * Audit des sous-onglets de Suivi, 6 septembre 2026, CM-4. js/boite-outils.js:387 injectait `${e.nom}, ${e.prenom}`
 * bruts dans la modale « Paramètres du tirage » — projetée en classe si l'enseignant l'ouvre —, :891 le texte d'une
 * question, :829 et :962 le nom d'une catégorie. Les treize autres injections du module étaient échappées.
 *
 * Mesure : les deux modales rendues par les fonctions réelles, sur un nom, une question et une catégorie qui portent
 * du HTML ; rien ne sort brut, tout sort échappé.
 *
 * Break-test attendu : retirer un des quatre `echapperHtml` → le cas correspondant rougit.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const ELEMENTS = () => ({ 'tirage-container': elementDom(), 'tirage-affichage': elementDom(), 'tirage-nb-restants': elementDom(), 'btn-tirer': elementDom(), 'questions-container': elementDom(), 'questions-affichage': elementDom(), 'questions-nb-restantes': elementDom(), 'btn-tirer-question': elementDom(), 'questions-filtre-categorie': elementDom({ options: [] }) });

describe('#770 · modales de l\'Animation', () => {
    it('la modale du tirage : « Assidu <b>gras</b>, Alice » sort échappé', () => {
        const store = storeBase();
        store.test_groupeEtudiants[0].nom = 'Assidu <b>gras</b>';
        const b = monter(store, { modules: ['js/boite-outils.js'], elements: ELEMENTS() });
        b.win.initialiserTirage();
        b.win.ouvrirModalParamsTirage();
        const html = b.document.body.innerHTML;
        expect(html).not.toContain('Assidu <b>gras</b>, Alice');
        expect(html).toContain('Assidu &lt;b&gt;gras&lt;/b&gt;, Alice');
    });

    it('la modale des questions : le texte d\'une question et le nom d\'une catégorie sortent échappés (liste et rafraîchissement)', () => {
        const store = storeBase();
        store.questionsFlash_GC1 = { questions: [{ id: 'q1', texte: 'Thème ? <i>q</i>', categorieId: 'c1' }], categories: [{ id: 'c1', nom: 'Cat <u>u</u>' }], dejaPositions: [], avecRemise: false, coursId: 'GC1' };
        const b = monter(store, { modules: ['js/boite-outils.js'], elements: Object.assign(ELEMENTS(), { 'nouvelle-categorie': elementDom({ value: '' }), 'nouvelle-question': elementDom({ value: '' }), 'nouvelle-question-categorie': elementDom({ value: '' }) }) });
        b.win.initialiserQuestions();
        b.win.ouvrirModalParamsQuestions();
        const html = b.document.body.innerHTML;
        expect(html).not.toContain('Thème ? <i>q</i>');
        expect(html).toContain('Thème ? &lt;i&gt;q&lt;/i&gt;');
        expect(html).not.toContain('>Cat <u>u</u> (');
        expect(html).toContain('Cat &lt;u&gt;u&lt;/u&gt; (1)');
        // Le rafraîchissement de la liste (après un ajout) passe par le second site (:962).
        const liste = elementDom();
        b.elements['questions-liste-modal'] = liste;
        b.document.getElementById('nouvelle-question').value = 'Autre ?';
        b.win.ajouterQuestion();
        const apres = liste.innerHTML + b.document.body.innerHTML;
        expect(apres).not.toContain('>Cat <u>u</u> (');
    });
});
