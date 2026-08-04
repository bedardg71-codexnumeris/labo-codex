import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Plein écran de la carte mentale (Alignement pédagogique) — 4 août 2026.
//
// Constat terrain (exercice 601-101) : en plein écran, le titre de section
// « Alignement pédagogique » et son sous-titre restaient affichés en haut à
// gauche, et la navigation principale demeurait visible par transparence.
// Cause : le conteneur passé en plein écran est la sous-section ENTIÈRE
// (#conception-carte, qui contient le h2 + p), et #conception-carte a
// background:none — contrairement à Annoter, dont le conteneur plein écran
// (#travaux-conteneur-document) est opaque et sans titre.
// Référence visuelle : plein écran de la page Annoter (rien d'autre que le
// module n'est visible).

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function attacherCaptureErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
}

async function ouvrirAppEnDemo(page) {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => window.dbReady === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await page.waitForTimeout(1500);
}

async function montrerCarteMentale(page) {
    await page.evaluate(() => {
        document.querySelectorAll('.section.active, .sous-section.active')
            .forEach(el => el.classList.remove('active'));
        document.getElementById('section-conception')?.classList.add('active');
        document.getElementById('conception-carte')?.classList.add('active');
        if (window.planificationCarte && typeof window.planificationCarte.init === 'function') {
            window.planificationCarte.init();
        }
    });
    await page.waitForTimeout(800);
}

test('plein écran carte mentale — titre de section masqué, module seul visible, retour propre', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);

    const h2 = page.locator('#conception-carte > h2');
    // Deux lignes text-muted depuis le 4 août : sous-titre + note « En évolution » (#366).
    const sousTitres = page.locator('#conception-carte > p.text-muted');
    const badge = page.locator('#conception-carte .planif-badge-evolution');

    // État normal : titre, badge « En évolution » (#366) et sous-titres sont là.
    await expect(h2).toBeVisible();
    await expect(badge).toBeVisible();
    await expect(sousTitres.first()).toBeVisible();

    // Entrer en plein écran par le vrai bouton (dispatcher data-action).
    await page.click('#planif-btn-plein-ecran');
    await page.waitForTimeout(300);

    // 1. Le titre, le badge et les deux lignes de sous-titre disparaissent.
    await expect(h2).toBeHidden();
    await expect(badge).toBeHidden();
    const nbSousTitres = await sousTitres.count();
    for (let i = 0; i < nbSousTitres; i++) {
        await expect(sousTitres.nth(i)).toBeHidden();
    }

    // 2. Le module occupe le viewport depuis le bord haut : le wrapper opaque
    //    commence à y=0 (c'est lui qui couvre la navigation principale,
    //    comme le conteneur d'Annoter).
    const wrapperTop = await page.evaluate(() => {
        return document.querySelector('#conception-carte .planif-wrapper')
            .getBoundingClientRect().top;
    });
    expect(wrapperTop).toBe(0);

    // 3. La navigation principale est masquée (demande terrain du 4 août :
    //    rien d'autre que le module en plein écran, comme Annoter).
    await expect(page.locator('.navigation-principale')).toBeHidden();

    // Sortir du plein écran (Échap) : le titre et la navigation reviennent.
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    await expect(h2).toBeVisible();
    await expect(sousTitres.first()).toBeVisible();
    await expect(page.locator('.navigation-principale')).toBeVisible();

    expect(erreurs).toEqual([]);
});

