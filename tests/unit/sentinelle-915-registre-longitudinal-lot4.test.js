/**
 * SENTINELLE #915 — REGISTRE LONGITUDINAL, LOT 4 : le dossier déplié (18 sept. 2026).
 *
 * Ce que le lot tient (cadrage v2, § 5.3) :
 *   1. sous chaque inscrit·e, un <details> « Voir le dossier », replié par défaut ; un bloc par trimestre-cours ;
 *   2. les indices sont ÉCRITS TELS QUE RANGÉS, à la bonne échelle — MESURÉ dans indices.js le 18 sept. : A sur 0-1
 *      (indicesAssiduite.sommatif[da].indice), C et P sur 0-100 (indicesCP[da].actuel), `noteConstructible` sur `actuel` ;
 *      un indice absent se dit, une note non constructible se dit : jamais un 0 trompeur, jamais « 5000 % » ;
 *   3. les évaluations en ordre chronologique, critère par critère, avec le libellé du niveau lu dans l'échelle COPIÉE au
 *      registre : si l'échelle du trimestre change après la copie, le dossier ne change pas ;
 *   4. AUCUN calcul d'indice, AUCUNE écriture : déplier est un rendu ;
 *   5. la rétroaction (texte libre de l'enseignant·e) passe par textContent : aucun chemin vers le HTML.
 *
 * Le rendu à 768 px, dans les deux modes, cibles ≥ 44 px : banc WebKit registre-longitudinal-915.spec.js (R5).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';

const NOM_CLE = 'registreLongitudinal';
const DA = '2000001';
const DA2 = '2000002';

function stock() {
    const s = storeBase();
    Object.keys(s).filter((k) => k.startsWith('test_')).forEach((k) => delete s[k]);
    Object.assign(s, {
        trimestres: [
            { id: 'a2025', nom: 'Automne 2025', session: 'A', annee: 2025, actif: true, archive: true },
            { id: 'h2026', nom: 'Hiver 2026', session: 'H', annee: 2026, actif: false, archive: false }
        ],
        cours: [{ id: 'C101', codeCours: '601-101-MQ', nomCours: 'Écriture et littérature' }],
        a2025_groupeEtudiants: [
            { da: DA, nom: 'Assidu', prenom: 'Alice', groupe: '00001', coursId: 'C101', statut: 'actif', programme: '300.A0' },
            { da: DA2, nom: 'Absent', prenom: 'Bruno', groupe: '00001', coursId: 'C101' }
        ],
        h2026_groupeEtudiants: [{ da: DA, nom: 'Assidu', prenom: 'Alice', groupe: '00002', coursId: 'C101' }],
        // La forme RÉELLE d'une évaluation rangée (relevée dans le pack démo) : critereNom, niveauSelectionne (un CODE).
        a2025_evaluationsSauvegardees: [
            { id: 'E2', etudiantDA: DA, coursId: 'C101', productionNom: 'Artefact 2', grilleId: 'G1', grilleNom: 'Grille-5', echelleId: 'ECH1', dateEvaluation: '2025-11-03T15:00:00.000Z',
                criteres: [{ critereId: 'CR1', critereNom: 'Structure', niveauSelectionne: 'M' }], noteFinale: 78.5, niveauFinal: 'M' },
            { id: 'E1', etudiantDA: DA, coursId: 'C101', productionNom: 'Artefact 1', grilleId: 'G1', grilleNom: 'Grille-5', echelleId: 'ECH1', dateEvaluation: '2025-10-01T15:00:00.000Z',
                criteres: [{ critereId: 'CR1', critereNom: 'Structure', niveauSelectionne: 'D' }, { critereId: 'CR2', critereNom: 'Rigueur', niveauSelectionne: 'Z' }],
                noteFinale: 66, niveauFinal: 'D', remplaceeParId: 'E2', retroactionFinale: 'Tu commences à dégager <img src=x onerror=alert(1)> les intentions.' },
            { id: 'E9', etudiantDA: DA2, coursId: 'C101', productionNom: 'Artefact 1', grilleId: 'G1', echelleId: 'ECH1', criteres: [] }
        ],
        a2025_grillesTemplates: [{ id: 'G1', nom: 'Grille-5', criteres: [{ id: 'CR1', nom: 'Structure' }, { id: 'CR2', nom: 'Rigueur' }] }],
        a2025_echellesTemplates: [{ id: 'ECH1', nom: 'IDME', niveaux: [{ code: 'I', nom: 'Incomplet ou insuffisant' }, { code: 'D', nom: 'En Développement' }, { code: 'M', nom: 'Maîtrisé' }] }],
        // Les échelles RÉELLES au stockage : C et P sur 0-100, A sur 0-1.
        a2025_indicesCP: { [DA]: { actuel: { date: '2025-12-01', pratique: 'sommative', C: 50, P: 70.4, noteConstructible: true }, historique: [] } },
        a2025_indicesAssiduite: { sommatif: { [DA]: { indice: 0.9, periodesPresentes: 27, periodesOffertes: 30, nombreSeances: 15 } } }
    });
    return s;
}

function banc(store) {
    store = store || stock();
    const appelsCalcul = [];
    const b = monter(store, {
        modules: ['js/registre-longitudinal.js'],
        objetsExportes: ['registreLongitudinal'],
        globaux: {
            cle: (k) => 'a2025_' + k,
            cleSource: (k, t) => t + '_' + k,
            obtenirTrimestres: () => JSON.parse(JSON.stringify(store.trimestres)),
            calculerEtStockerIndicesCP: () => { appelsCalcul.push('CP'); },
            calculerTousLesIndices: () => { appelsCalcul.push('tous'); return {}; }
        }
    });
    return Object.assign(b, { appelsCalcul, api: b.win.registreLongitudinal, mots: b.win.MOTS_REGISTRE_LONGITUDINAL });
}

const texteDe = (el) => [el.textContent].concat((el.children || []).map(texteDe)).filter(Boolean).join(' | ');
const tous = (el, test, trouves = []) => { if (test(el)) trouves.push(el); (el.children || []).forEach((c) => tous(c, test, trouves)); return trouves; };
const dernier = (zone, classe) => zone.children.filter((c) => c.className === classe).pop();
/** Le <details> du dossier d'un·e inscrit·e, dans le DERNIER rendu de la liste. */
function dossierDe(b, da) {
    const liste = dernier(b.elements['registre-longitudinal-conteneur'].children.find((c) => c.id === 'rl-zone-inscrits'), 'rl-eleves');
    const li = liste.children.find((x) => x.dataset.da === da);
    return li.children.find((c) => c.className === 'rl-dossier');
}

