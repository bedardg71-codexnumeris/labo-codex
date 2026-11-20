// =======================================================================
// « MONTER TON COURS », « JE REGARDE » : LES MOTS DU MODÈLE (20 NOV. 2026, SESSION DE NUIT B, LOT 3)
// =======================================================================
// plans de travail/CONSIGNE-2026-11-19-je-regarde-cours.md : le relais du 19 nov. (16 h), mot pour mot. Les bulles du modèle,
// LUES À L'EXÉCUTION sur une carte simulée, temps par temps : à l'ouverture (le geste de la page en dernier), une fois le
// bloc posé (la seule consigne de « Remplir »), une fois rempli (ce qui vient d'apparaître, les gestes, la consigne, ce
// qui suit). Et la confirmation (de ce passage seulement), l'objectif, la suite du lieu, l'objectif atteint, le refus
// provisoire, ce que « Remplir » écrit (le matériel), la fin.
// ⚠ Deux choses du relais ne sont pas codées, faute de pouvoir tenir (mesure c du rapport) : la seconde forme de la
// bulle 6, et la coche des activités des leçons ajoutées. La ligne « Ces activités servent toutes le même objectif. »
// reste, mot pour mot, et elle est signalée au rapport. La parenthèse d'une consigne reste dans son texte (pas de
// mécanisme « hors du gras » dans le moteur de cette base) : le banc la recolle par une espace.
// Break-tests (20 nov.) : au rapport du lot.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const RELAIS = (() => {
    const t = readFileSync(path.join(racine, 'plans de travail/CONSIGNE-2026-11-19-je-regarde-cours.md'), 'utf8');
    const i = t.indexOf('Pour Claude Code, à relayer');
    const j = t.indexOf('```', i);
    if (i === -1 || j === -1) throw new Error('le relais du lot 3 est introuvable dans sa consigne');
    return t.slice(i, j);
})();

/** Le texte entre le premier « à partir de `depuis` et son » apparié. */
function citation(s, depuis = 0) {
    const a = s.indexOf('«', depuis);
    if (a === -1) return null;
    let prof = 0;
    for (let k = a; k < s.length; k++) {
        if (s[k] === '«') prof++;
        else if (s[k] === '»' && --prof === 0) return { texte: s.slice(a + 1, k).trim(), fin: k + 1 };
    }
    throw new Error('guillemets non appariés : ' + s.slice(a, a + 60));
}

/** Les éléments d'une ligne du relais, dans l'ordre : { genre: O | L | C | E | G | B | R, texte }. */
function elements(ligne) {
    const out = [];
    const re = /(objectif(?= «)|\[L\]|\[C\]|\[E\](?:, après la consigne)?|\[G\]|\[B\]|\[R\])/g;
    let m;
    while ((m = re.exec(ligne))) {
        const genre = { objectif: 'O', '[L]': 'L', '[C]': 'C', '[G]': 'G', '[B]': 'B', '[R]': 'R' }[m[1]] || 'E';
        if (genre === 'R') { out.push({ genre }); continue; }
        const c = citation(ligne, m.index);
        if (!c) continue;
        let texte = c.texte, fin = c.fin;
        const suite = ligne.slice(fin, fin + 25);
        if (genre === 'G' && /^, suivi de «/.test(suite)) {
            const p = citation(ligne, fin);
            texte += ' ' + p.texte;
            fin = p.fin;
        }
        out.push({ genre, texte });
        re.lastIndex = fin;
    }
    return out;
}

