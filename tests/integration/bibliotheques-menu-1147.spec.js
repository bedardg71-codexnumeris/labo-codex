import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ═══════════════════════════════════════════════════════════════════════════════════════════
// #1147 (24 oct. 2026) — LES BIBLIOTHÈQUES DE LA CONCEPTION : UN MENU DÉROULANT À LA PLACE DE LA
// BARRE LATÉRALE. Consigne : plans de travail/CONSIGNE-LOT-2026-10-24-bibliotheques-menu-conception.md.
//
// Pour chacun des cinq écrans, dans le vrai index.html, depuis la démonstration :
//   · une seule rangée au-dessus de la fiche : « Consulter la bibliothèque », le menu, « + Nouvelle … »
//     à droite ; plus de barre latérale ; la fiche sur toute la largeur ;
//   · sans fiche ouverte, le menu dit « Aucune … ouverte » ;
//   · choisir dans le menu ouvre la fiche (le geste réel : `selectOption`, le dispatcher de main.js) ;
//   · « + Nouvelle … » crée, et le menu montre la création choisie ;
//   · « Fermer » remet « Aucune … ouverte ».
// Pratiques : ni « Fermer » ni ouverture après l'assistant (mesuré le 24 oct., inchangé par ce lot) — le
// banc éprouve « + Nouvelle pratique » qui ouvre l'assistant, « Dupliquer » qui montre la copie choisie, et
// le retour à l'écran qui ferme la fiche. Noms fictifs. Contexte Playwright neuf à chaque essai.
// ═══════════════════════════════════════════════════════════════════════════════════════════

const pause = (page, ms) => page.waitForTimeout(ms);

