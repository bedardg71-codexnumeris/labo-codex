import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { position } from './_helpers/tranche.js';

// SENTINELLE — #1152, lot 4 de la refonte de l'Aide (29 oct. 2026) : les trous comblés.
// Consigne : plans de travail/CONSIGNE-LOT-2026-10-28-aide-lot-4-les-trous.md (§1, §2). Textes : plans de travail/
// TEXTES-2026-10-28-aide-sept-trous.md, validés par Grégoire un à un (28 oct. ; la réécriture Standards, 29 oct. à 5 h 12).
//
// Ce que le banc confronte, calculé des deux côtés :
//   · chaque texte validé, LU DANS LE FICHIER TEXTES (pas recopié ici) ⟷ le texte de son entrée, mot pour mot ;
//   · le texte Standards du 28 oct., devenu faux ⟷ absent de l'Aide ;
//   · chaque libellé cité entre « » ⟷ l'écran, hors de l'Aide (index.html) ou dans js/ ; les quatre libellés que le code
//     compose (deux boutons de la proposition avant une suppression, le bouton du service, le nom du fichier privé) ⟷ leurs
//     morceaux, lus dans le code.
// Le seul écart toléré entre le texte et l'Aide : l'espace insécable (« &nbsp; » dans index.html) et l'apostrophe (’ ≡ ').
//
// BREAK-TESTS (29 oct. 2026), arbre restauré, sha256 vérifié : un mot changé dans `rencontres` (« provisoire » → « temporaire »)
// → « les quatre trous » rouge ; le texte Standards du 28 oct. remis à la place de la réécriture → « le trou 2 » rouge ;
// « + Nouvelle rencontre » renommé dans js/interventions.js (le bouton ET l’aide de l’écran vide, qui le cite) → « chaque
// libellé » rouge ; le bouton seul reste vert, à juste titre : l’écran porte encore le libellé.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const html = lire('index.html');
const TEXTES = lire('plans de travail', 'TEXTES-2026-10-28-aide-sept-trous.md');

const net = (s) => s.replace(/ /g, ' ').replace(/’/g, '\'').replace(/\s+/g, ' ').trim();
const sansGras = (s) => s.replace(/\*\*/g, '');

/** Le blockquote qui suit la ligne `apres` du fichier TEXTES : ses paragraphes, chacun la liste de ses lignes. */
function citation(apres) {
    const lignes = TEXTES.slice(position(TEXTES, '\n> ', position(TEXTES, apres)) + 1).split('\n');
    const paras = [];
    let cur = [];
    for (const l of lignes) {
        if (!l.startsWith('>')) break;
        const t = l.slice(1).trim();
        if (t === '') { if (cur.length) paras.push(cur); cur = []; } else cur.push(t);
    }
    if (cur.length) paras.push(cur);
    return paras;
}
const paragraphes = (apres) => citation(apres).map((g) => net(sansGras(g.join(' '))));

const doc = new JSDOM(html).window.document;
const entree = (id) => doc.getElementById(`accordeon-aide-${id}`);
const texteDe = (id) => net(entree(id).querySelector('.accordeon-contenu').textContent);
const titreDe = (id) => net(entree(id).querySelector('h3').textContent).replace(/^▼ /, '');

const PRESENCES = paragraphes('## Trou 3');
const SUPPRIMER = paragraphes('## Trou 1');
const RENCONTRES = citation('## Trou 5');
const CE_QUI_SORT = paragraphes('## Trou 6');
const INTRO_SOMMATIVE = paragraphes('✅ **Introduction et Sommative');
const SPECIFICATIONS = paragraphes('✅ **Spécifications');
const STANDARDS = paragraphes('✅ **Standards, réécriture');
const STANDARDS_DU_28 = paragraphes('✅ **Standards : validées');
const DENOTATION = paragraphes('✅ **Dénotation');

// L'écran, hors de l'Aide : le texte rendu, la source (attributs compris) et le code de js/.
const { pageHorsAide, sourceHorsAide } = (() => {
    const d = new JSDOM(html).window.document;
    d.getElementById('section-aide').remove();
    return { pageHorsAide: net(d.body.textContent), sourceHorsAide: net(d.body.innerHTML.replace(/&nbsp;/g, ' ')) };
})();
const fichiersJs = (d) => readdirSync(path.join(racine, d)).flatMap((n) => {
    const r = path.join(d, n);
    return statSync(path.join(racine, r)).isDirectory() ? fichiersJs(r) : (r.endsWith('.js') ? [r] : []);
});
const codeJs = net(fichiersJs('js').map((f) => lire(f)).join('\n')
    .replace(/\\'/g, '\'')
    .replace(/&nbsp;/g, ' ')
    .replace(/<\/?(em|strong)>/g, ''));
