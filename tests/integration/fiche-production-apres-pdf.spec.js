import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LA FICHE DE PRODUCTION APRÈS « PRÉPARER LE PDF » (retour de Grégoire, 20 oct. 2026, 1.211.0)
//
// « Le choix de la grille ne persiste pas dans la production. » Le formulaire de préparation
// gardait `zonePrincipale.innerHTML` en texte et le remettait à la fermeture (« Annuler » comme
// « Voir l'aperçu ») : la fiche revenait reconstruite, sans l'écouteur `change` posé une seule
// fois au chargement — plus rien ne s'enregistrait, sans que rien ne le dise.
//
// Ce banc joue le vrai index.html depuis la démonstration et lit la BASE, pas seulement l'écran :
//   (a) « Annuler » : la fiche montre la grille choisie ; la grille puis un champ texte changés
//       ensuite s'écrivent, et survivent au rechargement ;
//   (b) « Voir l'aperçu » puis le retour : même chose.
//
// ⚠ Le formulaire de préparation ne s'ouvre, depuis Productions, que pour une production qui n'a
// rien à montrer (ni grille ET échelle, ni consignes — #513) : le banc en fabrique une, dans le
// stockage propre à l'essai. Noms fictifs seulement. Gestes par l'événement DOM, attentes sur
// ce que le geste produit (élément, base), jamais sur une durée (§4.1 bis de fin-de-session).
// ═══════════════════════════════════════════════════════════════════════════════════════════

const appPrete = (page) => page.waitForFunction(() =>
    typeof window.activerModeDemo === 'function' && typeof window.chargerProductionPourModif === 'function'
    && typeof window.db?.getSync === 'function' && typeof window.cle === 'function');

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await appPrete(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForFunction(() => (db.getSync(cle('productions'), []) || []).length > 0);
}

async function changer(page, selecteur, valeur) {
    const n = await page.evaluate(({ selecteur, valeur }) => {
        const el = document.querySelector(selecteur); if (!el) return 0;
        el.value = valeur;
        el.dispatchEvent(new Event('change', { bubbles: true })); return 1;
    }, { selecteur, valeur });
    expect(n, 'champ introuvable : ' + selecteur).toBe(1);
}

async function cliquer(page, selecteur) {
    const n = await page.evaluate((s) => { const el = document.querySelector(s); if (!el) return 0; el.click(); return 1; }, selecteur);
    expect(n, 'élément introuvable : ' + selecteur).toBe(1);
}

const production = (page, id) => page.evaluate((id) =>
    JSON.parse(JSON.stringify((db.getSync(cle('productions'), []) || []).find(p => p.id === id) || null)), id);
const valeur = (page, s) => page.evaluate((s) => document.querySelector(s)?.value ?? null, s);
const formulairePDFOuvert = (page) => page.evaluate(() => !!document.getElementById('formulairePDFInline'));
/** Le champ de la base, attendu jusqu'à ce qu'il porte la valeur — ou rouge au bout de 5 s. */
const attendreEnBase = (page, id, champ, attendu, message) =>
    expect.poll(async () => (await production(page, id))?.[champ], { message, timeout: 5000 }).toBe(attendu);

/** Une production sans échelle ni consignes, rendue modifiable, ouverte ; deux grilles à choisir. */
async function ouvrirProductionSansEchelle(page) {
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    const id = await page.evaluate(async () => {
        const liste = db.getSync(cle('productions'), []) || [];
        const p = liste.find(x => x.grilleId) || liste[0];
        p.isDemo = false; p.auteur = 'Banc fiche PDF'; p.auteurOriginal = 'Banc fiche PDF'; delete p.metadata_cc;
        p.echelleId = ''; p.cartoucheId = '';
        p.objectif = ''; p.tache = ''; p.detailTache = ''; p.champsPersonnalises = [];
        await db.set(cle('productions'), liste);   // security-ok: banc, la collection lue dans l'essai, marque « démo » retirée
        return p.id;
    });
    await page.evaluate(async (id) => { await chargerProductionPourModif(id); }, id);
    await page.waitForFunction(() => {
        const f = document.getElementById('formulaireProduction');
        return f && !f.classList.contains('u-hide') && document.querySelectorAll('#productionGrille option').length > 2;
    });
    const grilles = await page.evaluate(() =>
        [...document.querySelectorAll('#productionGrille option')].map(o => o.value).filter(Boolean));
    expect(grilles.length, 'deux grilles au moins dans la démonstration').toBeGreaterThanOrEqual(2);
    return { id, grilleA: grilles[0], grilleB: grilles[1] };
}

