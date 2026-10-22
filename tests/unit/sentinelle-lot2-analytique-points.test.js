/**
 * LOT 2 · L'ANALYTIQUE SE SAISIT EN POINTS (consigne du 3 septembre 2026, lots des trois
 * types de grille ; cartographie de Cowork du 4 septembre au soir).
 *
 * Arrêté par Grégoire : l'analytique, c'est des critères, des points, un total, un seuil ;
 * le maximum de points EST le poids du critère ; la chaîne est points → pourcentage →
 * (niveau, lot 3). L'analytique n'est pas un nouveau moteur : c'est une troisième façon
 * d'arriver au même pourcentage, et la boucle de `calculerNote` ne change pas.
 *
 *   A — LE « FINI QUAND » : 24 sur un critère qui pèse 30 → 80 % ; un second critère
 *       holistique se choisit toujours au menu, et le total tient compte des deux ;
 *   B — la portée (#674) : sans points, le critère est hors note et la note se retient ;
 *       zéro point COMPTE (ce n'est pas une absence) ; les décimales passent ;
 *   C — les deux lecteurs disent la même chose : `porteeDepuisEvaluation` relit une
 *       évaluation enregistrée avec des points et rend le pourcentage de l'écran (le
 *       témoin exigé par Cowork : jamais « -- » en base sur une copie notée 80 % à l'écran) ;
 *   D — rien ne bouge pour les autres : un critère holistique ou algorithmique se calcule
 *       exactement comme avant, et des points posés sur un critère NON analytique sont
 *       ignorés ; sans points, un critère analytique se lit comme avant (son niveau) ;
 *   E — les témoins de source : les points vivent sous leur nom, partout où
 *       `donneesAlgorithmiques` voyage, et la palette rend le champ dans ses deux renderers.
 *
 * ⚠ Ce banc charge `js/evaluation-calcul.js` et appelle `calculerNote()` telle quelle,
 * sur le patron de la sentinelle #674 « la note dit sur quoi elle porte ».
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const source = (rel) => readFileSync(path.join(racine, rel), 'utf8');

function classList() {
    const s = new Set();
    return {
        add(c) { s.add(c); }, remove(c) { s.delete(c); },
        contains(c) { return s.has(c); },
        toggle(c, force) { if (force === undefined) force = !s.has(c); if (force) s.add(c); else s.delete(c); return force; }
    };
}

function elementDom(init) {
    return Object.assign({
        value: '', textContent: '', style: {}, classList: classList(),
        closest() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; },
        appendChild() {}, replaceChildren() {}, setAttribute() {}, addEventListener() {}
    }, init || {});
}

// Miroir de la règle unique de `js/echelles.js` (#525/#527).
function valeurNumeriqueDuNiveau(niveau) {
    if (!niveau) return null;
    const p = Number(niveau.valeurCalcul);
    if (niveau.valeurCalcul != null && niveau.valeurCalcul !== '' && !isNaN(p)) return p;
    return null;
}

// Le cas littéral de la consigne : un critère qui pèse 30, seul dans sa grille.
const GRILLE_ANALYTIQUE_SEULE = {
    id: 'GA', nom: 'Rédaction /30',
    criteres: [{ id: 'k', nom: 'Rédaction', ponderation: 30, type: 'analytique' }]
};

// La grille du « fini quand » : un holistique au menu, un analytique en points.
const GRILLE_MIXTE = {
    id: 'GM', nom: 'Contenu 70 · Langue 30',
    criteres: [
        { id: 'c1', nom: 'Contenu', ponderation: 70, type: 'holistique' },
        { id: 'c2', nom: 'Langue', ponderation: 30, type: 'analytique' }
    ]
};

// Échelle à valeurs ponctuelles ; M vaut 80 pour que « 24 sur 30 » et « M » se rejoignent.
const ECHELLE = {
    id: 'E', nom: 'IDME témoin',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 54, valeurCalcul: 40 },
        { code: 'D', nom: 'En développement', min: 55, max: 74, valeurCalcul: 65 },
        { code: 'M', nom: 'Maîtrisé', min: 75, max: 89, valeurCalcul: 80 },
        { code: 'E', nom: 'Étendu', min: 90, max: 100, valeurCalcul: 95 }
    ]
};

/** Le bac à sable : la grille, l'échelle, les niveaux choisis, les points saisis, l'écran capturé. */
function monter({ grille = GRILLE_MIXTE, echelle = ECHELLE, niveaux = {}, points = {}, algo = {} }) {
    const ecran = {
        noteProduction1: elementDom(),
        niveauProduction1: elementDom(),
        criteresCopier: elementDom(),
        porteeNote1: elementDom({ classList: (() => { const c = classList(); c.add('u-hide'); return c; })() }),
        selectEchelle1: elementDom({ value: echelle.id })
    };
    const document = {
        getElementById: (id) => ecran[id] || null,
        querySelector: () => null, querySelectorAll: () => [],
        createElement: () => elementDom(), addEventListener() {}, removeEventListener() {},
        body: elementDom(), documentElement: elementDom()
    };
    const ec = {
        grilleId: grille.id, echelleId: echelle.id,
        criteres: Object.assign({}, niveaux),
        donneesAlgorithmiques: JSON.parse(JSON.stringify(algo)),
        pointsAnalytiques: Object.assign({}, points)
    };
    const base = {
        test_grillesTemplates: [grille],
        test_echellesTemplates: [echelle],
        test_pratiquesConfigurables: []
    };
    const win = { addEventListener() {}, removeEventListener() {} };
    chargerScript('js/evaluation-calcul.js', {
        document,
        evaluationEnCours: ec,
        db: { getSync: (k, d) => (k in base ? JSON.parse(JSON.stringify(base[k])) : d) },
        cle: (k) => 'test_' + k,
        valeurNumeriqueDuNiveau
    }, win);
    return { win, ecran, ec };
}

