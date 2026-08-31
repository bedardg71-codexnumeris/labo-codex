import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// =====================================================================
// SENTINELLE #640 — L'ACCUEIL EST LA PORTE D'ENTRÉE, DANS TOUS LES CAS
// =====================================================================
//
// CE QUI EST VERROUILLÉ
// `js/main.js:991` — `afficherSection('accueil')`, inconditionnel depuis
// `8f4ff85d` (31 août 2026). Le « Chantier 3 » dérivait avant vers
// `naviguerVers('suivi', 'groupe')` dans DEUX cas : `demo-actif` valant 'true',
// OU le mode expert actif. Les deux dérivations sont retirées.
// Aucune sentinelle ne verrouillait cette règle — ni avant, ni après.
//
// ⚠ CE N'EST PAS UN INVARIANT DE SÛRETÉ, C'EST UNE DÉCISION DE PARCOURS.
// Le motif est le parcours de rentrée : un enseignant qui explore en démo gagne
// à voir « Par où commencer ? » plutôt qu'un tableau de bord déjà rempli de
// données fictives. Le retrait vaut AUSSI pour le mode expert, délibérément
// (« dans tous les cas »), et le commentaire de `js/main.js:986-990` NOMME la
// ligne à remettre si l'usage montre que c'était de trop.
// ⮕ Donc : si ce fichier rougit, ce n'est pas forcément un bug. C'est peut-être
// une décision qu'on est en train de réviser. Le message de chaque échec le dit,
// et renvoie au commentaire. Réviser la décision = modifier CE fichier avec elle,
// pas le contourner.
//
// ⚠ CE QU'IL NE FAUT PAS ASSERTER : que `demo-actif` est morte. La clé garde une
// vingtaine de références dans `js/` (`modes.js`, `bibliotheque-ui.js`,
// `modal-backup-reminder.js`…). Elle ne pilote plus l'OUVERTURE, c'est tout —
// une assertion plus large rougirait sur du code parfaitement sain. Un cas
// ci-dessous verrouille l'inverse : qu'elle reste vivante ailleurs.
//
// ---------------------------------------------------------------------
// COMMENT CE BANC MESURE — et ce qu'il ne mesure pas
// ---------------------------------------------------------------------
// Il exécute le VRAI `DOMContentLoaded` de `main.js` (l.271-1393) en entier,
// pas un extrait : la source est chargée dans un `with (scope)` dont le scope
// est un Proxy. `afficherSection`, `naviguerVers`, `obtenirPreference` et
// `db.getSync` y sont RÉELS (des espions), donc les conditions qui gouvernent
// l'ouverture sont réellement évaluées. Tout autre identifiant libre reçoit une
// fonction-noop tolérante.
//
// Conséquence recherchée : le banc voit une dérivation posée N'IMPORTE OÙ dans
// le callback, pas seulement autour de la ligne 991 — un `naviguerVers('suivi')`
// ajouté 200 lignes plus bas serait attrapé lui aussi.
//
// ⚠ Le biais du Proxy, énoncé pour qu'on ne s'y trompe pas : un identifiant
// inconnu est TRUTHY. Une condition nouvelle et inconnue sera donc prise, et
// une condition niée sera sautée. Ce biais penche toujours du même côté : vers
// le ROUGE. Ce banc peut donc crier pour une dérivation qui, en vrai, ne se
// déclencherait jamais — il ne peut pas se taire sur une dérivation réelle.
// Un rouge ici se lit « quelqu'un a touché à l'ouverture », pas « c'est cassé ».
//
// ⚠ IL NE VOIT PAS L'ÉCRAN. Vitest est du Node : il mesure l'APPEL, jamais le
// rendu. La preuve que l'utilisateur ATTERRIT sur l'accueil est due à
// `tests/integration/accueil-porte-entree-640.spec.js` (Playwright/WebKit).
// Les deux sont nécessaires ; aucun ne remplace l'autre.

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const RENVOI = 'Décision de parcours de Grégoire (8f4ff85d, 31 août 2026) — '
    + 'voir le commentaire js/main.js:986-990, qui nomme la ligne à remettre '
    + 'si le raccourci doit revenir. Si la décision a changé, mettre CE fichier '
    + 'à jour avec elle.';

