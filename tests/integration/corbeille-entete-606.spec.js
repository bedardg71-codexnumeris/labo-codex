import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #606 — DANS LA CORBEILLE, CHAQUE VALEUR EST SOUS L'EN-TÊTE QUI LA NOMME.
//
// Relevé par Grégoire, capture à l'appui : « le contenu des colonnes ne
// correspond pas aux en-têtes ». La corbeille écrivait ses lignes dans le
// tableau des évaluations et empruntait son en-tête — nom de fichier sous
// « Prénom », date de suppression sous « Statut », jours restants sous
// « Niveau ».
//
// La sentinelle Vitest jumelle (`unit/sentinelle-606-entete-corbeille.test.js`)
// verrouille le comptage : autant de `<th>` que de `<td>`, aucun colspan. Elle
// ne peut PAS voir l'alignement, parce que Node ne peint rien. Ici on mesure
// les boîtes réelles : pour chaque cellule, on cherche l'en-tête au-dessus
// duquel elle tombe, et on vérifie que c'est le bon.

const CORBEILLE_FICTIVE = [
    {
        id: 'ft_606_a',
        etudiantDA: '9000058',
        productionId: 'p_606',
        nomFichier: 'Exemple_9000058_Portrait_de_lecteur-p1__Remis_le_2026-08-21_11h36m32s.jpg',
        dateSuppression: '2026-08-30T12:00:00.000Z'
    }
];

async function ouvrirCorbeille(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    await page.evaluate((corbeille) => {
        // Semer une corbeille sans toucher au stockage : seule la vue est testée.
        window.travauxStockage = window.travauxStockage || {};
        window.travauxStockage.obtenirCorbeille = () => corbeille;
        // La SOUS-section doit être active, pas seulement la section : sans
        // elle, `#evaluations-liste` reste en `display:none` et toutes les
        // boîtes mesurent zéro — un test qui « passe » sans rien avoir vu.
        window.naviguerVers('evaluations', 'liste');
    }, CORBEILLE_FICTIVE);
    await page.waitForTimeout(400);

    await page.evaluate(() => window.basculerVueCorbeille());
    await page.waitForTimeout(300);

    // Garde-fou du banc lui-même : sans largeur, la mesure ne prouve rien.
    const largeur = await page.evaluate(() =>
        document.getElementById('conteneur-tableau-evaluations').getBoundingClientRect().width);
    expect(largeur, 'le tableau doit être réellement peint').toBeGreaterThan(300);
}

test('chaque cellule de la corbeille tombe sous l\'en-tête qui la nomme', async ({ page }) => {
    await ouvrirCorbeille(page);

    const releve = await page.evaluate(() => {
        const enteteVisible = document.querySelector('#entete-corbeille');
        const entetes = [...enteteVisible.querySelectorAll('th')].map(th => ({
            texte: th.textContent.trim(),
            boite: th.getBoundingClientRect()
        }));

        // La première rangée du corps est le bandeau d'information ; les données
        // commencent à la suivante.
        const lignes = [...document.querySelectorAll('#corps-tableau-evaluations tr')];
        const ligneDonnees = lignes[lignes.length - 1];

        return [...ligneDonnees.querySelectorAll('td')].map(td => {
            const b = td.getBoundingClientRect();
            const centre = b.left + b.width / 2;
            const surplombant = entetes.find(e => centre >= e.boite.left && centre <= e.boite.right);
            return { contenu: td.textContent.trim(), entete: surplombant ? surplombant.texte : null };
        });
    });

    const parEntete = Object.fromEntries(releve.map(c => [c.entete, c.contenu]));

    expect(parEntete['Fichier']).toContain('Exemple_9000058_Portrait_de_lecteur-p1');
    expect(parEntete['Expire dans']).toMatch(/jour\(s\)/);
    expect(parEntete['Supprimé le']).toMatch(/2026/);
    expect(parEntete['Actions']).toContain('Restaurer');

    // Le défaut d'origine, dit à l'envers : aucune valeur ne tombe sous une
    // colonne du tableau des évaluations.
    for (const cellule of releve) {
        expect(cellule.entete, `« ${cellule.contenu} » sous un en-tête inattendu`).not.toBeNull();
        expect(['Prénom', 'Statut', 'Niveau', 'Note %', 'Jeton', 'DA', 'Nom']).not.toContain(cellule.entete);
    }
});

test('l\'en-tête des évaluations et le sélecteur de colonnes s\'effacent, puis reviennent', async ({ page }) => {
    await ouvrirCorbeille(page);

    const enCorbeille = await page.evaluate(() => ({
        eval: !document.getElementById('entete-evaluations').classList.contains('u-hide'),
        corbeille: !document.getElementById('entete-corbeille').classList.contains('u-hide'),
        selecteur: !document.getElementById('eval-colonnes-selecteur').classList.contains('u-hide')
    }));
    expect(enCorbeille).toEqual({ eval: false, corbeille: true, selecteur: false });

    await page.evaluate(() => window.basculerVueCorbeille());
    await page.waitForTimeout(200);

    const deRetour = await page.evaluate(() => ({
        eval: !document.getElementById('entete-evaluations').classList.contains('u-hide'),
        corbeille: !document.getElementById('entete-corbeille').classList.contains('u-hide'),
        selecteur: !document.getElementById('eval-colonnes-selecteur').classList.contains('u-hide')
    }));
    expect(deRetour).toEqual({ eval: true, corbeille: false, selecteur: true });
});

test('masquer une colonne ne décale pas la corbeille', async ({ page }) => {
    // Le second mécanisme du défaut : le sélecteur masque par RANG DE CELLULE.
    // Dans la corbeille, décocher « Jeton » retirait la date. Il est désormais
    // masqué dans cette vue, et refuse d'agir même appelé de force.
    await ouvrirCorbeille(page);

    const avant = await page.evaluate(() =>
        [...document.querySelectorAll('#corps-tableau-evaluations tr:last-child td')].map(td => td.className));

    await page.evaluate(() => {
        const cb = document.querySelector('#eval-colonnes-selecteur input[data-colonne="jeton"]');
        cb.checked = false;
        window.toggleColonneEval(cb);
    });
    await page.waitForTimeout(150);

    const apres = await page.evaluate(() =>
        [...document.querySelectorAll('#corps-tableau-evaluations tr:last-child td')].map(td => td.className));

    expect(apres).toEqual(avant);
    expect(apres.some(c => c.includes('u-hide'))).toBe(false);
});
