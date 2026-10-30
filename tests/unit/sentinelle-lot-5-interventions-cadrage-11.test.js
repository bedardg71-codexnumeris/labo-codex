/**
 * SENTINELLE — LOT 5 DU CADRAGE 11 : SUIVI › INTERVENTIONS (consigne du 12 septembre 2026, 12 h 05 ; audit du 6 sept., § 5).
 *
 * VERROUILLÉ ICI :
 *   A. « Planifier » n'écrit rien ; « Enregistrer » écrit l'intervention en UNE écriture (il y en avait deux) ; changer
 *      d'onglet sans enregistrer (la liste ré-affichée) ne laisse rien en base ; « Annuler » n'écrit ni ne confirme.
 *      Après « Enregistrer », c'est la base qui répond à l'id, plus le brouillon. Le même chemin sert « + Nouvelle
 *      rencontre » (vue Rencontres, même module).
 *   A'. Le STOCK : une intervention `jamaisSauvegardee: true` d'avant le lot n'est ni rendue ni comptée (liste, compte
 *      par élève), elle est dite en console, et elle n'est JAMAIS effacée — pas même par l'Enregistrer d'une voisine.
 *   B. Le bilan avant / après : avec les seuils par défaut, 0,645 → « D 65 % », et la suggestion d'objectif du même
 *      écran le traite en D (elle vise la borne haute de D, 75 %) ; un seuil déplacé déplace les deux ensemble.
 *      Depuis #551 (13 sept.), la suggestion ne nomme plus de lettre : le couplage se vérifie par le NOMBRE.
 *   C. Les notes individuelles (décision de Grégoire, 11 sept., 17 h 47) : l'élève parti du groupe reste, grisé,
 *      « (n'est plus dans le groupe) » — son nom si sa fiche est encore au trimestre, son DA sinon, « --- » en
 *      anonymisation ; le compteur compte les lignes rendues.
 *   D. Le code retiré reste retiré (cliquet).
 *
 * BREAK-TESTS VÉRIFIÉS le 12 septembre 2026 — journal en fin de fichier.
 */
// ↻ #1152, retouche 2 du lot 5 (29 oct. 2026, plans de travail/VERDICT-RELECTURE-2026-10-29-aide-lot-5.md) : le champ « Séance concernée » (interventionSeance) est retiré.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'fs';
import { monter, storeBase, elementDom, echelleAReperes, globauxEchelle, copieSurEchelle } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

// 30 oct. 2026 : l'échelle des copies du groupe fait foi, plus 0,64 / 0,75 / 0,85. Le banc pose la sienne.
const ECHELLE_DEFAUT = echelleAReperes();
const globaux = (echelle, moyenne) => ({
    ...globauxEchelle(echelle),
    determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
    calculerMoyennesCriteres: () => ({ structure: moyenne }), obtenirGrilleReferenceDepistage: () => ({ criteres: [{ nom: 'Structure', niveauSOLO: 'multi' }] }),
    libelleNiveauSOLO: () => '', calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
});
const champs = () => ({ interventionNiveau: elementDom({ value: '2' }), interventionContexte: elementDom({ value: 'hors-classe' }), interventionTitre: elementDom({ value: 'Rattrapage' }),
    interventionDate: elementDom({ value: '2026-09-12' }), interventionHeure: elementDom({ value: '' }), interventionDuree: elementDom({ value: '2' }),
    interventionDescription: elementDom({ value: '' }), observationsIntervention: elementDom({ value: '' }), objectifVise: elementDom({ value: '' }) });
const selecteurs = () => ({ '#listeEtudiantsIntervention input[type="checkbox"]': [], '#listeEtudiantsIntervention input[type="checkbox"]:checked': [],
    'input[name="interventionStatut"]:checked': elementDom({ value: 'en-cours' }), '#criteresCiblesContainer .critere-cible-cb:checked': [] });
const intervention = (extra) => Object.assign({ id: 'I', titre: 'T', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'hors-classe',
    description: '', etudiants: [], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [], objectifVise: '', bilan: null, statut: 'en-cours', groupeCoursId: 'GC1' }, extra);