/** Fonction-noop récursive : se laisse appeler, lire, et traverser. */
function tolerant(nom) {
    const f = function () { return tolerant(nom + '()'); };
    return new Proxy(f, {
        get(_t, prop) {
            if (prop === Symbol.toPrimitive) return () => 0;
            // Ni thenable ni itérable : sinon `await x` et `[...x]` divergent.
            if (prop === 'then' || prop === Symbol.iterator) return undefined;
            return tolerant(nom + '.' + String(prop));
        },
        set: () => true,
        has: () => true
    });
}

/** Objet réel complété par des noop tolérants pour tout le reste. */
function tolerantSur(objet, nom) {
    return new Proxy(objet, {
        has: () => true,
        get(t, prop) {
            if (prop in t) return t[prop];
            if (typeof prop === 'symbol') return undefined;
            return tolerant(nom + '.' + String(prop));
        },
        set(t, prop, v) { t[prop] = v; return true; }
    });
}

/**
 * Charge `js/main.js`, capture son rappel DOMContentLoaded, l'exécute, et rend
 * la liste ORDONNÉE des navigations demandées.
 *
 * @param {object} opts
 * @param {boolean} opts.demoActif   - `db.getSync('demo-actif')` rend 'true'
 * @param {boolean} opts.modeExpert  - `obtenirPreference('modeExpert')` rend true
 * @param {Function} [opts.muter]    - transforme la SOURCE (témoins). Doit mordre.
 */
function ouvrirApplication({ demoActif = false, modeExpert = false, muter = null } = {}) {
    const brut = readFileSync(path.join(racine, 'js/main.js'), 'utf8');
    const code = muter ? muter(brut) : brut;
    if (muter && code === brut) {
        throw new Error('Témoin inerte : la mutation de js/main.js n\'a rien remplacé.');
    }

    const navigations = [];
    const lectures = { demoActif: 0, modeExpert: 0 };
    const noop = () => {};
    let rappelDOM = null;

    const scopeReel = {
        // Les quatre seules dépendances qui décident de l'ouverture. Réelles.
        afficherSection: (section) => navigations.push({ appel: 'afficherSection', section }),
        naviguerVers: (section, sous) => navigations.push({ appel: 'naviguerVers', section, sous }),
        obtenirPreference: (cle) => {
            if (cle !== 'modeExpert') return null;
            lectures.modeExpert += 1;
            return modeExpert;
        },
        db: {
            ready: true,
            getSync: (cle, defaut = null) => {
                if (cle !== 'demo-actif') return defaut;
                lectures.demoActif += 1;
                return demoActif ? 'true' : defaut;
            },
            setSync: noop, removeSync: noop,
            get: async (_c, d = null) => d, set: async () => {}, remove: async () => {},
            keys: async () => [], flush: async () => {},
            syncToLocalStorageCache: async () => {}
        },
        console: { log: noop, warn: noop, error: noop, info: noop, debug: noop },
        setTimeout: (cb) => setTimeout(cb, 0),
        setInterval: () => 0,
        localStorage: {
            getItem: () => null, setItem: noop, removeItem: noop,
            key: () => null, length: 0, clear: noop
        },
        document: {
            readyState: 'loading',
            addEventListener: (evenement, rappel) => {
                if (evenement === 'DOMContentLoaded') rappelDOM = rappel;
            },
            removeEventListener: noop,
            querySelector: () => null,
            querySelectorAll: () => [],
            getElementById: () => null,
            createElement: () => ({
                setAttribute: noop, appendChild: noop, addEventListener: noop, style: {},
                classList: { add: noop, remove: noop, contains: () => false }
            }),
            body: {
                addEventListener: noop, appendChild: noop, setAttribute: noop,
                getAttribute: () => null,
                classList: { add: noop, remove: noop, contains: () => false }
            },
            documentElement: { addEventListener: noop, style: {}, classList: { add: noop, remove: noop } }
        },
        window: {
            addEventListener: noop, removeEventListener: noop,
            location: { hash: '', search: '' },
            matchMedia: () => ({ matches: false, addEventListener: noop })
        }
    };
    scopeReel.window = tolerantSur(scopeReel.window, 'window');
    scopeReel.document = tolerantSur(scopeReel.document, 'document');

    const scope = new Proxy(scopeReel, {
        has: () => true,
        get(t, prop) {
            if (prop === Symbol.unscopables) return undefined;
            if (prop in t) return t[prop];
            return tolerant(String(prop));
        },
        set(t, prop, v) { t[prop] = v; return true; }
    });

    // `with` impose du non-strict : c'est le seul moyen d'intercepter les
    // identifiants LIBRES d'un script conçu pour un vrai `window`.
    // eslint-disable-next-line no-new-func
    const fn = new Function('__scope', 'with (__scope) {\n' + code + '\n}');
    fn(scope);

    if (typeof rappelDOM !== 'function') {
        throw new Error('Banc invalide : le rappel DOMContentLoaded de main.js n\'a pas été capturé.');
    }
    rappelDOM();

    return { navigations, lectures };
}

