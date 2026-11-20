// =======================================================================
// LE SIXIÈME PARCOURS, « METTRE TES DONNÉES À L'ABRI » — 9 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md.
//   1. Les mots : la ligne du panneau, la phrase du refus et le haut du menu Codex sans codex
//      sont ceux que Grégoire a validés le 8 nov. Les quatre bulles : le « Nous faisons » du
//      19 nov. (bloc 1, ci-dessous).
//   2. Le rappel « Mets ton codex à jour » ne s'ouvre pendant AUCUN parcours : dû, il attend
//      la fin du parcours ; une mise à jour réussie pendant le parcours le repousse.
// Break-tests (9 nov.) :
//   · bloc 2 — `verifierEtAfficher` remis à son état d'avant le lot (sans `parcoursEnCours`) :
//     les quatre essais qui jouent un parcours (« dû, il ne s'ouvre pas… », « il attend la
//     fin… », « une mise à jour réussie… », « un parcours qui en lance un autre… ») ROUGES ;
//     « hors parcours » reste vert ; rétabli → vert.
//   · bloc 1 — « chaque semaine » changé en « chaque mois » dans js/parcours-donnees.js →
//     ROUGE (étape 2) ; rétabli → vert.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { suiteEcrite } from './_helpers/fin-des-parcours-2026-11-20.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';
import { tranche } from './_helpers/tranche.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(racine, f), 'utf8');
const CONSIGNE = lire('plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md');

/** Le parcours chargé seul : l'inscription au panneau est relevée, rien d'autre ne tourne. */
function chargerLeParcours() {
    const inscrits = [];
    const fauxWindow = {
        Assistance: { enregistrer: (def) => inscrits.push(def) },
        addEventListener: () => {}
    };
    const win = chargerScript('js/parcours-donnees.js', {}, fauxWindow);
    return { win, def: inscrits[0], P: win.ParcoursDonnees };
}

// LE « NOUS FAISONS » DU 19 NOV. 2026 (plans de travail/CONSIGNE-2026-11-19-nous-faisons-donnees.md) : les quatre bulles,
// réécrites avec Grégoire de 12 h 15 à 12 h 25, sont lues dans le RELAIS de la consigne, où chaque ligne porte son genre
// ([C] confirmation, [E] explication, [G] geste ; le dernier [G] est la consigne), et confrontées au code chargé hors du
// navigateur, bulle par bulle, et à la bulle 3 chemin par chemin. La ligne du panneau, le refus, le haut du menu et le
// rappel restent confrontés à leur consigne du 8 nov. La confirmation présente ou absente, la flèche, le crochet : jugés au
// navigateur (tests/integration/nous-faisons-donnees-2026-11-19.spec.js).
const NOUVELLE = lire('plans de travail/CONSIGNE-2026-11-19-nous-faisons-donnees.md');
const RELAIS = tranche(NOUVELLE, 'Bulle 1, « Pourquoi un codex »', '3. Tests.');

/** Toutes les citations d'une ligne (« … »), guillemets équilibrés, dans l'ordre. */
function citations(ligne) {
    const sortie = [];
    let k = ligne.indexOf('« ');
    while (k !== -1) {
        let fin = -1;
        for (let j = ligne.indexOf(' »', k); j !== -1; j = ligne.indexOf(' »', j + 1)) {
            const t = ligne.slice(k + 2, j);
            if ((t.match(/«/g) || []).length === (t.match(/»/g) || []).length) { sortie.push(t); fin = j + 2; break; }
        }
        if (fin === -1) break;
        k = ligne.indexOf('« ', fin);
    }
    return sortie;
}

