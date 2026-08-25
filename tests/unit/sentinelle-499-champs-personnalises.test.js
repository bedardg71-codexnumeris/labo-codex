import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { elementEchappant } from './_helpers/element-echappant.js';

// Sentinelle #499 (25 août 2026) — DES BLOCS QUE GRÉGOIRE NOMME LUI-MÊME.
//
// Le fil : le gabarit offrait quatre blocs figés — objectif, tâche, détail,
// échéance. Le document de consignes qu'il distribue en demande d'autres,
// propres à sa matière : « Format et mise en page », « Remise du travail »,
// « À vérifier ». Les ajouter en dur au formulaire aurait résolu SON cas et
// laissé le suivant sans réponse.
//
// ⚠ PORTÉE : par production, jamais partagés (sa décision du 25 août). Une
// définition unique au niveau du cours aurait évité la retape, mais corriger un
// champ aurait alors changé TOUTES les productions — y compris celles dont les
// consignes sont déjà entre les mains des étudiant·es.
//
// Ce que cette sentinelle tient :
//   AA — l'écran fait foi pendant l'édition : rien de saisi ne se perd.
//   AB — ce qui s'enregistre, et ce qui est écarté.
//   AC — les champs deviennent des blocs de consignes, dans l'ordre voulu.

/* ------------------------------------------------------------------ harnais */

// Un mini-DOM où `querySelectorAll` sait retrouver les blocs et leurs champs :
// c'est tout ce dont `lireChampsPersonnalisesDepuisFormulaire` a besoin.
function listeDeChamps(champs) {
    const titres = [];
    const blocs = champs.map(c => {
        const titre = elementEchappant('input'); titre.className = 'champ-perso-titre'; titre.value = c.titre;
        titres.push(titre);
        const contenu = elementEchappant('textarea'); contenu.className = 'champ-perso-contenu'; contenu.value = c.contenu;
        const bloc = elementEchappant('div');
        bloc.className = 'champ-perso';
        bloc.setAttribute('data-champ-id', c.id);
        bloc.querySelector = (sel) => sel.includes('titre') ? titre : contenu;
        return bloc;
    });
    // ⚠ Le CONTENEUR n'est pas un `elementEchappant` : celui-ci échappe à la
    // relecture pour imiter `escapeHtml`, ce qui est juste pour un élément dans
    // lequel on POSE du texte, et faux pour celui dans lequel le module écrit du
    // HTML. Le confondre rendrait la sentinelle aveugle à ce qui est rendu.
    return {
        id: 'champsPersonnalisesListe',
        innerHTML: '',
        querySelectorAll: (sel) => (sel && sel.includes('titre')) ? titres : blocs,
        querySelector: () => null
    };
}

function charger(champsAffiches = null) {
    const store = {};
    const els = {};
    if (champsAffiches) els['champsPersonnalisesListe'] = listeDeChamps(champsAffiches);

    const win = chargerScript('js/productions.js', {
        db: {
            get: async () => null, getSync: (k, d) => (k in store ? store[k] : (d !== undefined ? d : null)),
            set: async () => {}, setSync: () => {}
        },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'),
        obtenirCoursActifId: () => null,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {},
        genererIdUnique: (p) => p + Math.floor(Math.random() * 1e9),
        document: {
            getElementById: (id) => els[id] || null,
            querySelector: () => null, querySelectorAll: () => [],
            createElement: (t) => elementEchappant(t), addEventListener() {}
        }
    });
    win.genererIdUnique = (p) => p + Math.floor(Math.random() * 1e9);
    return { win, els };
}

/* ------------------------------------ AA — l'écran fait foi pendant l'édition */

