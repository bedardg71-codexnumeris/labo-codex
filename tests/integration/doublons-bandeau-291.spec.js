import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// PORTE — #291 · « LESQUELS SONT LESQUELS ? », vérifié dans un vrai navigateur.
//
// Les tests Vitest de ce chantier verrouillent des CHAÎNES de HTML. Ils ne
// peuvent pas dire si la carte existe vraiment dans le DOM, si « Voir » atteint
// sa cible, ni combien de pixels fait un bouton une fois le CSS appliqué.
// C'est ce que fait ce spec, et lui seul.
//
// Jeu de données : un cas B (copie) ET un cas C (homonymes) dans la même
// bibliothèque — les deux que l'ancien détecteur rendait indiscernables.

const JEU_DESSAI = async () => {
    db.setSync('trimestres', [{ id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true }]);
    db.setSync('trimestreActif', 'a2026');

    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set(cle('grillesTemplates'), [
        // Cas B — une copie : id neuf, `idOriginal` vers la source.
        { id: 'GRILLE_source_aaaaaa', nom: 'Grille SRPNF', criteres: [], dansBibliotheque: true,
          dateModification: '2026-08-01T10:00:00.000Z' },
        { id: 'GRILLE_copie_bbbbbb', idOriginal: 'GRILLE_source_aaaaaa', nom: 'Grille SRPNF',
          criteres: [], dansBibliotheque: true, dateModification: '2026-08-12T10:00:00.000Z' },
        // Cas C — deux entités DISTINCTES de même nom (le cas réel de Grégoire,
        // ses deux « IDME et niv 0 » de a2025 — #450).
        { id: 'GRILLE_homoA_cccccc', nom: 'IDME et niv 0', criteres: [], dansBibliotheque: true,
          dateModification: '2026-07-02T10:00:00.000Z' },
        { id: 'GRILLE_homoB_dddddd', nom: 'IDME et niv 0', criteres: [], dansBibliotheque: true,
          dateModification: '2026-07-09T10:00:00.000Z' }
    ]);
    // security-ok: jeu d'essai littéral d'un test, aucune source externe.
    await db.set('bibliothequeGrilles', []);

    await afficherBibliothequeGrilles();
    await new Promise((res) => setTimeout(res, 500));
};

test('porte #291 · le bandeau distingue copies et homonymes, et « Voir » mène à la bonne carte', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('console', (m) => {
        const t = m.text();
        if (m.type() === 'error' && !/version\.json|CORS|Failed to load resource/i.test(t)) erreurs.push(t);
    });
    page.on('dialog', (d) => d.dismiss());

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async (rien) => {
        const out = {};
        await window.__jeuDessai();

        const bandeau = document.querySelector('.biblio-doublons');
        out.bandeauPresent = !!bandeau;
        if (!bandeau) return out;

        // 1 — DEUX catégories différentes s'affichent.
        out.categories = [...bandeau.querySelectorAll('.biblio-doublon-groupe')]
            .map((g) => [...g.classList].find((c) => c.startsWith('biblio-doublon-groupe--')));
        out.titres = [...bandeau.querySelectorAll('.biblio-doublon-titre')].map((t) => t.textContent.trim());

        // 2 — La consigne fausse n'est plus servie.
        out.texteBandeau = bandeau.textContent;

        // 3 — Les cartes portent leur ID court, et l'ancre de « Voir ».
        // ↻ #1154 (25 oct. 2026) : la bibliothèque des grilles passe en deux colonnes ; ses cartes
        // deviennent des rangées (`.biblio2-rangee`), qui gardent la puce sur toute rangée que le bandeau
        // nomme (ici, toutes) et l'ancre `data-biblio-item-id`. Même défense, autre conteneur.
        // BREAK-TEST (25 oct.) : `afficherId: idsNommes.has(grille.id)` → `false` (×2, grilles.js) → ROUGE.
        out.cartesAvecId = document.querySelectorAll('.biblio2-rangee .biblio-id-court').length;
        out.ancres = [...document.querySelectorAll('[data-biblio-item-id]')].map((e) => e.dataset.biblioItemId);

        // 4 — Mesure RÉELLE des boutons du bandeau (cible tactile iPad).
        out.taillesBoutons = [...bandeau.querySelectorAll('.biblio-doublon-action')].map((b) => {
            const r = b.getBoundingClientRect();
            return { l: Math.round(r.width), h: Math.round(r.height) };
        });

        // 5 — « Voir » met bien EN ÉVIDENCE la carte visée, et pas une autre.
        const boutonVoir = bandeau.querySelector(
            '[data-action="BibliothequeUI.voirItemDoublon"][data-param="GRILLE_homoB_dddddd"]');
        out.boutonVoirTrouve = !!boutonVoir;
        if (boutonVoir) {
            boutonVoir.click();
            await new Promise((res) => setTimeout(res, 250));
            out.pointees = [...document.querySelectorAll('.biblio-carte--pointee')]
                .map((e) => e.dataset.biblioItemId);
        }
        return out;
    });

    expect(r.bandeauPresent, 'le bandeau doit apparaître sur un jeu à doublons').toBe(true);

    // — DEUX catégories, c'est tout l'objet du chantier —
    expect(new Set(r.categories).size,
        `une seule catégorie rendue (${r.categories.join(', ')}) : copies et homonymes ` +
        'redeviennent indiscernables').toBe(2);
    expect(r.categories).toContain('biblio-doublon-groupe--copie');
    expect(r.categories).toContain('biblio-doublon-groupe--homonymes');
    expect(r.titres.join(' | ')).toMatch(/Copies/);
    expect(r.titres.join(' | ')).toMatch(/Homonymes/);

    // — La consigne fausse est supprimée, pas reformulée —
    expect(r.texteBandeau).not.toMatch(/IDs identiques/);
    expect(r.texteBandeau).not.toMatch(/homonymes légitimes/);

    // — « ils ne sont pas affichés ! » : les cartes portent leur ID —
    expect(r.cartesAvecId, 'chaque carte de bibliothèque doit afficher son ID court')
        .toBeGreaterThanOrEqual(4);
    expect(r.ancres).toContain('GRILLE_homoB_dddddd');

    // — Cibles tactiles iPad : MESURÉES, pas déduites du CSS —
    expect(r.taillesBoutons.length, 'le bandeau doit porter des boutons d\'action')
        .toBeGreaterThan(0);
    for (const t of r.taillesBoutons) {
        expect(t.h, `bouton de ${t.l}×${t.h} px — sous la cible tactile de 44 px`)
            .toBeGreaterThanOrEqual(44);
        expect(t.l, `bouton de ${t.l}×${t.h} px — sous la cible tactile de 44 px`)
            .toBeGreaterThanOrEqual(44);
    }

    // — « Voir » atteint la BONNE carte —
    expect(r.boutonVoirTrouve, 'chaque exemplaire doit porter un bouton « Voir »').toBe(true);
    expect(r.pointees, '« Voir » doit mettre en évidence la carte visée')
        .toContain('GRILLE_homoB_dddddd');
    expect(r.pointees, '« Voir » ne doit pas éclairer une autre carte')
        .not.toContain('GRILLE_homoA_cccccc');

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

// Le jeu d'essai est posé côté page pour rester lisible ci-dessus.
test.beforeEach(async ({ page }) => {
    await page.addInitScript(`window.__jeuDessai = ${JEU_DESSAI.toString()};`);
});
