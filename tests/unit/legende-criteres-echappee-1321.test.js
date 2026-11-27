/**
 * #1321 (fiche 6 du lot « Suivi », 27 nov. 2026) — LA LÉGENDE DU GRAPHIQUE DES CRITÈRES D'UN PROFIL insérait le nom
 * d'un critère sans `echapperHtml` (règle de sécurité n° 1 : un nom vient d'une grille importée), et son `data-critere`
 * échappait l'apostrophe par une barre oblique que la bascule relisait telle quelle : la courbe de « Qualité de
 * l'expression » ne se masquait pas. Le nom passe maintenant par `echapperHtml`, dans le texte et dans l'attribut.
 * Et, suite de la fiche 4 : « lors d'interventions RàI terminées ».
 *
 *   cd tests && npx vitest run unit/legende-criteres-echappee-1321.test.js
 *
 * Break-test (27 nov. 2026) : sur le code d'avant, A, B et C sont rouges.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const NOM = 'Qualité de l\'expression <b>gras</b>';
/** Ce que le navigateur rend dans `dataset` pour un attribut : les entités décodées. */
const decoder = (v) => v.replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function banc() {
    const store = storeBase();
    store.test_productions = [{ id: 'P1', titre: 'P1' }];
    store.test_evaluationsSauvegardees = [{ id: 'C1', etudiantDA: '2000001', productionId: 'P1', dateEvaluation: '2026-09-01', echelleId: 'E',
        criteres: [{ critereNom: NOM, niveauSelectionne: 'M' }, { critereNom: 'Structure', niveauSelectionne: 'D' }] }];
    const b = monter(store, {
        modules: ['js/entites/production-diagnostique.js', 'js/profil-etudiant-helpers.js',
            { chemin: 'js/graphiques-progression.js', internes: ['_chartsCriteres'] },
            { chemin: 'js/profil-etudiant-sections-affichage.js', internes: ['_genererGraphiqueCriteresHTML'] }],
        globaux: { genererBandeauContexteProfil: () => '' }
    });
    return { b, html: b.interne['profil-etudiant-sections-affichage.js']._genererGraphiqueCriteresHTML('2000001') };
}

describe('#1321 · la légende du graphique des critères', () => {
    it('A le nom s\'affiche échappé : ni balise, ni texte brut', () => {
        const { html } = banc();
        expect(html).not.toContain('<b>gras</b>');
        // L'apostrophe : `&#39;` par l'`echapperHtml` de l'app (js/config.js), telle quelle par celui du banc.
        expect(html).toMatch(/Qualité de l(&#39;|')expression &lt;b&gt;gras&lt;\/b&gt;/);
    });

    it('B l\'attribut de la case rend le nom exact, et la bascule masque puis remontre sa courbe', () => {
        const { b, html } = banc();
        const attribut = (html.match(/data-critere="([^"]*)"/g) || []).map((m) => decoder(m.slice('data-critere="'.length, -1)));
        expect(attribut).toContain(NOM);
        const courbes = [{ label: NOM, hidden: false }, { label: 'Structure', hidden: false }];
        b.interne['graphiques-progression.js']._chartsCriteres['2000001'] = { data: { datasets: courbes }, update() {}, canvas: { parentNode: {} }, ctx: {} };
        b.win.toggleCritereIndivHandler({ dataset: { critere: attribut.find((a) => a === NOM), da: '2000001' }, checked: false });
        expect(courbes.map((c) => c.hidden)).toEqual([true, false]);
        b.win.toggleCritereIndivHandler({ dataset: { critere: NOM, da: '2000001' }, checked: true });
        expect(courbes[0].hidden).toBe(false);
    });
});

describe('fiche 6 · C — la suite de la fiche 4', () => {
    it('« … lors d\'interventions RàI terminées. »', () => {
        const source = readFileSync(path.join(RACINE, 'js/profil-etudiant-sections-affichage.js'), 'utf8');
        expect(source).toContain('Les captures sont enregistrées automatiquement chaque semaine et lors d\'interventions RàI terminées.');
        expect(source).not.toContain('interventions RàI complétées');
    });
});
