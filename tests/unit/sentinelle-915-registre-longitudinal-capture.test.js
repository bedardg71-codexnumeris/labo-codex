/**
 * SENTINELLE #915 — REGISTRE LONGITUDINAL, LOT 2 : le sélecteur multi-trimestres et la capture (18 sept. 2026).
 *
 * Ce que le lot tient (cadrage v2, § 4, § 5.2, § 7 lot 2) :
 *   1. les élèves viennent de TOUS les trimestres répertoriés, SAUF la démo ; un DA du collège dans deux trimestres = UNE entrée ;
 *   2. la recherche par nom est insensible à la casse et aux accents ;
 *   3. LA CAPTURE EST EN LECTURE SEULE : une seule écriture, sur `registreLongitudinal`, et le stock de chaque trimestre
 *      (archivé ou non) est identique octet pour octet après la capture ;
 *   4. les indices sont LUS, jamais recalculés : zéro appel à calculerEtStockerIndicesCP (ni à aucun calculerEtStocker*) ;
 *      un indice absent donne null ;
 *   5. le dossier n'emporte que ce DA : évaluations, présences, interventions (notes individuelles réduites à ce DA),
 *      instantanés, indices, portfolio — et les grilles/échelles que SES évaluations référencent, par copie, avec empreinte ;
 *   6. « Inscrire » capture tous les trimestres-cours du DA en un geste ; « Refaire la copie » (#917) remplace le dossier du même
 *      trimestre + cours, garde les autres, ne touche ni inscritLe ni resultatsUlterieurs ;
 *   7. la liste des inscrits montre l'origine et la date de capture.
 *
 * Les gestes du vrai écran (taper, choisir, inscrire à 768 px) sont jugés par le banc WebKit registre-longitudinal-915.spec.js.
 */
import { describe, it, expect } from 'vitest';
import { monter, storeBase } from './_helpers/bac-suivi.js';

const NOM_CLE = 'registreLongitudinal';
const DA = '2000001';   // Alice Assidu : en a2024 (GC1) ET en h2026 (GC3)
const DA2 = '2000002';  // Bruno Absent : a2024 seulement

