import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1149, LOT 3a (24 oct. 2026) — LES CHAÎNES D'ÉTAPES. Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-chaines-etapes-3a.md.
//
// Dans le vrai index.html :
//   · Cadre › Trimestre : la barre, dessinée par le composant commun, garde ses six étapes, leurs états,
//     et son clic ouvre l'accordéon ;
//   · Conception › Grilles : la grille ouverte montre Critères, Pondération, Production et leurs infos ;
//     changer une pondération passe à l'orange puis au vert sans recharger, dans la couleur du total ;
//     ajouter un critère change le compte ; « Production » ouvre les productions ; aucune grille ouverte,
//     aucune chaîne ; un exemple en lecture seule montre sa chaîne et ses clics restent vivants ;
//   · Préférences › Expérience visuelle : la case décochée efface toutes les chaînes, recochée les rend,
//     et le choix survit au rechargement ;
//   · iPad 820 px : la chaîne des grilles tient, ses cibles font 44 px.
// Noms fictifs. Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrir(page) {
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    return erreurs;
}

/** Une grille fictive du trimestre actif (60 % + 40 %), une production qui l'emploie, puis l'écran des grilles. */
async function ouvrirGrilleFictive(page) {
    await page.evaluate(async () => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(window.cle('grillesTemplates'), [{
            id: 'GRILLE_BANC_1149', nom: 'Grille témoin 1149', type: 'holistique',
            criteres: [
                { id: 'CR_BANC_A', nom: 'Structure', type: 'holistique', ponderation: 60, description: '' },
                { id: 'CR_BANC_B', nom: 'Langue', type: 'holistique', ponderation: 40, description: '' }
            ]
        }]);
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(window.cle('productions'), [
            { id: 'PROD_BANC_1', titre: 'Témoin un', type: 'examen', grilleId: 'GRILLE_BANC_1149', ponderation: 50 },
            { id: 'PROD_BANC_2', titre: 'Témoin deux', type: 'examen', grilleId: 'GRILLE_AUTRE', ponderation: 50 }
        ]);
        naviguerVers('conception', 'grille-criteres');
    });
    await pause(page, 700);
    await page.evaluate(async () => { await chargerGrillePourModif('GRILLE_BANC_1149'); });
    await pause(page, 500);
}

/** La chaîne lue dans la page : par étape, réglée, ton, info, couleur de l'info ; et la couleur du total. */
const lireChaine = (page, id) => page.evaluate((id) => {
    const nav = document.getElementById(id);
    const etapes = {};
    nav.querySelectorAll('.bc-etape').forEach((b) => {
        const info = b.querySelector('.bc-info');
        etapes[b.dataset.etape] = {
            reglee: b.classList.contains('bc-complet'),
            attention: b.classList.contains('bc-attention'),
            critique: b.classList.contains('bc-critique'),
            info: info.textContent,
            couleur: getComputedStyle(info).color,
            arrivee: b.classList.contains('bc-destination')
        };
    });
    const total = document.getElementById('totalPonderationAffichage');
    return { visible: nav.offsetParent !== null, etapes, total: total.textContent, couleurTotal: getComputedStyle(total).color,
        aria: nav.getAttribute('aria-label') };
}, id);

async function changerPonderation(page, index, valeur) {
    const champ = page.locator('#listeCriteres [data-champ="ponderation"]').nth(index);
    await champ.fill(String(valeur));
    await champ.press('Tab');
    await pause(page, 400);
}

