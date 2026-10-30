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
import { monter, storeBase, echelleAReperes, RACINE } from './_helpers/bac-suivi.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const sansCommentaires = (code) => code.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').filter((l) => !/^\s*\/\//.test(l)).join('\n');
const DA_DU_RANG = (i) => '30000' + String(i).padStart(2, '0');

/**
 * Un groupe-cours réel : une note par élève, répétée sur `copies` productions. Une note `null` : aucune copie.
 * `options.statuts` : le statut d'un élève, par rang. `options.groupes` : un second groupe, en mode « tous les groupes ».
 */
function groupe(notes, { copies = 2, statuts = {}, groupes = null, nonRemis = [], echelle = null, famille = 'standards', enPlus = [], vue = null, productionsEnPlus = [], parCopie = null } = {}) {
    const store = storeBase();
    if (groupes) store.infoCours = { id: 'GC1', nom: 'Cours banc', groupe: null, _groupeCoursId: 'GC1', _modeCours: true };
    if (vue) { store.infoCours = { id: 'GC1', nom: 'Cours banc', groupe: vue, _groupeCoursId: 'GC1' }; store.test_groupesCours[0].groupeNum = vue; }
    if (echelle) store.test_echellesTemplates = [echelle];
    store.test_productions = Array.from({ length: 3 }, (_, i) => ({ id: 'P' + i, titre: 'P' + i, type: 'artefact-portfolio', dateEcheance: '2026-08-30' })).concat(productionsEnPlus);
    store.test_groupeEtudiants = notes.map((_, i) => ({ da: DA_DU_RANG(i), nom: 'Nom' + i, prenom: 'P', groupe: groupes ? groupes[i] : '01', coursId: 'GC1', ...(statuts[i] ? { statut: statuts[i] } : {}) }));
    store.test_evaluationsSauvegardees = notes.flatMap((note, i) => note === null ? [] : Array.from({ length: copies }, (_, c) => ({
        id: `C${i}-${c}`, etudiantDA: DA_DU_RANG(i), productionId: 'P' + c, noteFinale: note, verrouillee: true, coursId: 'GC1',
        ...(nonRemis.includes(i) ? { statutRemise: 'non-remis' } : {}),
        ...(echelle ? { echelleId: echelle.id } : {}),
        ...(parCopie ? parCopie(i, c) : {})
    }))).concat(enPlus);
    const b = monter(store, {
        modules: ['js/entites/production-diagnostique.js', 'js/contexte-qualification.js', 'js/profil-etudiant-helpers.js', 'js/profil-etudiant-calculs.js', { chemin: 'js/tableau-bord-apercu.js', internes: ['genererInterpretationRai', 'phraseSansRepartition', 'genererInterpretationPerformance'] }],
        // Les indices ne fixent plus le niveau : A sert seulement à la garde de la non-participation.
        globaux: { designerPratiqueActive: () => ({ etat: 'ok', famille }), obtenirTypePratiqueActive: () => 'standards', calculerTousLesIndices: () => ({ A: 100, C: 100, P: 0, noteConstructible: true }), obtenirTermeProduction: () => 'artefacts', accordTermeProduction: () => 'évalués', chargerSeuilsInterpretation: () => ({}), obtenirSeuil: () => 0.7, obtenirNombreProductionsPourPatterns: () => 3 }
    });
    b.win.pluriel = (n, un, plusieurs) => (n > 1 ? plusieurs : un);
    return { win: b.win, store, interne: b.interne['tableau-bord-apercu.js'], niveaux: () => notes.map((_, i) => b.win.determinerNiveauRaiPedagogique(DA_DU_RANG(i)).niveau) };
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
        expect(c(70, 2, fort, 70, 60)).toEqual({ niveau: 1, motif: 'au-dessus-de-la-maitrise' });
        expect(c(78, 2, fort, 70, 60)).toEqual({ niveau: 1, motif: 'dans-le-groupe' });
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
        expect(c(60, 2, null, null, 60)).toEqual({ niveau: 1, motif: 'groupe-trop-petit' });
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
        expect(faible.win.determinerNiveauRaiPedagogique(DA_DU_RANG(5)).description).toContain('un signal pour l\'enseignement universel');
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

describe('les cas qui départagent (retouche du lot 2, constat 6)', () => {
    it('écart-type d\'échantillon : n−1 et non n (66 serait au niveau 3 avec n)', () => {
        // À la main : moyenne 79, écart-type n−1 = 13,48 → 65,52 ; écart-type n = 12,30 → 66,70.
        expect(groupe([70, 98, 66, 78, 69, 93]).niveaux()).toEqual([2, 1, 2, 1, 2, 1]);
    });

    it('le minimum est 5 élèves avec copie : à 5, on compare ; à 4, non', () => {
        expect(groupe([90, 90, 90, 90, 62]).niveaux()).toEqual([1, 1, 1, 1, 3]);
        expect(groupe([90, 90, 90, 62]).niveaux()).toEqual([1, 1, 1, 1]);
        expect(groupe([90, 90, 90, 62]).win.determinerNiveauRaiPedagogique(DA_DU_RANG(3)).description).toContain('Moins de 5 élèves');
    });

    it('une copie remplacée sort du calcul, sa reprise y entre', () => {
        // Le dernier élève a 50 et 50 ; sa première copie est remplacée par une reprise à 80 : (80 + 50) / 2 = 65.
        // À la main : 80, 80, 70, 70, 60, 65 → moyenne 70,83, écart-type 8,61 ; 65 est entre 62,22 et 66,53. Sans la reprise : niveau 3.
        const reprise = { id: 'R5', etudiantDA: DA_DU_RANG(5), productionId: 'P0', noteFinale: 80, verrouillee: true, coursId: 'GC1' };
        const parCopie = (i, c) => (i === 5 && c === 0 ? { remplaceeParId: 'R5', dateRemplacement: '2026-09-01' } : {});
        expect(groupe(SIX, { enPlus: [reprise], parCopie }).niveaux()[5]).toBe(2);
    });

    it('une copie d\'une production diagnostique ne compte pas', () => {
        const diag = { id: 'PD', titre: 'Diagnostique', type: 'artefact-portfolio', dateEcheance: '2026-08-30', diagnostique: true };
        const copie = { id: 'CD', etudiantDA: DA_DU_RANG(0), productionId: 'PD', noteFinale: 0, verrouillee: true, coursId: 'GC1' };
        expect(groupe(SIX, { productionsEnPlus: [diag], enPlus: [copie] }).niveaux()).toEqual([1, 1, 1, 1, 2, 3]);
    });

    it('une copie non recevable vaut ce que le calcul retient : 0', () => {
        // Le premier élève a 80 et 80 ; une copie plagiée : (0 + 80) / 2 = 40, loin sous le groupe.
        const parCopie = (i, c) => (i === 0 && c === 0 ? { statutIntegrite: 'plagiat' } : {});
        expect(groupe(SIX, { parCopie }).niveaux()[0]).toBe(3);
    });

    it('les références sont celles de tout le cours : un élève d\'un autre groupe garde son niveau, quelle que soit la vue', () => {
        const notes = [95, 95, 90, 90, 85, 70, 70, 65, 65, 62, 62, 60];
        const groupes = ['01', '01', '01', '01', '01', '01', '02', '02', '02', '02', '02', '02'];
        const tous = groupe(notes, { groupes }).niveaux();
        const unSeul = groupe(notes, { groupes, vue: '01' }).niveaux();
        expect(unSeul).toEqual(tous);
        expect(unSeul[5]).toBe(3);
        expect(unSeul[6]).toBe(1);
    });

    it('le signal de groupe ne parle que du groupe à l\'écran', () => {
        const notes = [80, 80, 70, 70, 65, 62, 50, 50, 55, 55, 40, 58];
        const groupes = ['01', '01', '01', '01', '01', '01', '02', '02', '02', '02', '02', '02'];
        expect(groupe(notes, { groupes, vue: '01' }).win.signauxDeGroupeDepistage()).toEqual([]);
        const vue2 = groupe(notes, { groupes, vue: '02' }).win.signauxDeGroupeDepistage();
        expect(vue2.map((x) => x.groupe)).toEqual([null]);
    });

    it('la cible et la carte disent la même chose d\'un élève qui n\'a que des copies non remises', () => {
        const { win } = groupe([...SIX, 0], { nonRemis: [6] });
        expect(win.determinerCibleIntervention(DA_DU_RANG(6)).pattern).toBe('Non-participation');
        expect(win.determinerNiveauRaiPedagogique(DA_DU_RANG(6))).not.toHaveProperty('signalGroupe');
    });
});

describe('décision de Grégoire du 30 oct. 2026, 11 h 33 : les repères de l\'échelle des copies, dans toutes les pratiques', () => {
    const FORT = [98, 98, 96, 96, 94, 80];
    const echelle = () => echelleAReperes({ id: 'E_M', plages: [['I', 0, 49], ['D', 50, 71], ['M', 72, 89], ['E', 90, 100]] });

    it('sommative, repère de maîtrise sur le vrai chemin : l\'élève à 80 % dans un groupe à 94 revient au niveau 1', () => {
        const { win, niveaux } = groupe(FORT, { famille: 'sommative', echelle: echelle() });
        expect(niveaux()).toEqual([1, 1, 1, 1, 1, 1]);
        expect(win.determinerNiveauRaiPedagogique(DA_DU_RANG(5)).description).toContain('repère de maîtrise');
    });

    it('sommative sans échelle, copies en points : il reste au niveau 3, même si la bibliothèque compte une échelle', () => {
        const avecBiblio = groupe(FORT, { famille: 'sommative' });
        expect(avecBiblio.niveaux()).toEqual([1, 1, 1, 1, 1, 3]);
        const store = groupe(FORT, { famille: 'sommative', parCopie: () => ({ echelleId: undefined }) });
        expect(store.niveaux()[5]).toBe(3);
    });

    it('spécifications : même règle', () => {
        expect(groupe(FORT, { famille: 'specifications', echelle: echelle() }).niveaux()).toEqual([1, 1, 1, 1, 1, 1]);
    });

    it('la note du cours ne change pas de règle : lireEchelleNoteGlobale garde ses deux familles', () => {
        const helpers = tranche(lire('js/profil-etudiant-helpers.js'), 'function lireEchelleNoteGlobale(', '\nfunction ');
        expect(helpers).toContain('note-chiffree');
        expect(lire('js/contexte-qualification.js')).not.toMatch(/raison: 'note-chiffree'|raison: 'pratique-sans-methode'/);
    });
});

describe('ce qui entoure le niveau (retouches du lot 2)', () => {
    it('la phrase de progression favorable ne compte que le pattern Stable', () => {
        const ech = { id: 'I', niveaux: [{ code: 'D', min: 50, max: 74 }, { code: 'M', min: 75, max: 100 }], seuilMaitrise: 'M' };
        const { interne, store } = groupe(SIX);
        store.test_indicesPatternsRaI = { a: { pattern: 'Défi spécifique', niveauRai: 1 } };
        const phrase = interne.genererInterpretationPerformance([{ da: 'a', valeur: 0.6 }], ech);
        expect(phrase).not.toContain('progression favorable');
        store.test_indicesPatternsRaI = { a: { pattern: 'Stable', niveauRai: 2 } };
        expect(interne.genererInterpretationPerformance([{ da: 'a', valeur: 0.6 }], ech)).toContain('progression favorable');
    });

    it('les passages hors lot de la liste et des patterns sont encadrés', () => {
        const liste = sansCommentaires(lire('js/etudiants.js'));
        expect(liste.match(/dansUnLotDeCalculs\(\(\) =>/g)).toHaveLength(4);
        expect(tranche(lire('js/profil-etudiant-actions.js'), 'function calculerEtStockerPatternsGroupe(', '\nfunction ')).toContain('demarrerCacheLecture');
        expect(tranche(lire('js/tableau-bord-apercu.js'), 'function afficherNiveauxRaI(', '\nfunction ')).toContain('demarrerCacheLecture');
    });
});

describe('la barre P sans répartition (retouche du lot 1, constat 1)', () => {
    it('deux cas, deux phrases : personne n\'a de note, ou pas d\'échelle unique', () => {
        const { interne } = groupe(SIX);
        expect(interne.phraseSansRepartition(4, 4)).toContain('ne se construit pas encore');
        const sansEchelle = interne.phraseSansRepartition(0, 4);
        expect(sansEchelle).toContain('pas d\'échelle unique');
        expect(sansEchelle).not.toContain('ne se construit pas encore');
        expect(interne.phraseSansRepartition(1, 4)).toContain('1 étudiant·e sans note constructible');
    });

    it('le chemin les appelle dès qu\'il y a des élèves, y compris tous avec une note', () => {
        expect(lire('js/tableau-bord-apercu.js')).toMatch(/else if \(etudiants\.length > 0\) \{\s*interpretationHTML = phraseSansRepartition\(nbSansNote, etudiants\.length\);/);
    });
});

describe('le panneau des seuils (retouche du lot 1, constat 2)', () => {
    const html = lire('index.html');
    it('le bouton lit les défauts à la source : aucune valeur écrite, les trois cases à remplir', () => {
        expect(html).not.toContain('70 · 80 · 85');
        const bouton = html.match(/data-action="restaurerSeuilsInterpretationDefautV2"[\s\S]*?<\/button>/)[0];
        for (const chemin of ['excellent', 'bon', 'acceptable']) expect(bouton).toContain(`data-seuil-depart="${chemin}"`);
        expect(bouton.replace(/data-action="[^"]*"/, '')).not.toMatch(/\d/);
    });

    it('P ne suit plus ces seuils : ni l\'étiquette, ni le paragraphe, ni la bulle ne le disent', () => {
        expect(html).not.toContain('couleur des colonnes A, C, P, M');
        expect(html).not.toContain('Assiduité, Complétion, Performance et Mobilisation');
        expect(lire('js/accompagnement-contenu-hover.js')).not.toContain('Fragile (rouge), Acceptable (jaune), Bon (vert)');
    });

    it('le pack de démo a monté : les repères et les totems arrivent chez qui l\'a déjà ouverte', () => {
        expect(lire('js/pack-demo-10.js')).not.toContain('"version": "21.2"');
    });

    it('le dégradé mort de la barre est parti', () => {
        const regle = lire('styles.css').match(/\.barre-indicateur \{[^}]*\}/)[0];
        expect(regle).not.toContain('linear-gradient');
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
 * Retouches des lots 1 et 2, décision du 11 h 33 comprise, même procédure :
 *   copie en points, la seule échelle de la bibliothèque prêtée : 1 rouge
 *   exclusion de la sommative remise : 3 rouges
 *   repère de maîtrise coupé sur le vrai chemin : 2 rouges
 *   minimum de 6 élèves : 1 rouge
 *   écart-type n : 1 rouge
 *   références du seul groupe actif : 1 rouge
 *   signal d'un groupe hors de l'écran : 1 rouge
 *   garde de la cible non alignée : 1 rouge
 *   progression favorable par le niveau 1 : 1 rouge
 *   barre P muette quand tous ont une note : 1 rouge
 *   la diagnostique compte : 1 rouge
 *   la non recevable garde sa note : 1 rouge
 *   la remplacée compte : 1 rouge
 */
