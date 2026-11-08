import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

// « L'en-tête épuré » (7 nov. 2026) — données de la démo. Le jugement visuel est celui de Grégoire,
// sur capture (CAPTURES_EN_TETE=<dossier> pour les produire) ; ici, la géométrie que la consigne
// chiffre, le menu, la liste des sections et l'anonymisation.
// Remplace tests/integration/nouvel-en-tete-2026-11-07.spec.js (le lot qu'il vérifiait est remplacé).

async function ouvrirDemo(page, largeur, erreurs) {
    page.on('dialog', async (d) => { await d.accept(); });
    if (erreurs) page.on('pageerror', (e) => erreurs.push(e.message));
    await page.setViewportSize({ width: largeur, height: 900 });
    await page.goto(indexHtml);
    await page.waitForFunction(() => window.dbReady === true && typeof window.activerModeDemo === 'function', null, { timeout: 20000 });
    await page.evaluate(async () => { await window.activerModeDemo(); });
}

const boite = (page, sel) => page.evaluate((s) => {
    const e = document.querySelector(s);
    if (!e) return null;
    const r = e.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
}, sel);

test('bureau (1440) : bande du haut de 84 px, logo de 60, mots centrés sur la page, Codex · thème · menu à droite', async ({ page }) => {
    const erreurs = [];
    await ouvrirDemo(page, 1440, erreurs);
    await page.evaluate(() => window.afficherSection('suivi'));
    const haut = await boite(page, '.entete');
    const logo = await boite(page, '.entete-logo img');
    const nav = await boite(page, '.navigation-boutons');
    expect(haut.height).toBe(84);
    expect(logo.height).toBe(60);
    expect(Math.abs((nav.left + nav.right) / 2 - 720)).toBeLessThan(1);
    // Les mots : sans icône, 15 px demi-gras, zone de toucher d'au moins 44 px
    const mots = await page.evaluate(() => [...document.querySelectorAll('.navigation-boutons > *')].map((b) => {
        const s = getComputedStyle(b); return { mot: b.textContent.trim(), h: b.getBoundingClientRect().height, taille: s.fontSize, graisse: s.fontWeight, icones: b.querySelectorAll('.nav-icon, img').length };
    }));
    expect(mots.map((m) => m.mot)).toEqual(['Accueil', 'Cadre', 'Conception', 'Évaluation', 'Suivi', 'Labo', 'CoP']);
    for (const m of mots) {
        expect(m.h).toBeGreaterThanOrEqual(44);
        expect(m.taille).toBe('15px');
        expect(m.graisse).toBe('600');
        expect(m.icones).toBe(0);
    }
    // L'actif : blanc, souligné de 2 px dans l'orange de l'aide
    const actif = await page.evaluate(() => {
        const b = document.querySelector('.navigation-principale button.actif');
        const a = getComputedStyle(b, '::after');
        return { onglet: b.getAttribute('data-onglet'), couleur: getComputedStyle(b).color, trait: a.height, fond: a.backgroundColor };
    });
    expect(actif).toEqual({ onglet: 'suivi', couleur: 'rgb(255, 255, 255)', trait: '2px', fond: 'rgb(232, 146, 58)' });
    // À droite, dans l'ordre : Codex, thème, menu
    const ordre = await page.evaluate(() => [...document.querySelector('.entete-actions').children].map((e) => e.id));
    expect(ordre).toEqual(['codex-controle', 'btn-toggle-theme-nav', '']);
    expect(await page.locator('#entete-menu-bouton').getAttribute('aria-label')).toBe('Menu');
    expect(await page.locator('#entete-menu-bouton').getAttribute('aria-expanded')).toBe('false');
    // Navigation secondaire : 48 px, centrée ; bande pâle : 56 px, groupe centré sur la page
    const sous = await boite(page, '#sous-navigation');
    const bande = await boite(page, '.bande-groupe');
    const groupe = await boite(page, '.groupe-selecteur');
    const anon = await boite(page, '#btn-toggle-anonymisation-nav');
    expect(sous.height).toBe(48);
    expect(sous.top).toBe(haut.bottom);
    expect(Math.abs((sous.left + sous.right) / 2 - 720)).toBeLessThan(1);
    expect(bande.height).toBe(56);
    expect(Math.abs((groupe.left + groupe.right) / 2 - 720)).toBeLessThan(1);
    expect(anon.left - groupe.right).toBe(8);
    expect(anon.height).toBe(groupe.height);
    expect(anon.top).toBe(groupe.top);
    // Libellés courts des onglets (Suivi) ; le titre de la page garde le long
    const onglets = await page.locator('#sous-navigation button').allTextContents();
    expect(onglets).toEqual(['Groupe', 'Étudiant·es', 'Présences', 'Profils', 'Interventions', 'Rencontres', 'Animation']);
    expect(await page.locator('#suivi-groupe h2').first().textContent()).toContain('Suivi du groupe');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(1440);
    expect(erreurs).toEqual([]);
});