describe('#915 lot 4 — les indices, tels que rangés, à la bonne échelle', () => {
    it('A sur 0-1 et C, P sur 0-100 : « 90 % (27 sur 30 périodes) », « 50 % », « 70 % » — jamais « 5000 % » ni « 1 % »', () => {
        const b = banc();
        expect(b.api.lignesIndices({
            assiduite: { indice: 0.9, periodesPresentes: 27, periodesOffertes: 30, nombreSeances: 15 },
            cp: { actuel: { C: 50, P: 70.4, noteConstructible: true } }
        })).toEqual(['Assiduité : 90 % (27 sur 30 périodes)', 'Complétion : 50 %', 'Performance : 70 %']);
        expect(b.api.lignesIndices({ assiduite: 1, cp: { actuel: { C: 100, P: 0 } } })).toEqual(['Assiduité : 100 %', 'Complétion : 100 %', 'Performance : 0 %']);
    });

    it('une note non constructible se DIT (sur `actuel` comme dans `details`) : pas de 0 trompeur', () => {
        const b = banc();
        for (const actuel of [{ C: 40, P: 0, noteConstructible: false }, { C: 40, P: 0, details: { noteConstructible: false } }]) {
            expect(b.api.lignesIndices({ assiduite: { indice: 0.5 }, cp: { actuel } })[2]).toBe('Performance : note impossible à calculer au moment de la copie');
        }
    });

    it('un indice absent à la copie se dit, pour chacun des trois', () => {
        const b = banc();
        expect(b.api.lignesIndices({ assiduite: null, cp: null })).toEqual([
            'Assiduité : ' + b.mots.indiceAbsent, 'Complétion : ' + b.mots.indiceAbsent, 'Performance : ' + b.mots.indiceAbsent
        ]);
        expect(b.api.lignesIndices(undefined)).toHaveLength(3);
    });
});