const aLEcran = (libelle) => pageHorsAide.includes(libelle) || sourceHorsAide.includes(libelle) || codeJs.includes(libelle);

describe('#1152 lot 4 · les textes validés, mot pour mot, lus dans le fichier TEXTES', () => {
    it('les trous 3, 1, 5 et 6 : chaque paragraphe paraît dans son entrée', () => {
        expect(PRESENCES).toHaveLength(1);
        expect(texteDe('saisie-presences')).toContain(PRESENCES[0]);
        expect(SUPPRIMER).toHaveLength(1);
        expect(texteDe('codex')).toContain(SUPPRIMER[0]);

        // Les rencontres : le titre, la ligne de navigation, puis deux paragraphes.
        const [[titre, navigation], ...corps] = RENCONTRES;
        expect(titreDe('rencontres')).toBe(net(sansGras(titre)));
        expect(texteDe('rencontres')).toContain(net(navigation));
        expect(corps).toHaveLength(2);
        for (const g of corps) expect(texteDe('rencontres')).toContain(net(sansGras(g.join(' '))));

        const [titre6, ...corps6] = CE_QUI_SORT;
        expect(titreDe('ce-qui-sort')).toBe(titre6);
        expect(corps6).toHaveLength(4);
        for (const p of corps6) expect(texteDe('ce-qui-sort')).toContain(p);
    });

    it('le trou 2 : l\'introduction, Sommative, Spécifications, la réécriture Standards du 29 oct. et Dénotation, dans cet ordre ; le texte Standards du 28 oct. n\'y est pas', () => {
        expect(titreDe('construction-note')).toBe('Comment ta pratique construit la note');
        const attendus = [...INTRO_SOMMATIVE, ...SPECIFICATIONS, ...STANDARDS, ...DENOTATION];
        expect(attendus).toHaveLength(5);
        const rendus = [...entree('construction-note').querySelectorAll('.accordeon-contenu > p')].map((p) => net(p.textContent));
        expect(rendus).toEqual(attendus);
        expect(STANDARDS_DU_28[0]).toContain('à partir de deux types de production seulement');
        const aide = net(doc.getElementById('section-aide').textContent);
        expect(aide).not.toContain('à partir de deux types de production seulement');
        expect(aide).not.toContain(STANDARDS_DU_28[0]);
    });

    it('les entrées neuves sont à leur place : après `pratique`, entre `planifier-rai` et `tirage-sort`, après `export-import`', () => {
        const suivante = (id) => entree(id).nextElementSibling.id.replace('accordeon-aide-', '');
        expect(suivante('pratique')).toBe('construction-note');
        expect(suivante('planifier-rai')).toBe('rencontres');
        expect(suivante('rencontres')).toBe('tirage-sort');
        expect(suivante('export-import')).toBe('ce-qui-sort');
    });
});

describe('#1152 lot 4 · chaque libellé cité entre « » existe à l\'écran', () => {
    // Composés par le code : lus dans leurs morceaux.
    const codex = lire('js', 'codex.js');
    const COMPOSES = {
        'Mettre à jour, puis supprimer': () => codex.includes('\'Mettre à jour, puis \' + verbe') && codex.includes('.infinitif || \'supprimer\''),
        'Supprimer sans mettre à jour': () => codex.includes('Verbe + \' sans mettre à jour\'') && codex.includes('verbe.charAt(0).toUpperCase() + verbe.slice(1)'),
        'Créer mon service d\'orthopédagogie': () => lire('js', 'rencontres.js').includes('Créer mon ${mots.objetLong}</button>')
            && lire('js', 'mots-nature.js').includes('objetLong: \'service d’orthopédagogie\''),
        '…_PRIVE_…': () => lire('js', 'trimestres.js').includes('table_correspondance_${trimestre.id}_PRIVE_${dateStr}.json')
    };

    it('dans les sept textes du lot', () => {
        const textes = [...PRESENCES, ...SUPPRIMER, ...RENCONTRES.flat(), ...CE_QUI_SORT, ...INTRO_SOMMATIVE, ...SPECIFICATIONS, ...STANDARDS, ...DENOTATION];
        const libelles = [...new Set(textes.flatMap((t) => [...net(t).matchAll(/« ([^»]+?) »/g)].map((m) => m[1])))];
        expect(libelles.length).toBeGreaterThan(30);
        const absents = libelles.filter((l) => (COMPOSES[l] ? !COMPOSES[l]() : !aLEcran(l)));
        expect(absents).toEqual([]);
        // Chaque composé est bien cité : la liste ne garde pas de morceau mort.
        for (const l of Object.keys(COMPOSES)) expect(libelles, l).toContain(l);
    });
});