test('Accueil : pas de bande de navigation secondaire ; le slogan et l\'ancien bloc sont partis', async ({ page }) => {
    await ouvrirDemo(page, 1440);
    await page.evaluate(() => window.afficherSection('accueil'));
    expect(await page.locator('#sous-navigation').isVisible()).toBe(false);
    const haut = await boite(page, '.entete');
    const bande = await boite(page, '.bande-groupe');
    expect(bande.top).toBe(haut.bottom);
    expect(await page.locator('.entete-logo img').evaluate((i) => i.currentSrc)).toMatch(/labo-codex-logo-couleur-sur-sombre\.svg$/);
    expect(await page.locator('.entete-bloc').count()).toBe(0);
});

test('iPad vertical (820) : la même disposition, mots à 7 px de marge, sur une ligne, sans toucher le Codex', async ({ page }) => {
    await ouvrirDemo(page, 820);
    // La pastille du Codex visible : c'est elle qui fixe le seuil (780 px)
    await page.evaluate(() => {
        const i = document.getElementById('codex-indicateur');
        i.classList.remove('u-hide'); i.classList.add('codex-indicateur--modifie'); i.textContent = '●';
        window.afficherSection('suivi');
    });
    const g = await page.evaluate(() => {
        const mots = [...document.querySelectorAll('.navigation-boutons > *')];
        return { tops: [...new Set(mots.map((m) => Math.round(m.getBoundingClientRect().top)))],
            marge: getComputedStyle(mots[0]).paddingLeft,
            nav: document.querySelector('.navigation-boutons').getBoundingClientRect().toJSON(),
            logo: document.querySelector('.entete-logo img').getBoundingClientRect().toJSON(),
            actions: document.querySelector('.entete-actions').getBoundingClientRect().toJSON(),
            haut: document.querySelector('.entete').getBoundingClientRect().height,
            scroll: document.documentElement.scrollWidth };
    });
    expect(g.tops).toHaveLength(1);
    expect(g.marge).toBe('7px');
    expect(g.nav.left).toBeGreaterThanOrEqual(g.logo.right + 16);
    expect(g.nav.right).toBeLessThanOrEqual(g.actions.left - 16 + 0.5);
    expect(g.haut).toBe(84);
    expect(g.scroll).toBe(820);
});

test('iPhone (390) : variante C — 56 px, logo de 40, section active, onglets qui défilent, groupe sans horaire', async ({ page }) => {
    const erreurs = [];
    await ouvrirDemo(page, 390, erreurs);
    await page.evaluate(() => window.afficherSection('suivi'));
    const haut = await boite(page, '.entete');
    expect(haut.height).toBe(56);
    expect((await boite(page, '.entete-logo img')).height).toBe(40);
    expect(await page.locator('.navigation-principale').isVisible()).toBe(false);
    await expect(page.locator('#entete-section-bouton')).toHaveText('Suivi');
    const bouton = await boite(page, '#entete-section-bouton');
    const sous = await boite(page, '#sous-navigation');
    expect(bouton.top).toBe(haut.bottom);
    expect(bouton.height).toBe(44);
    expect(sous.height).toBe(44);
    expect(sous.left).toBeGreaterThan(bouton.right);
    // Les onglets de Suivi débordent : la rangée défile, avec un fondu à droite
    const defile = await page.evaluate(() => { const n = document.getElementById('sous-navigation'); return { reste: n.scrollWidth - n.clientWidth, fondu: n.getAttribute('data-fondu') }; });
    expect(defile.reste).toBeGreaterThan(0);
    expect(defile.fondu).toBe('droite');
    const bande = await boite(page, '.bande-groupe');
    expect(bande.height).toBe(52);
    expect(await page.locator('#groupe-affichage-secondaire').isVisible()).toBe(false);
    const groupe = await boite(page, '.groupe-selecteur');
    const anon = await boite(page, '#btn-toggle-anonymisation-nav');
    expect(anon.left - groupe.right).toBe(8);
    expect(anon.right).toBeLessThanOrEqual(390 - 16);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
    expect(erreurs).toEqual([]);
});

