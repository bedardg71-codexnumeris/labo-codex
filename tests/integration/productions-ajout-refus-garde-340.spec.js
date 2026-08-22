import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle — retour terrain du 22 août 2026 : « je ne vois toujours pas mes
// ajouts dans ma bibliothèque ou ma sidebar », alors que l'app affichait
// « "Artefact 3" ajoutée à ton cours ! ».
//
// Le relevé de ses données a montré UNE seule production dans le trimestre et
// AUCUNE masquée : les ajouts n'étaient pas cachés, ils n'existaient pas.
//
// Mécanisme : la garde #340 (js/productions-namespace-garde.js) refuse
// d'enregistrer un tableau de productions jugé étranger au trimestre visé —
// aucune native + au moins deux étrangères. Elle journalise
// « [DB][GARDE #340] Écriture BLOQUÉE »… et `db.set` fait alors un simple
// `return;`. La valeur de retour ne distingue donc PAS le refus du succès, et
// l'app annonçait un succès dans les deux cas.
//
// Ce qui est verrouillé ici : quand l'écriture est refusée, l'utilisateur
// l'apprend. Un message de succès sur une écriture refusée est le pire des
// défauts — il fait chercher ailleurs.

test('terrain · une écriture refusée par la garde #340 n\'est JAMAIS annoncée comme un succès', async ({ page }) => {
    page.on('dialog', (d) => d.dismiss());
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async () => {
        const out = {};
        db.setSync('trimestres', [
            { id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true },
            { id: 'h2026', nom: 'H2026', annee: 2026, session: 'H', actif: false }
        ]);
        db.setSync('trimestreActif', 'a2026');
        // Les fiches de cours GLOBALES arment la garde.
        db.setSync('cours', [
            { id: 'C_A', trimestreId: 'a2026' },
            { id: 'C_H', trimestreId: 'h2026' }
        ]);
        // Aucune production native résolvable dans le trimestre actif.
        await db.set('a2026_productions', [{ id: 'P_A1', titre: 'Artefact 1', dansBibliotheque: true }]);
        await db.set('bibliothequeProductions', [
            { id: 'BIB_H1', titre: 'Artefact 2', coursId: 'C_H' },
            { id: 'BIB_H2', titre: 'Artefact 3', coursId: 'C_H' }
        ]);

        await afficherBibliothequeProductions();
        await new Promise((res) => setTimeout(res, 400));

        // 1er ajout : une seule étrangère → la garde tolère
        document.querySelector('[data-action="ajouterProductionIndividuelle"][data-param="BIB_H1"]').click();
        await new Promise((res) => setTimeout(res, 700));
        out.apres1 = (await db.get('a2026_productions')).map((x) => x.titre);

        // 2e ajout : deux étrangères, zéro native → la garde BLOQUE
        document.querySelector('[data-action="ajouterProductionIndividuelle"][data-param="BIB_H2"]').click();
        await new Promise((res) => setTimeout(res, 800));
        out.apres2 = (await db.get('a2026_productions')).map((x) => x.titre);

        const textes = [...document.querySelectorAll('.notification, .toast, [class*="notif"]')]
            .map((x) => x.textContent.trim()).filter(Boolean);
        out.direRefus = textes.some((t) => /n'a PAS pu être ajoutée/.test(t));
        out.direSuccesAtort = textes.some((t) => /Artefact 3.*ajoutée à ton cours/.test(t));
        return out;
    });

    expect(r.apres1, 'le 1er ajout doit passer (une seule étrangère est tolérée)')
        .toEqual(['Artefact 1', 'Artefact 2']);
    expect(r.apres2, 'le 2e ajout doit être refusé : les données ne bougent pas')
        .toEqual(['Artefact 1', 'Artefact 2']);
    expect(r.direRefus, 'le refus doit être DIT à l\'utilisateur').toBe(true);
    expect(r.direSuccesAtort, 'jamais de message de succès sur une écriture refusée').toBe(false);
});
