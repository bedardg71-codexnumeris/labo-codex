/**
 * SENTINELLE — LOT 4 DU CADRAGE 11 (11 septembre 2026) : PROFILS INDIVIDUELS.
 *
 * Ce que ce banc verrouille, section par section de la consigne du jour :
 *
 *   B · #752 — les graphiques lisent l'échelle de CHAQUE évaluation (la conversion du
 *       dépistage, `scoreCritereEvaluation` + `tableConversionPourEvaluation`), rien d'inventé :
 *       (a) une échelle A/B/C à valeurs 50 / 70 / 90 trace 50 / 70 / 90 — pas de trou ;
 *       (b) « 3 » sur une échelle en points sur 30 trace 10, pas 75 (l'ancien « ≤ 4 → sur 4 ») ;
 *       (c) un niveau sans valeur → point absent, compté, et le mot du graphique ;
 *       (d) l'échelle de Grégoire (0 / 40 / 65 / 75 / 100) trace LES MÊMES courbes qu'avant —
 *           valeurs figées depuis HEAD c816d0cc, et la capture du pack démo (20 profils, 945 points,
 *           105 courbes de trajectoires, identiques avant/après, scratchpad du 11 sept.) ;
 *       (e) les zones du fond viennent de l'échelle majoritaire des évaluations tracées ;
 *       (f) les trajectoires par habileté passent par la même conversion (plus de table en dur).
 *   C · P-2 — les six cases du rapport s'écrivent par trimestre (`cle()`), au geste seulement.
 *   D · les trois gestes exportés sans bouton sont partis ; le panneau d'indice mort aussi ;
 *       D.1 la case « Services adaptés » reflète `etudiant.sa` (cochée / décochée, non modifiable,
 *           catégorie visible seulement pour « Oui ») et Enregistrer n'écrit plus `servicesAdaptes` ;
 *           l'export anonymisé lit `sa` ;
 *       D.2 le « Portrait de lecteur » n'existe plus (page, module, infobulle) et Enregistrer
 *           n'écrit plus de champ `portrait*`.
 *   A · #754 — le module profil n'observe plus la sous-section, active la sous-section en levant le
 *       drapeau du crochet de navigation.js, et la Liste n'appelle plus `afficherSousSection` avant
 *       le profil (le comportement — un rendu, texte conservé — est prouvé au navigateur par
 *       tests/integration/profil-754-un-seul-rendu.spec.js).
 *   F · la rangée HISTORIQUE du profil n'utilise plus une classe jamais définie.
 *
 * Break-tests montrés (11 sept.) : (a)/(d) remettre `return 40` pour « I » dans
 * `scoreCritereEvaluation` → (d) rougit ; retirer `disabled = true` dans ouvrirModalConfidentiel →
 * D.1 rougit ; remettre `sauvegarderPreferencesRapport(da)` dans genererEtAfficherRapport → C rougit.
 *
 *   cd tests && npx vitest run unit/sentinelle-lot4-profils-individuels-752-754.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';
import { suitDansLaFonction } from './_helpers/tranche.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
function listerJs(dossier) {
    const out = [];
    for (const entree of readdirSync(dossier)) {
        const complet = path.join(dossier, entree);
        if (statSync(complet).isDirectory()) out.push(...listerJs(complet));
        else if (entree.endsWith('.js') && entree !== 'pack-demo-10.js') out.push(complet);
    }
    return out;
}
const SOURCES = () => [...listerJs(path.join(RACINE, 'js')), path.join(RACINE, 'index.html')]
    .map((f) => ({ fichier: path.relative(RACINE, f), code: sansCommentaires(readFileSync(f, 'utf8')) }));

const DA = '2000001';
const E_GREGOIRE = { id: 'EG', nom: 'IDME et niv 0', seuilMaitrise: 'M', niveaux: [
    { code: '0', nom: 'Aucun', min: 0, max: 0, valeurCalcul: 0, couleur: '#999999' },
    { code: 'I', nom: 'Insuffisant', min: 0, max: 64.99, valeurCalcul: '40', couleur: '#aa0000' },
    { code: 'D', nom: 'En développement', min: 65, max: 74.99, valeurCalcul: '65', couleur: '#aa8800' },
    { code: 'M', nom: 'Maîtrisé', min: 75, max: 84.99, valeurCalcul: '75', couleur: '#00aa00' },
    { code: 'E', nom: 'Étendu', min: 85, max: 100, valeurCalcul: '100', couleur: '#0000aa' }
] };
const E_ABC = { id: 'EABC', nom: 'Trois paliers', seuilMaitrise: 'B', niveaux: [
    { code: 'A', nom: 'À reprendre', min: 0, max: 59, valeurCalcul: 50, couleur: '#aa0000' },
    { code: 'B', nom: 'Atteint', min: 60, max: 84, valeurCalcul: 70, couleur: '#00aa00' },
    { code: 'C', nom: 'Dépassé', min: 85, max: 100, valeurCalcul: 90, couleur: '#0000aa' }
] };
// Une échelle dont « B » n'a PAS de valeur ponctuelle (#529 : la table ne porte pas ce code).
const E_TROUEE = { id: 'ETR', nom: 'B sans valeur', seuilMaitrise: 'B', niveaux: [
    { code: 'A', nom: 'À reprendre', min: 0, max: 59, valeurCalcul: 50, couleur: '#aa0000' },
    { code: 'B', nom: 'Atteint', min: 60, max: 84, valeurCalcul: '', couleur: '#00aa00' },
    { code: 'C', nom: 'Dépassé', min: 85, max: 100, valeurCalcul: 90, couleur: '#0000aa' }
] };

function evaluation(id, pid, echelleId, critere, date) {
    return { id, etudiantDA: DA, productionId: pid, coursId: 'GC1', echelleId, dateEvaluation: date, noteFinale: 70,
        criteres: [Object.assign({ critereId: 'c1', critereNom: 'Structure', ponderation: 100 }, critere)] };
}
function monterGraphiques(store, opts = {}) {
    const globaux = Object.assign({ obtenirTermeProduction: () => 'artefact', obtenirInterventionsEtudiant: () => [], toggleDisplay() {} }, opts.globaux || {});
    return monter(store, Object.assign({}, opts, {
        modules: ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-rapport.js', 'js/profil-etudiant-confidentiel.js',
            { chemin: 'js/graphiques-progression.js', internes: ['obtenirDonneesCriteres', 'moyenneCriteresHabiletes', 'genererZonesDepuisEchelle', 'echelleMajoritaireDesEvaluations', '_messageSansValeurConvertible'] }],
        globaux, objetsExportes: ['profilActuelDA', 'etudiantsListeCache']
    }));
}
function storeGraphiques(echelles, evaluations) {
    const store = storeBase();
    store.test_productions = [{ id: 'P1', nom: 'Un' }, { id: 'P2', nom: 'Deux' }, { id: 'P3', nom: 'Trois' }, { id: 'P4', nom: 'Quatre' }, { id: 'P5', nom: 'Cinq' }];
    store.test_echellesTemplates = echelles;
    store.test_evaluationsSauvegardees = evaluations;
    return store;
}

describe('B · #752 — les graphiques lisent l\'échelle de chaque évaluation', () => {
    it('(a) une échelle A/B/C à valeurs 50 / 70 / 90 trace 50 / 70 / 90 — pas de trou', () => {
        const b = monterGraphiques(storeGraphiques([E_ABC], [
            evaluation('E1', 'P1', 'EABC', { niveauSelectionne: 'A' }, '2026-02-01'),
            evaluation('E2', 'P2', 'EABC', { niveauSelectionne: 'B' }, '2026-03-01'),
            evaluation('E3', 'P3', 'EABC', { niveauSelectionne: 'c' }, '2026-04-01')   // la casse ne compte pas
        ]));
        const d = b.interne['graphiques-progression.js'].obtenirDonneesCriteres(DA);
        expect(d.criteres.Structure).toEqual([50, 70, 90]);
        expect(d.sansValeurConvertible).toEqual({ evaluations: 0, points: 0 });
    });

    it('(b) « 3 » sur un critère en points sur 30 trace 10, pas 75 ; 21 sur 30 trace 70, pas 21', () => {
        const b = monterGraphiques(storeGraphiques([E_GREGOIRE], [
            evaluation('E1', 'P1', 'EG', { niveauSelectionne: 'I', points: 3, ponderation: 30 }, '2026-02-01'),
            evaluation('E2', 'P2', 'EG', { niveauSelectionne: 'D', points: 21, ponderation: 30 }, '2026-03-01'),
            evaluation('E3', 'P3', 'EG', { niveauSelectionne: 'M', points: 0, ponderation: 30 }, '2026-04-01')   // zéro point = zéro, pas « absent »
        ]));
        const d = b.interne['graphiques-progression.js'].obtenirDonneesCriteres(DA);
        expect(d.criteres.Structure).toEqual([10, 70, 0]);
    });

    it('(c) un niveau sans valeur dans son échelle → point absent, compté, et le graphique le dit ; un critère vide n\'est ni tracé ni compté', () => {
        const b = monterGraphiques(storeGraphiques([E_TROUEE, E_ABC], [
            evaluation('E1', 'P1', 'ETR', { niveauSelectionne: 'A' }, '2026-02-01'),
            evaluation('E2', 'P2', 'ETR', { niveauSelectionne: 'B' }, '2026-03-01'),       // B sans valeur
            evaluation('E3', 'P3', 'ETR', { niveauSelectionne: '' }, '2026-04-01'),        // non évalué
            evaluation('E4', 'P4', 'EABC', { niveauSelectionne: 'Z' }, '2026-05-01'),      // code inconnu de l'échelle
            evaluation('E5', 'P5', 'INCONNUE', { niveauSelectionne: 'A' }, '2026-06-01')   // échelle qui ne se résout pas (deux échelles : on ne devine pas)
        ]));
        const g = b.interne['graphiques-progression.js'];
        const d = g.obtenirDonneesCriteres(DA);
        expect(d.criteres.Structure).toEqual([50, null, null, null, null]);
        expect(d.sansValeurConvertible).toEqual({ evaluations: 3, points: 3 });
        expect(g._messageSansValeurConvertible(d.sansValeurConvertible)).toBe('3 évaluations sans valeur convertible dans cette échelle');
        expect(g._messageSansValeurConvertible({ evaluations: 1, points: 2 })).toBe('1 évaluation sans valeur convertible dans cette échelle');
        expect(g._messageSansValeurConvertible({ evaluations: 0, points: 0 })).toBe('');
    });

    it('(d) l\'échelle de Grégoire (0 / 40 / 65 / 75 / 100) trace les MÊMES courbes qu\'avant — non-régression figée depuis HEAD c816d0cc', () => {
        const b = monterGraphiques(storeGraphiques([E_GREGOIRE], [
            evaluation('E1', 'P1', 'EG', { niveauSelectionne: 'I' }, '2026-02-01'),
            evaluation('E2', 'P2', 'EG', { niveauSelectionne: 'D' }, '2026-03-01'),
            evaluation('E3', 'P3', 'EG', { niveauSelectionne: 'M' }, '2026-04-01'),
            evaluation('E4', 'P4', 'EG', { niveauSelectionne: 'E' }, '2026-05-01'),
            evaluation('E5', 'P5', 'EG', { niveauSelectionne: '0' }, '2026-06-01')
        ]));
        const g = b.interne['graphiques-progression.js'];
        const d = g.obtenirDonneesCriteres(DA);
        expect(d.criteres.Structure).toEqual([40, 65, 75, 100, 0]);   // exactement ce que la table en dur rendait
        expect(d.criteres.Structure.every(Number.isInteger)).toBe(true);   // 0,65 × 100 n'est pas 65,00000000000001
        // (f) les trajectoires par habileté : la même conversion, sans table en dur
        const dec = b.store.test_evaluationsSauvegardees.map((e) => g.moyenneCriteresHabiletes(e, new Set(['Structure']), new Map()));
        expect(dec).toEqual([0.4, 0.65, 0.75, 1, 0]);
        expect(sansCommentaires(lire('js/graphiques-progression.js'))).not.toMatch(/niveauHabiletesVersDecimal|return 0\.65;|return 65;|num \/ 4|noteNum \/ 4/);
    });

    it('(e) les zones du fond viennent de l\'échelle majoritaire des évaluations tracées, et disent combien d\'échelles coexistent', () => {
        const b = monterGraphiques(storeGraphiques([E_GREGOIRE, E_ABC], [
            evaluation('E1', 'P1', 'EABC', { niveauSelectionne: 'A' }, '2026-02-01'),
            evaluation('E2', 'P2', 'EABC', { niveauSelectionne: 'B' }, '2026-03-01'),
            evaluation('E3', 'P3', 'EG', { niveauSelectionne: 'M' }, '2026-04-01'),
            evaluation('E4', 'P4', 'FANTOME', { niveauSelectionne: 'M' }, '2026-05-01')   // ne se résout pas : ne compte ni comme échelle ni comme majorité
        ]));
        const g = b.interne['graphiques-progression.js'];
        const d = g.obtenirDonneesCriteres(DA);
        expect(d.echelles.echelle.id).toBe('EABC');
        expect(d.echelles).toMatchObject({ nb: 2, total: 4, distinctes: 2 });
        expect(g.genererZonesDepuisEchelle(d.echelles.echelle).map((z) => z.code)).toEqual(['A', 'B', 'C']);
        // #860 (16 sept.) : sans échelle, aucune zone — plus de repli sur celle du trimestre.
        expect(g.genererZonesDepuisEchelle()).toEqual([]);
        // Aucune échelle résolue : pas de zones inventées.
        expect(g.echelleMajoritaireDesEvaluations([{ echelleId: 'FANTOME' }])).toEqual({ echelle: null, nb: 0, total: 1, distinctes: 0 });
    });
});

describe('C · P-2 — les cases du rapport, par trimestre et au geste', () => {
    it('le rendu n\'écrit rien ; le geste écrit sous <trim>_preferencesRapport ; la clé est au registre et connue de diagnostic-353', () => {
        const store = storeBase();
        const b = monterGraphiques(store, { elements: { ['inclure-jetons-' + DA]: elementDom({ checked: false }), ['textarea-rapport-' + DA]: elementDom({ value: '' }) },
            globaux: { calculerTousLesIndices: () => ({ A: 90, C: 100, P: 77, noteConstructible: true }), obtenirDetailsAssiduite: () => ({ periodesPresentes: 18, periodesTotal: 20, nbSeances: 10, taux: 90 }), evaluationEntreDansLaNote: () => true, obtenirIdsProductionsEvaluables: () => [], obtenirPratiqueActive: () => null } });
        b.win.restaurerPreferencesRapport(DA);   // ce que le post-rendu appelle
        b.win.genererEtAfficherRapport(DA);
        expect(Object.keys(store).filter((k) => /rapport/i.test(k))).toEqual([]);
        b.win.cocherSectionRapport(DA);
        expect(Object.keys(store).filter((k) => /rapport/i.test(k))).toEqual(['test_preferencesRapport']);
        expect(store.test_preferencesRapport.jetons).toBe(false);
        expect(sansCommentaires(lire('js/profil-etudiant-rapport.js'))).not.toMatch(/db\.(setSync|getSync)\('preferencesRapport'/);
        expect(lire('js/trimestres.js')).toMatch(/'preferencesRapport',/);
        expect(lire('scripts/diagnostic-353-cles-orphelines.js')).toMatch(/'preferencesRapport'\]/);
        expect((lire('js/profil-etudiant-rapport.js').match(/data-on-change="cocherSectionRapport"/g) || []).length).toBe(6);
    });
});

describe('D · les gestes sans bouton sont partis, le volet confidentiel suit la liste', () => {
    it('les trois gestes exportés sans bouton et le panneau d\'indice sans conteneur ne sont plus nulle part (js/, index.html — chaîne comprise)', () => {
        const noms = ['supprimerEvaluationDepuisProfil', 'attribuerJetonPersonnaliseAvecPrompt', 'retirerJetonPersonnaliseAvecConfirmation', 'toggleDetailIndice', 'fermerDetailIndice', 'panneau-details-indice'];
        const restes = [];
        for (const { fichier, code } of SOURCES()) for (const nom of noms) if (code.includes(nom)) restes.push(fichier + ' : ' + nom);
        expect(restes).toEqual([]);
    });

    it('D.1 · la case « Services adaptés » reflète `sa` de la liste des étudiant·es — cochée, non modifiable, catégorie visible — et Enregistrer n\'écrit plus `servicesAdaptes`', () => {
        const store = storeBase();
        store.test_groupeEtudiants[0].sa = 'Oui';
        store.test_confidentielEtudiants = { [DA]: { notes: 'n', servicesAdaptes: false, categorie: 'apprentissage' } };
        const bascules = [];
        const details = elementDom({ id: 'confidentiel-services-details' });
        const b = monterGraphiques(store, { elements: { 'confidentiel-services-details': details }, globaux: { toggleDisplay: (el, afficher) => { bascules.push([el.id, afficher]); } } });
        bascules.length = 0;   // d'autres modules basculent des boutons au chargement ; seul le volet compte ici
        b.win.ouvrirModalConfidentiel(DA);
        const caseSA = b.document.getElementById('confidentiel-services-adaptes');
        expect(caseSA).toMatchObject({ checked: true, disabled: true });
        expect(bascules).toEqual([['confidentiel-services-details', true]]);
        b.win.sauvegarderConfidentiel();
        expect(store.test_confidentielEtudiants[DA]).not.toHaveProperty('servicesAdaptes');
        expect(store.test_confidentielEtudiants[DA].categorie).toBe('apprentissage');
        // « Non » : décochée, diagnostic masqué.
        store.test_groupeEtudiants[0].sa = 'Non';
        bascules.length = 0;
        b.win.ouvrirModalConfidentiel(DA);
        expect(caseSA).toMatchObject({ checked: false, disabled: true });
        expect(bascules).toEqual([['confidentiel-services-details', false]]);
        // La page : la case est en lecture et le dit ; l'export anonymisé lit `sa`.
        expect(lire('index.html')).toMatch(/id="confidentiel-services-adaptes" disabled>[\s\S]{0,200}d'après la liste des étudiant·es/);
        expect(sansCommentaires(lire('js/trimestres.js'))).toMatch(/services_adaptes: e\.sa === 'Oui' \|\| e\.sa === true/);
        expect(sansCommentaires(lire('js/trimestres.js'))).not.toMatch(/e\.servicesAdaptes/);
    });

    it('D.2 · le « Portrait de lecteur » n\'existe plus (page, module, infobulle) et Enregistrer n\'écrit aucun champ `portrait*`', () => {
        const store = storeBase();
        store.test_confidentielEtudiants = { [DA]: { notes: 'n', portraitStructure: 'M', portraitNuance: 'D' } };
        const b = monterGraphiques(store);
        b.win.ouvrirModalConfidentiel(DA);
        b.win.sauvegarderConfidentiel();
        expect(Object.keys(store.test_confidentielEtudiants[DA]).filter((k) => /^portrait/.test(k))).toEqual([]);
        expect(b.win.aDesInfosConfidentielles(DA)).toBe(true);   // la note suffit ; le portrait n'est plus un critère
        const restes = [];
        // Les identifiants, la clé d'infobulle et le champ de stock — pas la prose (le changelog en parle, l'historique reste).
        for (const { fichier, code } of SOURCES()) if (fichier !== 'js/changelog-data.js' && /confidentiel-portrait-|profil-conf-lecteur|portraitStructure/.test(code.replace(/<!--[\s\S]*?-->/g, ''))) restes.push(fichier);
        expect(restes).toEqual([]);
    });
});

describe('A · #754 et F — ce que le code du profil ne fait plus', () => {
    it('A · plus d\'observateur de sous-section dans le module profil ; la sous-section s\'active sous le drapeau du crochet ; la Liste et le Suivi du groupe n\'appellent plus afficherSousSection avant le profil', () => {
        const profil = sansCommentaires(lire('js/profil-etudiant-sections-affichage.js'));
        expect(profil).not.toMatch(/new MutationObserver/);
        expect(suitDansLaFonction(profil, /function _activerSousSectionProfil\(\)/, /window\._profilAutoChargement = true;/, /afficherSousSection\('suivi-profil'\)/)).toBe(true);   // #616 : ordre dans la fonction, plus une distance
        expect((profil.match(/afficherSousSection\('suivi-profil'\)/g) || []).length).toBe(1);
        const ligneListe = sansCommentaires(lire('js/etudiants.js')).match(/tr\.onclick = function \(\) \{[\s\S]{0,300}?\};/)[0];
        expect(ligneListe).toMatch(/afficherProfilComplet\(etudiant\.da\)/);
        expect(ligneListe).not.toMatch(/afficherSousSection/);
        const suivi = sansCommentaires(lire('js/tableau-bord-apercu.js'));
        expect(suivi).not.toMatch(/afficherSousSection\('suivi-profil'\)/);
    });

    it('F · la rangée HISTORIQUE (titre à gauche, bouton « + Nouvelle intervention » à droite) n\'utilise plus une classe jamais définie', () => {
        const profil = lire('js/profil-etudiant-sections-affichage.js');
        const css = lire('styles.css');
        expect(profil).not.toMatch(/u-flex-between-mb10/);
        const rangee = profil.match(/<div class="([^"]+)">\s*<h4[^>]*data-tooltip="profil-historique"/);
        expect(rangee, 'la rangée HISTORIQUE').not.toBeNull();
        for (const classe of rangee[1].split(/\s+/)) expect(css, 'classe définie : ' + classe).toMatch(new RegExp('^\\.' + classe.replace(/[-]/g, '\\-') + '\\s*\\{', 'm'));
        expect(rangee[1].split(/\s+/)).toEqual(['u-flex-between', 'u-mb-10']);
    });
});