/** Une bulle du relais : ses lignes [C], [E], [G] dans l'ordre (le dernier [G] devient la consigne). */
function bulleDuRelais(n) {
    // Dans le RELAIS (le document nomme aussi ses bulles plus haut, « ## Bulle 3, forme… ») ; la bulle 4 finit avec lui.
    const bloc = tranche(RELAIS, `Bulle ${n}, `, n < 4 ? `Bulle ${n + 1}, ` : 'les boutons « Parcours suivant » et « Terminer », de même poids.');
    const b = { confirme: '', objectif: '', lignes: [], chemins: {} };
    for (const brut of bloc.split('\n')) {
        const l = brut.trim();
        let m;
        if (/^Objectif : « /.test(l)) { b.objectif = citations(l)[0]; continue; }
        if ((m = /^`(\w+)` : /.exec(l))) { b.chemins[m[1]] = { ligne: l, cites: citations(l) }; continue; }
        if ((m = /^\[(C|E|G)\]/.exec(l))) {
            const [texte] = citations(l);
            if (m[1] === 'C') { b.confirme = texte; continue; }
            b.lignes.push({ genre: m[1], texte });
        }
    }
    return b;
}

const seFait = (l) => !l.note && !!(l.fait || l.champs);
const classer = (lignes) => lignes.map((l) => ({ genre: l.note ? 'E' : l.geste ? 'C' : seFait(l) ? 'G' : 'sans genre', texte: l.texte }));
/** Le dernier geste d'une liste devient la consigne (la règle du relais). */
function consigneAuDernier(lignes) {
    const l = lignes.map((x) => ({ ...x }));
    for (let k = l.length - 1; k >= 0; k--) if (l[k].genre === 'G') { l[k].genre = 'C'; break; }
    return l;
}
const dite = (nom) => new RegExp('var ' + nom + " = '((?:[^'\\\\]|\\\\.)*)';").exec(lire('js/parcours-moteur.js'))[1].replace(/\\'/g, "'");

describe('« Mettre tes données à l’abri », « Nous faisons » : les quatre bulles du 19 nov., mot pour mot et dans leur genre', () => {
    const { def, P } = chargerLeParcours();
    const E = P.etapes;

    it('le panneau : le titre, la ligne, quatre étapes, la phrase du refus sans trimestre réel (consigne du 8 nov.)', () => {
        expect(def.titre).toBe("Mettre tes données à l'abri");
        expect(CONSIGNE).toContain(`Titre : « ${def.titre} »`);
        expect(def.ligne).toBe(P.ligne);
        expect(CONSIGNE).toContain(`Ligne : « ${def.ligne} »`);
        expect(def.total).toBe(4);
        expect(CONSIGNE).toContain(`le panneau dit : « ${P.refus} »`);
    });

    it('les titres des quatre bulles', () => {
        expect(E.map((e) => e.titre)).toEqual(['Pourquoi un codex', 'Mettre à jour', 'Range ton fichier', 'Quand le rouvrir']);
        E.forEach((e, i) => expect(RELAIS).toContain(`Bulle ${i + 1}, « ${e.titre} »`));
    });

    it.each([1, 2, 4])('bulle %i : la confirmation et chaque ligne, dans son genre', (n) => {
        const b = bulleDuRelais(n);
        const e = E[n - 1];
        expect(e.confirme ? e.confirme.texte : '').toBe(b.confirme);
        expect(!!e.confirme).toBe(n > 1);
        // La bulle 4 : sa consigne de fin est celle du moteur (jugée plus bas) ; le relais ne la liste pas.
        const lignes = n === 4 ? e.lignes().filter((l) => !l.geste) : e.lignes();
        expect(classer(lignes)).toEqual(consigneAuDernier(b.lignes));
        expect(e.lieu || e.lieuSuite || e.nommeLaSection, 'pas de phrase du lieu dans ce parcours').toBeFalsy();
    });

    it('bulle 3, chemin par chemin : le début commun, puis le geste, la consigne et l’explication du chemin', () => {
        const b = bulleDuRelais(3);
        expect(E[2].confirme.texte).toBe(b.confirme);
        const debut = b.lignes.slice(0, 4);
        const mettre = b.lignes[4];
        expect(debut.every((l) => l.genre === 'E')).toBe(true);
        expect(mettre).toEqual({ genre: 'G', texte: 'Touche « Mettre à jour »' });
        const c = b.chemins;
        const reecriture = c.fenetre.cites[1];
        const attendu = {
            fenetre: [...debut, mettre, { genre: 'C', texte: c.fenetre.cites[0] }, { genre: 'E', texte: reecriture }],
            fenetreManquent: [...debut, mettre, { genre: 'C', texte: c.fenetre.cites[0] }],
            tenu: [...debut, { genre: 'C', texte: c.tenu.cites[0] }, { genre: 'E', texte: reecriture }],
            partage: [...debut, mettre, { genre: 'C', texte: c.partage.cites[0] }],
            telechargement: [...debut, mettre, { genre: 'C', texte: c.telechargement.cites[0] }, { genre: 'E', texte: c.telechargement.cites[1] }]
        };
        // Ce que le relais dit de chaque chemin, relu pour que la table ci-dessus ne s'invente pas.
        expect(c.fenetre.ligne).toContain('Quand des copies manquent (#1012), la même bulle sans cette explication.');
        expect(c.tenu.ligne).toContain('pas de second geste ; « Touche « Mettre à jour » » est la consigne, suivie de la même explication.');
        expect(c.partage.ligne).toContain('rien après.');
        expect(classer(P.lignesEtape3('fenetre', false))).toEqual(attendu.fenetre);
        expect(classer(P.lignesEtape3('fenetre', true))).toEqual(attendu.fenetreManquent);
        expect(classer(P.lignesEtape3('tenu', false))).toEqual(attendu.tenu);
        expect(classer(P.lignesEtape3('partage', false))).toEqual(attendu.partage);
        expect(classer(P.lignesEtape3('telechargement', false))).toEqual(attendu.telechargement);
        // Les lignes de la bulle sont celles de son chemin, choisi à l'entrée de l'étape.
        expect(classer(E[2].lignes())).toEqual(attendu.fenetre);
    });

    it('l’objectif (bulle 1) et l’objectif atteint (bulle 4), sur la définition, relus dans le relais', () => {
        expect(P.definition.objectif).toBe(bulleDuRelais(1).objectif);
        expect(RELAIS).toContain('l\'objectif atteint entre deux filets : « ' + P.definition.objectifAtteint + ' »');
    });

    it('la fin : « Terminer », que le moteur change quand il offre aussi « Parcours suivant »', () => {
        expect(E[3].boutons.map((b) => b.libelle)).toEqual(['Terminer']);
        expect(E[3].sansSortie).toBe(true);
        expect(E.slice(0, 3).every((e) => !e.sansSortie)).toBe(true);
        expect(E[3].lignes().filter((l) => l.geste).map((l) => l.texte)).toEqual(['Touche « Terminer »']);
        // Le relais du 19 nov. écrit la consigne avec « Parcours suivant » ; depuis le 20 nov. (A3), le moteur dit
        // « Voir le parcours N » d'après le panneau (`suiteEcrite`), et rien après le dernier parcours.
        expect(RELAIS).toContain('la consigne « Touche « Parcours suivant », ou « Terminer ». »');
        expect(suiteEcrite(7, 'Lire ta classe').consigne).toBe('Touche « Voir le parcours 7 », ou « Terminer »');
        expect(RELAIS).toContain('« Pour revoir une étape, touche « 4 sur 4 ». »');
    });

    it('le haut du menu Codex sans codex dit la phrase validée (14 h 47), plus l’ancienne', () => {
        const codex = lire('js/codex.js');
        const neuf = 'Pas encore de codex : « Mettre à jour le codex » en crée un avec tes données.';
        expect(CONSIGNE).toContain(`Il devient : « ${neuf} »`);
        expect(codex).toContain(`<div class="codex-statut-etat">${neuf}</div>`);
        expect(codex).not.toContain('ouvre ou crée un codex pour commencer');
    });

    it('aucun produit nommé (règle de Grégoire, 8 nov.)', () => {
        const chemins = ['fenetre', 'tenu', 'partage', 'telechargement'];
        const mots = [def.ligne, P.refus, P.definition.objectif, P.definition.objectifAtteint,
            ...E.flatMap((e) => e.lignes()), ...chemins.flatMap((c) => P.lignesEtape3(c, false))]
            .map((l) => (typeof l === 'string' ? l : l.texte)).join(' ');
        expect(mots).not.toMatch(/\b(Chrome|Edge|Safari|Firefox|iPad|iPhone|Mac|Windows|Google|Dropbox|iCloud|OneDrive)\b/);
    });
});

// ---------------------------------------------------------------------------------------
// 2. LE RAPPEL ATTEND LA FIN DU PARCOURS
// ---------------------------------------------------------------------------------------

/** Un document minimal qui garde ce que le rappel y pose, et le retrouve par id. */
function fauxDocument() {
    const racines = [];
    const creer = () => {
        const el = {
            id: '', className: '', innerHTML: '', enfants: [],
            appendChild(c) { this.enfants.push(c); c.parent = this; },
            remove() { const i = racines.indexOf(this); if (i !== -1) racines.splice(i, 1); },
            setAttribute() {}, addEventListener() {}, style: {},
            classList: { add() {}, remove() {}, contains: () => false, toggle() {} }
        };
        return el;
    };
    const chercher = (liste, id) => {
        for (const el of liste) {
            if (el.id === id) return el;
            const t = chercher(el.enfants, id);
            if (t) return t;
        }
        return null;
    };
    return {
        readyState: 'complete',
        addEventListener() {}, removeEventListener() {},
        querySelector: () => null, querySelectorAll: () => [],
        createElement: creer,
        getElementById: (id) => chercher(racines, id),
        body: { appendChild: (el) => racines.push(el), classList: { add() {}, remove() {}, contains: () => false } }
    };
}

describe('le rappel « Mets ton codex à jour » ne s’ouvre pendant aucun parcours', () => {
    let store, doc, moteur, rappel;
    const ouvert = () => !!doc.getElementById('modal-backup-reminder');

    beforeEach(() => {
        vi.useFakeTimers();
        // Des évaluations réelles, aucun rappel posé : le rappel est DÛ.
        store = { h2026_evaluationsSauvegardees: [{ id: 'e1' }] };
        const db = {
            getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            setSync: (k, v) => { store[k] = v; }
        };
        doc = fauxDocument();
        moteur = { enCours: false, actif() { return this.enCours; } };
        const win = chargerScript('js/modal-backup-reminder.js', { db, document: doc },
            { cle: (k) => `h2026_${k}`, ParcoursMoteur: moteur });
        rappel = win.backupReminder;
    });

    afterEach(() => { vi.useRealTimers(); });

    it('hors parcours, rien ne change : il s’ouvre 1,5 s après l’ouverture de l’application', () => {
        vi.advanceTimersByTime(1600);
        expect(ouvert()).toBe(true);
    });

    it('dû, il ne s’ouvre pas pendant un parcours, ni à l’ouverture ni à un appel direct', () => {
        moteur.enCours = true;
        vi.advanceTimersByTime(1600);
        expect(ouvert()).toBe(false);
        rappel.verifierEtAfficher();
        vi.advanceTimersByTime(60 * 1000);
        expect(ouvert()).toBe(false);
    });

    it('il attend la fin du parcours, puis le même délai qu’à l’ouverture', () => {
        moteur.enCours = true;
        vi.advanceTimersByTime(1600);
        moteur.enCours = false;
        vi.advanceTimersByTime(500);
        expect(ouvert()).toBe(false);
        vi.advanceTimersByTime(1600);
        expect(ouvert()).toBe(true);
    });

    it('une mise à jour réussie pendant le parcours le repousse : à la fin, il n’est plus dû', () => {
        moteur.enCours = true;
        vi.advanceTimersByTime(1600);
        rappel.reporterApresMiseAJourDuCodex();
        moteur.enCours = false;
        vi.advanceTimersByTime(5000);
        expect(ouvert()).toBe(false);
        expect(new Date(store.backupProchainRappel) > new Date()).toBe(true);
    });

    it('un parcours qui en lance un autre ne lui laisse pas de fenêtre', () => {
        moteur.enCours = true;
        vi.advanceTimersByTime(1600);
        moteur.enCours = false;          // « Commencer avec ma classe » : le premier se ferme…
        vi.advanceTimersByTime(600);
        moteur.enCours = true;           // … et le second part avant le délai
        vi.advanceTimersByTime(5000);
        expect(ouvert()).toBe(false);
        moteur.enCours = false;
        vi.advanceTimersByTime(2100);
        expect(ouvert()).toBe(true);
    });
});
