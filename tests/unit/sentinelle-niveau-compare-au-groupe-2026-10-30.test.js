/**
 * SENTINELLE — LE NIVEAU RàI COMPARÉ AU GROUPE-COURS (décision de Grégoire du 30 oct. 2026, lot 2 des seuils).
 *
 * Le modèle a été mesuré avant d'être codé (scripts/mesures-depistage/regles-1-et-2.mjs). Rejouer ce script sur le code
 * doit rendre, à toutes les dates, la colonne « en place » égale à la colonne « règles » : c'est le témoin sur le corpus.
 * Ici, le banc verrouille la règle et ses bords.
 *
 *   cd tests && npx vitest run unit/sentinelle-niveau-compare-au-groupe-2026-10-30.test.js
 *
 * Break-tests : journal en fin de fichier.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { tranche } from './_helpers/tranche.js';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const DA_DU_RANG = (i) => '30000' + String(i).padStart(2, '0');

/**
 * Un groupe-cours réel : une note par élève, répétée sur `copies` productions. Une note `null` : aucune copie.
 * `options.statuts` : le statut d'un élève, par rang. `options.groupes` : un second groupe, en mode « tous les groupes ».
 */
function groupe(notes, { copies = 2, statuts = {}, groupes = null, nonRemis = [] } = {}) {
    const store = storeBase();
    if (groupes) store.infoCours = { id: 'GC1', nom: 'Cours banc', groupe: null, _groupeCoursId: 'GC1', _modeCours: true };
    store.test_productions = Array.from({ length: 3 }, (_, i) => ({ id: 'P' + i, titre: 'P' + i, type: 'artefact-portfolio', dateEcheance: '2026-08-30' }));
    store.test_groupeEtudiants = notes.map((_, i) => ({ da: DA_DU_RANG(i), nom: 'Nom' + i, prenom: 'P', groupe: groupes ? groupes[i] : '01', coursId: 'GC1', ...(statuts[i] ? { statut: statuts[i] } : {}) }));
    store.test_evaluationsSauvegardees = notes.flatMap((note, i) => note === null ? [] : Array.from({ length: copies }, (_, c) => ({
        id: `C${i}-${c}`, etudiantDA: DA_DU_RANG(i), productionId: 'P' + c, noteFinale: note, verrouillee: true, coursId: 'GC1',
        ...(nonRemis.includes(i) ? { statutRemise: 'non-remis' } : {})
    })));
    const b = monter(store, {
        modules: ['js/contexte-qualification.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-calculs.js', { chemin: 'js/tableau-bord-apercu.js', internes: ['genererInterpretationRai'] }],
        // Les indices ne fixent plus le niveau : A sert seulement à la garde de la non-participation.
        globaux: { designerPratiqueActive: () => ({ etat: 'ok', famille: 'standards' }), obtenirTypePratiqueActive: () => 'standards', calculerTousLesIndices: () => ({ A: 100, C: 100, P: 0, noteConstructible: true }), chargerSeuilsInterpretation: () => ({}), obtenirSeuil: () => 0.7, obtenirNombreProductionsPourPatterns: () => 3 }
    });
    return { win: b.win, interne: b.interne['tableau-bord-apercu.js'], niveaux: () => notes.map((_, i) => b.win.determinerNiveauRaiPedagogique(DA_DU_RANG(i)).niveau) };
}

// À la main : 80, 80, 70, 70, 60, 50 → moyenne 68,33, écart-type d'échantillon 11,69. Un écart-type sous : 56,64. Un demi : 62,49.
const SIX = [80, 80, 70, 70, 60, 50];

