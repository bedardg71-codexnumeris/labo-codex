import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

// SENTINELLE #821 lot A (10 sept. 2026) — LES QUATRE RÈGLES QUI QUALIFIENT UN
// CONTEXTE VIVENT EN UN SEUL ENDROIT, ET AUCUNE N'A CHANGÉ.
//
// L'arbitrage de Grégoire : « L'application nomme un contexte et on ne sait pas
// comment elle fait pour le qualifier ainsi. […] Il faut unifier les
// définitions. » Le lot A n'unifie PAS les définitions — c'est de la pédagogie,
// et ça attend l'orthopédagogue. Il unifie l'ENDROIT où elles sont écrites :
// `js/contexte-qualification.js`. Le livrable est invisible à l'écran.
//
// Ce banc verrouille donc deux choses à la fois, et elles se tiennent :
//   1. CHAQUE mécanisme rend, sur chaque borne et chaque borne ± 1 point,
//      EXACTEMENT ce qu'il rendait AVANT le déplacement (valeurs relevées sur
//      `5c29d3fd` par un harnais AVANT/APRÈS : 1630 cas, 0 différence).
//   2. La divergence documentée SURVIT : à A = 80 %, C = 80 %, le mécanisme 3
//      range au palier « favorable » et le mécanisme 4 à la branche
//      « acceptable ». Un banc où cet écart disparaît prouve qu'on a changé
//      les bornes, pas l'endroit.
//
// #821, 15 oct. 2026 — LES MOTS ONT CHANGÉ, LES BORNES NON (décision de
// Grégoire, mots adoptés à 11 h 38) : un seul vocabulaire, celui du
// mécanisme 2 (« Aucune absence ou presque » … « Travaux manquants très
// fréquents ») ; les mécanismes 3 et 4 se disent par la phrase des deux
// observations ; le mécanisme 1 n'a aucun mot. Les paliers et les branches se
// lisent donc par leur CODE (`niveau` du 3, `code` du 4), et les deux cartes
// écrivent la même phrase au même élève.
//
// ⚠ Les quatre mécanismes ne sont PAS quatre copies d'une règle : deux
// qualifient par conjonction sur A et C (3, 4), un applique un seuil à un
// scalaire (2), et celui du tableau de bord ne classe rien (1, dégradé continu).
//
// Break-tests (faits rougir AVANT de faire confiance à ce banc) : voir le
// journal en fin de fichier.

function monterConfig(etatInitial) {
    const store = etatInitial === undefined ? {} : { seuilsInterpretation: JSON.parse(JSON.stringify(etatInitial)) };
    const db = {
        getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
        setSync: (k, v) => { store[k] = v; },
        get: async () => null, set: async () => {}
    };
    const win = chargerScript('js/interpretation-config.js', { db });
    return { win, store, db };
}

/** interpretation-config RÉEL + le module, dans le même sandbox. */
function monter(etatInitial) {
    const { win, store } = monterConfig(etatInitial);
    chargerScript('js/contexte-qualification.js', { obtenirSeuil: win.obtenirSeuil }, win);
    return { win, store };
}