/** La première navigation demandée au démarrage — celle qui décide de l'écran. */
const ouverture = (r) => r.navigations[0];

/** Les quatre combinaisons exigées par #640. */
const COMBINAISONS = [
    { demoActif: false, modeExpert: false, libelle: 'ni démo ni expert (primo-arrivant)' },
    { demoActif: true, modeExpert: false, libelle: 'démo active seule' },
    { demoActif: false, modeExpert: true, libelle: 'mode expert seul' },
    { demoActif: true, modeExpert: true, libelle: 'démo ET expert' }
];

describe('sentinelle #640 · le banc voit-il ce qu\'il prétend surveiller', () => {

    it('le rappel DOMContentLoaded s\'exécute et demande AU MOINS une navigation', () => {
        // Garde de validité. Sans elle, un montage qui sortirait en silence
        // ferait passer les quatre cas ci-dessous PAR VACUITÉ : « aucune
        // dérivation trouvée » se lirait comme « conforme » alors que le banc
        // n'aurait rien exécuté du tout.
        const r = ouvrirApplication({});
        expect(r.navigations.length).toBeGreaterThan(0);
        expect(ouverture(r).appel).toBe('afficherSection');
    });

    it('une mutation qui ne mord pas est REFUSÉE — un témoin inerte n\'est pas un témoin', () => {
        expect(() => ouvrirApplication({
            muter: (src) => src.replace('CHAINE_QUI_N_EXISTE_PAS_DANS_MAIN', 'x')
        })).toThrow(/Témoin inerte/);
    });

});

