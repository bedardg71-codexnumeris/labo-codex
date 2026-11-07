import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { attendreApplication } from './harness/attendre-application.js';

// =======================================================================
// « L'ACCUEIL ÉPURÉ » — 7 NOVEMBRE 2026 (consigne de Grégoire, esquisse 64)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-07-accueil-epure.md. Ce banc juge la géométrie et les
// gestes que la consigne fixe ; l'apparence se juge sur capture (CAPTURES_ACCUEIL=<dossier>).
//   · « À propos » : ouvert tant qu'aucun trimestre n'existe, puis le choix retenu ; la devise,
//     les quatre intertitres dans l'ordre, trois liens texte, « Par où commencer ? » et ses trois
//     vrais boutons ;
//   · plus d'« Utilitaires » ni d'« Aide », plus de case « Données démo » ni « Assistance » ;
//   · neuf tâches, trois colonnes tant qu'une carte garde 260 px, chacune dit où elle mène, et
//     y mène ; icônes d'une seule couleur, celle des liens ;
//   · pied de page à deux moitiés symétriques, logos à la même hauteur.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const indexHtml = 'file://' + path.join(path.resolve(__dirname, '..', '..'), 'index.html');

async function ouvrirAccueilVide(page, largeur, { clair = false, hauteur = 900 } = {}) {
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.setViewportSize({ width: largeur, height: hauteur });
    await page.goto(indexHtml);
    await attendreApplication(page);
    await page.evaluate(async () => {
        localStorage.clear();
        if (window.db && db.memoryCache) db.memoryCache.clear();
        await new Promise((res) => {
            const req = indexedDB.deleteDatabase('LaboCodexDB');
            req.onsuccess = req.onerror = req.onblocked = () => res();
            setTimeout(res, 1500);
        });
    });
    await page.reload();
    await attendreApplication(page);
    await page.evaluate((clair) => {
        document.body.classList.toggle('mode-clair', clair);
        window.afficherSection('accueil');
        window.afficherAccueil();
        window.scrollTo(0, 0);
    }, clair);
}

/** Un trimestre fictif, écrit dans le stockage du banc : « À propos » peut alors garder un choix. */
async function poserUnTrimestre(page) {
    await page.evaluate(() => {
        db.setSync('trimestres', [{ id: 'a2026', nom: 'Automne 2026', session: 'A', annee: 2026 }]);
        window.afficherAccueil();
    });
}

const TACHES_ATTENDUES = [
    ['Adopter ta pratique', 'Conception › Pratiques'],
    ['Planifier ton cours', 'Conception › Alignement'],
    ['Saisir les présences', 'Suivi › Présences'],
    ['Importer des copies', 'Évaluation › Préparer'],
    ['Annoter et évaluer', 'Évaluation › Annoter'],
    ['Observer le groupe', 'Suivi › Groupe'],
    ['Consulter un profil', 'Suivi › Profils'],
    ['Différencier les interventions', 'Suivi › Interventions'],
    ['Organiser tes rencontres', 'Suivi › Rencontres']
];