async function ouvrirDemo(page) {
    page.on('dialog', async (d) => { await d.accept(); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await pause(page, 1200);
    await page.evaluate(async () => { await window.activerModeDemo(); });
    await pause(page, 1200);
}

const ECRANS = [
    { nom: 'grille', sous: 'grille-criteres', ss: 'conception-grille-criteres', menu: 'menuGrilles', aucune: 'Aucune grille ouverte',
      fiche: 'conteneurEditionGrille', fermer: 'fermerFicheGrille', nouveau: 'creerNouvelleGrille', libelleNouveau: '+ Nouvelle grille' },
    { nom: 'échelle', sous: 'echelle-performance', ss: 'conception-echelle-performance', menu: 'menuEchelles', aucune: 'Aucune échelle ouverte',
      fiche: 'conteneurEditionEchelle', fermer: 'fermerFicheEchelle', nouveau: 'creerNouvelleEchelle', libelleNouveau: '+ Nouvelle échelle' },
    { nom: 'cartouche', sous: 'retroactions', ss: 'conception-retroactions', menu: 'menuCartouches', aucune: 'Aucune cartouche ouverte',
      fiche: 'infoCartouche', fermer: 'fermerFicheCartouche', nouveau: 'creerNouvelleCartouche', libelleNouveau: '+ Nouvelle cartouche' },
    { nom: 'production', sous: 'productions', ss: 'conception-productions', menu: 'menuProductions', aucune: 'Aucune production ouverte',
      fiche: 'formulaireProduction', fermer: 'fermerFicheProduction', nouveau: 'creerNouvelleProduction', libelleNouveau: '+ Nouvelle production' },
    { nom: 'pratique', sous: 'pratiques-notation', ss: 'conception-pratiques-notation', menu: 'menuPratiques', aucune: 'Aucune pratique ouverte',
      fiche: 'conteneurEditionPratique', fermer: null, nouveau: 'creerNouvellePratique', libelleNouveau: '+ Nouvelle pratique' }
];

const ficheOuverte = (page, id) => page.evaluate((id) => {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains('u-hide') && el.style.display !== 'none';
}, id);

/** La rangée, mesurée dans la sous-section active. */
const rangee = (page, ss) => page.evaluate((ss) => {
    const s = document.getElementById(ss);
    const r = s.querySelector('.rangee-selection');
    const enfants = [...r.children].filter(e => e.offsetParent !== null && !e.classList.contains('u-lecteur-ecran'));
    const boite = (e) => { const b = e.getBoundingClientRect(); return { g: Math.round(b.left), d: Math.round(b.right), h: Math.round(b.top), b: Math.round(b.bottom) }; };
    return {
        ordre: enfants.map(e => e.tagName === 'BUTTON' ? e.textContent.trim() : e.tagName === 'SELECT' ? 'TRI' : (e.querySelector('select') ? 'MENU' : e.tagName)),
        rangee: boite(r), zone: boite(s.querySelector('.zone-principale')),
        nouveau: boite(r.querySelector('.rangee-selection-nouveau')),
        hauteurs: enfants.map(e => (e.matches('button, select') ? e : e.querySelector('select'))).filter(Boolean).map(e => Math.round(e.getBoundingClientRect().height)),
        barres: s.querySelectorAll('.sidebar-navigation, .layout-sidebar-2col').length
    };
}, ss);

for (const e of ECRANS) {
    test(`${e.nom} : la rangée au-dessus de la fiche ; choisir ouvre la fiche ; ${e.fermer ? '« Fermer » remet' : 'revenir à l’écran remet'} « ${e.aucune} »`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirDemo(page);
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.evaluate((s) => naviguerVers('conception', s), e.sous);
        await pause(page, 900);

        // La rangée : bibliothèque, menu (et, pour les productions, l'ordre du menu), puis « + Nouvelle … » à droite.
        const r = await rangee(page, e.ss);
        console.log(e.nom.toUpperCase(), 'RANGÉE →', JSON.stringify(r));
        expect(r.barres, 'plus de barre latérale').toBe(0);
        expect(r.ordre[0]).toBe('Consulter la bibliothèque');
        expect(r.ordre[1]).toBe('MENU');
        expect(r.ordre[r.ordre.length - 1]).toBe(e.libelleNouveau);
        expect(r.rangee.d - r.nouveau.d, '« + Nouvelle … » poussé à droite').toBeLessThanOrEqual(16);
        expect(r.zone.d - r.zone.g, 'la fiche prend toute la largeur de la rangée').toBeGreaterThanOrEqual(r.rangee.d - r.rangee.g - 2);
        expect(Math.min(...r.hauteurs), 'cibles de 44 px').toBeGreaterThanOrEqual(44);

        // Sans fiche ouverte : « Aucune … ouverte », non choisissable.
        const menu = page.locator('#' + e.menu);
        await expect(menu.locator('option:checked')).toHaveText(e.aucune);
        await expect(menu.locator('option').first()).toBeDisabled();

        // Choisir dans le menu ouvre la fiche, et le menu la montre.
        const choix = await menu.locator('option').nth(1).getAttribute('value');
        await menu.selectOption(choix);
        await pause(page, 900);
        expect(await ficheOuverte(page, e.fiche), 'la fiche s’ouvre').toBe(true);
        await expect(menu).toHaveValue(choix);

        // Un autre choix : l'autre fiche.
        if (await menu.locator('option').count() > 2) {
            const autre = await menu.locator('option').nth(2).getAttribute('value');
            await menu.selectOption(autre);
            await pause(page, 900);
            await expect(page.locator('#' + e.menu)).toHaveValue(autre);
        }

        // Fermer : le menu revient à « Aucune … ouverte ».
        if (e.fermer) {
            await page.locator(`#${e.ss} button[data-action="${e.fermer}"]:visible`).first().click();
        } else {
            await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
            await pause(page, 600);
            await page.evaluate((s) => naviguerVers('conception', s), e.sous);
        }
        await pause(page, 900);
        expect(await ficheOuverte(page, e.fiche), 'la fiche est fermée').toBe(false);
        await expect(page.locator(`#${e.menu} option:checked`)).toHaveText(e.aucune);
    });
}

/** Ce que chaque « + Nouvelle … » demande avant « Créer la … » (les champs obligatoires, fictifs). */
const REMPLIR = {
    grille: async (page) => {
        await page.locator('#nomGrilleTemplate').fill('Grille fictive #1147');
    },
    'échelle': async (page) => {
        await page.locator('#nomEchelleTemplate').fill('Échelle fictive #1147');
        await page.evaluate(() => {
            window._niveauxNouvelleEchelle = [
                { code: 'A', nom: 'Acquis', min: 60, max: 100, valeurCalcul: 80, couleur: '#27ae60' },
                { code: 'N', nom: 'Non acquis', min: 0, max: 59.99, valeurCalcul: 30, couleur: '#e74c3c' }
            ];
            afficherNiveauxNouvelleEchelle();
        });
    },
    cartouche: async (page) => {
        await page.locator('#nomCartouche').fill('Cartouche fictive #1147');
        await page.evaluate(async () => {
            const g = document.getElementById('selectGrilleCartouche');
            const ech = document.getElementById('selectEchelleCartouche');
            g.value = [...g.options].find(o => o.value).value;
            ech.value = [...ech.options].find(o => o.value).value;
            await onChangeSelectionCartouche();
        });
    },
    production: async (page) => {
        await page.locator('#productionTitre').fill('Production fictive #1147');
        await page.locator('#productionType').selectOption('travail');
        await page.locator('#productionPonderation').fill('5');
        await page.locator('#productionPonderation').dispatchEvent('change');
    }
};
const CREER = { grille: '#btnCreerGrille', 'échelle': '#btnCreerEchelle', cartouche: '#btnCreerCartouche', production: '#btnCreerProduction' };
const LIRE_ID = {
    grille: () => grilleTemplateActuelle && grilleTemplateActuelle.id,
    'échelle': () => ((db.getSync(cle('echellesTemplates'), []) || []).find(x => x.nom === 'Échelle fictive #1147') || {}).id,
    cartouche: () => window.cartoucheActuel && window.cartoucheActuel.id,
    production: () => productionEnEdition
};

for (const e of ECRANS.filter(x => CREER[x.nom])) {
    test(`${e.nom} : « ${e.libelleNouveau} » crée, et le menu montre la création choisie`, async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirDemo(page);
        await page.evaluate((s) => naviguerVers('conception', s), e.sous);
        await pause(page, 900);
        const menu = page.locator('#' + e.menu);
        const avant = await menu.locator('option').count();

        await page.locator(`#${e.ss} .rangee-selection button[data-action="${e.nouveau}"]`).click();
        await pause(page, 900);
        expect(await ficheOuverte(page, e.fiche), 'la fiche neuve s’ouvre').toBe(true);
        await expect(menu.locator('option:checked'), 'en création : rien n’est encore dans le menu').toHaveText(e.aucune);

        await REMPLIR[e.nom](page);
        await page.locator(CREER[e.nom]).click();
        await pause(page, 1200);
        const id = await page.evaluate(`(${LIRE_ID[e.nom].toString()})()`);
        expect(id, 'la création est ouverte').toBeTruthy();
        await expect(page.locator('#' + e.menu).locator('option')).toHaveCount(avant + 1);
        await expect(page.locator('#' + e.menu)).toHaveValue(String(id));
        await expect(page.locator(`#${e.menu} option:checked`)).toContainText('#1147');
    });
}

