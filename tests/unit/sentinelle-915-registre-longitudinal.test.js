/**
 * SENTINELLE #915 — REGISTRE LONGITUDINAL, LOT 1 : la clé, le module, le sous-onglet, l'écran vide (17 sept. 2026).
 *
 * Ce que le lot tient (cadrage v2, § 3, § 5.1, § 7 lot 1) :
 *   1. `registreLongitudinal` est inscrite à CLES_GLOBALES (trimestres.js) — jamais préfixée, aucun avertissement de cle() ;
 *   2. le septième sous-onglet du Labo existe : config.js (après « Bilan réflexif », nom tranché « Suivi longitudinal »),
 *      navigation.js (INITIALISATEURS_SOUS_SECTION, voie canonique), index.html (conteneur + script) ;
 *   3. l'ouverture du sous-onglet LIT et n'écrit RIEN — ni la clé du registre, ni ailleurs ;
 *   4. un registre absent, étranger ou d'un autre format se lit comme vide, sans semis ;
 *   5. le rendu vient du DOM (aucun innerHTML), les inscrits sont triés par nom puis prénom.
 *
 * Les lots suivants ajoutent leurs propres essais (capture octet pour octet, zéro appel à calculerEtStockerIndicesCP…).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, RACINE } from './_helpers/bac-suivi.js';
import { tranche } from './_helpers/tranche.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const NOM_CLE = 'registreLongitudinal';

function banc(store) {
    const appelsCle = [];
    const b = monter(store || storeBase(), {
        modules: ['js/registre-longitudinal.js'],
        objetsExportes: ['registreLongitudinal'],
        globaux: { cle: (k) => { appelsCle.push(k); return 'test_' + k; } }
    });
    return Object.assign(b, { appelsCle, api: b.win.registreLongitudinal, mots: b.win.MOTS_REGISTRE_LONGITUDINAL });
}

const registre = (eleves) => ({ format: 'registre-longitudinal', version: 1, eleves });

describe('#915 lot 1 — la clé est globale, et reconnue comme telle', () => {
    it('trimestres.js : registreLongitudinal figure dans CLES_GLOBALES', () => {
        const src = lire('js/trimestres.js');
        const bloc = tranche(src, 'const CLES_GLOBALES = [', 'const CLES_TEMPLATES_ARCHIVES');
        expect(bloc).toMatch(/'registreLongitudinal'/);
        // et PAS dans CLES_NAMESPACEES : elle serait préfixée par le trimestre actif.
        const ns = tranche(src, 'const CLES_NAMESPACEES = [', 'const CLES_GLOBALES = [');
        expect(ns).not.toMatch(/registreLongitudinal/);
    });

    it('le module lit la clé NUE et ne passe jamais par cle() : rien à préfixer', () => {
        const b = banc(Object.assign(storeBase(), { [NOM_CLE]: registre({ '2000001': { da: '2000001', nom: 'Assidu', prenom: 'Alice', inscritLe: '2026-09-17' } }) }));
        expect(b.api.NOM_CLE).toBe(NOM_CLE);
        expect(b.api.inscrits().map((e) => e.da)).toEqual(['2000001']);
        expect(b.appelsCle).toEqual([]);
    });
});

describe('#915 lot 1 — le septième sous-onglet du Labo', () => {
    it('config.js : « Suivi longitudinal », id longitudinal, DERNIÈRE entrée de la section labo, après bilan', () => {
        const labo = tranche(lire('js/config.js'), "'labo': [", "'aide': [");
        const ids = Array.from(labo.matchAll(/id: '([a-z-]+)'/g)).map((m) => m[1]);
        expect(ids).toEqual(['accompagnement', 'modelisation', 'comparateur', 'rythme', 'etudes', 'bilan', 'longitudinal']);
        expect(labo).toMatch(/id: 'longitudinal', label: 'Suivi longitudinal'/);
    });

    it('navigation.js : labo-longitudinal a son initialisateur dans la table, comme les six autres', () => {
        const table = tranche(lire('js/navigation.js'), 'const INITIALISATEURS_SOUS_SECTION = {', '// === RÉGLAGES ===');
        expect(table).toMatch(/'labo-longitudinal': function \(\) \{[\s\S]*?initialiserRegistreLongitudinal\(\)/);
    });

    it('index.html : le conteneur vit dans la section labo, et le script est chargé', () => {
        const html = lire('index.html');
        const labo = tranche(html, 'id="labo-bilan" class="sous-section"', 'fin section-labo');
        expect(labo).toMatch(/<div id="labo-longitudinal" class="sous-section">/);
        expect(labo).toMatch(/id="registre-longitudinal-conteneur"/);
        expect(html).toMatch(/<script src="js\/registre-longitudinal\.js\?v=\d{8}[a-z]?"><\/script>/);
    });
});

describe('#915 lot 1 — ouvrir le sous-onglet lit, et n\'écrit rien', () => {
    it('registre absent : l\'écran dit « aucun élève », le journal d\'écriture reste vide, la clé n\'est pas semée', () => {
        const b = banc();
        b.win.initialiserRegistreLongitudinal();
        const conteneur = b.elements['registre-longitudinal-conteneur'];
        const textes = conteneur.children.map((c) => c.textContent);
        expect(textes).toContain(b.mots.perennite);
        const zoneInscrits = conteneur.children.find((c) => c.id === 'rl-zone-inscrits');
        expect(zoneInscrits.children.map((c) => c.textContent)).toContain(b.mots.aucunInscrit);
        expect(b.journal).toEqual([]);
        expect(NOM_CLE in b.store).toBe(false);
    });

    it('registre étranger (tableau, autre format, eleves absent) : lu comme vide, jamais réécrit', () => {
        for (const brut of [[], { format: 'codex-data', version: 1, groupes: {} }, { format: 'autre', version: 1, eleves: { '2000001': { da: '2000001', nom: 'X', prenom: 'Y' } } }, { format: 'registre-longitudinal', version: 1 }, 'texte', 42]) {
            const store = Object.assign(storeBase(), { [NOM_CLE]: brut });
            const b = banc(store);
            expect(b.api.lire()).toEqual({ format: 'registre-longitudinal', version: 1, eleves: {}, modeles: { grilles: {}, echelles: {} } });
            b.win.initialiserRegistreLongitudinal();
            expect(b.journal).toEqual([]);
            expect(b.store[NOM_CLE]).toEqual(brut);
        }
    });

    it('registre peuplé : une ligne par inscrit·e, triée par nom puis prénom, bâtie par le DOM (aucun innerHTML)', () => {
        const store = Object.assign(storeBase(), { [NOM_CLE]: registre({
            '2000002': { da: '2000002', nom: 'Absent', prenom: 'Bruno', inscritLe: '2026-09-17T23:30:00.000Z' },
            '2000001': { da: '2000001', nom: 'Assidu', prenom: 'Alice', inscritLe: '2026-09-10' },
            '2000005': { da: '2000005', nom: 'Absent', prenom: 'Anna', inscritLe: '2026-09-12' }
        }) });
        const b = banc(store);
        b.win.initialiserRegistreLongitudinal();
        const conteneur = b.elements['registre-longitudinal-conteneur'];
        expect(conteneur.innerHTML).toBe('');
        const zoneInscrits = conteneur.children.find((c) => c.id === 'rl-zone-inscrits');
        const liste = zoneInscrits.children.find((c) => c.className === 'rl-eleves');
        expect(liste).toBeTruthy();
        expect(liste.children.map((li) => li.dataset.da)).toEqual(['2000005', '2000002', '2000001']);
        // Lot 3 : le nom et la date vivent dans l'en-tête de la rangée, suivis du bouton « Retirer du registre ».
        const entete = (li) => li.children.find((c) => c.className === 'rl-eleve-entete').children.map((s) => s.textContent);
        expect(entete(liste.children[0])).toEqual(['Absent, Anna', b.mots.inscritLe + ' 2026-09-12', b.mots.retirerDuRegistre]);
        expect(entete(liste.children[1])[1]).toBe(b.mots.inscritLe + ' 2026-09-17');
        expect(b.journal).toEqual([]);
    });

    it('le module ne contient aucun innerHTML : le nom d\'un élève n\'a pas de chemin vers le HTML', () => {
        expect(lire('js/registre-longitudinal.js')).not.toMatch(/\.innerHTML\s*\+?=|insertAdjacentHTML\(/);
    });
});
