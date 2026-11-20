// =======================================================================
// LE HARNAIS DU MODÈLE DE « RECEVOIR » (17 NOVEMBRE 2026)
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-17-je-regarde-recevoir.md. Les deux modèles qui le précèdent, joués comme la
// personne les joue (« Remplir », puis le bouton de la page), et le relevé des blobs des copies (IndexedDB, magasin
// `fichiers` de `MonitoragePedagogique` : en démo, les copies n'y vont que là, T4).
// Le modèle d'« Évaluer » (dix étapes, 18 nov. 2026) : ses vérifications sont au banc
// `je-regarde-evaluer-2026-11-18.spec.js`, qui appelle le même parcours avec `surEtape`.
import { expect } from '@playwright/test';
import { ouvrirPanneau, boutonModele, bulle, carte, attendreEtape, faireLaModelisation, attendreRemplir, REMPLIR } from './deux-temps-de-banc.js';
import { etiqueter } from './classe-de-banc.js';
import { actionDeLaListe, valeursActions } from './nous-faisons-evaluer-de-banc.js';

const boutonDeBulle = (page, nom) => bulle(page).getByRole('button', { name: nom, exact: true });
const etapeEvaluer = (page, n, titre) => attendreEtape(page, n, 10, titre);

async function etiqueterTous(page, type, textes) {
    await expect(async () => {
        const voulus = textes.map((x) => x.replace(/ /g, ' '));
        const manquants = await page.evaluate(([t, ts]) => [...document.querySelectorAll('#dissection-contenu .dissection-morceau')]
            .filter((b) => ts.includes(b.textContent.replace(/ /g, ' ')) && b.getAttribute('data-type') !== t).map((b) => b.textContent), [type, voulus]);
        if (manquants.length) await etiqueter(page, type, manquants);
        await expect(page.locator(`#dissection-contenu .dissection-morceau[data-type="${type}"]`)).toHaveCount(textes.length, { timeout: 1500 });
    }).toPass({ timeout: 15000 });
}

/**
 * LA FIN D'UN PARCOURS NE LANCE PLUS RIEN (20 nov. 2026, `plans de travail/CONSIGNE-2026-11-20-essai-parcours.md`, A3) :
 * « Voir le parcours N » termine le modèle en cours, ferme la bulle et ouvre le panneau « Assistance » devant la carte
 * du parcours N, suggérée, le focus sur son « Je regarde ». Pour enchaîner comme le faisait « Voir le parcours
 * suivant », la personne touche ce « Je regarde » : c'est ce que fait cette aide, en jugeant chaque pas.
 */
export async function voirLeParcoursPuisJeRegarde(page, n, id) {
    await boutonDeBulle(page, 'Voir le parcours ' + n).click();
    await expect(bulle(page), `« Voir le parcours ${n} » ferme la bulle`).toHaveCount(0);
    await expect(page.locator('#panneau-assistance')).toBeVisible();
    expect(await page.evaluate(() => ParcoursMoteur.actif()), `« Voir le parcours ${n} » ne lance rien`).toBe(false);
    await expect(carte(page, id)).toHaveClass(/assistance-parcours-item--suggere/);
    await expect(boutonModele(page, id)).toBeFocused();
    await expect(boutonModele(page, id)).toHaveText('Je regarde');
    await boutonModele(page, id).click();
}

/** Les Modélisations de « Mettre ta classe en place » puis d'« Évaluer une première production », jusqu'à leur dernière bulle. */
export async function faireLesDeuxModeles(page, options = {}) {
    await ouvrirPanneau(page);
    await boutonModele(page, 'classe').click();
    await faireLaModelisation(page);
    await voirLeParcoursPuisJeRegarde(page, 3, 'evaluer');
    return faireLeModeleDEvaluer(page, options);
}

/**
 * Le modèle d'« Évaluer », de sa première bulle à la dernière : les dix étapes du 18 nov. 2026
 * (`plans de travail/CONSIGNE-LOT-2026-11-18-je-regarde-evaluer.md`), jouées comme la personne les joue. `surEtape(n)`,
 * appelé à l'arrivée de chaque étape, laisse le banc du modèle y juger la bulle avant le geste.
 */