test('Trimestre : la barre garde ses six étapes, leurs états, et son clic ouvre l\'accordéon', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page);
    await page.evaluate(() => {
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        db.setSync(window.cle('horaires'), [{ id: 'HOR_TEMOIN', nom: 'Mar-Ven', seances: [] }]);
        db.setSync(window.cle('groupesCours'), []); // security-ok: tableau vide littéral d'un test
        naviguerVers('calendrier', 'trimestre');
        window.mettreAJourBarreContexte();
    });
    await pause(page, 600);
    const barre = await page.evaluate(() => {
        const nav = document.getElementById('barreConvergence');
        return {
            ids: [...nav.querySelectorAll('.bc-etape')].map(b => b.dataset.etape),
            libelles: [...nav.querySelectorAll('.bc-label')].map(l => l.textContent),
            liaisons: nav.querySelectorAll('.bc-liaison').length,
            finale: nav.querySelectorAll('.bc-liaison-finale').length,
            arrivee: nav.querySelector('.bc-destination').dataset.etape,
            horaire: nav.querySelector('[data-etape="horaire"]').classList.contains('bc-complet'),
            infoHoraire: document.getElementById('bc-info-horaire').textContent,
            gc: nav.querySelector('[data-etape="groupe-cours"]').classList.contains('bc-complet'),
            aria: nav.getAttribute('aria-label'),
            motNature: nav.querySelector('[data-etape="cours"] .bc-label').getAttribute('data-mot-nature')
        };
    });
    expect(barre.ids).toEqual(['trimestre', 'cours', 'enseignant', 'etudiants', 'horaire', 'groupe-cours']);
    expect(barre.libelles.slice(3)).toEqual(['Étudiant·es', 'Horaire', 'Groupe-cours']);
    expect(barre.liaisons).toBe(5);
    expect(barre.finale).toBe(1);
    expect(barre.arrivee).toBe('groupe-cours');
    expect(barre.horaire).toBe(true);
    expect(barre.infoHoraire).toBe('1 hor.');
    expect(barre.gc).toBe(false);
    expect(barre.aria).toBe('Statut de configuration');
    expect(barre.motNature).toBe('Objet');

    // Le clic ouvre l'accordéon (fermé d'abord) et y descend.
    await page.evaluate(() => {
        const acc = document.getElementById('accordeon-horaire');
        if (!acc.classList.contains('ferme')) toggleAccordeonV2(acc.querySelector('.accordeon-header'));
    });
    expect(await page.evaluate(() => document.getElementById('accordeon-horaire').classList.contains('ferme'))).toBe(true);
    await page.locator('#barreConvergence [data-etape="horaire"]').click();
    await pause(page, 700);
    expect(await page.evaluate(() => document.getElementById('accordeon-horaire').classList.contains('ferme'))).toBe(false);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Grilles : trois étapes ; la pondération passe à l\'orange, au rouge, puis au vert sans recharger ; ajouter un critère change le compte', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    // Aucune grille ouverte : aucune chaîne.
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 500);
    expect((await lireChaine(page, 'chaineGrille')).visible, 'aucune grille ouverte, aucune chaîne').toBe(false);

    await ouvrirGrilleFictive(page);
    let c = await lireChaine(page, 'chaineGrille');
    expect(c.visible).toBe(true);
    expect(c.aria).toBe('Étapes de la grille');
    expect(Object.keys(c.etapes)).toEqual(['criteres', 'ponderation', 'production']);
    expect(c.etapes.criteres).toMatchObject({ reglee: true, info: '2 critères' });
    expect(c.etapes.ponderation).toMatchObject({ reglee: true, info: '100 %' });
    expect(c.etapes.production).toMatchObject({ reglee: true, info: '1 prod.', arrivee: true });
    const vert = c.couleurTotal;

    // 85 % : orange, la couleur du total affiché.
    await changerPonderation(page, 1, 25);
    c = await lireChaine(page, 'chaineGrille');
    expect(c.total).toBe('85 %');
    expect(c.etapes.ponderation).toMatchObject({ reglee: false, attention: true, critique: false, info: '85 %' });
    expect(c.etapes.ponderation.couleur, 'l\'info dans la couleur du total').toBe(c.couleurTotal);
    const orange = c.couleurTotal;
    expect(orange).not.toBe(vert);

    // 110 % : rouge, la couleur du total affiché.
    await changerPonderation(page, 1, 50);
    c = await lireChaine(page, 'chaineGrille');
    expect(c.total).toBe('110 %');
    expect(c.etapes.ponderation).toMatchObject({ reglee: false, attention: false, critique: true, info: '110 %' });
    expect(c.etapes.ponderation.couleur).toBe(c.couleurTotal);
    expect(c.couleurTotal).not.toBe(orange);

    // 100 % : réglée.
    await changerPonderation(page, 1, 40);
    c = await lireChaine(page, 'chaineGrille');
    expect(c.etapes.ponderation).toMatchObject({ reglee: true, attention: false, critique: false, info: '100 %' });
    expect(c.couleurTotal).toBe(vert);

    // Ajouter un critère (le bouton de la fiche) change le compte.
    await page.locator('#conteneurEditionGrille [data-action="ajouterCritereGrille"]').click();
    await pause(page, 600);
    c = await lireChaine(page, 'chaineGrille');
    expect(c.etapes.criteres.info).toBe('3 critères');

    // « Pondération » descend au total ; « Critères » à la liste.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#chaineGrille [data-etape="ponderation"]').click();
    await pause(page, 900);
    expect(await page.evaluate(() => { const b = document.getElementById('totalPonderationAffichage').getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight; })).toBe(true);

    // « Production » ouvre Conception › Productions étudiantes.
    await page.locator('#chaineGrille [data-etape="production"]').click();
    await pause(page, 700);
    expect(await page.evaluate(() => { const s = document.getElementById('conception-productions'); return s.offsetParent !== null; })).toBe(true);
    expect(await page.evaluate(() => document.getElementById('conception-grille-criteres').offsetParent === null)).toBe(true);

    // Fermer la fiche emporte la chaîne.
    await page.evaluate(() => { naviguerVers('conception', 'grille-criteres'); annulerFormGrille(); });
    await pause(page, 400);
    expect((await lireChaine(page, 'chaineGrille')).visible).toBe(false);
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Grilles : en création, la chaîne lit le formulaire', async ({ page }) => {
    test.setTimeout(60000);
    const erreurs = await ouvrir(page);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 500);
    await page.evaluate(async () => { await creerNouvelleGrille(); });
    await pause(page, 400);
    let c = await lireChaine(page, 'chaineGrille');
    expect(c.visible).toBe(true);
    expect(c.etapes.criteres).toMatchObject({ reglee: false, info: 'aucun' });
    expect(c.etapes.ponderation).toMatchObject({ reglee: false, attention: true, info: '0 %' });
    expect(c.etapes.production).toMatchObject({ reglee: false, info: 'aucune' });
    // Le nom du premier critère, puis sa pondération : la chaîne suit, rien n'est enregistré.
    const nom = page.locator('#listeCriteres [data-champ="nom"]').first();
    await nom.fill('Cohérence');
    await nom.press('Tab');
    const pond = page.locator('#listeCriteres [data-on-change="modifierPonderationCritereTempHandler"]').first();
    await pond.fill('100');
    await pond.press('Tab');
    await pause(page, 300);
    c = await lireChaine(page, 'chaineGrille');
    expect(c.etapes.criteres).toMatchObject({ reglee: true, info: '1 critère' });
    expect(c.etapes.ponderation).toMatchObject({ reglee: true, info: '100 %' });
    expect(erreurs, erreurs.join(' | ')).toEqual([]);
});