test('iPhone (390) : la liste des sept sections, l\'active marquée ; un choix change de section et ferme la liste', async ({ page }) => {
    await ouvrirDemo(page, 390);
    await page.evaluate(() => window.afficherSection('suivi'));
    await page.locator('#entete-section-bouton').click();
    await expect(page.locator('#entete-sections-liste')).toBeVisible();
    await expect(page.locator('#entete-section-bouton')).toHaveAttribute('aria-expanded', 'true');
    expect(await page.locator('#entete-sections-liste .entete-sections-item').allTextContents())
        .toEqual(['Accueil', 'Cadre', 'Conception', 'Évaluation', 'Suivi', 'Labo', 'CoP']);
    expect(await page.locator('#entete-sections-liste [aria-current="true"]').textContent()).toBe('Suivi');
    await page.locator('#entete-sections-liste [data-param="labo"]').click();
    await expect(page.locator('#entete-sections-liste')).toBeHidden();
    await expect(page.locator('#entete-section-bouton')).toHaveText('Labo');
    expect(await page.evaluate(() => sectionActive)).toBe('labo');
    expect(await page.locator('#sous-navigation button').allTextContents())
        .toEqual(['Observation', 'Modélisation', 'Exploration', 'Rythme', 'Études', 'Bilan', 'Suivi longitudinal']);
});

test('le menu : six lignes dans l\'ordre, Réglages en dernier ; Échap, clic extérieur et choix le ferment ; le focus revient au bouton', async ({ page }) => {
    await ouvrirDemo(page, 1180);
    const bouton = page.locator('#entete-menu-bouton');
    const panneau = page.locator('#entete-menu-panneau');
    await bouton.click();
    await expect(panneau).toBeVisible();
    await expect(bouton).toHaveAttribute('aria-expanded', 'true');
    expect(await panneau.locator('.entete-menu-mot').allTextContents())
        .toEqual(['Visite guidée', 'Assistance', 'Aide', 'Signaler', 'Soutenir', 'Réglages']);
    // ~210 px (correction du 7 nov.), aligné à droite sous le bouton
    const p = await boite(page, '#entete-menu-panneau');
    const b = await boite(page, '#entete-menu-bouton');
    expect(p.width).toBe(210);
    expect(p.right).toBe(b.right);
    expect(p.top).toBeGreaterThan(b.bottom);
    // L'interrupteur d'Assistance suit son état
    const etat = await page.locator('#btn-assistance-nav').getAttribute('aria-pressed');
    expect(await page.locator('#btn-assistance-nav .entete-interrupteur').count()).toBe(1);
    // La ligne Assistance tient : le mot n'est ni coupé ni passé à la ligne, l'interrupteur reste dans le panneau
    const ligne = await page.evaluate(() => {
        const b = document.getElementById('btn-assistance-nav');
        const mot = b.querySelector('.entete-menu-mot'), inter = b.querySelector('.entete-interrupteur');
        const r = (e) => e.getBoundingClientRect();
        return { deborde: mot.scrollWidth > mot.clientWidth, hMot: r(mot).height, motDroite: r(mot).right, interGauche: r(inter).left,
            interDroite: r(inter).right, panneauDroite: r(document.getElementById('entete-menu-panneau')).right };
    });
    expect(ligne.deborde).toBe(false);
    expect(ligne.hMot).toBeLessThan(24);
    expect(ligne.motDroite).toBeLessThanOrEqual(ligne.interGauche);
    expect(ligne.interDroite).toBeLessThan(ligne.panneauDroite);
    // Échap : fermé, focus au bouton
    await page.keyboard.press('Escape');
    await expect(panneau).toBeHidden();
    await expect(bouton).toHaveAttribute('aria-expanded', 'false');
    expect(await page.evaluate(() => document.activeElement.id)).toBe('entete-menu-bouton');
    // Clic à l'extérieur
    await bouton.click();
    await page.mouse.click(700, 600);
    await expect(panneau).toBeHidden();
    // Un choix : Assistance bascule, le menu se ferme, le focus revient
    await bouton.click();
    await page.locator('#btn-assistance-nav').click();
    await expect(panneau).toBeHidden();
    expect(await page.locator('#btn-assistance-nav').getAttribute('aria-pressed')).toBe(etat === 'true' ? 'false' : 'true');
    expect(await page.evaluate(() => document.activeElement.id)).toBe('entete-menu-bouton');
    // Un choix : Réglages ouvre sa section
    await bouton.click();
    await panneau.locator('[data-param="reglages"]').click();
    await expect(panneau).toBeHidden();
    expect(await page.evaluate(() => sectionActive)).toBe('reglages');
});

