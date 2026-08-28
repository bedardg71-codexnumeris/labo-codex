import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #555 · LE BLOC « REPÈRES DE MAÎTRISE » SE REND DANS LE VRAI `index.html`.
//
// ⮕ ÉCRITE EN SPEC, PAS EN PORTE TERRAIN — règle 1 du skill `portes-terrain` :
// une porte n'existe que si aucune machine ne peut répondre. Ici une machine le
// peut, et c'est la leçon de la nuit du 27-28 août : Vitest tourne dans `node`
// et NE VOIT PAS le rendu. Le banc unitaire de #555 prouve les refus ; seul
// WebKit prouve que les deux listes existent à l'écran, dans le bon ordre, sous
// les niveaux — et que l'aperçu dit la zone de chaque niveau.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('#555 · l\'éditeur d\'échelle rend les deux repères, et l\'aperçu dit la zone', async ({ page }) => {
    const erreurs = [];
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

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(async () => {
        if (typeof window.afficherNiveauxEchelle !== 'function'
            || typeof window.ordonnerNiveauxParPlage !== 'function') {
            return { erreur: 'pré-requis absents' };
        }

        // Une échelle SANS aucune lettre d'IDME, saisie dans le désordre : c'est
        // le seul montage qui distingue l'ordre des plages de l'ordre de saisie.
        const echelle = {
            id: 'ECH_SPEC_555',
            nom: 'Cotation W-X-Y-Z',
            seuilSuffisance: 'X',
            seuilMaitrise: 'Y',
            niveaux: [
                { code: 'Y', nom: 'Consolidé', min: 70, max: 89, valeurCalcul: 80, couleur: '#333333' },
                { code: 'W', nom: 'Amorce',    min: 0,  max: 49, valeurCalcul: 30, couleur: '#111111' },
                { code: 'Z', nom: 'Transféré', min: 90, max: 100, valeurCalcul: 95, couleur: '#444444' },
                { code: 'X', nom: 'En chemin', min: 50, max: 69, valeurCalcul: 60, couleur: '#222222' }
            ]
        };

        window.afficherNiveauxEchelle(echelle);

        const editeur = document.getElementById('tableauNiveauxEchelle');
        const apercu = document.getElementById('apercuEchelleNiveaux');
        const selects = [...editeur.querySelectorAll('select[data-champ^="seuil"]')];

        return {
            titrePresent: editeur.textContent.includes('Repères de maîtrise'),
            champs: selects.map((s) => s.dataset.champ),
            // Les options de chaque liste, dans l'ordre où WebKit les rend.
            options: selects.map((s) => [...s.options].map((o) => o.value)),
            // Ce que chaque liste a de sélectionné : les repères enregistrés.
            selection: selects.map((s) => s.value),
            // Le bloc vient APRÈS les niveaux, jamais avant : on désigne des
            // niveaux qui doivent déjà exister.
            reperesApresNiveaux: editeur.innerHTML.indexOf('Repères de maîtrise')
                > editeur.innerHTML.indexOf('data-champ="valeurCalcul"'),
            apercu: apercu ? apercu.textContent.replace(/\s+/g, ' ').trim() : ''
        };
    });

    expect(resultat.erreur).toBeUndefined();
    expect(resultat.titrePresent).toBe(true);
    expect(resultat.champs).toEqual(['seuilSuffisance', 'seuilMaitrise']);

    // L'ordre des PLAGES (W < X < Y < Z), pas celui de la saisie (Y, W, Z, X).
    expect(resultat.options[0]).toEqual(['', 'W', 'X', 'Y', 'Z']);
    expect(resultat.options[1]).toEqual(['', 'W', 'X', 'Y', 'Z']);
    expect(resultat.selection).toEqual(['X', 'Y']);
    expect(resultat.reperesApresNiveaux).toBe(true);

    // L'aperçu nomme la zone de chaque niveau — sans quoi le choix reste un
    // formulaire dont on ne voit jamais l'effet.
    expect(resultat.apercu).toContain('à travailler');   // W, sous la suffisance
    expect(resultat.apercu).toContain('suffisant');      // X, entre les deux
    expect(resultat.apercu).toContain('maîtrisé');       // Y et Z, au-dessus

    expect(erreurs).toEqual([]);
});