/** Une bulle du relais : son titre, ses trois temps (ouverture, posé, rempli), et son bloc brut. */
function bulleDuRelais(n) {
    const debut = RELAIS.indexOf(`Bulle ${n}, «`);
    const fin = n < 7 ? RELAIS.indexOf(`Bulle ${n + 1}, «`) : RELAIS.indexOf('\n4. Tests.');
    if (debut === -1 || fin === -1) throw new Error(`bulle ${n} introuvable dans le relais`);
    const bloc = RELAIS.slice(debut, fin);
    const lignes = bloc.split('\n').filter((l) => l.trim());
    const titre = citation(lignes[0]).texte;
    const ouverture = lignes.find((l) => l.startsWith("À l'ouverture"));
    const pose = lignes.find((l) => /^Une fois .*: \[R\]\.$/.test(l));
    const rempli = lignes.find((l) => l.startsWith('Une fois') && !/: \[R\]\.$/.test(l));
    return { titre, bloc, ouverture: ouverture ? elements(ouverture) : elements(lignes[1] || ''), pose: !!pose, rempli: rempli ? elements(rempli) : null };
}

// ---------- Le code, sur une carte simulée ----------

const COURS = 'C2', GROUPE = 'G2';
const PROD = 'Appliquer des stratégies de lecture variées (Deux-Rives)';

function charger({ noeuds = [], liens = [], groupe = GROUPE, prods = [{ description: PROD, coursId: COURS }] } = {}) {
    const N = new Map(noeuds.map((n) => [n.id, { enfants: [], metadata: {}, ...n }]));
    const L = new Map(liens.map((l, k) => [String(k), l]));
    let def = null;
    const win = {
        Assistance: { enregistrer: (d) => { def = d; }, definirEtat() {}, definirEtatModele() {}, etatDe: () => ({ etat: 'a-faire', etape: 0 }) },
        ParcoursMoteur: { visible: () => false, actif: () => false, etapeCourante: () => 0, allerA() {}, lancer: () => Promise.resolve(), fermer() {} },
        planificationCarte: {
            etat: { noeuds: N, liens: L },
            semaineDeLecon: (n) => n.metadata.semaine || null,
            objectifsDeLecon: (n) => n.metadata.objectifs || [],
            objectifsServisPar: (n) => n.metadata.objectifsServis || [],
            objectifsVerifiesPar: (n) => n.metadata.objectifsVerifies || [],
            evaluerPastilleEvaluation: () => ({ etat: 'avant' }),
            TYPES_SERVANTS_OBJECTIF: ['activite', 'evaluation']
        },
        ParcoursClasse: {
            deuxiemeGroupe: () => ({ id: GROUPE, coursId: COURS }),
            materiel: { cours: { nom: 'Littérature et imaginaire' } },
            mots: { remplir: 'Remplir' },
            remplir() {}, poser() {},
            suitesDuModele: () => [{ libelle: 'Le refaire avec ma classe' }, { libelle: 'Terminer' }],
            consigneDesSuites: (b) => 'Touche ' + b.map((x) => '« ' + x.libelle + ' »').join(', ').replace(/, (« [^«]*»)$/, ', ou $1')
        },
        ParcoursEvaluer: { textes: { choisirLeGroupe: "Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui)" } }
    };
    const db = { getSync: (k, d) => (k === 'groupeCoursActif' ? { id: groupe } : k === 'demo_productions' ? prods : d) };
    const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], body: { appendChild() {}, classList: { toggle() {} } }, activeElement: null };
    chargerScript('js/parcours-cours.js', { document, db, obtenirDonneesSelonMode: () => [], obtenirPreference: () => ({}) }, win);
    return { def, api: win.ParcoursCours };
}

const M_ = (api) => api.materielModele;
const plats = (lignes) => lignes.map((l) => ({ genre: l.note ? 'E' : 'G', texte: l.texte, consigne: !!l.geste }));

