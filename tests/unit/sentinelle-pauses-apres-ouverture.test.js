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
//   · le nombre total de pauses des specs ne peut que baisser.
// Rapport : plans de travail/RAPPORT-2026-11-01-duree-de-la-verification.md.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INTEGRATION = path.resolve(__dirname, '..', 'integration');

// ⛔ Ne se relève pas. Une spec neuve attend une condition, pas un délai.
const PLAFOND_DES_PAUSES = 901;

/** Marque une pause qu'aucune condition observable ne peut remplacer : le commentaire dit pourquoi. */
const MARQUE_GARDEE = 'pause-gardee :';

const ligneDeCommentaire = (ligne) => /^\s*(\/\/|\/\*|\*)/.test(ligne);

/** Les noms qui, dans ce fichier, enveloppent un `waitForTimeout` (`const pause = (page, ms) => …`). */
function enveloppes(texte) {
    const noms = new Set();
    for (const m of texte.matchAll(/(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>\s*(?:\{[^}]*)?\w+(?:\.\w+)*\.waitForTimeout\(/g)) noms.add(m[1]);
    for (const m of texte.matchAll(/function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*?\.waitForTimeout\(/g)) noms.add(m[1]);
    return noms;
}

/** Vrai si la ligne fait une pause : `.waitForTimeout(` ou l'appel d'une enveloppe du fichier. */
function estUnePause(ligne, noms) {
    if (/\.waitForTimeout\(/.test(ligne)) return true;
    return [...noms].some((nom) => new RegExp(`(^|[^\\w.])${nom}\\(`).test(ligne));
}

/** Les pauses d'un fichier : la définition d'une enveloppe compte pour une, chaque appel pour une. */
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
});
