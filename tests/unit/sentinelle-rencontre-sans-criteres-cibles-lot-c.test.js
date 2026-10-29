/**
 * SENTINELLE — CHEZ L'ORTHOPÉDAGOGUE, LA CARTE « CRITÈRES CIBLÉS / OBJECTIF VISÉ » NE S'AFFICHE PAS
 * (consigne du 12 septembre 2026, révisée à 10 h 35, lot C ; décision de Grégoire).
 *
 * Mesuré par Cowork, remesuré ici : les cinq critères ne sont pas en dur — `ouvrirIntervention` bâtit les
 * cases depuis `obtenirGrilleReferenceDepistage()`. Suivi › Rencontres rend le MÊME formulaire (même module).
 * Décision : sur un service, la carte ENTIÈRE (« Critères ciblés », « Objectif visé », « Suggérer » — qui ne
 * sait partir que d'un critère coché) n'est pas rendue. MASQUÉE, pas supprimée. Hors service, rien ne change.
 *
 * VERROUILLÉ ICI :
 *   1. sur un service (vue Rencontres ET vue Interventions) : ni « Critères ciblés », ni « Objectif visé »,
 *      ni « Suggérer » dans le formulaire rendu — commentaire HTML compris ;
 *   2. hors service : la carte est là, ses cases viennent de la grille de référence, « Suggérer » répond ;
 *      ses mots de 1.137.0 sont figés ;
 *   3. le STOCK : une rencontre dont `criteresCibles` vaut ['Structure'] (et `objectifVise` un texte), ouverte
 *      et enregistrée sur un service, les garde — conteneur absent ⇒ champ intouché. Témoin : hors service,
 *      la même rencontre enregistrée avec la case décochée écrit bien [] (la garde porte sur le conteneur,
 *      pas sur l'écriture en général) ;
 *   4. le sous-titre du bilan d'une rencontre : « Ce que tu retiens de la rencontre. » (texte arrêté par
 *      Grégoire, 10 h 40) ; celui d'une intervention ne bouge pas.
 *
 * BREAK-TESTS VÉRIFIÉS le 12 septembre 2026 — journal en fin de fichier.
 */
// ↻ #1152, retouche 2 du lot 5 (29 oct. 2026, plans de travail/VERDICT-RELECTURE-2026-10-29-aide-lot-5.md) : le champ « Séance concernée » (interventionSeance) est retiré.
import { describe, it, expect } from 'vitest';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const GRILLE = { criteres: [{ nom: 'Structure', niveauSOLO: 'multi' }, { nom: 'Rigueur', niveauSOLO: 'multi' }] };
const GLOBAUX = {
    determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
    calculerMoyennesCriteres: () => ({ structure: 0.6, rigueur: 0.8 }), obtenirGrilleReferenceDepistage: () => GRILLE, libelleNiveauSOLO: () => 'multistructurel',
    obtenirSeuil: () => 0.7, calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
};
const intervention = (extra) => Object.assign({ id: 'I1', titre: 'Rencontre de Léa', date: '2026-09-01', heure: '', duree: 1, type: 'individuel', niveauRai: 3, contexte: 'hors-classe',
    description: '', etudiants: ['2000001'], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: ['Structure'], objectifVise: 'Relire son plan',
    bilan: null, statut: 'en-cours', jamaisSauvegardee: false, groupeCoursId: 'GC1' }, extra);
const champs = () => ({ interventionNiveau: elementDom({ value: '3' }), interventionContexte: elementDom({ value: 'hors-classe' }), interventionTitre: elementDom({ value: 'Rencontre de Léa' }),
    interventionDate: elementDom({ value: '2026-09-01' }), interventionHeure: elementDom({ value: '' }), interventionDuree: elementDom({ value: '1' }),
    interventionDescription: elementDom({ value: '' }), observationsIntervention: elementDom({ value: '' }) });

