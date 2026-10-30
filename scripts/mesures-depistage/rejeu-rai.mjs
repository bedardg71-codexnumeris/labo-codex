// Rejeu de la répartition RàI, semaine par semaine, en ne gardant à chaque date que les copies corrigées et les
// présences de cette date. Sort des effectifs et des médianes seulement. Mode d'emploi : LISEZMOI.md.
import { ouvrir, basculer, lireCodex, ecrireAgregat, PLANS } from './commun.mjs';
const codex = await lireCodex();
const sortie = {}; let nbErr = 0;
for (const plan of PLANS) {
  const { b, page, erreurs } = await ouvrir(codex);
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
  await basculer(page, plan.t);
  const info = await page.evaluate(async ({grilleNom}) => {
    window.__base = { ev: JSON.parse(JSON.stringify(db.getSync(cle('evaluationsSauvegardees'),[]))), pr: JSON.parse(JSON.stringify(db.getSync(cle('presences'),[]))) };
    let grille = null;
    if (grilleNom) {
      const prods = db.getSync(cle('productions'),[]); const gr = db.getSync(cle('grillesTemplates'),[]);
      grille = gr.filter(g=>String(g.nom).replace(/\s+/g,' ').trim()===grilleNom).sort((x,y)=>prods.filter(p=>p.grilleId===y.id).length-prods.filter(p=>p.grilleId===x.id).length)[0];
      if(!grille) throw new Error('grille absente; nb='+gr.length+' trim='+window.trimestreActif);
      const prefs = Object.assign({}, db.getSync('preferencesUtilisateur',{}), {grilleReferenceDepistage: grille.id});
      db.setSync('preferencesUtilisateur', prefs);
    }
    const gcs = db.getSync(cle('groupesCours'),[]).map(g=>g.id);
    const prods = (obtenirDonneesSelonMode('productions')||[]);
    const et = obtenirEtudiantsCoursActif(); const d = et[0] && calculerDetailsNoteFinale(et[0].da);
    const term = window.identifierProductionTerminale(window.ProductionDiagnostique.filtrerProductions(prods));
    const pf = prods.find(p=>p.type==='portfolio');
    const pc = db.getSync(cle('pratiquesConfigurables'),[]).find(p=>p.id===obtenirIdPratiqueActive());
    return { gcs, grilleLue: (obtenirGrilleReferenceDepistage()||{}).nom||null, cfg: { pratique: pc&&pc.nom, id: pc&&pc.id, methode:d&&d.portfolio&&d.portfolio.methodeSelectionCle, nRetenir:d&&d.portfolio&&d.portfolio.nombreARetenir, minimum:d&&d.portfolio&&d.portfolio.minimumRequis,
      categories: pc&&pc.configuration&&pc.configuration.categories||null, conformite: !!(pc&&pc.configuration&&pc.configuration.portfolio&&pc.configuration.portfolio.reglesConformite&&pc.configuration.portfolio.reglesConformite.actif),
      nbObligatoires: prods.filter(p=>p.categorie==='obligatoire').length, nbArtefacts: prods.filter(p=>p.type==='artefact-portfolio').length, terminale: term?{pond:term.ponderation}:null, pondPortfolio: pf?pf.ponderation:null } };
  }, {grilleNom: plan.grilleNom});
  const lignes = [];
  const calcul = async (cut) => {
    await page.clock.setFixedTime(new Date(cut + 'T23:30:00'));
    return page.evaluate(async ({cut, gcs}) => {
      const med = a => { if(!a.length) return null; const s=[...a].sort((x,y)=>x-y); return s.length%2? s[(s.length-1)/2] : (s[s.length/2-1]+s[s.length/2])/2; };
      const f = window.__base.ev.filter(e => (e.dateEvaluation||'').slice(0,10) <= cut).map(e => Object.assign({}, e));
      const ids = new Set(f.map(e=>e.id)); const tousIds = new Set(window.__base.ev.map(e=>e.id));
      let reprisesFutures = 0;
      f.forEach(e => { if (e.remplaceeParId && !ids.has(e.remplaceeParId) && tousIds.has(e.remplaceeParId)) { delete e.remplaceeParId; delete e.dateRemplacement; reprisesFutures++; } });
      db.setSync(cle('evaluationsSauvegardees'), f);
      db.setSync(cle('presences'), window.__base.pr.filter(p => p.date <= cut));
      const acc = new Map();
      for (const gc of gcs) {
        await changerGroupeCoursActifV2(gc);
        calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP();
        const prods = obtenirDonneesSelonMode('productions')||[]; const ev = window.ProductionDiagnostique.filtrerEvaluations(obtenirDonneesSelonMode('evaluationsSauvegardees')||[], prods);
        const evaluables = obtenirIdsProductionsEvaluables(prods);
        for (const e of obtenirEtudiantsCoursActif().filter(x=>!estEtudiantExclu(x))) {
          if (acc.has(e.da)) continue;
          const i=calculerTousLesIndices(e.da), r=determinerNiveauRaiPedagogique(e.da), n=calculerIndicesNDerniersArtefacts(e.da,true);
          const moy=obtenirTypePratiqueActive()==='standards'?calculerMoyennesCriteresRecents(e.da):calculerMoyennesCriteres(e.da);
          const dg=diagnostiquerForcesChallenges(moy); const d=calculerDetailsNoteFinale(e.da);
          const copies=ev.filter(c=>c.etudiantDA===e.da&&evaluables.includes(c.productionId)&&window.evaluationEntreDansLaNote(c)&&!window.evaluationNonRemise(c)).map(c=>window.noteRetenueParLeCalcul(c)).filter(v=>typeof v==='number');
          acc.set(e.da,{P:i.P,nc:i.noteConstructible,niv:r.niveau,pat:r.pattern,nb:n.nbArtefacts,n3:n.performance,defi:!!dg.principalDefi,regle:(d&&typeof d.noteFinale==='number')?d.noteFinale:null,toutes:copies.length?copies.reduce((a,b)=>a+b,0)/copies.length:null,nc2:copies.length,plaf:!!(d&&((d.portfolio&&d.portfolio.plafonnement)||d.plafonnement))});
        }
      }
      const res=[...acc.values()]; const s1=obtenirSeuil('idme.insuffisant'), s2=obtenirSeuil('idme.developpement');
      const niv=(r,sP,sD)=>{ if(r.nb===0) return r.niv; const P=r.P/100; const de=!sD&&r.defi; const pat=r.n3<s1?'pers':(r.n3<s2&&de)?'em':de?'de':'st';
        if(pat==='pers'||(!sP&&r.nc&&P<s1)) return 3; if((!sP&&r.nc&&P<s2)||pat==='em'||pat==='de') return 2; return 1; };
      const c=(v,fn)=>res.filter(r=>fn(r)===v).length;
      return { cut, effectif:res.length, copiesMed:med(res.map(r=>r.nc2)), attente:c(0,r=>r.niv), n1:c(1,r=>r.niv), n2:c(2,r=>r.niv), n3:c(3,r=>r.niv), nonPart:res.filter(r=>r.pat==='Non-participation').length,
        noteOK:res.filter(r=>r.nc&&r.nb>0).length, medP:med(res.filter(r=>r.nc&&r.nb>0).map(r=>r.P)), med3:(()=>{const m=med(res.filter(r=>r.nb>0).map(r=>r.n3));return m===null?null:Math.round(m*1000)/10;})(), defis:res.filter(r=>r.defi).length, plafonnes:res.filter(r=>r.plaf).length,
        sansP:[1,2,3].map(v=>c(v,r=>niv(r,true,false))), sansD:[1,2,3].map(v=>c(v,r=>niv(r,false,true))), sans2:[1,2,3].map(v=>c(v,r=>niv(r,true,true))),
        medRegle:(()=>{const m=med(res.filter(r=>r.regle!==null).map(r=>r.regle));return m===null?null:Math.round(m*10)/10;})(), medToutes:(()=>{const m=med(res.filter(r=>r.toutes!==null).map(r=>r.toutes));return m===null?null:Math.round(m*10)/10;})(),
        ecart:res.filter(r=>niv(r,false,false)!==r.niv).length, reprisesFutures };
    }, {cut, gcs: info.gcs});
  };
  for (const cut of plan.coupes) lignes.push(await calcul(cut));
  const dernier = lignes[lignes.length-1];
  const temoin = await page.evaluate(async ({gcs}) => { db.setSync(cle('evaluationsSauvegardees'), window.__base.ev); db.setSync(cle('presences'), window.__base.pr); const m=new Map();
    for (const gc of gcs){ await changerGroupeCoursActifV2(gc); calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP(); for (const e of obtenirEtudiantsCoursActif().filter(x=>!estEtudiantExclu(x))) if(!m.has(e.da)) m.set(e.da, determinerNiveauRaiPedagogique(e.da).niveau); }
    const v=[...m.values()]; return [1,2,3].map(n=>v.filter(x=>x===n).length); }, {gcs: info.gcs});
  console.log('témoin données complètes N1-2-3', temoin.join('-'), '| dernière ligne', [dernier.n1,dernier.n2,dernier.n3].join('-'));
  // témoin 2 : la dernière coupe sans grille désignée (le réglage tel qu'il est aujourd'hui, pour les anciens trimestres)
  let sansGrille = null;
  if (plan.grilleNom) {
    await page.evaluate(() => { const p=Object.assign({}, db.getSync('preferencesUtilisateur',{})); p.grilleReferenceDepistage='absente'; db.setSync('preferencesUtilisateur',p); });
    const l = await calcul(plan.coupes[plan.coupes.length-1]);
    sansGrille = {n1:l.n1,n2:l.n2,n3:l.n3,defis:l.defis};
  }
  sortie[plan.t] = { info, lignes, sansGrille, temoin };
  console.log(plan.t, JSON.stringify(info));
  for (const l of lignes) console.log(l.cut,'eff',l.effectif,'cop',l.copiesMed,'att',l.attente,'N',l.n1,l.n2,l.n3,'np',l.nonPart,'noteOK',l.noteOK,'P',l.medP,'3d',l.med3,'def',l.defis,'plaf',l.plafonnes,'|sP',l.sansP.join('-'),'sD',l.sansD.join('-'),'s2',l.sans2.join('-'),'| règle',l.medRegle,'toutes',l.medToutes,'| écart',l.ecart,'repf',l.reprisesFutures);
  console.log('sans grille', JSON.stringify(sansGrille));
  nbErr += erreurs();
  await b.close();
}
ecrireAgregat('rejeu-rai.json', sortie);
console.log('erreurs page', nbErr);