test('palette Navigation — sommaire Vue globale › séquences › leçons, barre sans carrousels', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);

    await page.evaluate(() => {
        window.planificationCarte.injecterNoeuds([
            { id: 'seqT1', type: 'sequence', titre: 'Séquence test 1', x: 400, y: 100, enfants: ['lecT1'] },
            { id: 'lecT1', type: 'lecon', titre: 'Leçon test 1', x: 430, y: 160, parent: 'seqT1' },
            { id: 'seqT2', type: 'sequence', titre: 'Séquence test 2', x: 900, y: 400, enfants: [] }
        ]);
    });
    await page.waitForTimeout(500);

    // Refonte du 4 août 2026 (exercice 601-101) : la navigation vit dans la
    // palette « Navigation » (sommaire vertical), plus dans la barre d'outils.
    await expect(page.locator('#planif-toolbar-sequences')).toHaveCount(0);
    await expect(page.locator('#planif-nav-seq')).toHaveCount(0);
    await expect(page.locator('#planif-toolbar-lecons')).toHaveCount(0);
    await expect(page.locator('#planif-btn-largeur')).toHaveCount(0);
    await expect(page.locator('#planif-btn-hauteur')).toHaveCount(0);

    // Le bouton Recentrer remplace les zooms pleine largeur/hauteur.
    await expect(page.locator('#planif-btn-recentrer')).toBeVisible();

    const globale = page.locator('#planif-sommaire .planif-som-globale');
    const sequencesSom = page.locator('#planif-sommaire .planif-som-seq');
    const leconsSom = page.locator('#planif-sommaire .planif-som-lecon');

    // Sommaire complet : Vue globale (active par défaut) + toutes les
    // séquences + toutes les leçons, visibles d'un coup.
    await expect(globale).toBeVisible();
    await expect(globale).toHaveClass(/actif/);
    const nbSeq = await sequencesSom.count();
    expect(nbSeq).toBeGreaterThanOrEqual(2);
    await expect(leconsSom.filter({ hasText: 'Leçon test 1' })).toHaveCount(1);

    // Ouvrir une séquence depuis le sommaire → elle devient active.
    await sequencesSom.filter({ hasText: 'Séquence test 2' }).click();
    await page.waitForTimeout(400);
    await expect(globale).not.toHaveClass(/actif/);
    await expect(sequencesSom.filter({ hasText: 'Séquence test 2' })).toHaveClass(/actif/);

    // Cliquer une leçon d'une AUTRE séquence : bascule de séquence parente
    // + ouverture de la vue leçon (niveau micro).
    await leconsSom.filter({ hasText: 'Leçon test 1' }).click();
    await page.waitForTimeout(400);
    await expect(sequencesSom.filter({ hasText: 'Séquence test 1' })).toHaveClass(/actif/);
    await expect(leconsSom.filter({ hasText: 'Leçon test 1' })).toHaveClass(/actif/);
    await expect(page.locator('#planif-vue-lecon')).toBeVisible();

    // Retour Vue globale : canevas restauré, plus aucune séquence active.
    await globale.click();
    await page.waitForTimeout(400);
    await expect(globale).toHaveClass(/actif/);
    await expect(page.locator('#planif-sommaire .planif-som-seq.actif')).toHaveCount(0);
    await expect(page.locator('#planif-vue-lecon')).toBeHidden();

    expect(erreurs).toEqual([]);
});

test('Alt/⌥+glisser un bloc — crée un doublon qui suit la souris, la source ne bouge pas', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);

    await page.evaluate(() => {
        window.planificationCarte.injecterNoeuds([
            { id: 'actAlt1', type: 'activite', titre: 'Activité à dupliquer', x: 600, y: 300 }
        ]);
    });
    await page.waitForTimeout(400);

    const avant = await page.evaluate(() => window.planificationCarte.etat.noeuds.size);

    // Le canevas est un grand espace défilable et le bas de l'écran est occupé
    // par le bandeau/popup du mode démo : plutôt que de défiler (borné, fragile),
    // TÉLÉPORTER le nœud en coordonnées données vers un point visible du haut
    // du canevas — position d'écran connue, clic garanti.
    await page.evaluate(() => {
        const zone = document.getElementById('planif-zone-travail');
        const el = document.getElementById('actAlt1');
        const zr = zone.getBoundingClientRect();
        const r = el.getBoundingClientRect();
        const n = window.planificationCarte.etat.noeuds.get('actAlt1');
        const zoom = window.planificationCarte.etat.zoom || 1;
        n.x += ((zr.x + 320) - r.x) / zoom;
        n.y += ((zr.y + 120) - r.y) / zoom;
        el.style.left = n.x + 'px';
        el.style.top = n.y + 'px';
    });
    await page.waitForTimeout(200);
    const box = await page.locator('#actAlt1').boundingBox();
    const posAvant = await page.evaluate(() => {
        const n = window.planificationCarte.etat.noeuds.get('actAlt1');
        return { x: n.x, y: n.y };
    });
    // Saisir le bloc par son EN-TÊTE : le centre est le titre contenteditable,
    // que le drag (normal comme Alt) ignore par conception (clic = édition).
    await page.keyboard.down('Alt');
    await page.mouse.move(box.x + box.width / 2, box.y + 10);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 150, box.y + 10 + 90, { steps: 5 });
    await page.mouse.up();
    await page.keyboard.up('Alt');
    await page.waitForTimeout(400);

    const apres = await page.evaluate(() => {
        const noeuds = Array.from(window.planificationCarte.etat.noeuds.values());
        const source = noeuds.find(n => n.id === 'actAlt1');
        const clone = noeuds.find(n => n.id !== 'actAlt1' && n.cloneSourceId === 'actAlt1');
        return {
            total: noeuds.length,
            source: { x: source.x, y: source.y },
            clone: clone ? { titre: clone.titre, x: clone.x, y: clone.y } : null
        };
    });

    // Un doublon existe, marqué clone de la source (indicateur 🎯 existant).
    expect(apres.total).toBe(avant + 1);
    expect(apres.clone).not.toBeNull();
    expect(apres.clone.titre).toBe('Activité à dupliquer');
    // La source n'a pas bougé ; le clone a suivi la souris (+150/+90 px écran).
    expect(apres.source.x).toBe(posAvant.x);
    expect(apres.source.y).toBe(posAvant.y);
    expect(apres.clone.x).toBeGreaterThan(posAvant.x + 100);
    expect(apres.clone.y).toBeGreaterThan(posAvant.y + 50);

    expect(erreurs).toEqual([]);
});