test('« À propos » : la devise, quatre intertitres, trois liens, « Par où commencer ? » et ses trois vrais boutons', async ({ page }) => {
    await ouvrirAccueilVide(page, 1180);
    const lu = await page.evaluate(() => {
        const b = document.getElementById('banniere-bienvenue');
        const txt = (sel) => [...b.querySelectorAll(sel)].map((e) => e.textContent.replace(/\s+/g, ' ').trim());
        return {
            replie: b.classList.contains('est-replie'),
            devise: txt('.apropos-devise'),
            intertitres: txt('.apropos-intertitre'),
            premier: b.querySelector('.apropos-colonnes p').textContent.trim().slice(0, 30),
            liens: txt('.apropos-lien'),
            label: txt('.accueil-section-label'),
            boutons: [...b.querySelectorAll('.accueil-porte button')].map((e) => [e.tagName, e.textContent.trim(), e.className.includes('btn')]),
            cp: b.querySelectorAll('.accueil-porte-desc')[2].textContent.trim(),
            corps: b.textContent,
            cop: !!b.querySelector('.apropos-deux .banniere-bienvenue-acces')
        };
    });
    expect(lu.replie, 'aucun trimestre : ouvert').toBe(false);
    expect(lu.devise).toEqual(['Suivre l’apprentissage. Soutenir l’enseignement.']);
    expect(lu.intertitres).toEqual(['Ce que fait l’application', 'Ton jugement d’abord', 'Un commun éducatif', 'Tes données chez toi']);
    expect(lu.premier).toBe('Labo Codex est une application');
    expect(lu.corps).not.toContain('Bienvenue dans Labo Codex');
    expect(lu.corps).not.toContain('Labo Codex est un outil de soutien');
    expect(lu.liens).toEqual(['Visite guidée', 'Guides pédagogiques', 'Tutoriels ↗ (s’ouvre dans un nouvel onglet)']);
    expect(lu.label).toEqual(['Par où commencer ?']);
    expect(lu.boutons).toEqual([['BUTTON', 'Commencer', true], ['BUTTON', 'Commencer', true], ['BUTTON', 'Explorer', true]]);
    expect(lu.cp).toBe('Explore un cours de démonstration déjà configuré, aux données fictives mais réalistes.');
    expect(lu.cop, 'la CoP, à droite des concepts').toBe(true);

    // Deux colonnes à 1180, empilées sous 820 px.
    const colonnes = async () => page.evaluate(() => getComputedStyle(document.querySelector('.apropos-colonnes')).gridTemplateColumns.split(' ').length);
    expect(await colonnes()).toBe(2);
    await page.setViewportSize({ width: 819, height: 900 });
    expect(await colonnes()).toBe(1);
    await page.setViewportSize({ width: 820, height: 900 });
    expect(await colonnes()).toBe(2);
});

test('« À propos » : ouvert tant qu\'aucun trimestre n\'existe ; ensuite, le choix est retenu', async ({ page }) => {
    await ouvrirAccueilVide(page, 1180);
    await page.click('.banniere-bienvenue-toggle');
    await page.evaluate(() => window.afficherAccueil());
    expect(await page.locator('#banniere-bienvenue').getAttribute('class'), 'sans trimestre, il se rouvre').not.toContain('est-replie');

    // Le choix fait sans trimestre est gardé : dès qu'un trimestre existe, il s'applique.
    await poserUnTrimestre(page);
    const classe = () => page.locator('#banniere-bienvenue').getAttribute('class');
    expect(await classe(), 'avec un trimestre, le choix (replié) est retenu').toContain('est-replie');
    await page.click('.banniere-bienvenue-toggle');
    await page.evaluate(() => window.afficherAccueil());
    expect(await classe(), 'rouvert, il reste ouvert').not.toContain('est-replie');
    await page.click('.banniere-bienvenue-toggle');
    await page.evaluate(() => window.afficherAccueil());
    expect(await classe(), 'replié, il reste replié').toContain('est-replie');
});

test('plus d\'« Utilitaires » ni d\'« Aide » : ni case « Données démo » ni case « Assistance »', async ({ page }) => {
    await ouvrirAccueilVide(page, 1180);
    const lu = await page.evaluate(() => ({
        labels: [...document.querySelectorAll('#accueil-contenu .accueil-section-label')].map((e) => e.textContent.trim()),
        cases: document.querySelectorAll('#accueil-contenu input[type="checkbox"]').length,
        texte: document.getElementById('accueil-contenu').textContent
    }));
    expect(lu.labels).toEqual(['Par où commencer ?', 'Tâches']);
    expect(lu.cases).toBe(0);
    expect(lu.texte).not.toContain('Ton codex');
    expect(lu.texte).not.toContain('Données démo');
});

