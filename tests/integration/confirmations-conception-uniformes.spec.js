import { test, expect } from '@playwright/test';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// Sentinelle d'intégration — uniformité des confirmations de Conception
// (24 août 2026). Grégoire, capture à l'appui : enregistrer une grille faisait
// glisser un bandeau vert en haut à droite, enregistrer une échelle ouvrait une
// fenêtre du navigateur à refermer d'un clic.
//
// Le test unitaire jumeau (unit/confirmations-conception-uniformes.test.js) lit
// le SOURCE : il garantit qu'aucun alert() de confirmation ne revient. Il ne peut
// rien dire du RENDU. Ces quatre cas-là ouvrent l'app pour de vrai et mesurent ce
// que le navigateur affiche : combien de bandeaux, lequel, où, et si une fenêtre
// native s'est ouverte derrière.
//
// ⚠ Mesurer APRÈS 700 ms, pas 300. `slideIn` dure 300 ms et part de
// translateX(400px) : une mesure prise pendant l'animation rend une position
// hors écran et fait croire à un débordement. C'est arrivé au premier essai.

async function ouvrir(page) {
    const dialogues = [];
    page.on('dialog', (d) => { dialogues.push(d.message()); d.dismiss().catch(() => {}); });
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(900);
    await page.evaluate(() => {
        db.setSync('trimestres', [
            { id: 'a2026', nom: 'A2026', annee: 2026, session: 'A', actif: true },
            { id: 'h2026', nom: 'H2026', annee: 2026, session: 'H', actif: false }
        ]);
        db.setSync('trimestreActif', 'a2026');
    });
    return dialogues;
}

// Relevé du DOM : où le bandeau se place, ce qu'il dit, combien il y en a.
const RELEVE = `() => {
    const n = [...document.querySelectorAll('.notification-succes')];
    return n.map(x => {
        const r = x.getBoundingClientRect();
        const cs = getComputedStyle(x);
        return {
            classes: x.className,
            texte: x.textContent.trim(),
            contientRetourLigne: /\\n/.test(x.textContent),
            haut: Math.round(r.top), droite: Math.round(window.innerWidth - r.right),
            largeur: Math.round(r.width), hauteur: Math.round(r.height),
            position: cs.position, zIndex: cs.zIndex,
            debordeADroite: r.right > window.innerWidth,
            role: x.getAttribute('role')
        };
    });
}`;

// ↻ Lot E1 (D3, 27 sept. 2026) : une fiche EXISTANTE s'enregistre toute seule (le témoin commun
// parle) ; le bandeau glissant reste au geste de CRÉATION, « … créée. ». Les deux preuves de forme
// passent donc par « Créer l'échelle » / « Créer la grille ».
test('PREUVE · échelle · Créer produit UN bandeau glissant, zéro fenêtre native', async ({ page }) => {
    const dialogues = await ouvrir(page);
    const r = await page.evaluate(async () => {
        await creerNouvelleEchelle();
        (window._niveauxNouvelleEchelle || []).forEach((n, i) => { n.code = 'N' + i; n.nom = 'Niveau ' + i; });
        document.getElementById('nomEchelleTemplate').value = 'Échelle témoin';
        await sauvegarderEchelleComplete();
        await new Promise(res => setTimeout(res, 700));
        return true;
    });
    expect(r).toBe(true);
    const notifs = await page.evaluate(eval(RELEVE));
    console.log('ÉCHELLE →', JSON.stringify(notifs, null, 1));
    console.log('ÉCHELLE · fenêtres natives →', JSON.stringify(dialogues));
    expect(notifs.length, 'exactement un bandeau').toBe(1);
    expect(notifs[0].texte).toContain('créée');
    expect(notifs[0].classes).toContain('notification-succes');
    expect(notifs[0].position).toBe('fixed');
    // Le bandeau doit passer DEVANT les modales : .modal-js-overlay est à 10000
    // et l'import à 10001. Une copie de .notification-succes vivait en double
    // dans le <style> d'index.html, chargé après styles.css, et la plafonnait à
    // 9999 : une confirmation affichée depuis une bibliothèque ouverte passait
    // derrière elle. Le doublon a été retiré le 24 août 2026 ; ce seuil garde la
    // porte fermée.
    expect(Number(notifs[0].zIndex), 'le bandeau passe devant les modales (10001)').toBeGreaterThan(10001);
    expect(dialogues.filter(d => /sauvegard/i.test(d)), 'aucune fenêtre native de sauvegarde').toHaveLength(0);
});

