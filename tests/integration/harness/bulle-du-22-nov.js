// =======================================================================
// LIRE UNE BULLE ENTIÈRE, ET LA CONFRONTER AUX TEXTES DU 22 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 3 à 5. Les bancs des parcours 6, 7 et
// 8 lisent les textes dans le module du parcours (`textes`), que la sentinelle Vitest confronte à la consigne ; ici, ils
// vérifient que l'ÉCRAN les dit : l'entrée, la confirmation, l'objectif, la phrase du lieu (son début lu dans le menu
// par le moteur), les explications (sans marque), les gestes (la flèche) et le geste principal (en gras), dans l'ordre.
import { expect } from '@playwright/test';

/** Le texte tel qu'on le compare : les espaces insécables du moteur (`typographier`) ramenées à des espaces. */
export const aPlat = (t) => String(t || '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();

/** Tout ce que la bulle dit, dans l'ordre de l'écran. */
export const lireToute = (page) => page.evaluate(() => {
    const b = document.getElementById('parcours-bulle');
    if (!b) return null;
    const plat = (t) => String(t || '').replace(/[  ]/g, ' ').replace(/\s+/g, ' ').trim();
    const vis = (e) => !!e && !e.hidden && e.getClientRects().length > 0;
    const txt = (sel) => { const e = b.querySelector(sel); return vis(e) ? plat(e.textContent) : ''; };
    const boite = b.querySelector('.parcours-bulle-lignes');
    const lignes = [];
    if (boite) {
        for (const e of boite.children) {
            if (e.tagName === 'P') {
                const c = e.className;
                const t = plat(e.textContent);
                // L'objectif atteint a la forme de l'objectif (en gras, entre deux filets) : c'est une ligne de la fin.
                const genre = /objectif/.test(c) ? (t.startsWith('Objectif atteint') ? 'fin' : 'objectif') : /lieu/.test(c) ? 'lieu' : /revue|suite/.test(c) ? 'fin' : 'n';
                lignes.push([genre, t]);
            } else if (e.tagName === 'UL') {
                for (const li of e.children) {
                    const t = plat((li.querySelector('.parcours-bulle-ligne-texte') || li).textContent);
                    const genre = li.classList.contains('parcours-bulle-ligne--geste') ? 'c' : li.classList.contains('parcours-bulle-ligne--a-faire') ? 'g' : 'n';
                    lignes.push([genre, t]);
                }
            }
        }
    }
    return {
        entree: txt('.parcours-bulle-identite'),
        aide: txt('.parcours-bulle-aide'),
        confirme: txt('.parcours-bulle-confirme'),
        titre: txt('.parcours-bulle-titre'),
        rang: txt('.parcours-bulle-rang'),
        lignes,
        boutons: [...b.querySelectorAll('.parcours-bulle-boutons button')].map((x) => plat(x.textContent)),
        sortie: txt('.parcours-bulle-sortie')
    };
});

/**
 * La bulle dit EXACTEMENT ces lignes (explications, gestes, geste principal), dans cet ordre, après ce qui l'ouvre
 * (objectif, lieu) et avant ce que le moteur pose à la fin (objectif atteint, suite) ; avec ce titre et, s'il y a lieu,
 * cette confirmation et cette suite de phrase du lieu.
 * @param {Object} a - { titre, confirme?: string|null, lieuSuite?: string|null, lieuVerbe?: string, lignes: [[t, texte]],
 *   objectif?: string, seconde?: bool }
 */
export async function bulleDit(page, a, contexte) {
    const voulu = a.lignes.map(([t, x]) => [t, aPlat(x)]);
    await expect.poll(async () => {
        const v = await lireToute(page);
        return v ? v.lignes.filter((l) => ['n', 'g', 'c'].includes(l[0])).map((l) => [l[0], l[1]]) : null;
    }, { message: contexte + ' : les lignes de la bulle', timeout: 10000 }).toEqual(voulu);
    const v = await lireToute(page);
    expect(v.titre, contexte + ' : le titre').toBe(aPlat(a.titre));
    if (a.confirme !== undefined) expect(v.confirme, contexte + ' : la confirmation').toBe(aPlat(a.confirme || ''));
    const lieu = v.lignes.find((l) => l[0] === 'lieu');
    if (a.lieuSuite !== undefined && a.lieuSuite !== null) {
        expect(lieu, contexte + ' : la phrase du lieu').toBeTruthy();
        expect(lieu[1].endsWith(aPlat(a.lieuSuite)), contexte + ' : la suite du lieu (« ' + lieu[1] + ' »)').toBe(true);
        expect(lieu[1].startsWith(a.lieuVerbe || 'Tu es dans « '), contexte + ' : le début du lieu').toBe(true);
    } else if (a.lieuSuite === null) {
        expect(lieu, contexte + ' : aucune phrase du lieu').toBeFalsy();
    }
    const objectif = v.lignes.find((l) => l[0] === 'objectif');
    if (a.objectif) expect(objectif && objectif[1], contexte + ' : l’objectif').toBe(aPlat(a.objectif));
    else expect(objectif, contexte + ' : pas d’objectif hors de la première bulle').toBeFalsy();
    return v;
}

/** La phrase du lieu, entière, telle que la bulle la dit. */
export async function lieuDit(page) {
    const v = await lireToute(page);
    const l = v && v.lignes.find((x) => x[0] === 'lieu');
    return l ? l[1] : '';
}
