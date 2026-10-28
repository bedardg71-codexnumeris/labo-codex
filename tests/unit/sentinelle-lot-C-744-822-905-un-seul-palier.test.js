/**
 * SENTINELLE DU LOT C du cadrage du 16 sept. 2026 (lot 31, 17 sept. 2026) — #744, #822, #905.
 *
 * ── CE QUE CE BANC PROTÈGE ─────────────────────────────────────────────────────────────────────────
 *  A · #744 — UN SEUL PALIER. La carte RàI (`determinerNiveauRaiPedagogique`) donne SEULE le palier
 *      d'intervention. Le suivi des fondations (`diagnostiquerSuiviApprentissage`) décrit la persistance
 *      et ne rend plus de palier ; son diagnostic « IPB = 1, → ou ↘ » s'appelle « Difficulté récente »
 *      (mot de Grégoire). « Difficulté émergente » reste le pattern de la carte, et lui seul.
 *      ⮕ Le cas réel de bout en bout (une seule copie faible : IPB 1, carte niveau 3, cible 3) est
 *      l'essai D4 de `audit-onglet-suivi-2026-09-05.test.js`, réancré par ce lot. Ici : les écrans du
 *      groupe (filtres, bilan) et le verrou structurel.
 *  B · #822 — le palier « Insuffisant » du contexte d'apprentissage est retiré ; aucune borne ne bouge.
 *  C · #905 — un brouillon ne lève pas de signalement de dépistage ; la même copie enregistrée en lève un.
 *
 * ── DES ESSAIS DE COMPORTEMENT (erreur 16 de Cowork) ───────────────────────────────────────────────
 * Une mutation qui garde le texte exigé et change le calcul doit rougir : A2 pose un suivi qui PORTE un
 * palier contradictoire (1) face à une carte qui dit 3, et exige que filtres et tri suivent la carte.
 *
 *   cd tests && npx vitest run unit/sentinelle-lot-C-744-822-905-un-seul-palier.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
function fichiersJs(dossier) {
    return readdirSync(path.join(RACINE, dossier)).flatMap((n) => {
        const rel = dossier + '/' + n;
        if (statSync(path.join(RACINE, rel)).isDirectory()) return fichiersJs(rel);
        return n.endsWith('.js') && n !== 'changelog-data.js' ? [rel] : [];
    });
}

/* =============================================================================================
   A · #744 — les écrans du groupe suivent la carte RàI ; le suivi dit « Difficulté récente »
   ============================================================================================= */
const INTERNES_TB = ['calculerEtudiantsPrioritaires', 'appliquerFiltres', '_filtresActifs', '_tousEtudiantsEnrichis', '_etudiantsPrioritaires', 'genererInterpretationSuiviFondamentaux'];
// Trois élèves du store de base. La CARTE et le SUIVI se contredisent exprès :
//   Assidu  : carte 1 ; suivi IPB 3 « Difficulté persistante » portant un palier pirate 3
//   Absent  : carte 3 ; suivi IPB 1 « Difficulté récente »    portant un palier pirate 1   ← le cas de la consigne
//   Silence : carte 2 ; aucun suivi
const CARTE = { '2000001': { niveau: 1, pattern: 'Stable' }, '2000002': { niveau: 3, pattern: 'Difficulté persistante' }, '2000003': { niveau: 2, pattern: 'Difficulté émergente' } };
const SUIVI = {
    '2000001': { diagnostic: 'Difficulté persistante', ipb: 3, direction: '→', scoreActuel: 0.4, niveauRaI: 3, niveau: 3 },
    '2000002': { diagnostic: 'Difficulté récente', ipb: 1, direction: '→', scoreActuel: 0.4, niveauRaI: 1, niveau: 1 },
    '2000003': null
};
function monterGroupe() {
    const b = monter(storeBase(), {
        modules: ['js/contexte-qualification.js', { chemin: 'js/tableau-bord-apercu.js', internes: INTERNES_TB }],
        globaux: {
            calculerTousLesIndices: () => ({ A: 90, C: 100, P: 80, noteConstructible: true }),
            determinerNiveauRaiPedagogique: (da) => CARTE[da], diagnostiquerSuiviApprentissage: (da) => SUIVI[da],
            obtenirTypePratiqueActive: () => 'standards', obtenirTermeProduction: () => 'artefact', accordTermeProduction: (n) => n + ' artefact(s)',
            obtenirLabelNoteFinale: () => 'Note', obtenirCodePratique: () => 'STD', obtenirSeuil: () => 0.7
        }
    });
    const i = b.interne['tableau-bord-apercu.js'];
    i.calculerEtudiantsPrioritaires();
    return { b, i };
}
function filtrer(i, filtres) { i._filtresActifs = filtres; i.appliquerFiltres(); return i._etudiantsPrioritaires.map((e) => e.nom); }

