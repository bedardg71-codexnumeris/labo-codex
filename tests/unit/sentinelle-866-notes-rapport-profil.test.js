/**
 * SENTINELLE — #866 (15 septembre 2026) : « MES NOTES » DU RAPPORT DU PROFIL.
 *
 * Le bug, dans les mots du rapport testeur du 15 sept. 10 h 06 (BLOQUANT) : « J'ai pris
 * des notes dans la section Rapport du profil étudiant, je suis allé dans une autre
 * section, je suis revenu, et les notes n'étaient plus là. »
 *
 * Mesuré : le texte du rapport n'était enregistré NULLE PART — aucune écriture, aucun
 * écouteur. Le placeholder invitait pourtant à « ajouter tes commentaires ». Ce n'est pas
 * une régression de 1.140.x : #754 (11 sept.) n'avait supprimé que l'effacement PENDANT
 * l'ouverture, et sa sentinelle `tests/integration/profil-754-un-seul-rendu.spec.js` ne
 * fait pas le trajet aller-retour entre sous-sections.
 *
 * Ce que ce banc verrouille :
 *   1. le RENDU n'écrit rien — le rapport reste refait à chaque ouverture (chiffres du jour) ;
 *   2. la frappe écrit après le débounce, pas avant ;
 *   3. le blur (`change`, qui part avant que le clic sur une autre sous-section ne
 *      détruise le nœud) écrit TOUT DE SUITE — c'est ce chemin qui sauve la note ;
 *   3 bis. une navigation faite par du code (`el.click()`) ne déplace pas le focus, donc n'émet
 *      AUCUN `change` : le rendu suivant lit l'écriture en attente, sans rien écrire lui-même ;
 *   4. le texte revient dans le HTML du rendu suivant, échappé ;
 *   5. une note vidée retire son entrée, elle ne laisse pas de chaîne vide ;
 *   6. « Copier » emporte le rapport ET les notes ;
 *   6 bis. en mode anonymisation — l'écran montré à une salle — le champ est vide, désactivé,
 *      et aucun geste n'écrit dans le codex (modes.js conserve le DA RÉEL en anonymisation) ;
 *   7. la clé `<trim>_notesRapport` est au registre de trimestres.js et à DATA-OWNERSHIP.
 *
 * Break-tests montrés (15 sept.) : voir le rapport de session.
 *
 *   cd tests && npx vitest run unit/sentinelle-866-notes-rapport-profil.test.js
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { monter, storeBase, elementDom } from './_helpers/bac-suivi.js';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const lire = (f) => readFileSync(path.join(RACINE, f), 'utf8');
const DA = '2000001';

/** Monte le module du rapport avec ses deux zones de texte et un presse-papiers de banc. */
function monterRapport(store, opts = {}) {
    const copies = [];
    const elements = Object.assign({
        ['textarea-rapport-' + DA]: elementDom({ value: '' }),
        ['textarea-notes-rapport-' + DA]: elementDom({ value: '' })
    }, opts.elements || {});
    const banc = monter(store, {
        modules: ['js/profil-etudiant-calculs.js', 'js/profil-etudiant-rapport.js'],
        elements,
        objetsExportes: ['profilActuelDA', 'etudiantsListeCache'],
        globaux: Object.assign({
            obtenirTermeProduction: () => 'artefact',
            obtenirInterventionsEtudiant: () => [],
            calculerTousLesIndices: () => ({ A: 90, C: 100, P: 77, noteConstructible: true }),
            obtenirDetailsAssiduite: () => ({ periodesPresentes: 18, periodesOffertes: 20, periodesTotal: 20, nbSeances: 10, taux: 90 }),
            evaluationEntreDansLaNote: () => true,
            obtenirIdsProductionsEvaluables: () => [],
            obtenirPratiqueActive: () => null,
            navigator: { clipboard: { writeText: (t) => { copies.push(t); return Promise.resolve(); } } }
        }, opts.globaux || {})
    });
    return Object.assign(banc, { copies, champRapport: elements['textarea-rapport-' + DA], champNotes: elements['textarea-notes-rapport-' + DA] });
}

