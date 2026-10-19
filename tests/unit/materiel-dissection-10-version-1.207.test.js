/**
 * « APPORTER MON MATÉRIEL », LA DISSECTION, VERSION 1.207 — les mots de la garde, et le refus du paquet `.lcz`.
 *
 * Consigne : plans de travail/CONSIGNE-LOT-2026-10-18-dissection-10-version-1.207.md (textes tranchés par
 * Grégoire, 18 oct., 20 h 08 ; le refus du `.lcz`, tranché par Cowork au verdict du lot 9b).
 *
 * Ce que ce banc verrouille :
 *   T — les mots de la garde (écran d'évaluation, refus d'enregistrer, synthèse) disent « points » pour une
 *       grille en points, « pondération » pour une grille en pourcentages ; singulier et pluriel.
 *   P — une grille qui porte un critère marqué « à compléter » ne part pas en `.lcz` : le refus nomme ses
 *       critères, AVANT la confirmation et le paquet ; une grille sans marque passe comme avant.
 *
 * Break-tests (faits le 18 oct.) : `enPoints` toujours faux dans `calculerPortee` → T.a et T.b rouges ; toujours
 * vrai → T.c et T.d rouges ;
 * le refus retiré de `exporterEntite` → P.c rouge ; la marque ignorée par `messageGrilleACompleter` → P.a,
 * P.b et P.c rouges.
 *
 * Grilles FICTIVES, jamais le texte d'une grille réelle.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

let grilleEntierementEnPoints;
let calcul;
let phrasesPorteeIncomplete;
beforeAll(() => {
    ({ grilleEntierementEnPoints } = chargerScript('js/gabarits-utils.js', {
        db: { getSync: (c, d) => (d !== undefined ? d : null), setSync() {}, get: async () => null, set: async () => {} },
        cle: (k) => 'test_' + k, echapperHtml: (t) => String(t == null ? '' : t)
    }));
    calcul = chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau: () => undefined, grilleEntierementEnPoints },
        { addEventListener() {}, removeEventListener() {} });
    phrasesPorteeIncomplete = calcul.phrasesPorteeIncomplete;
});

const VALEURS = { I: 40, D: 65, M: 80, E: 95 };
const portee = (criteres, niveaux) => calcul.calculerPortee(criteres, (c) => niveaux[c.id] || '', (c, n) => VALEURS[n]);
const critere = (id, nom, type, ponderation, marque) =>
    Object.assign({ id, nom, type, ponderation }, marque ? { ponderationACompleter: true } : {});

describe('T — les mots de la garde, en points ou en pondération', () => {
    it('T.a — une grille en points : « ses points », au singulier', () => {
        const p = portee([critere('C1', 'Idées fictives', 'analytique', 24), critere('C2', 'Nuances fictives', 'analytique', null, true)], { C1: 'M' });
        expect(p.enPoints).toBe(true);
        expect(phrasesPorteeIncomplete(p)).toEqual(['Pas de note tant qu\'un critère n\'a pas ses points : Nuances fictives. '
            + 'Donne-lui ses points dans Conception → Grilles de critères.']);
        expect(calcul.texteCriteresHorsNote(p)).toBe('sans points : Nuances fictives');
    });

    it('T.b — une grille en points : « Donne-leur leurs points », au pluriel', () => {
        const p = portee([critere('C1', 'Idées fictives', 'analytique', 24), critere('C2', 'A fictif', 'analytique', null, true),
            critere('C3', 'B fictif', 'analytique', null, true)], { C1: 'M' });
        expect(phrasesPorteeIncomplete(p)).toEqual(['Pas de note tant qu\'un critère n\'a pas ses points : A fictif, B fictif. '
            + 'Donne-leur leurs points dans Conception → Grilles de critères.']);
        expect(calcul.texteCriteresHorsNote(p)).toBe('sans points : A fictif, B fictif');
    });

    it('T.c — une grille en pourcentages : « sa pondération », au singulier comme au pluriel', () => {
        const un = portee([critere('C1', 'Idées fictives', 'holistique', 60), critere('C2', 'Nuances fictives', 'holistique', null, true)], { C1: 'M' });
        expect(un.enPoints).toBe(false);
        expect(phrasesPorteeIncomplete(un)).toEqual(['Pas de note tant qu\'un critère n\'a pas sa pondération : Nuances fictives. '
            + 'Donne-lui sa pondération dans Conception → Grilles de critères.']);
        expect(calcul.texteCriteresHorsNote(un)).toBe('sans pondération : Nuances fictives');
        const deux = portee([critere('C1', 'Idées fictives', 'holistique', 60), critere('C2', 'A fictif', 'holistique', null, true),
            critere('C3', 'B fictif', 'holistique', null, true)], { C1: 'M' });
        expect(phrasesPorteeIncomplete(deux)).toEqual(['Pas de note tant qu\'un critère n\'a pas sa pondération : A fictif, B fictif. '
            + 'Donne-leur leur pondération dans Conception → Grilles de critères.']);
    });

    it('T.d — une grille mixte n’est pas une grille en points : elle dit « pondération »', () => {
        const p = portee([critere('C1', 'Idées fictives', 'analytique', 60), critere('C2', 'Nuances fictives', 'holistique', null, true)], { C1: 'M' });
        expect(p.enPoints).toBe(false);
        expect(calcul.texteCriteresHorsNote(p)).toBe('sans pondération : Nuances fictives');
    });
});

/* ------------------------------------------------------------------ le paquet `.lcz` */

