import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { elementEchappant } from './_helpers/element-echappant.js';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

    const globaux = {
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
        // Déclarée dans js/config.js. Lot E3 : retirer ou déplacer un bloc la lit
        // (une production existante s'enregistre) ; ici, une fiche en création.
        productionEnEdition: null,
        document: {
            getElementById: (id) => els[id] || null,
            querySelector: () => null, querySelectorAll: () => [],
            createElement: (t) => elementEchappant(t), addEventListener() {}
        }
    };

    // #504 — `ui-blocs.js` d'abord : `productions.js` appelle ses helpers au
    // rendu. Deux modules dans le MÊME sandbox, comme dans le navigateur.
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/productions.js', globaux, win);
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

    it('AA.f UN BLOC ANCRÉ NE SE SUPPRIME PAS', () => {
        // `objectif`, `tache` et `detailTache` sont lus par la rétroaction et
        // les exports — 53 sites. Le bouton × n'existe pas sur ces blocs, mais
        // le garde-fou doit tenir si l'appel vient d'ailleurs (dispatcher,
        // console, futur raccourci). Ce trou n'était couvert par rien : le
        // break-test du 25 août est resté VERT en retirant la garde.
        const { win, els } = charger([
            { id: 'objectif', titre: "Objectif d'apprentissage", contenu: 'A' }
        ]);
        els['champsPersonnalisesListe'].innerHTML = 'INTACT';
        win.supprimerChampPersonnalise('objectif');
        expect(els['champsPersonnalisesListe'].innerHTML,
            'aucun re-rendu : la demande est refusée avant tout effet').toBe('INTACT');
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
        // ⚠ `<img` ne peut plus servir de témoin : le rendu en contient
        // légitimement, depuis que les boutons portent des icônes (#504).
        // Le témoin doit être ce que SEULE une injection produirait.
        const { win, els } = charger([
            { id: 'C1', titre: '<script>TEMOIN_INJECTION</script>', contenu: 'A' }
        ]);
        win.ajouterChampPersonnalise();
        const rendu = els['champsPersonnalisesListe'].innerHTML;
        expect(rendu).not.toContain('<script>');
        expect(rendu, 'le texte est là, mais neutralisé').toContain('&lt;script&gt;');
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

/* --------------------- AE — la forme des boutons suit celle de l'application */

describe('#504 · AE — flèches et × reprennent le patron existant', () => {
    const lire = (f) => readFileSync(path.resolve(__dirname, '..', '..', f), 'utf8');
    // ⚠ DÉPLACÉ, PAS AFFAIBLI : le HTML des boutons a quitté `productions.js`
    // pour `ui-blocs.js`, partagé par les cinq écrans. La garde vérifie donc
    // deux choses au lieu d'une — que le module rend le bon patron, et que les
    // écrans l'APPELLENT au lieu de le réécrire.
    const uiBlocs = lire('js/ui-blocs.js');
    const sansCommentaires = (t) => t.split('\n')
        .filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');

    it('AE.a Les flèches réutilisent `pipeline-btn-reorder` et ses chevrons', () => {
        // Le réordonnancement a déjà sa forme dans l'application
        // (travaux-ui.js) : en inventer une seconde, c'est deux écrans qui ne
        // se ressemblent plus.
        expect(uiBlocs).toContain('class="pipeline-btn-reorder"');
        expect(uiBlocs).toContain('icons/icon-chevron-up.svg');
        expect(uiBlocs).toContain('icons/icon-chevron-down.svg');
    });

    it('AE.b LE POINT DÉCISIF : le × n\'est plus un bouton PLEIN', () => {
        // `.btn-supprimer` est réservé aux gestes qui engagent — supprimer une
        // grille entière. Retirer un bloc d'un formulaire non enregistré est
        // local et réversible : lui donner ce poids visuel fait mentir la
        // couleur.
        expect(uiBlocs).toContain('btn-delete-icon');
        expect(uiBlocs).toContain('icons/icons8-trash.svg');
        expect(sansCommentaires(uiBlocs)).not.toContain('btn btn-supprimer');
    });

    it('AE.c Chaque bouton d\'icône dit ce qu\'il fait', () => {
        // Une icône seule n'a pas de texte : sans `aria-label`, un lecteur
        // d'écran n'annonce rien.
        expect(uiBlocs).toContain('aria-label="Monter ${quoi}"');
        expect(uiBlocs).toContain('aria-label="Descendre ${quoi}"');
        expect(uiBlocs).toContain('aria-label="${titre}"');
    });

    it('AE.d Les classes utilisées existent vraiment dans la feuille de style', () => {
        // Une classe inventée ne rougit nulle part : le bouton s'affiche nu, et
        // on ne s'en aperçoit qu'à l'œil.
        const css = lire('styles.css');
        for (const classe of ['.pipeline-btn-reorder', '.btn-icone-nu',
                              '.btn-delete-icon', '.bloc-reordonner', '.bloc-retirer-coin']) {
            expect(css, classe).toContain(classe + ' {');
        }
        expect(css, 'les chevrons ont besoin d\'une règle pour leur image')
            .toContain('.pipeline-btn-reorder img {');
    });

    it('AE.e LE RATCHET : les cinq écrans appellent le helper, aucun ne le réécrit', () => {
        // C'est lui qui empêche le patron de se remettre à diverger : le jour
        // où quelqu'un recopie deux boutons à la main dans un sixième écran, la
        // garde ne le verra pas — mais elle verra une régression dans ces cinq.
        for (const f of ['js/productions.js', 'js/grilles.js', 'js/echelles.js']) {
            const code = sansCommentaires(lire(f));
            expect(code, f + ' doit appeler le helper').toContain('boutonsReordonnerBloc(');
            expect(code, f + ' ne doit plus poser de flèche typographique').not.toContain('↑');
            expect(code, f + ' ne doit plus poser de flèche typographique').not.toContain('↓');
        }
        expect(sansCommentaires(lire('js/grilles.js'))).toContain('boutonRetirerBloc(');
        expect(sansCommentaires(lire('js/echelles.js'))).toContain('boutonRetirerBloc(');
    });

    it('AE.f Le module est chargé AVANT ceux qui s\'en servent', () => {
        const html = lire('index.html');
        expect(html.indexOf('js/ui-blocs.js'))
            .toBeLessThan(html.indexOf('js/productions.js'));
        expect(html.indexOf('js/ui-blocs.js'))
            .toBeLessThan(html.indexOf('js/grilles.js'));
    });
});
