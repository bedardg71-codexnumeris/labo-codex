import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// LE PDF DE LA GRILLE LIT LE BARÈME (#1120, retour de Grégoire, 20 oct. 2026, 1.211.0)
//
// « Quand je veux voir l'aperçu, c'est encore l'échelle de performance qui est affichée. La
// visualisation du PDF ne ressemble pas du tout à ma grille. » Sa grille : « Journal de lecture
// A26 », quatre critères analytiques à barème, aucune échelle.
//
// Ce banc joue le vrai index.html depuis la démonstration, le geste de la fiche de production :
//   (a) une production liée à une grille toute à barème aux MÊMES tranches partout, SANS échelle
//       ni consignes : « Préparer le PDF » ouvre l'aperçu (et non le formulaire), dans la forme de
//       la grille d'origine (décision de Grégoire, 20 oct., 18 h 39) — une colonne par tranche, le
//       texte puis les points, les éléments observables, la description, le total ;
//   (a2) des tranches qui diffèrent d'un critère à l'autre : une seule colonne, « Barème », chaque
//       critère montre ses quatre lignes, aucun « — », aucun nom de tranche ;
//   (b) une grille mixte, avec son échelle : les colonnes de niveaux restent, et le critère à
//       barème les réunit en une case ;
//   (c) le formulaire de préparation : sans échelle, ni astérisque ni bouton grisé pour la grille
//       toute à barème ; l'échelle reste exigée pour la mixte.
//
// Grilles et textes FICTIFS, posés dans le stockage propre à l'essai. Gestes par l'événement DOM,
// attentes sur ce que le geste produit, jamais sur une durée (§4.1 bis de fin-de-session).
// ═══════════════════════════════════════════════════════════════════════════════════════════

const NOMS_TRANCHES = ['Excellent', 'Satisfaisant', 'Partiel', 'Insuffisant'];
const NOMS_TOUS = [...NOMS_TRANCHES, 'Très bien'];

const appPrete = (page) => page.waitForFunction(() =>
    typeof window.activerModeDemo === 'function' && typeof window.chargerProductionPourModif === 'function'
    && typeof window.db?.getSync === 'function' && typeof window.cle === 'function' && !!window.bareme);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await appPrete(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForFunction(() => (db.getSync(cle('productions'), []) || []).length > 0);
}

/**
 * Pose la grille (toute à barème, ou mixte), la lie à une production de la démo rendue
 * modifiable, sans consignes, puis ouvre la fiche. `echelle` : l'échelle liée, ou ''.
 */
async function lierEtOuvrir(page, { mixte, avecEchelle, varie = false }) {
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    const id = await page.evaluate(async ({ mixte, avecEchelle, varie }) => {
        const tranche = (id, nom, min, max, texte) => ({ id, nom, pointsMin: min, pointsMax: max, texte });
        const critere = (n) => ({ id: `CR_BANC_${n}`, nom: `Critère fictif ${n}`, type: 'analytique', ponderation: 4,
            sousCriteres: [{ id: `SC_BANC_${n}`, code: '0', nom: `Observable fictif ${n}` }],
            // `varie` : le 4e critère nomme sa première tranche autrement → la forme à une colonne.
            bareme: [tranche(`TR_${n}a`, varie && n === 4 ? 'Très bien' : 'Excellent', 3, 4, `Résume l'essentiel ${n}`),
                tranche(`TR_${n}b`, 'Satisfaisant', 2, 2, `Résume en partie ${n}`),
                tranche(`TR_${n}c`, 'Partiel', 1, 1, `Effleure le propos ${n}`),
                tranche(`TR_${n}d`, 'Insuffisant', 0, 0, `Ne résume pas ${n}`)] });
        const criteres = mixte
            ? [{ id: 'CR_BANC_H', nom: 'Structure fictive', type: 'holistique', ponderation: 50 }, critere(9)]
            : [1, 2, 3, 4].map(critere);
        const grille = { id: 'GR_BANC_BAREME', nom: mixte ? 'Grille mixte fictive' : 'Journal de lecture A26',
            description: 'Description fictive de la grille.', criteres };
        const grilles = (db.getSync(cle('grillesTemplates'), []) || []).filter(g => g.id !== grille.id);
        grilles.push(grille);
        await db.set(cle('grillesTemplates'), grilles);   // security-ok: banc, grille fictive posée dans l'essai

        const echelle = (db.getSync(cle('echellesTemplates'), []) || []).find(e => Array.isArray(e.niveaux) && e.niveaux.length);
        const liste = db.getSync(cle('productions'), []) || [];
        const p = liste[0];
        p.isDemo = false; p.auteur = 'Banc PDF barème'; p.auteurOriginal = 'Banc PDF barème'; delete p.metadata_cc;
        p.grilleId = grille.id; p.echelleId = avecEchelle ? echelle.id : ''; p.cartoucheId = '';
        p.objectif = ''; p.tache = ''; p.detailTache = ''; p.champsPersonnalises = [];
        await db.set(cle('productions'), liste);   // security-ok: banc, la collection lue dans l'essai, marque « démo » retirée
        return p.id;
    }, { mixte, avecEchelle, varie });
    await page.evaluate(async (id) => { await chargerProductionPourModif(id); }, id);
    await page.waitForFunction(() => {
        const f = document.getElementById('formulaireProduction');
        return f && !f.classList.contains('u-hide');
    });
    return id;
}

