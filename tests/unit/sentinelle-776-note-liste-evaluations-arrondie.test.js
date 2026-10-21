/**
 * SENTINELLE #776 — LA NOTE DE LA LISTE DES ÉVALUATIONS EST ARRONDIE.
 *
 * Symptôme vécu (capture de Grégoire, 7 sept. 2026, 1.124.x) : la colonne
 * « Note % » affichait « 92.52136752136752% » et « 89.23679060665361% ».
 * `genererLigneHTML` (js/liste-evaluations.js) écrivait `ligne.noteChiffree`
 * brut, alors que la note ORIGINALE d'une reprise, quinze lignes plus haut dans
 * la même fonction, était arrondie à une décimale depuis toujours.
 *
 * Source d'affichage seulement : la valeur stockée n'est pas touchée, et le
 * stock déjà écrit chez Grégoire n'est ni lu ni réparé (« tarir n'est pas
 * réparer »). Rien à migrer — c'est le rendu qui mentait, pas la donnée.
 *
 * Mesure : `js/liste-evaluations.js` RÉEL, chargé par le même patron que le
 * banc d'échappement #562, sur des lignes dont la note porte les décimales de
 * la capture.
 *
 * BREAK-TEST attendu : rendre à `arrondirNoteAffichee` la valeur telle quelle
 * (`return valeur;`) → les cas A rougissent en affichant la note longue.
 */
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

function echapperHtmlReel(texte) {
    if (texte == null) return '';
    return String(texte).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function charger() {
    return chargerScript('js/liste-evaluations.js', {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null), set: async () => {}, setSync: () => {} },
        cle: (k) => 'test_' + k,
        echapperHtml: echapperHtmlReel,
        obtenirLibelleStatut: (s) => 'Statut ' + s,
        obtenirDonneesSelonMode: () => [],
        notifications: { succes() {}, erreur() {}, info() {}, warning() {} },
        // 21 oct. 2026 : la vraie fonction d'affichage de la note (js/note-pourcentage.js).
        formaterNotePourcentage: chargerScript('js/note-pourcentage.js').formaterNotePourcentage
    });
}

/** Une ligne évaluée minimale, dont seule la note varie. */
function ligneEvaluee(noteChiffree) {
    return {
        da: '2000001', nom: 'Nom', prenom: 'Prénom', productionNom: 'Production',
        evaluationId: 'EV1', productionId: 'PR1',
        statut: 'evalue', statutRemise: 'remis', statutWorkflow: 'evalue',
        niveauFinal: 'M', noteChiffree
    };
}

/** Ce que la colonne « Note % » affiche, sans le balisage. */
function noteAffichee(html) {
    const m = /<strong>([^<]*)%<\/strong>/.exec(html);
    return m ? m[1] : null;
}

describe('#776 · A — la colonne Note % ne montre plus les décimales de calcul', () => {
    it('les deux valeurs de la capture du 7 sept. s\'affichent à une décimale', () => {
        const win = charger();
        expect(noteAffichee(win._genererLigneHTML(ligneEvaluee(92.52136752136752)))).toBe('92.5');
        expect(noteAffichee(win._genererLigneHTML(ligneEvaluee(89.23679060665361)))).toBe('89.2');
    });

    it('un entier reste un entier, et l\'arrondi monte quand il doit monter', () => {
        const win = charger();
        expect(noteAffichee(win._genererLigneHTML(ligneEvaluee(80)))).toBe('80');
        expect(noteAffichee(win._genererLigneHTML(ligneEvaluee(79.96)))).toBe('80');
        expect(noteAffichee(win._genererLigneHTML(ligneEvaluee(0)))).toBe('0');
    });

    it('une note « remplacée » passe par la même règle que « évaluée »', () => {
        const win = charger();
        const ligne = { ...ligneEvaluee(74.4444), statut: 'remplacee' };
        expect(noteAffichee(win._genererLigneHTML(ligne))).toBe('74.4');
    });
});

describe('#776 · B — l\'arrondi ne casse ni l\'échappement ni les autres colonnes', () => {
    it('une valeur non numérique reste rendue telle quelle, échappée — jamais « NaN »', () => {
        const win = charger();
        const html = win._genererLigneHTML(ligneEvaluee('<i>80</i>'));
        expect(html).not.toContain('NaN');
        expect(html).not.toContain('<i>80</i>');
        expect(html).toContain('&lt;i&gt;80&lt;/i&gt;');
    });

    it('la note ORIGINALE d\'une reprise garde son arrondi d\'avant (:1105)', () => {
        const win = charger();
        const html = win._genererLigneHTML({
            ...ligneEvaluee(88.888), badgeType: 'nouvelle-reprise', verrouille: true,
            scoresOriginaux: { niveauFinal: 'D', noteFinale: 62.3456 }
        });
        expect(html).toContain('(était D · 62.3%)');
    });

    it('« non remis » et « non recevable » affichent toujours --, pas un arrondi', () => {
        const win = charger();
        const nonRemis = win._genererLigneHTML({ ...ligneEvaluee(92.52136752136752), statutRemise: 'non-remis' });
        expect(noteAffichee(nonRemis)).toBe(null);
        expect(nonRemis).toContain('--');
        const nonRecevable = win._genererLigneHTML({ ...ligneEvaluee(92.52136752136752), statut: 'non-recevable' });
        expect(nonRecevable).toContain('--');
    });
});