/* ---------------------------------------------------------------- A — le fini quand */

describe('lot 2 · A — le « fini quand » : 24 sur 30, et l\'on lit 80 %', () => {
    it('A.a le cas littéral : un critère qui pèse 30, 24 points → 80,0 % et le niveau que 80 % trouve', () => {
        const { win, ecran } = monter({ grille: GRILLE_ANALYTIQUE_SEULE, points: { k: 24 } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('80\u00A0%');
        expect(ecran.niveauProduction1.textContent).toBe('M');
        expect(win.noteCalculeeCourante).toBe(80);
        expect(win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 30, ponderationGrille: 30, incomplete: false, criteresHorsNote: [] });
        // La ligne à copier-coller montre les points, en attendant un niveau (lot 3).
        expect(ecran.criteresCopier.textContent).toBe('24');
    });

    it('A.b un second critère holistique se choisit au menu, et le total tient compte des deux', () => {
        const { win, ecran, ec } = monter({ niveaux: { c1: 'M' }, points: { c2: 24 } });
        win.calculerNote();
        // 0,8 × 70 + 0,8 × 30 = 80
        expect(ecran.noteProduction1.textContent).toBe('80\u00A0%');
        expect(ecran.niveauProduction1.textContent).toBe('M');
        expect(ecran.criteresCopier.textContent).toBe('M\t24');
        // Le témoin bouge avec la donnée : E (95) sur Contenu → 66,5 + 24 = 90,5.
        ec.criteres.c1 = 'E';
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('90,5\u00A0%');
        expect(ecran.niveauProduction1.textContent).toBe('E');
        // …et avec les points : 15 sur 30 → 66,5 + 15 = 81,5.
        ec.pointsAnalytiques.c2 = 15;
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('81,5\u00A0%');
    });
});

/* ----------------------------------------------------------- B — la portée des points */

describe('lot 2 · B — la portée (#674) sait lire les points', () => {
    it('B.a sans points, le critère analytique est HORS NOTE : la note se retient et le nomme, avec son poids', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M' } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('--');
        expect(ecran.niveauProduction1.textContent).toBe('--');
        expect(ecran.porteeNote1.classList.contains('u-hide')).toBe(false);
        expect(ecran.porteeNote1.textContent).toContain('Langue');
        expect(ecran.porteeNote1.textContent).toContain('30\u00A0%');
        expect(win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 70, ponderationGrille: 100, incomplete: true });
        expect(win.porteeCalculeeCourante.criteresHorsNote).toEqual([
            { critereId: 'c2', nom: 'Langue', ponderation: 30, motif: 'sans-niveau', niveau: '' }
        ]);
    });

    it('B.b ZÉRO point compte — ce n\'est pas une absence', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M' }, points: { c2: 0 } });
        win.calculerNote();
        // 0,8 × 70 + 0 = 56
        expect(ecran.noteProduction1.textContent).toBe('56\u00A0%');
        expect(win.porteeCalculeeCourante).toMatchObject({ ponderationCouverte: 100, incomplete: false, criteresHorsNote: [] });
        expect(ecran.criteresCopier.textContent).toBe('M\t0');
    });

    it('B.c les décimales passent : 24,5 sur 30', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M' }, points: { c2: 24.5 } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('80,5\u00A0%');
        expect(ecran.criteresCopier.textContent).toBe('M\t24.5');
    });

    it('B.d des points qui ne sont pas un nombre sont une absence, pas un zéro', () => {
        const { win, ecran } = monter({ niveaux: { c1: 'M' }, points: { c2: '24' } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('--');
        expect(win.porteeCalculeeCourante.criteresHorsNote.map(c => c.critereId)).toEqual(['c2']);
    });

    it('B.e un critère analytique de pondération nulle ne rend rien et ne bloque rien', () => {
        const grille = { id: 'G0', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 100, type: 'holistique' },
            { id: 'c0', nom: 'Bonus', ponderation: 0, type: 'analytique' }
        ] };
        const { win, ecran } = monter({ grille, niveaux: { c1: 'M' }, points: { c0: 3 } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('80\u00A0%');
        expect(win.porteeCalculeeCourante.incomplete).toBe(false);
    });
});