test('comptabilité du temps — rollup activités→leçon→séquence, périodes du cadre, jauge indicative', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);

    await page.evaluate(() => {
        // Durée de période du cadre = 50 min (source unique, Cadre › Horaire)
        db.setSync(window.cle('dureePeriode'), 50);
        // Heures d'enseignement (RREC) du cours actif : 1,5 h
        const cours = db.getSync('cours', []);
        if (cours.length) { cours.forEach(c => { if (c.actif) c.heuresContact = 1.5; }); db.setSync('cours', cours); }
        window.planificationCarte.injecterNoeuds([
            { id: 'seqR', type: 'sequence', titre: 'Séquence rollup', x: 400, y: 100, enfants: ['lecR'] },
            { id: 'lecR', type: 'lecon', titre: 'Leçon rollup', x: 430, y: 160, parent: 'seqR', enfants: ['actR1', 'actR2'] },
            { id: 'actR1', type: 'activite', titre: 'Act 1', x: 460, y: 210, parent: 'lecR', metadata: { duree: 60 } },
            { id: 'actR2', type: 'activite', titre: 'Act 2', x: 620, y: 210, parent: 'lecR', metadata: { duree: 35 } }
        ]);
    });
    await page.waitForTimeout(500);

    // Rollup : 60 + 35 = 95 min ; à 50 min/pér → « 1,9 pér. » sur la leçon
    // ET sur la séquence (somme de ses leçons).
    const pillLecon = page.locator('#planif-sommaire .planif-som-lecon', { hasText: 'Leçon rollup' }).locator('.planif-som-pill');
    const pillSeq = page.locator('#planif-sommaire .planif-som-seq', { hasText: 'Séquence rollup' }).locator('.planif-som-pill');
    await expect(pillLecon).toHaveText(/1,9\s*pér\./);
    await expect(pillSeq).toHaveText(/1,9\s*pér\./);

    // Jauge indicative au pied de la palette : total, heures du cadre, rappel
    // de la durée de période — et teinte « cible » (95 min ≈ 1,58 h / 1,5 h).
    const jauge = page.locator('#planif-jauge-temps');
    await expect(jauge).toBeVisible();
    await expect(jauge).toContainText('Total planifié');
    await expect(jauge).toContainText('1,5');
    await expect(jauge).toContainText('1 pér. = 50 min');
    await expect(jauge).toHaveClass(/planif-jauge-cible/);

    // Preuve « rien en dur » : changer la durée de période du cadre à 25 min
    // → les mêmes 95 min deviennent 3,8 pér. après rafraîchissement.
    await page.evaluate(() => {
        db.setSync(window.cle('dureePeriode'), 25);
        window.planificationCarte.mettreAJourSommaire();
    });
    await page.waitForTimeout(300);
    await expect(pillLecon).toHaveText(/3,8\s*pér\./);
    await expect(jauge).toContainText('1 pér. = 25 min');

    expect(erreurs).toEqual([]);
});

test('renommer la carte — via le menu Actions, le titre central est retiré', async ({ page }) => {
    // Accepter le prompt de renommage (enregistré AVANT le dismiss générique
    // du helper : le premier handler gagne, le dismiss tardif est toléré).
    page.on('dialog', (d) => {
        if (d.type() === 'prompt') d.accept('Carte renommée par test').catch(() => {});
    });
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);

    // L'ancien titre éditable du centre de la barre n'existe plus (4 août 2026 :
    // il dupliquait le sélecteur de gauche — le renommage vit dans Actions).
    await expect(page.locator('#planif-titre-carte')).toHaveCount(0);

    // Ouvrir le menu Actions → « Renommer cette carte » présent.
    await page.click('#planif-btn-actions');
    const itemRenommer = page.locator('#planif-btn-renommer-carte');
    await expect(itemRenommer).toBeVisible();

    // Renommer (le prompt est auto-accepté avec le nouveau nom).
    await itemRenommer.click();
    await page.waitForTimeout(400);

    // Le sélecteur de gauche reflète le nouveau nom (source unique : l'index).
    const nomSelectionne = await page.evaluate(() => {
        const sel = document.getElementById('planif-liste-cartes');
        return sel.options[sel.selectedIndex]?.textContent;
    });
    expect(nomSelectionne).toBe('Carte renommée par test');

    expect(erreurs).toEqual([]);
});