describe('A · #744 — la carte RàI donne seule le palier, sur les écrans du groupe', () => {
    it('A1 · le banc n\'est pas vide : trois élèves enrichis, chacun avec le palier DE LA CARTE', () => {
        const { i } = monterGroupe();
        expect(i._tousEtudiantsEnrichis.map((e) => [e.nom, e.niveau])).toEqual([['Assidu', 1], ['Absent', 3], ['Silence', 2]]);
    });

    it('A2 · le filtre « RàI 2-3 » et son tri suivent la carte, même quand le suivi porte un palier contradictoire', () => {
        const { i } = monterGroupe();
        // Absent (carte 3, palier pirate du suivi 1) est retenu et sort premier ; Assidu (carte 1, palier pirate 3) est écarté.
        expect(filtrer(i, ['rai'])).toEqual(['Absent', 'Silence']);
    });

    it('A3 · le filtre « Suivi » lit la PERSISTANCE (IPB ≥ 2), pas un palier : il retient Assidu, que la carte dit niveau 1', () => {
        const { i } = monterGroupe();
        expect(filtrer(i, ['suivi'])).toEqual(['Assidu']);
        expect(filtrer(i, ['suivi', 'rai'])).toEqual([]);   // intersection : personne n'a IPB ≥ 2 ET carte ≥ 2
    });

    it('A4 · le bilan des fondamentaux compte « Difficulté récente » et l\'écrit « récente » ; il ne dit plus « émergente »', () => {
        const { i } = monterGroupe();
        const bilan = i.genererInterpretationSuiviFondamentaux();
        expect(bilan).toContain('2 (100\u00A0%) en difficulté sur les fondamentaux (1 récente, 1 persistante)');
        expect(bilan).not.toMatch(/mergente/);
        // Un diagnostic resté à l'ancien mot ne serait PLUS compté : c'est ce qui rougit si un site garde « émergente ».
        i._tousEtudiantsEnrichis[1].suivi = { diagnostic: 'Difficulté émergente', ipb: 1 };
        expect(i.genererInterpretationSuiviFondamentaux()).toContain('1 (50\u00A0%) en difficulté sur les fondamentaux (1 persistante)');
    });

    it('A5 · verrou structurel : plus aucun `niveauRaI` dans le code de js/, et le mot du suivi vit à un seul endroit', () => {
        const tous = fichiersJs('js');
        expect(tous.length).toBeGreaterThan(100);   // la tranche lue n'est pas vide
        const lecteurs = tous.filter((f) => /niveauRaI/.test(sansCommentaires(lire(f))));
        expect(lecteurs).toEqual([]);
        const calculs = sansCommentaires(lire('js/profil-etudiant-calculs.js'));
        const corpsSuivi = tranche(calculs, 'function diagnostiquerSuiviApprentissage(', 'function diagnostiquerForcesChallenges(', { longueurMin: 500 });
        expect(corpsSuivi).toContain('\'Difficulté récente\'');
        expect(corpsSuivi).not.toMatch(/mergente|niveau\s*:|niveau\s*=/);
        // La cible lit la carte : le palier qu'elle rend est une lecture de `determinerNiveauRaiPedagogique`, jamais du suivi.
        const corpsCible = tranche(calculs, 'function determinerCibleIntervention(', 'window.obtenirEchelleResolue', { longueurMin: 500 });
        expect(corpsCible).toMatch(/palierCarte\s*=\s*determinerNiveauRaiPedagogique\(da\)\.niveau/);
        expect(corpsCible).not.toMatch(/niveau\s*:\s*suivi\./);
    });

    it('A6 · l\'Aide dit ce que le code rend : huit diagnostics, « Difficulté récente », « Progression lente », plus de colonne « Niveau RàI »', () => {
        const html = lire('index.html');
        // ↻ #1152, lot 2c bis (28 oct. 2026) : le sous-titre « Comment interpréter les diagnostics ? » part avec le resserrement de la
        // carte, le tableau reste (audit du 24 oct., verdict final de `suivi-apprentissage` ; consigne
        // CONSIGNE-LOT-2026-10-28-aide-lot-2c-bis-suivi.md, §2, entrée 7) : la tranche part de l'entrée elle-même.
        const table = tranche(html, 'id="accordeon-aide-suivi-apprentissage"', '</table>', { longueurMin: 500 });
        const calculs = lire('js/profil-etudiant-calculs.js');
        const rendus = [...tranche(calculs, 'function diagnostiquerSuiviApprentissage(', 'function diagnostiquerForcesChallenges(').matchAll(/diagnostic = '([^']+)'/g)].map((m) => m[1]);
        expect(rendus).toHaveLength(8);
        for (const mot of rendus) expect(table, 'absent du tableau de l\'Aide : ' + mot).toContain('<td>' + mot + '</td>');
        expect((table.match(/<tr><td>/g) || []).length).toBe(8);
        expect(table).not.toMatch(/Niveau RàI|mergente/);
    });
});

