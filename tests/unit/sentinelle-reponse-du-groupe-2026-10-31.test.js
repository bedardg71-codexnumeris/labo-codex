/**
 * SENTINELLE — LA RÉPONSE DU GROUPE (décisions de Grégoire des 30 et 31 oct. 2026).
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-30-reponse-du-groupe.md.
 *
 *   cd tests && npx vitest run unit/sentinelle-reponse-du-groupe-2026-10-31.test.js
 *
 * Banc : `bac-suivi.js`, comme la sentinelle du niveau. Ligne du banc : D, 65. Break-tests : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { tranche } from './_helpers/tranche.js';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const DA = (i) => '30000' + String(i).padStart(2, '0');
const ECHELLE = { id: 'E_N', nom: 'Échelle du banc', seuilSuffisance: 'D', seuilMaitrise: 'M',
    niveaux: [{ code: 'I', nom: 'I', min: 0, max: 64, valeurCalcul: 40 }, { code: 'D', nom: 'D', min: 65, max: 74, valeurCalcul: 65 },
        { code: 'M', nom: 'M', min: 75, max: 84, valeurCalcul: 80 }, { code: 'E', nom: 'E', min: 85, max: 100, valeurCalcul: 100 }] };
const GRILLE = { id: 'G1', nom: 'Dépistage', criteres: [
    { id: 'c1', nom: 'Structure', ponderation: 50, niveauSOLO: 'multistructurel' },
    { id: 'c2', nom: 'Nuance', ponderation: 50, niveauSOLO: 'relationnel' }] };

/** `eleves` : { P, copies, statut }. `prefs` : les préférences enregistrées. `minimum` : le minimum de la pratique. */
function banc(eleves, { prefs = {}, minimum = 0 } = {}) {
    const store = storeBase();
    store.test_echellesTemplates = [ECHELLE];
    store.test_grillesTemplates = [GRILLE];
    const nb = Math.max(1, ...eleves.map((e) => (e.copies || []).length));
    store.test_productions = Array.from({ length: nb }, (_, i) => ({ id: 'P' + i, titre: 'P' + i, type: 'artefact-portfolio', dateEcheance: '2026-08-30' }));
    store.test_groupeEtudiants = eleves.map((e, i) => ({ da: DA(i), nom: 'Nom' + i, prenom: 'P', groupe: '01', coursId: 'GC1', statut: e.statut || 'actif' }));
    store.test_evaluationsSauvegardees = eleves.flatMap((e, i) => (e.copies || []).map((note, c) => ({
        id: `C${i}-${c}`, etudiantDA: DA(i), productionId: 'P' + c, noteFinale: note, verrouillee: true, coursId: 'GC1', echelleId: ECHELLE.id, grilleId: 'G1',
        dateEvaluation: `2026-09-${String(c + 1).padStart(2, '0')}T12:00:00.000Z`, ponderationCouverte: 100,
        criteres: [{ critereId: 'c1', critereNom: 'Structure', niveauSelectionne: e.structure || 'M' }, { critereId: 'c2', critereNom: 'Nuance', niveauSelectionne: 'M' }]
    })));
    const indices = (da) => {
        const e = eleves[store.test_groupeEtudiants.findIndex((f) => f.da === da)] || {};
        return { A: e.A === undefined ? 100 : e.A, C: 100, P: e.P === undefined ? 0 : e.P, noteConstructible: true };
    };
    const b = monter(store, {
        prefs: { grilleReferenceDepistage: 'G1', ...prefs },
        modules: ['js/entites/production-diagnostique.js', 'js/entites/signalement-depistage.js', 'js/evaluation-projection.js', 'js/contexte-qualification.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-calculs.js',
            { chemin: 'js/etudiants.js', internes: ['compterEvaluationsPourMinimum'] },
            { chemin: 'js/tableau-bord-apercu.js', internes: ['genererCarteReponseDuGroupe', 'genererInterpretationRai'] }],
        globaux: { designerPratiqueActive: () => ({ etat: 'ok', famille: 'standards' }), obtenirTypePratiqueActive: () => 'standards', calculerTousLesIndices: indices,
            obtenirConfigPratiqueActive: () => (minimum ? { portfolio: { minimumCompletion: minimum } } : {}),
            obtenirEchelleResolue: (id) => (id === ECHELLE.id ? JSON.parse(JSON.stringify(ECHELLE)) : null),
            resoudreModeleParId: (t, id) => { const l = t === 'echelle' ? [ECHELLE] : [GRILLE]; return JSON.parse(JSON.stringify(l.find((m) => m.id === id) || null)); },
            obtenirTermeProduction: () => 'artefacts', accordTermeProduction: () => 'évalués', chargerSeuilsInterpretation: () => ({}), obtenirSeuil: () => 0.7, obtenirNombreProductionsPourPatterns: () => 3 }
    });
    b.win.pluriel = (n, un, plusieurs) => (n > 1 ? plusieurs : un);
    b.win.obtenirIdsPoolStdDuCorpus = (prods) => prods.map((p) => p.id);
    const lectures = () => eleves.map((_, i) => b.win.determinerNiveauRaiPedagogique(DA(i)));
    const carte = (l = lectures()) => b.interne['tableau-bord-apercu.js'].genererCarteReponseDuGroupe(l);
    return { win: b.win, store, lectures, carte };
}
const ACTIVE = { prefs: { afficherReponseDuGroupe: true } };
const texte = (html) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const lecture = (niveau, noteAffichee = niveau === 1) => ({ niveau, noteAffichee });
const repete = (n, niveau, note) => Array.from({ length: n }, () => lecture(niveau, note));

