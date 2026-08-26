import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle #524 (26 août 2026) — LE CODE D'UN NIVEAU EST UNE CLÉ, PAS UNE ÉTIQUETTE.
//
// Audit du 26 août, demandé par Grégoire en préparant un tutoriel. `niveau.code`
// sert d'INDEX aux commentaires de cartouche et aux rendus PDF —
// `${critere.id}_${niveau.code}`, lu à 23 endroits. Un code vide donne la clé
// `CR_1_` : tous les niveaux sans code atterrissent sur la même case, et le
// dernier commentaire écrase les autres. Sans un mot.
//
// ⚠⚠ UNE VALIDATION EXISTAIT DÉJÀ, SUR DU CODE MORT. `sauvegarderNiveaux()` dit
// « Code et nom obligatoires » — mais son bouton vit dans le bloc « ANCIEN
// SYSTÈME » masqué, et il écrit dans `#tableauNiveaux` quand l'éditeur vivant est
// `#tableauNiveauxEchelle`. C'est le motif AP-2, le MÊME que #516 le matin même,
// sur l'écran voisin. Deux fois en un jour : ce banc EXÉCUTE le refus plutôt que
// de chercher une chaîne dans un fichier.

/* ------------------------------------------------------------------ harnais */

function monter({ echelles = [], niveauxNeufs = null } = {}) {
    const store = { 'a2026_echellesTemplates': echelles };
    const journal = [];
    const globaux = {
        db: {
            get: async (k) => (k in store ? JSON.parse(JSON.stringify(store[k])) : null),
            getSync: (k, d) => (k in store ? JSON.parse(JSON.stringify(store[k])) : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; }, setSync: (k, v) => { store[k] = v; },
            modifier: async (k, mutateur, defaut) => {
                const valeur = (k in store ? JSON.parse(JSON.stringify(store[k])) : defaut);
                const resultat = await mutateur(valeur);
                if (resultat === undefined) return undefined;
                store[k] = resultat;
                return resultat;
            }
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        alert: (m) => journal.push(['alert', String(m)]),
        confirm: () => true,
        notifications: {
            succes: () => {}, info: () => {}, avertissement: () => {},
            erreur: (m, d) => journal.push(['erreur', String(m), String(d || '')])
        },
        echelleTemplateActuelle: null,
        afficherNiveauxEchelle: () => {},
        afficherNiveauxNouvelleEchelle: () => {},
        // Le rendu des niveaux demande le sélecteur de couleur : stubbé, il est
        // hors du sujet de ce banc (le refus, pas la palette).
        travauxOutils: { renderPickerCouleur: () => '' },
        document: {
            // Le rendu écrit dans ces deux conteneurs : sans eux, il lève sur
            // innerHTML et le test échouerait pour une raison qui n'est pas la sienne.
            getElementById: (id) => (
                ['tableauNiveauxEchelle', 'apercuEchelleNiveaux'].includes(id)
                    ? { innerHTML: '', classList: { add() {}, remove() {} } }
                    : null
            ),
            querySelector: () => null,
            querySelectorAll: () => [], addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    };
    // #504 — `ui-blocs.js` d'abord : le rendu des niveaux appelle ses helpers
    // (boutons de réordonnancement). Deux modules dans le MÊME sandbox.
    const win = chargerScript('js/ui-blocs.js', globaux);
    win.travauxOutils = { renderPickerCouleur: () => '' };
    chargerScript('js/echelles.js', globaux, win);
    if (niveauxNeufs) win._niveauxNouvelleEchelle = niveauxNeufs;
    return { win, store, journal };
}

const ECHELLE = () => [{
    id: 'E1', nom: 'IDME',
    niveaux: [
        { code: 'I', nom: 'Insuffisant', min: 0, max: 59 },
        { code: 'D', nom: 'En développement', min: 60, max: 74 }
    ]
}];

/* --------------------------------- A — le code n'atteint plus les données vide */

describe('#524 · A — un code de niveau vide est refusé', () => {

    it('A.a LE CAS QUI PORTE LE SENS : vider le code ne l\'écrit pas', async () => {
        const { win, store } = monter({ echelles: ECHELLE() });

        const r = await win.modifierNiveauEchelle('E1', 0, 'code', '');

        expect(r.refuse, 'la fonction doit DIRE qu\'elle refuse').toBeTruthy();
        expect(store.a2026_echellesTemplates[0].niveaux[0].code,
               'sans quoi la clé devient CR_1_ et les commentaires se collisionnent').toBe('I');
    });

    it('A.b le NOM d\'un niveau aussi', async () => {
        const { win, store } = monter({ echelles: ECHELLE() });
        const r = await win.modifierNiveauEchelle('E1', 0, 'nom', '   ');
        expect(r.refuse).toBeTruthy();
        expect(store.a2026_echellesTemplates[0].niveaux[0].nom).toBe('Insuffisant');
    });

    it('A.c un vrai code passe', async () => {
        const { win, store } = monter({ echelles: ECHELLE() });
        const r = await win.modifierNiveauEchelle('E1', 0, 'code', 'M');
        expect(r.ok).toBe(true);
        expect(store.a2026_echellesTemplates[0].niveaux[0].code).toBe('M');
    });

    it('A.d le refus ne vaut QUE pour le code et le nom', async () => {
        // Une description qu'on efface est une décision légitime — et `min`/`max`
        // sont des nombres, pas des clés.
        const { win, store } = monter({ echelles: ECHELLE() });
        const r = await win.modifierNiveauEchelle('E1', 0, 'description', '');
        expect(r.ok).toBe(true);
        expect(store.a2026_echellesTemplates[0].niveaux[0].description).toBe('');
    });
});

/* --------------------------- B — l'éditeur d'échelle NEUVE suit la même règle */

describe('#524 · B — une échelle neuve n\'est pas une exception', () => {
    it('B.a le code vide est refusé aussi dans l\'éditeur temporaire', () => {
        const niveaux = [{ code: 'I', nom: 'Insuffisant' }];
        const { win } = monter({ niveauxNeufs: niveaux });

        const r = win.modifierNiveauTemp(0, 'code', '');

        expect(r.refuse).toBeTruthy();
        expect(niveaux[0].code, 'une échelle neuve deviendra une échelle comme les autres').toBe('I');
    });

    it('B.b et un vrai code y passe', () => {
        const niveaux = [{ code: 'I', nom: 'Insuffisant' }];
        const { win } = monter({ niveauxNeufs: niveaux });
        expect(win.modifierNiveauTemp(0, 'code', 'E').ok).toBe(true);
        expect(niveaux[0].code).toBe('E');
    });
});

/* ------------------------------------------------ C — le refus se VOIT */

describe('#524 · C — le refus n\'est pas silencieux', () => {
    const fauxChamp = () => {
        const classes = new Set();
        return { classList: { add: c => classes.add(c), remove: c => classes.delete(c),
                              contains: c => classes.has(c) }, _classes: classes };
    };

    it('C.a le champ est marqué et la raison dite UNE fois', () => {
        const { win, journal } = monter({ echelles: ECHELLE() });
        const el = fauxChamp();
        win.marquerChampRefuseEchelle(el, win.REFUS_CODE_NIVEAU);
        win.marquerChampRefuseEchelle(el, win.REFUS_CODE_NIVEAU);
        expect(el._classes.has('champ-refuse')).toBe(true);
        expect(journal).toHaveLength(1);
        expect(journal[0][1]).toBe('Le code du niveau est obligatoire');
    });
});

/* ------------------------- D — les marques et la légende, sur les quatre écrans */

describe('#524 · D — un astérisque sans légende est une énigme', () => {
    const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

    it('D.a le code et le nom d\'un niveau portent l\'astérisque, dans les DEUX éditeurs', () => {
        const src = lire('js/echelles.js');
        // Deux rendus vivants : échelle neuve et échelle existante.
        const marques = src.match(/champ-requis" title="Champ obligatoire">\*/g) || [];
        expect(marques.length, 'Code ×2 et Nom du niveau ×2').toBeGreaterThanOrEqual(4);
    });

    it('D.b LE POINT QUI BLOQUAIT LE TUTORIEL : les quatre écrans ont leur légende', () => {
        // Elle n'existait que sur Production. Le commentaire CSS de
        // `.champ-recommande` dit pourtant « ne jamais poser l'une sans l'autre ».
        const html = lire('index.html');
        const legendes = html.match(/class="legende-marques"/g) || [];
        expect(legendes.length,
               'production, grille, échelle, cartouche').toBeGreaterThanOrEqual(4);
    });

    it('D.c une seule définition de `.champ-requis`, et elle vient de la palette', () => {
        // Il en existait DEUX : styles.css (palette + gras) et une copie en dur
        // dans index.html qui gagnait par l'ordre — et perdait le gras au passage.
        const html = lire('index.html');
        expect(html, 'plus de règle .champ-requis dans le <style> inline')
            .not.toMatch(/\.champ-requis\s*\{/);
        const css = lire('styles.css');
        const bloc = css.slice(css.indexOf('.champ-requis {'), css.indexOf('.champ-requis {') + 160);
        expect(bloc).toContain('--rouge-erreur');
        expect(bloc).toContain('font-weight: 700');
    });
});