function banc({ interventions = [], vue = 'interventions', echelle = ECHELLE_DEFAUT, moyenne = 0.645, store } = {}) {
    store = store || storeBase();
    store.test_interventions = interventions;
    store.test_evaluationsSauvegardees = [...(store.test_evaluationsSauvegardees || []), copieSurEchelle(echelle)];
    const b = monter(store, { modules: ['js/interventions.js'], globaux: globaux(echelle, moyenne),
        elements: Object.assign({ conteneurPrincipal: elementDom(), conteneurRencontres: elementDom(), listeInterventions: elementDom(), listeRencontres: elementDom() }, champs()),
        selecteurs: selecteurs() });
    b.win.definirVocabulaireInterventions(vue);
    b.conteneur = () => b.document.getElementById(vue === 'rencontres' ? 'conteneurRencontres' : 'conteneurPrincipal');
    b.liste = () => b.document.getElementById(vue === 'rencontres' ? 'listeRencontres' : 'listeInterventions').innerHTML;
    b.ecritures = () => b.journal.filter(j => j.k === 'test_interventions').length;
    b.idDuFormulaire = () => (b.conteneur().innerHTML.match(/data-action="sauvegarderPresencesIntervention" data-param="([^"]+)"/) || [])[1];
    return b;
}

afterEach(() => { vi.restoreAllMocks(); });

// ─────────────────────────────────────────────────────────────────────────────
describe('A · « Planifier » n\'écrit rien ; « Enregistrer » écrit, une fois', () => {
    for (const vue of ['interventions', 'rencontres']) {
        it(`vue ${vue} : Planifier → 0 écriture, rien en base ; Enregistrer → une intervention, UNE écriture`, () => {
            const b = banc({ vue });
            b.win.afficherFormulaireIntervention();
            const id = b.idDuFormulaire();
            expect(id, 'le formulaire de création est rendu').toBeTruthy();
            expect(b.ecritures(), 'Planifier n\'écrit rien').toBe(0);
            expect(b.store.test_interventions).toEqual([]);
            expect(b.win.obtenirIntervention(id), 'le formulaire relit son brouillon par l\'id').not.toBeNull();
            b.win.sauvegarderPresencesIntervention(id);
            expect(b.ecritures(), 'une seule écriture complète').toBe(1);
            expect(b.store.test_interventions.map(i => i.id)).toEqual([id]);
            const i = b.store.test_interventions[0];
            expect(i.titre).toBe('Rattrapage');
            expect(i.groupeCoursId, 'l\'estampille de naissance (#834) passe par le brouillon').toBe('GC1');
            expect('jamaisSauvegardee' in i, 'le drapeau fantôme n\'est plus écrit').toBe(false);
        });
    }

    it('après Enregistrer, c\'est la base qui répond à l\'id — plus le brouillon', () => {
        const b = banc();
        b.win.afficherFormulaireIntervention();
        const id = b.idDuFormulaire();
        b.win.sauvegarderPresencesIntervention(id);
        const t = b.store.test_interventions; t[0].titre = 'Modifiée ailleurs'; b.store.test_interventions = t;
        expect(b.win.obtenirIntervention(id).titre).toBe('Modifiée ailleurs');
        b.win.sauvegarderPresencesIntervention(id);   // rouvrir et enregistrer : pas de doublon
        expect(b.store.test_interventions.map(i => i.id)).toEqual([id]);
    });

    // Relecture croisée de Cowork (12 sept. 2026, 13 h 10) : « Intervention enregistrée » s'affichait même quand rien n'était écrit.
    // ↻ Lot E3 (D0 point 2, 28 sept. 2026) : le refus se dit par le témoin commun, plus par un panneau d'erreur.
    const temoin = (b) => { b.win.temoinEnregistrement = { nonEnregistre: vi.fn(), enregistre: vi.fn() };
        b.win.raisonPourTemoin = (r) => { const t = String(r || '').trim(); const d = t.charAt(0).toLowerCase() + t.slice(1); return /[.!?]$/.test(d) ? d : d + '.'; };
        return b.win.temoinEnregistrement; };

    it('un id ni en base ni en brouillon : zéro écriture, AUCUNE notification de succès, le témoin le dit', () => {
        const erreurConsole = vi.spyOn(console, 'error').mockImplementation(() => {});
        const b = banc({ interventions: [intervention({ id: 'I_OK' })] });
        const t = temoin(b);
        b.win.sauvegarderPresencesIntervention('I_INCONNU');
        expect(b.ecritures()).toBe(0);
        expect(b.notifs.filter(n => n.type === 'succes')).toEqual([]);
        expect(t.nonEnregistre).toHaveBeenCalledWith('intervention non trouvée.', 'Modifier l\'intervention', 'test_interventions');
        expect(erreurConsole).toHaveBeenCalled();
        expect(b.store.test_interventions.map(i => i.id)).toEqual(['I_OK']);
    });

    it('« Créer » sur un brouillon déjà fermé : rien n\'est écrit, rien n\'est annoncé comme enregistré', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const b = banc({ vue: 'rencontres' });
        const t = temoin(b);
        b.win.afficherFormulaireIntervention();
        const id = b.idDuFormulaire();
        await b.win.fermerFicheIntervention(id);
        b.win.sauvegarderPresencesIntervention(id);
        expect(b.ecritures()).toBe(0);
        expect(b.store.test_interventions).toEqual([]);
        expect(b.notifs.filter(n => n.type === 'succes')).toEqual([]);
        expect(t.nonEnregistre).toHaveBeenCalledWith('rencontre introuvable.', 'Modifier la rencontre', 'test_interventions');
    });

    it('changer d\'onglet sans enregistrer : la liste ré-affichée ne montre rien, et rien n\'a été écrit', () => {
        const b = banc({ interventions: [intervention({ id: 'I_OK', titre: 'Déjà là' })] });
        b.win.afficherFormulaireIntervention();
        const id = b.idDuFormulaire();
        b.win.afficherListeInterventions();   // l'observateur de la sous-section, au retour
        expect(b.ecritures()).toBe(0);
        expect(b.store.test_interventions.map(i => i.id)).toEqual(['I_OK']);
        expect(b.liste()).toContain('I_OK');
        expect(b.liste()).not.toContain(id);
    });

    // ↻ Lot E3 (D3) : « Annuler » devient « Fermer » ; la question de sortie (ui-dialogues) n'est pas chargée ici.
    it('« Fermer » : le brouillon est jeté — aucune écriture, aucune confirmation', async () => {
        const b = banc();
        b.win.afficherFormulaireIntervention();
        const id = b.idDuFormulaire();
        expect(b.conteneur().innerHTML).toContain('data-action="fermerFicheIntervention" data-param="' + id + '"');
        await b.win.fermerFicheIntervention(id);
        expect(b.ecritures()).toBe(0);
        expect(b.confirmations).toEqual([]);
        expect(b.win.obtenirIntervention(id)).toBeNull();
    });
});