// Les états de la carte, d'une étape à l'autre : ce que « Remplir » a écrit jusque-là.
function etats(m) {
    const C = { id: 'C', type: 'competence', titre: m.competence };
    const I = { id: 'I', type: 'idee-maitresse', titre: m.idee };
    const lecon = (meta) => ({ id: 'L', type: 'lecon', titre: m.lecon.titre, metadata: { semaine: 2, rangSeance: 1, ...meta } });
    const liens = [{ type: 'se_decline_en', source: 'C', cible: 'I' }, { type: 'se_concretise_dans', source: 'I', cible: 'L' }];
    const obj = { objectifs: [{ id: 'o1', texte: m.objectif }] };
    return [
        { avant: {}, apres: { noeuds: [C] } },
        { avant: { noeuds: [C] }, apres: { noeuds: [C, I] } },
        { avant: { noeuds: [C, I], liens: liens.slice(0, 1) }, apres: { noeuds: [C, I, lecon({})], liens: liens.slice(0, 1) } },
        { avant: { noeuds: [C, I, lecon({})], liens }, apres: { noeuds: [C, I, lecon(obj)], liens } },
        { avant: { noeuds: [C, I, lecon(obj)], liens }, apres: { noeuds: [C, I, lecon(obj), { id: 'A', type: 'activite', titre: m.activite }], liens } },
        { avant: { noeuds: [C, I, lecon(obj)], liens }, apres: { noeuds: [C, I, lecon(obj), { id: 'E', type: 'evaluation', titre: m.evaluation },
            { id: 'L3', type: 'lecon', titre: m.lecon3.titre, metadata: { semaine: 3, rangSeance: 1 } }], liens } }
    ];
}