test('pratique : « + Nouvelle pratique » ouvre l’assistant ; « Dupliquer » montre la copie choisie, « (active) » dit l’état', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'pratiques-notation'));
    await pause(page, 900);
    await page.locator('#conception-pratiques-notation .rangee-selection button[data-action="creerNouvellePratique"]').click();
    await pause(page, 900);
    expect(await page.evaluate(() => document.getElementById('wizard-v2-btn-creer')?.textContent.trim())).toBe('Créer la pratique');
    await page.evaluate(() => fermerWizardV2());
    await pause(page, 400);

    const menu = page.locator('#menuPratiques');
    const actives = await page.evaluate(() => [...document.getElementById('menuPratiques').options].filter(o => / \(active\)$/.test(o.textContent)).map(o => o.value));
    expect(actives, 'la démonstration assigne une pratique au groupe-cours actif : une seule dit « (active) »').toHaveLength(1);
    expect(actives[0]).toBe(await page.evaluate(() => obtenirIdPratiqueActive()));

    const choix = await menu.locator('option').nth(1).getAttribute('value');
    await menu.selectOption(choix);
    await pause(page, 900);
    const avant = await menu.locator('option').count();
    await page.locator('#conteneurEditionPratique button[data-action="dupliquerPratiqueMaterielActive"]').click();
    await pause(page, 1200);
    await expect(page.locator('#menuPratiques option')).toHaveCount(avant + 1);
    const ouverte = await page.evaluate(() => document.getElementById('menuPratiques').value);
    expect(ouverte).not.toBe(choix);
    expect(await ficheOuverte(page, 'conteneurEditionPratique')).toBe(true);
});

test('grille : l’objet ouvert depuis « Apporter mon matériel » reste choisi après le redessin de la liste (lot 3b1)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    // Le geste du lot 3b1 : ouvrir une grille d'ailleurs, puis aller à l'écran — la liste se redessine 100 ms après.
    const id = await page.evaluate(async () => {
        const g = (db.getSync(cle('grillesTemplates'), []) || []).filter(x => x.dansBibliotheque !== false)[1];
        naviguerVers('conception', 'grille-criteres');
        await chargerGrillePourModif(g.id);
        return g.id;
    });
    await pause(page, 1200);
    await expect(page.locator('#menuGrilles')).toHaveValue(id);
});

