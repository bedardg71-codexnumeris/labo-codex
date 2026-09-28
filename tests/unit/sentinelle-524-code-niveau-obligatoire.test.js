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
    // Lot E1 (D3) : un champ refusé est dit par le témoin commun — le vrai module, affichage journalisé.
    chargerScript('js/temoin-enregistrement.js', { document: globaux.document }, win);
    win.temoinEnregistrement = { enregistre() {}, fermer() {}, nonEnregistre: (raison, geste, k) => journal.push(['nonEnregistre', raison, k]) };
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
        // Lot E1 : « Non enregistré : le code du niveau est obligatoire. »
        expect(journal[0]).toEqual(['nonEnregistre', 'le code du niveau est obligatoire.', 'a2026_echellesTemplates']);
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

    it('D.b LE POINT QUI BLOQUAIT LE TUTORIEL : les écrans concernés ont leur légende', () => {
        // Elle n'existait que sur Production. Le commentaire CSS de
        // `.champ-recommande` dit « ne jamais poser l'une sans l'autre ».
        //
        // ⚠ La CARTOUCHE en est dispensée (décision de Grégoire, 26 août, au vu du
        // rendu). Ses trois champs de tête sont TOUS obligatoires — une légende qui
        // annonce « champ obligatoire » n'y apprend rien —, et posée dans le premier
        // bloc, large de 200 px, elle poussait la grille à la ligne suivante. La règle
        // « jamais l'une sans l'autre » vise le cas où DEUX marques cohabitent sans
        // être expliquées ; là il n'y en a qu'une, et elle ne distingue rien.
        //
        // ⮕ QUATRE depuis #540 lot A (26 août 2026, même jour) : le formulaire COURS
        // rejoint la liste. Sa pondération devient obligatoire — elle porte les heures
        // de cours par semaine, que le recoupement avec l'horaire confrontera —, et le
        // code du cours comme la discipline étaient DÉJÀ refusés à l'enregistrement
        // sans qu'aucune marque ne l'annonce. Trois marques d'un coup sur un écran qui
        // n'en avait aucune : la légende y apprend quelque chose, contrairement au cas
        // cartouche ci-dessus.
        const html = lire('index.html');
        const legendes = html.match(/class="legende-marques"/g) || [];
        expect(legendes.length, 'production, grille, échelle, cours').toBe(4);
    });

    it('D.d l\'écran cartouche garde ses astérisques, et son ordre de champs', () => {
        // Retirer la légende ne retire pas les marques : les trois champs restent
        // obligatoires et refusés. Et l'ordre demandé est Nom, Grille, Échelle.
        const html = lire('index.html');
        const i = html.indexOf('Nom + Grille + Échelle sur une seule ligne');
        expect(i, 'le bloc réordonné existe').toBeGreaterThan(-1);
        // Borne : la liste (désactivée) des cartouches, qui suit l'en-tête — le
        // conteneur des cases « Pratiques compatibles » est parti (3 sept. 2026, volet C).
        const bloc = html.slice(i, html.indexOf('listeCartouchesExistants', i));
        expect(bloc, 'pas de légende sur cet écran').not.toContain('legende-marques');
        const ordre = ['nomCartouche', 'selectGrilleCartouche', 'selectEchelleCartouche']
            .map(id => bloc.indexOf(id));
        expect(ordre[0], 'le nom vient en premier').toBeGreaterThan(-1);
        expect(ordre[0]).toBeLessThan(ordre[1]);
        expect(ordre[1], 'puis la grille, puis l\'échelle').toBeLessThan(ordre[2]);
        expect((bloc.match(/champ-requis/g) || []).length, 'les trois astérisques restent').toBe(3);
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

/* ========================================================================== */
/* #525 — LA VALEUR D'UN NIVEAU, DÉCIDÉE UNE FOIS POUR TOUS                    */
/*                                                                            */
/* Question de Grégoire, 26 août : « aucune valeur numérique n'est obligatoire */
/* pour les échelles ? comment la note peut-elle se construire si elle est     */
/* absente ? » Elle portait exactement sur l'angle mort que l'audit avait      */
/* déclaré sans le mesurer — et la mesure a trouvé deux défauts.               */
/* ========================================================================== */

describe('#525 · E — le ZÉRO est une valeur, pas une absence', () => {

    it('E.a LE CAS QUI PORTE LE SENS : une valeur ponctuelle de 0 est respectée', () => {
        // `evaluation-calcul.js` écrivait `valeurCalcul || (min+max)/2`. Le `||`
        // traite 0 comme absent : sur un niveau 0 dont la plage irait de 0 à 59,
        // la note valait 29,5 au lieu de 0. Les échelles « IDME et niv 0 » de
        // Grégoire sont exactement ce cas.
        const { win } = monter({ echelles: ECHELLE() });
        expect(win.valeurNumeriqueDuNiveau({ code: '0', valeurCalcul: 0, min: 0, max: 59 })).toBe(0);
    });

    it('E.b #527 — sans valeur ponctuelle : `null`, PAS le milieu de la plage', () => {
        // Le repli fabriquait une décision pédagogique. Mesuré avant de le
        // retirer : les échelles de Grégoire, le pack de démarrage (9/9) et les
        // échelles semées par le code en portent toutes une. Il ne servait à
        // personne, et ne pouvait que produire une note fausse le jour où une
        // valeur manquerait vraiment.
        const { win } = monter({ echelles: ECHELLE() });
        expect(win.valeurNumeriqueDuNiveau({ code: 'D', min: 60, max: 74 })).toBeNull();
    });

    it('E.c ni valeur ni bornes exploitables ⇒ null, JAMAIS NaN ni 0', () => {
        // `(undefined + undefined) / 2` rendait NaN, qui se propageait jusque
        // dans la note affichée. Et poser 0 à la place serait pire : un zéro
        // inventé ne se distingue plus d'un vrai zéro.
        const { win } = monter({ echelles: ECHELLE() });
        expect(win.valeurNumeriqueDuNiveau({ code: 'X' })).toBeNull();
        expect(win.valeurNumeriqueDuNiveau({ code: 'X', min: '', max: '' })).toBeNull();
        expect(win.valeurNumeriqueDuNiveau(null)).toBeNull();
    });

    it('E.d une valeur ponctuelle en TEXTE est lue comme un nombre', () => {
        // Le pack de démonstration porte `"valeurCalcul": "40"` : une chaîne.
        const { win } = monter({ echelles: ECHELLE() });
        expect(win.valeurNumeriqueDuNiveau({ code: 'M', valeurCalcul: '40' })).toBe(40);
    });

    it('E.e une chaîne VIDE n\'est pas une valeur, et les bornes ne la remplacent pas', () => {
        const { win } = monter({ echelles: ECHELLE() });
        expect(win.valeurNumeriqueDuNiveau({ code: 'M', valeurCalcul: '', min: 80, max: 100 })).toBeNull();
    });
});

describe('#525 · F — les bornes sont obligatoires, et les deux lecteurs ont la même règle', () => {

    it('F.a une borne vide est refusée', async () => {
        const { win, store } = monter({ echelles: ECHELLE() });
        const r = await win.modifierNiveauEchelle('E1', 0, 'min', '');
        expect(r.refuse).toBeTruthy();
        expect(store.a2026_echellesTemplates[0].niveaux[0].min).toBe(0);
    });

    it('F.b une borne non numérique aussi', async () => {
        const { win } = monter({ echelles: ECHELLE() });
        expect((await win.modifierNiveauEchelle('E1', 0, 'max', 'beaucoup')).refuse).toBeTruthy();
    });

    it('F.c mais ZÉRO est une borne valide', async () => {
        // La garde doit refuser le vide, pas le zéro — sans quoi elle rendrait
        // impossible le niveau 0 qu'elle est censée protéger.
        const { win, store } = monter({ echelles: ECHELLE() });
        const r = await win.modifierNiveauEchelle('E1', 1, 'min', 0);
        expect(r.ok).toBe(true);
        expect(store.a2026_echellesTemplates[0].niveaux[1].min).toBe(0);
    });

    it('F.d LA COUTURE : plus aucun module ne réécrit la règle dans son coin', () => {
        const lire = (f) => readFileSync(path.join(racineProjet, f), 'utf8');
        for (const fichier of ['js/evaluation-calcul.js']) {
            const src = lire(fichier);
            expect(src, `${fichier} doit passer par valeurNumeriqueDuNiveau`)
                .toContain('valeurNumeriqueDuNiveau');
            // ⚠ Le `||` est la forme exacte qui trahissait le zéro.
            expect(src, `${fichier} ne doit plus écrire \`valeurCalcul ||\``)
                .not.toMatch(/valeurCalcul\s*\|\|/);
        }
    });

    it('F.e Min et Max portent l\'astérisque dans les deux éditeurs', () => {
        const src = readFileSync(path.join(racineProjet, 'js/echelles.js'), 'utf8');
        const marques = src.match(/champ-requis" title="Champ obligatoire">\*/g) || [];
        // Code ×2, Nom ×2, Min ×2, Max ×2
        expect(marques.length).toBeGreaterThanOrEqual(8);
    });
});

/* ========================================================================== */
/* #526 — LA PLAGE ET LA VALEUR PONCTUELLE SONT DEUX CONVERSIONS INVERSES      */
/*                                                                            */
/* Précision de Grégoire, 26 août : « la plage sert aux pratiques de notation  */
/* alternatives, la note ponctuelle sert à la notation sommative, ou lorsque   */
/* la note doit être convertie en note chiffrée ». L'une ne se déduit pas de   */
/* l'autre — et le repli sur le milieu de plage fabriquait une décision        */
/* pédagogique que seul l'enseignant peut prendre.                            */
/* ========================================================================== */

describe('#526 · G — la valeur ponctuelle est obligatoire, comme les bornes', () => {

    it('G.a LE CAS QUI PORTE LE SENS : une valeur ponctuelle vide est refusée', async () => {
        const { win, store } = monter({
            echelles: [{ id: 'E1', nom: 'IDME', niveaux: [
                { code: 'M', nom: 'Maîtrise', min: 75, max: 89, valeurCalcul: 82 }] }]
        });

        const r = await win.modifierNiveauEchelle('E1', 0, 'valeurCalcul', '');

        expect(r.refuse).toBe('La valeur ponctuelle du niveau est obligatoire');
        expect(store.a2026_echellesTemplates[0].niveaux[0].valeurCalcul).toBe(82);
    });

    it('G.b ZÉRO reste une valeur ponctuelle valide', async () => {
        // La garde refuse le VIDE, pas le zéro — sans quoi elle rendrait
        // impossible le niveau 0 que #525 vient de protéger.
        const { win, store } = monter({
            echelles: [{ id: 'E1', nom: 'IDME', niveaux: [
                { code: '0', nom: 'Aucun', min: 0, max: 0, valeurCalcul: 5 }] }]
        });
        const r = await win.modifierNiveauEchelle('E1', 0, 'valeurCalcul', 0);
        expect(r.ok).toBe(true);
        expect(store.a2026_echellesTemplates[0].niveaux[0].valeurCalcul).toBe(0);
    });

    it('G.c la valeur ponctuelle porte l\'astérisque dans les deux éditeurs', () => {
        const src = readFileSync(path.join(racineProjet, 'js/echelles.js'), 'utf8');
        const marques = src.match(/champ-requis" title="Champ obligatoire">\*/g) || [];
        // Code ×2, Nom ×2, Min ×2, Max ×2, Valeur ponctuelle ×2
        expect(marques.length).toBeGreaterThanOrEqual(10);
    });

    it('G.d #527 — le repli n\'existe plus du tout', () => {
        // Mesuré avant de le retirer : il ne servait à personne. Le garder,
        // c'était garder une porte ouverte à une note fabriquée.
        const src = readFileSync(path.join(racineProjet, 'js/echelles.js'), 'utf8');
        const i = src.indexOf('function valeurNumeriqueDuNiveau');
        const corps = src.slice(i, src.indexOf('\nconst REFUS_VALEUR', i));
        expect(corps, 'plus de milieu de plage fabriqué').not.toMatch(/\(min \+ max\) \/ 2/);
        expect(corps, 'la fonction rend null quand elle ne sait pas').toContain('return null;');
    });

    it('G.e LA DISTINCTION EST DANS LE SKILL, pas seulement dans une tête', () => {
        // Elle n'y était pas : zéro occurrence de `valeurCalcul` avant le 26 août.
        // Un invariant pédagogique qui ne vit que dans le code se perd au premier
        // refactor — c'est la mémoire du projet qui doit le porter.
        const skill = readFileSync(
            path.join(racineProjet, '.claude/skills/pratiques-notation/SKILL.md'), 'utf8');
        expect(skill).toContain('valeurCalcul');
        expect(skill, 'les deux sens de conversion').toMatch(/note chiffrée \*\*→ CODE\*\*/);
        expect(skill).toMatch(/CODE \*\*→ note chiffrée\*\*/);
    });
});