const clesRapport = (store) => Object.keys(store).filter((k) => /rapport/i.test(k));

describe('#866 — les notes du rapport survivent au changement de sous-section', () => {

    it('1+2+3 · le rendu n\'écrit rien ; la frappe écrit après le débounce ; le blur écrit tout de suite', () => {
        const store = storeBase();
        const b = monterRapport(store);

        // 1. Le rendu seul : rien dans le stockage.
        b.win.genererSectionRapport(DA);
        expect(clesRapport(store)).toEqual([]);

        // 2. La frappe : rien avant l'échéance, la note après.
        b.champNotes.value = 'Rencontre du 12 : dit ne pas comprendre la consigne.';
        b.win.planifierEnregistrementNotesRapport(DA, b.champNotes);
        expect(clesRapport(store)).toEqual([]);          // le stockage n'est pas touché à chaque frappe
        b.avancer(500);
        expect(store.test_notesRapport).toEqual({ [DA]: 'Rencontre du 12 : dit ne pas comprendre la consigne.' });

        // 3. Le blur : écriture immédiate, sans avancer l'horloge. C'est le chemin du bug.
        b.champNotes.value = 'Rencontre du 12 : revoir la consigne avec lui.';
        b.win.enregistrerNotesRapport(DA, b.champNotes);
        expect(store.test_notesRapport[DA]).toBe('Rencontre du 12 : revoir la consigne avec lui.');
        b.restaurerHorloge();
    });

    it('3 bis · le trajet du testeur : taper, quitter la sous-section, revenir — la note est là', () => {
        const store = storeBase();
        const b1 = monterRapport(store);
        b1.win.genererSectionRapport(DA);
        b1.champNotes.value = 'Notes prises le 15 septembre.';
        b1.win.enregistrerNotesRapport(DA, b1.champNotes);   // blur au clic sur « Travaux soumis »
        b1.restaurerHorloge();

        // La section est détruite puis reconstruite : un window neuf sur le MÊME store.
        const b2 = monterRapport(store);
        const html = b2.win.genererSectionRapport(DA);
        expect(html).toContain('Notes prises le 15 septembre.');
        expect(b2.win.obtenirNotesRapport(DA)).toBe('Notes prises le 15 septembre.');
        b2.restaurerHorloge();
    });

    it('3 ter · sans blur (navigation faite par du code), le rendu voit l\'écriture en attente', () => {
        const store = storeBase();
        const b = monterRapport(store);
        b.win.genererSectionRapport(DA);
        b.champNotes.value = 'Tapé, jamais quitté.';
        b.win.planifierEnregistrementNotesRapport(DA, b.champNotes);   // input seul : rien d'écrit encore
        expect(clesRapport(store)).toEqual([]);
        // Le rendu suivant, AVANT l'échéance du débounce : la note est là quand même.
        expect(b.win.genererSectionRapport(DA)).toContain('Tapé, jamais quitté.');
        expect(b.win.obtenirNotesRapport(DA)).toBe('Tapé, jamais quitté.');
        expect(clesRapport(store)).toEqual([]);                        // et lire n'a rien écrit
        b.avancer(500);
        expect(store.test_notesRapport[DA]).toBe('Tapé, jamais quitté.');
        b.restaurerHorloge();
    });

    it('3 quater · l\'attente d\'un élève ne déborde pas sur un autre', () => {
        const store = storeBase();
        store.test_notesRapport = { '2000002': 'Celle de Bruno' };
        const b = monterRapport(store);
        b.champNotes.value = 'Celle d\'Alice, pas encore écrite';
        b.win.planifierEnregistrementNotesRapport(DA, b.champNotes);
        expect(b.win.obtenirNotesRapport('2000002')).toBe('Celle de Bruno');
        expect(b.win.obtenirNotesRapport('2000003')).toBe('');
        b.restaurerHorloge();
    });

    it('4 · le texte revient échappé — un chevron ne referme pas le textarea', () => {
        const store = storeBase();
        store.test_notesRapport = { [DA]: 'Il écrit <script>alert(1)</script> partout' };
        const b = monterRapport(store);
        const html = b.win.genererSectionRapport(DA);
        expect(html).toContain('&lt;script&gt;');
        expect(html).not.toContain('<script>alert(1)');
        b.restaurerHorloge();
    });

    it('5 · une note vidée retire son entrée ; les autres élèves ne bougent pas', () => {
        const store = storeBase();
        store.test_notesRapport = { [DA]: 'À effacer', '2000002': 'Celle de Bruno reste' };
        const b = monterRapport(store);
        b.champNotes.value = '   ';
        b.win.enregistrerNotesRapport(DA, b.champNotes);
        expect(store.test_notesRapport).toEqual({ '2000002': 'Celle de Bruno reste' });
        b.restaurerHorloge();
    });

    it('6 · « Copier » emporte le rapport ET les notes ; sans notes, le rapport seul', () => {
        const store = storeBase();
        const b = monterRapport(store);
        b.champRapport.value = 'Alice Assidu\n\nAssiduité : 90%\n';

        b.champNotes.value = '';
        b.win.copierRapport(DA);
        expect(b.copies.at(-1)).toBe('Alice Assidu\n\nAssiduité : 90%\n');   // rien d'ajouté sans notes

        b.champNotes.value = 'Rencontre du 12.';
        b.win.copierRapport(DA);
        expect(b.copies.at(-1)).toBe('Alice Assidu\n\nAssiduité : 90%\n\nNotes de l\'enseignant :\nRencontre du 12.');
        b.restaurerHorloge();
    });

    it('6 bis · en mode anonymisation, le champ est vide, désactivé, et rien ne s\'écrit', () => {
        const store = storeBase();
        store.test_notesRapport = { [DA]: 'Ce que Grégoire pense de cet élève' };
        const b = monterRapport(store, { globaux: { estModeeLectureSeule: () => true } });

        const html = b.win.genererSectionRapport(DA);
        expect(html).not.toContain('Ce que Grégoire pense de cet élève');   // rien à projeter devant une salle
        expect(html).toContain('disabled');
        expect(html).not.toContain('data-on-input="planifierEnregistrementNotesRapport"');

        // Et si un geste passait quand même : le codex n'est pas touché.
        b.champNotes.value = 'Écrit pendant une démonstration';
        b.win.enregistrerNotesRapport(DA, b.champNotes);
        expect(store.test_notesRapport).toEqual({ [DA]: 'Ce que Grégoire pense de cet élève' });
        b.restaurerHorloge();
    });

    it('7 · la clé est namespacée par trimestre, inscrite au registre et à DATA-OWNERSHIP', () => {
        const store = storeBase();
        const b = monterRapport(store);
        b.champNotes.value = 'x';
        b.win.enregistrerNotesRapport(DA, b.champNotes);
        expect(Object.keys(store)).toContain('test_notesRapport');       // préfixée, jamais nue
        expect(Object.keys(store)).not.toContain('notesRapport');
        expect(lire('js/trimestres.js')).toMatch(/'notesRapport',/);
        expect(lire('docs/DATA-OWNERSHIP.md')).toMatch(/`<trim>_notesRapport`/);
        b.restaurerHorloge();
    });

    it('7 bis · le champ est branché au dispatcher (zéro handler inline) et le rapport reste non enregistré', () => {
        const code = lire('js/profil-etudiant-rapport.js');
        expect(code).toMatch(/data-on-input="planifierEnregistrementNotesRapport"/);
        expect(code).toMatch(/data-on-change="enregistrerNotesRapport"/);
        expect(code).not.toMatch(/\son(click|input|change|blur)=/);
        // Le rapport lui-même : toujours refait, jamais écrit — sinon on copierait des chiffres périmés.
        expect(code).not.toMatch(/setSync\([^)]*rapportEdite|setSync\(cle\('rapport'/);
    });
});
