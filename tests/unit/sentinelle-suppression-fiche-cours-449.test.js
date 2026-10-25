import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { chargerScript } from './_helpers/charger-script.js';

// =======================================================================
// SENTINELLE #449 — la suppression d'une fiche de cours est GARDÉE
// =======================================================================
//
// Décision de Grégoire (11 août 2026, porte 3.2), livrée le 19 août : la
// Bibliothèque de cours porte un menu ⋮ avec le réversible (« Retirer de
// ma sélection ») ET le définitif (« Supprimer la fiche », tous
// trimestres) — et le définitif n'existe QUE gardé par un recensement.
// Avant, `supprimerCoursV2` (Cadre) supprimait la fiche sur simple confirm
// et laissait orphelins groupes-cours, productions, évaluations et
// présences (famille #154).
//
// Ce qui est verrouillé ici :
//   A. le recensement voit la fiche, les références par clé et les
//      effectifs des groupes-cours dépendants ;
//   B. REFUS si une clé de DONNÉES référence le cours (productions…) —
//      aucune confirmation demandée, rien n'est écrit ;
//   C. REFUS si un groupe-cours dépendant porte des évaluations ;
//   D. REFUS si des captures hebdomadaires (snapshots) existent pour un
//      groupe-cours dépendant ;
//   E. cas supprimable (groupes-cours vides seulement) : refuser la
//      confirmation n'écrit rien ;
//   F. confirmer supprime TOUS les exemplaires de l'id (doublons #442
//      compris), retire les groupes-cours vides, nulifie `infoCours` s'il
//      pointait la fiche — et ne touche JAMAIS les items d'un autre cours ;
//   G. les quatre fonctions sont réellement EXPORTÉES (leçon du 10 août :
//      un garde sur un nom absent n'échoue pas, il absorbe) ;
//   H. statique — `supprimerCoursV2` passe par le garde partagé et ne
//      contient plus d'écriture directe du magasin `cours` ;
//   I. statique — le menu ⋮ porte les deux libellés, distincts.

