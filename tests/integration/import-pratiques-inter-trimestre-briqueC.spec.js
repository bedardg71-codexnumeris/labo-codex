import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// ============================================================================
// Brique C du PLAN-namespacing-par-trimestre — pas 5 (cadrage C/D §2.5).
// Import inter-trimestre de PRATIQUES = COPIE : une pratique d'un trimestre
// source est dupliquée dans le trimestre ACTIF (id neuf + trace inspireDe), la
// source n'est JAMAIS mutée.
//
// Ce filet exerce le CHEMIN RÉEL chargé dans WebKit (pas une réimplémentation) :
//   cleSource() (trimestres.js) → copierPratiqueDepuisTrimestre() (pratiques-gestion.js).
//
// DIVERGENCE structurante vs les grilles (pas 4), verrouillée ici :
//   pratiquesConfigurables ∈ CLES_NAMESPACEES → cleSource('pratiquesConfigurables',
//   srcId) rend TOUJOURS <srcId>_pratiquesConfigurables. Donc TOUS les trimestres
//   ≠ actif ayant des pratiques sont des sources (y compris un trimestre VIVANT),
//   PAS seulement les archivés à copie propre comme les grilles. La destination
//   est la clé NAMESPACÉE de l'actif (cle('pratiquesConfigurables')), pas une clé
//   globale nue → le test lit la destination via window.cle().
//
// Invariants verrouillés :
//   1. LISTING — listerTrimestresAvecPratiques() retient tout trimestre ≠ actif
//      ayant des pratiques (dansBibliotheque !== false), même vivant ; exclut l'actif.
//   2. GARDE D-C7 — actif archivé → [] (cible jamais archivée, lecture seule).
//   3. PREVIEW — « Voir les pratiques » révèle réellement le preview (classe u-hide,
//      pas display:none inline — anti-régression du bug preview des biblios).
//   4. COPIE — id neuf, inspireDe = id source, inspireDeTrimestre = source ;
//      destination = cle('pratiquesConfigurables') ; SOURCE intacte byte-à-byte.
//   5. OPTION A (dépendances) — echelleId/grilleId NON remappés ; verifier renvoie
//      les dépendances absentes du catalogue actif (échelle / grille) pour avertir.
//   6. COPIE PROFONDE — la copie ne partage aucune référence de sous-objet avec la
//      source (deep-clone, pas `{...source}`). Verrouillé en INTER-trimestre par le
//      cas 6, et en INTRA-trimestre (dupliquerPratiqueBibliotheque) par la sentinelle
//      sœur en fin de fichier (durcissement révélé par la revue adverse du pas 5).
//
// BREAK-TEST (vérif adverse) — ce test DOIT pouvoir rougir :
//   - Poser inspireDe sur la source au lieu d'une copie → `srcIntacte` rouge (#4).
//   - Calquer le filtre « copie propre » des grilles (exclure les vivants) →
//     le trimestre vivant h2025 disparaît du listing → assertion #1 (divergence) rouge.
//   - Retirer le filtre dansBibliotheque !== false → `nombre` gonflé → #1 rouge.
//   - Faire que verifierDependancesPratique renvoie toujours [] → #5 rouge.
//   Rougissement confirmé localement avant de faire confiance au vert.
// ============================================================================

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.svg/i,
    /Not allowed to load local resource.*\.png/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