test('anonymisation (820) : collée au sélecteur ; activée, contour et fond orange, icône blanche, aria-pressed', async ({ page }) => {
    await ouvrirDemo(page, 820);
    const anon = page.locator('#btn-toggle-anonymisation-nav');
    await expect(anon).toHaveAttribute('aria-pressed', 'false');
    await anon.click();
    await expect(anon).toHaveAttribute('aria-pressed', 'true');
    // Lu après la transition de 0,15 s
    await expect.poll(() => anon.evaluate((b) => ({ bord: getComputedStyle(b).borderTopColor, icone: getComputedStyle(b.querySelector('.header-icon')).backgroundColor })))
        .toEqual({ bord: 'rgb(232, 146, 58)', icone: 'rgb(255, 255, 255)' });
    expect(await page.evaluate(() => document.body.getAttribute('data-mode'))).toBe('anonymisation');
    await anon.click();
    await expect(anon).toHaveAttribute('aria-pressed', 'false');
});

test('une rangée d\'onglets qui déborde au bureau défile, avec un fondu au bord', async ({ page }) => {
    await ouvrirDemo(page, 820);
    await page.evaluate(() => window.afficherSection('conception'));
    await page.setViewportSize({ width: 560, height: 900 });
    const d = await page.evaluate(() => { const n = document.getElementById('sous-navigation'); return { reste: n.scrollWidth - n.clientWidth, fondu: n.getAttribute('data-fondu') }; });
    expect(d.reste).toBeGreaterThan(0);
    expect(d.fondu).not.toBeNull();
});

// ─── Captures pour Grégoire (CAPTURES_EN_TETE=<dossier>) ─────────────────────────────────────
const CAPTURES = process.env.CAPTURES_EN_TETE;

// Pas de délai fixe (sentinelle des pauses) : les transitions sont coupées le temps des captures,
// et chaque prise attend deux images peintes.
const peint = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

async function poserTheme(page, clair) {
    await page.evaluate((c) => { if (window.estModeClair() !== c) window.basculerTheme(); }, clair);
    await peint(page);
}

test('captures', async ({ page }) => {
    test.skip(!CAPTURES, 'CAPTURES_EN_TETE non défini');
    test.setTimeout(180000);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await ouvrirDemo(page, 1440);
    await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; animation: none !important; }' });
    // L'infobulle de l'assistance s'ouvre au toucher d'un bouton : l'assistance est coupée pour les captures,
    // sauf celle du menu ouvert, qui montre son interrupteur dans l'état où Grégoire le trouvera.
    const assistanceAuDepart = (await page.locator('#btn-assistance-nav').getAttribute('aria-pressed')) === 'true';
    const poserAssistance = async (voulu) => {
        const actuel = (await page.locator('#btn-assistance-nav').getAttribute('aria-pressed')) === 'true';
        if (actuel !== voulu) await page.evaluate(() => window.basculerAssistance());
        await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    };
    const prendre = async (nom, largeur) => {
        await page.mouse.move(largeur / 2, 880);
        await peint(page);
        await page.screenshot({ path: path.join(CAPTURES, nom + '.png'), clip: { x: 0, y: 0, width: largeur, height: 380 } });
    };
    for (const clair of [false, true]) {
        const theme = clair ? 'clair' : 'sombre';
        await poserTheme(page, clair);
        await poserAssistance(false);
        for (const largeur of [1440, 1180, 820, 390]) {
            await page.setViewportSize({ width: largeur, height: 900 });
            for (const ecran of ['accueil', 'suivi']) {
                await page.evaluate((e) => { window.scrollTo(0, 0); window.afficherSection(e); }, ecran);
                await prendre(`${ecran}-${largeur}-${theme}`, largeur);
            }
        }
        // Le menu ouvert à 1180
        await page.setViewportSize({ width: 1180, height: 900 });
        await page.evaluate(() => window.afficherSection('suivi'));
        await poserAssistance(assistanceAuDepart);
        await page.locator('#entete-menu-bouton').click();
        await expect(page.locator('#entete-menu-panneau')).toBeVisible();
        await prendre(`menu-ouvert-1180-${theme}`, 1180);
        await page.keyboard.press('Escape');
        await poserAssistance(false);
        // L'anonymisation activée à 820
        await page.setViewportSize({ width: 820, height: 900 });
        await page.locator('#btn-toggle-anonymisation-nav').click();
        await expect(page.locator('#btn-toggle-anonymisation-nav')).toHaveAttribute('aria-pressed', 'true');
        await prendre(`anonymisation-activee-820-${theme}`, 820);
        await page.locator('#btn-toggle-anonymisation-nav').click();
        await expect(page.locator('#btn-toggle-anonymisation-nav')).toHaveAttribute('aria-pressed', 'false');
        // La liste des sections ouverte à 390
        await page.setViewportSize({ width: 390, height: 900 });
        await page.locator('#entete-section-bouton').click();
        await expect(page.locator('#entete-sections-liste')).toBeVisible();
        await prendre(`sections-ouvertes-390-${theme}`, 390);
        await page.keyboard.press('Escape');
    }
    await poserAssistance(assistanceAuDepart);
});
