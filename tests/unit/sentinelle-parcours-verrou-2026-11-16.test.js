import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

// LE VERROU DES PARCOURS, PAR PARCOURS (16 nov. 2026 ; plans de travail/CONSIGNE-2026-11-16-decouvrir-en-ligne.md).
// Fermés en entier le 15 nov. (1.248.1), les parcours rouvrent un à un : `PARCOURS_OUVERTS`, dans js/assistance.js,
// est la liste des identifiants ouverts. Aujourd'hui : « Découvrir » seul. Un parcours fermé reste inscrit, mais
// n'est ni offert (`parcours()`, `suivantDe`, le panneau, le rang du menu) ni lancé (`lancerParcours`).
// Le comportement est jugé au navigateur : tests/integration/parcours-verrou-2026-11-16.spec.js.
// Remplace sentinelle-parcours-fermes-2026-11-15.test.js (la fermeture en entier).

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');

function chargerAssistance() {
    const rang = { textContent: 'jamais écrit' };
    const document = {
        readyState: 'complete',
        getElementById: (id) => (id === 'assistance-menu-rang' ? rang : null),
        querySelector: () => null,
        addEventListener() {}, removeEventListener() {}
    };
    const win = chargerScript('js/assistance.js',
        { document, obtenirPreference: () => null, definirPreference() {} },
        { addEventListener() {}, removeEventListener() {} });
    return { A: win.Assistance, rang };
}

function inscrire(A) {
    const lances = [];
    const def = (id, plus) => Object.assign({ id, titre: id, total: 3, lancer() { lances.push(id); } }, plus || {});
    A.enregistrer(def('decouvrir'));
    A.enregistrer(def('classe', { lancerModele() { lances.push('classe-modele'); } }));
    A.enregistrer(def('evaluer', { lancerModele() { lances.push('evaluer-modele'); } }));
    return lances;
}

describe('le verrou des parcours : « Découvrir » seul est ouvert (16 nov. 2026)', () => {
    it('le code livré ouvre « Découvrir » et lui seul, et il n’y a qu’un verrou', () => {
        const code = lire('js/assistance.js');
        expect(code.match(/var PARCOURS_OUVERTS = [^;]*;/g)).toEqual(["var PARCOURS_OUVERTS = ['decouvrir'];"]);
    });

    it('livré : « Découvrir » est offert et part ; un parcours fermé n’est ni offert, ni lancé, ni compté', () => {
        const { A, rang } = chargerAssistance();
        const lances = inscrire(A);
        expect(A.parcours().map((p) => p.id)).toEqual(['decouvrir']);
        expect([A.estOuvert('decouvrir'), A.estOuvert('classe'), A.estOuvert('evaluer')]).toEqual([true, false, false]);
        expect(rang.textContent).toBe('1 sur 1');
        expect(A.lancerParcours('classe')).toBe(false);
        expect(A.lancerParcours('evaluer')).toBe(false);
        expect(lances).toEqual([]);
        expect(A.lancerParcours('decouvrir')).toBe(true);
        expect(lances).toEqual(['decouvrir']);
    });

    it('livré : aucun parcours ne suit « Découvrir » (ni « Parcours suivant », ni un modèle), et rien ne suit un parcours fermé', () => {
        const { A } = chargerAssistance();
        inscrire(A);
        expect(A.suivantDe('decouvrir')).toBeNull();
        expect(A.suivantDe('classe')).toBeNull();
    });

    it('le code des parcours fermés reste en place : rouverts (les bancs), ils sont offerts, se suivent et partent', () => {
        const { A, rang } = chargerAssistance();
        const lances = inscrire(A);
        A.ouvrirLesParcours(true);
        expect(A.parcours().map((p) => p.id)).toEqual(['decouvrir', 'classe', 'evaluer']);
        expect(A.suivantDe('decouvrir').id).toBe('classe');
        expect(rang.textContent).toBe('1 sur 3');
        expect(A.lancerParcours('classe')).toBe(true);
        A.ouvrirLesParcours(false);
        expect(A.parcours()).toEqual([]);
        expect(rang.textContent).toBe('');
        expect(A.lancerParcours('decouvrir')).toBe(false);
        A.ouvrirLesParcours(['decouvrir']);
        expect(A.parcours().map((p) => p.id)).toEqual(['decouvrir']);
        expect(lances).toEqual(['classe']);
    });

    it('les portes hors du panneau lisent la liste des parcours OUVERTS, pas les définitions', () => {
        expect(lire('js/accueil.js')).toContain("window.Assistance.parcours().find(function(p) { return p.id === 'classe'; })");
        expect(lire('js/parcours-decouvrir.js')).toContain("window.Assistance.parcours().find(function (p) { return p.id === 'classe'; })");
        // Le moteur ne lance un parcours suivant que par lancerParcours, qui porte le verrou ; les modèles, par suivantDe.
        expect(lire('js/parcours-moteur.js')).toContain('window.Assistance.lancerParcours(suivant.id)');
        expect(tranche(lire('js/parcours-classe.js'), 'function suivantQuiASonModele(id) {', '\n    }\n')).toContain('window.Assistance.suivantDe(id)');
        const code = lire('js/assistance.js');
        expect(tranche(code, 'function lancerParcours(id) {', '\n    }\n')).toContain('if (!estOuvert(id)) return false;');
        expect(code).toContain('parcours: offerts,');
    });

    it('le panneau liste les parcours ouverts, puis dit « À venir » pour les autres, sans les nommer', () => {
        const code = lire('js/assistance.js');
        expect(code).toContain("var TEXTE_A_VENIR = 'À venir';");
        expect(tranche(code, 'function remplirListe(liste) {', '\n    }\n')).toContain('offerts().forEach(');
        expect(tranche(code, 'if (offerts().length < registre.length || !registre.length) {', '\n        }\n')).toContain('aVenir.textContent = TEXTE_A_VENIR;');
        // La remise à neuf de la démo sert les modèles : elle ne paraît que si un parcours ouvert en a un.
        expect(code).toContain('if (premierModele()) panneau.appendChild(construireBoutonNeuf());');
    });
});

describe('la fin de « Découvrir » suit le verrou : aucune suite vers un parcours fermé', () => {
    const charger = (parcours) => {
        const fenetre = { Assistance: { enregistrer() {}, parcours: () => parcours } };
        new Function('window', lire('js/parcours-decouvrir.js'))(fenetre);
        return fenetre.ParcoursDecouvrir.etapes[7].boutons.map((b) => b.libelle);
    };
    it('« Mettre ta classe en place » fermé : « Explorer la démo par moi-même » et « Terminer », rien d’autre', () => {
        expect(charger([])).toEqual(['Explorer la démo par moi-même', 'Terminer']);
        expect(lire('plans de travail/CONSIGNE-2026-11-16-decouvrir-en-ligne.md')).toContain('sa dernière bulle n\'offre que « Explorer la démo par moi-même » et « Terminer »');
    });
    it('ouvert : les trois suites du 16 nov.', () => {
        expect(charger([{ id: 'classe', lancerModele() {} }])).toEqual(['Explorer la démo par moi-même', 'Voir le parcours suivant', 'Commencer avec ma classe']);
    });
});