describe('#915 lot 4 — le dossier déplié', () => {
    it('« Voir le dossier », replié par défaut ; un bloc par trimestre-cours, avec origine, date de copie, statut et programme', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        b.win.initialiserRegistreLongitudinal();
        const dossier = dossierDe(b, DA);
        expect(dossier.tagName).toBe('DETAILS');
        expect(dossier.hasAttribute('open')).toBe(false);
        expect(dossier.children[0].tagName).toBe('SUMMARY');
        expect(dossier.children[0].textContent).toBe('Voir le dossier');
        expect(dossier.children[0].className).toBe('rl-cible');
        const blocs = dossier.children.filter((c) => c.className === 'rl-dossier-bloc');
        expect(blocs).toHaveLength(2);
        const a25 = blocs.find((x) => texteDe(x).includes('Automne 2025'));
        expect(texteDe(a25)).toMatch(/Automne 2025 \(601-101-MQ, gr\. 00001\) \| Copie du \d{4}-\d{2}-\d{2} · statut : actif · programme : 300\.A0/);
        expect(texteDe(a25)).toContain('Indices au moment de la copie | Assiduité : 90 % (27 sur 30 périodes) | Complétion : 50 % | Performance : 70 %');
        // L'autre trimestre : aucune évaluation, aucun indice — et l'écran le dit, sans rien inventer.
        const h26 = blocs.find((x) => texteDe(x).includes('Hiver 2026'));
        expect(texteDe(h26)).toContain('Évaluations (0) | Aucune évaluation dans cette copie.');
        expect(texteDe(h26)).toContain('Performance : ' + b.mots.indiceAbsent);
    });

    it('les évaluations en ordre CHRONOLOGIQUE, critère par critère, niveau = code + libellé de l\'échelle copiée ; un code inconnu reste un code', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        b.win.initialiserRegistreLongitudinal();
        const evaluations = tous(dossierDe(b, DA), (el) => el.className === 'rl-evaluation');
        expect(evaluations.map((li) => li.children[0].textContent)).toEqual(['Artefact 1 — 2025-10-01', 'Artefact 2 — 2025-11-03']); // rangées E2 puis E1 au stock
        expect(evaluations[0].children[1].textContent).toBe('Note : 66 · D — En Développement · Grille-5 · remplacée par une reprise');
        expect(evaluations[1].children[1].textContent).toBe('Note : 78,5 · M — Maîtrisé · Grille-5');
        const criteres = evaluations[0].children.find((c) => c.className === 'rl-criteres').children.map((c) => c.textContent);
        expect(criteres).toEqual(['Structure : D — En Développement', 'Rigueur : Z']);
        expect(texteDe(dossierDe(b, DA))).not.toContain('Artefact 1 — 2025-10-01 | Note : 66 · D — En Développement · Grille-5 | '); // la mention « remplacée » n'est pas optionnelle
    });

    it('le libellé est celui de LA COPIE : l\'échelle du trimestre renommée après coup ne change pas le dossier', async () => {
        const store = stock();
        const b = banc(store);
        await b.api.inscrire(DA);
        store.a2025_echellesTemplates[0].niveaux[1].nom = 'RENOMMÉ APRÈS LA COPIE';
        b.win.initialiserRegistreLongitudinal();
        const texte = texteDe(dossierDe(b, DA));
        expect(texte).toContain('Structure : D — En Développement');
        expect(texte).not.toContain('RENOMMÉ');
    });

    it('la rétroaction : repliée, en textContent — une balise tapée par l\'enseignant·e reste du texte', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        b.win.initialiserRegistreLongitudinal();
        const [retro] = tous(dossierDe(b, DA), (el) => el.className === 'rl-retroaction');
        expect(retro.tagName).toBe('DETAILS');
        expect(retro.children[0].textContent).toBe('Rétroaction');
        expect(retro.children[0].className).toBe('rl-cible');
        expect(retro.children[1].textContent).toBe('Tu commences à dégager <img src=x onerror=alert(1)> les intentions.');
        expect(retro.children[1].innerHTML).toBe('');
        expect(readFileSync(path.join(RACINE, 'js/registre-longitudinal.js'), 'utf8')).not.toMatch(/\.innerHTML\s*\+?=|insertAdjacentHTML\(/);
    });

    it('déplier est un RENDU : zéro écriture, zéro appel à un calculateur d\'indices', async () => {
        const b = banc();
        await b.api.inscrire(DA);
        await b.api.inscrire(DA2);
        b.journal.length = 0;
        b.win.initialiserRegistreLongitudinal();
        expect(b.journal).toEqual([]);
        expect(b.appelsCalcul).toEqual([]);
        // Bruno : une évaluation sans date ni note ni critère — le rendu tient, sans « undefined ».
        const texte = texteDe(dossierDe(b, DA2));
        expect(texte).toContain('Artefact 1');
        expect(texte).not.toMatch(/undefined|null|NaN/);
    });

    it('un·e inscrit·e sans dossier (registre du lot 1) : pas de <details> vide', () => {
        const store = stock();
        store[NOM_CLE] = { format: 'registre-longitudinal', version: 1, modeles: { grilles: {}, echelles: {} }, eleves: { [DA]: { da: DA, nom: 'Assidu', prenom: 'Alice', inscritLe: '2026-09-17' } } };
        const b = banc(store);
        b.win.initialiserRegistreLongitudinal();
        expect(dossierDe(b, DA)).toBeUndefined();
    });
});
