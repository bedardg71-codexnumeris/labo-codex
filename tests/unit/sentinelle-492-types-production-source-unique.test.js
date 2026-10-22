import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

// Sentinelle #492 (25 août 2026) — LE SÉLECTEUR « PRODUCTION » DE LA CARTE
// MONTRE TOUTES LES PRODUCTIONS.
//
// Le fil : `metadata.productionId` du nœud Évaluation est LE pont entre la
// carte d'alignement et les vraies productions du Codex. Le sélecteur qui
// l'écrit portait sa propre liste de types — cinq — quand le formulaire de
// Conception en offre douze. Les sept autres étaient chargées, regroupées,
// puis abandonnées sans un mot : aucun artefact, aucun portfolio, aucun
// laboratoire, aucune présentation, aucune entrevue, aucun stage, aucune
// évaluation terminale ne pouvait être rattaché à un bloc de la carte.
//
// ⚠ ET SOUS LES DEUX, LE DÉFAUT RACINE (trouvé au navigateur, pas au code) :
// `chargerProductions` filtrait sur `p.estActive` — un champ qu'AUCUN module du
// projet n'écrit jamais. Elle rendait donc `[]` en toutes circonstances. Le
// sélecteur était vide depuis toujours, ce qui a gardé les deux autres défauts
// hors de vue : on ne voit pas les libellés cassés d'une liste vide, ni la
// liste de types amputée d'un menu qui n'affiche rien.
//
// Le second défaut, celui qui cachait le premier : `chargerProductions`
// projetait `nom` alors que le modèle porte `titre`. Chaque option affichait
// donc « undefined (20 %) » — et la même projection alimente la colonne
// « Production » du plan de cours exporté. Les deux se couvraient l'un l'autre :
// un sélecteur vide ne montre pas ses libellés cassés.
//
// Ce que cette sentinelle tient :
//   S1 — LE VERROU : `TYPES_PRODUCTION` et le <select> d'index.html disent la
//        MÊME chose, dans le même ordre. C'est la dérive entre deux listes qui
//        a coûté le pont ; un type ajouté d'un seul côté doit faire rougir ici.
//   S2 — LE POINT DÉCISIF : chaque production active obtient une option, quel
//        que soit son type. Un artefact est rattachable à un bloc Évaluation.
//   S3 — les libellés portent le TITRE réel, et il passe par l'échappement.
//   S4 — la pondération n'est montrée que par les types qui en portent une :
//        un artefact n'en affiche aucune, parce que le calcul n'en lit aucune.
//   S5 — le filet : un type inconnu de la table reste visible et choisissable.
//   S6 — LA RACINE : la lecture du Codex ne filtre sur AUCUN champ que le modèle
//        n'écrit pas, et rend ce que la liste de Conception montre.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racine = path.resolve(__dirname, '..', '..');

/* ------------------------------------------------------------------ harnais */

// Échappement fidèle à `config.js` (qui passe par textContent → innerHTML),
// mais sans DOM. Il DOIT transformer, sinon S3 ne prouverait rien.
const echapperHtml = (t) => (t == null ? '' : String(t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;'));

function charger(productions) {
    const store = {};
    const globaux = {
        db: {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; },
            get: async (k, d) => (k in store ? store[k] : d),
            set: async (k, v) => { store[k] = v; }
        },
        cle: (k) => `a2026_${k}`,
        echapperHtml,
        obtenirCoursActifId: () => null,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {},
        requestAnimationFrame: (fn) => { fn(); return 0; }
    };

    // Les deux bouts du pont, dans le même sandbox : la table vient de
    // productions.js, le sélecteur de planification-carte.js.
    const win = chargerScript('js/productions.js', globaux);
    win.cle = globaux.cle;
    chargerScript('js/planification-carte.js', globaux, win);
    win.planificationDonnees = {
        getIndex: () => ({ active: 'carte_1', cartes: [{ id: 'carte_1', nom: 'T' }] }),
        chargerCarte: () => null, sauvegarderCarte: () => {}
    };
    store['a2026_productions'] = productions;
    return win;
}

// ⚠ Pas de champ que le modèle n'écrit pas : c'est un harnais qui parlait un
// dialecte inventé (`estActive`) qui a laissé le défaut racine passer.
const prod = (id, titre, type, ponderation = 0) => ({
    id, titre, type, ponderation, dansBibliotheque: true, grilleId: ''
});

/* ----------------------------------------------------- S1 — LE VERROU (SSOT) */

describe('#492 · S1 — TYPES_PRODUCTION et le formulaire disent la même chose', () => {
    // Le <select> d'index.html est la vérité de FAIT : c'est ce que Grégoire
    // voit en créant une production. La table doit le refléter exactement.
    function optionsDuFormulaire() {
        const html = readFileSync(path.join(racine, 'index.html'), 'utf8');
        const bloc = html.match(/<select id="productionType"[\s\S]*?<\/select>/);
        expect(bloc, 'le <select id="productionType"> doit exister').toBeTruthy();

        const options = [];
        let groupe = null;
        const lignes = bloc[0].split('\n');
        for (const ligne of lignes) {
            const og = ligne.match(/<optgroup label="([^"]+)"/);
            if (og) { groupe = og[1]; continue; }
            const op = ligne.match(/<option value="([^"]*)"\s*>([^<]*)<\/option>/);
            if (op && op[1] !== '') options.push({ id: op[1], libelle: op[2], groupe });
        }
        return options;
    }

    it('S1.a Mêmes types, dans le même ordre', () => {
        const win = charger([]);
        expect(win.TYPES_PRODUCTION.map(t => t.id)).toEqual(optionsDuFormulaire().map(o => o.id));
    });

    it('S1.b Mêmes libellés de choix et mêmes groupes', () => {
        const win = charger([]);
        const attendu = optionsDuFormulaire().map(o => ({ id: o.id, libelle: o.libelle, groupe: o.groupe }));
        const table = win.TYPES_PRODUCTION.map(t => ({ id: t.id, libelle: t.libelle, groupe: t.groupe }));
        expect(table).toEqual(attendu);
    });

    it('S1.c getTypeLabel couvre TOUS les types — plus aucun identifiant brut', () => {
        const win = charger([]);
        for (const t of win.TYPES_PRODUCTION) {
            const libelle = win.getTypeLabel(t.id);
            expect(libelle, `${t.id} doit avoir un libellé`).not.toBe(t.id);
            expect(libelle.length).toBeGreaterThan(0);
        }
        // Le repli sur l'entrée elle-même reste, pour une donnée d'un autre âge.
        expect(win.getTypeLabel('type_invente_2027')).toBe('type_invente_2027');
    });
});

