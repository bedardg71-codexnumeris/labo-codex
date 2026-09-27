import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');

// Sentinelle #516 (26 août 2026) — L'ASTÉRISQUE TIENT ENFIN SA PROMESSE.
//
// La légende de #506 dit : « Champ obligatoire — l'enregistrement est refusé sans
// lui. » Il ne l'était pas. Une grille dont un critère avait un nom VIDE
// s'enregistrait sans un mot, et la « preuve » qu'en donnait la sentinelle #506
// était la présence d'une CHAÎNE dans les sources — chaîne qui vivait dans
// `sauvegarderCritere()`, une fonction qui lit un id absent de la page et que
// plus rien n'appelle.
//
// ⚠⚠ CE QUE CE BANC CHANGE : il EXÉCUTE le refus au lieu de le chercher. Un
// texte trouvé dans un fichier ne prouve pas qu'un refus a lieu — c'est le motif
// AP-2, et c'est exactement ce qui a permis à la promesse de mentir pendant un
// jour entier sans qu'aucun test ne bronche.
//
// Verdict de Grégoire (D1, 26 août) : « Refuser. Les astérisques doivent être
// rouge partout (pas de bleu). » Les deux moitiés sont tenues ici.

/* ------------------------------------------------------------------ harnais */

function monter({ grilles }) {
    const store = { 'a2026_grillesTemplates': grilles };
    const journal = [];
    const globaux = {
        db: {
            get: async (k) => (k in store ? store[k] : null),
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async (k, v) => { store[k] = v; },
            setSync: (k, v) => { store[k] = v; },
            // La vraie primitive de #510 : la séquence lecture-modification-écriture
            // sérialisée. Reproduite ici, c'est par elle que passe l'écriture.
            modifier: async (k, mutateur, defaut) => {
                const valeur = (k in store ? store[k] : defaut);
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
            succes: (m, d) => journal.push(['succes', String(m), String(d || '')]),
            erreur: (m, d) => journal.push(['erreur', String(m), String(d || '')]),
            info: () => {}, avertissement: () => {}
        },
        grilleTemplateActuelle: null,
        calculerEtAfficherTotalPonderation: () => {},
        document: {
            getElementById: () => null, querySelector: () => null,
            querySelectorAll: () => [], addEventListener() {},
            createElement: () => ({ style: {}, classList: { add() {}, remove() {} } })
        }
    };
    // Lot E1 (D3) : le refus est dit par le témoin commun — le VRAI module (sa
    // `raisonPourTemoin`), dont seul l'affichage est remplacé par le journal.
    const win = chargerScript('js/temoin-enregistrement.js', { document: globaux.document });
    win.temoinEnregistrement = {
        enregistre: () => {}, fermer: () => {},
        nonEnregistre: (raison, geste, k) => journal.push(['nonEnregistre', raison, geste, k])
    };
    chargerScript('js/grilles.js', globaux, win);
    return { win, store, journal };
}

const GRILLE = () => [{
    id: 'G1', nom: 'Grille A26',
    criteres: [{ id: 'CR_1', nom: 'Qualité du français' }, { id: 'CR_2', nom: 'Structure' }]
}];

/* ------------------------------- A — le refus a lieu, et il est SILENCIEUX côté données */

describe('#516 · A — un nom de critère vide n\'atteint pas les données', () => {

    it('A.a LE CAS QUI PORTE LE SENS : vider le nom ne l\'écrit pas', async () => {
        const { win, store } = monter({ grilles: GRILLE() });

        const r = await win.modifierCritereGrille('G1', 0, 'nom', '');

        expect(r.refuse, 'la fonction doit DIRE qu\'elle refuse').toBeTruthy();
        // Avant #516 : le nom devenait '' et la grille était réécrite ainsi.
        expect(store.a2026_grillesTemplates[0].criteres[0].nom).toBe('Qualité du français');
    });

    it('A.b des espaces ne valent pas un nom', async () => {
        const { win, store } = monter({ grilles: GRILLE() });
        await win.modifierCritereGrille('G1', 0, 'nom', '   ');
        expect(store.a2026_grillesTemplates[0].criteres[0].nom).toBe('Qualité du français');
    });

    it('A.c un vrai nom, lui, passe', async () => {
        const { win, store } = monter({ grilles: GRILLE() });
        const r = await win.modifierCritereGrille('G1', 0, 'nom', 'Cohérence du propos');
        expect(r.ok).toBe(true);
        expect(store.a2026_grillesTemplates[0].criteres[0].nom).toBe('Cohérence du propos');
    });

    it('A.d le refus ne vaut QUE pour le nom : les autres champs peuvent être vidés', async () => {
        // Une description qu'on efface est une décision légitime. Étendre le
        // refus à tout ferait de l'astérisque un mensonge dans l'autre sens.
        const { win, store } = monter({ grilles: GRILLE() });
        const r = await win.modifierCritereGrille('G1', 0, 'description', '');
        expect(r.ok).toBe(true);
        expect(store.a2026_grillesTemplates[0].criteres[0].description).toBe('');
    });
});

/* ------------------------------------------ B — mais il se VOIT à l'écran */

describe('#516 · B — le refus ne peut pas être silencieux', () => {
    const fauxChamp = () => {
        const classes = new Set();
        return {
            classList: {
                add: (c) => classes.add(c), remove: (c) => classes.delete(c),
                contains: (c) => classes.has(c)
            },
            _classes: classes
        };
    };

    it('B.a le champ refusé est marqué, et la raison est DITE une fois', () => {
        const { win, journal } = monter({ grilles: GRILLE() });
        const el = fauxChamp();

        win.marquerChampRefuse(el, win.REFUS_NOM_CRITERE);

        expect(el._classes.has('champ-refuse'), 'la marque visuelle').toBe(true);
        // Lot E1 : « Non enregistré : le nom du critère est obligatoire. », sur la clé
        // des grilles (la prochaine écriture réussie l'efface).
        expect(journal).toEqual([['nonEnregistre', 'le nom du critère est obligatoire.',
                                 undefined, 'a2026_grillesTemplates']]);
    });

    it('B.b LE PIÈGE : trois blurs ne font pas trois bandeaux', () => {
        // Vider un champ puis cliquer trois fois ailleurs produirait trois
        // notifications pour un seul problème — et la troisième ferait fermer la
        // barre sans la lire.
        const { win, journal } = monter({ grilles: GRILLE() });
        const el = fauxChamp();
        win.marquerChampRefuse(el, win.REFUS_NOM_CRITERE);
        win.marquerChampRefuse(el, win.REFUS_NOM_CRITERE);
        win.marquerChampRefuse(el, win.REFUS_NOM_CRITERE);
        expect(journal).toHaveLength(1);
    });

    it('B.c un nom retrouvé retire la marque', () => {
        const { win } = monter({ grilles: GRILLE() });
        const el = fauxChamp();
        win.marquerChampRefuse(el, win.REFUS_NOM_CRITERE);
        win.marquerChampRefuse(el, null);
        expect(el._classes.has('champ-refuse')).toBe(false);
    });
});

/* ------------------------- C — les astérisques sont ROUGES partout (verdict D1) */

describe('#516 · C — une seule marque d\'obligation, et elle a une couleur', () => {
    const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');

    it('C.a LE DÉFAUT VU PAR GRÉGOIRE : plus aucun astérisque sans couleur', () => {
        // `.text-danger` n'avait AUCUNE règle de couleur dans tout le projet :
        // ses 28 astérisques héritaient de la couleur de leur label — d'où le
        // bleu. C'est la cause, pas une préférence.
        const sources = ['index.html', 'js/grilles.js', 'js/productions.js',
                         'js/echelles.js', 'js/cartouches.js'].map(lire).join('\n');
        const orphelines = sources.match(/text-danger(?![-\w])/g) || [];
        expect(orphelines, 'text-danger n\'a pas de couleur : plus personne ne doit la porter').toEqual([]);
    });

    it('C.b la classe retenue porte bien le rouge', () => {
        const css = lire('styles.css');
        const bloc = css.slice(css.indexOf('.champ-requis {'), css.indexOf('.champ-requis {') + 200);
        expect(bloc).toContain('--rouge-erreur');
    });

    it('C.c le champ refusé a sa propre marque, distincte de l\'astérisque', () => {
        const css = lire('styles.css');
        expect(css).toContain('.champ-refuse');
        const bloc = css.slice(css.indexOf('.champ-refuse,'), css.indexOf('.champ-refuse,') + 300);
        expect(bloc).toContain('--rouge-erreur');
    });
});
