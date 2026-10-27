import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

// SENTINELLE — #1152, lot 2b de la refonte de l'Aide (27 oct. 2026) : la Conception dit l'écran d'aujourd'hui, en
// moins de mots.
// Audit : plans de travail/audit-aide-2026-10-24/AUDIT-AIDE-2026-10-24.md ; remesure du 27 oct.
// (REMESURE-2026-10-27.md) ; consigne CONSIGNE-LOT-2026-10-27-aide-lot-2b-conception.md (§2, §4).
//
// Ce que le banc confronte, calculé des deux côtés :
//   · les entrées de la Conception ⟷ la décision (§2), dans l'ordre ; `idme`, absorbée par `solo`, absente ;
//   · le texte visible de la Conception ⟷ les mots de l'ancien écran ou du jargon ;
//   · chaque libellé cité entre « » dans les entrées des productions, des grilles, des échelles et des cartouches ⟷
//     l'écran, LU dans index.html (hors de l'Aide) et dans js/ — jamais recopié ici ;
//   · le tableau de l'« Échelle de départ (IDME) » ⟷ l'échelle que sème js/echelles.js ;
//   · la règle d'une copie déjà évaluée ⟷ la phrase de l'étape « Note calculée » (js/grilles.js), une seule règle.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (...p) => readFileSync(path.join(racine, ...p), 'utf8');
const html = lire('index.html');
const doc = new JSDOM(html).window.document;

const net = (s) => String(s).replace(/[’‘]/g, '\'').replace(/\s+/g, ' ').trim();
const aide = doc.getElementById('section-aide');
const conception = doc.getElementById('aide-conception');
const entree = (id) => doc.getElementById(`accordeon-aide-${id}`);
const texteDe = (id) => net(entree(id).textContent);

// Côté écran : la page sans la section Aide (texte rendu, entités décodées) et le code de js/ (apostrophes échappées
// ramenées), d'où l'on cherche chaque libellé.
const pageHorsAide = (() => {
    const d = new JSDOM(html).window.document;
    d.getElementById('section-aide').remove();
    return net(d.body.textContent);
})();
const fichiersJs = (d) => readdirSync(path.join(racine, d)).flatMap((n) => {
    const r = path.join(d, n);
    return statSync(path.join(racine, r)).isDirectory() ? fichiersJs(r) : (r.endsWith('.js') ? [r] : []);
});
const codeJs = net(fichiersJs('js').map((f) => lire(f)).join('\n').replace(/\\'/g, '\'').replace(/&nbsp;/g, ' ').replace(/\\u00a0/g, ' '));

const CONCEPTION = ['pratique', 'creer-productions', 'lecons', 'creer-grilles', 'apporter-grille', 'bareme',
    'sous-criteres', 'creer-echelles', 'solo', 'creer-cartouches'];

describe('#1152 lot 2b · la Conception', () => {
    it('la Conception a les entrées de la décision (§2), dans cet ordre ; `idme` n\'existe plus nulle part', () => {
        expect([...conception.querySelectorAll(':scope > .carte.accordeon')].map((c) => c.id.replace('accordeon-aide-', ''))).toEqual(CONCEPTION);
        expect(html).not.toContain('id="accordeon-aide-idme"');
        expect(net(entree('solo').querySelector('h3').textContent).replace(/^▼ /, '')).toBe('SOLO et l\'échelle de départ (IDME)');
    });

    it('aucune entrée de la Conception ne parle de l\'ancien écran ni en jargon', () => {
        const interdits = /sidebar|barre latérale|layout|dropdown|workflow|aperçu aléatoire/i;
        const fautives = CONCEPTION.map((id) => [id, texteDe(id)])
            .filter(([, t]) => interdits.test(t))
            .map(([id, t]) => `${id} : ${t.match(interdits)[0]}`);
        expect(fautives).toEqual([]);
    });

    it('chaque libellé cité entre « » (productions, grilles, échelles, cartouches) existe à l\'écran, hors de l\'Aide', () => {
        // Un renvoi à une autre entrée de l'Aide (« La bibliothèque ») n'est pas un libellé d'écran : les titres des
        // entrées sont lus dans la page, pas listés ici.
        const titresAide = new Set([...aide.querySelectorAll('.carte.accordeon h3')].map((h) => net(h.textContent).replace(/^▼ /, '')));
        const absents = [];
        let cites = 0;
        for (const id of ['creer-productions', 'creer-grilles', 'creer-echelles', 'creer-cartouches']) {
            for (const m of texteDe(id).matchAll(/« ([^»]+?) »/g)) {
                const libelle = m[1];
                if (titresAide.has(libelle)) continue;
                cites++;
                if (!pageHorsAide.includes(libelle) && !codeJs.includes(libelle)) absents.push(`${id} : ${libelle}`);
            }
        }
        expect(cites).toBeGreaterThan(20);
        expect(absents).toEqual([]);
    });
});

