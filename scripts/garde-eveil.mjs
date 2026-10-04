/**
 * Garde-éveil et garde mémoire du verdict Playwright (#1008, 4 oct. 2026).
 *
 * CE QUE CE MODULE CONTIENT
 * -------------------------
 * Les DÉCISIONS de verifier-playwright.mjs, en fonctions pures : lire une sortie
 * de `pmset` ou de `sysctl`, juger un seuil. Le script fait les appels système ;
 * ici, rien ne touche à la machine, d'où la sentinelle Vitest qui les éprouve
 * sur des sorties figées (tests/unit/sentinelle-1008-garde-eveil.test.js).
 *
 * POURQUOI (la nuit du 1er oct. 2026, fiche #1008)
 * ------------------------------------------------
 * Le verdict de 1.173.0, lancé écran éteint en éveil sombre, n'a jamais été
 * rendu : deux « Maintenance Sleep » (32 min) malgré `caffeinate -i`, un fichier
 * d'échange à 14,6 Go sur 15,4, et un Mac redémarré par le bouton.
 *
 * MESURÉ LE 4 OCT. 2026, 7 h 09 – 7 h 12, avant d'écrire ce module
 * ----------------------------------------------------------------
 *   · L'horloge monotone de Node (`process.hrtime`) COMPTE le temps de veille
 *     sur ce Mac : depuis le démarrage, elle s'écartait de 3 s de l'horloge
 *     murale, quand `pmset -g log` y inscrivait 51 077 s de veille. L'écart des
 *     deux horloges ne détecte donc RIEN ; les veilles se lisent au journal.
 *   · Sur batterie, `caffeinate -s` pose bien son assertion PreventSystemSleep,
 *     mais le total système reste à 0 (Apple : « valide sur secteur seulement »).
 *   · `pmset displaysleepnow` éteint l'écran même sous `-d` ; `caffeinate -u`
 *     le rallume.
 *   · `pmset -g systemstate` rend « CPU Graphics Audio Network » en éveil
 *     complet. ⚠ Inféré, pas mesuré : qu'en éveil sombre « Graphics » manque.
 */

/** Un nombre macOS : la virgule décimale dépend de la langue (« 5524,38M »). */
function nombre(brut) {
    const n = Number(String(brut).replace(',', '.'));
    return Number.isFinite(n) ? n : null;
}

/** `sysctl vm.swapusage` → mégaoctets utilisés, ou null si illisible. */
export function lireEchangeMo(texte) {
    const m = String(texte ?? '').match(/used\s*=\s*([\d.,]+)\s*([MG])/);
    if (!m) return null;
    const valeur = nombre(m[1]);
    if (valeur === null) return null;
    return m[2] === 'G' ? valeur * 1024 : valeur;
}

/**
 * `sysctl -n kern.memorystatus_vm_pressure_level` → 1 normal, 2 avertissement,
 * 4 critique ; null si illisible.
 */
export function lirePression(texte) {
    const t = String(texte ?? '').trim().match(/(\d+)\s*$/);
    return t ? Number(t[1]) : null;
}

/** `pmset -g systemstate` → liste des capacités du système en ce moment. */
export function lireCapacites(texte) {
    const m = String(texte ?? '').match(/Current System Capabilities are:\s*(.*)/);
    return m ? m[1].trim().split(/\s+/).filter(Boolean) : [];
}

/** `pmset -g ps` → 'secteur', 'batterie', ou null. */
export function lireAlimentation(texte) {
    const t = String(texte ?? '');
    if (/'AC Power'/.test(t)) return 'secteur';
    if (/'Battery Power'/.test(t)) return 'batterie';
    return null;
}

/** `pmset -g assertions` → { NomAssertion: compte } du bloc « system-wide ». */
export function lireAssertionsSysteme(texte) {
    const lignes = String(texte ?? '').split('\n');
    const debut = lignes.findIndex((l) => /Assertion status system-wide/.test(l));
    const totaux = {};
    if (debut < 0) return totaux;
    for (const ligne of lignes.slice(debut + 1)) {
        const m = ligne.match(/^\s+(\w+)\s+(\d+)\s*$/);
        if (!m) break;
        totaux[m[1]] = Number(m[2]);
    }
    return totaux;
}

/** `pmset -g assertions` → les noms d'assertions que tient le processus `pid`. */
export function lireAssertionsDuProcessus(texte, pid) {
    const noms = new Set();
    const motif = new RegExp(`^\\s*pid ${Number(pid)}\\([^)]*\\):.*?\\d\\d:\\d\\d:\\d\\d\\s+(\\w+)\\s+named`);
    for (const ligne of String(texte ?? '').split('\n')) {
        const m = ligne.match(motif);
        if (m) noms.add(m[1]);
    }
    return noms;
}