test('Brique C pas 5 · listerTrimestresAvecPratiques retient tout trimestre ≠ actif (même vivant)', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const liste = await page.evaluate(() => {
        // Décor déterministe : 4 trimestres connus, actif = h2026.
        window.obtenirTrimestres = () => ([
            { id: 'h2026', nom: 'Hiver 2026' },   // ACTIF → exclu
            { id: 'a2025', nom: 'Automne 2025' }, // pratiques (dont 1 retirée) → inclus, nombre 1
            { id: 'h2025', nom: 'Hiver 2025' },   // VIVANT ≠ actif avec pratique → inclus (DIVERGENCE)
            { id: 'e2025', nom: 'Été 2025' }      // aucune pratique → exclu
        ]);
        window.obtenirTrimestreId = () => 'h2026';
        window.estTrimestreArchive = () => false;  // actif vivant (cible permise)

        // pratiquesConfigurables est NAMESPACÉE : chaque trimestre a sa propre clé.
        db.setSync('a2025_pratiquesConfigurables', [
            { id: 'PR_A', nom: 'Hybride A25', dansBibliotheque: true },
            { id: 'PR_B', nom: 'Retirée', dansBibliotheque: false }  // ne compte pas
        ]);
        db.setSync('h2025_pratiquesConfigurables', [
            { id: 'PR_C', nom: '4 meilleurs H25', dansBibliotheque: true }
        ]);
        db.setSync('e2025_pratiquesConfigurables', []);  // vide → exclu

        return window.listerTrimestresAvecPratiques();
    });

    // a2025 ET h2025 (un VIVANT) sont listés ; h2026 (actif) et e2025 (vide) non.
    expect(liste).toHaveLength(2);
    const ids = liste.map(t => t.id).sort();
    expect(ids).toEqual(['a2025', 'h2025']);
    const a2025 = liste.find(t => t.id === 'a2025');
    expect(a2025.nombre).toBe(1);  // PR_B (dansBibliotheque:false) exclue du compte
    const h2025 = liste.find(t => t.id === 'h2025');
    expect(h2025.nombre).toBe(1);
});

test('Brique C pas 5 · garde D-C7 : aucune source listée quand le trimestre actif est archivé', async ({ page }) => {
    // D-C7 (cadrage §2.5) : la cible d'un import n'est JAMAIS archivée. Ici la
    // destination cle('pratiquesConfigurables') routerait correctement même en
    // archive, mais on respecte l'invariant « consultation = lecture seule »
    // (cohérence Brique B) : malgré une source DISPONIBLE, le listing rend [].
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(() => {
        window.obtenirTrimestres = () => ([
            { id: 'a2025', nom: 'Automne 2025' },
            { id: 'a2024', nom: 'Automne 2024' }
        ]);
        window.obtenirTrimestreId = () => 'a2025';
        window.estTrimestreArchive = () => true;        // actif = archivé (consultation)
        db.setSync('a2024_pratiquesConfigurables', [
            { id: 'PR_Z', nom: 'Pratique A24', dansBibliotheque: true }
        ]);
        return window.listerTrimestresAvecPratiques();
    });

    expect(res).toHaveLength(0);   // garde D-C7 : aucune source malgré a2024 disponible
});

test('Brique C pas 5 · « Voir les pratiques » révèle réellement le preview (anti-régression bouton mort)', async ({ page }) => {
    // Le preview, RENDU PAR LA MODALE, doit être caché par la classe u-hide (et
    // non display:none inline, que classList.remove('u-hide') ne retire pas). Ce
    // test exerce le VRAI HTML (afficherBibliothequePratiques) et vérifie la
    // VISIBILITÉ effective (getComputedStyle).
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(async () => {
        window.obtenirTrimestres = () => ([
            { id: 'h2026', nom: 'Hiver 2026' },
            { id: 'a2025', nom: 'Automne 2025' }
        ]);
        window.obtenirTrimestreId = () => 'h2026';
        window.estTrimestreArchive = () => false;  // actif vivant (cible permise)
        db.setSync('a2025_pratiquesConfigurables', [
            { id: 'PR_X', nom: 'Analytique A25', dansBibliotheque: true },
            { id: 'PR_Y', nom: 'Holistique A25', dansBibliotheque: true }
        ]);

        // Génère la VRAIE modale → le vrai HTML du preview (slot sectionImportTrimestre).
        await window.afficherBibliothequePratiques();

        const select = document.getElementById('selectTrimestreImportPratiques');
        const preview = document.getElementById('previewPratiquesTrimestre');
        if (!select || !preview) return { erreur: 'section import absente' };

        const visibleAvant = getComputedStyle(preview).display !== 'none';

        select.value = 'a2025';
        window.afficherPratiquesTrimestreModal();
        const visibleApres = getComputedStyle(preview).display !== 'none';
        const nbBoutonsImporter = preview.querySelectorAll('[data-action="importerUnePratiqueTrimestre"]').length;
        const contientNom = preview.innerHTML.includes('Analytique A25');

        return { visibleAvant, visibleApres, nbBoutonsImporter, contientNom };
    });

    expect(res.erreur).toBeUndefined();
    expect(res.visibleAvant).toBe(false);   // caché au départ (classe u-hide)
    expect(res.visibleApres).toBe(true);    // ← le preview RÉELLEMENT visible
    expect(res.nbBoutonsImporter).toBe(2);  // un bouton « Importer » par pratique
    expect(res.contientNom).toBe(true);
});