describe('« Je regarde » de « Monter ton cours » : les bulles, mot pour mot (relais du 19 nov., 16 h)', () => {
    const { def, api } = charger();
    const m = M_(api);
    const E = () => api.etapesModele();

    it('le panneau : le modèle déclaré sur la définition, sept étapes', () => {
        expect(def.totalModele).toBe(7);
        expect(typeof def.lancerModele).toBe('function');
        expect(typeof def.refusModele).toBe('function');
        expect(E()).toHaveLength(7);
    });

    it.each([1, 2, 3, 4, 5, 6])('bulle %i, à l’ouverture : la confirmation, les explications, le geste de la page', (n) => {
        const r = bulleDuRelais(n);
        const e = E()[n - 1];
        expect(e.titre).toBe(r.titre);
        const conf = r.ouverture.find((x) => x.genre === 'C');
        expect(typeof e.confirme === 'function' ? e.confirme() : (e.confirme || '')).toBe(conf ? conf.texte : '');
        const { api: a } = charger(etats(m)[n - 1].avant);
        const lignes = plats(a.etapesModele()[n - 1].lignes());
        expect(lignes.map(({ genre, texte }) => ({ genre, texte }))).toEqual(r.ouverture.filter((x) => x.genre === 'E' || x.genre === 'G'));
        expect(lignes[lignes.length - 1].consigne).toBe(true);
    });

    it.each([1, 2, 3, 5, 6])('bulle %i, le bloc posé : la seule consigne de « Remplir »', (n) => {
        expect(bulleDuRelais(n).pose).toBe(true);
        const etat = etats(m)[n - 1].avant;
        const type = ['competence', 'idee-maitresse', 'lecon', null, 'activite', 'evaluation'][n - 1];
        const pose = { ...etat, noeuds: (etat.noeuds || []).concat([{ id: 'NEUF', type, titre: '' }]) };
        const { api: a } = charger(pose);
        expect(plats(a.etapesModele()[n - 1].lignes())).toEqual([{ genre: 'G', texte: "Regarde l'exemple se remplir : touche « Remplir »", consigne: true }]);
        expect(a.etapesModele()[n - 1].boutons.map((b) => b.libelle)).toEqual(['Remplir']);
    });

    it.each([1, 2, 3, 4, 5, 6])('bulle %i, une fois rempli : ce qui vient d’apparaître, les gestes, la consigne, ce qui suit', (n) => {
        const r = bulleDuRelais(n);
        const { api: a } = charger(etats(m)[n - 1].apres);
        const e = a.etapesModele()[n - 1];
        expect(e.secondeForme(), 'la seconde forme : sans objectif, confirmation ni lieu').toBe(true);
        const attendu = r.rempli.filter((x) => x.genre === 'E' || x.genre === 'G');
        expect(plats(e.lignes()).map(({ genre, texte }) => ({ genre, texte }))).toEqual(attendu);
        const boutons = r.rempli.filter((x) => x.genre === 'B').map((x) => x.texte);
        expect((e.boutons || []).map((b) => b.libelle)).toEqual(boutons);
    });

    it('bulle 1 : l’objectif (sur la définition), la suite de la phrase du lieu', () => {
        const r = bulleDuRelais(1);
        expect(api.definitionModele().objectif).toBe(r.ouverture.find((x) => x.genre === 'O').texte);
        expect(E()[0].lieuSuite).toBe(r.ouverture.find((x) => x.genre === 'L').texte);
    });

    it('bulle 7 : la confirmation, quatre explications, l’objectif atteint, la consigne et les boutons de la fin', () => {
        const r = bulleDuRelais(7);
        const e = E()[6];
        expect(e.titre).toBe(r.titre);
        const el7 = elements(r.bloc.split('\n').find((l) => l.startsWith('[C]')));
        expect(e.confirme()).toBe(el7.find((x) => x.genre === 'C').texte);
        const lignes = plats(e.lignes());
        expect(lignes.filter((l) => l.genre === 'E').map((l) => l.texte)).toEqual(el7.filter((x) => x.genre === 'E').map((x) => x.texte));
        expect(api.definitionModele().objectifAtteint).toBe(citation(r.bloc, r.bloc.indexOf('entre deux filets')).texte);
        expect(e.boutons.map((b) => b.libelle)).toEqual(['Le refaire avec ma classe', 'Terminer']);
        expect(lignes[lignes.length - 1]).toEqual({ genre: 'G', texte: 'Touche « Le refaire avec ma classe », ou « Terminer »', consigne: true });
    });

    it('le refus : le texte provisoire du relais ; sans deuxième groupe ou sans la production du modèle d’« Évaluer »', () => {
        const provisoire = citation(RELAIS, RELAIS.indexOf('Texte provisoire')).texte;
        expect(api.texteRefusModele).toBe(provisoire);
        expect(api.refusModele()).toBeNull();
        expect(charger({ prods: [] }).api.refusModele()).toBe(provisoire);
        expect(charger({ prods: [{ description: PROD, coursId: 'AUTRE' }] }).api.refusModele()).toBe(provisoire);
    });

    it('hors du deuxième groupe, la bulle ne dit que de le choisir', () => {
        const { api: a } = charger({ groupe: 'AUTRE' });
        expect(plats(a.etapesModele()[2].lignes())).toEqual([{ genre: 'G', texte: "Choisis le deuxième groupe dans l'en-tête (ce modèle se joue sur lui)", consigne: true }]);
        expect(a.etapesModele()[2].boutons).toBeNull();
    });

    it('ce que « Remplir » écrit : le matériel du relais (point 2), étape par étape', () => {
        const d = RELAIS.slice(RELAIS.indexOf('Ce que « Remplir » écrit'), RELAIS.indexOf('Ce qui fait avancer'));
        const apres = (repere) => citation(d, d.indexOf(repere)).texte;
        expect(m.competence).toBe(apres('Étape 1'));
        expect(m.idee).toBe(apres('Étape 2'));
        expect(m.lecon.titre).toBe(apres('Étape 3'));
        expect(d).toContain('semaine S2, séance A');
        expect([m.lecon.semaine, m.lecon.seance]).toEqual([2, 1]);
        expect(m.objectif).toBe(apres('Étape 4'));
        expect(m.activite).toBe(apres('Étape 5'));
        expect(m.evaluation).toBe(apres('Étape 6'));
        expect(d).toContain(`« ${m.lecon2.titre} », avec « ${m.lecon2.activites[0]} » (1 période), puis « ${m.lecon2.activites[1]} » (1 période)`);
        expect(d).toContain(`« ${m.lecon3.titre} », avec « ${m.lecon3.activites[0]} » (1 période)`);
    });

    it('la confirmation : de ce passage seulement (comme la Pratique guidée)', () => {
        expect(E()[0].confirme).toBeNull();
        expect(E()[3].confirme()).toBe("C'est fait : la leçon est datée et reliée à l'idée maîtresse.");
    });
});