/* =============================================================================================
   B · #822 — « Insuffisant » retiré du contexte d'apprentissage, aucune borne ne bouge
   ============================================================================================= */
describe('B · #822 — le palier « Insuffisant » n\'existe plus', () => {
    // #821 (15 oct. 2026) : le palier dit sa phrase par les seuils du mécanisme 2 — `obtenirSeuil`
    // (interpretation-config.js, chargé avant lui dans index.html) doit exister, comme dans l'app.
    const db = { getSync: (k, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} };
    const win = chargerScript('js/interpretation-config.js', { db });
    chargerScript('js/contexte-qualification.js', { obtenirSeuil: win.obtenirSeuil }, win);

    it('B1 · comportement : tout ce qui n\'est pas « Modéré » est « Fragile », jusqu\'à 0 / 0 et jusqu\'à une valeur illisible', () => {
        const niveaux = [[0.9, 0.9], [0.8, 0.8], [0.7, 0.7], [0.64, 0.9], [0.9, 0.64], [0, 0], [NaN, 0.9]].map(([A, C]) => win.qualifierContexteApprentissage(A, C).niveau);
        expect(niveaux).toEqual(['tres-favorable', 'favorable', 'modere', 'fragile', 'fragile', 'fragile', 'fragile']);
    });

    it('B2 · aucune borne n\'a bougé (gel d\'octobre, #742) : 85 / 75 / 65, et la borne fixe 60 garde ses deux lecteurs', () => {
        expect(win.BORNES_CONTEXTE).toEqual({ tresFavorable: 0.85, favorable: 0.75, modere: 0.65 });
        expect(win.BORNE_FIXE_INSUFFISANT).toBe(0.60);
        expect(win.qualifierContexteApprentissage(0.65, 0.65).niveau).toBe('modere');
        expect(win.qualifierContexteApprentissage(0.649, 0.65).niveau).toBe('fragile');
    });

    it('B3 · le mot, le niveau et la classe sont partis du code et de la feuille de styles', () => {
        const code = sansCommentaires(lire('js/contexte-qualification.js'));
        expect(code).not.toMatch(/'insuffisant'|'Insuffisant'|Contexte insuffisant|badge-engagement-insuffisant/);
        expect(lire('styles.css')).not.toContain('badge-engagement-insuffisant');
        expect(lire('styles.css')).toContain('.badge-engagement-fragile');   // témoin : la feuille lue est la bonne
        const lecteurs = fichiersJs('js').filter((f) => /badge-engagement-insuffisant/.test(lire(f)));
        expect(lecteurs).toEqual([]);
    });
});