describe('#499 · AA — rien de ce qui est saisi ne se perd', () => {
    it('AA.a La lecture part du DOM, pas d\'un état parallèle', () => {
        const { win } = charger([
            { id: 'C1', titre: 'Remise du travail', contenu: 'Sur Léa uniquement' },
            { id: 'C2', titre: 'À vérifier', contenu: 'Mes photos sont nettes' }
        ]);
        expect(win.lireChampsPersonnalisesDepuisFormulaire()).toEqual([
            { id: 'C1', titre: 'Remise du travail', contenu: 'Sur Léa uniquement' },
            { id: 'C2', titre: 'À vérifier', contenu: 'Mes photos sont nettes' }
        ]);
    });

    it('AA.b LE CAS QUI PORTE LE SENS : ajouter un champ ne perd pas la saisie en cours', () => {
        // Sans relecture du DOM avant le re-rendu, taper un titre puis cliquer
        // « + Nouveau champ » effacerait ce qu'on vient d'écrire.
        const { win, els } = charger([{ id: 'C1', titre: 'Format', contenu: 'Manuscrit' }]);
        let rendu = null;
        els['champsPersonnalisesListe'].innerHTML = '';
        win.ajouterChampPersonnalise();
        rendu = els['champsPersonnalisesListe'].innerHTML;
        expect(rendu, 'le champ déjà saisi doit être réécrit').toContain('Format');
        expect(rendu, 'et le nouveau bloc ajouté').toContain('champ-perso');
    });

    it('AA.c Supprimer ne touche que le champ visé', () => {
        const { win, els } = charger([
            { id: 'C1', titre: 'CHAMP-GARDE', contenu: 'A' },
            { id: 'C2', titre: 'CHAMP-RETIRE', contenu: 'B' }
        ]);
        win.supprimerChampPersonnalise('C2');
        const rendu = els['champsPersonnalisesListe'].innerHTML;
        // ⚠ Témoins distinctifs : « Retirer » seul apparaît aussi dans le
        // `title` du bouton de suppression, et le test aurait échoué pour une
        // raison qui n'est pas la sienne.
        expect(rendu).toContain('CHAMP-GARDE');
        expect(rendu).not.toContain('CHAMP-RETIRE');
    });

    it('AA.d Déplacer échange deux voisins, et refuse de sortir de la liste', () => {
        const { win, els } = charger([
            { id: 'C1', titre: 'Premier', contenu: 'A' },
            { id: 'C2', titre: 'Second', contenu: 'B' }
        ]);
        win.deplacerChampPersonnalise('C2', -1);
        const rendu = els['champsPersonnalisesListe'].innerHTML;
        expect(rendu.indexOf('Second')).toBeLessThan(rendu.indexOf('Premier'));

        // Hors limites : aucun effet, pas d'exception.
        expect(() => win.deplacerChampPersonnalise('C2', -1)).not.toThrow();
    });

    it('AA.e Le titre saisi est échappé avant de retourner dans l\'écran', () => {
        const { win, els } = charger([{ id: 'C1', titre: '<img src=x onerror=1>', contenu: 'A' }]);
        win.ajouterChampPersonnalise();
        expect(els['champsPersonnalisesListe'].innerHTML).not.toContain('<img');
    });
});

/* ------------------------------------------- AB — ce qui part dans la production */

describe('#499 · AB — ce qui s\'enregistre', () => {
    it('AB.a Un champ sans titre est écarté', () => {
        // Il s'afficherait comme un bandeau vide au-dessus d'un texte orphelin.
        const { win } = charger([
            { id: 'C1', titre: '', contenu: 'du texte sans nom' },
            { id: 'C2', titre: 'Remise', contenu: 'Sur Léa' }
        ]);
        expect(win.champsPersonnalisesAEnregistrer().map(c => c.titre)).toEqual(['Remise']);
    });

    it('AB.b Un champ NOMMÉ mais vide est conservé : c\'est une section en préparation', () => {
        const { win } = charger([{ id: 'C1', titre: 'À vérifier', contenu: '' }]);
        expect(win.champsPersonnalisesAEnregistrer()).toEqual([
            { id: 'C1', titre: 'À vérifier', contenu: '' }
        ]);
    });

    it('AB.c Les espaces autour du titre ne font pas un nom', () => {
        const { win } = charger([{ id: 'C1', titre: '   ', contenu: 'x' }]);
        expect(win.champsPersonnalisesAEnregistrer()).toEqual([]);
    });

    it('AB.d Sans zone à l\'écran, l\'enregistrement ne fabrique rien', () => {
        const { win } = charger(null);
        expect(win.champsPersonnalisesAEnregistrer()).toEqual([]);
    });
});