describe('sentinelle #640 · l\'accueil s\'ouvre quelles que soient les deux valeurs', () => {

    COMBINAISONS.forEach(({ demoActif, modeExpert, libelle }) => {
        it(`ouvre sur l'accueil — ${libelle}`, () => {
            const r = ouvrirApplication({ demoActif, modeExpert });

            expect(ouverture(r), RENVOI).toEqual({ appel: 'afficherSection', section: 'accueil' });

            // Et personne ne dérive vers le Suivi PLUS LOIN dans le démarrage :
            // c'est ce que l'assertion sur la seule première navigation
            // laisserait passer.
            const versSuivi = r.navigations.filter((n) => n.section === 'suivi');
            expect(versSuivi, RENVOI).toEqual([]);
        });
    });

    it('`main.js` lui-même ne consulte plus ni `demo-actif` ni `modeExpert` au démarrage', () => {
        // Le complément des cas ci-dessus : ils montrent que le résultat ne
        // change pas ; celui-ci montre POURQUOI — les deux valeurs ne sont plus
        // lues par le chemin d'ouverture. Un refactor qui rebrancherait la
        // lecture sans encore s'en servir serait vu ici, avant qu'il ne fasse
        // de dégât.
        //
        // ⚠ PORTÉE EXACTE, à ne pas élargir en la lisant : ce compteur ne voit
        // que les lectures faites PAR `main.js`. Les modules qu'il appelle sont
        // des noop tolérantes dans ce banc, donc leurs propres `db.getSync` ne
        // sont pas comptés. Et `demo-actif` EST consultée ailleurs au boot —
        // `js/main.js:1061` et `:1069` le disent en toutes lettres pour le
        // module de données démo. Un zéro ici signifie « le chemin d'ouverture
        // ne la lit plus », jamais « plus personne ne la lit au démarrage ».
        const r = ouvrirApplication({ demoActif: true, modeExpert: true });
        expect(r.lectures, RENVOI).toEqual({ demoActif: 0, modeExpert: 0 });
    });

    it('`demo-actif` reste VIVANTE ailleurs — la clé n\'est pas morte, elle ne pilote plus l\'ouverture', () => {
        // Garde-fou contre la sur-interprétation de cette sentinelle : quelqu'un
        // qui lirait « l'ouverture ignore demo-actif » pourrait conclure que la
        // clé est du code mort et la retirer. Elle ne l'est pas.
        const modes = readFileSync(path.join(racine, 'js', 'modes.js'), 'utf8');
        expect(modes).toContain('demo-actif');
    });

});

describe('sentinelle #640 · les deux dérivations retirées, une par une', () => {

    // Le point qui a motivé l'item : muter une seule branche laisserait l'autre
    // libre de revenir. Chacune a donc son témoin, et chacun mord SEUL.

    it('TÉMOIN — réarmer la dérivation DÉMO ramène le Suivi (et ferait rougir les cas ci-dessus)', () => {
        const r = ouvrirApplication({
            demoActif: true,
            muter: (src) => src.replace(
                "    afficherSection('accueil');",
                "    if (db.getSync('demo-actif', null) === 'true') { naviguerVers('suivi', 'groupe'); }"
                + " else { afficherSection('accueil'); }"
            )
        });
        expect(ouverture(r)).toEqual({ appel: 'naviguerVers', section: 'suivi', sous: 'groupe' });
        expect(r.lectures.demoActif).toBeGreaterThan(0);
    });

    it('TÉMOIN — réarmer la dérivation EXPERT ramène le Suivi, indépendamment de la démo', () => {
        // `demoActif: false` : ce témoin isole bien la SECONDE branche. S'il
        // passait avec la démo active, il ne prouverait pas que le mode expert
        // seul suffit à dériver.
        const r = ouvrirApplication({
            demoActif: false,
            modeExpert: true,
            muter: (src) => src.replace(
                "    afficherSection('accueil');",
                "    if (obtenirPreference('modeExpert')) { naviguerVers('suivi', 'groupe'); }"
                + " else { afficherSection('accueil'); }"
            )
        });
        expect(ouverture(r)).toEqual({ appel: 'naviguerVers', section: 'suivi', sous: 'groupe' });
        expect(r.lectures.modeExpert).toBeGreaterThan(0);
    });

    it('TÉMOIN — une dérivation posée AILLEURS dans le démarrage est vue aussi', () => {
        // Ce que l'assertion « première navigation » seule ne verrait pas : un
        // `naviguerVers` ajouté APRÈS l'ouverture, qui écraserait l'écran.
        const r = ouvrirApplication({
            // Ancre unique dans main.js (vérifié : une seule occurrence).
            muter: (src) => src.replace(
                '    // 2. CHARGEMENTS CONDITIONNELS',
                "    naviguerVers('suivi', 'groupe');\n    // 2. CHARGEMENTS CONDITIONNELS"
            )
        });
        expect(ouverture(r)).toEqual({ appel: 'afficherSection', section: 'accueil' });
        expect(r.navigations.filter((n) => n.section === 'suivi')).toHaveLength(1);
    });

});
