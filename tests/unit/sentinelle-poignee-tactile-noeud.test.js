import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// PORTE TERRAIN DU 7 AOÛT — la poignée de redimensionnement d'un BLOC au doigt.
//
// Deux défauts distincts, et c'est le premier qui compte :
//
//  1. Le geste était câblé en `mousedown` / `mousemove` / `mouseup`. Safari ne
//     synthétise pas de `mousemove` pendant un glisser tactile : au doigt et au
//     Pencil, la poignée ne répondait PAS. Élargir la cible sans toucher au JS
//     aurait donné une zone plus grande et toujours inerte — le défaut exact de
//     1.47.0, refait à l'identique.
//  2. La cible faisait 20 px, sous le minimum tactile de 44 px.
//
// Cette sentinelle refuse donc de lire le BALISAGE. Elle verrouille les deux
// choses qui décident du résultat :
//   • le geste passe par les pointer events ET capture le pointeur ;
//   • l'arithmétique du chevauchement — une cible de 44 px sur un bloc qui peut
//     n'en faire que 44 de haut doit déborder, sinon elle avale le bloc.

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const racineProjet = path.resolve(__dirname, '..', '..');
const css = readFileSync(path.join(racineProjet, 'styles.css'), 'utf8');
const sourceCarte = readFileSync(path.join(racineProjet, 'js', 'planification-carte.js'), 'utf8');