/* -------------------------------------------- S2 — LE POINT DÉCISIF (le pont) */

describe('#492 · S2 — chaque production active est rattachable', () => {
    it('S2.a AUCUN type ne disparaît du sélecteur', () => {
        const win = charger([]);
        const toutes = win.TYPES_PRODUCTION.map((t, i) => prod('P' + i, 'Production ' + i, t.id, 10));
        const html = win.planificationCarte.optionsProductionsHTML(toutes, '');
        for (const p of toutes) {
            expect(html, `${p.type} doit être offert`).toContain('value="' + p.id + '"');
        }
    });

    it('S2.b LE CAS QUI PORTE LE SENS : un artefact de portfolio est offert', () => {
        const win = charger([]);
        const html = win.planificationCarte.optionsProductionsHTML(
            [prod('A1', 'Artefact 1', 'artefact-portfolio'),
             prod('PF', 'Portfolio', 'portfolio', 60)], '');
        expect(html).toContain('Artefact 1');
        expect(html).toContain('Portfolio');
    });

    it('S2.c Le choix courant est marqué selected', () => {
        const win = charger([]);
        const html = win.planificationCarte.optionsProductionsHTML(
            [prod('A1', 'Artefact 1', 'artefact-portfolio'),
             prod('A2', 'Artefact 2', 'artefact-portfolio')], 'A2');
        expect(html).toContain('value="A2" selected');
        expect(html).not.toContain('value="A1" selected');
    });

    it('S2.d Aucune production : aucune option (le « Aucune » vient du gabarit)', () => {
        const win = charger([]);
        expect(win.planificationCarte.optionsProductionsHTML([], '')).toBe('');
    });
});

/* ------------------------------------------------ S3 — le titre, et son échappement */

describe('#492 · S3 — le libellé porte le titre réel', () => {
    it('S3.a Le titre s\'affiche — jamais « undefined »', () => {
        const win = charger([]);
        const html = win.planificationCarte.optionsProductionsHTML(
            [prod('T1', 'Description de personnage', 'travail', 20)], '');
        expect(html).toContain('Description de personnage');
        expect(html).not.toContain('undefined');
    });

    it('S3.b Un titre sans texte ne rend pas une option muette', () => {
        const win = charger([]);
        const html = win.planificationCarte.optionsProductionsHTML(
            [prod('T1', '   ', 'travail', 20)], '');
        expect(html).toContain('Sans titre');
    });

    it('S3.c Le titre passe par l\'échappement (il entre dans un innerHTML)', () => {
        const win = charger([]);
        const html = win.planificationCarte.optionsProductionsHTML(
            [prod('T1', '<img src=x onerror=alert(1)>', 'travail', 20)], '');
        expect(html).not.toContain('<img');
        expect(html).toContain('&lt;img');
    });

    it('S3.d La lecture du Codex projette titre, pas nom', () => {
        const win = charger([prod('T1', 'Description de personnage', 'travail', 20)]);
        const lues = win.planificationCarte.chargerProductions();
        expect(lues).toHaveLength(1);
        expect(lues[0].titre).toBe('Description de personnage');
        expect(lues[0].nom).toBeUndefined();
        // Le même chemin alimente la colonne « Production » du plan de cours.
        expect(win.planificationCarte.afficherDetailsProduction('T1', lues).nomProduction)
            .toBe('Description de personnage');
    });
});