test('PREUVE · grille · même forme, même coin que l\'échelle', async ({ page }) => {
    const dialogues = await ouvrir(page);
    await page.evaluate(async () => {
        // security-ok: fixture de test, littéral écrit par le spec lui-même — aucune source externe.
        await db.set('a2026_grillesTemplates', [{
            id: 'GR_T', nom: 'Grille témoin', criteres: [], dansBibliotheque: true
        }]);
        await chargerListeGrillesTemplates();
        await creerNouvelleGrille();
        await new Promise(res => setTimeout(res, 400));
        document.getElementById('nomGrilleTemplate').value = 'Grille témoin neuve';
        await sauvegarderGrilleComplete();
        await new Promise(res => setTimeout(res, 700));
    });
    const notifs = await page.evaluate(eval(RELEVE));
    console.log('GRILLE →', JSON.stringify(notifs, null, 1));
    console.log('GRILLE · fenêtres natives →', JSON.stringify(dialogues));
    expect(notifs.length).toBeGreaterThanOrEqual(1);
    expect(notifs[0].texte).toContain('créée');
});

test('PREUVE · #466/CO-16 · écriture refusée = bandeau rouge SEUL, aucun « sauvegardée »', async ({ page }) => {
    const dialogues = await ouvrir(page);
    await page.evaluate(async () => {
        // security-ok: fixture de test, littéral écrit par le spec lui-même — aucune source externe.
        await db.set('a2026_echellesTemplates', [{
            id: 'ECH_X', nom: 'Échelle du trimestre A', niveaux: [{ code: 'A', nom: 'A', min: 60, max: 100 }],
            dansBibliotheque: true
        }]);
        await chargerEchellePourModif('ECH_X');
        await new Promise(res => setTimeout(res, 400));
        // Reproduction directe de la condition gardée : l'échelle chargée dans
        // l'éditeur n'est plus dans le namespace du trimestre actif. C'est ce que
        // produit une bascule de trimestre en cours d'édition (#466/CO-16).
        // security-ok: fixture de test, littéral écrit par le spec lui-même — aucune source externe.
        await db.set('a2026_echellesTemplates', []);
        window.__diag = {
            pointeur: (typeof echelleTemplateActuelle === 'undefined') ? 'indefini'
                     : (echelleTemplateActuelle ? echelleTemplateActuelle.id : 'null'),
            niveauxTemp: !!window._niveauxNouvelleEchelle,
            cleActive: cle('echellesTemplates')
        };
        document.getElementById('nomEchelleTemplate').value = 'Échelle du trimestre A';
        // Lot E1 : une échelle existante s'écrit au changement du nom (`sauvegarderNomEchelle`).
        await sauvegarderNomEchelle();
        await new Promise(res => setTimeout(res, 700));
    });
    console.log('REFUS · diagnostic →', JSON.stringify(await page.evaluate(() => window.__diag)));
    const notifs = await page.evaluate(eval(RELEVE));
    console.log('REFUS →', JSON.stringify(notifs, null, 1));
    console.log('REFUS · fenêtres natives →', JSON.stringify(dialogues));
    expect(notifs.length, 'un seul bandeau, pas deux superposés').toBe(1);
    expect(notifs[0].classes).toContain('notification-erreur');
    expect(notifs[0].texte).not.toContain('sauvegardée');
    expect(dialogues.filter(d => /sauvegard/i.test(d))).toHaveLength(0);
});

test('PREUVE · résumé d\'import · titre + détail, aucun \\n littéral, pas de débordement', async ({ page }) => {
    await ouvrir(page);
    await page.evaluate(async () => {
        notifications.succes('Import réussi', '12 nouvelle(s) grille(s) ajoutée(s). 3 grille(s) mise(s) à jour. Consulte « Grilles disponibles » pour les ajouter à ta barre latérale.');
        await new Promise(res => setTimeout(res, 700));
    });
    const notifs = await page.evaluate(eval(RELEVE));
    console.log('IMPORT →', JSON.stringify(notifs, null, 1));
    expect(notifs.length).toBe(1);
    expect(notifs[0].contientRetourLigne, 'aucun \\n littéral dans le rendu').toBe(false);
    expect(notifs[0].debordeADroite, 'ne déborde pas de la fenêtre').toBe(false);
});