describe('A\' · le stock : un brouillon d\'avant le lot, resté en base', () => {
    const avecFantome = () => [
        intervention({ id: 'I_OK', titre: 'Enregistrée', etudiants: ['2000001'] }),
        intervention({ id: 'I_FANTOME', titre: 'Fantôme', etudiants: ['2000001'], statut: 'planifiee', jamaisSauvegardee: true })
    ];
    it('ni rendu, ni compté, dit en console — et jamais effacé, même par l\'Enregistrer d\'une voisine', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const b = banc({ interventions: avecFantome() });
        b.win.afficherListeInterventions();
        expect(b.liste()).toContain('I_OK');
        expect(b.liste()).not.toContain('I_FANTOME');
        expect(b.win.obtenirInterventionsEtudiant('2000001').map(i => i.id)).toEqual(['I_OK']);
        expect(warn.mock.calls.some(c => /1 brouillon/.test(String(c[0]))), 'dit en console').toBe(true);
        expect(b.ecritures(), 'rien n\'est purgé').toBe(0);
        b.win.sauvegarderPresencesIntervention('I_OK');
        expect(b.store.test_interventions.map(i => i.id).sort()).toEqual(['I_FANTOME', 'I_OK']);
        expect(b.store.test_interventions.find(i => i.id === 'I_FANTOME').jamaisSauvegardee).toBe(true);
    });
});

