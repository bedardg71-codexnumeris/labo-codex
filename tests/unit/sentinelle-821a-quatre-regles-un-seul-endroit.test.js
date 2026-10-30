import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript, completerNoteParDefaut } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

// SENTINELLE #821 lot A (10 sept. 2026), RÉVISÉE LE 30 OCT. 2026 — LES RÈGLES QUI
// QUALIFIENT A ET C VIVENT EN UN SEUL ENDROIT, ET LISENT UNE SEULE SOURCE.
//
// L'arbitrage de Grégoire (10 sept.) : « L'application nomme un contexte et on ne
// sait pas comment elle fait pour le qualifier ainsi. […] Il faut unifier les
// définitions. » Sa décision du 30 oct. les unifie : les trois champs de Labo ›
// Outils d'observation font foi, défauts 95 · 90 · 85, quatre paliers. La
// divergence 85/75/65 contre 70/80/90, que ce banc protégeait, est retirée.
//
// Ce banc verrouille :
//   1. CHAQUE règle rend ce qu'il faut sur chaque borne et chaque borne ± 1 point,
//      aux nouveaux défauts ;
//   2. le contexte et la carte Mobilisation restent deux règles (conjonction sur A
//      et C, codes distincts) mais lisent LES MÊMES bornes : un réglage les déplace
//      ensemble ;
//   3. les mots : un seul vocabulaire ; le contexte et la Mobilisation se disent par
//      la phrase des deux observations.
//
// La défense du lot du 30 oct. (P, repères, stock, réglages) est dans
// `sentinelle-seuils-une-source-2026-10-30.test.js`.

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

