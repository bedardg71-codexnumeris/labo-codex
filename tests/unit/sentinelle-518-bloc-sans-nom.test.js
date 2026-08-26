import { describe, it, expect } from 'vitest';
import { chargerScript } from './_helpers/charger-script.js';
import { elementEchappant } from './_helpers/element-echappant.js';

// Sentinelle #518 (26 août 2026) — CE QUI EST TAPÉ NE DISPARAÎT PLUS SANS UN MOT.
//
// `champsPersonnalisesAEnregistrer` écarte les blocs sans titre. La règle se
// défend : un bloc sans nom ferait un bandeau vide au-dessus d'un texte orphelin
// dans le document remis aux étudiant·es. Mais ce qui était écarté, c'était du
// texte TAPÉ, et rien ne le signalait.
//
// Verdict de Grégoire (D4) : AVERTIR. Ni refus bloquant, ni titre inventé par
// l'application — le contenu d'un bloc appartient à son auteur.
//
// ⚠ CE QUE CE BANC TIENT EN PLUS DU SYMPTÔME : que l'avertissement ne se
// déclenche QUE là où il y a quelque chose à perdre. Un avertissement qui
// s'affiche pour rien apprend à cliquer « oui » sans lire — et le jour où il dit
// quelque chose, personne ne le voit.

/* ------------------------------------------------------------------ harnais */

/** La zone des blocs, telle que `lireChampsPersonnalisesDepuisFormulaire` la lit. */
function listeDeBlocs(blocs) {
    const titres = [];
    const noeuds = blocs.map(b => {
        const titre = elementEchappant('input'); titre.className = 'champ-perso-titre'; titre.value = b.titre;
        titres.push(titre);
        const contenu = elementEchappant('textarea'); contenu.className = 'champ-perso-contenu'; contenu.value = b.contenu;
        const bloc = elementEchappant('div');
        bloc.className = 'champ-perso';
        bloc.setAttribute('data-champ-id', b.id);
        bloc.querySelector = (sel) => sel.includes('titre') ? titre : contenu;
        return bloc;
    });
    return {
        id: 'champsPersonnalisesListe', innerHTML: '',
        querySelectorAll: (sel) => (sel && sel.includes('titre')) ? titres : noeuds,
        querySelector: () => null
    };
}

function monter(blocs) {
    const els = { 'champsPersonnalisesListe': listeDeBlocs(blocs) };
    const demandes = [];
    const globaux = {
        db: { get: async () => null, getSync: (k, d) => (d !== undefined ? d : null),
              set: async () => {}, setSync: () => {} },
        cle: (k) => 'a2026_' + k,
        echapperHtml: (t) => String(t == null ? '' : t),
        obtenirCoursActifId: () => null,
        GabaritsUtils: { lirePratiquesSelectionnees: () => [] },
        alert: () => {},
        // La réponse de l'utilisateur est pilotée par le test.
        confirm: (m) => { demandes.push(String(m)); return globaux.__reponse; },
        __reponse: true,
        genererIdUnique: (p) => p + '1',
        document: {
            getElementById: (id) => els[id] || null,
            querySelector: () => null, querySelectorAll: () => [],
            createElement: (t) => elementEchappant(t), addEventListener() {}
        }
    };
    const win = chargerScript('js/ui-blocs.js', globaux);
    chargerScript('js/productions.js', globaux, win);
    return { win, demandes, repondre: (v) => { globaux.__reponse = v; } };
}

/* ------------------------------------- A — l'avertissement, quand il y a à perdre */

describe('#518 · A — un bloc rempli sans nom est signalé avant de disparaître', () => {

    it('A.a LE CAS QUI PORTE LE SENS : du texte sans nom déclenche la question', () => {
        const { win, demandes } = monter([
            { id: 'C1', titre: '', contenu: 'Remise sur Léa uniquement, avant 16 h.' }
        ]);

        const suite = win.validerBlocsNommes();

        expect(demandes, 'une question doit être posée').toHaveLength(1);
        expect(demandes[0]).toContain('ne sera pas conservé');
        expect(suite, 'et la réponse de l\'utilisateur est respectée').toBe(true);
    });

    it('A.b répondre non ARRÊTE l\'enregistrement', () => {
        const { win, repondre } = monter([{ id: 'C1', titre: '', contenu: 'du texte' }]);
        repondre(false);
        expect(win.validerBlocsNommes()).toBe(false);
    });

    it('A.c plusieurs blocs orphelins : le compte est dit', () => {
        const { win, demandes } = monter([
            { id: 'C1', titre: '', contenu: 'un texte' },
            { id: 'C2', titre: '', contenu: 'un autre' },
            { id: 'C3', titre: 'Nommé', contenu: 'celui-ci va bien' }
        ]);
        win.validerBlocsNommes();
        expect(demandes[0]).toContain('2 blocs');
    });
});

/* ------------------------------ B — et SEULEMENT quand il y a à perdre */

describe('#518 · B — l\'avertissement ne crie pas pour rien', () => {

    it('B.a un bloc nommé mais VIDE ne déclenche rien', () => {
        // C'est une section qu'on prépare : elle est conservée, et il n'y a rien
        // à signaler.
        const { win, demandes } = monter([{ id: 'C1', titre: 'À vérifier', contenu: '' }]);
        expect(win.validerBlocsNommes()).toBe(true);
        expect(demandes).toEqual([]);
    });

    it('B.b un bloc entièrement vide ne déclenche rien', () => {
        // Rien de tapé, rien à perdre. Avertir ici apprendrait à cliquer « oui »
        // sans lire — et le jour où l'avertissement dit quelque chose, personne
        // ne le verrait.
        const { win, demandes } = monter([{ id: 'C1', titre: '', contenu: '' }]);
        expect(win.validerBlocsNommes()).toBe(true);
        expect(demandes).toEqual([]);
    });

    it('B.c des espaces ne sont pas du contenu', () => {
        const { win, demandes } = monter([{ id: 'C1', titre: '   ', contenu: '   ' }]);
        expect(win.validerBlocsNommes()).toBe(true);
        expect(demandes).toEqual([]);
    });

    it('B.d tous les blocs nommés : aucune question', () => {
        const { win, demandes } = monter([
            { id: 'C1', titre: 'Remise du travail', contenu: 'Sur Léa' },
            { id: 'C2', titre: 'Format', contenu: 'APA' }
        ]);
        expect(win.validerBlocsNommes()).toBe(true);
        expect(demandes).toEqual([]);
    });
});

/* ------------------------------------- C — la couture avec ce qui est écarté */

describe('#518 · C — l\'avertissement porte sur ce qui va RÉELLEMENT partir', () => {
    it('C.a ce qui est signalé est exactement ce que le filtre écarte', () => {
        // ⚠ La validation lit les blocs BRUTS. La faire lire la liste DÉJÀ
        // filtrée aurait été le piège parfait : le bloc écarté n'y figure plus,
        // et l'avertissement n'aurait jamais rien trouvé — un test vert sur une
        // garde morte.
        const { win } = monter([
            { id: 'C1', titre: '', contenu: 'perdu sans avertissement' },
            { id: 'C2', titre: 'Gardé', contenu: 'conservé' }
        ]);
        const partants = win.champsPersonnalisesAEnregistrer();
        expect(partants.map(c => c.id), 'le filtre écarte bien C1').toEqual(['C2']);
        // Et c'est précisément ce bloc-là que l'avertissement nomme.
        expect(win.validerBlocsNommes()).toBe(true);
    });
});