test('Préférences : la case décochée efface toutes les chaînes, recochée les rend ; le choix survit au rechargement', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page);
    await ouvrirGrilleFictive(page);
    const visibles = () => page.evaluate(() => ({
        grille: document.getElementById('chaineGrille').getClientRects().length > 0,
        trimestre: getComputedStyle(document.getElementById('barreConvergence')).display !== 'none'
    }));
    expect(await visibles()).toEqual({ grille: true, trimestre: true });

    await page.evaluate(() => naviguerVers('reglages', 'preferences'));
    await pause(page, 500);
    const caseChaines = page.locator('#v2-pref-chaines-etapes');
    await expect(caseChaines).toBeChecked();
    await caseChaines.uncheck();
    await pause(page, 400);
    expect(await visibles()).toEqual({ grille: false, trimestre: false });
    expect(await page.evaluate(() => obtenirPreference('afficherChainesEtapes'))).toBe(false);

    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1500);
    expect(await page.evaluate(() => document.body.classList.contains('chaines-etapes-masquees')), 'le choix survit au rechargement').toBe(true);
    await page.evaluate(() => naviguerVers('reglages', 'preferences'));
    await pause(page, 500);
    await expect(caseChaines).not.toBeChecked();
    await caseChaines.check();
    await pause(page, 400);
    await ouvrirGrilleFictive(page);
    expect(await visibles()).toEqual({ grille: true, trimestre: true });
});

