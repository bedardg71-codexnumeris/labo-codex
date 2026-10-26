import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle — retour terrain du 22 août 2026 :
// « Quand je clique "ajouter à ma sélection", il semble rien se passer, ni dans
//   la modale où je m'attends à voir les ajouts apparaître, ni dans la sidebar. »
//
// L'ajout MARCHAIT (la section « ta sélection » passait de 1 à 2) : c'est la
// liste où il venait de cliquer qui ne bougeait pas. `ajouterProductionIndividuelle`
// ne déplace pas l'item de la bibliothèque, il en fait une COPIE avec un `id`
// neuf et range l'ancien dans `idOriginal`. La section « disponibles » excluait
// par `id` NU : l'original ne correspondait à rien et restait listé.
//
// Conséquence en prime : le bouton restait cliquable et empilait un exemplaire
// de plus à chaque clic, en silence. Recoupe CO-24 (« les boutons ajouter des
// modales sont re-cliquables »), qui était un constat [AGENT] non contre-vérifié
// et n'en donnait pas la cause.
//
// grilles.js, echelles.js et cartouches.js testaient DÉJÀ l'identité
// (`id === X || idOriginal === X`) : les productions étaient la seule
// bibliothèque à ne pas le faire.

test('terrain · ajouter depuis la bibliothèque retire l\'item des « disponibles » et interdit le doublon', async ({ page }) => {
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

    const r = await page.evaluate(async () => {
        const out = {};
        db.setSync('trimestres', [{ id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');
        await db.set(cle('productions'), [
            { id: 'PROD_DEJA', titre: 'Artefact 1', type: 'portfolio', ponderation: 0, dansBibliotheque: true }
        ]);
        await db.set('bibliothequeProductions', [
            { id: 'BIB_A2', titre: 'Artefact 2', type: 'portfolio', ponderation: 0 }
        ]);

        await afficherBibliothequeProductions();
        await new Promise((res) => setTimeout(res, 400));

        const dispo = () => {
            const s2 = document.getElementById('listeProductionsDisponibles');
            return s2 ? [...s2.querySelectorAll('[data-action="ajouterProductionIndividuelle"]')].map((x) => x.dataset.param) : [];
        };

        out.disponiblesAvant = dispo();
        document.querySelector('[data-action="ajouterProductionIndividuelle"][data-param="BIB_A2"]').click();
        await new Promise((res) => setTimeout(res, 800));

        out.disponiblesApres = dispo();
        out.nbProductions = (await db.get(cle('productions'))).length;
        out.copie = (await db.get(cle('productions'))).find((p) => p.idOriginal === 'BIB_A2') || null;

        // ↻ #1156 (25 oct. 2026) : dans la fenêtre en deux colonnes, l'item ne quitte plus « Dans ta bibliothèque » :
        // sa rangée perd son passage et dit « ✓ Déjà dans ce trimestre » (consigne du lot 1, § 1.3). Le geste paraît
        // donc avoir un effet, et la défense tient : plus de bouton à recliquer.
        const rangeeBib = document.querySelector('#listeProductionsDisponibles [data-biblio-item-id="BIB_A2"]');
        out.etatApres = rangeeBib ? rangeeBib.querySelector('.biblio2-etat')?.textContent.replace(/\s+/g, ' ').trim() : null;

        // recliquer doit être IMPOSSIBLE : le bouton a disparu
        const encore = document.querySelector('[data-action="ajouterProductionIndividuelle"][data-param="BIB_A2"]');
        out.boutonEncorePresent = !!encore;
        if (encore) { encore.click(); await new Promise((res) => setTimeout(res, 700)); }
        out.nbApres2eTentative = (await db.get(cle('productions'))).length;
        return out;
    });

    expect(r.disponiblesAvant, 'l\'item de bibliothèque doit être proposé au départ').toContain('BIB_A2');
    expect(r.nbProductions, 'la production doit avoir été copiée dans le cours').toBe(2);
    expect(r.copie, 'la copie garde la trace de son original').not.toBeNull();
    expect(
        r.disponiblesApres,
        'l\'item ne doit plus PROPOSER son passage — sans quoi le geste paraît sans effet'
    ).not.toContain('BIB_A2');
    // BREAK-TEST (25 oct.) : `dejaDansCeTrimestre` rendu toujours faux dans productions-bibliotheque-ui.js → ROUGE.
    expect(r.etatApres, 'la rangée dit où est l\'item').toBe('✓ Déjà dans ce trimestre');
    expect(r.boutonEncorePresent, 'le bouton ne doit plus être là').toBe(false);
    expect(r.nbApres2eTentative, 'aucun second exemplaire ne doit pouvoir être créé').toBe(2);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