test('production : changer le tri réordonne le menu (#930 ; le tri n’était pas exposé, changer d’ordre ne redessinait rien)', async ({ page }) => {
    test.setTimeout(90000);
    await ouvrirDemo(page);
    await page.evaluate(() => naviguerVers('conception', 'productions'));
    await pause(page, 900);
    const ordre = () => page.evaluate(() => [...document.getElementById('menuProductions').options].filter(o => o.value).map(o => o.value));
    const perso = await ordre();
    await page.locator('#triProductions').selectOption('titre');
    await pause(page, 600);
    const parTitre = await ordre();
    const titres = await page.evaluate((ids) => {
        const p = db.getSync(cle('productions'), []) || [];
        return ids.map(id => (p.find(x => x.id === id) || {}).titre || '');
    }, parTitre);
    expect(titres).toEqual([...titres].sort((a, b) => a.localeCompare(b, 'fr')));
    expect([...parTitre].sort()).toEqual([...perso].sort());
});

// Verdict de relecture du lot 1, § 2 : « barre latérale » devenu « ta sélection », les sous-titres de la
// fenêtre mêlaient « Gérez » et « ta ». Les cinq, lus dans la fenêtre ouverte par le vrai bouton.
const SOUS_TITRES = {
    // ↻ #1154 (25 oct. 2026) : la fenêtre des grilles passe en deux colonnes, son en-tête tient sur une ligne
    // et n'a plus de sous-titre (consigne du lot 1, § 1.1). Ce qui tutoie maintenant, c'est la phrase sous
    // « Dans ce trimestre » : c'est elle que l'essai lit pour cette fenêtre.
    // BREAK-TEST (25 oct.) : « te propose » → « vous propose » dans grilles.js → ROUGE.
    'grille-criteres': 'Les grilles que le menu de l\'écran te propose pendant ce trimestre. Ce que tu y modifies ne change pas l\'exemplaire de ta bibliothèque.',
    'echelle-performance': 'Gère les échelles de performance de ta sélection.',
    'retroactions': 'Gère les cartouches de rétroaction de ta sélection.',
    'productions': 'Gère les productions de ta sélection.',
    'pratiques-notation': 'Gère les pratiques de notation de ta sélection.'
};

test('la fenêtre de la bibliothèque : les cinq sous-titres tutoient', async ({ page }) => {
    test.setTimeout(120000);
    await ouvrirDemo(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    const lus = {};
    for (const e of ECRANS) {
        await page.evaluate((s) => naviguerVers('conception', s), e.sous);
        await pause(page, 900);
        await page.locator(`#${e.ss} .rangee-selection button`, { hasText: 'Consulter la bibliothèque' }).click();
        const fenetre = page.locator('.modal-js-overlay:visible').last();
        await expect(fenetre).toBeVisible();
        const deuxColonnes = (await fenetre.locator('.biblio2-fenetre').count()) > 0;   // #1154
        lus[e.sous] = (await fenetre.locator(deuxColonnes ? '.biblio2-phrase' : '.modal-js-contenu > p').first().textContent()).trim();
        await fenetre.locator(deuxColonnes ? '.biblio2-fermer' : '.modal-js-btn-fermer').click();
        await expect(page.locator('.modal-js-overlay:visible')).toHaveCount(0);
    }
    expect(lus).toEqual(SOUS_TITRES);
});

test.describe('iPad portrait (WebKit, tactile)', () => {
    test.use({ hasTouch: true, viewport: { width: 820, height: 1180 } });

    test('grille : la rangée tient dans l’écran, cibles de 44 px, choisir au menu ouvre la fiche', async ({ page }) => {
        test.setTimeout(90000);
        await ouvrirDemo(page);
        await page.evaluate(() => naviguerVers('conception', 'grille-criteres'));
        await pause(page, 900);
        const r = await rangee(page, 'conception-grille-criteres');
        console.log('IPAD · RANGÉE →', JSON.stringify(r));
        expect(r.barres).toBe(0);
        expect(r.rangee.d, 'dans l’écran').toBeLessThanOrEqual(820);
        expect(Math.min(...r.hauteurs)).toBeGreaterThanOrEqual(44);
        const choix = await page.locator('#menuGrilles option').nth(1).getAttribute('value');
        await page.locator('#menuGrilles').selectOption(choix);
        await pause(page, 900);
        expect(await ficheOuverte(page, 'conteneurEditionGrille')).toBe(true);
        await expect(page.locator('#menuGrilles')).toHaveValue(choix);
        const deborde = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
        expect(deborde, 'aucun défilement horizontal').toBe(false);
    });
});
