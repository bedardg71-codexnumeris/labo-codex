import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';
import { echelleDeDepart27Oct } from './_helpers/echelle-de-depart-27-oct.js';
import { ligneDeLaSuite, citations, texteDeLaSuite } from './_helpers/consigne-2026-11-22-parcours.js';

// La description de « I » (consigne de la suite, 3.1) : la citation qui suit « de la carte d'aide : ».
const DESCRIPTION_DE_I = citations(ligneDeLaSuite('3.1').split("de la carte d'aide : ")[1])[0];

// SENTINELLE — « 0 – Aucun » EN TÊTE DE L'ÉCHELLE DE DÉPART D'UN TRIMESTRE NEUF (22 nov. 2026).
// Consigne : plans de travail/CONSIGNE-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md, § 1 (décision de Grégoire,
// 22 nov., 12 h 27, piste a du rapport du matin, § B0.4).
//
//   1.1 À la source seulement (`niveauxDefaut`) : « 0 – Aucun », bâti comme le « 0 » de « IDME et niv 0 » de la démo ;
//       « I » commence à 0 %. Ne changent pas : les noms des quatre autres, leurs autres bornes, leurs valeurs, leurs
//       couleurs.
//   1.2 AUCUN CALCUL N'EST MODIFIÉ : les sept endroits qui écartent le code « 0 » et les deux qui lisent « PS » restent
//       tels quels ; une échelle déjà semée n'est pas réécrite.
//   1.4 Les cinq textes B1 à B5, validés par Grégoire le 22 nov., mot pour mot.
//   1.5 La bulle 4 du « Nous faisons » du parcours 3 nomme les niveaux que sème la source.
// Break-test (22 nov.) : au rapport du lot (plans de travail/RAPPORT-2026-11-22-echelle-de-depart-et-parcours-6-7-8.md).

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

function dbDepuisStore(store) {
    return {
        modifier: async (c, mutateur, defaut = null) => {
            const lue = c in store ? store[c] : defaut;
            const resultat = await mutateur(lue);
            if (resultat === undefined) return undefined;
            store[c] = resultat;
            return resultat;
        },
        get: async (c) => (c in store ? store[c] : null),
        getSync: (c, d) => (c in store ? store[c] : (d !== undefined ? d : null)),
        set: async (c, v) => { store[c] = v; }, setSync: (c, v) => { store[c] = v; }
    };
}

async function semer(store = {}) {
    const win = { cle: (k) => 'a2026_' + k, estRessourceSupprimee: () => false };
    await chargerScript('js/echelles.js', { db: dbDepuisStore(store), cle: win.cle }, win).assurerEchelleIdmeDeDepart();
    return store;
}

// Le « 0 » de l'échelle « IDME et niv 0 » de la démo, lu dans le pack (js/pack-demo-10.js).
function zeroDeLaDemo() {
    const pack = lire('js/pack-demo-10.js');
    const bloc = tranche(pack, '"nom": "IDME et niv 0"', '"code": "I"');
    return {
        code: bloc.match(/"code": "([^"]+)"/)[1], nom: bloc.match(/"nom": "Aucun"/) ? 'Aucun' : null,
        min: Number(bloc.match(/"min": ([\d.]+)/)[1]), max: Number(bloc.match(/"max": ([\d.]+)/)[1]),
        valeurCalcul: Number(bloc.match(/"valeurCalcul": ([\d.]+)/)[1]),
        description: /"description"/.test(tranche(bloc, '"code": "0"')), niveauSOLO: /"niveauSOLO"/.test(tranche(bloc, '"code": "0"'))
    };
}