function stock() {
    const s = storeBase();
    delete s.test_groupeEtudiants; delete s.test_productions; delete s.test_evaluationsSauvegardees; delete s.test_presences;
    delete s.test_grillesTemplates; delete s.test_echellesTemplates; delete s.test_pratiquesConfigurables; delete s.test_modalitesEvaluation; delete s.test_portfoliosEleves;
    Object.assign(s, {
        trimestres: [
            { id: 'a2024', nom: 'Automne 2024', session: 'A', annee: 2024, actif: false, archive: true },
            { id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: true, archive: false },
            { id: 'demo', nom: 'Démo', session: 'A', annee: 2025, actif: false }
        ],
        cours: [{ id: 'C101', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }, { id: 'C102', codeCours: '601-102-MQ', nomCours: 'Littérature et imaginaire' }],
        a2024_groupeEtudiants: [
            { da: DA, nom: 'Assidu', prenom: 'Alice', groupe: '00001', coursId: 'C101', statut: 'actif', programme: '300.A0' },
            { da: DA2, nom: 'Absent', prenom: 'Bruno', groupe: '00001', coursId: 'C101', statut: 'abandon' }
        ],
        h2026_groupeEtudiants: [{ da: DA, nom: 'Assidu', prenom: 'Alice', groupe: '00002', coursId: 'C102' }],
        demo_groupeEtudiants: [{ da: 'DEMO004', nom: 'Jovial', prenom: 'Castor', groupe: 'demo', coursId: 'demo-cours' }],
        a2024_evaluationsSauvegardees: [
            { id: 'E1', etudiantDA: DA, coursId: 'C101', productionId: 'P1', grilleId: 'G1', echelleId: 'ECH1', criteres: [{ id: 'CR1', niveau: 'M' }], dateEvaluation: '2024-10-01T12:00:00.000Z', retroactionFinale: 'Bien.' },
            { id: 'E2', etudiantDA: DA, coursId: 'C101', productionId: 'P2', grilleId: 'G1', echelleId: 'ECH1', criteres: [{ id: 'CR1', niveau: 'D' }], dateEvaluation: '2024-11-01T12:00:00.000Z' },
            { id: 'E3', etudiantDA: DA2, coursId: 'C101', productionId: 'P1', grilleId: 'G2', echelleId: 'ECH1', criteres: [] }
        ],
        h2026_evaluationsSauvegardees: [{ id: 'E4', etudiantDA: DA, coursId: 'C102', productionId: 'P9', grilleId: 'G9', criteres: [] }],
        a2024_grillesTemplates: [
            { id: 'G1', nom: 'SRPNF × IDME', criteres: [{ id: 'CR1', nom: 'Structure', ponderation: 50 }, { id: 'CR2', nom: 'Rigueur', ponderation: 50 }] },
            { id: 'G2', nom: 'Grille de Bruno', criteres: [{ id: 'CRX', nom: 'X' }] }
        ],
        a2024_echellesTemplates: [{ id: 'ECH1', nom: 'IDME', niveaux: [{ nom: 'Incomplet' }, { nom: 'Développement' }, { nom: 'Maîtrise' }, { nom: 'Étendu' }] }, { id: 'ECH2', nom: 'Autre', niveaux: [] }],
        h2026_grillesTemplates: [{ id: 'G9', nom: 'Grille H26', criteres: [] }],
        h2026_echellesTemplates: [],
        a2024_presences: [
            { date: '2024-08-26', da: DA, coursId: 'C101', statut: 'present', heures: 2 },
            { date: '2024-08-28', da: DA, coursId: 'C101', statut: 'absent', heures: 0 },
            { date: '2024-08-26', da: DA2, coursId: 'C101', statut: 'present', heures: 2 }
        ],
        a2024_interventions: [
            { id: 'I1', type: 'groupe', date: '2024-10-15', etudiants: [DA, DA2], notesIndividuelles: { [DA]: 'Alice participe.', [DA2]: 'Bruno absent.' }, titre: 'Atelier' },
            { id: 'I2', type: 'individuel', date: '2024-11-02', etudiants: [DA2], notesIndividuelles: {}, titre: 'Rencontre Bruno' }
        ],
        a2024_snapshots_C101: {
            hebdomadaires: [
                { id: 'SEANCE-2024-09-02', dateSeance: '2024-09-02', numSemaine: 2, etudiants: [{ da: DA, nom: 'Alice Assidu', A: 100, C: 50, P: 70, pattern: 'Stable', rai: 'Niveau 1' }, { da: DA2, nom: 'Bruno Absent', A: 50, C: 0, P: 0 }] },
                { id: 'SEANCE-2024-09-09', dateSeance: '2024-09-09', numSemaine: 3, etudiants: [{ da: DA2, A: 40, C: 0, P: 0 }] }
            ],
            interventions: [{ id: 'I1', date: '2024-10-15', type: 'niveau2', titre: 'Atelier', etudiantsDA: [DA, DA2], avant: { [DA]: { A: 100, C: 50, P: 70 }, [DA2]: { A: 50, C: 0, P: 0 } }, apres: null }],
            metadata: { version: '1.0.0' }
        },
        a2024_indicesCP: { [DA]: { actuel: { date: '2024-12-01', pratique: 'sommative', C: 0.5, P: 0, details: { noteConstructible: false } }, historique: [] } },
        a2024_indicesAssiduite: { sommatif: { [DA]: { indice: 0.9, presences: 27, total: 30 } }, dateCalcul: '2024-12-01' },
        a2024_indicesPatternsRaI: { [DA]: { pattern: 'Stable', palier: 1 } },
        a2024_portfoliosEleves: { [DA]: { PF1: { artefactsRetenus: ['E1'], auto: true } } }
    });
    return s;
}

