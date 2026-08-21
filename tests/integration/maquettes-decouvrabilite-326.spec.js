import { test, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const indexHtml = 'file://' + path.join(racineProjet, 'index.html');

// #326 (terrain 17 juin) — Découvrabilité + suppression des maquettes.
// Symptôme : les maquettes d'exploration sont VOLONTAIREMENT masquées de la
// bibliothèque (D-2) ; l'utilisateur les y cherche pour les supprimer et ne les
// trouve pas. Correctif : (1) bannière dans la bibliothèque pointant vers le Labo,
// (2) toute maquette est listée + supprimable (bouton « Jeter ») dans le Labo ›
// Comparateur. Ce test vérifie le chemin de bout en bout.

const patternsAttendus = [
    /version\.json.*access control/i,
    /Cross origin requests are only supported/i,
    /Not allowed to load local resource.*\.(svg|png)/i
];
const estErreurAttendue = (msg) => patternsAttendus.some((re) => re.test(msg));

function brancherErreurs(page, erreurs) {
    page.on('pageerror', (e) => {
        const m = `pageerror: ${e.message}`;
        if (!estErreurAttendue(m)) erreurs.push(m);
    });
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            const m = `console.error: ${msg.text()}`;
            if (!estErreurAttendue(m)) erreurs.push(m);
        }
    });
}

// Sème une pratique aboutie + une maquette dérivée, comme en terrain.
// IMPORTANT : la config doit être VALIDE (PratiqueConfigurable.valider exige
// id/nom/calcul_note, + echelle selon la méthode). On clone donc une vraie
// pratique démo (déjà valide → l'app la charge sans console.error) ; repli sur
// un SOM minimal valide (methode 'moyenne_ponderee' n'exige pas d'échelle).
async function semerMaquette(page) {
    return page.evaluate(async () => {
        if (typeof window.activerModeDemo === 'function') await window.activerModeDemo();
        const k = (typeof window.cle === 'function') ? window.cle('pratiquesConfigurables') : 'pratiquesConfigurables';
        const liste = window.db.getSync(k, null) || window.db.getSync('pratiquesConfigurables', []) || [];
        const BASE = ['standards', 'specifications', 'sommative'];

        // Template : une pratique démo valide, non canevas de base, non maquette.
        const modele = liste.find(p => p && p.id && BASE.indexOf(p.id) === -1
            && p.estMaquette !== true && (p.config || p.configuration));
        const clone = (id, nom) => {
            const base = modele
                ? JSON.parse(JSON.stringify(modele))
                : { config: { id, nom, calcul_note: { methode: 'moyenne_ponderee' }, type: 'sommative' }, type: 'sommative' };
            base.id = id; base.nom = nom; base.isDemo = false; base.dansBibliotheque = true;
            delete base.estMaquette; delete base.inspireDe;
            if (base.config) { base.config.id = id; base.config.nom = nom; }
            if (base.configuration) { base.configuration.id = id; base.configuration.nom = nom; }
            return base;
        };

        const souche = clone('p_souche_test', 'Ma pratique aboutie');
        const maquette = clone('p_maquette_test', 'essai 1');
        maquette.estMaquette = true;
        maquette.inspireDe = { sourceId: 'p_souche_test' };

        const sansTest = liste.filter(p => p.id !== 'p_souche_test' && p.id !== 'p_maquette_test');
        const nouvelle = sansTest.concat([souche, maquette]);
        window.db.setSync(k, nouvelle);
        return { ok: true };
    });
}

test('#326 · la bibliothèque signale les maquettes masquées et pointe vers le Labo', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await semerMaquette(page);

    const res = await page.evaluate(async () => {
        if (typeof window.afficherBibliothequePratiques !== 'function') return { erreur: 'afficherBibliothequePratiques absent' };
        await window.afficherBibliothequePratiques();
        await new Promise((r) => setTimeout(r, 50));
        const modal = document.getElementById('modalBibliothequePratiques');
        const txt = modal ? modal.textContent : '';
        const btn = modal ? modal.querySelector('[data-action="ouvrirExplorationMaquettes"]') : null;
        // La maquette « essai 1 » ne doit PAS apparaître comme carte de la biblio (D-2).
        const carteMaquette = modal ? modal.querySelector('[data-id="p_maquette_test"]') : null;
        // #345 : la bannière de découvrabilité (et son bouton) pointe vers le comparateur ;
        // elle est masquée tant que COMPARATEUR_VISIBLE === false (sinon = lien entrant vers
        // une page masquée). On lit le flag EXACTEMENT comme pratiques-gestion.js, pour que
        // l'assertion reste cohérente quelle que soit la valeur du flag.
        const comparateurVisible = (typeof COMPARATEUR_VISIBLE === 'undefined' || COMPARATEUR_VISIBLE);
        return {
            aModal: !!modal,
            comparateurVisible,
            aBanniere: txt.includes('maquette') && txt.includes('Labo'),
            aBouton: !!btn,
            maquetteMasquee: !carteMaquette
        };
    });

    expect(res.erreur, `Erreur eval : ${res.erreur}`).toBeUndefined();
    expect(res.aModal).toBe(true);
    // La bannière + son bouton ne sont présents QUE si le comparateur est visible (#345).
    // Avec le gating actif (COMPARATEUR_VISIBLE=false), la bibliothèque ne signale pas les
    // maquettes ici ; quand le flag rebascule à true, la bannière réapparaît.
    expect(res.aBanniere).toBe(res.comparateurVisible);
    expect(res.aBouton).toBe(res.comparateurVisible);
    // Dans tous les cas, la maquette reste masquée des cartes de la bibliothèque (D-2).
    expect(res.maquetteMasquee).toBe(true);
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});

test('#326 · toute maquette est listée et supprimable (bouton « Jeter ») dans le Labo', async ({ page }) => {
    const erreurs = [];
    brancherErreurs(page, erreurs);
    await page.goto(indexHtml);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(500);

    await semerMaquette(page);

    const res = await page.evaluate(async () => {
        window.afficherSection('labo');
        window.afficherSousSection('labo-comparateur');
        await new Promise((r) => setTimeout(r, 300));
        const hote = document.getElementById('exploration-arbre-hote');
        const jeter = hote ? hote.querySelector('[data-expl-action="jeter"][data-id="p_maquette_test"]') : null;
        const txt = hote ? hote.textContent : '';
        return {
            aArbre: !!(hote && hote.querySelector('.exploration-arbre')),
            aMaquetteNommee: txt.includes('essai 1'),
            aBoutonJeter: !!jeter
        };
    });

    expect(res.aArbre).toBe(true);
    expect(res.aMaquetteNommee).toBe(true);
    expect(res.aBoutonJeter).toBe(true);     // la maquette est supprimable ici
    expect(erreurs, `Erreurs console : ${erreurs.join(' | ')}`).toEqual([]);
});
