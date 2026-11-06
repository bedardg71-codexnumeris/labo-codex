import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// SENTINELLE — 1er NOVEMBRE 2026 · APRÈS UNE OUVERTURE, ON ATTEND L'APPLICATION, PAS UN DÉLAI.
//
// Les pauses fixes faisaient ~60 % de la vérification du Mac. Celles qui suivaient
// une ouverture (897 à l'exécution, 22,8 min sur GitHub) attendaient 500 à 5 000 ms
// une application prête en un tiers de seconde. Elles sont remplacées par
// `attendreApplication(page)` (tests/integration/harness/attendre-application.js).
// Ce cliquet empêche qu'elles repoussent :
//   · une pause écrite juste après un `goto` ou un `reload` échoue directement ;
//   · le nombre de sites de pause des specs ne peut que baisser. Un SITE est un endroit
//     du source où un délai est écrit : chaque `waitForTimeout`, et chaque appel d'une
//     enveloppe d'une ligne (`const pause = (page, ms) => page.waitForTimeout(ms)`), où le
//     délai s'écrit à l'appel. Une aide plus longue qui contient une pause compte pour sa
//     ligne, une fois : ses appels ne comptent pas, sans quoi chaque spec neuve qui la
//     réutilise ferait rougir le cliquet. C'est le source qu'on tient, pas l'exécution.
// Rapport : plans de travail/RAPPORT-2026-11-01-duree-de-la-verification.md.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTEGRATION = path.resolve(__dirname, '..', 'integration');

// ⛔ Ne se relève pas. Une spec neuve attend une condition, pas un délai.
// 2 nov. 2026 : 904 → 692, les 30 sites les plus lourds sauf profil-rangee-1151 (plans de travail/RAPPORT-2026-11-02-pauses-les-plus-lourdes.md).
// 6 nov. 2026 : 692 → 738 à la fusion dans main, qui avait ajouté ses specs sans ce cliquet (753) ;
// les 5 pauses après ouverture de ajouter-pages-photo-droite, notifications-pile-1224 et
// reunir-en-une-copie-1231 deviennent attendreApplication. C'était un relèvement, justifié par les specs de main.
// 6 nov. 2026 : 738 → 619, recompté selon la règle des sites. Avant, une aide comptait ses appels
// si sa première pause précédait la première `}` de son corps : 44 aides vues, 82 non vues pour
// une accolade (plans de travail/VERDICT-RELECTURE-2026-11-06-fusion-des-trois-lots.md § 2).
const PLAFOND_DES_PAUSES = 619;

/** Marque une pause qu'aucune condition observable ne peut remplacer : le commentaire dit pourquoi. */
const MARQUE_GARDEE = 'pause-gardee :';

const ligneDeCommentaire = (ligne) => /^\s*(\/\/|\/\*|\*)/.test(ligne);

/** Un appel de `waitForTimeout` seul, arguments compris (une paire de parenthèses imbriquée au plus). */
const APPEL_DE_PAUSE = String.raw`(?:await\s+)?\w+(?:\.\w+)*\.waitForTimeout\((?:[^()\n]|\([^()\n]*\))*\)`;

/**
 * Les enveloppes du fichier : les fonctions dont le corps ENTIER est la pause.
 * `const pause = (page, ms) => page.waitForTimeout(ms)`, la même avec `{ return … }` ou
 * `{ await … }`, ou une `function` dont le seul énoncé est ce `return` (ou cet `await`).
 * Une fonction qui fait autre chose n'en est pas une, où que tombent ses accolades.
 */
function enveloppes(texte) {
    const noms = new Set();
    const fleche = new RegExp(String.raw`(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*(?:${APPEL_DE_PAUSE}\s*;?\s*$|\{\s*(?:return\s+)?${APPEL_DE_PAUSE}\s*;?\s*\})`, 'gm');
    const fonction = new RegExp(String.raw`function\s+(\w+)\s*\([^)]*\)\s*\{\s*(?:return\s+)?${APPEL_DE_PAUSE}\s*;?\s*\}`, 'g');
    for (const m of texte.matchAll(fleche)) noms.add(m[1]);
    for (const m of texte.matchAll(fonction)) noms.add(m[1]);
    return noms;
}