function banc(store) {
    const appelsCalcul = [];
    const b = monter(store || stock(), {
        modules: ['js/registre-longitudinal.js'],
        objetsExportes: ['registreLongitudinal'],
        globaux: {
            cle: (k) => 'h2026_' + k,
            cleSource: (k, t) => t + '_' + k,
            obtenirTrimestres: () => JSON.parse(JSON.stringify(store ? store.trimestres : stock().trimestres)),
            calculerEtStockerIndicesCP: () => { appelsCalcul.push('calculerEtStockerIndicesCP'); },
            calculerEtStockerIndicesAssiduite: () => { appelsCalcul.push('calculerEtStockerIndicesAssiduite'); },
            calculerTousLesIndices: () => { appelsCalcul.push('calculerTousLesIndices'); return {}; }
        }
    });
    return Object.assign(b, { appelsCalcul, api: b.win.registreLongitudinal, mots: b.win.MOTS_REGISTRE_LONGITUDINAL });
}

const empreinteStock = (store) => JSON.stringify(Object.keys(store).filter((k) => k !== NOM_CLE).sort().map((k) => [k, store[k]]));

describe('#915 lot 2 — les élèves de tous les trimestres, sauf la démo', () => {
    it('un DA du collège présent en A2024 et en H2026 donne UNE entrée à deux présences ; la démo est absente ; tri par nom', () => {
        const b = banc();
        const eleves = b.api.eleves();
        expect(eleves.map((e) => e.da)).toEqual([DA2, DA]);
        expect(eleves.find((e) => e.da === DA).presences).toEqual([
            { trimestreId: 'h2026', trimestreNom: 'Hiver 2026', coursId: 'C102', coursCode: '601-102-MQ', groupe: '00002' },
            { trimestreId: 'a2024', trimestreNom: 'Automne 2024', coursId: 'C101', coursCode: '601-101-MQ', groupe: '00001' }
        ]);
        expect(b.api.trimestres().map((t) => t.id)).toEqual(['h2026', 'a2024']);
        expect(JSON.stringify(eleves)).not.toMatch(/DEMO004|Jovial/);
        expect(b.journal).toEqual([]);
    });

    it('la recherche ignore la casse et les accents, et rend vide ce qui ne matche pas', () => {
        const b = banc();
        expect(b.api.rechercher('ASSIDU').map((e) => e.da)).toEqual([DA]);
        expect(b.api.rechercher('álice').map((e) => e.da)).toEqual([DA]);
        expect(b.api.rechercher('bruno ab').map((e) => e.da)).toEqual([DA2]);
        expect(b.api.rechercher('zzz')).toEqual([]);
        expect(b.api.rechercher('').map((e) => e.da)).toEqual([DA2, DA]);
    });
});

describe('#915 lot 2 — la capture est en LECTURE SEULE, et ne recalcule rien', () => {
    it('une seule écriture, sur registreLongitudinal ; le stock des trimestres (dont l\'archivé) est identique octet pour octet', async () => {
        const store = stock();
        const b = banc(store);
        const avant = empreinteStock(store);
        const issue = await b.api.inscrire(DA);
        expect(issue.ok).toBe(true);
        expect(b.journal.map((j) => j.k)).toEqual([NOM_CLE]);
        expect(empreinteStock(store)).toBe(avant);
        expect(store[NOM_CLE].format).toBe('registre-longitudinal');
        expect(Object.keys(store[NOM_CLE].eleves)).toEqual([DA]);
    });

    it('zéro appel à calculerEtStockerIndicesCP, ni à aucun calculateur, pendant une capture', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.inscrire(DA2);
        expect(b.appelsCalcul).toEqual([]);
    });

    it('un DA qui n\'est dans aucun trimestre est refusé, sans écriture', async () => {
        const b = banc();
        const issue = await b.api.inscrire('9999999');
        expect(issue).toEqual({ ok: false, refus: b.mots.refusInconnu });
        expect(b.journal).toEqual([]);
    });
});

