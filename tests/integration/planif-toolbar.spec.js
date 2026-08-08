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

test('planificateur — il CADRE la carte, il ne la filtre plus ; palettes commandées par la barre', async ({ page }) => {
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
    // palette, plus dans la barre d'outils.
    await expect(page.locator('#planif-toolbar-sequences')).toHaveCount(0);
    await expect(page.locator('#planif-nav-seq')).toHaveCount(0);
    await expect(page.locator('#planif-toolbar-lecons')).toHaveCount(0);
    await expect(page.locator('#planif-btn-largeur')).toHaveCount(0);
    await expect(page.locator('#planif-btn-hauteur')).toHaveCount(0);
    await expect(page.locator('#planif-btn-recentrer')).toBeVisible();

    const sequencesSom = page.locator('#planif-sommaire .planif-som-seq');
    const leconsSom = page.locator('#planif-sommaire .planif-som-lecon');

    // ▣ 7 AOÛT (soir) — « Vue globale » est RETIRÉ : le canevas ne se filtre
    // plus, il n'y a donc plus de vue à quitter pour y revenir.
    await expect(page.locator('#planif-sommaire .planif-som-globale')).toHaveCount(0);
    await expect(page.locator('#planif-vue-lecon')).toHaveCount(0);

    const nbSeq = await sequencesSom.count();
    expect(nbSeq).toBeGreaterThanOrEqual(2);
    await expect(leconsSom.filter({ hasText: 'Leçon test 1' })).toHaveCount(1);

    // LE POINT CENTRAL DU CHANTIER : désigner une séquence la SÉLECTIONNE et
    // cadre la carte dessus — sans faire disparaître quoi que ce soit. Avant,
    // ce clic masquait tout le reste du canevas.
    await sequencesSom.filter({ hasText: 'Séquence test 2' }).click();
    await page.waitForTimeout(400);
    await expect(sequencesSom.filter({ hasText: 'Séquence test 2' })).toHaveClass(/actif/);
    // La séquence 1 et sa leçon sont TOUJOURS rendues sur le canevas.
    await expect(page.locator('#seqT1')).toBeVisible();
    await expect(page.locator('#lecT1')).toBeVisible();

    // Idem pour une leçon : elle se sélectionne, le canevas reste entier, et
    // AUCUNE vue de lecture ne vient se substituer à lui.
    await leconsSom.filter({ hasText: 'Leçon test 1' }).click();
    await page.waitForTimeout(400);
    await expect(leconsSom.filter({ hasText: 'Leçon test 1' })).toHaveClass(/actif/);
    await expect(page.locator('#seqT2')).toBeVisible();
    await expect(page.locator('#planif-zone-travail')).toBeVisible();

    // Une séquence n'est jamais rendue en bloc « compact » : la compaction est
    // retirée avec le filtrage dont elle était le compagnon.
    await expect(page.locator('.planif-seq-compact')).toHaveCount(0);

    // Les deux palettes se commandent depuis la barre d'outils, et l'ancien
    // bouton de repli a disparu de leur barre de titre.
    await expect(page.locator('.planif-palette-replier')).toHaveCount(0);
    const btnPlanif = page.locator('#planif-btn-palette-planificateur');
    await expect(btnPlanif).toBeVisible();
    await expect(btnPlanif).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#planif-palette-nav')).toBeVisible();

    await btnPlanif.click();
    await page.waitForTimeout(300);
    await expect(btnPlanif).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#planif-palette-nav')).toBeHidden();

    await btnPlanif.click();
    await page.waitForTimeout(300);
    await expect(page.locator('#planif-palette-nav')).toBeVisible();

    // Symétrie : la palette « Nœuds » se commande exactement pareil.
    const btnNoeuds = page.locator('#planif-btn-palette-noeuds');
    await btnNoeuds.click();
    await page.waitForTimeout(300);
    await expect(page.locator('#planif-palette')).toBeHidden();
    await btnNoeuds.click();
    await page.waitForTimeout(300);
    await expect(page.locator('#planif-palette')).toBeVisible();

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

test('import inter-trimestre — copie vers le trimestre actif, source intacte, notes de séance suivies', async ({ page }) => {
    const erreurs = [];
    attacherCaptureErreurs(page, erreurs);
    await ouvrirAppEnDemo(page);
    await montrerCarteMentale(page);
    await page.evaluate(() => window.planificationCarte.initialiser());
    await page.waitForTimeout(400);

    // Semer un trimestre source avec une carte (leçon + activité) et une note
    // de séance rattachée à la leçon.
    const sourceAvant = await page.evaluate(() => {
        const trimestres = db.getSync('trimestres', []) || [];
        trimestres.push({ id: 'h9099', nom: 'Hiver 9099 (test)' });
        db.setSync('trimestres', trimestres); // security-ok: fixture de test locale
        const doc = {
            index: { active: 'carte_1', compteurCartes: 1, cartes: [{ id: 'carte_1', nom: 'Alignement 601-101 test', dateCreation: '2026-01-01' }] },
            cartes: { carte_1: { compteur: 3, compteurLiens: 0, noeuds: [
                { id: 'pl_seq1', type: 'sequence', titre: 'Séq source', x: 100, y: 100, enfants: ['pl_lec1'], parent: null },
                { id: 'pl_lec1', type: 'lecon', titre: 'Leçon source', x: 130, y: 160, enfants: ['pl_act1'], parent: 'pl_seq1' },
                { id: 'pl_act1', type: 'activite', titre: 'Act source', x: 160, y: 210, enfants: [], parent: 'pl_lec1', metadata: { duree: 40 } }
            ], liens: [] } }
        };
        db.setSync('h9099_planification_mindmap', doc); // security-ok: fixture de test locale
        // NB (re-diagnostic 4 août) : en PRODUCTION, planification_seances est
        // aujourd'hui une clé NUE partagée entre trimestres (cf. BACKLOG #367) —
        // cette fixture préfixée teste le monde POST-migration ; d'ici là, la
        // copie est un no-op et les notes suivent via la clé partagée.
        db.setSync('h9099_planification_seances', { pl_lec1: { objectifPersonnalise: 'Objectif migré', notes: 'Note migrée' } }); // security-ok: fixture de test locale
        return JSON.stringify(db.getSync('h9099_planification_mindmap'));
    });

    // Menu Actions → « Importer d'un autre trimestre… » → le panneau liste la carte
    await page.click('#planif-btn-actions');
    await page.click('#planif-btn-import-trimestre');
    const panneau = page.locator('#planif-import-tri-panel');
    await expect(panneau).toBeVisible();
    await expect(panneau).toContainText('Hiver 9099 (test)');
    await expect(panneau).toContainText('Alignement 601-101 test');
    await expect(panneau).toContainText('3 nœuds');

    // Importer → la carte devient active dans le trimestre courant
    await panneau.locator('.planif-import-tri-btn').first().click();
    await page.waitForTimeout(500);

    const resultat = await page.evaluate(() => {
        const sel = document.getElementById('planif-liste-cartes');
        const index = window.planificationDonnees.getIndex();
        const entree = index.cartes.find(c => c.id === index.active);
        const seances = db.getSync(window.cle('planification_seances'), {});
        return {
            nomActif: sel.options[sel.selectedIndex]?.textContent,
            importeDe: entree && entree.importeDe ? entree.importeDe.trimestre : null,
            nbNoeudsCharges: window.planificationCarte.etat.noeuds.size,
            noteSuivie: seances.pl_lec1 ? seances.pl_lec1.notes : null,
            sourceApres: JSON.stringify(db.getSync('h9099_planification_mindmap'))
        };
    });

    expect(resultat.nomActif).toBe('Alignement 601-101 test');
    expect(resultat.importeDe).toBe('h9099');
    expect(resultat.nbNoeudsCharges).toBe(3);
    // Les Objectif/Notes de la vue leçon ont suivi la carte (ids préservés).
    expect(resultat.noteSuivie).toBe('Note migrée');
    // LE point non négociable : la source n'a pas bougé d'un octet.
    expect(resultat.sourceApres).toBe(sourceAvant);

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