async function preparerLePDF(page) {
    const n = await page.evaluate(() => {
        const b = document.querySelector('[data-action="afficherFormulairePDFDepuisProduction"]');
        if (!b) return 0; b.click(); return 1;
    });
    expect(n, 'le bouton « Préparer le PDF » de la fiche').toBe(1);
    await expect.poll(() => page.evaluate(() => document.getElementById('modalApercuPDF').classList.contains('actif')),
        { message: 'l\'aperçu est ouvert, sans passer par le formulaire' }).toBe(true);
    expect(await page.evaluate(() => !!document.getElementById('formulairePDFInline')), 'aucun formulaire de préparation').toBe(false);
}

/** Le tableau de l'aperçu : ses en-têtes, et chaque ligne (une case à barème → ses tranches). */
const lireTableau = (page) => page.evaluate(() => {
    const table = document.querySelector('#modalApercuPDF table');
    if (!table) return null;
    return {
        entetes: [...table.querySelectorAll('thead th')].map(th => th.textContent.trim()),
        lignes: [...table.querySelectorAll('tbody tr')].map(tr => [...tr.children].map(td => {
            if (td.hasAttribute('data-tranches')) return { colspan: td.colSpan, tranches: [...td.querySelectorAll('[data-tranche]')].map(d => d.textContent) };
            if (td.hasAttribute('data-lignes')) return { lignes: [...td.querySelectorAll('[data-ligne]')].map(d => d.textContent) };
            return td.textContent.trim();
        })),
        texte: table.textContent,
        description: document.querySelector('#modalApercuPDF [data-description-grille]')?.textContent ?? null
    };
});

test('(a) les mêmes tranches partout, sans échelle : l\'aperçu prend la forme de la grille d\'origine', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await lierEtOuvrir(page, { mixte: false, avecEchelle: false });
    await preparerLePDF(page);

    const t = await lireTableau(page);
    expect(t, 'le tableau des critères est rendu').not.toBeNull();
    expect(t.entetes).toEqual(['Critère', 'Points', ...NOMS_TRANCHES]);
    expect(t.description).toBe('Description fictive de la grille.');
    expect(t.lignes).toHaveLength(5);
    t.lignes.slice(0, 4).forEach((ligne, i) => {
        const n = i + 1;
        expect(ligne[0].lignes).toEqual([`Critère fictif ${n}`, `· Observable fictif ${n}`]);
        expect(ligne.slice(2).map(c => c.lignes)).toEqual([
            [`Résume l'essentiel ${n}`, '3-4 points'], [`Résume en partie ${n}`, '2 points'],
            [`Effleure le propos ${n}`, '1 point'], [`Ne résume pas ${n}`, '0 point']]);
    });
    expect(t.lignes[4].slice(0, 2), 'la rangée « Total »').toEqual(['Total', '16']);
    expect(t.entetes).not.toContain('Barème');
});

test('(a2) des tranches qui diffèrent d\'un critère à l\'autre : une colonne, « Barème », sans nom de tranche', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await lierEtOuvrir(page, { mixte: false, avecEchelle: false, varie: true });
    await preparerLePDF(page);

    const t = await lireTableau(page);
    expect(t, 'le tableau des critères est rendu').not.toBeNull();
    expect(t.entetes).toEqual(['Critère', 'Points', 'Barème']);
    expect(t.lignes).toHaveLength(4);
    t.lignes.forEach((ligne, i) => {
        const n = i + 1;
        expect(ligne[0]).toBe(`Critère fictif ${n}`);
        expect(ligne[2].tranches).toEqual([
            `3-4 points\u00a0: Résume l'essentiel ${n}`, `2 points\u00a0: Résume en partie ${n}`,
            `1 point\u00a0: Effleure le propos ${n}`, `0 point\u00a0: Ne résume pas ${n}`]);
    });
    expect(t.texte, 'aucun « — »').not.toContain('—');
    NOMS_TOUS.forEach(nom => expect(t.texte, 'aucun nom de tranche').not.toContain(nom));
    expect(t.description, 'pas de description hors de la forme d\'origine').toBeNull();
});

