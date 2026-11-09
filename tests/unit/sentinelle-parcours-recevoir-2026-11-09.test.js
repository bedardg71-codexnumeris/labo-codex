// =======================================================================
// LE QUATRIÈME PARCOURS (9 NOV. 2026) : LES MOTS DE « RECEVOIR LES PRODUCTIONS, RENDRE TES RÉTROACTIONS »
// =======================================================================
// plans de travail/CONSIGNE-LOT-2026-11-08-parcours-4-recevoir-et-rendre.md.
//   1. Les bulles sont celles que Grégoire a validées le 8 nov. (8 h 49 à 9 h 15, revues de 14 h 24 à 14 h 30), avec
//      les CORRECTIONS du 9 nov. (10 h 01 à 10 h 04, relayées par Cowork : étapes 5 et 7). Chaque texte, LU À
//      L'EXÉCUTION, est égal au texte de la consigne auquel on applique ces corrections ; chaque correction doit
//      trouver dans la consigne la phrase qu'elle remplace.
//   2. Les deux voies : neuf bulles avec fichiers, quatre sans (« n sur 4 ») ; la variante sans fichier des étapes 6
//      et 7 ; « Rien à importer » à la bulle 1 ; « Plus tard » partout sauf la dernière ; « Terminer ».
//   3. Le panneau : le titre, la ligne, la phrase du refus.
// Break-test (9 nov.) : « choisis « Évaluer » » changé en « touche « Évaluer » » dans js/parcours-recevoir.js → ROUGE
// (étape 5), rétabli.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerScript } from './_helpers/charger-script.js';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONSIGNE = readFileSync(path.join(racine, 'plans de travail/CONSIGNE-LOT-2026-11-08-parcours-4-recevoir-et-rendre.md'), 'utf8');
const lignes = CONSIGNE.split('\n');

function ligneEtape(n) { return lignes.find((l) => l.startsWith(`Étape ${n}, «`)); }
function titreDeLaConsigne(n) { const m = ligneEtape(n).match(/^Étape \d, « (.*?) »\./); return m ? m[1] : null; }
function texteDe(ligne) { const m = ligne && ligne.match(/Texte : « (.*?) » ?(?:Avance|Bouton|Sur la voie|Pas de bulle|$)/); return m ? m[1] : null; }

// [étape, phrase de la consigne, phrase validée le 9 nov.]
const CORRECTIONS = [
    [5, 'Quand tu as fini, touche « Actions › Évaluer », au-dessus de la production.',
        'Quand tu as fini, touche « Annoter ▾ », au-dessus de la production, et choisis « Évaluer ».'],
    [7, 'Relis-les comme ton étudiant·e les lira et retouche-les au besoin, directement dans le cadre.',
        'Relis-les comme ton étudiant·e les lira. Un mot personnel ? Écris-le dans « Un mot pour ton étudiant·e ».'],
    [7, 'Plus tes descripteurs et ta cartouche sont précis, plus le niveau se choisit sans hésiter, et plus ton étudiant·e comprend ce que tu as constaté dans sa production.',
        'Plus ta cartouche est précise, plus ton étudiant·e comprend ce que tu as constaté dans sa production.']
];

function corriger(n, t) {
    for (const [, avant, apres] of CORRECTIONS.filter((c) => c[0] === n)) {
        if (!t.includes(avant)) throw new Error(`étape ${n} : la consigne ne porte pas « ${avant} »`);
        t = t.replace(avant, apres);
    }
    return t;
}

function texteValide(n) { return corriger(n, texteDe(ligneEtape(n))); }

/** L'étape 6 : ses deux variantes, sur les deux lignes qui suivent son titre. */
function texte6(variante) {
    const l = lignes.find((x) => x.startsWith(variante === 'fichier' ? '- Production importée' : '- Voie sans fichier'));
    return l.match(/Texte : « (.*) »$/)[1];
}

