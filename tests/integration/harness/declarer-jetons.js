// SANS DÉCLARATION, PAS DE JETONS (décision de Grégoire, 28 nov. 2026, 8 h 42).
//
// Les pratiques de la démonstration ne portent encore aucun réglage de jetons : le moteur ne leur prête plus le défaut
// (2 / 2 / 2), donc la démonstration n'offre plus de jetons tant que `js/pack-demo-10.js` ne les déclare pas (prévu à la
// release, troisième amendement, 9 h 05). Un banc qui accorde ou propose un jeton dans la démonstration pose donc
// LUI-MÊME, dans sa mise en place, la déclaration que le pack portera : mêmes valeurs que l'ancien défaut, au même
// endroit (le bloc `jetons` à la racine de la pratique). Quand le pack la portera, cet appel deviendra sans effet.
export const DECLARATION_JETONS_DEMO = {
    actif: true,
    delai: { nombre: 2, dureeJours: 2 },
    reprise: { nombre: 2, maxParProduction: 1, archiverOriginale: true },
    repriseCiblee: { actif: true, nombre: 2, plafondNote: null }
};

/** Pose la déclaration sur la pratique ACTIVE du groupe-cours ouvert (ou sur `id`). Rend l'identifiant de la pratique. */
export async function declarerJetonsDeLaPratiqueActive(page, id = null) {
    return page.evaluate(async ({ id, declaration }) => {
        // security-ok: jeu d'essai littéral d'un banc, aucune source externe.
        const cible = id || window.obtenirIdPratiqueActive();
        const c = cle('pratiquesConfigurables');
        const liste = db.getSync(c, []) || [];
        const p = liste.find(x => x && x.id === cible);
        if (!p) throw new Error('declarerJetonsDeLaPratiqueActive : pratique « ' + cible + ' » introuvable');
        if (!(p.configuration && p.configuration.jetons) && !(p.config && p.config.jetons) && !p.jetons) p.jetons = declaration;
        db.setSync(c, liste);
        if (typeof db.flush === 'function') await db.flush();
        return cible;
    }, { id, declaration: DECLARATION_JETONS_DEMO });
}