test('(b) une grille mixte, avec son échelle : les colonnes de niveaux restent', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await lierEtOuvrir(page, { mixte: true, avecEchelle: true });
    await preparerLePDF(page);

    const t = await lireTableau(page);
    expect(t, 'le tableau des critères est rendu').not.toBeNull();
    const nbNiveaux = t.entetes.length - 2;
    expect(nbNiveaux, 'des colonnes de niveaux').toBeGreaterThan(1);
    expect(t.entetes).not.toContain('Barème');
    expect(t.entetes[1], 'une grille mixte garde « % »').toBe('%');
    expect(t.lignes[0], 'le critère holistique : une case par niveau').toHaveLength(2 + nbNiveaux);
    expect(t.lignes[1][2].colspan, 'le critère à barème réunit les niveaux').toBe(nbNiveaux);
    expect(t.lignes[1][2].tranches).toHaveLength(4);
    NOMS_TRANCHES.forEach(nom => expect(t.texte, 'aucun nom de tranche').not.toContain(nom));
});

test('(c) le formulaire : sans échelle, « Voir l\'aperçu » s\'ouvre pour une grille toute à barème, pas pour une mixte', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    // Les deux grilles posées ; la production n'en porte aucune (le formulaire s'ouvre alors, #513).
    await lierEtOuvrir(page, { mixte: true, avecEchelle: false });
    await lierEtOuvrir(page, { mixte: false, avecEchelle: false });
    const mixte = await page.evaluate(async () => {
        const grilles = db.getSync(cle('grillesTemplates'), []) || [];
        const j = grilles.find(g => g.id === 'GR_BANC_BAREME');
        grilles.push({ ...j, id: 'GR_BANC_MIXTE', nom: 'Grille mixte fictive',
            criteres: [{ id: 'CR_BANC_H', nom: 'Structure fictive', type: 'holistique', ponderation: 50 }, j.criteres[0]] });
        await db.set(cle('grillesTemplates'), grilles);   // security-ok: banc, grille fictive posée dans l'essai
        const liste = db.getSync(cle('productions'), []) || [];
        liste[0].grilleId = '';
        await db.set(cle('productions'), liste);   // security-ok: banc
        await chargerProductionPourModif(liste[0].id);
        return 'GR_BANC_MIXTE';
    });
    await page.evaluate(() => document.querySelector('[data-action="afficherFormulairePDFDepuisProduction"]').click());
    await page.waitForFunction(() => document.querySelectorAll('#inlinePDF-grille option').length > 2);

    const etat = async (grilleId) => {
        await page.evaluate((g) => {
            const s = document.getElementById('inlinePDF-grille'); s.value = g;
            document.getElementById('inlinePDF-echelle').value = '';
            s.dispatchEvent(new Event('change', { bubbles: true }));
        }, grilleId);
        await page.waitForFunction((g) => document.getElementById('inlinePDF-grille').value === g, grilleId);
        return page.evaluate(() => ({
            asterisque: !document.getElementById('inlinePDF-echelle-requis').classList.contains('u-hide'),
            bouton: !document.getElementById('inlinePDF-btn-apercu').disabled
        }));
    };
    await expect.poll(() => etat('GR_BANC_BAREME'), { message: 'toute à barème : ni astérisque, et le bouton s\'active' })
        .toEqual({ asterisque: false, bouton: true });
    await expect.poll(() => etat(mixte), { message: 'mixte : l\'échelle reste exigée' })
        .toEqual({ asterisque: true, bouton: false });

    await etat('GR_BANC_BAREME');
    await expect.poll(() => page.evaluate(() => !document.getElementById('inlinePDF-btn-apercu').disabled)).toBe(true);
    await page.evaluate(() => document.getElementById('inlinePDF-btn-apercu').click());
    await expect.poll(() => page.evaluate(() => document.getElementById('modalApercuPDF').classList.contains('actif')),
        { message: 'l\'aperçu s\'ouvre sans échelle' }).toBe(true);
    const t = await lireTableau(page);
    expect(t.entetes).toEqual(['Critère', 'Points', ...NOMS_TRANCHES]);
});