describe('#915 lot 2 — ce que le dossier emporte, et ce qu\'il laisse', () => {
    it('« Inscrire » capture les DEUX trimestres-cours du DA en un geste ; chaque dossier ne porte que ce DA', async () => {
        const b = banc();
        const issue = await b.api.inscrire(DA);
        const fiche = b.store[NOM_CLE].eleves[DA];
        expect(fiche.nom).toBe('Assidu');
        expect(fiche.inscritLe).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(fiche.resultatsUlterieurs).toEqual([]);
        expect(fiche.dossiers.map((d) => d.trimestre + '/' + d.coursId)).toEqual(['h2026/C102', 'a2024/C101']);
        const d = fiche.dossiers.find((x) => x.trimestre === 'a2024');
        expect(d.trimestreNom).toBe('Automne 2024');
        expect(d.coursCode).toBe('601-101-MQ');
        expect(d.groupe).toBe('00001');
        expect(d.statut).toBe('actif');
        expect(d.evaluations.map((e) => e.id)).toEqual(['E1', 'E2']);
        expect(d.evaluations[0].retroactionFinale).toBe('Bien.');
        expect(d.presences.map((p) => p.date)).toEqual(['2024-08-26', '2024-08-28']);
        // Hors interventions (la composition du groupe est un fait de l'intervention), rien de Bruno ne voyage avec Alice.
        expect(JSON.stringify(Object.assign({}, d, { interventions: null }))).not.toMatch(/E3|Bruno|2000002/);
        expect(issue.resume).toMatchObject({ nbDossiers: 2, nbEvaluations: 3, nbSeances: 2, grilles: ['Grille H26', 'SRPNF × IDME'] });
        expect(issue.resume.poidsOctets).toBeGreaterThan(500);
        expect(issue.resume.poidsModelesOctets).toBeGreaterThan(50);
        expect(issue.recapture).toBe(false);
    });

    it('les grilles et échelles copiées sont CELLES que ses évaluations référencent, pas tout le catalogue ; empreinte posée', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        const registre = b.store[NOM_CLE];
        const d = registre.eleves[DA].dossiers.find((x) => x.trimestre === 'a2024');
        // La copie vit UNE fois par trimestre dans modeles (mesuré : 15,5 Ko par dossier sinon) ; le dossier garde les ids.
        expect(d.grillesIds).toEqual(['G1']);
        expect(d.echellesIds).toEqual(['ECH1']);
        expect(d.grilles).toBeUndefined();
        expect(Object.keys(registre.modeles.grilles)).toEqual(['h2026:G9', 'a2024:G1']);
        expect(registre.modeles.grilles['a2024:G1'].criteres).toHaveLength(2);
        expect(Object.keys(registre.modeles.echelles)).toEqual(['a2024:ECH1']);
        expect(JSON.stringify(registre.modeles)).not.toMatch(/G2|ECH2|Grille de Bruno/);
        expect(d.empreinte).toEqual({
            grilles: [{ id: 'G1', nom: 'SRPNF × IDME', nbCriteres: 2, criteres: [{ id: 'CR1', nom: 'Structure' }, { id: 'CR2', nom: 'Rigueur' }] }],
            echelles: [{ id: 'ECH1', nom: 'IDME', niveaux: ['Incomplet', 'Développement', 'Maîtrise', 'Étendu'] }]
        });
    });

    it('interventions : seulement celles où ce DA figure, notes individuelles réduites à lui ; instantanés : ses entrées seules', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        const d = b.store[NOM_CLE].eleves[DA].dossiers.find((x) => x.trimestre === 'a2024');
        expect(d.interventions.map((i) => i.id)).toEqual(['I1']);
        expect(d.interventions[0].notesIndividuelles).toEqual({ [DA]: 'Alice participe.' });
        expect(d.interventions[0].etudiants).toEqual([DA, DA2]); // la composition du groupe est un fait de l'intervention, elle reste
        expect(d.snapshots.hebdomadaires).toEqual([{ id: 'SEANCE-2024-09-02', dateSeance: '2024-09-02', numSemaine: 2, da: DA, nom: 'Alice Assidu', A: 100, C: 50, P: 70, pattern: 'Stable', rai: 'Niveau 1' }]);
        expect(d.snapshots.interventions).toEqual([{ id: 'I1', date: '2024-10-15', type: 'niveau2', titre: 'Atelier', avant: { A: 100, C: 50, P: 70 }, apres: null }]);
        expect(JSON.stringify(d.snapshots)).not.toMatch(/2000002/);
    });

    it('indices LUS tels que stockés (le drapeau noteConstructible voyage) ; absents → null ; portfolio copié', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        const [h26, a24] = b.store[NOM_CLE].eleves[DA].dossiers;
        expect(a24.indices).toEqual({
            cp: { actuel: { date: '2024-12-01', pratique: 'sommative', C: 0.5, P: 0, details: { noteConstructible: false } }, historique: [] },
            assiduite: { indice: 0.9, presences: 27, total: 30 },
            patternsRaI: { pattern: 'Stable', palier: 1 }
        });
        expect(a24.portfolio).toEqual({ PF1: { artefactsRetenus: ['E1'], auto: true } });
        expect(h26.indices).toEqual({ cp: null, assiduite: null, patternsRaI: null });
        expect(h26.portfolio).toBeNull();
        expect(h26.snapshots).toEqual({ hebdomadaires: [], interventions: [] });
        expect(h26.statut).toBeNull();
    });

    it('le dossier ne contient aucun blob : ni fichiersTravaux, ni annotations, ni base64', async () => {
        const store = Object.assign(stock(), { a2024_fichiersTravaux: [{ id: 'F1', etudiantDA: DA, blob: 'data:image/png;base64,AAAA' }], a2024_annotationsTravaux: { F1: { traits: [1, 2, 3] } } });
        const b = banc(store);
        await b.api.inscrire(DA);
        const texte = JSON.stringify(store[NOM_CLE]);
        expect(texte).not.toMatch(/base64|fichiersTravaux|traits/);
    });
});

