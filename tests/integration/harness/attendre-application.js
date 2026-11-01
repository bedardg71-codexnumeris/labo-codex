/**
 * Attendre que l'application ait fini de démarrer, au lieu d'attendre un délai.
 *
 * Après une ouverture ou un rechargement, une spec lit, sème ou touche : ce dont
 * elle a besoin, c'est que les données soient lisibles et que le gestionnaire de
 * démarrage (`auDbReady`, js/main.js) ait fini ses migrations et ses premiers
 * rendus. Mesuré le 1er nov. 2026 : tout cela tient en moins de 30 ms après
 * `window.dbReady` ; les specs attendaient 500 à 5 000 ms.
 *
 * Le dernier drapeau de migration du gestionnaire n'est posé qu'après tous ses
 * `await` de migration. Les rendus qui le suivent se terminent dans la même
 * chaîne : deux images plus tard, ils sont faits. `db.flush()` draine les écritures
 * qu'ils ont laissées en cours.
 *
 * Une condition qui ne vient jamais ÉCHOUE par dépassement. Jamais de repli sur
 * un délai : ce serait passer sans savoir.
 */
const DERNIER_DRAPEAU = 'migration_pratiqueId_to_configurable_id_done';

export async function attendreApplication(page, { timeout = 30000 } = {}) {
    await page.waitForFunction(
        (drapeau) => window.dbReady === true && window.db?.getSync?.(drapeau, false) === true,
        DERNIER_DRAPEAU,
        { timeout }
    );
    await page.evaluate(async () => {
        await new Promise((fin) => setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(fin)), 0));
        await window.db.flush();
    });
}