export async function faireLeModeleDEvaluer(page, { surEtape = null, rangeesAMain = false } = {}) {
    const m = await page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursEvaluer.materiel)));
    const t = await page.evaluate(() => JSON.parse(JSON.stringify(window.ParcoursEvaluer.textes)));
    const arrivee = async (n) => { await etapeEvaluer(page, n, t['etape' + n].titre); if (surEtape) await surEtape(n); };

    // 1 à 3 : l'assistant, puis la question de l'échelle.
    await arrivee(1);
    await page.click('#conception-pratiques-notation [data-action="creerNouvellePratique"]');
    await expect(page.locator('#modalWizardPratiqueV2')).toHaveClass(/actif/);
    if (surEtape) await surEtape(1.5);
    await page.locator('#modalWizardPratiqueV2 input[name="porteEntree"][value="modele"]').check({ force: true });
    await page.click('#wizard-v2-btn-suivant');
    await arrivee(2);
    const standards = page.locator(`#modalWizardPratiqueV2 input[name="modeleChoisi"][value="${m.pratique.id}"]`);
    await expect(async () => { await standards.check({ force: true }); await expect(standards).toBeChecked({ timeout: 500 }); }).toPass({ timeout: 5000 });
    await page.click('#wizard-v2-btn-suivant');
    await expect(page.locator('#wizard-v2-btn-creer')).toBeVisible();
    if (surEtape) await surEtape(2.5);
    await page.click('#wizard-v2-btn-creer');
    await arrivee(3);
    await page.locator('#overlay-ui-dialogue .ui-dialogue-choix-ligne', { hasText: m.echelle }).click();
    await page.getByRole('button', { name: 'Adopter', exact: true }).click();

    // 4 : la pratique appliquée au cours du deuxième groupe.
    await arrivee(4);
    const pratiqueId = await page.evaluate(() => (db.getSync(cle('pratiquesConfigurables'), []) || []).find((p) => String(p.id).indexOf('demo-') !== 0).id);
    await page.selectOption('#menuPratiques', pratiqueId);
    await page.locator('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]').scrollIntoViewIfNeeded();
    await page.click('#conteneurEditionPratique [data-action="appliquerPratiqueAuCoursActive"]');

    // 5 : la grille, étiquetée.
    await arrivee(5);
    await boutonDeBulle(page, REMPLIR).click();
    await expect(page.locator('#dissection-contenu .dissection-morceau')).toHaveCount(14);
    if (surEtape) await surEtape(5.1);
    await etiqueterTous(page, 'titre', [m.grille.nom]);
    await etiqueterTous(page, 'critere', [m.grille.criteres[0][0], m.grille.criteres[1][0]]);
    await etiqueterTous(page, 'description', [m.grille.criteres[0][1], m.grille.criteres[1][1]]);
    await etiqueterTous(page, 'ponderation', [m.grille.criteres[0][2], m.grille.criteres[1][2]]);
    if (surEtape) await surEtape(5.5);
    if (rangeesAMain) {
        await etiqueterTous(page, 'critere', m.grille.criteres.map((c) => c[0]));
        await etiqueterTous(page, 'description', m.grille.criteres.map((c) => c[1]));
        await etiqueterTous(page, 'ponderation', m.grille.criteres.map((c) => c[2]));
    } else await boutonDeBulle(page, t.etape5.suite.bouton).click();
    await expect(page.locator('#materiel-dissection [data-action="materielDissection.creer"]')).toBeEnabled();
    if (surEtape) await surEtape(5.8);
    await page.click('#materiel-dissection [data-action="materielDissection.creer"]');

    // 6 : la cartouche.
    await arrivee(6);
    const grilleId = await page.evaluate((nom) => (db.getSync(cle('grillesTemplates'), []) || []).find((g) => g.nom === nom).id, m.grille.nom);
    await page.click('#conception-retroactions [data-action="creerNouvelleCartouche"]');
    await attendreRemplir(page, 'étape 6');
    if (surEtape) await surEtape(6.2);
    await boutonDeBulle(page, REMPLIR).click();
    await expect(page.locator('#cartoucheZonePrincipale textarea[id^="comm_"]')).toHaveCount(20);
    await expect.poll(() => page.locator('#cartoucheZonePrincipale textarea[id^="comm_"]').evaluateAll((ts) => ts.every((x) => x.value.trim() !== ''))).toBe(true);
    if (surEtape) await surEtape(6.5);
    await page.evaluate(() => document.querySelectorAll('.notifications-pile > *').forEach((n) => n.remove()));
    await page.click('#btnCreerCartouche');

    // 7 : la production ; le menu « Type » ouvert par la personne.
    await arrivee(7);
    const cartoucheId = await page.evaluate((g) => (db.getSync(cle('cartouches_' + g), []) || [])[0].id, grilleId);
    await page.click('#conception-productions [data-action="creerNouvelleProduction"]');
    await expect(page.locator('#productionType')).toBeVisible();
    if (surEtape) await surEtape(7.1);
    await page.locator('#productionType').focus();
    if (surEtape) await surEtape(7.2);
    await boutonDeBulle(page, REMPLIR).click();
    await expect(page.locator('#productionCartouche')).toHaveValue(cartoucheId);
    if (surEtape) await surEtape(7.5);
    await page.click('#btnCreerProduction');

    // 8 : les consignes.
    await arrivee(8);
    const pid = await page.evaluate((g) => (db.getSync(cle('productions'), []) || []).find((p) => p.grilleId === g).id, grilleId);
    await boutonDeBulle(page, REMPLIR).click();
    await expect(page.locator('#productionDateEcheance')).toHaveValue(m.production.echeance);
    if (surEtape) await surEtape(8.5);
    await page.check('#productionEcheanceAssignee');

    // 9 : l'évaluation de Yack Amical.
    await arrivee(9);
    await actionDeLaListe(page, 'evaluer|' + m.etudiantEvalue.da + '|' + pid);
    await expect.poll(() => page.locator('#listeCriteresGrille1 select[id^="eval_"]').count()).toBe(4);
    if (surEtape) await surEtape(9.3);
    const criteres = await page.evaluate(() => [...document.querySelectorAll('#listeCriteresGrille1 select[id^="eval_"]')].map((c) => c.id));
    for (const [k, [, niveau]] of m.niveaux.entries()) await page.selectOption('#' + criteres[k], niveau);
    if (surEtape) await surEtape(9.6);
    await page.fill('#motPourEtudiant1', m.mot);
    await page.click('#btnVerrouillerEvaluation');

    // 10 : le point qui s'allume.
    await arrivee(10);
    const evaluationId = await page.evaluate((p) => (db.getSync(cle('evaluationsSauvegardees'), []) || []).find((e) => e.productionId === p && !e.remplaceeParId).id, pid);
    return { m, t, grilleId, pid, evaluationId, cartoucheId, pratiqueId };
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
