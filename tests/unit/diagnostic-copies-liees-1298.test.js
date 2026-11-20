// #1298 (19 nov. 2026) — le diagnostic des copies liées à leur source (js/diagnostic-copies-liees.js), sa partie
// pure : ce qu'il compte pour un lien (l'IDENTITÉ d'un objet, jamais l'égalité de contenu), ce qu'il nomme (les
// ressources) et ce qu'il tait (les autres collections : un nombre, une clé aux chiffres masqués). Données fictives.
// La lecture de la base, en lecture seule, est éprouvée au navigateur : tests/integration/diagnostic-copies-liees-1298.spec.js.
import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';

const { DiagnosticCopiesLiees: D } = chargerScript('js/diagnostic-copies-liees.js');

/** Une grille et sa copie qui partage SES critères (la forme laissée par l'ancien « Dupliquer »). */
function paireLiee() {
    const criteres = [{ id: 'CR_1', nom: 'Pertinence fictive', descripteurs: { parNiveau: { D: 'texte' } } }];
    return [{ id: 'G_SRC', nom: 'Grille fictive', criteres }, { id: 'G_COPIE', nom: 'Grille fictive (copie)', criteres }];
}

describe('#1298 · analyserListe — un lien est une identité, pas une ressemblance', () => {
    it('une copie qui partage le tableau de critères de sa source : une paire, par ce chemin', () => {
        expect(D.analyserListe(paireLiee())).toEqual([{ a: 0, b: 1, chemins: ['criteres'] }]);
    });

    it('deux grilles au contenu identique mais aux objets distincts : aucune paire', () => {
        const [s, c] = paireLiee();
        const independante = JSON.parse(JSON.stringify(c));
        expect(D.analyserListe([s, independante])).toEqual([]);
    });

    it('un sous-objet partagé plus bas (descripteurs d’un critère) est trouvé à son chemin', () => {
        const descripteurs = { parNiveau: { D: 'texte' } };
        const l = [
            { id: 'A', nom: 'A', criteres: [{ id: 'CR_1', descripteurs }] },
            { id: 'B', nom: 'B', criteres: [{ id: 'CR_1', descripteurs }] }
        ];
        expect(D.analyserListe(l)).toEqual([{ a: 0, b: 1, chemins: ['criteres.0.descripteurs'] }]);
    });

    it('un objet partagé À L’INTÉRIEUR d’un seul élément n’est pas une paire', () => {
        const niveau = { code: 'D' };
        expect(D.analyserListe([{ id: 'A', niveaux: [niveau, niveau] }, { id: 'B', niveaux: [{ code: 'D' }] }])).toEqual([]);
    });

    it('une source et deux copies liées : deux paires, chacune avec la source', () => {
        const criteres = [{ id: 'CR_1' }];
        const l = [{ id: 'S', criteres }, { id: 'C1', criteres }, { id: 'C2', criteres }];
        expect(D.analyserListe(l)).toEqual([{ a: 0, b: 1, chemins: ['criteres'] }, { a: 0, b: 2, chemins: ['criteres'] }]);
    });

    it('le même élément deux fois dans la liste : une paire « élément entier »', () => {
        const g = { id: 'G', criteres: [] };
        expect(D.analyserListe([g, g])).toEqual([{ a: 0, b: 1, chemins: ['(l’élément entier)'] }]);
    });

    it('ce qui n’est pas une liste ne rend rien', () => {
        expect(D.analyserListe(null)).toEqual([]);
        expect(D.analyserListe({ a: 1 })).toEqual([]);
    });
});

describe('#1298 · analyserEnregistrements — ce qui est nommé, ce qui est tu, ce qui n’est pas lu', () => {
    const enregistrements = () => {
        const autres = { notes: [1, 2] };
        return [
            { key: 'a2026_grillesTemplates', value: paireLiee() },
            { key: 'bibliothequeEchelles', value: [{ id: 'E1', nom: 'Échelle' }, { id: 'E2', nom: 'Autre' }] },
            { key: 'h2026_grillesTemplates', value: paireLiee() },                                   // trimestre fermé
            { key: 'a2026_profil_1234567', value: [{ id: 'X', nom: 'Nom fictif', d: autres }, { id: 'Y', nom: 'Autre nom fictif', d: autres }] },
            { key: 'a2026_cartouches_GRILLE_9', value: (() => { const c = [{ id: 'CR_1' }]; return [{ id: 'K1', nom: 'Cartouche', criteres: c }, { id: 'K2', nom: 'Cartouche (copie)', criteres: c }]; })() },
            { key: 'trimestreActif', value: 'a2026' }
        ];
    };

    it('nomme les paires de ressources, avec leur famille, leur clé et leurs chemins', () => {
        const r = D.analyserEnregistrements(enregistrements());
        expect(r.ressources.map((x) => [x.famille, x.cle, x.source, x.copie, x.chemins])).toEqual([
            ['Grilles', 'a2026_grillesTemplates', '« Grille fictive » (G_SRC)', '« Grille fictive (copie) » (G_COPIE)', ['criteres']],
            ['Cartouches', 'a2026_cartouches_GRILLE_9', '« Cartouche » (K1)', '« Cartouche (copie) » (K2)', ['criteres']]
        ]);
    });

    it('ne lit pas les trimestres fermés (a2025, h2026) et le dit', () => {
        const r = D.analyserEnregistrements(enregistrements());
        expect(r.ignoreesFermees).toEqual(['h2026']);
        expect(r.ressources.some((x) => x.cle.startsWith('h2026_'))).toBe(false);
        expect(r.lues).toBe(4);   // les listes lues, hors trimestre fermé (la valeur non-liste ne compte pas)
    });

    it('hors ressources : un nombre et une clé aux chiffres masqués, jamais un nom d’élément', () => {
        const r = D.analyserEnregistrements(enregistrements());
        expect(r.autres).toEqual([{ cle: 'a2026_profil_#', paires: 1 }]);
        const texte = D.formaterRapport(r, {});
        expect(texte).not.toContain('Nom fictif');
        expect(texte).not.toContain('1234567');
        expect(texte).toContain('a2026_profil_# : 1 paire');
    });

    it('le texte à relayer : les paires, puis une phrase quand il n’y a rien', () => {
        const r = D.analyserEnregistrements(enregistrements());
        const texte = D.formaterRapport(r, { quand: '19 novembre 2026, 21 h', appareil: 'iPad, Safari' });
        expect(texte).toContain('2 paires liées :');
        expect(texte).toContain('· Grilles [a2026_grillesTemplates] : « Grille fictive » (G_SRC) et « Grille fictive (copie) » (G_COPIE) partagent criteres');
        expect(texte).toContain('trimestres fermés non lus : h2026');
        const vide = D.formaterRapport(D.analyserEnregistrements([{ key: 'a2026_grillesTemplates', value: [] }]), {});
        expect(vide).toContain('Aucune copie liée parmi les grilles, échelles, cartouches, productions et pratiques.');
        expect(vide).toContain('Autres collections : aucun objet partagé.');
    });

    it('reconnaît chaque famille de ressources par sa clé', () => {
        expect(['bibliothequeGrilles', 'a2026_echellesTemplates', 'a2026_cartouches_G', 'a2026_productions', 'a2026_pratiquesConfigurables', 'a2026_evaluationsSauvegardees']
            .map(D.familleDeCle)).toEqual(['Bibliothèque des grilles', 'Échelles', 'Cartouches', 'Productions', 'Pratiques', null]);
    });
});