function lireCodeSansCommentaires(chemin) {
    return lire(chemin)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .split('\n')
        .filter((l) => !/^\s*\/\//.test(l))
        .join('\n');
}

describe('#821 lot A · mécanisme 3 — le contexte d\'apprentissage (A ET C, bornes 85 / 75 / 65)', () => {
    const { win } = monter();
    const q = (A, C) => win.qualifierContexteApprentissage(A, C);

    it('chaque borne et chaque borne ± 1 point rend ce qu\'elle rendait avant le déplacement', () => {
        const attendu = [
            // [A, C, palier] — relevés sur 5c29d3fd (le palier se lit par son code depuis le 15 oct. 2026)
            [0.86, 0.86, 'tres-favorable'], [0.85, 0.85, 'tres-favorable'], [0.84, 0.85, 'favorable'], [0.85, 0.84, 'favorable'],
            [0.76, 0.76, 'favorable'], [0.75, 0.75, 'favorable'], [0.74, 0.75, 'modere'], [0.75, 0.74, 'modere'],
            [0.66, 0.66, 'modere'], [0.65, 0.65, 'modere'], [0.64, 0.65, 'fragile'], [0.65, 0.64, 'fragile'],
            [0, 0, 'fragile'], [1, 1, 'tres-favorable'], [1, 0, 'fragile']
        ];
        for (const [A, C, palier] of attendu) {
            expect(q(A, C).niveau, `A=${A}, C=${C}`).toBe(palier);
        }
    });

    it('la dernière branche est un OU : A = 65 %, C = 64 % est au palier « fragile », pas « insuffisant »', () => {
        expect(q(0.65, 0.64)).toMatchObject({ niveau: 'fragile', badgeClasse: 'badge-engagement-fragile' });
        expect(q(0.64, 0.65).niveau).toBe('fragile');
    });

    it('les sorties gardent leur forme : niveau, label, badgeClasse, A et C en « 80% »', () => {
        expect(q(0.8, 0.8)).toMatchObject({
            niveau: 'favorable', label: 'Absences rares, travaux manquants rares', badgeClasse: 'badge-engagement-favorable', A: '80%', C: '80%'
        });
    });

    it('#821 (15 oct. 2026) : le palier n\'a plus de mot à lui — son label est la phrase des deux observations', () => {
        expect(q(0.9, 0.9).label).toBe('Aucune absence ou presque, aucun travail manquant ou presque');
        expect(q(0.82, 0.72).label).toBe('Absences rares, quelques travaux manquants');
        expect(q(0.62, 0.5).label).toBe('Absences fréquentes, travaux manquants très fréquents');
        for (const [A, C] of [[1, 1], [0.8, 0.8], [0.7, 0.7], [0.3, 0.9]]) {
            expect(q(A, C).label).toBe(win.decrireContexte(A, C));
            expect(q(A, C), 'la description qui jugeait est revenue').not.toHaveProperty('description');
        }
        const code = lireCodeSansCommentaires('js/contexte-qualification.js');
        for (const mot of ['Très favorable', 'Favorable', 'Modéré', 'Fragile', 'Contexte fragile', 'engagement soutenu', 'situation d\'urgence', 'intervention nécessaire']) {
            expect(code, `« ${mot} » est revenu dans le module`).not.toContain(`'${mot}`);
        }
    });

    it('les proportions sont lues telles quelles : 0,57 n\'est pas glissé sous 0,57 par un ×100 / ÷100', () => {
        const { win: w } = monter({ interpretation: { excellent: 0.85, bon: 0.80, acceptable: 0.57 } });
        expect(w.decrireContexte(0.57, 0.57)).toBe('Quelques absences, quelques travaux manquants');
    });

    it('les bornes sont déclarées et nommées à la source, avec les valeurs d\'avant', () => {
        expect(win.BORNES_CONTEXTE).toEqual({ tresFavorable: 0.85, favorable: 0.75, modere: 0.65 });
    });
});

describe('#821 lot A · mécanisme 4 — l\'interprétation A-C de la mobilisation (bornes 70 / 80 / 90)', () => {
    const { win } = monter();
    const m = (A, C, d) => win.interpreterMobilisation(A, C, d);

    it('chaque borne et chaque borne ± 1 point rend ce qu\'elle rendait avant le déplacement', () => {
        // La branche se lit par son code depuis le 15 oct. 2026 ; les bornes sont celles d'avant.
        const attendu = [
            [0.69, 0.69, 'critiques'], [0.7, 0.69, 'completion-critique'], [0.69, 0.7, 'assiduite-critique'],
            [0.7, 0.7, 'fragile'], [0.71, 0.71, 'fragile'],
            [0.79, 0.79, 'fragile'], [0.79, 0.8, 'assiduite-fragile'], [0.8, 0.79, 'completion-fragile'],
            [0.8, 0.8, 'acceptable'], [0.81, 0.81, 'acceptable'], [0.89, 0.89, 'acceptable'],
            [0.89, 0.9, 'acceptable'], [0.9, 0.89, 'acceptable'], [0.9, 0.9, 'favorable'], [0.91, 0.91, 'favorable'], [1, 1, 'favorable']
        ];
        for (const [A, C, code] of attendu) {
            expect(m(A, C).code, `A=${A}, C=${C}`).toBe(code);
            expect(m(A, C).niveau, `A=${A}, C=${C} : la phrase des deux observations`).toBe(win.decrireContexte(A, C));
        }
        // « Décrochage », statut posé par l'enseignant·e, reste un mot.
        expect(m(1, 1, true)).toEqual({ code: 'decrochage', niveau: 'Décrochage', couleur: '#9e9e9e' });
    });

    it('les couleurs n\'ont pas bougé', () => {
        expect(m(0.5, 0.5).couleur).toBe('#dc3545');
        expect(m(0.5, 0.9).couleur).toBe('#ff9800');
        expect(m(0.75, 0.75).couleur).toBe('#ffc107');
        expect(m(0.8, 0.8).couleur).toBe('#28a745');
        expect(m(0.9, 0.9).couleur).toBe('#2196F3');
    });

    it('les bornes sont déclarées et nommées à la source, avec les valeurs d\'avant', () => {
        expect(win.BORNES_MOBILISATION).toEqual({ critique: 0.7, fragile: 0.8, favorable: 0.9 });
    });
});

describe('#821 lot A · LA DIVERGENCE DOCUMENTÉE SURVIT AU DÉPLACEMENT', () => {
    it('A = 80 %, C = 80 % : palier « favorable » par le mécanisme 3, branche « acceptable » par le mécanisme 4', () => {
        const { win } = monter();
        const contexte = win.qualifierContexteApprentissage(0.8, 0.8);
        const mobilisation = win.interpreterMobilisation(0.8, 0.8);
        expect(contexte.niveau).toBe('favorable');
        expect(mobilisation.code).toBe('acceptable');
        // ⚠ Si cette ligne rougit, quelqu'un a UNIFIÉ les BORNES — c'est une
        // décision de pédagogie, qui remonte à Grégoire, pas une refactorisation.
        expect(contexte.badgeClasse, 'la divergence des bornes a disparu : le comportement a changé').toBe('badge-engagement-favorable');
        expect(mobilisation.couleur).toBe('#28a745');
        // #821 (15 oct. 2026) : les deux cartes disent désormais la MÊME phrase — c'est le but du vocabulaire unique.
        expect(contexte.label).toBe(mobilisation.niveau);
    });

    it('et sous 65 % : le mécanisme 3 range au palier « fragile », le mécanisme 4 à « assiduité critique », la phrase est une', () => {
        const { win } = monter();
        expect(win.qualifierContexteApprentissage(0.64, 0.9).niveau).toBe('fragile');
        expect(win.interpreterMobilisation(0.64, 0.9).code).toBe('assiduite-critique');
        expect(win.interpreterMobilisation(0.75, 0.75).code).toBe('fragile');
        expect(win.qualifierContexteApprentissage(0.75, 0.75).niveau).toBe('favorable');
        expect(win.qualifierContexteApprentissage(0.64, 0.9).label).toBe(win.interpreterMobilisation(0.64, 0.9).niveau);
    });
});

describe('#821 lot A · mécanisme 2 — un seuil sur un scalaire, réglable, lu par obtenirSeuil', () => {

    it('avec les défauts (70 / 80 / 85) : chaque borne et chaque borne ± 1 point, en A, en C et en couleur', () => {
        const { win } = monter();
        const attendu = [
            // [valeur, niveau A, niveau C, couleur]
            [59, 'Absences très fréquentes', 'Travaux manquants très fréquents', '#dc2626'],
            [60, 'Absences fréquentes', 'Travaux manquants fréquents', '#dc2626'],
            [61, 'Absences fréquentes', 'Travaux manquants fréquents', '#dc2626'],
            [69, 'Absences fréquentes', 'Travaux manquants fréquents', '#dc2626'],
            [70, 'Quelques absences', 'Quelques travaux manquants', '#ca8a04'],
            [71, 'Quelques absences', 'Quelques travaux manquants', '#ca8a04'],
            [79, 'Quelques absences', 'Quelques travaux manquants', '#ca8a04'],
            [80, 'Absences rares', 'Travaux manquants rares', 'var(--vert-succes)'],
            [81, 'Absences rares', 'Travaux manquants rares', 'var(--vert-succes)'],
            [84, 'Absences rares', 'Travaux manquants rares', 'var(--vert-succes)'],
            [85, 'Aucune absence ou presque', 'Aucun travail manquant ou presque', '#0284c7'],
            [86, 'Aucune absence ou presque', 'Aucun travail manquant ou presque', '#0284c7'],
            [100, 'Aucune absence ou presque', 'Aucun travail manquant ou presque', '#0284c7']
        ];
        for (const [v, a, c, couleur] of attendu) {
            expect(win.interpreterAssiduite(v).niveau, `A ${v}`).toBe(a);
            expect(win.interpreterCompletion(v).niveau, `C ${v}`).toBe(c);
            expect(win.obtenirCouleurSelonSeuils(v), `couleur ${v}`).toBe(couleur);
        }
    });

    it('la quatrième borne, fixe (60 %), est nommée — et n\'existe pas dans la couleur', () => {
        const { win } = monter();
        expect(win.BORNE_FIXE_INSUFFISANT).toBe(0.60);
        expect(win.interpreterAssiduite(60).niveau).not.toBe(win.interpreterAssiduite(59).niveau);
        expect(win.obtenirCouleurSelonSeuils(60)).toBe(win.obtenirCouleurSelonSeuils(59));
    });

    it('un réglage de l\'enseignant·e est LU, pas recopié : des seuils à 55 / 66 / 77 déplacent les trois paliers', () => {
        const { win } = monter({ interpretation: { excellent: 0.77, bon: 0.66, acceptable: 0.55 } });
        expect(win.interpreterCompletion(54).niveau).toBe('Travaux manquants très fréquents');
        expect(win.interpreterCompletion(55).niveau).toBe('Quelques travaux manquants');
        expect(win.interpreterCompletion(66).niveau).toBe('Travaux manquants rares');
        expect(win.interpreterAssiduite(77).niveau).toBe('Aucune absence ou presque');
        expect(win.obtenirCouleurSelonSeuils(76)).toBe('var(--vert-succes)');
        expect(win.obtenirCouleurSelonSeuils(77)).toBe('#0284c7');
    });

    it('un `seuilsInterpretation` stocké PARTIEL est comblé par les défauts, et la valeur stockée ne bouge pas', () => {
        const { win, store } = monter({ interpretation: { acceptable: 0.55 } });
        expect(win.interpreterCompletion(55).niveau).toBe('Quelques travaux manquants');   // le réglage est lu
        expect(win.interpreterCompletion(80).niveau).toBe('Travaux manquants rares');  // le défaut comble
        expect(win.interpreterCompletion(85).niveau).toBe('Aucun travail manquant ou presque');
        expect(store.seuilsInterpretation.interpretation).toEqual({ excellent: 0.85, bon: 0.80, acceptable: 0.55 });
    });

    it('aucune borne réglable n\'est recopiée : le module appelle obtenirSeuil pour les trois', () => {
        const code = lireCodeSansCommentaires('js/contexte-qualification.js');
        for (const chemin of ['interpretation.excellent', 'interpretation.bon', 'interpretation.acceptable']) {
            expect(code, `obtenirSeuil('${chemin}') absent`).toContain(`obtenirSeuil('${chemin}')`);
        }
    });
});

describe('#821 lot A · mécanisme 1 — l\'Aperçu ne classe rien : quatre mots posés sur un dégradé continu', () => {

    function monterAvecApercu() {
        const { win } = monter();
        chargerScript('js/tableau-bord-apercu.js', {
            normaliserIdPratique: (id) => id,
            obtenirTypePratiqueActive: () => 'sommative'
        }, win);
        return win;
    }

    it('les bandes de la légende sont DÉRIVÉES de la géométrie du dégradé, jamais recopiées : 30 / 47,5 / 65 / 82,5', () => {
        const win = monterAvecApercu();
        const bandes = win.bandesLegendeApercu();
        expect(bandes).toHaveLength(4);
        // #821 (15 oct. 2026) : aucun mot sur le dégradé.
        bandes.forEach((b) => expect(b).not.toHaveProperty('libelle'));
        expect(win.LIBELLES_LEGENDE_APERCU).toBeUndefined();
        const bornes = [[0.30, 0.475], [0.475, 0.65], [0.65, 0.825], [0.825, null]];
        bandes.forEach((b, i) => {
            expect(b.de, `bande ${i} : de`).toBeCloseTo(bornes[i][0], 6);
            if (bornes[i][1] === null) expect(b.a).toBeNull();
            else expect(b.a, `bande ${i} : à`).toBeCloseTo(bornes[i][1], 6);
        });
        // La source, pas une copie : la géométrie n'est pas écrite dans le module.
        const code = lireCodeSansCommentaires('js/contexte-qualification.js');
        expect(code).not.toMatch(/ECHELLE_DISTRIBUTION_MIN\s*=/);
        expect(code).not.toMatch(/position:\s*\d+/);
    });

    it('#821 et bloc 6b (15 oct. 2026) : rien ne s\'écrit sous le dégradé, ni mot ni chiffre', () => {
        const tdb = lire('js/tableau-bord-apercu.js');
        expect(tdb).not.toContain('const legendeUnique');
        expect(tdb).not.toContain('libelleBandeDistribution');
    });

    it('le tableau des quatre règles se lit d\'un coup, avec les bornes vivantes', () => {
        const win = monterAvecApercu();
        const regles = win.reglesDeQualification();
        expect(regles.map((r) => r.mecanisme)).toEqual([1, 2, 3, 4]);
        expect(regles[0].classe).toBe(false);
        expect(regles[1]).toMatchObject({ reglable: true, bornes: { excellent: 0.85, bon: 0.80, acceptable: 0.70, insuffisantFixe: 0.60 } });
        expect(regles[2].bornes).toEqual({ tresFavorable: 0.85, favorable: 0.75, modere: 0.65 });
        expect(regles[3].bornes).toEqual({ critique: 0.7, fragile: 0.8, favorable: 0.9 });
    });
});

describe('#821 lot A · la carte Mobilisation du profil lit les bornes, et écrit les mêmes chiffres qu\'avant', () => {

    /** Même geste que les bancs d'audit : exposer une fonction interne de l'IIFE, sans fichier temporaire. */
    function rendre(A, C) {
        const { win } = monter();
        let code = lire('js/profil-etudiant-sections-affichage.js');
        const fin = code.lastIndexOf('})();');
        code = code.slice(0, fin) + '\n;window.__genererSectionMobilisation = genererSectionMobilisation;\n' + code.slice(fin);
        const globaux = {
            window: win,
            document: { addEventListener() {}, removeEventListener() {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
            console, localStorage: { getItem: () => null, setItem() {}, removeItem() {} }, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
            BORNES_MOBILISATION: win.BORNES_MOBILISATION,
            interpreterMobilisation: win.interpreterMobilisation,
            calculerTousLesIndices: () => ({ A: Math.round(A * 100), C: Math.round(C * 100), M: Math.round((A + C) / 2 * 100), P: 50 }),
            db: { getSync: () => null, setSync() {}, get: async () => null, set: async () => {} },
            cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s), obtenirPreference: () => null
        };
        new Function(...Object.keys(globaux), '"use strict";\n' + code)(...Object.values(globaux));
        return win.__genererSectionMobilisation('da');
    }

    // Bloc 7 des textes relus (15 oct. 2026, Grégoire) : « L'application ne doit pas être prescriptive. Elle doit
    // parler au conditionnel. » La prose ne cite plus de pourcentage ; les bornes décident toujours de la piste.
    it('chaque branche dit sa piste, au conditionnel, et les bornes décident toujours laquelle', () => {
        expect(rendre(0.5, 0.5)).toContain('du côté de la présence comme de la remise');
        expect(rendre(0.69, 0.9)).toContain('ce qui l\'empêche d\'être présent·e en classe');
        expect(rendre(0.9, 0.69)).toContain('ce qui fait obstacle à la remise des travaux');
        expect(rendre(0.75, 0.75)).toContain('un soutien sur la présence et sur la remise');
        expect(rendre(0.75, 0.85)).toContain('encourager la présence en classe');
        expect(rendre(0.85, 0.75)).toContain('organisation et à la planification');
        expect(rendre(0.85, 0.85)).toContain('suivi habituel en classe');
        expect(rendre(0.95, 0.95)).toContain('aucun geste particulier');
    });

    it('aucune branche ne juge ni n\'ordonne', () => {
        for (const [A, C] of [[0.5, 0.5], [0.69, 0.9], [0.9, 0.69], [0.75, 0.75], [0.75, 0.85], [0.85, 0.75], [0.85, 0.85], [0.95, 0.95]]) {
            const html = rendre(A, C);
            const prose = tranche(html, 'profil-interpretation-texte');
            expect(prose, `A=${A}, C=${C}`).not.toMatch(/critique|fragile|[Ee]xcellent|requise?s?\b|immédiate|[Mm]aintenir|niveau critique|niveau fragile/);
        }
    });

    it('le bloc de pistes suit les bornes : intervention sous 70, prévention sous 80, rien au-dessus', () => {
        expect(rendre(0.69, 0.9)).toContain('Pistes d\'intervention');
        expect(rendre(0.7, 0.9)).toContain('Pistes de prévention');
        expect(rendre(0.8, 0.8)).not.toMatch(/Pistes d'intervention|Pistes de prévention/);
    });
});

describe('#821 lot A · zéro-dette — chaque règle a QUITTÉ son fichier d\'origine', () => {

    it('profil-etudiant-helpers.js ne définit plus les trois interprétations', () => {
        const code = lireCodeSansCommentaires('js/profil-etudiant-helpers.js');
        for (const f of ['interpreterMobilisation', 'interpreterCompletion', 'interpreterAssiduite']) {
            expect(code, `${f} est revenue dans helpers`).not.toMatch(new RegExp(`function\\s+${f}\\s*\\(`));
            expect(code, `${f} est encore exportée depuis helpers`).not.toMatch(new RegExp(`window\\.${f}\\s*=`));
        }
    });

    it('profil-etudiant-calculs.js ne porte plus les quatre paliers du contexte', () => {
        const code = lireCodeSansCommentaires('js/profil-etudiant-calculs.js');
        expect(code).not.toContain('badge-engagement-tres-favorable');
        expect(code).not.toMatch(/A\s*>=\s*0\.85\s*&&\s*C\s*>=\s*0\.85/);
        expect(code).toContain('qualifierContexteApprentissage(A, C)');
    });

    it('etudiants.js ne porte plus la couleur selon les seuils, ni sa copie des défauts', () => {
        const code = lireCodeSansCommentaires('js/etudiants.js');
        expect(code).not.toMatch(/function\s+obtenirCouleurSelonSeuils/);
        expect(code).not.toMatch(/excellent:\s*0\.85/);
    });

    it('la carte Mobilisation ne compare plus A et C à des littéraux', () => {
        const code = lireCodeSansCommentaires('js/profil-etudiant-sections-affichage.js');
        const d = code.indexOf('function genererSectionMobilisation');
        const f = code.indexOf('\n}\n', d);
        const fn = code.slice(d, f);
        expect(fn).not.toMatch(/[AC]\s*<\s*0\.[78]\b/);
        expect(fn).not.toMatch(/70-80%|≥ 90%|≥ 80%|sous 70%/);
    });

    it('index.html charge le module, après interpretation-config.js', () => {
        const html = lire('index.html');
        const iConfig = html.indexOf('js/interpretation-config.js?v=');
        const iModule = html.indexOf('js/contexte-qualification.js?v=');
        expect(iModule).toBeGreaterThan(0);
        expect(iModule).toBeGreaterThan(iConfig);
    });
});

// JOURNAL DES BREAK-TESTS — 10 sept. 2026, chaque mutation appliquée puis
// retirée, arbre vérifié par empreinte :
//   1. `BORNES_CONTEXTE.favorable` 0.75 → 0.85 ......... mécanisme 3 rougit (et la divergence)
//   2. `BORNES_MOBILISATION.favorable` 0.9 → 0.8 ....... LA DIVERGENCE rougit (« unifiée » par accident)
//   3. dernière branche du mécanisme 3 : OU → ET ....... « Fragile » à (0.65, 0.64) rougit
//   4. `seuilsInterpretation()` rend 0.85/0.8/0.7 en dur . le réglage 55/66/77 rougit, et la lecture
//   5. `BORNE_FIXE_INSUFFISANT` 0.60 → 0.50 ............ la borne fixe rougit
//   6. arrêt du dégradé 25 → 30 dans tableau-bord-apercu  les bandes dérivées rougissent (47,5 → 51)
//   7. prose de la carte : `${pctCritique}-${pctFragile}` → « 70-85 » ... la carte rougit
//   8. `function interpreterMobilisation` remise dans helpers ........ zéro-dette rougit