test('« Explorer » entre dans la démo ; « Quitter la démo », dans le bandeau, en sort', async ({ page }) => {
    await ouvrirAccueilVide(page, 1180);
    await page.getByRole('button', { name: 'Explorer', exact: true }).click();
    await page.waitForFunction(() => window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
    await expect(page.locator('#bandeau-demo')).toBeVisible();
    // Lot 3 (7 nov. 2026) : la première entrée ouvre l'aide « Données démo » (jugée par pages-sans-doublons) ; on la ferme.
    await page.evaluate(() => window.accompagnement.fermerAide());
    await page.locator('#bandeau-demo').getByRole('button', { name: 'Quitter la démo' }).click();
    await page.waitForFunction(() => !window.estEnModeDemo(), null, { timeout: 30000 });
});

test('neuf tâches : trois colonnes à 1180, deux à 820, une à 390 ; chacune dit où elle mène', async ({ page }) => {
    await ouvrirAccueilVide(page, 1180);
    const lire = () => page.evaluate(() => {
        const cartes = [...document.querySelectorAll('.accueil-action')];
        return {
            cartes: cartes.map((c) => [c.querySelector('.accueil-action-titre').textContent.trim(), c.querySelector('.accueil-action-chemin').textContent.trim()]),
            colonnes: new Set(cartes.map((c) => Math.round(c.getBoundingClientRect().left))).size,
            largeurMin: Math.min(...cartes.map((c) => c.getBoundingClientRect().width)),
            icones: [...new Set(cartes.map((c) => getComputedStyle(c.querySelector('.accueil-icone-mask')).backgroundColor))],
            lien: (() => { const a = document.querySelector('.apropos-lien'); return getComputedStyle(a).color; })()
        };
    });
    const l1180 = await lire();
    expect(l1180.cartes).toEqual(TACHES_ATTENDUES);
    expect(l1180.colonnes).toBe(3);
    expect(l1180.icones, 'une seule couleur d\'icône').toHaveLength(1);
    expect(l1180.icones[0], 'celle des liens de la page').toBe(l1180.lien);
    await page.setViewportSize({ width: 820, height: 900 });
    const l820 = await lire();
    expect(l820.colonnes).toBe(2);
    expect(l820.largeurMin).toBeGreaterThanOrEqual(260);
    await page.setViewportSize({ width: 390, height: 844 });
    expect((await lire()).colonnes).toBe(1);
});

// Les destinations : chaque carte mène où elle le dit (constat de la consigne). « Adopter ta
// pratique » y ouvre en plus l'assistant (décision de Cowork, 7 nov.), jugé à part ci-dessous.
const DESTINATIONS = [
    ['Planifier ton cours', 'conception-carte'],
    ['Saisir les présences', 'suivi-saisie'],
    ['Importer des copies', 'evaluations-importer'],
    ['Annoter et évaluer', 'evaluations-annoter'],
    ['Observer le groupe', 'suivi-groupe'],
    ['Consulter un profil', 'suivi-profil'],
    ['Différencier les interventions', 'suivi-interventions'],
    ['Organiser tes rencontres', 'suivi-rencontres']
];

test('chaque tâche mène où elle le dit', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirAccueilVide(page, 1180);
    await page.evaluate(() => window.activerModeDemo());
    await page.waitForFunction(() => window.estEnModeDemo() && window.dbReady === true, null, { timeout: 30000 });
    for (const [titre, sousSection] of DESTINATIONS) {
        await page.evaluate(() => { window.afficherSection('accueil'); window.afficherAccueil(); });
        await page.locator('.accueil-action', { hasText: titre }).click();
        await page.waitForFunction((id) => {
            const el = document.getElementById(id);
            return el && el.classList.contains('active');
        }, sousSection, { timeout: 5000 });
    }
});

test('« Adopter ta pratique » mène à Conception › Pratiques et y ouvre l\'assistant ; le fermer laisse sur cette page', async ({ page }) => {
    await ouvrirAccueilVide(page, 1180);
    await page.locator('.accueil-action', { hasText: 'Adopter ta pratique' }).click();
    await page.waitForFunction(() => document.getElementById('conception-pratiques-notation').classList.contains('active'), null, { timeout: 5000 });
    const fenetre = page.locator('.modal-overlay.actif').first();
    await expect(fenetre).toBeVisible();
    await page.evaluate(() => window.fermerWizardV2());   // le geste de son bouton de fermeture
    await expect(fenetre).toBeHidden();
    expect(await page.evaluate(() => document.getElementById('conception-pratiques-notation').classList.contains('active'))).toBe(true);
    expect(await page.evaluate(() => document.getElementById('section-accueil').classList.contains('active'))).toBe(false);
});