describe('§ 0 — éteinte, aucune lecture du groupe', () => {
    const FAIBLE = [{ P: 40, copies: [40] }, { P: 50, copies: [50] }, { P: 55, copies: [55] }];

    it('sans geste, la carte ne s\'affiche pas, même pour un groupe entier sous la ligne', () => {
        expect(banc(FAIBLE).carte()).toBe('');
        expect(banc(FAIBLE, { prefs: { afficherReponseDuGroupe: false } }).carte()).toBe('');
        expect(lire('js/preferences.js')).toMatch(/afficherReponseDuGroupe: false,/);
    });

    it('aucune préférence écrite sans geste : le chargement du panneau lit, seul le geste écrit', () => {
        const v2 = lire('js/preferences-v2.js');
        expect(tranche(v2, 'function chargerReponseDuGroupe(', '\n    }\n')).not.toContain('definirPreference');
        expect(tranche(v2, 'function sauvegarderPreferencesV2', '\n    }\n')).not.toContain('afficherReponseDuGroupe');
    });
});

describe('§ 1 — le réglage, dans l\'ordre décidé', () => {
    const html = lire('index.html');

    it('les seuils, puis ce qu\'ils donnent, puis le choix d\'activer', () => {
        const seuils = html.indexOf('id="v2-seuil-bon"');
        const donnent = html.indexOf('id="v2-voir-seuils"');
        const choix = html.indexOf('id="v2-pref-reponse-groupe"');
        expect(seuils).toBeGreaterThan(0);
        expect(donnent).toBeGreaterThan(seuils);
        expect(choix).toBeGreaterThan(donnent);
    });

    it('le texte validé, mot pour mot', () => {
        const bloc = tranche(html, 'id="v2-pref-reponse-groupe"', '</small>').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
        expect(bloc).toContain('Afficher la réponse du groupe');
        expect(bloc).toContain('Tes seuils placent chaque étudiant·e à un niveau. Activé, ce réglage compare la répartition de ton groupe au repère de la RàI (environ 80 % au niveau 1). Un écart dit que le groupe demande un enseignement universel renforcé, quelle qu\'en soit la cause.');
    });

    it('la case attend le geste « Voir », sauf si elle est déjà activée : elle doit pouvoir s\'éteindre', () => {
        expect(html).toMatch(/id="v2-pref-reponse-groupe" disabled/);
        expect(tranche(lire('js/preferences-v2.js'), 'function chargerReponseDuGroupe(', '\n    }\n')).toContain('choix.disabled = !choix.checked');
    });

    it('le nombre, la part, les sources et la sensibilité, sur la vraie règle du niveau', () => {
        const { win } = banc([
            { P: 90, copies: [90] }, // niveau 1
            { P: 68, copies: [68] }, // niveau 1 à 65 ; sous la ligne à 70
            { P: 62, copies: [62] }, // niveau 2 à 65 ; niveau 1 à 60
            { P: 50, copies: [50], structure: 'I' }, // niveau 3 : fondation
            { P: 10, copies: [10], statut: 'inactif' } // hors du groupe (#745)
        ]);
        const r = win.ceQueTesSeuilsDonnent();
        expect(r.effectif).toBe(4);
        expect(r.ligne).toBe(65);
        expect(r.comptes).toEqual({ 1: 2, 2: 1, 3: 1 });
        expect(r.parts[1]).toBe(50);
        expect(r.sources[2]).toEqual({ 'sous-la-ligne': 1 });
        expect(r.sources[3]).toEqual({ 'sous-la-ligne-fondation': 1 });
        expect(r.sensibilite.haut).toEqual({ seuil: 70, dePlus: 1 });
        expect(r.sensibilite.bas).toEqual({ seuil: 60, deMoins: 1 });
    });

    it('« Non-participation » est une source du niveau 3, sans note affichée', () => {
        const { win } = banc([{ P: 90, copies: [90] }, { P: 0, copies: [], A: 90 }]);
        const r = win.ceQueTesSeuilsDonnent();
        expect(r.sources[3]).toEqual({ 'non-participation': 1 });
        expect(r.comptes).toEqual({ 1: 1, 2: 0, 3: 1 });
    });

    it('chaque motif des niveaux 2 et 3 a son nom dans le réglage', () => {
        const noms = tranche(lire('js/preferences-v2.js'), 'const NOM_DE_LA_SOURCE = {', '};');
        for (const motif of ['sous-la-ligne', 'sous-la-ligne-fondation', 'persistante', 'persistante-avant-la-note', 'diagnostic', 'non-participation']) {
            expect(noms).toContain(`'${motif}':`);
        }
    });

    it('la sensibilité simule : elle ne touche ni l\'échelle ni le niveau affiché', () => {
        const b = banc([{ P: 68, copies: [68] }]);
        const avant = JSON.stringify(b.store.test_echellesTemplates);
        expect(b.win.determinerNiveauRaiPedagogique(DA(0), 70).niveau).toBe(2);
        expect(b.win.determinerNiveauRaiPedagogique(DA(0)).niveau).toBe(1);
        expect(JSON.stringify(b.store.test_echellesTemplates)).toBe(avant);
    });

    it('la sensibilité suit aussi « Difficulté persistante » : le seuil déplacé la déplace', () => {
        const b = banc([{ P: 90, copies: [68] }]); // note au-dessus ; derniers résultats à 68
        expect(b.win.determinerNiveauRaiPedagogique(DA(0)).niveau).toBe(1);
        expect(b.win.determinerNiveauRaiPedagogique(DA(0), 70)).toMatchObject({ niveau: 2, motif: 'persistante' });
    });

    it('rien n\'y propose un seuil tiré des résultats', () => {
        const fonction = tranche(lire('js/profil-etudiant-calculs.js'), 'function ceQueTesSeuilsDonnent(', '\n}\n');
        expect(fonction).not.toMatch(/moyenne|ecartType|percentile|suggest|propos/i);
        expect(fonction).toContain('ligne + 5');
        expect(fonction).toContain('ligne - 5');
    });
});