describe('B · le bilan lit les mêmes repères que la suggestion d\'objectif', () => {
    const complete = () => intervention({ id: 'I_B', titre: 'Fini', etudiants: ['2000001'], criteresCibles: ['Structure'], statut: 'completee',
        snapshotAvant: { 2000001: { P: 60, criteres: { structure: 0.645 } } } });
    const cellules = (html) => [...html.matchAll(/<td style="padding: 6px 12px; text-align: center;">([IDME—]) (\d+)\u00A0%<\/td>/g)].map(m => m[1] + ' ' + m[2]);
    const suggerer = (b) => {
        b.selecteurs['#listeEtudiantsIntervention input[type="checkbox"]:checked'] = [elementDom({ value: '2000001', checked: true })];
        b.selecteurs['.critere-cible-cb:checked'] = [elementDom({ value: 'Structure', checked: true })];
        b.win.suggererObjectifIntervention('I_B');
        return b.document.getElementById('objectifVise').value;
    };

    // Le couplage : la suggestion vise le seuil qui borne PAR LE HAUT le niveau que le bilan affiche. Il passait par la
    // lettre (« D » au bilan ⇔ « au seuil M ») ; la lettre retirée de la suggestion (#551), il passe par le nombre : la
    // cible attendue se DÉDUIT de la lettre lue dans le bilan et des plages de l'échelle du banc, pas d'une chaîne recopiée.
    const cibleAuDessusDe = (lettre, echelle) => {
        const i = echelle.niveaux.findIndex((n) => n.code === lettre);
        return echelle.niveaux[i + 1].min;
    };
    const suggestionAttendue = (bilan, echelle) => 'Amener Structure à ' + cibleAuDessusDe(bilan[0][0], echelle) + '\u00A0%';

    it('D à partir de 65 : 0,645 → « D 65 % » avant ET après ; la suggestion vise la borne haute de D (75 %)', () => {
        const b = banc({ interventions: [complete()] });
        b.win.ouvrirIntervention('I_B');
        const bilan = cellules(b.conteneur().innerHTML);
        expect(bilan).toEqual(['D 65', 'D 65']);
        expect(suggerer(b)).toBe(suggestionAttendue(bilan, ECHELLE_DEFAUT));
        expect(suggerer(b)).toBe('Amener Structure à 75\u00A0%');   // le texte approuvé, figé
    });

    it('le repère de suffisance déplacé à 66 : le bilan dit « I 65 % » et la suggestion vise 66 % — les deux ensemble', () => {
        const echelle = echelleAReperes({ plages: [['I', 0, 65], ['D', 66, 74], ['M', 75, 84], ['E', 85, 100]] });
        const b = banc({ interventions: [complete()], echelle });
        b.win.ouvrirIntervention('I_B');
        const bilan = cellules(b.conteneur().innerHTML);
        expect(bilan).toEqual(['I 65', 'I 65']);
        expect(suggerer(b)).toBe(suggestionAttendue(bilan, echelle));
        expect(suggerer(b)).toBe('Amener Structure à 66\u00A0%');
    });

    it('la lettre suit le pourcentage affiché : 0,8449 s\'affiche « 84 % » et se lit M ; 0,845 s\'affiche « 85 % » et se lit E', () => {
        const b1 = banc({ interventions: [intervention(Object.assign(complete(), { snapshotAvant: { 2000001: { P: 60, criteres: { structure: 0.8449 } } } }))], moyenne: 0.845 });
        b1.win.ouvrirIntervention('I_B');
        expect(cellules(b1.conteneur().innerHTML)).toEqual(['M 84', 'E 85']);
    });
});