/** Vrai si la ligne fait une pause : `.waitForTimeout(` ou l'appel d'une enveloppe du fichier. */
function estUnePause(ligne, noms) {
    if (/\.waitForTimeout\(/.test(ligne)) return true;
    // `function pause(` est la définition, pas un appel.
    return [...noms].some((nom) => new RegExp(`(^|[^\\w.])(?<!\\bfunction\\s+)${nom}\\(`).test(ligne));
}

/** Les sites de pause d'un fichier : chaque `waitForTimeout` écrit (la définition d'une enveloppe comprise), chaque appel d'une enveloppe. */
function compterPauses(texte) {
    const noms = enveloppes(texte);
    return texte.split('\n').filter((l) => !ligneDeCommentaire(l) && estUnePause(l, noms)).length;
}

/**
 * Les pauses écrites juste après une ouverture ou un rechargement, avec leur numéro
 * de ligne. Entre les deux, seuls comptent pour rien les lignes vides, les
 * commentaires et `waitForLoadState`, qui ne fait pas attendre l'application.
 */
function pausesApresOuverture(texte) {
    const lignes = texte.split('\n');
    const noms = enveloppes(texte);
    const trouvees = [];
    for (let i = 0; i < lignes.length; i++) {
        if (ligneDeCommentaire(lignes[i]) || !/\.(goto|reload)\(/.test(lignes[i])) continue;
        let k = i;
        while (k < lignes.length - 1 && !/\)\s*;\s*(\/\/.*)?$/.test(lignes[k])) k++; // appel sur plusieurs lignes
        k++;
        while (k < lignes.length && (!lignes[k].trim() || ligneDeCommentaire(lignes[k]) || lignes[k].includes('waitForLoadState('))) k++;
        if (k >= lignes.length || !estUnePause(lignes[k], noms)) continue;
        if (lignes[k - 1].includes(MARQUE_GARDEE) || lignes[k].includes(MARQUE_GARDEE)) continue;
        trouvees.push({ ligne: k + 1, texte: lignes[k].trim() });
    }
    return trouvees;
}

/** Les specs et les aides qu'elles partagent, sauf l'aide qui remplace ces pauses. */
function fichiersDesSpecs() {
    return readdirSync(INTEGRATION, { recursive: true })
        .filter((f) => f.endsWith('.js'))
        .map((f) => ({ nom: f, texte: readFileSync(path.join(INTEGRATION, f), 'utf8') }));
}

describe('Après une ouverture, aucune pause fixe', () => {
    it('aucune pause écrite juste après un goto ou un reload', () => {
        const fautes = fichiersDesSpecs().flatMap(({ nom, texte }) => pausesApresOuverture(texte).map((p) => `${nom}:${p.ligne}  ${p.texte}`));
        expect(fautes, `Une pause fixe juste après une ouverture. À la place : \`await attendreApplication(page)\` (tests/integration/harness/attendre-application.js), puis, si l'étape suivante a besoin de plus, l'attente de cette condition. Si rien n'est observable, garde la pause et écris au-dessus \`// ${MARQUE_GARDEE} <pourquoi>\`.`).toEqual([]);
    });

    it('le nombre de pauses des specs ne monte pas, et le plafond suit quand il baisse', () => {
        const total = fichiersDesSpecs().reduce((somme, { texte }) => somme + compterPauses(texte), 0);
        expect(total, `${total} pauses pour un plafond de ${PLAFOND_DES_PAUSES}. Une spec neuve attend une condition (un élément, un état, \`attendreApplication\`), pas un délai.`).toBeLessThanOrEqual(PLAFOND_DES_PAUSES);
        expect(total, `Il y a moins de pauses qu'au plafond : descends PLAFOND_DES_PAUSES à ${total}, pour que le terrain gagné le reste.`).toBe(PLAFOND_DES_PAUSES);
    });
});

describe('Le cliquet voit ce qu\'il doit voir', () => {
    const entete = 'await page.goto(indexHtml);\nawait page.waitForLoadState(\'domcontentloaded\');\n';

    it('une pause après goto, après reload, après un goto sur plusieurs lignes, par une enveloppe', () => {
        expect(pausesApresOuverture(`${entete}await page.waitForTimeout(800);`)).toHaveLength(1);
        expect(pausesApresOuverture('await page.reload();\n\n// commentaire\nawait neuf.page.waitForTimeout(3000);')).toHaveLength(1);
        expect(pausesApresOuverture('await page.goto(indexHtml, {\n  waitUntil: \'load\'\n});\nawait page.waitForTimeout(500);')).toHaveLength(1);
        expect(pausesApresOuverture(`const pause = (page, ms) => page.waitForTimeout(ms);\n${entete}await pause(page, 500);`)).toHaveLength(1);
    });

    it('ni l\'attente d\'une condition, ni une pause plus loin, ni une pause gardée et dite', () => {
        expect(pausesApresOuverture(`${entete}await attendreApplication(page);\nawait page.waitForTimeout(800);`)).toEqual([]);
        expect(pausesApresOuverture(`${entete}await page.click('#x');\nawait page.waitForTimeout(800);`)).toEqual([]);
        expect(pausesApresOuverture(`${entete}// ${MARQUE_GARDEE} l'anti-rebond n'a pas d'effet visible\nawait page.waitForTimeout(800);`)).toEqual([]);
        expect(pausesApresOuverture(`// await page.goto(indexHtml);\nawait page.waitForTimeout(800);`)).toEqual([]);
    });

    it('le compte voit les pauses directes et les appels d\'une enveloppe, pas les commentaires', () => {
        const texte = 'const pause = (page, ms) => page.waitForTimeout(ms);\nawait pause(page, 1);\n// await page.waitForTimeout(1);\nawait page.waitForTimeout(2);\nawait maPause(page);';
        expect(compterPauses(texte)).toBe(3);
    });

    it('une aide de plusieurs lignes compte sa pause une fois, une enveloppe d\'une ligne compte ses appels', () => {
        const appels = '\nawait demarrer(page);\nawait demarrer(page);\nawait demarrer(page);';
        // La `}` du page.evaluate précède la pause (le cas de demarrer() le 6 nov.) : 1, pas 4.
        const accoladeAvant = 'async function demarrer(page) {\n    await page.evaluate(() => { window.x = 1; });\n    await page.waitForTimeout(3000);\n}';
        expect(compterPauses(accoladeAvant + appels)).toBe(1);
        // Sans `}` avant la pause : 1 aussi. L'accolade ne décide plus de rien.
        const accoladeApres = 'async function demarrer(page) {\n    await page.waitForTimeout(3000);\n    await page.click(\'#x\');\n}';
        expect(compterPauses(accoladeApres + appels)).toBe(1);
        const flecheLongue = 'const demarrer = async (page) => {\n    await page.waitForTimeout(3000);\n    await page.click(\'#x\');\n};';
        expect(compterPauses(flecheLongue + appels)).toBe(1);
        // Une enveloppe d'une ligne : le délai s'écrit à l'appel, chaque appel est un site.
        expect(compterPauses('const demarrer = (page, ms) => page.waitForTimeout(ms);' + appels)).toBe(4);
        expect(compterPauses('async function demarrer(page, ms) {\n    return page.waitForTimeout(ms);\n}' + appels)).toBe(4);
        expect(compterPauses('const demarrer = async (page) => { await page.waitForTimeout(500); };' + appels)).toBe(4);
    });
});