/** L'étape 7 sans fichier : la deuxième phrase devient celle que la consigne donne. */
function texte7SansFichier() {
    const l = ligneEtape(7);
    const deuxieme = l.match(/Sur la voie sans fichier, la deuxième phrase devient : « (.*?) » Avance/)[1];
    return texteValide(7).replace("« Générale » reprend les phrases de ta cartouche, critère par critère ; « Spécifique », celles de tes tampons, avec le nombre de fois où tu les as posés.", deuxieme);
}

function charger() {
    const enregistres = [];
    const win = {
        Assistance: { enregistrer: (d) => enregistres.push(d), definirEtat() {}, etatDe: () => ({ etat: 'a-faire', etape: 0 }) },
        ParcoursMoteur: { visible: () => false, premierVisible: () => null, actif: () => false, etapeCourante: () => null }
    };
    const document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: { classList: { toggle() {} } } };
    chargerScript('js/parcours-recevoir.js', { document }, win);
    return { def: enregistres[0], api: win.ParcoursRecevoir };
}

describe('« Recevoir les productions, rendre tes rétroactions » : les bulles, mot pour mot (consigne + corrections du 9 nov.)', () => {
    const { def, api } = charger();
    const voies = api.voies();
    const F = voies.fichiers, S = voies['sans-fichier'];

    it('le panneau : le titre, la ligne, neuf étapes avec fichiers, quatre sans', () => {
        expect(def.titre).toBe('Recevoir les productions, rendre tes rétroactions');
        expect(CONSIGNE).toContain(`Titre : « ${def.titre} ». Ligne : « ${def.ligne} »`);
        expect(F).toHaveLength(9);
        expect(S).toHaveLength(4);
        expect(def.total).toBe(9);   // la voie retenue : avec fichiers, tant qu'aucune n'est choisie
    });

    it('chaque correction trouve, dans la consigne, la phrase qu’elle remplace', () => {
        for (const [n, avant] of CORRECTIONS) expect(texteDe(ligneEtape(n)), `étape ${n}`).toContain(avant);
    });

    it.each([1, 2, 3, 4, 5, 7, 8, 9])('étape %i (avec fichiers) : le titre et le texte validés', (n) => {
        expect(F[n - 1].titre).toBe(titreDeLaConsigne(n));
        expect(F[n - 1].texte).toBe(texteValide(n));
    });

    it('étape 6 : ses deux variantes, avec et sans fichier', () => {
        expect(F[5].titre).toBe(titreDeLaConsigne(6));
        expect(F[5].texte).toBe(texte6('fichier'));
        expect(S[0].titre).toBe(titreDeLaConsigne(6));
        expect(S[0].texte).toBe(texte6('sans'));
    });

    it('étape 7 sans fichier : la deuxième phrase de la consigne, le reste corrigé comme avec fichiers', () => {
        expect(S[1].titre).toBe(titreDeLaConsigne(7));
        expect(S[1].texte).toBe(texte7SansFichier());
    });

    it('les étapes 8 et 9 sont les mêmes sur les deux voies', () => {
        expect(S[2]).toBe(F[7]);
        expect(S[3]).toBe(F[8]);
    });

    it('« Rien à importer » à la bulle 1 ; « Terminer » à la dernière, sans « Plus tard » ; la 9 au centre', () => {
        expect(F[0].boutons.map((b) => b.libelle)).toEqual(['Rien à importer']);
        expect(F[8].boutons.map((b) => b.libelle)).toEqual(['Terminer']);
        expect(F[8].sansSortie).toBe(true);
        expect(F[8].centre).toBe(true);
        expect(F.slice(0, 8).every((e) => !e.sansSortie)).toBe(true);
    });

    it('la phrase du refus est celle que Grégoire a validée (8 nov., 14 h 30)', () => {
        const m = CONSIGNE.match(/le panneau dit : « (Commence par .*?) » \(texte validé par Grégoire, 14 h 30\)/);
        expect(m).not.toBeNull();
        // Sans groupe-cours actif (le banc n'en a pas), le refus est dit.
        expect(api.condition()).toBe(m[1]);
    });
});