describe('la règle nue', () => {
    const { win } = groupe(SIX);
    const c = (...a) => win.classerNiveauDansLeGroupe(...a);
    const fort = { moyenne: 80, ecartType: 10 };
    const faible = { moyenne: 55, ecartType: 10 };

    it('les bornes sont strictes : exactement à un écart-type, niveau 2 ; exactement à un demi, niveau 1', () => {
        expect(c(69.9, 2, fort, null, 60).niveau).toBe(3);
        expect(c(70, 2, fort, null, 60).niveau).toBe(2);
        expect(c(74.9, 2, fort, null, 60).niveau).toBe(2);
        expect(c(75, 2, fort, null, 60).niveau).toBe(1);
    });

    it('la condition du repère de maîtrise : au repère ou au-dessus, niveau 1 ; sous lui, le niveau reste ; sans repère, elle se lève', () => {
        expect(c(70, 2, fort, 70, 60)).toEqual({ niveau: 1, motif: 'dans-le-groupe' });
        expect(c(69.9, 2, fort, 70, 60).niveau).toBe(3);
        expect(c(72, 2, fort, 75, 60).niveau).toBe(2);
        expect(c(72, 2, fort, null, 60).niveau).toBe(2);
    });

    it('règle 1 : signal éteint, sous la note de passage, au moins le niveau 2 ; à exactement 60 de moyenne, le signal est éteint', () => {
        expect(c(59, 2, { moyenne: 60, ecartType: 1 }, null, 60).niveau).toBe(2);
        expect(c(59.9, 2, { moyenne: 60, ecartType: 1 }, null, 60).motif).toBe('sous-la-note-de-passage');
        expect(c(60, 2, { moyenne: 60, ecartType: 1 }, null, 60).niveau).toBe(1);
    });

    it('règle 1 : signal allumé, rien ne change', () => {
        expect(c(50, 2, faible, null, 60)).toEqual({ niveau: 1, motif: 'signal-de-groupe' });
        expect(c(47, 2, faible, null, 60).niveau).toBe(2);
        expect(c(44, 2, faible, null, 60).niveau).toBe(3);
    });

    it('règle 2 : à une copie, aucune comparaison au groupe, mais la règle 1 s\'applique déjà', () => {
        expect(c(65, 1, fort, null, 60)).toEqual({ niveau: 1, motif: 'une-seule-copie' });
        expect(c(59, 1, fort, null, 60)).toEqual({ niveau: 2, motif: 'sous-la-note-de-passage' });
        expect(c(50, 1, faible, null, 60)).toEqual({ niveau: 1, motif: 'signal-de-groupe' });
    });

    it('sans référence, sous l\'effectif minimum : seule la règle 1 parle', () => {
        expect(c(59, 2, null, null, 60).niveau).toBe(2);
        expect(c(60, 2, null, null, 60).niveau).toBe(1);
    });
});

