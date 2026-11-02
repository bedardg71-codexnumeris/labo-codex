/**
 * Attendre que l'application ait fini de réagir à un geste, au lieu d'attendre un délai.
 *
 * Après une navigation, un clic ou un `change`, l'application réagit par des minuteries
 * (150 à 500 ms pour une navigation, 1,5 s pour l'enregistrement automatique), par des
 * écritures en cours et par des transitions. Rien n'annonce la fin de tout cela : le banc
 * la constate. `suivreLesReactions(page)` note les minuteries de la page, avant le
 * `goto` ; `attendreRepos(page)` rend la main quand aucune de celles que l'horizon couvre
 * n'est en attente, qu'aucune transition finie ne court, que rien n'a défilé depuis 100 ms,
 * et que les écritures sont drainées.
 *
 * L'HORIZON tient la place de la durée de la pause remplacée : une minuterie plus longue
 * n'était pas attendue non plus. Il ne couvre surtout pas les 2 s au bout desquelles le
 * témoin « Enregistré » s'efface : attendre celle-là ferait lire un témoin déjà parti.
 *
 * ⚠ Ne vaut PAS pour un constat d'absence (aucune écriture, aucun message, aucune erreur) :
 * une cause qui ne passe pas par une minuterie (une promesse, un événement) n'est pas vue.
 * Ces constats gardent leur fenêtre, avec le marqueur `pause-gardee :` et son motif.
 *
 * Un repos qui ne vient jamais ÉCHOUE et nomme les minuteries en cours. Jamais de repli
 * sur un délai : ce serait passer sans savoir.
 */
export async function suivreLesReactions(page) {
    await page.addInitScript(() => {
        if (window.__reactionsDuBanc) return;
        const poser = window.setTimeout.bind(window);
        const retirer = window.clearTimeout.bind(window);
        const enAttente = new Map();
        window.setTimeout = function (rappel, delai, ...args) {
            const pile = (new Error().stack || '').split('\n')[1] || '?';
            const id = poser(function (...recus) {
                enAttente.delete(id);
                if (typeof rappel === 'function') return rappel.apply(this, recus);
            }, delai, ...args);
            enAttente.set(id, { delai: Number(delai) || 0, pile: pile.replace(/^.*\/js\//, '') });
            return id;
        };
        window.clearTimeout = function (id) {
            enAttente.delete(id);
            return retirer(id);
        };
        // Un défilement doux (`scrollIntoView({ behavior: 'smooth' })`) n'est ni une minuterie ni
        // une animation : seul son événement `scroll`, à chaque image, le dit en cours.
        const suivi = { enAttente, poser, dernierDefilement: -Infinity };
        window.addEventListener('scroll', () => { suivi.dernierDefilement = performance.now(); }, { capture: true, passive: true });
        window.__reactionsDuBanc = suivi;
    });
}

export async function attendreRepos(page, { horizon = 1000, timeout = 15000 } = {}) {
    await page.evaluate(async ({ horizon, timeout }) => {
        const suivi = window.__reactionsDuBanc;
        if (!suivi) throw new Error('attendreRepos : `suivreLesReactions(page)` doit précéder le goto.');
        const minuteries = () => [...suivi.enAttente.values()].filter((m) => m.delai <= horizon);
        // Une animation sans fin (un pouls) n'a pas de fin à attendre. Et WebKit relance à chaque
        // image, sur l'élément qu'elle anime, la transition de la propriété qu'elle fait varier
        // (mesuré le 2 nov. : `outline-color` 200 ms sur la cible de la flèche didactique) :
        // cette transition-là n'a pas de fin non plus.
        const transitions = () => {
            const enCours = document.getAnimations().filter((a) => a.playState === 'running');
            const sansFin = new Set(enCours.filter((a) => a.effect?.getComputedTiming().iterations === Infinity).map((a) => a.effect?.target));
            return enCours.filter((a) => a.effect?.getComputedTiming().iterations !== Infinity && !sansFin.has(a.effect?.target));
        };
        const defile = () => performance.now() - suivi.dernierDefilement < 100;
        const auRepos = () => minuteries().length === 0 && transitions().length === 0 && !defile();
        const tick = (ms) => new Promise((fin) => suivi.poser(fin, ms));
        const images = () => new Promise((fin) => requestAnimationFrame(() => requestAnimationFrame(fin)));
        const limite = performance.now() + timeout;
        for (;;) {
            if (auRepos()) {
                await window.db?.flush?.();
                await images();
                if (auRepos()) return;
            }
            if (performance.now() > limite) {
                const nommer = (a) => {
                    const cible = a.effect?.target;
                    const ou = cible ? `${cible.tagName.toLowerCase()}${cible.id ? '#' + cible.id : ''}${typeof cible.className === 'string' && cible.className ? '.' + cible.className.trim().split(/\s+/).join('.') : ''}` : '?';
                    const t = a.effect?.getComputedTiming();
                    return `${a.animationName || a.transitionProperty || a.constructor.name} sur ${ou} (${t?.duration} ms × ${t?.iterations})`;
                };
                throw new Error(`attendreRepos : pas de repos après ${timeout} ms. Minuteries : ${JSON.stringify(minuteries().map((m) => `${m.delai} ms ${m.pile}`))} ; transitions : ${JSON.stringify(transitions().map(nommer))} ; défilement : ${defile() ? 'en cours' : 'aucun'}.`);
            }
            await tick(16);
        }
    }, { horizon, timeout });
}