/* ------------------------------------------------ C — les deux lecteurs disent la même chose */

describe('lot 2 · C — la base relit ce que l\'écran a noté (le témoin exigé)', () => {
    function chargerCalculSeul() {
        const win = { addEventListener() {}, removeEventListener() {} };
        chargerScript('js/evaluation-calcul.js', { valeurNumeriqueDuNiveau }, win);
        return win;
    }

    it('C.a une évaluation enregistrée avec des points rend, en base, le pourcentage de l\'écran', () => {
        const ecran = monter({ niveaux: { c1: 'M' }, points: { c2: 24 } });
        ecran.win.calculerNote();
        expect(ecran.win.noteCalculeeCourante).toBe(80);

        // Ce que l'enregistrement écrit : les critères à niveau dans `criteres[]`, les points
        // sous leur nom — un critère analytique n'a pas de niveau avant le lot 3.
        const evaluation = {
            criteres: [{ critereId: 'c1', critereNom: 'Contenu', niveauSelectionne: 'M', ponderation: 70 }],
            donneesAlgorithmiques: {},
            pointsAnalytiques: { c2: 24 }
        };
        const win = chargerCalculSeul();
        const portee = win.porteeDepuisEvaluation(evaluation, GRILLE_MIXTE, ECHELLE.niveaux);
        expect(portee).toMatchObject({ ponderationCouverte: 100, ponderationGrille: 100, incomplete: false, criteresHorsNote: [] });
        const langue = portee.criteresComptes.find(c => c.critere.id === 'c2');
        expect(langue.valeur).toBe(80);
        expect(langue.niveau).toBe('24');
        // La même moyenne pondérée que l'écran.
        const note = portee.criteresComptes.reduce((s, c) => s + c.valeur * c.critere.ponderation, 0)
            / portee.criteresComptes.reduce((s, c) => s + c.critere.ponderation, 0);
        expect(note).toBe(ecran.win.noteCalculeeCourante);
    });

    it('C.b sans points en base, le critère analytique est hors note en base aussi — pas de « -- » d\'un côté et 80 % de l\'autre', () => {
        const win = chargerCalculSeul();
        // ↻ #705 — un brouillon qui déclare sa portée : c'est là que l'absence veut dire « pas encore de points »
        // (sans déclaration ni date, un critère absent est désormais présumé ajouté depuis).
        const evaluation = { criteres: [{ critereId: 'c1', niveauSelectionne: 'M', ponderation: 70 }], pointsAnalytiques: {}, ponderationCouverte: 70, verrouillee: false };
        const portee = win.porteeDepuisEvaluation(evaluation, GRILLE_MIXTE, ECHELLE.niveaux);
        expect(portee.incomplete).toBe(true);
        expect(portee.criteresHorsNote.map(c => c.critereId)).toEqual(['c2']);
    });

    it('C.c la déclaration `ponderationCouverte` fait toujours foi pour le nombre, comme avant', () => {
        const win = chargerCalculSeul();
        const evaluation = { criteres: [{ critereId: 'c1', niveauSelectionne: 'M', ponderation: 70 }], pointsAnalytiques: { c2: 24 }, ponderationCouverte: 100 };
        expect(win.porteeDepuisEvaluation(evaluation, GRILLE_MIXTE, ECHELLE.niveaux).ponderationCouverte).toBe(100);
    });
});

