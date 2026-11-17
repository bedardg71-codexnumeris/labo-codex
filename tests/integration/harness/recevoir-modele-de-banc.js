// =======================================================================
// LE HARNAIS DU MODÈLE DE « RECEVOIR » (17 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md. Les deux modèles qui le précèdent, joués comme la
// personne les joue (« Remplir », puis le bouton de la page), et le relevé des blobs des copies (IndexedDB, magasin
// `fichiers` de `MonitoragePedagogique` : en démo, les copies n'y vont que là, T4).
// Le modèle d'« Évaluer » est repris de `deux-temps-modeles-2026-11-13.spec.js` (banc B), sans ses vérifications :
// ce banc-là les porte.
import { expect } from '@playwright/test';
import { ouvrirPanneau, boutonModele, bulle, attendreEtape, faireLaModelisation, attendreRemplir, REMPLIR } from './deux-temps-de-banc.js';
import { etiqueter } from './classe-de-banc.js';
import { actionDeLaListe, valeursActions } from './parcours-3-de-banc.js';

const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
const etapeEvaluer = (page, n, titre) => attendreEtape(page, n, 9, titre);

async function etiqueterTous(page, type, textes) {
    await expect(async () => {
        const voulus = textes.map((x) => x.replace(/ /g, ' '));
        const manquants = await page.evaluate(([t, ts]) => [...document.querySelectorAll('#dissection-contenu .dissection-morceau')]
            .filter((b) => ts.includes(b.textContent.replace(/ /g, ' ')) && b.getAttribute('data-type') !== t).map((b) => b.textContent), [type, voulus]);
        if (manquants.length) await etiqueter(page, type, manquants);
        await expect(page.locator(`#dissection-contenu .dissection-morceau[data-type="${type}"]`)).toHaveCount(textes.length, { timeout: 1500 });
    }).toPass({ timeout: 15000 });
}

/** Les Modélisations de « Mettre ta classe en place » puis d'« Évaluer une première production », jusqu'à leur dernière bulle. */
export async function faireLesDeuxModeles(page) {
    await ouvrirPanneau(page);
    await boutonModele(page, 'classe').click();
    await faireLaModelisation(page);
    await boutonDeBulle(page, 'Voir le parcours suivant').click();
    return faireLeModeleDEvaluer(page);
}

