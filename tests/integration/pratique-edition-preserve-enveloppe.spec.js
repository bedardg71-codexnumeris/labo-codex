import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle CO-01 (audit Conception, 20-21 août 2026) — Bloquant corrigé le 21 août :
// éditer une pratique via l'assistant (wizard) RECONSTRUISAIT l'objet à neuf — seule
// l'id survivait. inspireDe (invariant CC de la SPEC D §3.1 : « jamais effacé »),
// estMaquette, metadata_cc, isDemo, dateCreation étaient DÉTRUITS, dansBibliotheque
// forcé à true (une maquette « adoptée » de force), et l'auteur d'origine remplacé
// (chargerPratiqueExistante ne remplissait pas prenom/nomAuteur). Le correctif :
// fusion d'enveloppe dans la branche « modification » de sauvegarderPratique
// (wizard-pratique-v2.js) + rechargement de l'auteur à l'ouverture en édition.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];

function brancherEcouteurs(page) {
    const erreurs = [];
    const estAttendue = (m) => patternsAttendus.some((re) => re.test(m));
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estAttendue(m)) erreurs.push(m); } });
    page.on('dialog', (d) => d.dismiss());
    return erreurs;
}

const SETUP = () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');
    const pratique = {
        id: 'pratique_co01_test',
        nom: 'SOM copiée',
        auteur: 'Ada Lovelace',
        etablissement: 'Cégep de Drummondville',
        description: 'Copie de la souche, pour test CO-01',
        discipline: 'Chimie',
        isDemo: false,
        inspireDe: { nom: 'Souche SOM', auteur: 'Autrice Originale', date: '2026-06-01', sourceId: 'pratique_souche' },
        estMaquette: true,
        metadata_cc: { auteur_original: 'Autrice Originale', licence: 'CC BY' },
        dateCreation: '2026-06-01T00:00:00.000Z',
        dansBibliotheque: false,
        type: 'sommative',
        variante: null,
        calcul_note: { methode: 'moyenne_ponderee' },
        configuration: { afficherRang: false },
        nbEvaluationsPrevues: 5,
        seuils: { va_bien: 78, difficulte: 65, grande_difficulte: 55 }
    };
    db.setSync('a2026_pratiquesConfigurables', [pratique]);
    return pratique.id;
};

test('CO-01 · « Éditer puis Enregistrer » préserve l\'enveloppe (inspireDe, estMaquette, metadata_cc, auteur…) et applique la retouche', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async ({ setupSrc }) => {
        const id = (new Function('db', setupSrc))(window.db);

        // Geste de l'audit : ouvrir la pratique en ÉDITION dans l'assistant…
        window.ouvrirWizardV2(true, id);
        const reponsesApresOuverture = JSON.parse(JSON.stringify(window.wizardState.reponses));

        // …retoucher UN champ (le geste banal du cycle de vie)…
        window.wizardState.reponses.description = 'Description retouchée';

        // …puis Enregistrer.
        await window.creerPratiqueV2();

        const stockees = window.db.getSync('a2026_pratiquesConfigurables', []);
        return {
            reponsesApresOuverture,
            apres: stockees.find(p => p.id === id),
            nbPratiques: stockees.length
        };
    }, { setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, '') });

    // L'ouverture en édition recharge l'AUTEUR dans les champs du formulaire
    expect(r.reponsesApresOuverture.prenom, 'prenom rechargé à l\'ouverture').toBe('Ada');
    expect(r.reponsesApresOuverture.nomAuteur, 'nom rechargé à l\'ouverture').toBe('Lovelace');

    // Pas de doublon : l'édition modifie EN PLACE
    expect(r.nbPratiques).toBe(1);

    // La retouche est APPLIQUÉE (la fusion ne fige pas l'édition)
    expect(r.apres.description).toBe('Description retouchée');

    // L'ENVELOPPE survit — invariant CC « inspireDe jamais effacé » (SPEC D §3.1)
    expect(r.apres.inspireDe).toEqual({ nom: 'Souche SOM', auteur: 'Autrice Originale', date: '2026-06-01', sourceId: 'pratique_souche' });
    expect(r.apres.estMaquette, 'la maquette reste une maquette').toBe(true);
    expect(r.apres.metadata_cc).toEqual({ auteur_original: 'Autrice Originale', licence: 'CC BY' });
    expect(r.apres.isDemo).toBe(false);
    expect(r.apres.dateCreation, 'la date de création n\'est pas réécrite').toBe('2026-06-01T00:00:00.000Z');
    expect(r.apres.dansBibliotheque, 'dansBibliotheque n\'est pas forcé à true').toBe(false);
    expect(r.apres.auteur, 'l\'auteur d\'origine survit au round-trip').toBe('Ada Lovelace');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('CO-01 · la CRÉATION n\'est pas affectée : enveloppe neuve, dansBibliotheque true', async ({ page }) => {
    const erreurs = brancherEcouteurs(page);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const r = await page.evaluate(async ({ setupSrc }) => {
        (new Function('db', setupSrc))(window.db);

        // Création (pas d'édition) : parcours neuf, réponses minimales d'une SOM
        window.ouvrirWizardV2(false, null);
        Object.assign(window.wizardState.reponses, {
            nom: 'SOM neuve',
            prenom: 'Grégoire', nomAuteur: 'Bédard',
            typePratique: 'sommative', calcNoteFinale: 'moyenne'
        });
        await window.creerPratiqueV2();

        const stockees = window.db.getSync('a2026_pratiquesConfigurables', []);
        return { neuve: stockees.find(p => p.nom === 'SOM neuve'), nbPratiques: stockees.length };
    }, { setupSrc: SETUP.toString().replace(/^[^{]*\{/, '').replace(/\}$/, '') });

    expect(r.nbPratiques).toBe(2);
    expect(r.neuve).toBeTruthy();
    expect(r.neuve.dansBibliotheque, 'une création entre dans la sidebar').toBe(true);
    expect(r.neuve.auteur).toBe('Grégoire Bédard');
    expect(r.neuve.inspireDe, 'pas d\'enveloppe héritée en création').toBeUndefined();
    expect(r.neuve.estMaquette).toBeUndefined();
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