/* ----------------------------------------------------- D — rien ne bouge pour les autres */

describe('lot 2 · D — un critère holistique ou algorithmique se calcule exactement comme avant', () => {
    it('D.a des points posés sur un critère NON analytique sont ignorés : le niveau seul compte', () => {
        const grille = { id: 'GH', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 70, type: 'holistique' },
            { id: 'c2', nom: 'Langue', ponderation: 30 }   // sans type : holistique par défaut
        ] };
        const { win, ecran } = monter({ grille, niveaux: { c1: 'M', c2: 'E' }, points: { c1: 0, c2: 0 } });
        win.calculerNote();
        // 0,8 × 70 + 0,95 × 30 = 56 + 28,5 = 84,5 — et pas 0.
        expect(ecran.noteProduction1.textContent).toBe('84,5\u00A0%');
        expect(ecran.criteresCopier.textContent).toBe('M\tE');
    });

    it('D.b sans points, un critère analytique se lit comme avant : le niveau qu\'il porterait encore', () => {
        // Une évaluation faite quand Langue était holistique, relue après le passage en analytique.
        const { win, ecran } = monter({ niveaux: { c1: 'M', c2: 'E' } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('84,5\u00A0%');
        expect(win.porteeCalculeeCourante.incomplete).toBe(false);
        // Dès que des points existent, ils l'emportent.
        const apres = monter({ niveaux: { c1: 'M', c2: 'E' }, points: { c2: 24 } });
        apres.win.calculerNote();
        expect(apres.ecran.noteProduction1.textContent).toBe('80\u00A0%');
    });

    it('D.c la grille 50/30/20 de la sentinelle #674, sans aucun critère analytique : 84,0 % (M), identique', () => {
        const grille = { id: 'G1', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 50 },
            { id: 'c2', nom: 'Organisation', ponderation: 30 },
            { id: 'c3', nom: 'Langue', ponderation: 20 }
        ] };
        const echelle = { id: 'E1', niveaux: [
            { code: 'I', nom: 'I', min: 0, max: 54, valeurCalcul: 40 },
            { code: 'D', nom: 'D', min: 55, max: 74, valeurCalcul: 65 },
            { code: 'M', nom: 'M', min: 75, max: 89, valeurCalcul: 82 },
            { code: 'E', nom: 'E', min: 90, max: 100, valeurCalcul: 95 }
        ] };
        const { win, ecran } = monter({ grille, echelle, niveaux: { c1: 'E', c2: 'E', c3: 'I' } });
        win.calculerNote();
        expect(ecran.noteProduction1.textContent).toBe('84\u00A0%');
        expect(ecran.niveauProduction1.textContent).toBe('M');
    });

    it('D.d un critère algorithmique compte toujours par son pourcentage exact', () => {
        const grille = { id: 'GALGO', criteres: [
            { id: 'c1', nom: 'Contenu', ponderation: 70, type: 'holistique' },
            { id: 'fr', nom: 'Français', ponderation: 30, type: 'algorithmique' }
        ] };
        const { win, ecran } = monter({ grille, niveaux: { c1: 'M', fr: 'D' }, algo: { fr: { pourcentage: 61.5, niveau: 'D' } } });
        win.calculerNote();
        // 0,8 × 70 + 0,615 × 30 = 56 + 18,45 = 74,45 → 74.5 (arrondi de l'affichage)
        expect(ecran.noteProduction1.textContent).toBe('74,5\u00A0%');
        expect(win.noteCalculeeCourante).toBeCloseTo(74.45, 5);
    });
});

/* ------------------------------------------------------------ E — les témoins de source */

function tousLesJs(dossier) {
    const sortie = [];
    for (const nom of readdirSync(dossier)) {
        const chemin = path.join(dossier, nom);
        if (statSync(chemin).isDirectory()) sortie.push(...tousLesJs(chemin));
        else if (nom.endsWith('.js')) sortie.push(chemin);
    }
    return sortie;
}

