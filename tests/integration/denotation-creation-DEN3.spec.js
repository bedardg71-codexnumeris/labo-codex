import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Lot DEN-3 (#318) — parcours de création de la dénotation.
// Pilote la VRAIE création (window.creerPratiqueV2) avec des réponses d'assistant
// simulant le parcours DEN, puis vérifie que la pratique produite est CALCULABLE
// par le moteur via le chemin de résolution réel (obtenirPratiqueActive →
// construireConfigComplete → PratiqueConfigurable).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

test('DEN-3 · créer une DEN via l\'assistant → pratique calculable', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async () => {
        if (!window.creerPratiqueV2 || !window.wizardState) return { erreur: 'assistant absent' };

        // Réponses simulant le parcours DEN (voie rapide → config-denotation → infos-base).
        window.wizardState.pratiqueId = null;
        window.wizardState.reponses = {
            calcNoteFinale: 'jugement',
            typePratique: 'denotation',
            nom: 'Démo DEN créée',
            prenom: 'Grégoire', nomAuteur: 'Bédard',
            etablissement: 'Cégep de Drummondville',
            discipline: 'Philosophie',
            ciblesDenotation: [{ id: window.EditeurCibles.nouvelId(), nom: 'Analyser une source' }, { id: window.EditeurCibles.nouvelId(), nom: 'Argumenter de façon structurée' }],
            methodeSuggestionDen: 'mediane'
        };

        try {
            await window.creerPratiqueV2();
        } catch (e) {
            return { erreur: 'creerPratiqueV2 a levé : ' + e.message };
        }

        const liste = window.db.getSync(window.cle('pratiquesConfigurables'), null)
            || window.db.getSync('pratiquesConfigurables', []) || [];
        const creee = liste.find(p => p && p.nom === 'Démo DEN créée');
        if (!creee) return { erreur: 'pratique créée introuvable' };

        // Calculabilité par le chemin RÉEL : rendre la pratique active puis résoudre.
        // #328 L2-b2 : activation par la SSOT groupesCours[].pratiqueId
        // (le miroir modalitesEvaluation.pratique n'existe plus).
        window.db.setSync('groupeCoursActif', { id: 'GC_DEN3', trimestreId: window.obtenirTrimestreId() });
        window.db.setSync(window.cle('groupesCours'), [{ id: 'GC_DEN3', pratiqueId: creee.id }]);
        if (typeof window.invaliderCachePratique === 'function') window.invaliderCachePratique();
        const inst = window.obtenirPratiqueActive();
        if (!inst) return { erreur: 'obtenirPratiqueActive a rendu null' };

        const cibles = inst.config.objectifs
            || (inst.config.configuration && inst.config.configuration.objectifs) || [];
        const conf = {};
        cibles.forEach(c => { conf[c.id] = true; });
        window.denotationJugements.ecrireJugementDenotation(creee.id, 'DA_CREA', {
            ciblesAtteintes: conf, noteFinale: 80
        });

        return {
            type: creee.type,
            methode: creee.calcul_note && creee.calcul_note.methode,
            badge: creee.pratiques,
            modeDEN: creee.configuration && creee.configuration.modeDEN,
            suggestion: creee.configuration && creee.configuration.suggestion && creee.configuration.suggestion.methode,
            nbCibles: cibles.length,
            premiereCibleId: cibles[0] && cibles[0].id,
            premiereCibleNom: cibles[0] && cibles[0].nom,
            estDenActive: window.denotationSaisie.estActive(),
            valideDEN: window.denotationJugements.estConfigDenotationValide(inst.config),
            perf: inst.calculerPerformance('DA_CREA')
        };
    });

    expect(r.erreur, `Erreur eval : ${r.erreur}`).toBeUndefined();
    expect(r.type).toBe('denotation');
    expect(r.methode).toBe('jugement_global');     // câblage calcul_note
    expect(r.badge).toEqual(['DEN']);              // badge famille
    expect(r.modeDEN).toBe('eliminee');
    expect(r.suggestion).toBe('mediane');
    expect(r.nbCibles).toBe(2);                    // cibles réelles (ids stables)
    expect(r.premiereCibleId).toMatch(/^cible_/);      // #717 : l'id reçu à la création, jamais la position
    expect(r.premiereCibleNom).toBe('Analyser une source');
    expect(r.estDenActive).toBe(true);             // le profil offrira le panneau de jugement
    expect(r.valideDEN).toBe(true);
    expect(r.perf).toBeCloseTo(0.80, 5);           // toutes cibles → note saisie → calculable
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