/** Le modèle d'« Évaluer », de sa première bulle à la dernière (la rétroaction réécrite, verrouillée). */
export async function faireLeModeleDEvaluer(page) {
    const m = await page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursEvaluer.materiel)));
    await etapeEvaluer(page, 1, 'Pourquoi étiqueter');
    await boutonDeBulle(page, 'Continuer').click();
    await etapeEvaluer(page, 1, 'Tu apprends aussi');
    await boutonDeBulle(page, 'Continuer').click();
    await attendreRemplir(page, 'étape 1');
    await boutonDeBulle(page, REMPLIR).click();
    await expect(page.locator('#dissection-contenu .dissection-morceau')).toHaveCount(14);
    await etiqueterTous(page, 'titre', [m.grille.nom]);
    await etiqueterTous(page, 'description', [m.grille.description].concat(m.grille.criteres.map((c) => c[1])));
    await etiqueterTous(page, 'critere', m.grille.criteres.map((c) => c[0]));
    await etiqueterTous(page, 'ponderation', m.grille.criteres.map((c) => c[2]));
    await page.locator('#materiel-dissection button', { hasText: 'Créer ma grille' }).click();
    await page.click('#conception-materiel [data-action="materiel.voir"][data-param="grille-criteres"]');
    const types = '#listeCriteres select[data-on-change="modifierTypeCritereGrilleHandler"]';
    await expect(page.locator(types)).toHaveCount(4);
    for (let k = 0; k < 4; k++) {
        await expect(async () => {
            await page.locator(types).nth(k).selectOption('holistique', { timeout: 2000 });
            await expect(page.locator(types).nth(k)).toHaveValue('holistique', { timeout: 1000 });
        }).toPass({ timeout: 15000 });
    }
    await etapeEvaluer(page, 2, 'Ta production');
    await page.click('#conception-productions [data-action="creerNouvelleProduction"]');
    await attendreRemplir(page, 'étape 2');
    await boutonDeBulle(page, REMPLIR).click();
    await page.click('#btnCreerProduction');
    await etapeEvaluer(page, 3, 'Tes consignes');
    await attendreRemplir(page, 'étape 3');
    await boutonDeBulle(page, REMPLIR).click();
    await page.check('#productionEcheanceAssignee');

    await etapeEvaluer(page, 4, 'Une première production');
    const grilleId = await page.evaluate((nom) => (db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.nom === nom).id, m.grille.nom);
    const pid = await page.evaluate((g) => (db.getSync(cle('productions'), []) || []).find((p) => p.grilleId === g).id, grilleId);
    await actionDeLaListe(page, 'evaluer|' + m.etudiantEvalue.da + '|' + pid);
    await expect.poll(() => page.locator('#listeCriteresGrille1 select[id^="eval_"]').count()).toBe(4);
    const criteres = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((c) => c.id));
    for (const [k, [, niveau]] of m.niveaux.entries()) await page.selectOption('#' + criteres[k], niveau);
    await page.click('#btnVerrouillerEvaluation');

    await etapeEvaluer(page, 5, 'Ta pratique');
    await page.click('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
    await page.locator('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]').check({ force: true });
    await page.click('#wizard-v2-btn-suivant');
    const standards = page.locator(`#modalWizardPratiqueV2 input[name="modeleChoisi"][value="${m.pratique.id}"]`);
    await expect(async () => { await standards.check({ force: true }); await expect(standards).toBeChecked({ timeout: 500 }); }).toPass({ timeout: 5000 });
    await page.click('#wizard-v2-btn-suivant');
    await page.click('#wizard-v2-btn-creer');
    await expect(page.locator('#ui-dialogue-question')).toBeVisible();
    await page.locator('#overlay-ui-dialogue .ui-dialogue-choix-ligne', { hasText: m.echelle }).click();
    await page.getByRole('button', { name: 'Adopter', exact: true }).click();
    await etapeEvaluer(page, 6, "L'appliquer à ton cours");
    const pratiqueId = await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).find((p) => String(p.id).indexOf('demo-') !== 0).id);
    await page.selectOption('#menuPratiques', pratiqueId);
    await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');
    await etapeEvaluer(page, 7, "Le point qui s'allume");
    await boutonDeBulle(page, 'Continuer').click();

    await etapeEvaluer(page, 8, 'Ta cartouche');
    await page.click('#conception-retroactions [data-action="creerNouvelleCartouche"]');
    await attendreRemplir(page, 'étape 8');
    await boutonDeBulle(page, REMPLIR).click();
    await expect(page.locator('#cartoucheZonePrincipale textarea[id^="comm_"]')).toHaveCount(20);
    await expect.poll(() => page.locator('#cartoucheZonePrincipale textarea[id^="comm_"]').evaluateAll((ts) => ts.every((t) => t.value.trim() !== ''))).toBe(true);
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.click('#btnCreerCartouche');
    await expect.poll(() => page.evaluate((g) => (db.getSync(cle('cartouches_' + g), []) || []).length, grilleId)).toBe(1);
    await page.click('#sous-navigation [data-sous-onglet="conception-productions"]');
    if (!(await page.locator('#formulaireProduction').isVisible())) await page.click(`#conception-productions [data-action="modifierProduction"][data-param="${pid}"]`);
    const cartoucheId = await page.evaluate((g) => (db.getSync(cle('cartouches_' + g), []) || [])[0].id, grilleId);
    await page.selectOption('#productionCartouche', cartoucheId);

    await etapeEvaluer(page, 9, 'Ta rétroaction, avec tes mots');
    const evaluationId = await page.evaluate((p) => (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((e) => e.productionId === p).id, pid);
    const consulter = (await valeursActions(page, evaluationId)).find((v) => v.startsWith('consulter|'));
    await actionDeLaListe(page, consulter);
    await page.waitForFunction((id) => {
        const ec = window.evaluationEnCours, b = document.getElementById('btnVerrouillerEvaluation');
        return !!ec && ec.idModification === id && !window._chargementsEvaluationEnCours && !!b && b.title === 'Déverrouiller l’évaluation';
    }, evaluationId, { timeout: 10000 });
    await page.click('#btnVerrouillerEvaluation');
    await page.selectOption('#selectCartoucheEval', cartoucheId);
    await page.fill('#motPourEtudiant1', m.mot);
    await page.click('#btnVerrouillerEvaluation');
    await expect.poll(() => page.evaluate((id) => {
        const e = (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((x) => x.id === id);
        return !!e && e.verrouillee === true && e.cartoucheId !== '';
    }, evaluationId)).toBe(true);
    return { m, grilleId, pid, evaluationId, cartoucheId };
}

/** Les blobs des copies, par identifiant, avec leur taille (IndexedDB, magasin `fichiers`). */
export async function releveDesBlobs(page) {
    return page.evaluate(() => new Promise((ok, ko) => {
        const req = indexedDB.open('MonitoragePedagogique');
        req.onerror = () => ko(req.error);
        req.onsuccess = () => {
            const base = req.result;
            if (!base.objectStoreNames.contains('fichiers')) { base.close(); ok({}); return; }
            const tout = base.transaction('fichiers', 'readonly').objectStore('fichiers').getAll();
            tout.onsuccess = () => {
                const o = {};
                for (const r of tout.result) {
                    const b = r.blob || r.data || null;
                    o[r.id] = b && typeof b.size === 'number' ? b.size : JSON.stringify(r).length;
                }
                base.close();
                ok(o);
            };
            tout.onerror = () => ko(tout.error);
        };
    }));
}

/** Un blob témoin des vraies données (hors de la démo), posé avant le modèle : il ne doit pas bouger. */
export async function poserUnBlobReel(page) {
    await page.evaluate(() => new Promise((ok, ko) => {
        const req = indexedDB.open('MonitoragePedagogique');
        req.onerror = () => ko(req.error);
        req.onsuccess = () => {
            const base = req.result;
            const tx = base.transaction('fichiers', 'readwrite');
            tx.objectStore('fichiers').put({ id: 'TEMOIN_COPIE_REELLE', blob: new Blob(['copie réelle témoin'], { type: 'text/plain' }) });
            tx.oncomplete = () => { base.close(); ok(); };
            tx.onerror = () => ko(tx.error);
        };
    }));
}