describe('1.1 · la source : « 0 – Aucun » en tête, « I » dès 0 %, le reste inchangé', () => {
    it('un trimestre neuf reçoit « 0 – Aucun », bâti comme le « 0 » de « IDME et niv 0 » de la démo', async () => {
        const [echelle] = (await semer()).a2026_echellesTemplates;
        const zero = echelle.niveaux[0];
        const demo = zeroDeLaDemo();
        expect([zero.code, zero.nom, zero.min, zero.max, zero.valeurCalcul]).toEqual([demo.code, demo.nom, demo.min, demo.max, demo.valeurCalcul]);
        expect([demo.description, demo.niveauSOLO], 'le « 0 » de la démo n\'a ni description ni palier SOLO').toEqual([false, false]);
        expect(zero).not.toHaveProperty('description');
        expect(zero).not.toHaveProperty('niveauSOLO');
        expect(echelle.niveaux.some((n) => n.code === 'PS'), 'plus de « PS » semé').toBe(false);
    });

    it('les quatre autres : mêmes noms, mêmes valeurs, mêmes couleurs, mêmes bornes hautes ; « I » : sa borne basse à 0, sa description (3.1)', async () => {
        expect(DESCRIPTION_DE_I).toBe('Préstructurel, unistructurel');
        const [echelle] = (await semer()).a2026_echellesTemplates;
        const avant = echelleDeDepart27Oct().niveaux.slice(1);
        const apres = echelle.niveaux.slice(1);
        expect(apres.map((n) => n.code)).toEqual(['I', 'D', 'M', 'E']);
        for (let i = 0; i < 4; i++) {
            const attendu = { ...avant[i] };
            // « I » : sa borne basse à 0 (22 nov., 12 h 27) ; sa description, celle de la suite (3.1), lue dans la consigne.
            if (attendu.code === 'I') { attendu.min = 0; attendu.description = DESCRIPTION_DE_I; }
            expect(apres[i], attendu.code).toEqual(attendu);
        }
    });

    it('B1 : la description de l\'échelle, mot pour mot ; la suite inchangée', async () => {
        const [echelle] = (await semer()).a2026_echellesTemplates;
        expect(echelle.description).toBe('Cinq niveaux : Aucun, Incomplet, Développement, Maîtrise, Étendu. '
            + 'Les valeurs ponctuelles sont un point de départ : modifie-les, ou remplace '
            + 'l\'échelle entière. Rien ici n\'est une norme du projet.');
    });
});

describe('1.2 · aucun calcul modifié, aucune échelle déjà semée réécrite', () => {
    // Les neuf lignes, telles qu'elles sont à la base du lot (`a440e7ae`) : sept écartent le code « 0 », deux lisent « PS ».
    // ↻ 27 nov. 2026 (#1190, décision de Grégoire) : la phrase sous la bande P ne range plus par niveau, elle lit les deux
    // seuils de l'échelle ; ses deux lignes (le code « 0 » écarté, « PS » lu) partent avec elle. Restent six et une.
    const LIGNES = [
        ['js/evaluation-calcul.js', "    return niveauDuPourcentage(pctFinal, echelleSelectionnee.niveaux, { sansNiveauZero: true });"],
        ['js/evaluation-calcul.js', "    return niveauDuPourcentage(pct, niveaux, { sansNiveauZero: true });"],
        ['js/comptes-erreurs-stock.js', "        var niveau = window.niveauDuPourcentage(r.pctBorne, ctx.niveaux, { sansNiveauZero: true });"],
        ['js/echelles.js', "        .filter(n => n && n.code !== '0' && n.code !== 0)"],
        ['js/tableau-bord-apercu.js', "        .filter(n => n.code !== '0' && n.code !== 0 && window.niveauADesSeuils(n)) // Exclure niveau 0 (plagiat)"],
        ['js/contexte-qualification.js', "    return ((echelle && echelle.niveaux) || []).filter((n) => n && n.code !== '0' && n.code !== 0);"],
        ['js/trimestres.js', "                        const nbPS = evaluationsCritere.filter(n => n === 'PS').length;"]
    ];

    it('les six endroits qui écartent le code « 0 » et celui qui lit « PS » sont là, tels quels', () => {
        const absentes = LIGNES.filter(([f, ligne]) => !lire(f).split('\n').includes(ligne)).map(([f, l]) => f + ' : ' + l.trim());
        expect(absentes).toEqual([]);
    });

    it('une échelle de départ semée entre le 27 oct. et le 22 nov. (« PS » en tête) n\'est pas réécrite', async () => {
        const store = await semer({ a2026_echellesTemplates: [echelleDeDepart27Oct()] });
        expect(store.a2026_echellesTemplates).toEqual([echelleDeDepart27Oct()]);
    });
});

