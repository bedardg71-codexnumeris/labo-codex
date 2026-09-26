/**
 * SENTINELLE — LOT A DE L'ENREGISTREMENT : EN ANONYMISATION, ON ÉCRIT, ET AUCUNE SUBSTITUTION N'ARRIVE
 * DANS LES VRAIES DONNÉES (26 sept. 2026, décision D5 de Grégoire : « Je choisis A »).
 *
 * Avant : `sauvegarderDonneesSelonMode` rendait `false` en anonymisation (« Bloquer toute écriture »).
 * L'évaluation faite en anonymisation restait visible pendant la séance, puis disparaissait au
 * rechargement, sans un mot. Maintenant : l'écriture part, après `retirerSubstitutionsAnonymisation`,
 * qui retire ce que l'anonymisation met à la lecture — « Élève N » (prénom, texte), « Gr. A »
 * (groupe), les marqueurs `daReel` / `etudiantDAReel` / `groupeReel`.
 *
 * Mesure : modes.js RÉEL, chargé en 'use strict'. Les valeurs de substitution sont produites par les
 * vraies fonctions d'anonymisation (`obtenirDonneesSelonMode`, `anonymiserTexteRetroaction`), puis
 * réécrites comme le font les écrans (rétroaction pré-remplie, « Bonjour Élève N ! » généré depuis la
 * liste anonymisée, tableau relu par `obtenirDonneesSelonMode`). Noms fictifs (règle du 22 sept.).
 *
 * Break-tests attendus :
 *   - rétablir `return false` en tête de `sauvegarderDonneesSelonMode` → A rouge ;
 *   - retirer l'appel à `retirerSubstitutionsAnonymisation` → B, C, D rouges ;
 *   - retirer le rendu des prénoms (`_desanonymiserChaines`) → B rouge (texte) ;
 *   - retirer la restauration du groupe (`_estGroupeSubstitue`) → B rouge (groupe).
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const ELEVES = [
    { da: '3000001', nom: 'Fictif', prenom: 'Aurore', groupe: '00001' },
    { da: '3000002', nom: 'Inventé', prenom: 'Basile', groupe: '00002' }
];
const cloner = (v) => JSON.parse(JSON.stringify(v));

function monter(mode, extra = {}) {
    const store = Object.assign({ modeApplication: mode, test_groupeEtudiants: cloner(ELEVES) }, extra);
    const ecrits = [];
    const db = {
        getSync: (k, d) => (k in store ? cloner(store[k]) : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = cloner(v); ecrits.push(k); },
        removeSync: (k) => { delete store[k]; },
        get: async () => null, set: async () => {}
    };
    const win = { addEventListener() {}, removeEventListener() {}, obtenirTrimestreId: () => 'test', cle: (k) => (k.startsWith('test_') ? k : 'test_' + k) };
    chargerScript('js/modes.js', { db, cle: win.cle, echapperHtml: (s) => String(s), toggleDisplay() {}, obtenirPreference: () => null, notifications: { erreur() {}, succes() {} } }, win);
    return { win, store, ecrits };
}

const toutLeTexte = (v) => JSON.stringify(v);

describe('Lot A · A — en anonymisation, l\'écriture part', () => {
    it('sauvegarderDonneesSelonMode rend true et écrit la clé namespacée', () => {
        const { win, store, ecrits } = monter('anonymisation', { test_evaluationsSauvegardees: [] });
        const r = win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', [{ id: 'E1', etudiantDA: '3000001', etudiantNom: 'Aurore Fictif', retroactionFinale: 'Bien.' }]);
        expect(r).toBe(true);
        expect(ecrits).toContain('test_evaluationsSauvegardees');
        expect(store.test_evaluationsSauvegardees.map(e => e.id)).toEqual(['E1']);
    });
});

describe('Lot A · B — une évaluation construite depuis l\'écran anonymisé arrive en base avec les vraies valeurs', () => {
    it('nom, groupe, « Bonjour Élève N ! » et la rétroaction pré-remplie : aucune substitution écrite', () => {
        const existante = { id: 'E_EXIST', etudiantDA: '3000002', etudiantNom: 'Basile Inventé', groupe: '00002',
            retroactionFinale: 'Basile, ta thèse est claire. Aurore t\'a aidé ?' };
        const { win, store } = monter('anonymisation', { test_evaluationsSauvegardees: [existante] });

        // Ce que les écrans lisent en anonymisation.
        const eleves = win.obtenirDonneesSelonMode('groupeEtudiants');
        const aurore = eleves.find(e => e.da === '3000001');
        expect(aurore.prenom).toMatch(/^Élève \d+$/);          // témoin : la lecture substitue bien
        expect(aurore.groupe).toMatch(/^Gr\. [A-Z]$/);
        const evals = win.obtenirDonneesSelonMode('evaluationsSauvegardees');
        const texteAffiche = win.anonymiserTexteRetroaction(existante.retroactionFinale, '3000002');
        expect(texteAffiche).not.toContain('Basile');            // témoin : l'écran ne montre pas le prénom

        // Ce qu'ils réécrivent : l'existante relue anonymisée, sa rétroaction telle qu'affichée ;
        // une nouvelle bâtie comme `_construireNouvelleEvaluationAutoSave` et `_rendreAdresseEtudiant`.
        evals[0].retroactionFinale = texteAffiche + ' Relu.';
        evals.push({ id: 'E_NEUVE', etudiantDA: aurore.da, etudiantNom: aurore.prenom + ' ' + aurore.nom,
            groupe: aurore.groupe, retroactionFinale: `\nBonjour ${aurore.prenom} !\n\nBon travail.`,
            criteres: [{ critereId: 'C1', retroaction: `${aurore.prenom}, développe.` }] });
        expect(win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', evals)).toBe(true);

        const ecrit = store.test_evaluationsSauvegardees;
        expect(toutLeTexte(ecrit)).not.toMatch(/Élève \d+|Gr\. [A-Z]|ANONYME|etudiantDAReel|etudiantDAffichage/);
        const neuve = ecrit.find(e => e.id === 'E_NEUVE');
        expect(neuve.etudiantNom).toBe('Aurore Fictif');
        expect(neuve.groupe).toBe('00001');
        expect(neuve.retroactionFinale).toBe('\nBonjour Aurore !\n\nBon travail.');
        expect(neuve.criteres[0].retroaction).toBe('Aurore, développe.');
        const exist = ecrit.find(e => e.id === 'E_EXIST');
        expect(exist.etudiantNom).toBe('Basile Inventé');
        expect(exist.groupe).toBe('00002');
        expect(exist.retroactionFinale).toBe('Basile, ta thèse est claire. Aurore t\'a aidé ? Relu.');
    });

    it('un « Élève N » dont le numéro n\'est dans aucun mapping reste tel quel', () => {
        const { win, store } = monter('anonymisation', { test_evaluationsSauvegardees: [] });
        win.obtenirDonneesSelonMode('groupeEtudiants');           // pose le mapping (numéros 1 et 2)
        win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', [{ id: 'E1', etudiantDA: '3000001', etudiantNom: 'Aurore Fictif', retroactionFinale: 'Comme Élève 99 dans le roman.' }]);
        expect(store.test_evaluationsSauvegardees[0].retroactionFinale).toBe('Comme Élève 99 dans le roman.');
    });
});

describe('Lot A · C — la liste d\'élèves et les présences relues anonymisées reviennent intactes', () => {
    it('groupeEtudiants : relue par obtenirDonneesSelonMode puis réécrite = la liste d\'origine', () => {
        const { win, store } = monter('anonymisation');
        const lus = win.obtenirDonneesSelonMode('groupeEtudiants');
        win.sauvegarderDonneesSelonMode('groupeEtudiants', lus);
        const parDA = (l) => cloner(l).sort((a, b) => a.da.localeCompare(b.da));
        expect(parDA(store.test_groupeEtudiants)).toEqual(parDA(ELEVES));
    });

    it('presences : les nom / prénom / daReel / daAffichage ajoutés à la lecture ne sont pas écrits', () => {
        const presences = [{ date: '2026-09-01', da: '3000001', periodesPresentes: 2, notes: 'Arrivée en retard' }];
        const { win, store } = monter('anonymisation', { test_presences: cloner(presences) });
        const lus = win.obtenirDonneesSelonMode('presences');
        expect(lus[0].prenom).toMatch(/^Élève \d+$/);            // témoin
        win.sauvegarderDonneesSelonMode('presences', lus);
        expect(store.test_presences).toEqual(presences);
    });
});

describe('Lot A · D — témoin : en mode normal, la garde ne touche à rien', () => {
    it('un texte qui contient « Élève 1 » s\'écrit tel quel en mode normal', () => {
        const { win, store } = monter('normal', { test_mapping_anonymisation: { 3000001: { nom: '', prenom: 'Élève 1', nomComplet: 'Élève 1', numero: 1, ordreAffichage: 0 } } });
        win.sauvegarderDonneesSelonMode('evaluationsSauvegardees', [{ id: 'E1', etudiantDA: '3000001', etudiantNom: 'Élève 1', groupe: 'Gr. A', retroactionFinale: 'Élève 1' }]);
        expect(store.test_evaluationsSauvegardees[0]).toEqual({ id: 'E1', etudiantDA: '3000001', etudiantNom: 'Élève 1', groupe: 'Gr. A', retroactionFinale: 'Élève 1' });
    });
});
