import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Preuve d'intégration — import inter-trimestre de cartouches (24 août 2026).
//
// La sentinelle unitaire jumelle (unit/cartouches-import-trimestre.test.js)
// éprouve le MOTEUR de copie contre un faux magasin. Elle ne dit rien de
// l'écran : ni que la section s'affiche, ni que les boutons appellent la bonne
// fonction, ni que le dispatcher passe bien TROIS paramètres (srcId, grilleId,
// cartoucheId) — un point qu'aucun test de logique pure ne peut couvrir.
//
// Ces cas-là ouvrent le vrai index.html et pilotent l'interface réelle.

const SEMER = `async () => {
    db.setSync('trimestres', [
        { id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: true },
        { id: 'a2025', nom: 'Automne 2025', annee: 2025, session: 'A', actif: false, archive: true }
    ]);
    db.setSync('trimestreActif', 'h2026');

    // security-ok: fixtures littérales écrites par le spec, aucune source externe.
    await db.set('a2025_grillesTemplates', [{
        id: 'GRILLE_A25', nom: 'Grille-5 FR-HOLIS A25',
        criteres: [{ id: 'C1', nom: 'Structure', ponderation: 20 }],
        dansBibliotheque: true
    }]);
    await db.set('a2025_cartouches_GRILLE_A25', [
        { id: 'CART_1', nom: 'Stratégies de lecture', grilleId: 'GRILLE_A25', commentaires: { C1_I: 'À retravailler.' } },
        { id: 'CART_2', nom: 'Plan de rédaction', grilleId: 'GRILLE_A25', commentaires: { C1_I: 'Structure à revoir.' } }
    ]);
    await db.set('h2026_grillesTemplates', []);
}`;

async function ouvrir(page) {
    page.on('dialog', (d) => d.dismiss().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
}

test('PREUVE · la section « Importer depuis un autre trimestre » apparaît, avec le bon compte', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        const liste = await listerTrimestresAvecCartouches();
        await afficherBibliothequeCartouches();
        await new Promise(res => setTimeout(res, 400));
        const select = document.getElementById('selectTrimestreImportCartouches');
        return {
            liste,
            selectPresent: !!select,
            options: select ? [...select.options].map(o => o.textContent.trim()) : []
        };
    }, SEMER);

    console.log('SECTION →', JSON.stringify(r, null, 1));
    expect(r.liste).toHaveLength(1);
    expect(r.liste[0].nombre, 'les deux cartouches archivées sont comptées').toBe(2);
    expect(r.selectPresent, 'le sélecteur de trimestre est rendu dans le modal').toBe(true);
    expect(r.options.join(' ')).toContain('Automne 2025 (2 cartouches)');
});

test('PREUVE · trimestre VIVANT (jamais archivé) : la section apparaît quand même', async ({ page }) => {
    // C'est le cas de Grégoire, et c'est la régression du 24 août : la première
    // version ne lisait que les copies d'archive `<src>_cartouches_<grille>`, alors
    // que depuis #358 un trimestre VIVANT a ses grilles namespacées et ses cartouches
    // dans la clé GLOBALE. La section était invisible pour le cas le plus courant.
    // Reproduit ici avant d'être corrigé.
    await ouvrir(page);
    const r = await page.evaluate(async () => {
        db.setSync('trimestres', [
            { id: 'a2026', nom: 'Automne 2026', annee: 2026, session: 'A', actif: true },
            { id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: false }
        ]);
        db.setSync('trimestreActif', 'a2026');
        // security-ok: fixtures littérales écrites par le spec, aucune source externe.
        await db.set('a2026_grillesTemplates', []);
        await db.set('h2026_grillesTemplates', [{ id: 'GR_H26', nom: 'Grille-5 FR-HOLIS H26', criteres: [], dansBibliotheque: true }]);
        // AUCUNE copie d'archive : ce trimestre n'a jamais été archivé.
        // security-ok: fixture de test, littéral écrit par le spec — aucune source externe.
        await db.set('cartouches_GR_H26', [
            { id: 'C1', nom: 'Stratégies de lecture', grilleId: 'GR_H26', commentaires: {} },
            { id: 'C2', nom: 'Plan de rédaction', grilleId: 'GR_H26', commentaires: {} }
        ]);

        const liste = await listerTrimestresAvecCartouches();
        await afficherBibliothequeCartouches();
        await new Promise(res => setTimeout(res, 400));
        const select = document.getElementById('selectTrimestreImportCartouches');
        return {
            liste,
            sectionRendue: !!select,
            options: select ? [...select.options].map(o => o.textContent.trim()) : []
        };
    });

    console.log('TRIMESTRE VIVANT →', JSON.stringify(r, null, 1));
    expect(r.liste, 'un trimestre vivant doit être proposé').toHaveLength(1);
    expect(r.liste[0].nombre).toBe(2);
    expect(r.sectionRendue, 'la section doit être rendue — c\'est le bug de la capture').toBe(true);
    expect(r.options.join(' ')).toContain('Hiver 2026 (2 cartouches)');
});