describe('§ 2 — la carte, le réglage activé', () => {
    const { carte } = banc([{ P: 90, copies: [90] }], ACTIVE);

    it('sous 70 % au niveau 1 : la phrase validée, et les deux barres', () => {
        const html = carte([...repete(69, 1, true), ...repete(31, 2, true)]);
        expect(texte(html)).toContain('69 % de ton groupe est au niveau 1. Ce groupe demande un enseignement universel renforcé, quelle qu\'en soit la cause : le parcours des étudiant·es, l\'enseignement, ou les deux.'.replace('69 %', '69 %'));
        expect(html.match(/class="reponse-groupe-barre[ "]/g)).toHaveLength(2);
        expect(html).toContain('width: 69%');
        expect(html).toContain('width: 80%');
        expect(html).toContain('width: 15%');
        expect(html).toContain('width: 5%');
    });

    it('à 70 %, la répartition est proche du repère : le seuil est strict, sur le chiffre écrit', () => {
        const a70 = texte(carte([...repete(70, 1, true), ...repete(30, 2, true)]));
        expect(a70).toContain('70 % de ton groupe est au niveau 1. La répartition est proche du repère de la RàI.');
        expect(a70).not.toContain('renforcé');
        // 69,6 s'écrit 70 : la phrase ne dit pas « 70 % » et « renforcé » ensemble.
        const arrondi = texte(carte([...repete(696, 1, true), ...repete(304, 2, true)]));
        expect(arrondi).toContain('70 % de ton groupe');
        expect(arrondi).not.toContain('renforcé');
    });

    it('la note validée, mot pour mot', () => {
        expect(texte(carte([lecture(1)]))).toContain('Le repère 80-15-5 est une heuristique de la RàI, pas une proportion mesurée au collégial. Il situe le groupe, il ne juge ni les étudiant·es ni l\'enseignant·e.');
    });

    it('« En attente » : hors des pourcentages, compté à part', () => {
        const html = texte(carte([...repete(8, 1, true), ...repete(2, 2, true), ...repete(15, 0, false)]));
        expect(html).toContain('80 % de ton groupe est au niveau 1');
        expect(html).toContain('15 étudiant·es en attente de la note du cours, hors des pourcentages.');
        expect(texte(carte([lecture(1), lecture(0, false)]))).toContain('1 étudiant·e en attente de la note du cours');
    });

    it('avant toute note, aucune comparaison : personne ne peut encore être au niveau 1', () => {
        const html = carte([...repete(3, 2, false), ...repete(22, 0, false)]);
        expect(html).not.toContain('renforcé');
        expect(html).not.toContain('reponse-groupe-barre');
        expect(texte(html)).toContain('la comparaison attend');
        expect(texte(html)).toContain('22 étudiant·es en attente');
    });

    it('le banc complet : sous le minimum de la pratique, la carte attend', () => {
        const b = banc([{ P: 40, copies: [40] }, { P: 80, copies: [80] }], { ...ACTIVE, minimum: 4 });
        expect(b.lectures().every((l) => !l.noteAffichee)).toBe(true);
        expect(b.carte()).not.toContain('renforcé');
    });

    it('un groupe vide : pas de carte', () => {
        expect(carte([])).toBe('');
    });

    it('elle ne change le niveau de personne, et vit dans le rendu de la barre RàI', () => {
        const apercu = lire('js/tableau-bord-apercu.js');
        expect(apercu).toContain('${genererCarteReponseDuGroupe(lecturesDuGroupe)}');
        expect(tranche(apercu, 'function genererCarteReponseDuGroupe(', '\n}\n')).not.toMatch(/db\.|definirPreference|setSync/);
        const b = banc([{ P: 40, copies: [40] }, { P: 90, copies: [90] }], ACTIVE);
        const avant = b.lectures().map((l) => l.niveau);
        b.carte();
        expect(b.lectures().map((l) => l.niveau)).toEqual(avant);
    });
});