describe('#1152 lot 2b · ce que les entrées affirment, lu dans le code', () => {
    it('solo : le tableau de l\'« Échelle de départ (IDME) » est l\'échelle que sème js/echelles.js', () => {
        const echelles = lire('js', 'echelles.js');
        expect(echelles).toContain('nom: \'Échelle de départ (IDME)\'');
        const niveaux = [...echelles.matchAll(/code: '([IDME])',\s*nom: '([^']+)',[\s\S]*?niveauSOLO: '([a-z_]+)',\s*min: ([\d.]+),\s*max: ([\d.]+),\s*valeurCalcul: ([\d.]+)/g)]
            .map((m) => ({ code: m[1], nom: m[2], solo: m[3], min: Number(m[4]), max: Number(m[5]), valeur: Number(m[6]) }));
        expect(niveaux.map((n) => n.code)).toEqual(['I', 'D', 'M', 'E']);
        const fr = (n) => String(n).replace('.', ',');
        const SOLO = { unistructurel: 'Unistructurel', multistructurel: 'Multistructurel', relationnel: 'Relationnel', abstrait_etendu: 'Abstrait étendu' };
        const attendu = niveaux.map((n, i) => [
            `${n.code} – ${n.nom}`,
            SOLO[n.solo],
            i === 0 ? `moins de ${fr(niveaux[1].min)} %` : (n.max === 100 ? `${fr(n.min)} % et plus` : `${fr(n.min)} à ${fr(n.max)} %`),
            fr(n.valeur)
        ]);
        const tableaux = entree('solo').querySelectorAll('table');
        expect(tableaux).toHaveLength(2);
        const lu = [...tableaux[1].querySelectorAll('tbody tr')].map((tr) => [...tr.querySelectorAll('td')].map((td) => net(td.textContent)));
        expect(lu).toEqual(attendu);
    });

    it('sous-criteres : la règle d\'une copie déjà évaluée est la phrase de l\'étape « Note calculée », mot pour mot', () => {
        const ecran = lire('js', 'grilles.js').match(/<p class="calc-legende">(Une copie déjà évaluée garde sa note\.[^<]+)<\/p>/);
        expect(ecran).toBeTruthy();
        expect(net(entree('sous-criteres').querySelector('.alerte-attention').textContent)).toContain(net(ecran[1]));
    });

    it('sous-criteres : les gestes de l\'atelier cités existent dans son code', () => {
        const t = texteDe('sous-criteres');
        const gestes = ['Note calculée', 'Cas d\'interprétation', 'Retoucher ce calcul', 'Composer ton propre calcul',
            'Ce calcul sert', 'Quand une donnée de la copie vaut 0', 'Le calcul, en blocs', 'Fixer une limite',
            'Retirer la limite', '+ Ajouter une table de cas', 'Simulation de ce que l\'étudiant·e lirait'];
        for (const g of gestes) {
            expect(t, g).toContain(`« ${g} »`);
            expect(codeJs, g).toContain(g);
        }
    });

    it('creer-grilles : le sous-critère s\'y définit (D5 de l\'audit), et le total dit ses trois couleurs, comme le code', () => {
        const t = texteDe('creer-grilles');
        expect(t).toContain('« + Ajouter un sous-critère » en ajoute un : un élément observable du critère');
        const regle = lire('js', 'grilles.js').match(/La couleur du total : (orange sous 100 %, rouge au-dessus, vert à 100 %)/);
        expect(regle).toBeTruthy();
        expect(t).toContain(regle[1]);
    });

    it('apporter-grille : le retour à l\'étiquetage est décrit sans citer son bouton, posé à côté de « Coller une autre grille »', () => {
        const materiel = lire('js', 'materiel.js');
        expect(materiel).toContain('e(\'Coller une autre grille\')');
        expect(texteDe('apporter-grille')).toContain('un bouton à côté de « Coller une autre grille » te ramène à ton étiquetage');
        expect(texteDe('apporter-grille')).toContain('« Ajouter ces codes »');
        expect(lire('js', 'materiel-dissection.js')).toContain('bouton: \'Ajouter ces codes\'');
    });
});