test('Brique C pas 5 · copie inter-trimestre : id neuf + inspireDe, destination namespacée, source intacte', async ({ page }) => {
    const erreurs = [];
    page.on('pageerror', (e) => { const m = `pageerror: ${e.message}`; if (!estErreurAttendue(m)) erreurs.push(m); });
    page.on('console', (msg) => { if (msg.type() === 'error') { const m = `console.error: ${msg.text()}`; if (!estErreurAttendue(m)) erreurs.push(m); } });

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(() => {
        const pratiqueSource = {
            id: 'PR_SRC', nom: 'Dissertation A25', auteur: 'Prof A25',
            dansBibliotheque: true,
            configuration: { type: 'standard' }
        };
        db.setSync('a2025_pratiquesConfigurables', [pratiqueSource]);

        // Destination = clé NAMESPACÉE de l'actif (≠ grilles : clé globale nue).
        // On la lit via window.cle() : exactement là où copier écrit.
        const cleDest = window.cle('pratiquesConfigurables');
        const destAvant = db.getSync(cleDest, []);
        const nbDestAvant = Array.isArray(destAvant) ? destAvant.length : 0;

        // Snapshot byte-à-byte de la source AVANT.
        const srcAvant = JSON.stringify(db.getSync('a2025_pratiquesConfigurables', []));

        // Chemin réel : relire la pratique comme le fait le handler, puis copier.
        const pratiqueLue = db.getSync('a2025_pratiquesConfigurables', []).find(p => p.id === 'PR_SRC');
        const resultat = window.copierPratiqueDepuisTrimestre(pratiqueLue, 'a2025');

        const destApres = db.getSync(cleDest, []);
        const copie = destApres.find(p => p.inspireDe && p.inspireDe.sourceId === 'PR_SRC');

        return {
            nbDestAvant,
            nbDestApres: destApres.length,
            copieExiste: !!copie,
            copieId: copie ? copie.id : null,
            copieInspireDe: copie ? copie.inspireDe : null,
            copieInspireDeTrimestre: copie ? copie.inspireDeTrimestre : null,
            copieIsDemo: copie ? copie.isDemo : null,
            retourPratiqueId: resultat && resultat.pratique ? resultat.pratique.id : null,
            retourDeps: resultat ? resultat.depsManquantes : null,
            // Source non mutée : objet lu en mémoire + stockage byte-à-byte.
            pratiqueLueInspireDe: pratiqueLue.inspireDe,
            srcIntacte: JSON.stringify(db.getSync('a2025_pratiquesConfigurables', [])) === srcAvant
        };
    });

    // (4) COPIE dans le trimestre actif, id NEUF.
    expect(res.copieExiste).toBe(true);
    expect(res.copieId).not.toBe('PR_SRC');
    expect(res.nbDestApres).toBe(res.nbDestAvant + 1);
    // inspireDe = OBJET structuré (schéma CC), pas une chaîne brute.
    expect(res.copieInspireDe.sourceId).toBe('PR_SRC');
    expect(res.copieInspireDe.nom).toBe('Dissertation A25');
    expect(res.copieInspireDeTrimestre).toBe('a2025');
    expect(res.copieIsDemo).toBe(false);
    expect(res.retourPratiqueId).toBe(res.copieId);
    // Pas de dépendances déclarées → aucun avertissement.
    expect(res.retourDeps).toEqual([]);
    // (3 invariant) SOURCE IMMUABLE.
    expect(res.pratiqueLueInspireDe).toBeUndefined();
    expect(res.srcIntacte).toBe(true);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('Brique C pas 5 · option A — dépendances échelle/grille absentes signalées (non remappées)', async ({ page }) => {
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(() => {
        // Catalogue actif (clés GLOBALES NUES, comme les dropdowns de l'éditeur) :
        // ECH_PRESENTE est re-sélectionnable ; ECH_RETIREE existe mais dansBibliotheque:false
        // (donc ABSENTE des dropdowns) ; aucune grille n'existe.
        db.setSync('echellesTemplates', [
            { id: 'ECH_PRESENTE', nom: 'IDME' },
            { id: 'ECH_RETIREE', nom: 'Retirée', dansBibliotheque: false }
        ]);
        db.setSync('grillesTemplates', []);

        // Pratique 1 : échelle présente + grille absente → seule la grille manque.
        const p1 = {
            id: 'PR_DEP1', nom: 'Avec DEN', dansBibliotheque: true,
            configuration: { echelleId: 'ECH_PRESENTE', grilleId: 'GR_ABSENTE' }
        };
        // Pratique 2 : échelle absente, pas de grille → seule l'échelle manque.
        const p2 = {
            id: 'PR_DEP2', nom: 'Échelle perdue', dansBibliotheque: true,
            configuration: { echelleId: 'ECH_ABSENTE' }
        };
        // Pratique 3 : échelle PRÉSENTE dans le catalogue mais RETIRÉE (non
        // re-sélectionnable) → doit être signalée comme les dropdowns la masquent.
        const p3 = {
            id: 'PR_DEP3', nom: 'Échelle retirée', dansBibliotheque: true,
            configuration: { echelleId: 'ECH_RETIREE' }
        };
        db.setSync('a2025_pratiquesConfigurables', [p1, p2, p3]);

        const lu1 = db.getSync('a2025_pratiquesConfigurables', []).find(p => p.id === 'PR_DEP1');
        const lu2 = db.getSync('a2025_pratiquesConfigurables', []).find(p => p.id === 'PR_DEP2');
        const lu3 = db.getSync('a2025_pratiquesConfigurables', []).find(p => p.id === 'PR_DEP3');
        const r1 = window.copierPratiqueDepuisTrimestre(lu1, 'a2025');
        const r2 = window.copierPratiqueDepuisTrimestre(lu2, 'a2025');
        const r3 = window.copierPratiqueDepuisTrimestre(lu3, 'a2025');

        // L'echelleId/grilleId restent ceux de la source (option A : NON remappés).
        return {
            deps1: r1.depsManquantes,
            deps2: r2.depsManquantes,
            deps3: r3.depsManquantes,
            echelleId1Conservee: r1.pratique.configuration.echelleId,
            grilleId1Conservee: r1.pratique.configuration.grilleId
        };
    });

    // P1 : échelle présente → pas signalée ; grille absente → signalée.
    expect(res.deps1).toEqual(['grille de rétroaction']);
    // P2 : échelle absente → signalée (pas de grille référencée).
    expect(res.deps2).toEqual(['échelle']);
    // P3 : échelle présente mais retirée (non re-sélectionnable) → signalée.
    expect(res.deps3).toEqual(['échelle']);
    // Option A : les ids de la source sont conservés tels quels (non remappés).
    expect(res.echelleId1Conservee).toBe('ECH_PRESENTE');
    expect(res.grilleId1Conservee).toBe('GR_ABSENTE');
});

test('Brique C pas 5 · copie PROFONDE : muter la copie ne touche pas la source (invariant §5.5)', async ({ page }) => {
    // BREAK-TEST de l'invariant « source immuable » au niveau des RÉFÉRENCES :
    // une copie superficielle ({...source}) partagerait configuration/jetons par
    // référence → muter la copie muterait la source. Le deep-clone l'interdit.
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(() => {
        const pratiqueSource = {
            id: 'PR_DEEP', nom: 'Source profonde', dansBibliotheque: true,
            configuration: { echelleId: 'ECH_ORIG', type: 'standard' },
            jetons: { actif: true, nombre: 2 }
        };
        db.setSync('a2025_pratiquesConfigurables', [pratiqueSource]);

        const lue = db.getSync('a2025_pratiquesConfigurables', []).find(p => p.id === 'PR_DEEP');
        const r = window.copierPratiqueDepuisTrimestre(lue, 'a2025');

        // Muter des SOUS-OBJETS de la copie ne doit PAS atteindre l'objet source
        // en mémoire (une copie superficielle partagerait la référence → source mutée).
        r.pratique.configuration.echelleId = 'MUTANT';
        r.pratique.jetons.nombre = 99;

        return {
            sourceEchelleId: lue.configuration.echelleId,
            sourceJetonsNombre: lue.jetons.nombre,
            copieEchelleId: r.pratique.configuration.echelleId,
            copieJetonsNombre: r.pratique.jetons.nombre
        };
    });

    // La copie a bien muté…
    expect(res.copieEchelleId).toBe('MUTANT');
    expect(res.copieJetonsNombre).toBe(99);
    // …mais la source en mémoire est restée intacte (aucune référence partagée).
    expect(res.sourceEchelleId).toBe('ECH_ORIG');
    expect(res.sourceJetonsNombre).toBe(2);
});

test('Durcissement intra-trimestre · dupliquerPratiqueBibliotheque fait une copie PROFONDE (muter la copie ne touche pas la source)', async ({ page }) => {
    // SENTINELLE SŒUR du cas 6, pour la duplication INTRA-trimestre
    // dupliquerPratiqueBibliotheque (durcissement révélé par la revue adverse du
    // pas 5). Une copie superficielle ({...source}) partagerait configuration/jetons
    // par référence avec la source ; le deep-clone (JSON round-trip) l'interdit.
    //
    // Subtilité : la source n'est pas injectée (lookup interne par id) et un getSync
    // depuis localStorage rend un objet FRAIS (round-trip → aliasing déjà rompu, le
    // test ne pourrait plus rougir). On amorce donc memoryCache avec l'array source :
    // le getSync interne rend CETTE référence, si bien que la copie aliase (ou non)
    // l'objet source que le test détient. La fonction RETOURNE la copie → on mute ses
    // sous-objets et on vérifie que la source détenue n'a pas bougé.
    //
    // BREAK-TEST : revenir à `{...pratique}` → copie superficielle → muter
    // copie.configuration mute aussi source.configuration → assertions source rouges.
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    const res = await page.evaluate(async () => {
        // UI neutralisée : la sentinelle ne teste que l'indépendance des données.
        window.fermerModalBibliothequePratiques = () => {};
        window.afficherListePratiquesMateriel = async () => {};
        window.afficherBibliothequePratiques = async () => {};

        const source = {
            id: 'PR_LOCAL', nom: 'Source locale', dansBibliotheque: true,
            configuration: { echelleId: 'ECH_ORIG', type: 'standard' },
            jetons: { actif: true, nombre: 2 }
        };

        // Amorce memoryCache pour que le getSync interne rende l'array PAR RÉFÉRENCE
        // (sinon localStorage → JSON.parse → objet frais, aliasing rompu d'office).
        const cleDest = window.cle('pratiquesConfigurables');
        db.memoryCache.set(cleDest, [source]);

        const copie = await window.dupliquerPratiqueBibliotheque('PR_LOCAL');
        if (!copie) return { copieExiste: false };

        // Muter des SOUS-OBJETS de la copie ne doit PAS atteindre la source détenue.
        copie.configuration.echelleId = 'MUTANT';
        copie.jetons.nombre = 99;

        return {
            copieExiste: true,
            copieId: copie.id,
            copieInspireSource: copie.inspireDe ? copie.inspireDe.sourceId : null,
            copieIsDemo: copie.isDemo,
            sourceEchelleId: source.configuration.echelleId,
            sourceJetonsNombre: source.jetons.nombre,
            copieEchelleId: copie.configuration.echelleId,
            copieJetonsNombre: copie.jetons.nombre
        };
    });

    // La copie existe, id NEUF, trace de provenance posée (objet inspireDe).
    expect(res.copieExiste).toBe(true);
    expect(res.copieId).not.toBe('PR_LOCAL');
    expect(res.copieInspireSource).toBe('PR_LOCAL');
    expect(res.copieIsDemo).toBe(false);
    // La copie a bien muté…
    expect(res.copieEchelleId).toBe('MUTANT');
    expect(res.copieJetonsNombre).toBe(99);
    // …mais la source détenue est restée intacte (aucune référence partagée).
    expect(res.sourceEchelleId).toBe('ECH_ORIG');
    expect(res.sourceJetonsNombre).toBe(2);
});