describe('#915 lot 2 — re-capturer', () => {
    it('remplace le dossier du même trimestre + cours, garde les autres, ne touche ni inscritLe ni resultatsUlterieurs', async () => {
        const store = stock();
        const b = banc(store);
        await b.api.inscrire(DA);
        const fiche1 = JSON.parse(JSON.stringify(store[NOM_CLE].eleves[DA]));
        // Grégoire saisit une note ultérieure et retire l'élève de H2026 (le trimestre est supprimé, disons) ; puis le stock A2024 gagne une évaluation.
        store[NOM_CLE].eleves[DA].inscritLe = '2026-01-01';
        store[NOM_CLE].eleves[DA].resultatsUlterieurs = [{ cours: '601-102-MQ', trimestre: 'H2025', note: 88 }];
        store.h2026_groupeEtudiants = [];
        store.a2024_evaluationsSauvegardees.push({ id: 'E5', etudiantDA: DA, coursId: 'C101', productionId: 'P3', grilleId: 'G1', criteres: [] });
        b.avancer(1000);
        const issue = await b.api.inscrire(DA);
        expect(issue.recapture).toBe(true);
        const fiche2 = store[NOM_CLE].eleves[DA];
        expect(fiche2.inscritLe).toBe('2026-01-01');
        expect(fiche2.resultatsUlterieurs).toEqual([{ cours: '601-102-MQ', trimestre: 'H2025', note: 88 }]);
        expect(fiche2.dossiers.map((d) => d.trimestre)).toEqual(['h2026', 'a2024']); // l'ancien H2026 est GARDÉ, A2024 remplacé
        expect(fiche2.dossiers.find((d) => d.trimestre === 'h2026')).toEqual(fiche1.dossiers.find((d) => d.trimestre === 'h2026'));
        const a24 = fiche2.dossiers.find((d) => d.trimestre === 'a2024');
        expect(a24.evaluations.map((e) => e.id)).toEqual(['E1', 'E2', 'E5']);
        expect(a24.capteLe).not.toBe(fiche1.dossiers.find((d) => d.trimestre === 'a2024').capteLe);
        expect(b.journal.map((j) => j.k)).toEqual([NOM_CLE, NOM_CLE]);
    });
});