export const ASSERTIONS_REQUISES = ['PreventUserIdleSystemSleep', 'PreventUserIdleDisplaySleep', 'PreventSystemSleep'];

/**
 * Juge l'éveil au lancement. Rend { ok, raison, systemeRetenu }.
 *
 * Trois conditions : notre caffeinate tient ses trois assertions (-i -d -s), le
 * système est en éveil complet (capacité « Graphics »), et, sur secteur, le
 * total système PreventSystemSleep est non nul — sur batterie il reste à 0 par
 * construction (mesuré), on ne l'exige donc pas : -d et -i y tiennent seuls.
 */
export function jugerEveil({ capacites, assertionsProcessus, assertionsSysteme, alimentation }) {
    const manquantes = ASSERTIONS_REQUISES.filter((nom) => !assertionsProcessus.has(nom));
    const systemeRetenu = (assertionsSysteme.PreventSystemSleep ?? 0) >= 1;
    if (manquantes.length > 0) {
        return { ok: false, systemeRetenu, raison: `caffeinate ne tient pas ${manquantes.join(', ')}` };
    }
    if (!capacites.includes('Graphics')) {
        return { ok: false, systemeRetenu, raison: `le Mac n'est pas en éveil complet (capacités : ${capacites.join(' ') || 'illisibles'})` };
    }
    if (alimentation === 'secteur' && !systemeRetenu) {
        return { ok: false, systemeRetenu, raison: 'sur secteur, PreventSystemSleep reste à 0 pour le système' };
    }
    return { ok: true, systemeRetenu, raison: '' };
}

/** Un relevé dépasse-t-il un des deux seuils ? Une valeur illisible ne dépasse pas. */
export function releveEnDepassement(releve, { echangeSeuilMo, pressionSeuil }) {
    return (releve.echangeMo !== null && releve.echangeMo >= echangeSeuilMo)
        || (releve.pression !== null && releve.pression >= pressionSeuil);
}

/**
 * Pendant la suite : arrêter si les `consecutifs` derniers relevés dépassent.
 * Un pic isolé ne suffit pas ; un dépassement tenu, si.
 */
export function jugerMemoire(releves, seuils, consecutifs = 2) {
    const derniers = releves.slice(-consecutifs);
    const arreter = derniers.length === consecutifs && derniers.every((r) => releveEnDepassement(r, seuils));
    if (!arreter) return { arreter: false, raison: '' };
    const r = derniers[derniers.length - 1];
    return { arreter: true, raison: `échange ${formaterMo(r.echangeMo)}, pression ${r.pression ?? '?'} (seuils ${formaterMo(seuils.echangeSeuilMo)}, ${seuils.pressionSeuil}), ${consecutifs} relevés de suite` };
}

/** Au lancement : un échange déjà au-delà du seuil interdit de lancer. */
export function jugerLancementMemoire(releve, echangeLancementMo) {
    if (releve.echangeMo !== null && releve.echangeMo >= echangeLancementMo) {
        return { ok: false, raison: `échange déjà à ${formaterMo(releve.echangeMo)} au lancement (seuil ${formaterMo(echangeLancementMo)})` };
    }
    return { ok: true, raison: '' };
}

/** Le plus haut de chaque grandeur sur la suite. */
export function memoireAuPlusHaut(releves) {
    const max = (cle) => releves.reduce((m, r) => (r[cle] !== null && (m === null || r[cle] > m) ? r[cle] : m), null);
    return { echangeMo: max('echangeMo'), pression: max('pression') };
}

/**
 * `pmset -g log` → les veilles entrées dans [debutMs, finMs] :
 * [{ instant, motif, dureeS }]. La durée est celle que pmset inscrit sur la
 * ligne « Entering Sleep state » (temps passé endormi).
 */
export function lireVeillesDuJournal(texte, debutMs, finMs) {
    const veilles = [];
    const motif = /^(\d{4}-\d\d-\d\d) (\d\d:\d\d:\d\d) ([+-]\d\d)(\d\d)\s+Sleep\s+Entering Sleep state due to '([^']+)'.*?(\d+) secs/;
    for (const ligne of String(texte ?? '').split('\n')) {
        const m = ligne.match(motif);
        if (!m) continue;
        const instant = Date.parse(`${m[1]}T${m[2]}${m[3]}:${m[4]}`);
        if (Number.isNaN(instant) || instant < debutMs || instant > finMs) continue;
        veilles.push({ instant: new Date(instant).toISOString(), motif: m[5], dureeS: Number(m[6]) });
    }
    return veilles;
}

export function formaterMo(mo) {
    if (mo === null || mo === undefined) return '?';
    return mo >= 1024 ? `${(mo / 1024).toFixed(1)} Go` : `${Math.round(mo)} Mo`;
}