function chargerPartage(alertes, appels) {
    const w = chargerScript('js/partage-export.js', {
        db: { getSync: (k, d) => (d !== undefined ? d : null) },
        alert: (m) => alertes.push(m)
    });
    w.grilleEntierementEnPoints = grilleEntierementEnPoints;
    w.alert = (m) => alertes.push(m);
    // Le paquet ne doit même pas être rassemblé : tout appel ici est un échec du refus.
    w.partageFormat = { rassemblerDependances: () => { appels.push('rassembler'); return { entites: {}, references: [] }; } };
    return w;
}

describe('P — une grille à compléter ne part pas en .lcz', () => {
    it('P.a — en points : le message nomme les critères, au pluriel et au singulier', () => {
        const w = chargerPartage([], []);
        const deux = { id: 'g1', criteres: [critere('C1', 'Idées fictives', 'analytique', 24),
            critere('C2', 'A fictif', 'analytique', null, true), critere('C3', 'B fictif', 'analytique', null, true)] };
        expect(w.partageExport.messageGrilleACompleter(deux)).toBe('Cette grille ne peut pas encore être partagée : 2 critères '
            + 'n\'ont pas leurs points (A fictif, B fictif). Donne-leur leurs points dans « Grilles de critères », puis partage-la.');
        const un = { id: 'g2', criteres: [critere('C1', 'Idées fictives', 'analytique', 24), critere('C2', 'A fictif', 'analytique', null, true)] };
        expect(w.partageExport.messageGrilleACompleter(un)).toBe('Cette grille ne peut pas encore être partagée : 1 critère '
            + 'n\'a pas ses points (A fictif). Donne-lui ses points dans « Grilles de critères », puis partage-la.');
    });

    it('P.b — en pourcentages : « pondération » ; et rien pour une grille sans marque (un 0, une absence ancienne)', () => {
        const w = chargerPartage([], []);
        const un = { id: 'g3', criteres: [critere('C1', 'Idées fictives', 'holistique', 60), critere('C2', 'A fictif', 'holistique', null, true)] };
        expect(w.partageExport.messageGrilleACompleter(un)).toBe('Cette grille ne peut pas encore être partagée : 1 critère '
            + 'n\'a pas sa pondération (A fictif). Donne-lui sa pondération dans « Grilles de critères », puis partage-la.');
        const sansMarque = { id: 'g4', criteres: [critere('C1', 'A', 'analytique', 0), critere('C2', 'B', 'analytique', null)] };
        expect(w.partageExport.messageGrilleACompleter(sansMarque)).toBe('');
    });

    it('P.c — l’export refuse AVANT de rassembler le paquet, et le dit ; aucune alerte de validation', async () => {
        const alertes = [];
        const appels = [];
        const w = chargerPartage(alertes, appels);
        const g = { id: 'g5', nom: 'Grille fictive', criteres: [critere('C1', 'Idées fictives', 'analytique', 24), critere('C2', 'A fictif', 'analytique', null, true)] };
        await expect(w.partageExport.exporterEntite(g, 'grille')).resolves.toBe(false);
        expect(alertes).toEqual(['Cette grille ne peut pas encore être partagée : 1 critère n\'a pas ses points (A fictif). '
            + 'Donne-lui ses points dans « Grilles de critères », puis partage-la.']);
        expect(appels).toEqual([]);
    });
});