// --- Lecture du CSS, en gardant le contexte des at-rules ----------------
// (Le helper de `sentinelle-largeur-planificateur` APLATIT les @media : ici on
// doit justement distinguer la règle de base de sa variante tactile.)
const cssSansCommentaires = css.replace(/\/\*[\s\S]*?\*\//g, '');

function reglesDe(source, contexte = '') {
    const regles = [];
    let tampon = '';
    for (let i = 0; i < source.length; i++) {
        const c = source[i];
        if (c !== '{') { tampon += c; continue; }
        let profondeur = 1;
        let j = i + 1;
        while (j < source.length && profondeur > 0) {
            if (source[j] === '{') profondeur++;
            else if (source[j] === '}') profondeur--;
            if (profondeur > 0) j++;
        }
        const corps = source.slice(i + 1, j);
        const prelude = tampon.trim();
        if (prelude.startsWith('@')) {
            regles.push(...reglesDe(corps, (contexte ? contexte + ' ' : '') + prelude));
        } else {
            regles.push({ selecteurs: prelude, corps, contexte });
        }
        tampon = '';
        i = j;
    }
    return regles;
}

const REGLES = reglesDe(cssSansCommentaires);

/** Déclarations d'un sélecteur, filtrées par contexte d'at-rule (cascade : la dernière gagne). */
function declarations(selecteur, filtreContexte = (ctx) => ctx === '') {
    const out = {};
    for (const regle of REGLES) {
        if (!filtreContexte(regle.contexte)) continue;
        if (regle.selecteurs.split(',').map(s => s.trim()).indexOf(selecteur) === -1) continue;
        for (const decl of regle.corps.split(';')) {
            const i = decl.indexOf(':');
            if (i === -1) continue;
            const nom = decl.slice(0, i).trim();
            if (nom.indexOf('{') !== -1 || nom.indexOf('}') !== -1) continue;
            out[nom] = decl.slice(i + 1).trim();
        }
    }
    return out;
}

const px = (v) => {
    const m = /(-?[\d.]+)px/.exec(v || '');
    return m ? parseFloat(m[1]) : NaN;
};

const estTactile = (ctx) => /@media[^{]*hover:\s*none/.test(ctx);

/**
 * Le corps du handler de la poignée de nœud — extrait par équilibrage
 * d'accolades, puis DÉPOUILLÉ de ses commentaires : celui qui documente la
 * bascule cite forcément `mousedown` et `mousemove`, et ferait échouer le test
 * qui interdit ces événements (attrapé au premier jet).
 */
function blocPoigneeNoeud() {
    const ancre = sourceCarte.indexOf("var poignee = el.querySelector('.planif-noeud-poignee')");
    expect(ancre).toBeGreaterThan(-1);
    const debut = sourceCarte.indexOf('if (poignee) {', ancre);
    expect(debut).toBeGreaterThan(-1);
    let profondeur = 0;
    let i = sourceCarte.indexOf('{', debut);
    const depart = i;
    for (; i < sourceCarte.length; i++) {
        if (sourceCarte[i] === '{') profondeur++;
        else if (sourceCarte[i] === '}') { profondeur--; if (profondeur === 0) break; }
    }
    return sourceCarte.slice(depart, i + 1)
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^[ \t]*\/\/.*$/gm, '');
}

// --- Volet 1 : le geste EXISTE au doigt (l'axe inerte / non inerte) -----

describe('Poignée de bloc · le geste répond au doigt', () => {
    const bloc = blocPoigneeNoeud();

    it('le redimensionnement passe par les pointer events', () => {
        // INSCRIPTION, pas simple présence du mot : `removeEventListener` cite
        // les trois noms dans le relâchement, et suffisait à faire passer le
        // test alors qu'aucune écoute n'était posée (attrapé au break-test).
        expect(bloc).toMatch(/addEventListener\(\s*'pointerdown'/);
        expect(bloc).toMatch(/addEventListener\(\s*'pointermove'/);
        expect(bloc).toMatch(/addEventListener\(\s*'pointerup'/);
    });

    it('plus AUCUN événement souris ne pilote le geste', () => {
        // C'est la régression à empêcher : réintroduire `mousemove` suffirait à
        // rendre la poignée muette au doigt sans qu'aucun test de balisage bouge.
        expect(bloc).not.toContain('mousedown');
        expect(bloc).not.toContain('mousemove');
        expect(bloc).not.toContain('mouseup');
    });

    it('le pointeur est CAPTURÉ — sinon le geste meurt dès qu’on sort des 44 px', () => {
        // Un agrandissement dépasse la poignée dès les premiers pixels : sans
        // capture, la cible de 44 px ne servirait qu'à commencer le geste.
        expect(bloc).toContain('setPointerCapture');
    });

    it('un pointeur annulé (appel, geste système) relâche proprement', () => {
        // Chercher le simple mot ne suffit PAS : le `removeEventListener` du
        // relâchement le contient déjà, et le test restait vert alors que
        // l'écoute n'était jamais posée (attrapé au break-test). C'est
        // l'INSCRIPTION qu'on vérifie.
        expect(bloc).toMatch(/addEventListener\(\s*'pointercancel'/);
    });
});

// --- Volet 2 : L'ARITHMÉTIQUE de la cible tactile -----------------------

describe('Poignée de bloc · arithmétique de la cible tactile', () => {
    const base = declarations('.planif-noeud-poignee');
    const tactile = declarations('.planif-noeud-poignee', estTactile);

    // Les planchers du bloc, LUS dans le JS — pas recopiés ici, sinon la
    // sentinelle validerait sa propre copie plutôt que le code.
    const hauteurMinBloc = parseFloat(/var HAUTEUR_MIN_NOEUD = (\d+)/.exec(sourceCarte)[1]);
    const largeurMinBloc = parseFloat(/var LARGEUR_MIN_NOEUD = (\d+)/.exec(sourceCarte)[1]);

    it('la cible tactile atteint le minimum de 44 px dans les deux axes', () => {
        expect(px(tactile.width)).toBeGreaterThanOrEqual(44);
        expect(px(tactile.height)).toBeGreaterThanOrEqual(44);
    });

    it('elle DÉBORDE du bloc — un décalage négatif, pas une croissance vers l’intérieur', () => {
        expect(px(tactile.right)).toBeLessThan(0);
        expect(px(tactile.bottom)).toBeLessThan(0);
    });

    /**
     * LE cœur de cette sentinelle.
     *
     *   intrusion = taille de la cible − ce qui déborde
     *
     * Elle doit rester sous la moitié du plus petit bloc en hauteur : au-delà,
     * la poignée couvre tout le flanc droit d'un bloc minimal et lui vole sa
     * sélection au doigt. Une cible de 44 px posée à `right: 1px` — la
     * correction « évidente » — donnerait 43 d'intrusion et échouerait ici.
     */
    it('l’intrusion dans le bloc laisse le bloc sélectionnable', () => {
        const intrusionX = px(tactile.width) + px(tactile.right);
        const intrusionY = px(tactile.height) + px(tactile.bottom);

        expect(intrusionY).toBeLessThanOrEqual(hauteurMinBloc / 2);
        expect(intrusionX).toBeLessThanOrEqual(largeurMinBloc / 3);
    });

    it('le DESSIN reste petit — seule la zone sensible grandit', () => {
        // Sans cette borne, les deux traits obliques s'étireraient sur 44 px et
        // la poignée deviendrait un pavé visuel au milieu de la carte.
        const tailles = (tactile['background-size'] || '').split(',').map(s => px(s.trim()));
        expect(tailles.length).toBeGreaterThan(0);
        for (const t of tailles) expect(t).toBeLessThanOrEqual(px(base.width));
    });

    it('le dessin reste POSÉ dans le coin réel du bloc, pas au milieu de la cible', () => {
        // Le coin du bloc est à `-right` px du bord de la cible : le glyphe doit
        // y être calé, sinon il flotte visiblement à côté du bloc.
        const debord = -px(tactile.right);
        const positions = (tactile['background-position'] || '').split(',').map(s => s.trim());
        expect(positions.length).toBeGreaterThan(0);
        for (const p of positions) {
            expect(px(/right\s+([\d.]+px)/.exec(p)?.[1])).toBe(debord);
            expect(px(/bottom\s+([\d.]+px)/.exec(p)?.[1])).toBe(debord);
        }
    });

    it('le glisser au doigt appartient à la poignée, pas au défilement natif', () => {
        expect(base['touch-action']).toBe('none');
    });
});