describe('lot 2 · E — les points vivent sous leur nom, partout où `donneesAlgorithmiques` voyage', () => {
    it('E.a chaque objet d\'évaluation qui emporte `donneesAlgorithmiques` emporte `pointsAnalytiques` à côté (périmètre déduit de js/)', () => {
        const ECRIT_ALGO = /\bdonneesAlgorithmiques:\s*(evaluationEnCours|ec)\.donneesAlgorithmiques \|\| \{\}/;
        const trouves = []; const orphelins = [];
        for (const f of tousLesJs(path.join(racine, 'js'))) {
            if (f.includes('pack-demo')) continue;
            const lignes = readFileSync(f, 'utf8').split('\n');
            lignes.forEach((l, i) => {
                if (!ECRIT_ALGO.test(l)) return;
                trouves.push(path.relative(racine, f) + ':' + (i + 1));
                const voisines = lignes.slice(Math.max(0, i - 3), i + 4).join('\n');
                if (!/pointsAnalytiques/.test(voisines)) orphelins.push(path.relative(racine, f) + ':' + (i + 1));
            });
        }
        // Témoin : le détecteur voit au moins les trois objets connus (sauvegarde, auto-save, modification).
        expect(trouves.length, 'trouvés : ' + trouves.join(', ')).toBeGreaterThanOrEqual(3);
        expect(orphelins, '`donneesAlgorithmiques` emporté SANS `pointsAnalytiques` à : ' + orphelins.join(', ')).toEqual([]);
    });

    it('E.b les points ne sont JAMAIS logés dans `donneesAlgorithmiques` — un mensonge de nomenclature', () => {
        const calcul = source('js/evaluation-calcul.js');
        const chargement = source('js/evaluation-chargement.js');
        expect(calcul).not.toMatch(/donneesAlgorithmiques\[[^\]]+\]\s*=\s*\{[^}]*points/);
        expect(chargement).not.toMatch(/donneesAlgorithmiques\[[^\]]+\]\s*=\s*\{[^}]*points/);
        expect(chargement).toMatch(/evaluationEnCours\.pointsAnalytiques\[critereId\] = pts/);
    });

    it('E.c la palette rend le champ de points dans ses DEUX renderers, et le handler est exposé', () => {
        const chargement = source('js/evaluation-chargement.js');
        expect((chargement.match(/id="eval_pts_\$\{critere\.id\}"/g) || []).length).toBe(2);
        expect((chargement.match(/data-on-input="pointsSaisis"/g) || []).length).toBe(2);
        // La branche est bien conditionnée par le TYPE dans les deux renderers (mutation « false ? » attrapée).
        expect((chargement.match(/: estAnalytique \? `/g) || []).length).toBe(2);
        expect(chargement).toMatch(/^window\.pointsSaisis = pointsSaisis;/m);
        // Le champ va de 0 au poids : le maximum EST le poids.
        expect((chargement.match(/min="0" max="\$\{ponderation\}"/g) || []).length).toBe(2);
    });

    it('E.e le champ de points VIDE ne ressemble pas à un zéro : « – » en placeholder, jamais « 0 » (retouche du 4 sept., vécu par Grégoire — un vrai zéro se tape)', () => {
        const chargement = source('js/evaluation-chargement.js');
        // Les deux gabarits du champ de points (les deux renderers) : `max="${ponderation}"` les identifie.
        const champs = chargement.match(/max="\$\{ponderation\}" step="any" placeholder="[^"]*"/g) || [];
        expect(champs.length).toBe(2);
        champs.forEach((champ) => {
            expect(champ, 'le vide se lit comme un vide').toContain('placeholder="–"');
            expect(champ, '« 0 » redevient une valeur qu\'on tape').not.toContain('placeholder="0"');
        });
    });

    it('E.d la boucle de `calculerNote` n\'a pas bougé : elle somme `valeur × pondération / 100` et divise par la pondération totale', () => {
        const calcul = source('js/evaluation-calcul.js');
        expect(calcul).toContain("portee.criteresComptes.forEach(({ critere, niveau, valeur }) => {\n        const ponderation = (critere.ponderation || 0) / 100;\n        noteTotal += valeur * ponderation;\n        ponderationTotal += ponderation;");
        expect(calcul).toContain('pourcentage = noteTotal / ponderationTotal;');
    });
});