test('Grilles : un exemple en lecture seule montre sa chaîne, et ses clics descendent', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrir(page);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
    await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
    await pause(page, 600);
    const id = await page.evaluate(async () => {
        const g = (await db.get(window.cle('grillesTemplates')) || []).find(x => BibliothequeUI.estItemDemo(x) && (x.criteres || []).length);
        await chargerGrillePourModif(g.id);
        return g.id;
    });
    expect(id).toBeTruthy();
    await pause(page, 500);
    const c = await lireChaine(page, 'chaineGrille');
    expect(c.visible).toBe(true);
    expect(await page.evaluate(() => document.querySelector('#listeCriteres input, #listeCriteres select').disabled), 'la fiche est bien en lecture seule').toBe(true);
    expect(await page.evaluate(() => [...document.querySelectorAll('#chaineGrille .bc-etape')].some(b => b.disabled))).toBe(false);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#chaineGrille [data-etape="ponderation"]').click();
    await pause(page, 900);
    expect(await page.evaluate(() => { const b = document.getElementById('totalPonderationAffichage').getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight; })).toBe(true);
});

test('Grilles, iPad 820 px : la chaîne tient dans sa largeur ou défile, ses cibles font 44 px', async ({ page }) => {
    test.setTimeout(60000);
    await ouvrir(page);
    await page.setViewportSize({ width: 820, height: 1180 });
    await ouvrirGrilleFictive(page);
    const m = await page.evaluate(() => {
        const nav = document.getElementById('chaineGrille');
        const boutons = [...nav.querySelectorAll('.bc-etape')].map(b => b.getBoundingClientRect());
        return {
            debordePage: document.documentElement.scrollWidth > innerWidth,
            defile: getComputedStyle(nav).overflowX,
            hauteurMin: Math.min(...boutons.map(b => Math.round(b.height))),
            largeurMin: Math.min(...boutons.map(b => Math.round(b.width)))
        };
    });
    expect(m.debordePage, 'la page ne défile pas à l\'horizontale').toBe(false);
    expect(m.defile).toBe('auto');
    expect(m.hauteurMin).toBeGreaterThanOrEqual(44);
    expect(m.largeurMin).toBeGreaterThanOrEqual(44);
});

// Les captures de la demande de relecture : seulement quand CAPTURES_CHAINES nomme leur dossier.
test('captures (CAPTURES_CHAINES)', async ({ page }) => {
    test.skip(!process.env.CAPTURES_CHAINES, 'captures seulement sur demande');
    test.setTimeout(240000);
    const dossier = process.env.CAPTURES_CHAINES;
    await ouvrir(page);
    for (const sombre of [false, true]) {
        const mode = sombre ? 'sombre' : 'clair';
        for (const largeur of [1440, 820]) {
            await page.setViewportSize({ width: largeur, height: 1000 });
            await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
            await ouvrirGrilleFictive(page);
            await page.evaluate((s) => document.body.classList.toggle('mode-clair', !s), sombre);
            const cadrer = async (nom, selecteur) => {
                await page.locator(selecteur).first().scrollIntoViewIfNeeded();
                await pause(page, 400);
                const b = await page.locator(selecteur).first().boundingBox();
                await page.screenshot({ path: path.join(dossier, `${nom}-${largeur}-${mode}.png`),
                    clip: { x: 0, y: Math.max(0, b.y - 140), width: largeur, height: Math.min(560, b.height + 420) } });
            };
            await cadrer('grilles-reglee', '#chaineGrille');
            await changerPonderation(page, 1, 25);
            await cadrer('grilles-85', '#chaineGrille');
            await changerPonderation(page, 1, 40);
            await page.evaluate(() => { naviguerVers('calendrier', 'trimestre'); window.mettreAJourBarreContexte(); });
            await pause(page, 600);
            await cadrer('trimestre', '#barreConvergence');
            await page.evaluate(() => naviguerVers('reglages', 'preferences'));
            await pause(page, 500);
            await cadrer('preferences', '#v2-pref-chaines-etapes');
        }
    }
});