/** Un banc sur GC1 ; `service` fait de son cours un service d'orthopédagogie (le point d'accroche : contexteActifEstService). */
function banc({ service, vue = 'rencontres', extra, globaux } = {}) {
    const store = storeBase();
    store.cours = [{ id: 'GC1', nature: service ? 'service' : 'cours', nomCours: service ? 'Aide' : 'Écriture', codeCours: service ? '' : '601-101-MQ' }];
    store.test_interventions = [intervention(extra)];
    const cases = [elementDom({ value: '2000001', checked: true })];
    const b = monter(store, { modules: ['js/interventions.js'], globaux: Object.assign({}, GLOBAUX, globaux || {}), elements: champs(),
        selecteurs: { '#listeEtudiantsIntervention input[type="checkbox"]': cases, '#listeEtudiantsIntervention input[type="checkbox"]:checked': cases,
            'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }) } });
    b.win.definirVocabulaireInterventions(vue);
    const idConteneur = vue === 'rencontres' ? 'conteneurRencontres' : 'conteneurPrincipal';
    b.rendre = () => { b.win.ouvrirIntervention('I1'); return b.document.getElementById(idConteneur).innerHTML; };
    // Le vrai document ne rend un id que s'il est dans le HTML écrit : le banc, lui, fabrique tout élément demandé.
    // On lui fait dire « absent » pour les deux ids de la carte quand le rendu ne les contient pas.
    b.absentsSelonRendu = (html) => {
        const orig = b.document.getElementById;
        b.document.getElementById = (id) => (['criteresCiblesContainer', 'objectifVise'].includes(id) && !html.includes('id="' + id + '"') ? null : orig(id));
    };
    return b;
}

// ─────────────────────────────────────────────────────────────────────────────
describe('1 · sur un service, la carte n\'est pas rendue', () => {
    for (const vue of ['rencontres', 'interventions']) {
        it(`vue ${vue} : ni « Critères ciblés », ni « Objectif visé », ni « Suggérer »`, () => {
            const html = banc({ service: true, vue }).rendre();
            expect(html, 'le formulaire est bien rendu').toContain('id="interventionTitre"');
            expect(html).not.toContain('Critères ciblés');
            expect(html).not.toContain('Objectif visé');
            expect(html).not.toContain('Suggérer');
            expect(html).not.toContain('suggererObjectifIntervention');
            expect(html).not.toContain('id="criteresCiblesContainer"');
            expect(html).not.toContain('id="objectifVise"');
            expect(html).not.toContain('grille de référence');
        });
    }
});

describe('2 · hors service, la carte est là, telle qu\'en 1.137.0', () => {
    it('ses cases viennent de la grille de référence, ses mots sont figés, « Suggérer » est câblé', () => {
        const html = banc({ service: false, vue: 'interventions' }).rendre();
        expect(html).toContain('<!-- Critères ciblés et objectif visé -->');
        expect(html).toContain('<h4 class="intervention-mt-0" data-tooltip="interv-criteres-cibles">Critères ciblés</h4>');
        expect(html).toContain('Sur quoi porte l\'intervention ? Pré-cochés selon les défis communs du sous-groupe.');
        expect(html).toContain('<h4 class="intervention-mt-0" data-tooltip="interv-objectif-vise">Objectif visé</h4>');
        expect(html).toContain('Qu\'espères-tu voir changer à la suite de cette intervention ?');
        // ↻ #847 (13 sept. 2026) : les exemples gris ne citent plus les critères de Grégoire — textes approuvés par lui.
        expect(html).toContain('placeholder="Ex. Amener un critère au seuil visé"');
        expect(html).toContain('placeholder="Ex. Intervention sur deux critères ciblés"');
        expect(html).toContain('value="Relire son plan"');
        expect(html).toMatch(/<button data-action="suggererObjectifIntervention" data-param="I1" class="btn btn-secondaire" style="white-space: nowrap;">Suggérer<\/button>/);
        const cases = [...html.matchAll(/<input type="checkbox" class="critere-cible-cb" value="([^"]+)" (checked)?/g)].map(m => [m[1], !!m[2]]);
        expect(cases, 'les cases de la grille, Structure cochée depuis la base').toEqual([['Structure', true], ['Rigueur', false]]);
    });

    it('sans grille de référence, le message d\'invite de 1.137.0 reste (hors service, rien ne change — même son chemin)', () => {
        const html = banc({ service: false, vue: 'interventions', globaux: { obtenirGrilleReferenceDepistage: () => null } }).rendre();
        expect(html).toContain('Configure une grille de référence dans Conception › Grilles de critères pour activer le ciblage par critère.');
    });

    it('« Suggérer » répond : un critère coché et un élève sélectionné donnent un objectif', () => {
        const b = banc({ service: false, vue: 'interventions' });
        b.rendre();
        b.selecteurs['.critere-cible-cb:checked'] = [elementDom({ value: 'Structure', checked: true })];
        const champ = b.document.getElementById('objectifVise');
        champ.value = '';
        b.win.suggererObjectifIntervention('I1');
        expect(champ.value).toMatch(/Structure/);
    });
});

describe('3 · le stock : sur un service, enregistrer ne touche ni aux critères ciblés ni à l\'objectif', () => {
    it('une rencontre à [\'Structure\'] / « Relire son plan », ouverte et enregistrée sur un service, les garde', () => {
        const b = banc({ service: true });
        b.absentsSelonRendu(b.rendre());
        b.win.sauvegarderPresencesIntervention('I1');
        const i = b.store.test_interventions[0];
        expect(i.titre, 'l\'enregistrement a bien eu lieu').toBe('Rencontre de Léa');
        expect(i.criteresCibles).toEqual(['Structure']);
        expect(i.objectifVise).toBe('Relire son plan');
    });

    it('témoin : hors service, la carte est rendue — la case décochée et l\'objectif vidé s\'écrivent ([] et \'\')', () => {
        const b = banc({ service: false, vue: 'interventions' });
        b.absentsSelonRendu(b.rendre());
        b.selecteurs['#criteresCiblesContainer .critere-cible-cb:checked'] = [];
        b.document.getElementById('objectifVise').value = '';
        b.win.sauvegarderPresencesIntervention('I1');
        const i = b.store.test_interventions[0];
        expect(i.criteresCibles).toEqual([]);
        expect(i.objectifVise).toBe('');
    });
});

describe('4 · le sous-titre du bilan', () => {
    it('une rencontre complétée sur un service : « Ce que tu retiens de la rencontre. », sans tableau avant/après', () => {
        const html = banc({ service: true, extra: { statut: 'completee', snapshotAvant: { 2000001: { P: 80, criteres: { structure: 0.6 } } } } }).rendre();
        expect(html).toContain('<p class="text-muted" style="font-size: 0.9rem; margin-bottom: 15px;">Ce que tu retiens de la rencontre.</p>');
        expect(html).not.toContain('Comparaison');
        expect(html).toContain('Objectif atteint ?');
    });
    it('une intervention hors service : le sous-titre de 1.137.0 ne bouge pas', () => {
        const html = banc({ service: false, vue: 'interventions', extra: { statut: 'completee' } }).rendre();
        expect(html).toContain('Comparaison automatique des critères ciblés avant et après l\'intervention.');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS (12 septembre 2026) — chaque mutation posée, lancée, remise (empreinte sha256 identique).
//   C1 condition du masque à `false` (la carte toujours rendue)                          → 3 rouges (bloc 1 ×2, bloc 4)
//   C2 garde du conteneur levée (`if (true)` : la liste vide s'écrit)                    → 1 rouge (le stock)
//   C3 objectif réécrit à '' quand son champ est absent (le code de 1.137.0)             → 1 rouge (le stock)
//   C4 l'ancien sous-titre du bilan d'une rencontre                                      → 1 rouge
//   C5 condition du masque à `true` (la carte masquée pour tout le monde)                → 3 rouges (bloc 2 ×2, témoin)
// 13 septembre 2026 (#847, exemples gris) — même procédure :
//   C6 l'ancien exemple de l'objectif (« Amener Structure au seuil D (65%) »)            → 1 rouge (bloc 2)
//   C7 l'ancien exemple du titre (« Intervention Rigueur et Nuance »)                    → 1 rouge (bloc 2)