describe('C · la note d\'un élève parti du groupe reste, grisée', () => {
    const avecNotes = () => [intervention({ id: 'I_N', titre: 'Notes', etudiants: ['2000001', '2000004', '2999999'],
        notesIndividuelles: { 2000001: 'a', 2000004: 'd', 2999999: 'z' } })];
    const blocNotes = (b) => { b.win.afficherListeInterventions(); const h = b.liste(); return tranche(h, 'Notes individuelles'); };

    it('dans le groupe : son nom ; parti vers un autre groupe du trimestre : son nom, grisé ; plus au trimestre : son DA, grisé ; compteur 3', () => {
        const bloc = blocNotes(banc({ interventions: avecNotes() }));
        expect(bloc).toContain('<strong>Alice Assidu:</strong> a');
        expect(bloc).toContain('<strong>Dario Dautre</strong> (n\'est plus dans le groupe) : d');
        expect(bloc).toContain('<strong>2999999</strong> (n\'est plus dans le groupe) : z');
        expect((bloc.match(/<div class="etud-texte-gris-clair"/g) || []).length).toBe(2);
        expect((bloc.match(/<strong>(\d+)<\/strong>/) || [])[1]).toBe('3');
    });

    it('en anonymisation : ni le nom ni le DA d\'un élève parti — « --- »', () => {
        const store = storeBase(); store.modeApplication = 'anonymisation';
        const bloc = blocNotes(banc({ interventions: avecNotes(), store }));
        expect(bloc).toContain('<strong>---</strong> (n\'est plus dans le groupe) : d');
        expect(bloc).toContain('<strong>---</strong> (n\'est plus dans le groupe) : z');
        expect(bloc).not.toContain('Dario');
        expect(bloc).not.toContain('2000004');
        expect(bloc).not.toContain('2999999');
        expect((bloc.match(/<strong>(\d+)<\/strong>/) || [])[1]).toBe('3');
    });
});

describe('D · le code retiré reste retiré (cliquet)', () => {
    it('ni creerIntervention, ni marquerPresences, ni completerIntervention, ni afficherNotesIndividuelles, ni drapeau fantôme posé', () => {
        const src = readFileSync(new URL('../../js/interventions.js', import.meta.url), 'utf8');
        const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        for (const nom of ['creerIntervention', 'marquerPresences', 'completerIntervention', 'afficherNotesIndividuelles', 'notesIndividuellesContainer']) {
            expect(code, nom).not.toMatch(new RegExp('\\b' + nom + '\\b'));
        }
        expect(code).not.toMatch(/jamaisSauvegardee\s*[:=]\s*true/);
        const b = banc();
        for (const nom of ['creerIntervention', 'marquerPresences', 'completerIntervention']) expect(typeof b.win[nom], nom).toBe('undefined');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// JOURNAL DES BREAK-TESTS (12 septembre 2026, vers 13 h) — chaque mutation posée sur js/interventions.js (témoin : une
// occurrence exacte du motif), cette sentinelle lancée (reporter JSON), le fichier remis (empreinte sha256 identique).
//   M1  « Planifier » écrit le brouillon en base                         → 4 rouges (A ×2, onglet, Annuler)
//   M2  le brouillon n'est pas remis à null après Enregistrer            → 1 rouge (la base répond à l'id)
//   M3  « Annuler » supprime en base (le code d'avant)                   → 1 rouge
//   M4  le brouillon d'avant le lot redevient lisible                    → 1 rouge (le stock)
//   M5  la purge revient au ré-affichage de la liste                     → 5 rouges
//   M6  la double écriture revient à l'enregistrement                    → 2 rouges (A ×2)
//   M7  les lettres du bilan en clair (0,85 / 0,75 / 0,65)               → 1 rouge
//   M8  la lettre calculée sur la moyenne non arrondie                   → 1 rouge (84 % / 85 %)
//   M9  la note d'un élève parti n'est plus rendue                       → 2 rouges
//   M10 la fiche brute (non anonymisée) lue en anonymisation             → 1 rouge
//   M11 le DA affiché en anonymisation                                   → 1 rouge
//   M12 la mention « (n'est plus dans le groupe) » retirée               → 2 rouges
//   M13 cliquet : completerIntervention ressuscitée                      → 1 rouge
// Relecture croisée de Cowork (13 h 10) — la garde d'un id introuvable, deux essais neufs :
//   M14 la garde neutralisée (`if (false)`)                              → 2 rouges
//   M15 le code d'avant : la liste et « enregistrée » sans écriture       → 2 rouges
// NON COUVERT, nommé : la pré-coche des critères en défi sur un brouillon (`mettreAJourCriteresCibles`, même
// condition qu'avant — `jamaisSauvegardee` devenu `_estBrouillon`) ; le compteur des notes qui comptait une entrée
// VIDE (#772 efface déjà une note vidée à l'enregistrement : mutation équivalente sur les données réelles).
