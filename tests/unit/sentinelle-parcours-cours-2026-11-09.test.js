// =======================================================================
// LE CINQUIÈME PARCOURS (9 NOV. 2026) : LES MOTS DE « MONTER TON COURS »
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md.
//   1. Les bulles sont celles que Grégoire a validées le 8 nov. (10 h 25 à 10 h 49), avec les CORRECTIONS du 9 nov.
//      (10 h 01 à 10 h 04, relayées par Cowork : étapes 2, 3, 5 et 6). Chaque texte, LU À L'EXÉCUTION, est égal au
//      texte de la consigne auquel on applique ces corrections ; chaque correction doit trouver dans la consigne la
//      phrase qu'elle remplace.
//   2. La variante ⚠ de l'étape 6 ; « Plus tard » partout sauf la dernière ; « Terminer » ; la 7 au centre.
//   3. Le panneau : le titre, la ligne, la phrase du refus ; une production dans le cours actif suffit.
//   4. Le guide de la carte : les deux phrases alignées sur les bulles (et rien d'autre dans ces deux pages).
// Break-test (9 nov.) : « par sa poignée ⠿ » retiré de l'étape 5 dans js/parcours-cours.js → ROUGE (étape 5) ;
// « l’étudiant·e saura faire » remis à « l’étudiant saura faire » dans GUIDE_PAGES → ROUGE (guide). Rétablis.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
// Comme les sentinelles des parcours 1 à 4 : la consigne est lue par un lecteur. ⚠ `plans de travail/` est ignoré par la
// CI (paths-ignore) : un commit qui ne changerait QUE la consigne ne relancerait pas ce banc ; tout changement du code, si.
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-5-monter-ton-cours.md');
const lignes = CONSIGNE.split('\n');

function ligneEtape(n) { return lignes.find((l) => l.startsWith(`Étape ${n}, «`)); }
function titreDeLaConsigne(n) { const m = ligneEtape(n).match(/^Étape \d, « (.*?) »/); return m ? m[1] : null; }
function texteDe(ligne) { const m = ligne && ligne.match(/Texte : « (.*?) » ?(?:Avance|Bouton|$)/); return m ? m[1] : null; }

// [étape, phrase de la consigne, phrase validée le 9 nov.]
const CORRECTIONS = [
    [2, "« Se décline en » s'affiche.", "Le lien « se décline en » s'affiche."],
    [3, "« Se concrétise dans » apparaît : c'est ce lien qui", "Le lien « se concrétise dans » apparaît : c'est ce lien qui"],
    [5, "puis glisse le bloc dans ta leçon. Touche-le deux fois : dans l'Inspecteur, coche l'objectif qu'il sert.",
        "puis glisse le bloc dans ta leçon par sa poignée ⠿. Touche deux fois cette poignée : dans l'Inspecteur, coche l'objectif qu'il sert."],
    [6, "puis glisse le bloc dans ta leçon, sous ton activité : dans une leçon, l'ordre des blocs dit ce qui vient avant. Touche-le deux fois.",
        "puis glisse le bloc par sa poignée ⠿ dans ta leçon, sous ton activité : dans une leçon, l'ordre des blocs dit ce qui vient avant. Touche deux fois cette poignée."]
];

function corriger(n, t) {
    for (const [, avant, apres] of CORRECTIONS.filter((c) => c[0] === n)) {
        if (!t.includes(avant)) throw new Error(`étape ${n} : la consigne ne porte pas « ${avant} »`);
        t = t.replace(avant, apres);
    }
    return t;
}

function texteValide(n) { return corriger(n, texteDe(ligneEtape(n))); }

function charger(productions) {
    const enregistres = [];
    const win = {
        Assistance: { enregistrer: (d) => enregistres.push(d), definirEtat() {}, etatDe: () => ({ etat: 'a-faire', etape: 0 }) },
        ParcoursMoteur: { visible: () => false, actif: () => false, etapeCourante: () => null }
    };
    const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { appendChild() {} } };
    const globaux = { document };
    if (productions) globaux.obtenirDonneesSelonMode = (k) => (k === 'productions' ? productions : []);
    chargerScript('js/parcours-cours.js', globaux, win);
    return { def: enregistres[0], api: win.ParcoursCours };
}

function fauxElement() {
    return {
        style: {}, dataset: {}, classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
        setAttribute() {}, getAttribute: () => null, appendChild() {}, remove() {},
        addEventListener() {}, querySelector: () => null, querySelectorAll: () => [], closest: () => null
    };
}