describe('§ 2 — une seule constante', () => {
    it('le 70 est nommé une fois, lu par la carte et par l\'Aide', () => {
        const contexte = lire('js/contexte-qualification.js');
        expect(contexte).toMatch(/const SEUIL_NIVEAU_1_REPONSE_DU_GROUPE = 70;/);
        const apercu = tranche(lire('js/tableau-bord-apercu.js'), 'function genererCarteReponseDuGroupe(', '\n}\n');
        expect(apercu).toContain('window.SEUIL_NIVEAU_1_REPONSE_DU_GROUPE');
        expect(apercu).not.toMatch(/\b70\b/);
        const aide = lire('index.html');
        expect(tranche(aide, 'id="accordeon-aide-rai"', 'id="accordeon-aide-patterns"')).toContain('Sous <span data-seuil-reponse-groupe></span> au niveau 1');
        expect(contexte).toContain('[data-seuil-reponse-groupe]');
    });

    it('le repère 80-15-5 : une seule source pour la barre', () => {
        expect(lire('js/contexte-qualification.js')).toMatch(/REPERE_RAI_DU_GROUPE = Object\.freeze\(\{ 1: 80, 2: 15, 3: 5 \}\)/);
        expect(tranche(lire('js/tableau-bord-apercu.js'), 'function genererCarteReponseDuGroupe(', '\n}\n')).toContain('window.REPERE_RAI_DU_GROUPE');
    });
});

describe('§ 3 — l\'Aide et le guide ne disent plus l\'ancienne phrase', () => {
    it('la carte RàI dit la réponse du groupe : facultative, éteinte au départ', () => {
        const carteRai = tranche(lire('index.html'), 'id="accordeon-aide-rai"', 'id="accordeon-aide-patterns"').replace(/&nbsp;/g, ' ');
        expect(carteRai).toContain('La réponse du groupe est facultative et éteinte au départ');
        expect(carteRai).toContain('« Afficher la réponse du groupe » (Labo → Outils d\'observation)');
        expect(carteRai).not.toContain('sous la barre RàI');
    });

    it('le guide RàI non plus', () => {
        expect(lire('js/guides-pedagogiques.js')).not.toContain('Quand la moyenne du groupe');
    });
});

/*
 * BREAK-TESTS (31 oct. 2026), chaque changement du code annulé après sa mesure ; rouges de cette sentinelle et de celle du niveau :
 *   défaut activé : 1 ; carte sans le réglage : 1 ; seuil à 75 : 2 ; seuil non strict : 1 ; seuil sur la part brute : 1
 *   attente dans le dénominateur : 1 ; sans la garde avant toute note : 2 ; aUneNote toujours vrai : 2 ; noteAffichee toujours vraie : 1
 *   exclus dans le réglage : 1 ; sensibilité à 10 points, en haut : 2, en bas : 2 ; simulation sans la persistante : 2 ; sans la ligne : 1
 *   repère changé : 2 ; carte hors du rendu : 1 ; texte validé retouché : 1 ; case libre au départ : 1 ; case activée qu'on ne peut éteindre : 1
 *   chargement qui écrit : 1 ; phrase de groupe revenue : 1 ; Aide au chiffre écrit en dur : 1 ; phrase validée retouchée : 1 ; note validée retouchée : 1
 *   motif non-participation perdu : 1
 */