/* --------------------------------------------------- S4 — la pondération dite juste */

describe('#492 · S4 — la pondération n\'est montrée que si elle existe', () => {
    it('S4.a Un travail montre sa pondération', () => {
        const win = charger([]);
        expect(win.planificationCarte.optionsProductionsHTML(
            [prod('T1', 'Analyse', 'travail', 20)], '')).toContain('Analyse (20\u00A0%)');
    });

    it('S4.b Un artefact n\'en montre aucune, même si la donnée en porte une', () => {
        const win = charger([]);
        const html = win.planificationCarte.optionsProductionsHTML(
            [prod('A1', 'Artefact 1', 'artefact-portfolio', 6.67)], '');
        expect(html).toContain('>Artefact 1</option>');
        expect(html).not.toContain('6.67');
        expect(html).not.toContain('%');
    });

    it('S4.c La règle est lisible hors du rendu', () => {
        const win = charger([]);
        expect(win.typePorteSaPonderation('travail')).toBe(true);
        expect(win.typePorteSaPonderation('artefact-portfolio')).toBe(false);
        expect(win.typePorteSaPonderation('type_inconnu')).toBe(true);
    });
});

/* ------------------------------------------------------------- S5 — le filet */

describe('#492 · S5 — rien ne disparaît en silence', () => {
    it('S5.a Un type absent de la table reste offert', () => {
        const win = charger([]);
        const html = win.planificationCarte.optionsProductionsHTML(
            [prod('X1', 'Production d\'un autre âge', 'type_retire_en_2024', 15)], '');
        expect(html).toContain('value="X1"');
        expect(html).toContain('Type non répertorié');
    });

    it('S5.b Les types connus gardent leur groupe malgré un intrus', () => {
        const win = charger([]);
        const html = win.planificationCarte.optionsProductionsHTML(
            [prod('X1', 'Intrus', 'type_retire_en_2024', 15),
             prod('A1', 'Artefact 1', 'artefact-portfolio')], '');
        expect(html).toContain('<optgroup label="Portfolio">');
        expect(html).toContain('<optgroup label="Type non répertorié">');
        expect(html.match(/<optgroup/g)).toHaveLength(2);
        expect(html.match(/<\/optgroup>/g)).toHaveLength(2);
    });
});

/* --------------------------------------------------------- S6 — LA RACINE */

describe('#492 · S6 — la lecture du Codex rend ce que Grégoire voit', () => {
    // Une production TELLE QUE L'APPLICATION L'ÉCRIT : ni `estActive`, ni aucun
    // autre champ inventé par un test. C'est le seul harnais qui pouvait
    // attraper le défaut racine — celui qui vidait le sélecteur depuis toujours.
    const PRODUCTION_COMME_L_APP_L_ECRIT = {
        titre: 'Artefact 1', activiteApprentissage: 'Stratégies de lecture',
        description: 'Stratégies de lecture', type: 'artefact-portfolio',
        ponderation: 0, objectif: '', tache: '', detailTache: '',
        grilleId: '', echelleId: '', cartoucheId: '', dateEcheance: null,
        pratiquesCompatibles: [], categorie: null,
        id: 'PROD1759747917026', dansBibliotheque: true, coursId: 'COURS_A'
    };

    it('S6.a LE CAS QUI PORTE TOUT : une production réelle est bien lue', () => {
        const win = charger([PRODUCTION_COMME_L_APP_L_ECRIT]);
        const lues = win.planificationCarte.chargerProductions();
        expect(lues, 'un filtre sur un champ fantôme rendrait [] ici').toHaveLength(1);
        expect(lues[0].titre).toBe('Artefact 1');
    });

    it('S6.b Et elle arrive jusqu\'au sélecteur', () => {
        const win = charger([PRODUCTION_COMME_L_APP_L_ECRIT]);
        const html = win.planificationCarte.optionsProductionsHTML(
            win.planificationCarte.chargerProductions(), '');
        expect(html).toContain('Artefact 1');
        expect(html).toContain('value="PROD1759747917026"');
    });

    it('S6.c Le seul retrait légitime : sortie de la bibliothèque', () => {
        const win = charger([
            PRODUCTION_COMME_L_APP_L_ECRIT,
            Object.assign({}, PRODUCTION_COMME_L_APP_L_ECRIT,
                { id: 'PROD_RETIREE', titre: 'Retirée', dansBibliotheque: false })
        ]);
        const lues = win.planificationCarte.chargerProductions();
        expect(lues.map(p => p.id)).toEqual(['PROD1759747917026']);
    });

    it('S6.d Une production sans le champ `dansBibliotheque` reste visible', () => {
        // `!== false` et non `=== true` : la donnée d'avant décembre 2025 ne
        // porte pas le champ, et elle ne doit pas disparaître pour autant.
        const ancienne = Object.assign({}, PRODUCTION_COMME_L_APP_L_ECRIT);
        delete ancienne.dansBibliotheque;
        const win = charger([ancienne]);
        expect(win.planificationCarte.chargerProductions()).toHaveLength(1);
    });
});