/* =============================================================================================
   C · #905 — un brouillon ne lève pas de signalement de dépistage
   ============================================================================================= */
function signalementReel() {
    const win = chargerScript('js/pratiques/pratique-registre.js');
    chargerScript('js/entites/signalement-depistage.js', {}, win);
    return { S: win.SignalementDepistage, win, registre: chargerScript('js/evaluation-projection.js').projectionAlgo };
}
function grilleQuiSignale(P) {
    return [{ id: 'G1', criteres: [{
        id: 'CR_LANGUE', nom: 'Maîtrise de la langue', type: 'algorithmique', modeleProjection: 'norme_externe',
        paramsProjection: { motsReference: 900, erreursTolerees: 30, nomServiceAide: '', lienServiceAide: '', libelleSignalement: 'À référer au centre d\'aide' },
        paliersProjection: P.paliersMigration().map((p) => ({ ...p, leveSignalement: p.cle === 'echec' }))
    }] }];
}
// 20 erreurs sur 300 mots : « Échec », sous le seuil. La MÊME copie, seul le verrou change.
const copie = (extra) => Object.assign({ id: 'E1', etudiantDA: '2000001', productionId: 'P1', grilleId: 'G1', noteFinale: 55,
    donneesAlgorithmiques: { CR_LANGUE: { codes: [], mots: 300, totalErreurs: 20 } } }, extra);

describe('C · #905 — le signalement lit la règle unique : un brouillon ne lève rien', () => {
    it('C1 · la copie enregistrée lève UN signalement ; la même en brouillon n\'en lève aucun ; une copie d\'avant le verrou compte comme avant', () => {
        const { S, registre } = signalementReel();
        const grilles = grilleQuiSignale(registre);
        const lever = (c) => S.pourEleve('2000001', { evaluations: [c], grilles, registre }).map((s) => s.libelle);
        expect(lever(copie({ verrouillee: true, ponderationCouverte: 100 }))).toEqual(['À référer au centre d\'aide']);
        expect(lever(copie({ verrouillee: false, ponderationCouverte: 100 }))).toEqual([]);
        expect(lever(copie({}))).toEqual(['À référer au centre d\'aide']);   // ni verrou ni portée déclarés (avant le 2 sept.)
    });

    it('C2 · comportement : le module lit le prédicat À L\'APPEL — le remplacer change le verdict du même brouillon', () => {
        const { S, win, registre } = signalementReel();
        const grilles = grilleQuiSignale(registre);
        const brouillon = copie({ verrouillee: false });
        expect(S.pourEleve('2000001', { evaluations: [brouillon], grilles, registre })).toHaveLength(0);
        win.evaluationEntreDansLaNote = () => true;
        expect(S.pourEleve('2000001', { evaluations: [brouillon], grilles, registre })).toHaveLength(1);
    });

    it('C3 · le module ne recopie pas la règle, et n\'applique toujours pas le filtre des quatre portes (#790)', () => {
        const code = sansCommentaires(lire('js/entites/signalement-depistage.js'));
        expect(code).toMatch(/window\.evaluationEntreDansLaNote\(e\)/);
        expect(code).not.toMatch(/remplaceeParId|verrouillee|ProductionDiagnostique|filtrerEvaluations/);
    });
});
