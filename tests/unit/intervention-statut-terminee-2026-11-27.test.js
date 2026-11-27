/**
 * Fiche 4 du lot « Suivi » (décision de Grégoire, 27 nov. 2026) — « TERMINÉE » À LA PLACE DE « COMPLÉTÉE ».
 * Partout où l'utilisateur·rice lit le statut d'une intervention : la pastille, le choix du statut, la liste vide, les
 * deux bulles du parcours 7, l'aide « i » des interventions et la carte d'aide d'index.html. La valeur enregistrée
 * (`completee`) et les identifiants ne changent pas : une intervention déjà enregistrée n'est pas réécrite.
 *
 *   cd tests && npx vitest run unit/intervention-statut-terminee-2026-11-27.test.js
 *
 * Break-test (27 nov. 2026) : les huit phrases remises à « Complétée » / « complétée » → A, B, C, D et E rouges.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { monter, storeBase, elementDom, RACINE } from './_helpers/bac-suivi.js';
import { chargerScript } from './_helpers/charger-script.js';

const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');

const GLOBAUX = {
    determinerNiveauRaiPedagogique: () => ({ niveau: 2, pattern: 'Stable', label: 'x' }), calculerTousLesIndices: () => ({ A: 100, C: 100, P: 80 }),
    calculerMoyennesCriteres: () => ({}), obtenirGrilleReferenceDepistage: () => null, libelleNiveauSOLO: () => '', obtenirSeuil: () => 0.7,
    calculerProgressionArtefacts: () => null, anonymiserTexteRetroaction: (t) => t
};
const terminee = () => ({ id: 'I_T', titre: 'Atelier', date: '2026-09-01', heure: '', duree: 2, type: 'groupe', niveauRai: 2, contexte: 'en-classe',
    description: '', etudiants: [], analyse: null, observations: '', notesIndividuelles: {}, criteresCibles: [], objectifVise: '', statut: 'completee',
    bilan: { atteint: 'oui', suite: 'aucune', observationsBilan: '', dateBilan: 1 }, jamaisSauvegardee: false });

function banc(interventions) {
    const store = storeBase();
    store.test_interventions = interventions;
    const conteneur = elementDom(), liste = elementDom();
    const b = monter(store, { modules: [{ chemin: 'js/interventions.js', internes: ['genererBadgeStatut', 'VOCABULAIRES'] }], globaux: GLOBAUX,
        elements: { conteneurPrincipal: conteneur, listeInterventions: liste } });
    return { b, store, conteneur, interne: b.interne['interventions.js'] };
}

describe('fiche 4 · A — la pastille et le choix du statut', () => {
    it('la pastille d\'une intervention terminée dit « Terminée » ; sa classe ne change pas', () => {
        const { interne } = banc([]);
        expect(interne.genererBadgeStatut('completee')).toBe('<span class="badge-statut-completee">Terminée</span>');
    });

    it('rouverte, la fiche offre « En préparation » ou « Terminée », sur les mêmes valeurs ; rien n\'est réécrit', () => {
        const { b, store, conteneur } = banc([terminee()]);
        const avant = JSON.stringify(store.test_interventions);
        b.win.ouvrirIntervention('I_T', {});
        const html = conteneur.innerHTML;
        expect(html).toMatch(/value="completee" checked[^>]*>\s*<span class="u-texte-09">Terminée<\/span>/);
        expect(html).toMatch(/value="en-cours" [^>]*>\s*<span class="u-texte-09">En préparation<\/span>/);
        expect(html).not.toContain('Complétée');
        expect(JSON.stringify(store.test_interventions)).toBe(avant);
        expect(store.test_interventions[0].statut).toBe('completee');
    });
});

describe('fiche 4 · B — la liste vide', () => {
    it('« Aucune intervention planifiée ou terminée. »', () => {
        expect(banc([]).interne.VOCABULAIRES.interventions.vide).toBe('Aucune intervention planifiée ou terminée.');
    });
});

describe('fiche 4 · C — les deux bulles du parcours 7', () => {
    it('« Je regarde » et « Nous faisons » disent « Terminée »', () => {
        const win = { addEventListener() {}, removeEventListener() {}, Assistance: { enregistrer() {} } };
        chargerScript('js/parcours-lire-ta-classe.js', { db: { getSync: (k, d) => d }, cle: (k) => k }, win);
        const lignes = (cle) => win.ParcoursLireTaClasse.textes[cle].flatMap((b) => b.lignes.concat(b.puis ? b.puis.lignes : [])).map((l) => l[1]);
        expect(lignes('modele')).toContain('Tu choisis ensuite « Terminée » : le « Bilan post-intervention » apparaît. Pour chaque critère ciblé, il compare ses résultats avant et après.');
        expect(lignes('pratique')).toContain('Tu choisis ensuite « Terminée ».');
        expect(lignes('modele').concat(lignes('pratique')).join(' ')).not.toMatch(/[Cc]omplétée/);
    });
});

describe('fiche 4 · D — l\'aide « i » des interventions', () => {
    it('les deux phrases du bilan disent « terminée »', () => {
        const aide = lire('js/accompagnement-contenu-popup.js');
        expect(aide).toContain('"Bilan — Apparaît quand tu marques l\'intervention comme terminée. Comparaison automatique avant/après sur les critères ciblés."');
        expect(aide).toContain('Quand tu marques l’intervention comme terminée, le bilan compare');
        expect(aide).not.toMatch(/intervention comme complétée/);
    });
});

describe('fiche 4 · E — la carte d\'aide d\'index.html', () => {
    it('« le statut, « En préparation » ou « Terminée » »', () => {
        const html = lire('index.html');
        expect(html).toContain('et le statut, «&nbsp;En préparation&nbsp;» ou «&nbsp;Terminée&nbsp;».');
        expect(html).not.toContain('«&nbsp;Complétée&nbsp;»');
    });
});