describe('Le contexte d\'apprentissage (A ET C, bornes 95 / 90 / 85 par défaut)', () => {
    const { win } = monter();
    const q = (A, C) => win.qualifierContexteApprentissage(A, C);

    it('chaque borne et chaque borne ± 1 point rend ce qu\'elle rendait avant le déplacement', () => {
        const attendu = [
            // [A, C, palier] — le palier se lit par son code depuis le 15 oct. 2026
            [0.96, 0.96, 'tres-favorable'], [0.95, 0.95, 'tres-favorable'], [0.94, 0.95, 'favorable'], [0.95, 0.94, 'favorable'],
            [0.91, 0.91, 'favorable'], [0.90, 0.90, 'favorable'], [0.89, 0.90, 'modere'], [0.90, 0.89, 'modere'],
            [0.86, 0.86, 'modere'], [0.85, 0.85, 'modere'], [0.84, 0.85, 'fragile'], [0.85, 0.84, 'fragile'],
            [0, 0, 'fragile'], [1, 1, 'tres-favorable'], [1, 0, 'fragile']
        ];
        for (const [A, C, palier] of attendu) {
            expect(q(A, C).niveau, `A=${A}, C=${C}`).toBe(palier);
        }
    });

    it('la dernière branche est un OU : A = 85 %, C = 84 % est au palier « fragile », pas « insuffisant »', () => {
        expect(q(0.85, 0.84)).toMatchObject({ niveau: 'fragile', badgeClasse: 'badge-engagement-fragile' });
        expect(q(0.84, 0.85).niveau).toBe('fragile');
    });

    it('les sorties gardent leur forme : niveau, label, badgeClasse, A et C en « 92 % » (↻ #1137 : l’insécable)', () => {
        expect(q(0.92, 0.92)).toMatchObject({
            niveau: 'favorable', label: 'Absences rares, travaux manquants rares', badgeClasse: 'badge-engagement-favorable', A: '92\u00A0%', C: '92\u00A0%'
        });
    });

    it('#821 (15 oct. 2026) : le palier n\'a plus de mot à lui — son label est la phrase des deux observations', () => {
        expect(q(0.96, 0.96).label).toBe('Aucune absence ou presque, aucun travail manquant ou presque');
        expect(q(0.92, 0.87).label).toBe('Absences rares, quelques travaux manquants');
        expect(q(0.62, 0.5).label).toBe('Absences très fréquentes, travaux manquants très fréquents');
        for (const [A, C] of [[1, 1], [0.92, 0.92], [0.87, 0.87], [0.3, 0.9]]) {
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

    it('aucune borne n\'est écrite dans le module : déplacer les trois champs déplace le palier', () => {
        expect(win.BORNES_CONTEXTE).toBeUndefined();
        const { win: w } = monter({ interpretation: { excellent: 0.77, bon: 0.66, acceptable: 0.55 } });
        expect(w.qualifierContexteApprentissage(0.77, 0.77).niveau).toBe('tres-favorable');
        expect(w.qualifierContexteApprentissage(0.76, 0.77).niveau).toBe('favorable');
        expect(w.qualifierContexteApprentissage(0.66, 0.66).niveau).toBe('favorable');
        expect(w.qualifierContexteApprentissage(0.65, 0.66).niveau).toBe('modere');
        expect(w.qualifierContexteApprentissage(0.55, 0.55).niveau).toBe('modere');
        expect(w.qualifierContexteApprentissage(0.54, 0.55).niveau).toBe('fragile');
    });
});

describe('La carte Mobilisation (A ET C, mêmes bornes 95 / 90 / 85 par défaut)', () => {
    const { win } = monter();
    const m = (A, C, d) => win.interpreterMobilisation(A, C, d);

    it('chaque borne et chaque borne ± 1 point rend ce qu\'elle rendait avant le déplacement', () => {
        // La branche se lit par son code depuis le 15 oct. 2026.
        const attendu = [
            [0.84, 0.84, 'critiques'], [0.85, 0.84, 'completion-critique'], [0.84, 0.85, 'assiduite-critique'],
            [0.85, 0.85, 'fragile'], [0.86, 0.86, 'fragile'],
            [0.89, 0.89, 'fragile'], [0.89, 0.9, 'assiduite-fragile'], [0.9, 0.89, 'completion-fragile'],
            [0.9, 0.9, 'acceptable'], [0.91, 0.91, 'acceptable'], [0.94, 0.94, 'acceptable'],
            [0.94, 0.95, 'acceptable'], [0.95, 0.94, 'acceptable'], [0.95, 0.95, 'favorable'], [0.96, 0.96, 'favorable'], [1, 1, 'favorable']
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
        expect(m(0.87, 0.87).couleur).toBe('#ffc107');
        expect(m(0.92, 0.92).couleur).toBe('#28a745');
        expect(m(0.96, 0.96).couleur).toBe('#2196F3');
    });

    it('aucune borne n\'est écrite dans le module : déplacer les trois champs déplace la branche', () => {
        expect(win.BORNES_MOBILISATION).toBeUndefined();
        expect(win.bornesMobilisation()).toEqual({ critique: 0.85, fragile: 0.90, favorable: 0.95 });
        const { win: w } = monter({ interpretation: { excellent: 0.77, bon: 0.66, acceptable: 0.55 } });
        expect(w.bornesMobilisation()).toEqual({ critique: 0.55, fragile: 0.66, favorable: 0.77 });
        expect(w.interpreterMobilisation(0.54, 0.54).code).toBe('critiques');
        expect(w.interpreterMobilisation(0.55, 0.55).code).toBe('fragile');
        expect(w.interpreterMobilisation(0.66, 0.66).code).toBe('acceptable');
        expect(w.interpreterMobilisation(0.77, 0.77).code).toBe('favorable');
    });
});

describe('Le contexte et la Mobilisation : deux règles, une seule source', () => {
    it('A = C = 92 % : palier « favorable » et branche « acceptable », la même phrase', () => {
        const { win } = monter();
        const contexte = win.qualifierContexteApprentissage(0.92, 0.92);
        const mobilisation = win.interpreterMobilisation(0.92, 0.92);
        expect(contexte.niveau).toBe('favorable');
        expect(mobilisation.code).toBe('acceptable');
        expect(contexte.badgeClasse).toBe('badge-engagement-favorable');
        expect(mobilisation.couleur).toBe('#28a745');
        // #821 (15 oct. 2026) : les deux cartes disent la MÊME phrase — c'est le but du vocabulaire unique.
        expect(contexte.label).toBe(mobilisation.niveau);
    });

    it('au palier le plus bas : le contexte est « fragile », la Mobilisation nomme l\'indice en cause, la phrase est une', () => {
        const { win } = monter();
        expect(win.qualifierContexteApprentissage(0.84, 0.96).niveau).toBe('fragile');
        expect(win.interpreterMobilisation(0.84, 0.96).code).toBe('assiduite-critique');
        expect(win.interpreterMobilisation(0.87, 0.87).code).toBe('fragile');
        expect(win.qualifierContexteApprentissage(0.87, 0.87).niveau).toBe('modere');
        expect(win.qualifierContexteApprentissage(0.84, 0.96).label).toBe(win.interpreterMobilisation(0.84, 0.96).niveau);
    });
});

describe('Les mots et les couleurs de A et C — un seuil sur un scalaire, réglable, lu par obtenirSeuil', () => {

    it('avec les défauts (95 / 90 / 85) : chaque borne et chaque borne ± 1 point, en A, en C et en couleur', () => {
        const { win } = monter();
        const attendu = [
            // [valeur, niveau A, niveau C, couleur]
            [59, 'Absences très fréquentes', 'Travaux manquants très fréquents', '#dc2626'],
            [60, 'Absences très fréquentes', 'Travaux manquants très fréquents', '#dc2626'],
            [84, 'Absences très fréquentes', 'Travaux manquants très fréquents', '#dc2626'],
            [85, 'Quelques absences', 'Quelques travaux manquants', '#ca8a04'],
            [86, 'Quelques absences', 'Quelques travaux manquants', '#ca8a04'],
            [89, 'Quelques absences', 'Quelques travaux manquants', '#ca8a04'],
            [90, 'Absences rares', 'Travaux manquants rares', 'var(--vert-succes)'],
            [91, 'Absences rares', 'Travaux manquants rares', 'var(--vert-succes)'],
            [94, 'Absences rares', 'Travaux manquants rares', 'var(--vert-succes)'],
            [95, 'Aucune absence ou presque', 'Aucun travail manquant ou presque', '#0284c7'],
            [96, 'Aucune absence ou presque', 'Aucun travail manquant ou presque', '#0284c7'],
            [100, 'Aucune absence ou presque', 'Aucun travail manquant ou presque', '#0284c7']
        ];
        for (const [v, a, c, couleur] of attendu) {
            expect(win.interpreterAssiduite(v).niveau, `A ${v}`).toBe(a);
            expect(win.interpreterCompletion(v).niveau, `C ${v}`).toBe(c);
            expect(win.obtenirCouleurSelonSeuils(v), `couleur ${v}`).toBe(couleur);
        }
    });

    it('la borne fixe à 60 % a disparu : plus de cinquième mot, plus de changement à 60', () => {
        const { win } = monter();
        expect(win.BORNE_FIXE_INSUFFISANT).toBeUndefined();
        expect(win.interpreterAssiduite(60).niveau).toBe(win.interpreterAssiduite(59).niveau);
        expect(win.obtenirCouleurSelonSeuils(60)).toBe(win.obtenirCouleurSelonSeuils(59));
        expect(lireCodeSansCommentaires('js/contexte-qualification.js')).not.toMatch(/Absences fréquentes|Travaux manquants fréquents/);
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
        expect(win.interpreterCompletion(90).niveau).toBe('Travaux manquants rares');  // le défaut comble
        expect(win.interpreterCompletion(95).niveau).toBe('Aucun travail manquant ou presque');
        expect(store.seuilsInterpretation.interpretation).toEqual({ excellent: 0.95, bon: 0.90, acceptable: 0.55 });
    });

    it('aucune borne réglable n\'est recopiée : le module appelle obtenirSeuil pour les trois', () => {
        const code = lireCodeSansCommentaires('js/contexte-qualification.js');
        for (const chemin of ['interpretation.excellent', 'interpretation.bon', 'interpretation.acceptable']) {
            expect(code, `obtenirSeuil('${chemin}') absent`).toContain(`obtenirSeuil('${chemin}')`);
        }
    });
});

describe('Les barres de l\'Aperçu : leurs zones suivent les mêmes sources', () => {

    it('les zones de A et C sont les trois champs, sans trou, de 0 à 1 ; aucune géométrie écrite', () => {
        const { win } = monter({ interpretation: { excellent: 0.77, bon: 0.66, acceptable: 0.55 } });
        const zones = win.zonesDeLaBarre('A');
        expect(zones.map((z) => [z.de, z.a, z.zone])).toEqual([
            [0, 0.55, 'bas'], [0.55, 0.66, 'signale'], [0.66, 0.77, 'acquis'], [0.77, 1, 'audela']
        ]);
        expect(win.zonesDeLaBarre('C')).toEqual(zones);
        const code = lireCodeSansCommentaires('js/contexte-qualification.js');
        expect(code).not.toMatch(/ECHELLE_DISTRIBUTION_MIN\s*=/);
        expect(code).not.toMatch(/position:\s*\d+/);
    });

    it('le dégradé du #818 et sa table sont retirés, sans alias', () => {
        const tdb = lireCodeSansCommentaires('js/tableau-bord-apercu.js');
        for (const nom of ['ARRETS_DEGRADE', 'scoreALaPositionDistribution', 'obtenirCouleurGradient']) {
            expect(tdb, `${nom} est revenu`).not.toContain(nom);
        }
        expect(tdb).toContain('fondDeLaBarre(zonesBarre)');
        expect(lireCodeSansCommentaires('js/contexte-qualification.js')).not.toContain('bandesLegendeApercu');
    });

    it('#821 et bloc 6b (15 oct. 2026) : rien ne s\'écrit sous les barres, ni mot ni chiffre', () => {
        const tdb = lire('js/tableau-bord-apercu.js');
        expect(tdb).not.toContain('const legendeUnique');
        expect(tdb).not.toContain('libelleBandeDistribution');
    });

    it('le tableau des règles se lit d\'un coup, avec les bornes vivantes', () => {
        const { win } = monter();
        const regles = win.reglesDeQualification();
        expect(regles).toHaveLength(4);
        expect(regles[0].bornes).toEqual({ excellent: 0.95, bon: 0.90, acceptable: 0.85 });
        expect(regles[1].bornes).toEqual({ excellent: 0.95, bon: 0.90, acceptable: 0.85 });
        expect(regles[2].bornes).toEqual({ critique: 0.85, fragile: 0.90, favorable: 0.95 });
        expect(regles[3].bornes).toMatchObject({ suffisance: null, maitrise: null, passage: 60 });
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
            bornesMobilisation: win.bornesMobilisation,
            interpreterMobilisation: win.interpreterMobilisation,
            calculerTousLesIndices: () => ({ A: Math.round(A * 100), C: Math.round(C * 100), M: Math.round((A + C) / 2 * 100), P: 50 }),
            db: { getSync: () => null, setSync() {}, get: async () => null, set: async () => {} },
            cle: (k) => 'test_' + k, echapperHtml: (s) => String(s == null ? '' : s), obtenirPreference: () => null
        };
        const g = completerNoteParDefaut(globaux);   // #1137 : le module des nombres affichés
        new Function(...Object.keys(g), '"use strict";\n' + code)(...Object.values(g));
        return win.__genererSectionMobilisation('da');
    }

    // Bloc 7 des textes relus (15 oct. 2026, Grégoire) : « L'application ne doit pas être prescriptive. Elle doit
    // parler au conditionnel. » La prose ne cite plus de pourcentage ; les bornes décident toujours de la piste.
    it('chaque branche dit sa piste, au conditionnel, et les bornes décident toujours laquelle', () => {
        expect(rendre(0.5, 0.5)).toContain('du côté de la présence comme de la remise');
        expect(rendre(0.84, 0.95)).toContain('ce qui l\'empêche d\'être présent·e en classe');
        expect(rendre(0.95, 0.84)).toContain('ce qui fait obstacle à la remise des travaux');
        expect(rendre(0.87, 0.87)).toContain('un soutien sur la présence et sur la remise');
        expect(rendre(0.87, 0.92)).toContain('encourager la présence en classe');
        expect(rendre(0.92, 0.87)).toContain('organisation et à la planification');
        expect(rendre(0.92, 0.92)).toContain('suivi habituel en classe');
        expect(rendre(0.96, 0.96)).toContain('aucun geste particulier');
    });

    it('aucune branche ne juge ni n\'ordonne', () => {
        for (const [A, C] of [[0.5, 0.5], [0.84, 0.95], [0.95, 0.84], [0.87, 0.87], [0.87, 0.92], [0.92, 0.87], [0.92, 0.92], [0.96, 0.96]]) {
            const html = rendre(A, C);
            const prose = tranche(html, 'profil-interpretation-texte');
            expect(prose, `A=${A}, C=${C}`).not.toMatch(/critique|fragile|[Ee]xcellent|requise?s?\b|immédiate|[Mm]aintenir|niveau critique|niveau fragile/);
        }
    });

    it('le bloc de pistes suit les bornes : intervention au palier le plus bas, prévention sous « Absences rares », rien au-dessus', () => {
        expect(rendre(0.84, 0.95)).toContain('Pistes d\'intervention');
        expect(rendre(0.85, 0.95)).toContain('Pistes de prévention');
        expect(rendre(0.9, 0.9)).not.toMatch(/Pistes d'intervention|Pistes de prévention/);
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

// Break-tests du lot du 30 oct. : voir `sentinelle-seuils-une-source-2026-10-30.test.js`.