describe('#915 lot 2 — l\'écran', () => {
    it('la liste des inscrits montre nom, trimestres d\'origine et date de capture ; le geste inscrire passe par le dispatcher fn(el)', async () => {
        const b = banc();
        await b.win.inscrireEleveLongitudinal({ dataset: { da: DA } });
        b.win.initialiserRegistreLongitudinal();
        const conteneur = b.elements['registre-longitudinal-conteneur'];
        const zoneInscrits = conteneur.children.find((c) => c.id === 'rl-zone-inscrits');
        const liste = zoneInscrits.children.find((c) => c.className === 'rl-eleves');
        expect(liste.children).toHaveLength(1);
        // Lot 3 : le nom et la date vivent dans l'en-tête de la rangée (.rl-eleve-entete).
        const [nom, meta] = liste.children[0].children.find((c) => c.className === 'rl-eleve-entete').children.map((s) => s.textContent);
        expect(nom).toBe('Assidu, Alice');
        expect(meta).toMatch(/^Hiver 2026 · Automne 2024 — Copie du \d{4}-\d{2}-\d{2}$/);
        const zoneRecherche = conteneur.children.find((c) => c.id === 'rl-zone-recherche');
        const champ = zoneRecherche.children.find((c) => c.id === 'rl-recherche');
        expect(champ.type).toBe('search');
        expect(champ.getAttribute('data-on-input')).toBe('rechercherEleveLongitudinal');
    });

    // #917 (retour de Grégoire, 18 sept. 2026, 7 h 16) : « Je ne comprends pas ce que signifie "Re-capturer" et si
    // ça aura des conséquences irréversibles sur mes données antérieures. » Le bouton dit le geste, quitte le style
    // principal une fois l'élève inscrit·e, et le dialogue nomme l'élève, la copie remplacée, et ce qui NE bouge PAS.
    it('#917 · avant : « Inscrire au registre », principal, sans dialogue ; après : « Refaire la copie », secondaire, et le dialogue dit tout', async () => {
        const b = banc();
        b.win.initialiserRegistreLongitudinal();
        // Le harnais ne vide pas `children` sur `textContent = ''` : le bouton courant est le DERNIER rendu.
        const boutonDe = () => b.elements['rl-choix'].children.filter((c) => c.id === 'rl-inscrire').pop();

        b.win.choisirEleveLongitudinal({ dataset: { da: DA } });
        const avant = boutonDe();
        expect(avant.textContent).toBe('Inscrire au registre');
        expect(avant.className).toBe('btn btn-principal');
        expect(avant.getAttribute('data-confirm')).toBeFalsy();

        await b.win.inscrireEleveLongitudinal({ dataset: { da: DA } });
        b.win.choisirEleveLongitudinal({ dataset: { da: DA } });
        const apres = boutonDe();
        expect(apres.textContent).toBe('Refaire la copie');
        expect(apres.className).toBe('btn btn-secondaire');
        const dialogue = apres.getAttribute('data-confirm');
        expect(dialogue).toMatch(/^Refaire la copie du dossier de Assidu, Alice \? La copie du \d{4}-\d{2}-\d{2} sera remplacée/);
        expect(dialogue).toContain('l\'ancienne ne pourra pas être retrouvée');
        expect(dialogue).toContain('Tes trimestres ne sont pas modifiés');
        expect(dialogue).toContain('la date d\'inscription et les résultats ultérieurs sont conservés');
        // Le mot que Grégoire n'a pas compris ne revient nulle part à l'écran.
        expect(JSON.stringify(Object.values(b.mots).filter((m) => typeof m === 'string'))).not.toMatch(/captur/i);
    });

    it('#917 · un dossier sans date de copie : le dialogue le dit sans inventer de date', () => {
        const b = banc();
        const texte = b.mots.confirmerRecapture('Assidu, Alice', '');
        expect(texte).toContain('La copie précédente sera remplacée');
        expect(texte).not.toMatch(/copie du\s+sera/i);
    });

    it('le module ne contient aucun innerHTML', async () => {
        const { readFileSync } = await import('node:fs');
        const path = await import('node:path');
        const { RACINE } = await import('./_helpers/bac-suivi.js');
        expect(readFileSync(path.join(RACINE, 'js/registre-longitudinal.js'), 'utf8')).not.toMatch(/\.innerHTML\s*\+?=|insertAdjacentHTML\(/);
    });
});