test('pied de page : deux moitiés symétriques autour d\'un filet, logos à la même hauteur ; « Nouveautés » ouvre les nouveautés', async ({ page }) => {
    await ouvrirAccueilVide(page, 1180);
    const g = await page.evaluate(() => {
        const r = (s) => document.querySelector(s).getBoundingClientRect();
        const app = r('.accueil-pied-application'), cn = r('.accueil-pied-codex-numeris');
        const logos = [...document.querySelectorAll('.accueil-pied-logo')].map((i) => i.getBoundingClientRect());
        return {
            gauche: app.width, droite: cn.width,
            filet: getComputedStyle(document.querySelector('.accueil-pied-application')).borderRightWidth,
            logos: logos.map((l) => Math.round(l.height)),
            logosAlignes: Math.abs(logos[0].top - logos[1].top),
            version: document.querySelector('.accueil-pied-version').textContent.trim(),
            blogue: document.querySelector('.accueil-pied-codex-numeris a.accueil-pied-lien').textContent.trim()
        };
    });
    expect(Math.abs(g.gauche - g.droite)).toBeLessThanOrEqual(1);
    expect(g.filet).toBe('1px');
    expect(g.logos).toEqual([46, 46]);
    expect(g.logosAlignes).toBeLessThanOrEqual(1);
    expect(g.version).toMatch(/^Bêta publique \d+\.\d+\.\d+$/);
    expect(g.blogue).toBe('Le blog : codexnumeris.org (s’ouvre dans un nouvel onglet)');
    await page.getByRole('button', { name: /^Nouveautés/ }).click();
    await expect(page.locator('#modal-nouveautes, .modal-overlay.actif').first()).toBeVisible();
});

test('la visite guidée : « Bienvenue dans la visite guidée », relancée « depuis le menu, en haut à droite »', async ({ page }) => {
    await ouvrirAccueilVide(page, 1180);
    await page.getByRole('button', { name: 'Visite guidée', exact: true }).first().click();
    const bulle = page.locator('text=Bienvenue dans la visite guidée').first();
    await expect(bulle).toBeVisible();
    await expect(page.locator('text=le relancer depuis le menu, en haut à droite').first()).toBeVisible();
});

// ─── Captures pour Grégoire (CAPTURES_ACCUEIL=<dossier>) ─────────────────────────────────────
const CAPTURES = process.env.CAPTURES_ACCUEIL;

for (const largeur of [1180, 820, 390]) {
    for (const clair of [false, true]) {
        test(`captures · ${largeur} px, ${clair ? 'clair' : 'sombre'} : « À propos » ouvert, puis replié`, async ({ page }) => {
            test.skip(!CAPTURES, 'CAPTURES_ACCUEIL non défini');
            const theme = clair ? 'clair' : 'sombre';
            await ouvrirAccueilVide(page, largeur, { clair, hauteur: largeur === 390 ? 844 : 900 });
            await page.screenshot({ path: path.join(CAPTURES, `accueil-${largeur}-${theme}-ouvert.png`), fullPage: true });
            await poserUnTrimestre(page);
            await page.evaluate(() => { if (!document.getElementById('banniere-bienvenue').classList.contains('est-replie')) window.basculerBanniereBienvenue(); window.scrollTo(0, 0); });
            await page.screenshot({ path: path.join(CAPTURES, `accueil-${largeur}-${theme}-replie.png`), fullPage: true });
            if (largeur === 1180) {
                await page.locator('.accueil-pied').screenshot({ path: path.join(CAPTURES, `accueil-pied-1180-${theme}.png`) });
            }
        });
    }
}
