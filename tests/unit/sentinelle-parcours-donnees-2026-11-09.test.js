// =======================================================================
// LE SIXIÈME PARCOURS, « METTRE TES DONNÉES À L'ABRI » — 9 NOVEMBRE 2026
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-6-donnees-a-l-abri.md.
//   1. Les mots : les quatre bulles, la ligne du panneau, la phrase du refus et le haut du
//      menu Codex sans codex sont ceux que Grégoire a validés le 8 nov. Chaque chaîne posée
//      dans le code se trouve TELLE QUELLE dans la consigne ; à l'étape 3, chaque chemin
//      d'écriture compose le texte commun et sa phrase.
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
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

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

describe('« Mettre tes données à l’abri » : les mots validés, tels quels', () => {
    const { def, P } = chargerLeParcours();

    it('le panneau : le titre, la ligne, quatre étapes, la phrase du refus sans trimestre réel', () => {
        expect(def.titre).toBe("Mettre tes données à l'abri");
        expect(CONSIGNE).toContain(`Titre : « ${def.titre} »`);
        expect(def.ligne).toBe(P.ligne);
        expect(CONSIGNE).toContain(`Ligne : « ${def.ligne} »`);
        expect(def.total).toBe(4);
        expect(CONSIGNE).toContain(`le panneau dit : « ${P.refus} »`);
    });

    it.each([0, 1, 2, 3])('étape %i (de 0) : le titre est celui de la consigne', (i) => {
        expect(CONSIGNE).toContain(`Étape ${i + 1}, « ${P.etapes[i].titre} »`);
    });

    it.each([0, 1, 3])('étape %i (de 0) : le texte est celui de la consigne', (i) => {
        expect(CONSIGNE).toContain(`Texte : « ${P.etapes[i].texte} »`);
    });

    it('étape 3 : le texte commun encadre la phrase « selon le navigateur »', () => {
        const avec = P.texteEtape3('telechargement', false);
        const [debut, fin] = avec.split(' ' + P.phrases.telechargement + ' ');
        expect(CONSIGNE).toContain(`Texte : « ${debut} [Phrase selon le navigateur.] ${fin} »`);
    });

    it('étape 3 : les trois phrases de la consigne, chacune selon son chemin', () => {
        const { fenetre1, fenetre2, partage, telechargement } = P.phrases;
        expect(CONSIGNE).toContain(`Fenêtre de choix d'emplacement : « ${fenetre1} ${fenetre2} »`);
        expect(CONSIGNE).toContain(`Feuille de partage : « ${partage} »`);
        expect(CONSIGNE).toContain(`Téléchargement : « ${telechargement} »`);
        expect(P.texteEtape3('fenetre', false)).toContain(fenetre1 + ' ' + fenetre2 + ' ');
        expect(P.texteEtape3('partage', false)).toContain(' ' + partage + ' ');
        expect(P.texteEtape3('telechargement', false)).toContain(' ' + telechargement + ' ');
    });

    it('étape 3 : le fichier tenu prend la phrase de la fenêtre sans sa première phrase (consigne)', () => {
        const t = P.texteEtape3('tenu', false);
        expect(t).toContain(' ' + P.phrases.fenetre2 + ' ');
        expect(t).not.toContain(P.phrases.fenetre1);
    });

    it('étape 3 : des copies qui manquent, la fenêtre sans la phrase de la réécriture (#1012, proposé)', () => {
        const t = P.texteEtape3('fenetre', true);
        expect(t).toContain(' ' + P.phrases.fenetre1 + ' ');
        expect(t).not.toContain(P.phrases.fenetre2);
    });

    it('étape 4 : le bouton « Terminer », sans lien de sortie ; les autres étapes en ont un', () => {
        expect(P.etapes[3].boutons.map((b) => b.libelle)).toEqual(['Terminer']);
        expect(CONSIGNE).toContain('Bouton « Terminer »');
        expect(P.etapes[3].sansSortie).toBe(true);
        expect(P.etapes.slice(0, 3).every((e) => !e.sansSortie)).toBe(true);
    });

    it('le haut du menu Codex sans codex dit la phrase validée (14 h 47), plus l’ancienne', () => {
        const codex = lire('js/codex.js');
        const neuf = 'Pas encore de codex : « Mettre à jour le codex » en crée un avec tes données.';
        expect(CONSIGNE).toContain(`Il devient : « ${neuf} »`);
        expect(codex).toContain(`<div class="codex-statut-etat">${neuf}</div>`);
        expect(codex).not.toContain('ouvre ou crée un codex pour commencer');
    });

    it('aucun produit nommé dans les mots neufs (règle de Grégoire, 8 nov.)', () => {
        const mots = [def.ligne, P.refus, ...P.etapes.map((e) => e.texte),
            ...Object.values(P.phrases)].join(' ');
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