function pagesDuGuide() {
    const win = chargerScript('js/planification-carte.js', {
        db: { getSync: (k, d) => d }, cle: (k) => k, echapperHtml: (t) => String(t ?? ''),
        document: {
            getElementById: () => null, querySelectorAll: () => [], querySelector: () => null, addEventListener: () => {},
            createElement: fauxElement, createElementNS: fauxElement, body: { appendChild() {}, removeChild() {} }
        },
        navigator: {}
    });
    return win.planificationCarte.GUIDE_PAGES;
}

// Le texte rendu d'une page, apostrophes courbes ramenées aux droites de la consigne.
const rendu = (p) => p.contenu.replace(/<[^>]+>/g, ' ').replace(/’/g, "'").replace(/\s+/g, ' ');

describe('« Monter ton cours » : les bulles, mot pour mot (consigne + corrections du 9 nov.)', () => {
    const { def, api } = charger();
    const E = api.etapes();

    it('le panneau : le titre, la ligne, sept étapes', () => {
        expect(def.id).toBe('monter');
        expect(def.titre).toBe('Monter ton cours');
        expect(CONSIGNE).toContain(`Titre : « ${def.titre} ». Ligne : « ${def.ligne} »`);
        expect(E).toHaveLength(7);
        expect(def.total).toBe(7);
    });

    it('chaque correction trouve, dans la consigne, la phrase qu’elle remplace', () => {
        for (const [n, avant] of CORRECTIONS) expect(texteDe(ligneEtape(n)), `étape ${n}`).toContain(avant);
    });

    it.each([1, 2, 3, 4, 5, 6, 7])('étape %i : le titre et le texte validés', (n) => {
        expect(E[n - 1].titre).toBe(titreDeLaConsigne(n));
        expect(E[n - 1].texte).toBe(texteValide(n));
    });

    it('la variante ⚠ de l’étape 6 est celle de la consigne', () => {
        const m = CONSIGNE.match(/^Variante de l'étape 6, .*? : « (.*) »$/m);
        expect(m).not.toBeNull();
        expect(api.texteVariante).toBe(m[1]);
    });

    it('« Terminer » à la dernière, sans « Plus tard », au centre ; « Plus tard » sur les six autres', () => {
        expect(E[6].boutons.map((b) => b.libelle)).toEqual(['Terminer']);
        expect(E[6].sansSortie).toBe(true);
        expect(E[6].centre).toBe(true);
        expect(E.slice(0, 6).every((e) => !e.sansSortie && !e.centre)).toBe(true);
    });

    it('la phrase du refus est celle que Grégoire a validée ; une production dans le cours actif la lève', () => {
        const m = CONSIGNE.match(/le panneau dit : « (Commence par .*?) » \(texte validé par Grégoire\)/);
        expect(m).not.toBeNull();
        expect(api.condition()).toBe(m[1]);                       // aucune production
        expect(charger([]).api.condition()).toBe(m[1]);           // une liste vide
        expect(charger([{ id: 'PROD_un' }]).api.condition()).toBeNull();
    });
});

describe('Le guide de la carte, aligné sur les bulles (consigne, 10 h 29 et 10 h 37)', () => {
    const pages = pagesDuGuide();
    const page = (titre) => pages.find((p) => p.titre.replace(/’/g, "'") === titre);
    const remplacements = [...CONSIGNE.matchAll(/^- Page « (.*?) » : « (.*?) » devient « (.*?) »\.?$/gm)].map((m) => m.slice(1));

    it('la consigne nomme deux pages', () => {
        expect(remplacements.map((r) => r[0])).toEqual(["Ce que l'étudiant doit retenir", 'Ce que la leçon vise']);
    });

    it.each(["Ce que l'étudiant doit retenir", 'Ce que la leçon vise'])('page « %s » : la phrase nouvelle y est, l’ancienne n’y est plus ; le titre ne change pas', (t) => {
        const [titre, avant, apres] = remplacements.find((r) => r[0] === t);
        const p = page(titre);
        expect(p, titre).toBeTruthy();
        expect(rendu(p)).toContain(apres);
        expect(rendu(p)).not.toContain(avant);
    });

    it('les bulles 2 et 4 reprennent la phrase du guide', () => {
        const E = charger().api.etapes();
        expect(E[1].texte.startsWith(remplacements[0][2].replace(/\.$/, ''))).toBe(true);
        expect(E[3].texte).toContain(remplacements[1][2]);
    });
});