test('PREUVE · « Voir les cartouches » liste les cartouches groupées par leur grille', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await afficherBibliothequeCartouches();
        await new Promise(res => setTimeout(res, 400));
        document.getElementById('selectTrimestreImportCartouches').value = 'a2025';
        await afficherCartouchesTrimestreModal();
        await new Promise(res => setTimeout(res, 300));
        const preview = document.getElementById('previewCartouchesTrimestre');
        return {
            visible: !preview.classList.contains('u-hide'),
            texte: preview.textContent.replace(/\\s+/g, ' ').trim(),
            boutons: [...preview.querySelectorAll('[data-action="importerUneCartoucheTrimestre"]')]
                .map(b => ({ p1: b.dataset.param, p2: b.dataset.param2, p3: b.dataset.param3 }))
        };
    }, SEMER);

    console.log('APERÇU →', JSON.stringify(r, null, 1));
    expect(r.visible).toBe(true);
    expect(r.texte).toContain('Grille-5 FR-HOLIS A25');
    expect(r.texte, 'la mention dit ce qui va arriver à la grille').toContain('sa grille sera copiée avec elle');
    expect(r.boutons, 'un bouton Importer par cartouche').toHaveLength(2);
    // Le dispatcher de main.js ne passe param3 que s'il est présent : sans lui,
    // importerUneCartoucheTrimestre recevrait `undefined` comme id de cartouche.
    expect(r.boutons[0]).toEqual({ p1: 'a2025', p2: 'GRILLE_A25', p3: 'CART_1' });
});

test('PREUVE · importer une cartouche copie sa grille et une SEULE cartouche', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await importerUneCartoucheTrimestre('a2025', 'GRILLE_A25', 'CART_1');
        await new Promise(res => setTimeout(res, 500));

        const grilles = await db.get('h2026_grillesTemplates') || [];
        const cartouches = grilles.length ? (await db.get('cartouches_' + grilles[0].id) || []) : [];
        return {
            nbGrilles: grilles.length,
            nomGrille: grilles[0] && grilles[0].nom,
            provenance: grilles[0] && grilles[0].inspireDeTrimestre,
            nbCartouches: cartouches.length,
            nomCartouche: cartouches[0] && cartouches[0].nom,
            sourceIntacte: (await db.get('a2025_cartouches_GRILLE_A25') || []).length,
            toasts: [...document.querySelectorAll('.notification-succes')].map(n => n.textContent.trim())
        };
    }, SEMER);

    console.log('IMPORT →', JSON.stringify(r, null, 1));
    expect(r.nbGrilles, 'la grille parente est copiée').toBe(1);
    expect(r.provenance).toBe('a2025');
    expect(r.nbCartouches, 'une seule cartouche, pas les deux').toBe(1);
    expect(r.nomCartouche).toBe('Stratégies de lecture');
    expect(r.sourceIntacte, 'le trimestre source garde ses deux cartouches').toBe(2);
    expect(r.toasts.join(' ')).toContain('importée dans ce trimestre');
});