describe('dans un groupe réel', () => {
    it('six élèves : les niveaux calculés à la main', () => {
        expect(groupe(SIX).niveaux()).toEqual([1, 1, 1, 1, 2, 3]);
    });

    it('le pattern et le défi restent à côté : le niveau ne les lit plus', () => {
        const { win } = groupe(SIX);
        const r = win.determinerNiveauRaiPedagogique(DA_DU_RANG(5));
        expect(r.niveau).toBe(3);
        expect(r.label).toBe('Niveau 3 - Intensif');
        expect(r.badgeClasse).toBe('badge-rai-3');
        expect(r.description).toBe('Plus d\'un écart-type sous la moyenne de son groupe.');
    });

    it('un élève exclu par statut reste hors de la référence (#745), et se classe quand même', () => {
        const avec = groupe([...SIX, 10], { statuts: { 6: 'inactif' } });
        expect(avec.niveaux()).toEqual([1, 1, 1, 1, 2, 3, 3]);
    });

    it('sous 5 élèves avec copie : pas de comparaison, seule la règle 1 parle', () => {
        expect(groupe([80, 70, 62, 58]).niveaux()).toEqual([1, 1, 1, 2]);
    });

    it('le signal de groupe : allumé sous 60 de moyenne, éteint à côté', () => {
        const faible = groupe([50, 50, 55, 55, 40, 58]);
        const signaux = faible.win.signauxDeGroupeDepistage();
        expect(signaux).toHaveLength(1);
        expect(signaux[0].groupe).toBe(null);
        expect(signaux[0].moyenne).toBeCloseTo(51.33, 1);
        expect(faible.niveaux()).toEqual([1, 1, 1, 1, 3, 1]);
        expect(faible.win.determinerNiveauRaiPedagogique(DA_DU_RANG(5)).signalGroupe).toBe(true);
        expect(groupe(SIX).win.signauxDeGroupeDepistage()).toEqual([]);
    });

    it('un groupe fort : un élève à 80 est au niveau 3, sans repère de maîtrise pour le protéger', () => {
        expect(groupe([98, 98, 96, 96, 94, 80]).niveaux()).toEqual([1, 1, 1, 1, 1, 3]);
    });

    it('à une seule copie : personne n\'est comparé au groupe', () => {
        expect(groupe(SIX, { copies: 1 }).niveaux()).toEqual([1, 1, 1, 1, 1, 2]);
    });

    it('en mode « tous les groupes », chaque élève reste comparé à SON groupe-cours', () => {
        // Le même 70 : le plus bas du groupe 01, le plus haut du groupe 02.
        const notes = [95, 95, 90, 90, 85, 70, 70, 65, 65, 62, 62, 60];
        const groupes = ['01', '01', '01', '01', '01', '01', '02', '02', '02', '02', '02', '02'];
        const n = groupe(notes, { groupes }).niveaux();
        expect(n[5]).toBe(3);
        expect(n[6]).toBe(1);
    });

    it('en mode « tous les groupes », le signal de groupe nomme le groupe en cause', () => {
        const notes = [80, 80, 70, 70, 65, 62, 50, 50, 55, 55, 40, 58];
        const groupes = ['01', '01', '01', '01', '01', '01', '02', '02', '02', '02', '02', '02'];
        const signaux = groupe(notes, { groupes }).win.signauxDeGroupeDepistage();
        expect(signaux.map((x) => x.groupe)).toEqual(['00002']);
    });

    it('un élève qui n\'a que des copies « non remises » est en non-participation, pas en comparaison', () => {
        const { win } = groupe([...SIX, 0], { nonRemis: [6] });
        const r = win.determinerNiveauRaiPedagogique(DA_DU_RANG(6));
        expect(r.niveau).toBe(3);
        expect(r.pattern).toBe('Non-participation');
    });
});

describe('la phrase sous la barre RàI (#1191)', () => {
    it('plus aucun 70 ni 60 en dur : la part du niveau 1 ne dit plus rien de l\'enseignement universel', () => {
        const corps = tranche(lire('js/tableau-bord-apercu.js'), 'function genererInterpretationRai(', '\nfunction ');
        expect(corps).not.toMatch(/>= ?(70|60)\b/);
        expect(corps).not.toContain('pctNiveau1');
    });

    it('le signal de groupe y est dit, et seulement quand il est allumé', () => {
        const rai = [{ niveau: 1, count: 4 }, { niveau: 2, count: 1 }, { niveau: 3, count: 1 }];
        const faible = groupe([50, 50, 55, 55, 40, 58]).interne.genererInterpretationRai(rai, 6);
        expect(faible).toContain('est sous la note de passage');
        expect(faible).toContain('renforcer, pour tous');
        const normal = groupe(SIX).interne.genererInterpretationRai(rai, 6);
        expect(normal).not.toContain('note de passage');
        expect(normal).toContain('préventives ciblées');
    });
});

/* Break-tests du 30 oct. 2026 : chaque mutation, puis ce fichier, puis le code restauré.
 *   règle 2 retirée (2 copies → 1) : 2 rouges
 *   demi-écart-type devenu un écart-type : 5 rouges
 *   borne du niveau 3 non stricte : 2 rouges
 *   condition du repère retirée : 1 rouge
 *   signal allumé ignoré par la règle 1 : 3 rouges
 *   signal allumé à exactement 60 : 1 rouge
 *   les exclus entrent dans la référence : 1 rouge
 *   effectif minimum retiré : 1 rouge
 *   tous les groupes mêlés : 2 rouges (0 au premier passage : le banc n'était pas en mode « tous les groupes » ; puis un faux vert, le banc fournissait une fonction que modes.js ne rend pas globale : le code lit maintenant la liste des élèves)
 *   copies non remises hors de la non-participation : 1 rouge
 *   phrase sans signal de groupe : 1 rouge
 */
