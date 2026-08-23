import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');
const scriptDiag = fs.readFileSync(
    path.join(racineProjet, 'scripts', 'diagnostic-doublons-bibliotheques.js'), 'utf8');

// PORTE — Lot 0 de #291 · UN OUTIL DE DIAGNOSTIC QUI ÉCRIT EST UN PIÈGE.
//
// `scripts/diagnostic-doublons-bibliotheques.js` est destiné à être collé dans
// la console de Grégoire, sur SES données réelles, avant tout correctif. Son
// unique promesse est « LECTURE SEULE ». Une promesse pareille ne se vérifie
// pas à la relecture : on la MESURE, en comparant l'état complet du stockage
// avant et après exécution.
//
// Le spec vérifie aussi que le classement est juste sur un jeu portant les
// trois cas — collision, copie, homonymes — puisqu'un rapport faux ferait
// prendre de mauvaises décisions sur des données réelles.
//
// ▣ POURQUOI LE SCRIPT EST ÉVALUÉ PAR PLAYWRIGHT ET NON PAR `new Function`.
// La CSP de l'app (`script-src 'self'`) interdit `unsafe-eval` : un
// `new Function(source)` À L'INTÉRIEUR de la page est refusé — et c'est le bon
// comportement, à ne pas contourner. `page.evaluate(source)` passe par le
// protocole de débogage, exactement comme le collage dans la console de Safari
// que fait Grégoire : c'est donc AUSSI le chemin le plus fidèle à l'usage réel.
//
// BREAK-TEST (fait le 23 août 2026) — ajouter `await db.set('marqueur', 1)`
// dans `diagDoublons` → « le script n'écrit RIEN » rougit en nommant la clé.

test('porte Lot 0 · le diagnostic classe juste et n\'écrit RIEN', async ({ page }) => {
    const erreurs = [];
    const journal = [];
    page.on('pageerror', (e) => erreurs.push('pageerror: ' + e.message));
    page.on('console', (m) => journal.push(m.text()));
    page.on('dialog', (d) => d.dismiss());

    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);

    /** Empreinte COMPLÈTE du stockage — c'est l'oracle de la lecture seule. */
    const EMPREINTE = async () => {
        const cles = ((await db.keys()) || []).slice().sort();
        const etat = {};
        for (const k of cles) etat[k] = JSON.stringify(await db.get(k));
        return etat;
    };

    // --- Jeu d'essai : les trois cas, plus le piège du même id des deux côtés
    await page.evaluate(async () => {
        db.setSync('trimestres', [{ id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true }]);
        db.setSync('trimestreActif', 'a2026');

        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set(cle('grillesTemplates'), [
            // 🔴 collision : le MÊME id deux fois dans le MÊME magasin
            { id: 'GRILLE_col_111111', nom: 'Collision', criteres: [] },
            { id: 'GRILLE_col_111111', nom: 'Collision', criteres: [] },
            // 🟠 copie
            { id: 'GRILLE_src_222222', nom: 'Copiée', criteres: [] },
            { id: 'GRILLE_cop_333333', idOriginal: 'GRILLE_src_222222', nom: 'Copiée', criteres: [] },
            // 🔵 homonymes — le cas réel de Grégoire (#450)
            { id: 'GRILLE_hoA_444444', nom: 'IDME et niv 0', criteres: [] },
            { id: 'GRILLE_hoB_555555', nom: 'IDME et niv 0', criteres: [] }
        ]);
        // Le même objet publié : même id des deux côtés — PAS une collision.
        // security-ok: jeu d'essai littéral d'un test, aucune source externe.
        await db.set('bibliothequeGrilles', [
            { id: 'GRILLE_src_222222', nom: 'Copiée', criteres: [] }
        ]);
    });

    const avant = await page.evaluate(EMPREINTE);

    // --- Chargement du script, puis exécution -----------------------------
    await page.evaluate(scriptDiag);
    const releve = await page.evaluate(async () => await window.diagDoublons());

    const apres = await page.evaluate(EMPREINTE);

    // --- LECTURE SEULE, mesurée -------------------------------------------
    const ajoutees = Object.keys(apres).filter((k) => !(k in avant));
    const disparues = Object.keys(avant).filter((k) => !(k in apres));
    const modifiees = Object.keys(avant).filter((k) => k in apres && avant[k] !== apres[k]);

    expect(modifiees, `clés MODIFIÉES par un outil de lecture seule : ${modifiees.join(', ')}`).toEqual([]);
    expect(ajoutees, `clés AJOUTÉES : ${ajoutees.join(', ')}`).toEqual([]);
    expect(disparues, `clés SUPPRIMÉES : ${disparues.join(', ')}`).toEqual([]);

    // --- Le classement est juste sur les trois cas -------------------------
    const grilles = releve.familles.find((f) => /Grilles/.test(f.magasin));
    expect(grilles, 'la famille Grilles doit être rapportée').toBeTruthy();

    const parNom = Object.fromEntries(grilles.groupes.map((g) => [g.nom, g.categorie]));
    expect(parNom['Collision'], 'un même id deux fois dans un magasin = collision').toBe('collision-id');
    expect(parNom['Copiée'], 'id neuf + idOriginal = copie').toBe('copie');
    expect(parNom['IDME et niv 0'], 'CAS-TÉMOIN #450 : deux entités distinctes').toBe('homonymes');

    // Le même objet publié ne doit pas fabriquer une seconde « collision ».
    expect(releve.totaux.collisions, 'une seule vraie collision attendue').toBe(1);

    // --- Le rapport dit sur quel build il a été calculé --------------------
    const texte = journal.join('\n');
    expect(texte).toMatch(/BIBLIOTHÈQUES · doublons · LECTURE SEULE/);
    expect(texte, 'le rapport doit annoncer s\'il tourne sur un build à jour ou périmé')
        .toMatch(/Build À JOUR|ANTÉRIEUR au correctif/);
    // Le cas invisible d'avant #291 doit être nommé explicitement.
    expect(texte).toMatch(/portent le MÊME identifiant GRILLE_col_111111/);

    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
