/**
 * #760 (24 sept. 2026) — Le VRAI module `travaux-outils.js`, chargé sur un `db` en
 * mémoire : les bancs qui composent une rétroaction lisent les tampons par le seul
 * lecteur (`observationsDesTampons`) au lieu d'en imiter un.
 *
 * @param {Object} reglages - clés non namespacées posées dans le `db`
 *   (ex. `{ retroactionsObservations: {...}, tamponsPersonnalises: [...] }`)
 * @returns {Object} `travauxOutils`, et `db` pour changer un réglage en cours de banc
 */
import { chargerScript } from './charger-script.js';

class ImageStub {
    constructor() { this.src = ''; this.complete = false; }
    addEventListener() {}
    removeEventListener() {}
}

export function chargerTravauxOutilsReel(reglages = {}) {
    const stock = new Map(Object.entries(reglages).map(([k, v]) => [k, JSON.parse(JSON.stringify(v))]));
    const db = {
        ready: false,
        getSync: (cle, defaut) => (stock.has(cle) && stock.get(cle) !== null ? JSON.parse(JSON.stringify(stock.get(cle))) : defaut),
        setSync: (cle, valeur) => { stock.set(cle, valeur); },
        removeSync: (cle) => { stock.delete(cle); }
    };
    const fauxWindow = { addEventListener: () => {}, removeEventListener: () => {} };
    const w = chargerScript('js/travaux-outils.js', { db, Image: ImageStub }, fauxWindow);
    return { travauxOutils: w.travauxOutils, db };
}