test('PREUVE · réimporter la même cartouche ne crée pas de doublon', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await importerUneCartoucheTrimestre('a2025', 'GRILLE_A25', 'CART_1');
        await new Promise(res => setTimeout(res, 400));
        // Second import : la grille copiée porte inspireDe.sourceId = GRILLE_A25,
        // donc la cartouche doit se RATTACHER, et la garde d'identité la refuser.
        await importerUneCartoucheTrimestre('a2025', 'GRILLE_A25', 'CART_1');
        await new Promise(res => setTimeout(res, 400));

        const grilles = await db.get('h2026_grillesTemplates') || [];
        const cartouches = grilles.length ? (await db.get('cartouches_' + grilles[0].id) || []) : [];
        return {
            nbGrilles: grilles.length,
            nbCartouches: cartouches.length,
            toasts: [...document.querySelectorAll('.notification-succes')].map(n => n.textContent.trim())
        };
    }, SEMER);

    console.log('DOUBLON →', JSON.stringify(r, null, 1));
    expect(r.nbGrilles, 'aucune SECONDE grille : le rattachement par lignée a joué').toBe(1);
    expect(r.nbCartouches, 'aucun second exemplaire de la cartouche').toBe(1);
    expect(r.toasts.join(' ')).toContain('est déjà dans ce trimestre');
});

test('PREUVE · « Tout importer » copie le lot entier sous UNE seule grille', async ({ page }) => {
    // Ce cas-ci ACCEPTE la confirmation native, au lieu de la rejeter comme
    // `ouvrir()` : c'est le geste réel de l'enseignant qui dit oui.
    page.on('dialog', (d) => d.accept().catch(() => {}));
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    const r = await page.evaluate(async (semer) => {
        await eval(semer)();
        await afficherBibliothequeCartouches();
        await new Promise(res => setTimeout(res, 400));
        document.getElementById('selectTrimestreImportCartouches').value = 'a2025';
        await importerToutCartouchesTrimestreModal();
        await new Promise(res => setTimeout(res, 600));

        const grilles = await db.get('h2026_grillesTemplates') || [];
        const cartouches = grilles.length ? (await db.get('cartouches_' + grilles[0].id) || []) : [];
        return {
            nbGrilles: grilles.length,
            nbCartouches: cartouches.length,
            noms: cartouches.map(c => c.nom).sort(),
            sourceIntacte: (await db.get('a2025_cartouches_GRILLE_A25') || []).length,
            toasts: [...document.querySelectorAll('.notification-succes')].map(n => n.textContent.trim())
        };
    }, SEMER);

    console.log('TOUT IMPORTER →', JSON.stringify(r, null, 1));
    // Les DEUX cartouches partagent la même grille source : la première la fait
    // copier, la seconde doit se RATTACHER à cette copie — pas en créer une autre.
    expect(r.nbGrilles, 'une seule grille pour les deux cartouches').toBe(1);
    expect(r.nbCartouches).toBe(2);
    expect(r.noms).toEqual(['Plan de rédaction', 'Stratégies de lecture']);
    expect(r.sourceIntacte).toBe(2);
    expect(r.toasts.join(' ')).toContain('Import terminé');
});

test('PREUVE · sans trimestre source, aucune section n\'est rendue', async ({ page }) => {
    await ouvrir(page);
    const r = await page.evaluate(async () => {
        db.setSync('trimestres', [{ id: 'h2026', nom: 'Hiver 2026', annee: 2026, session: 'H', actif: true }]);
        db.setSync('trimestreActif', 'h2026');
        // security-ok: fixture de test, littéral écrit par le test lui-même — aucune source externe.
        await db.set('h2026_grillesTemplates', []);
        await afficherBibliothequeCartouches();
        await new Promise(res => setTimeout(res, 400));
        return {
            liste: await listerTrimestresAvecCartouches(),
            selectPresent: !!document.getElementById('selectTrimestreImportCartouches')
        };
    });

    console.log('AUCUNE SOURCE →', JSON.stringify(r));
    expect(r.liste).toEqual([]);
    expect(r.selectPresent, 'pas de section vide qui ne mène nulle part').toBe(false);
});
