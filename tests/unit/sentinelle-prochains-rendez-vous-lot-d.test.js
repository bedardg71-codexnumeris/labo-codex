/**
 * SENTINELLE — « TES PROCHAINS RENDEZ-VOUS », EN TÊTE DE SUIVI › RENCONTRES
 * (consigne du 12 septembre 2026, révisée une seconde fois à 10 h 50, lot D ; mots arrêtés par Grégoire à 10 h 52).
 *
 * De l'AFFICHAGE seul : aucune donnée neuve, aucun réglage. Sur un service, les rencontres dont la date est ≥ aujourd'hui,
 * la plus proche en premier, quatre au plus ; une ligne = la date en toutes lettres, l'heure si elle est renseignée, le titre,
 * « individuelle » ou « en sous-groupe ». Aucune à venir → une phrase.
 *
 * ⚠ Ce que la mesure a corrigé de la consigne : elle désignait `afficherRencontres` comme point d'insertion. Or ouvrir une
 * rencontre remplace le conteneur, et le retour (comme tout Enregistrer / Supprimer) ne reconstruit que la liste : le bloc
 * y aurait disparu. Il est donc rendu PAR `afficherListeInterventions`, gardé par la vue Rencontres ET un service actif.
 * Décision nommée : sans aucune rencontre, pas de bloc — « Aucune rencontre. » suffit, et la phrase arrêtée (« … restent
 * dans la liste ci-dessous ») serait fausse sous une liste vide.
 *
 * VERROUILLÉ ICI (les quatre de la consigne, puis le reste) :
 *   1. trois rencontres (une passée, deux à venir) : le bloc montre les deux à venir, la plus proche en premier ; la liste du
 *      dessous les montre toutes les trois, la plus récente en premier ;
 *   2. hors service, et sur un service dans la vue Interventions : pas de bloc ;
 *   3. une rencontre née dans un AUTRE service n'apparaît pas ;
 *   4. aucune écriture ;
 *   5. quatre lignes au plus ; aucune à venir → la phrase arrêtée ; aucune rencontre → pas de bloc ;
 *   6. le mot de la forme vient de `type` (et du palier, comme le badge de la liste), lu dans VOCABULAIRES.rencontres ;
 *   7. le bloc suit la liste : refait à chaque rendu (ouvrir, puis revenir).
 *
 * BREAK-TESTS VÉRIFIÉS le 12 septembre 2026 — journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monter, storeBase } from './_helpers/bac-suivi.js';

const AUJOURDHUI = '2026-09-12';
const GLOBAUX = {
    determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
    calculerMoyennesCriteres: () => ({}), obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '', obtenirSeuil: () => 0.7,
    calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t, dateLocaleYMD: () => AUJOURDHUI,
    formaterDateComplete: (d) => 'JOUR(' + d + ')'
};
const rencontre = (id, date, extra) => Object.assign({ id, titre: 'R ' + id, date, heure: '', duree: 1, type: 'individuel', niveauRai: 3, contexte: 'hors-classe',
    description: '', etudiants: [], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [], objectifVise: '', bilan: null,
    statut: 'planifiee', jamaisSauvegardee: false, groupeCoursId: 'GC1' }, extra);
const TROIS = () => [
    rencontre('PASSEE', '2026-09-01'),
    rencontre('LOIN', '2026-09-20', { heure: '10:00', type: 'groupe', niveauRai: 2 }),
    rencontre('PROCHE', '2026-09-15'),
];

function banc({ service = true, vue = 'rencontres', interventions = TROIS() } = {}) {
    const store = storeBase();
    store.cours = [{ id: 'GC1', nature: service ? 'service' : 'cours', nomCours: service ? 'Aide' : 'Écriture' }];
    store.test_interventions = interventions;
    const b = monter(store, { modules: ['js/interventions.js'], globaux: GLOBAUX, aujourdhui: AUJOURDHUI });
    b.win.definirVocabulaireInterventions(vue);
    const idListe = vue === 'rencontres' ? 'listeRencontres' : 'listeInterventions';
    b.rendre = () => { b.win.afficherListeInterventions(); return b.document.getElementById(idListe).innerHTML; };
    return b;
}
const bloc = (html) => { const i = html.indexOf('id="prochainsRendezVous"'); if (i < 0) return null; return html.slice(i, html.indexOf('</div>', i)); };
const lignes = (b) => [...b.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1].replace(/\s+/g, ' ').trim());
const titresListe = (html) => [...html.matchAll(/<h4 class="intervention-titre" data-tooltip="interv-carte">([^<]*)<\/h4>/g)].map(m => m[1]);

// ─────────────────────────────────────────────────────────────────────────────
describe('1 · sur un service, les deux à venir, la plus proche en premier ; la liste garde son ordre', () => {
    it('le bloc : PROCHE puis LOIN, mots arrêtés ; la liste : LOIN, PROCHE, PASSEE', () => {
        const html = banc().rendre();
        const b = bloc(html);
        expect(b, 'le bloc est rendu').not.toBeNull();
        expect(b).toContain('Tes prochains rendez-vous');
        expect(lignes(b)).toEqual([
            '<strong>JOUR(2026-09-15)</strong> — R PROCHE · individuelle',
            '<strong>JOUR(2026-09-20)</strong> à 10:00 — R LOIN · en sous-groupe',
        ]);
        expect(html.indexOf('id="prochainsRendezVous"'), 'en tête : avant la première carte de la liste').toBeLessThan(html.indexOf('intervention-item'));
        expect(html.indexOf('data-action="afficherFormulaireIntervention"'), 'le bouton « + Nouvelle rencontre » reste le premier geste').toBeLessThan(html.indexOf('id="prochainsRendezVous"'));
        expect(titresListe(html)).toEqual(['R LOIN', 'R PROCHE', 'R PASSEE']);
    });
    it('aujourd\'hui compte comme à venir', () => {
        const b = bloc(banc({ interventions: [rencontre('AUJ', AUJOURDHUI), rencontre('HIER', '2026-09-11')] }).rendre());
        expect(lignes(b)).toEqual(['<strong>JOUR(2026-09-12)</strong> — R AUJ · individuelle']);
    });
});

describe('2 · pas de bloc hors service, ni dans la vue Interventions', () => {
    it('hors service (vue Interventions) : pas de bloc, la liste telle quelle', () => {
        const html = banc({ service: false, vue: 'interventions' }).rendre();
        expect(html).not.toContain('prochainsRendezVous');
        expect(html).not.toContain('Tes prochains rendez-vous');
        expect(titresListe(html)).toEqual(['R LOIN', 'R PROCHE', 'R PASSEE']);
    });
    it('sur un service, dans la vue Interventions : pas de bloc', () => {
        expect(banc({ service: true, vue: 'interventions' }).rendre()).not.toContain('prochainsRendezVous');
    });
    it('hors service, même dans la vue Rencontres : pas de bloc (la garde porte sur les deux conditions)', () => {
        expect(banc({ service: false, vue: 'rencontres' }).rendre()).not.toContain('prochainsRendezVous');
    });
});

describe('3 · une rencontre d\'un autre service n\'apparaît pas', () => {
    it('AILLEURS (GC2), à venir, est absente du bloc et de la liste', () => {
        const html = banc({ interventions: TROIS().concat([rencontre('AILLEURS', '2026-09-13', { groupeCoursId: 'GC2' })]) }).rendre();
        expect(html).not.toContain('R AILLEURS');
        expect(lignes(bloc(html))[0]).toContain('R PROCHE');
    });
});

describe('4 · aucune écriture', () => {
    it('rendre la liste deux fois n\'écrit rien en base', () => {
        const b = banc();
        const avant = JSON.stringify(b.store.test_interventions);
        b.rendre(); b.rendre();
        expect(b.journal.filter(e => /interventions/.test(e.k))).toEqual([]);
        expect(JSON.stringify(b.store.test_interventions)).toBe(avant);
    });
});

describe('5 · quatre lignes au plus ; aucune à venir ; aucune rencontre', () => {
    it('six à venir : les quatre plus proches', () => {
        const six = ['2026-09-30', '2026-09-13', '2026-09-25', '2026-09-14', '2026-09-20', '2026-09-16'].map((d, i) => rencontre('F' + i, d));
        expect(lignes(bloc(banc({ interventions: six }).rendre())).map(l => l.match(/JOUR\(([^)]+)\)/)[1]))
            .toEqual(['2026-09-13', '2026-09-14', '2026-09-16', '2026-09-20']);
    });
    it('même jour : l\'heure départage', () => {
        const deux = [rencontre('TARD', '2026-09-15', { heure: '15:00' }), rencontre('TOT', '2026-09-15', { heure: '09:00' })];
        expect(lignes(bloc(banc({ interventions: deux }).rendre())).map(l => l.match(/R (\w+)/)[1])).toEqual(['TOT', 'TARD']);
    });
    it('aucune à venir : la phrase arrêtée, pas de liste', () => {
        const b = bloc(banc({ interventions: [rencontre('PASSEE', '2026-09-01')] }).rendre());
        expect(b).toContain('Tes prochains rendez-vous');
        expect(b).toContain('Aucun rendez-vous à venir. Tes rencontres passées restent dans la liste ci-dessous.');
        expect(b).not.toContain('<li>');
    });
    it('aucune rencontre : pas de bloc, « Aucune rencontre. »', () => {
        const html = banc({ interventions: [] }).rendre();
        expect(html).not.toContain('prochainsRendezVous');
        expect(html).toContain('Aucune rencontre.');
    });
});

describe('6 · le mot de la forme vient de `type`, lu dans VOCABULAIRES.rencontres (pas une seconde écriture)', () => {
    it('le badge de la liste et la ligne du bloc disent la même forme', () => {
        const html = banc().rendre();
        expect(html).toContain('<span class="badge-type-intervention">En sous-groupe</span>');
        expect(html).toContain('<span class="badge-type-intervention">Individuelle</span>');
        const code = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'js', 'interventions.js'), 'utf8');
        expect(code.match(/'Individuelle'/g), 'le mot n\'est écrit qu\'une fois (VOCABULAIRES.rencontres.niveau3)').toHaveLength(1);
        expect(code.match(/'En sous-groupe'/g), 'idem pour niveau2').toHaveLength(1);
    });
});

describe('7 · le bloc suit la liste', () => {
    it('ouvrir une rencontre remplace le conteneur ; le retour à la liste refait le bloc', () => {
        const b = banc();
        b.document.getElementById('conteneurRencontres').innerHTML = '<div id="listeRencontres"></div>';
        b.rendre();
        b.win.ouvrirIntervention('PROCHE');
        expect(b.document.getElementById('conteneurRencontres').innerHTML, 'le formulaire a remplacé le conteneur').toContain('id="interventionTitre"');
        const retour = b.rendre();
        expect(bloc(retour), 'le bloc est revenu avec la liste').not.toBeNull();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS (12 septembre 2026) — chaque mutation posée dans js/interventions.js, lancée, remise (empreinte
// sha256 identique). La garde « hors service, vue Rencontres » a été AJOUTÉE avant ce journal : sans elle, D1 ne rougissait rien.
//   D1  la garde réduite à la vue Rencontres (sans `_surService()`)                         → 1 rouge
//   D2  aujourd'hui exclu (`>` au lieu de `>=`)                                              → 1 rouge
//   D3  le tri du bloc inversé                                                               → 4 rouges
//   D4  cinq lignes au lieu de quatre                                                        → 1 rouge
//   D5  la phrase arrêtée amputée (« Aucun rendez-vous à venir. »)                           → 1 rouge
//   D6  le bloc rendu APRÈS les cartes de la liste                                           → 1 rouge
//   D7  « Individuelle » réécrit en dur dans `_formeRencontre`                               → 1 rouge
//   D8  le bloc lit toutes les interventions (sans le filtre de contexte)                    → 1 rouge
//   D9  le bloc sauvegarde les interventions                                                 → 1 rouge
//   D10 le bloc rendu aussi sous une liste vide                                              → 1 rouge