function creerDb(store, journal) {
    return {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { journal.push(['setSync', k]); store[k] = v; },
        get: async (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        set: async (k, v) => { journal.push(['set', k]); store[k] = v; },
        remove: async (k) => { journal.push(['remove', k]); delete store[k]; },
        keys: async () => Object.keys(store),
        flush: async () => {}
    };
}

function charger(store, { confirmReponse = false } = {}) {
    const journal = [];
    const alertes = [];
    const confirms = [];
    const win = chargerScript('js/cours.js', {
        db: creerDb(store, journal),
        echapperHtml: (s) => String(s),
        genererIdUnique: (p) => p + 'X1',
        notifications: { succes() {}, erreur() {}, info() {} },
        BibliothequeUI: { fermerModal() {}, creerFenetreListe() {}, ajouterOptgroupDemo() {} },   // #1159
        // #678 (12 oct. 2026) : le refus parle par la fenêtre d'information de l'application ;
        // `alertes` recueille son titre et son message. Le natif lève : il ne doit plus servir.
        uiDialogues: { informer: (o) => { alertes.push(String(o.titre) + ' ' + String(o.message)); return Promise.resolve(); } },
        alert: () => { throw new Error('alert() natif appelé (#678)'); },
        confirm: (m) => { confirms.push(String(m)); return confirmReponse; }
    });
    return { win, journal, alertes, confirms, store };
}

const FICHE = { id: 'C1', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature', dansBibliotheque: true };
const DOUBLON_442 = { id: 'C1', codeCours: '601-101-MQ', titre: 'copie legacy' };
const AUTRE = { id: 'C2', codeCours: '601-102-MQ', nomCours: 'Littérature et imaginaire', dansBibliotheque: true };

describe('#449 · suppression de fiche de cours gardée par recensement', () => {

    it('A · le recensement voit la fiche, les références et les effectifs', async () => {
        const { win } = charger({
            cours: [FICHE, AUTRE],
            h2026_groupesCours: [{ id: 'GC1', coursId: 'C1', groupeNum: '00008' }, { id: 'GC9', coursId: 'C2' }],
            h2026_groupeEtudiants: [{ da: '1', groupeCoursId: 'GC1' }, { da: '2', groupeCoursId: 'GC9' }],
            h2026_evaluationsSauvegardees: [{ id: 'E1', coursId: 'C1' }]
        });

        const plan = await win.recenserDependancesCours('C1');

        expect(plan.fiches).toHaveLength(1);
        expect(plan.refs.map(r => r.cle).sort()).toEqual(['h2026_evaluationsSauvegardees', 'h2026_groupesCours']);
        expect(plan.porteDonnees.map(r => r.cle)).toEqual(['h2026_evaluationsSauvegardees']);
        expect(plan.risqueGC).toHaveLength(1);
        expect(plan.risqueGC[0].nbEtu).toBe(1);   // GC9 (autre cours) n'est pas compté
        expect(plan.risqueGC[0].nbEval).toBe(1);
    });

    it('B · REFUS si une clé de données référence le cours — rien écrit, pas de confirm', async () => {
        const { win, journal, alertes, confirms } = charger({
            cours: [FICHE],
            h2026_productions: [{ id: 'P1', coursId: 'C1' }]
        });

        const fait = await win.supprimerFicheCoursAvecGarde('C1');

        expect(fait).toBe(false);
        expect(confirms).toHaveLength(0);                       // jamais demandé
        expect(journal).toHaveLength(0);                        // rien écrit
        expect(alertes.join(' ')).toMatch(/Impossible de supprimer/);
        expect(alertes.join(' ')).toMatch(/h2026_productions : 1 élément/);
    });

    it('C · REFUS si un groupe-cours dépendant porte des évaluations', async () => {
        const { win, journal, alertes } = charger({
            cours: [FICHE],
            h2026_groupesCours: [{ id: 'GC1', coursId: 'C1', groupeNum: '00008' }],
            h2026_evaluationsSauvegardees: [{ id: 'E1', coursId: 'C1' }]
        });

        const fait = await win.supprimerFicheCoursAvecGarde('C1');

        expect(fait).toBe(false);
        expect(journal).toHaveLength(0);
        expect(alertes.join(' ')).toMatch(/groupe 00008/);
    });

    it('D · REFUS si des snapshots existent pour un groupe-cours dépendant', async () => {
        const { win, journal, alertes } = charger({
            cours: [FICHE],
            h2026_groupesCours: [{ id: 'GC1', coursId: 'C1' }],
            h2026_snapshots_GC1: { semaines: [] }
        });

        const fait = await win.supprimerFicheCoursAvecGarde('C1');

        expect(fait).toBe(false);
        expect(journal).toHaveLength(0);
        expect(alertes.join(' ')).toMatch(/h2026_snapshots_GC1/);
    });

    it('E · cas supprimable : refuser la confirmation n\'écrit rien', async () => {
        const { win, journal, confirms } = charger({
            cours: [FICHE],
            h2026_groupesCours: [{ id: 'GC1', coursId: 'C1' }]
        }, { confirmReponse: false });

        const fait = await win.supprimerFicheCoursAvecGarde('C1');

        expect(fait).toBe(false);
        expect(confirms).toHaveLength(1);
        expect(confirms[0]).toMatch(/TOUS les trimestres/);
        expect(journal).toHaveLength(0);
    });

    it('F · confirmer supprime tous les exemplaires, les GC vides, le pointeur — jamais l\'autre cours', async () => {
        const { win, journal, store } = charger({
            cours: [FICHE, DOUBLON_442, AUTRE],
            h2026_groupesCours: [{ id: 'GC1', coursId: 'C1' }, { id: 'GC9', coursId: 'C2' }],
            a2026_groupesCours: [{ id: 'GC2', coursId: 'C1' }],
            infoCours: { id: 'C1' }
        }, { confirmReponse: true });

        const fait = await win.supprimerFicheCoursAvecGarde('C1');

        expect(fait).toBe(true);
        expect(store.cours).toEqual([AUTRE]);                          // doublons #442 partis ensemble
        expect(store.h2026_groupesCours).toEqual([{ id: 'GC9', coursId: 'C2' }]);  // l'autre cours intact
        expect(store.a2026_groupesCours).toEqual([]);                  // tous trimestres
        expect(store.infoCours).toBe(null);                            // pointeur nulifié
        expect(journal.some(j => j[0] === 'setSync' && j[1] === 'cours')).toBe(true);
    });

    it('G · les quatre fonctions sont réellement exportées', () => {
        const { win } = charger({ cours: [] });
        expect(typeof win.recenserDependancesCours).toBe('function');
        expect(typeof win.supprimerFicheCoursAvecGarde).toBe('function');
        expect(typeof win.supprimerFicheCours).toBe('function');
        expect(typeof win.retirerCoursDeBibliotheque).toBe('function');
    });

    it('H · statique — supprimerCoursV2 passe par le garde, plus d\'écriture directe du magasin', () => {
        const source = readFileSync(new URL('../../js/trimestre-v2-cours.js', import.meta.url), 'utf-8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/[^\n]*/g, '');
        // Corps ancré en début de ligne (leçon du 10 août : tout motif s'ancre).
        const corps = source.match(/^async function supprimerCoursV2[\s\S]*?\n\}/m);
        expect(corps).not.toBeNull();
        expect(corps[0]).toMatch(/supprimerFicheCoursAvecGarde/);
        expect(corps[0]).not.toMatch(/setSync\(\s*['"]cours['"]/);
    });

    it('I · statique — le menu ⋮ porte les deux libellés, distincts', () => {
        const source = readFileSync(new URL('../../js/cours.js', import.meta.url), 'utf-8')
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/\/\/[^\n]*/g, '');
        // #1159 (lot 6) — réancré : le réversible s'appelle « Mettre de côté » (mot validé par Grégoire,
        // 25 oct., 16 h 56) ; même action.
        expect(source).toMatch(/label: 'Mettre de côté'/);
        // Deux entrées « Supprimer la fiche » : la liste ET « Mis de côté ».
        expect(source.match(/label: 'Supprimer la fiche'/g)).toHaveLength(2);
        // Le réversible n'est PAS stylé en danger ; le définitif l'est.
        expect(source).toMatch(/\{ label: 'Mettre de côté', action: 'retirerCoursDeBibliotheque', param: cours\.id \}/);
        expect(source).toMatch(/'Supprimer la fiche', action: 'supprimerFicheCours', param: cours\.id, classe: 'btn-supprimer'/);
    });
});