/** Le geste de Grégoire : choisir une grille, ouvrir « Préparer le PDF ». */
async function choisirPuisPreparer(page, id, grille) {
    await changer(page, '#productionGrille', grille);
    await attendreEnBase(page, id, 'grilleId', grille, 'le premier choix s\'écrit');
    await cliquer(page, '[data-action="afficherFormulairePDFDepuisProduction"]');
    await expect.poll(() => formulairePDFOuvert(page), { message: 'le formulaire de préparation est ouvert' }).toBe(true);
    // Les options du formulaire sont chargées (le bouton aperçu est rendu à leur suite).
    await page.waitForFunction(() => document.querySelectorAll('#inlinePDF-echelle option').length > 1);
}

/** Après le retour : la fiche dit ce qu'on a choisi, et ce qu'on change encore s'écrit. */
async function verifierFicheVivante(page, id, grilleChoisie, autreGrille, activite) {
    await expect.poll(() => formulairePDFOuvert(page), { message: 'le formulaire de préparation est retiré' }).toBe(false);
    expect(await page.evaluate(() => !document.getElementById('formulaireProduction').classList.contains('u-hide')
        && !document.getElementById('formulaireProduction').classList.contains('prep-pdf-recouvert')),
        'la fiche est de nouveau visible').toBe(true);
    expect(await valeur(page, '#productionGrille'), 'la fiche montre la grille choisie').toBe(grilleChoisie);

    await changer(page, '#productionGrille', autreGrille);
    await attendreEnBase(page, id, 'grilleId', autreGrille, 'la grille changée après le retour s\'écrit');
    await changer(page, '#productionActivite', activite);
    await attendreEnBase(page, id, 'activiteApprentissage', activite, 'le champ texte changé après le retour s\'écrit');

    await page.reload();
    await appPrete(page);
    await page.waitForFunction((id) => (db.getSync(cle('productions'), []) || []).some(p => p.id === id), id);
    const apres = await production(page, id);
    expect(apres.grilleId, 'rechargée, la production garde la grille').toBe(autreGrille);
    expect(apres.activiteApprentissage, 'rechargée, la production garde le champ texte').toBe(activite);
}

test('(a) « Préparer le PDF » puis « Annuler » : la fiche garde la grille et enregistre encore', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const { id, grilleA, grilleB } = await ouvrirProductionSansEchelle(page);
    await choisirPuisPreparer(page, id, grilleB);
    await cliquer(page, '#formulairePDFInline [data-action="fermerFormulairePDFInline"]');
    await verifierFicheVivante(page, id, grilleB, grilleA, 'Activité fictive après Annuler');
});

test('(b) « Préparer le PDF » puis « Voir l\'aperçu » et le retour : la fiche garde la grille et enregistre encore', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    const { id, grilleA, grilleB } = await ouvrirProductionSansEchelle(page);
    await choisirPuisPreparer(page, id, grilleB);
    const echelle = await page.evaluate(() =>
        [...document.querySelectorAll('#inlinePDF-echelle option')].map(o => o.value).find(Boolean) || '');
    expect(echelle, 'une échelle à choisir dans le formulaire').not.toBe('');
    // Le formulaire ne reprend que la production : sa grille se choisit aussi.
    await changer(page, '#inlinePDF-grille', grilleB);
    await changer(page, '#inlinePDF-echelle', echelle);
    await page.waitForFunction(() => document.getElementById('inlinePDF-btn-apercu')?.disabled === false);
    await cliquer(page, '#inlinePDF-btn-apercu');
    const apercuOuvert = () => page.evaluate(() => document.getElementById('modalApercuPDF').classList.contains('actif'));
    await expect.poll(apercuOuvert, { message: 'l\'aperçu est ouvert' }).toBe(true);
    await cliquer(page, '#modalApercuPDF [data-action="fermerModalApercuPDF"]');
    await expect.poll(apercuOuvert, { message: 'l\'aperçu est fermé' }).toBe(false);
    await verifierFicheVivante(page, id, grilleB, grilleA, 'Activité fictive après l\'aperçu');
});