describe('1.4 · B2 à B5, mot pour mot', () => {
    it('B2 : la carte d\'aide, première rangée du tableau de l\'échelle de départ', () => {
        const html = lire('index.html');
        const tableau = tranche(html, 'L\'«&nbsp;Échelle de départ (IDME)&nbsp;», que l\'application installe, relie', '</table>');
        const premiere = tranche(tableau, '<tbody>', '</tr>');
        const cellules = [...premiere.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) => m[1].trim());
        expect(cellules[0]).toBe('<strong>0</strong> – Aucun');
        expect(cellules[1]).toBe('L\'évaluation n\'est pas possible (aucune donnée, plagiat, usage interdit de l\'IA).');
    });

    it('3.2 (la suite) : la phrase qui présente le tableau de la carte d\'aide, et la rangée « I » (3.1)', () => {
        const html = lire('index.html');
        const p = tranche(html, '<p class="mt-10">L\'«&nbsp;Échelle de départ (IDME)&nbsp;», que l\'application installe', '</p>');
        const texte = p.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
        expect(texte).toBe(texteDeLaSuite('3.2'));
        const tableau = tranche(html, 'que l\'application installe, relie', '</table>');
        expect(tableau).toContain('<td><strong>I</strong> – Incomplet</td>\n                                        <td><img src="icons/solo-uni-couleur.svg" alt="" class="aide-icone-solo">' + DESCRIPTION_DE_I + '</td>');
    });

    it('B3 : le guide SOLO', () => {
        expect(lire('js/guides-pedagogiques.js')).toContain('<strong>I</strong> ↔\\uFE0E Unistructurel, <strong>D</strong> ↔\\uFE0E Multistructurel, '
            + '<strong>M</strong> ↔\\uFE0E Relationnel, <strong>E</strong> ↔\\uFE0E Abstrait étendu. Le niveau 0, « Aucun », sert quand l\'évaluation n\'est pas possible.');
        expect(lire('js/guides-pedagogiques.js')).not.toContain('<strong>PS</strong>');
    });

    it('B4 : la définition du terme « Échelle de performance »', () => {
        const t = lire('js/accompagnement-contenu-terme.js');
        expect(t).toContain('a cinq niveaux : « 0 – Aucun » en tête, puis Incomplet, Développement, Maîtrise, Étendu.');
        expect(t).not.toContain('« PS – Préstructurel » en tête');
    });

    it('B5 : la « Cartouche de départ » : colonne « 0 », quatre fois « L\'évaluation n\'est pas possible. »', async () => {
        const store = { a2026_grillesTemplates: [{ id: 'GRILLE_GENERIQUE', nom: 'Grille de départ', criteres: [] }] };
        const win = { cle: (k) => 'a2026_' + k, estRessourceSupprimee: () => false };
        await chargerScript('js/cartouches.js', { db: dbDepuisStore(store), cle: win.cle }, win).assurerCartoucheDeDepart();
        const [cartouche] = store.a2026_cartouches_GRILLE_GENERIQUE;
        expect(cartouche.niveaux[0]).toEqual({ code: '0', nom: 'Aucun' });
        const colonne = Object.entries(cartouche.commentaires).filter(([k]) => k.endsWith('_0'));
        expect(colonne).toHaveLength(4);
        for (const [k, v] of colonne) expect(v, k).toBe('L\'évaluation n\'est pas possible.');
    });
});

describe('1.5 · la bulle 4 du « Nous faisons » du parcours 3 dit ce que sème la source', () => {
    it('« à cinq niveaux : Aucun, Incomplet, Développement, Maîtrise, Étendu » : les noms de l\'échelle semée, dans l\'ordre', async () => {
        const [echelle] = (await semer()).a2026_echellesTemplates;
        const phrase = lire('js/parcours-evaluer.js').match(/l'« Échelle de départ \(IDME\) », à cinq niveaux : ([^.]+)\./);
        expect(phrase, 'la phrase de la bulle 4').not.toBeNull();
        expect(phrase[1].split(', ')).toEqual(echelle.niveaux.map((n) => n.nom));
    });
});
