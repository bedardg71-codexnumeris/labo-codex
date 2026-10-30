// Le modèle proposé pour la RàI : le niveau de l'élève comparé à son groupe-cours au même moment, avec un plancher
// à la note de passage, à côté du modèle en place. Exige un commit qui porte `reperesPerformance` (lot 1 du
// 30 oct. 2026). Sort des effectifs seulement. Mode d'emploi : LISEZMOI.md.
import { ouvrir, basculer, lireCodex, ecrireAgregat, PLANS } from './commun.mjs';
const codex = await lireCodex();
const sortie = {}; let nbErr = 0;
for (const plan of PLANS) {
  const { b, page, erreurs } = await ouvrir(codex);
  await page.clock.setFixedTime(new Date('2026-10-30T12:00:00'));
  await basculer(page, plan.t);
  const info = await page.evaluate(({grilleNom}) => {
    window.__base = { ev: JSON.parse(JSON.stringify(db.getSync(cle('evaluationsSauvegardees'),[]))), pr: JSON.parse(JSON.stringify(db.getSync(cle('presences'),[]))) };
    window.__H = {};
    if (grilleNom) { const prods=db.getSync(cle('productions'),[]); const gr=db.getSync(cle('grillesTemplates'),[]);
      const g=gr.filter(x=>String(x.nom).replace(/\s+/g,' ').trim()===grilleNom).sort((x,y)=>prods.filter(p=>p.grilleId===y.id).length-prods.filter(p=>p.grilleId===x.id).length)[0];
      db.setSync('preferencesUtilisateur', Object.assign({}, db.getSync('preferencesUtilisateur',{}), {grilleReferenceDepistage:g.id})); }
    const r=reperesPerformance();
    return { gcs: db.getSync(cle('groupesCours'),[]).map(g=>g.id), grille:(obtenirGrilleReferenceDepistage()||{}).nom||null, reperes:{suffisance:r.suffisance,maitrise:r.maitrise,raison:r.raison,passage:r.passage}, seuils:db.getSync('seuilsInterpretation',null)&&db.getSync('seuilsInterpretation',null).interpretation };
  }, {grilleNom: plan.grilleNom});
  const lignes = [];
  for (const cut of plan.coupes) {
    await page.clock.setFixedTime(new Date(cut + 'T23:30:00'));
    lignes.push(await page.evaluate(async ({cut, gcs}) => {
      const med=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y);return s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2;};
      const st=a=>{const n=a.length,m=a.reduce((x,y)=>x+y,0)/n;return{n,m,sd:n>1?Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(n-1)):0};};
      const f=window.__base.ev.filter(e=>(e.dateEvaluation||'').slice(0,10)<=cut).map(e=>Object.assign({},e));
      const ids=new Set(f.map(e=>e.id)), tous=new Set(window.__base.ev.map(e=>e.id));
      f.forEach(e=>{if(e.remplaceeParId&&!ids.has(e.remplaceeParId)&&tous.has(e.remplaceeParId)){delete e.remplaceeParId;delete e.dateRemplacement;}});
      db.setSync(cle('evaluationsSauvegardees'),f); db.setSync(cle('presences'),window.__base.pr.filter(p=>p.date<=cut));
      const acc=new Map();
      for(const gc of gcs){
        await changerGroupeCoursActifV2(gc); calculerEtSauvegarderIndicesAssiduite(); calculerEtStockerIndicesCP();
        const prods=obtenirDonneesSelonMode('productions')||[]; const ev=window.ProductionDiagnostique.filtrerEvaluations(obtenirDonneesSelonMode('evaluationsSauvegardees')||[],prods);
        const evaluables=obtenirIdsProductionsEvaluables(prods);
        const moyCrit=typeof calculerMoyennesCriteresRecents==='function';
        for(const e of obtenirEtudiantsCoursActif().filter(x=>!estEtudiantExclu(x))){
          if(acc.has(e.da))continue;
          const i=calculerTousLesIndices(e.da); const r=determinerNiveauRaiPedagogique(e.da);
          const cop=ev.filter(c=>c.etudiantDA===e.da&&evaluables.includes(c.productionId)&&window.evaluationEntreDansLaNote(c)&&!window.evaluationNonRemise(c)).map(c=>({note:window.noteRetenueParLeCalcul(c),d:(c.dateEvaluation||'').slice(0,10)})).filter(c=>typeof c.note==='number');
          const moy=obtenirTypePratiqueActive()==='standards'?calculerMoyennesCriteresRecents(e.da):calculerMoyennesCriteres(e.da);
          const dg=diagnostiquerForcesChallenges(moy);
          acc.set(e.da,{gc,A:i.A,C:i.C,nivActuel:r.niveau,patActuel:r.pattern,n:cop.length,niveau:cop.length?cop.reduce((a,c)=>a+c.note,0)/cop.length:null,defi:!!dg.principalDefi,cop});
        }
      }
      const res=[...acc.entries()].map(([da,v])=>Object.assign({da},v));
      const passage=window.NOTE_DE_PASSAGE*100;
      for(const gc of gcs){const L=res.filter(r=>r.gc===gc&&r.n>0);const lv=L.map(r=>r.niveau);const a=lv.length>=5?st(lv):null;
        L.forEach(r=>{ if(r.niveau<passage) r.niv=3; else if(a&&r.niveau<a.m-a.sd) r.niv=2; else r.niv=1; r.seuilGroupe=a?a.m-a.sd:null;
          r.niv05=(r.niveau<passage)?3:(a&&r.niveau<a.m-a.sd/2)?2:1; });
      }
      res.filter(r=>r.n===0).forEach(r=>{r.niv=0;r.niv05=0;});
      window.__H[cut]=res;
      const c=(v,k)=>res.filter(r=>r[k]===v).length;
      const avecCopie=res.filter(r=>r.n>0);
      const sansCopie=res.filter(r=>r.n===0);
      const palier=window.borneBasseAssiduiteCompletion(), palier85=window.SEUILS_PAR_DEFAUT.interpretation.acceptable*100;
      const sous=(r,p)=>(r.A!==null&&r.A<p)||(r.C!==null&&r.C<p);
      const ligne={mod05:[c(1,'niv05'),c(2,'niv05'),c(3,'niv05')],sansCopieAC85:sansCopie.filter(r=>sous(r,palier85)).length,sansCopieC:sansCopie.filter(r=>r.C===0).length,sansCopieCinc:sansCopie.filter(r=>r.C===null).length,dues:(obtenirDonneesSelonMode('productions')||[]).filter(p=>{const e=p.dateEcheance;return e&&e<=cut&&p.type!=='portfolio'&&!p.facultatif;}).length,cut,effectif:res.length,copiesMed:med(res.map(r=>r.n)),copiesTot:res.reduce((a,r)=>a+r.n,0),
        act:[c(0,'nivActuel'),c(1,'nivActuel'),c(2,'nivActuel'),c(3,'nivActuel')],mod:[c(0,'niv'),c(1,'niv'),c(2,'niv'),c(3,'niv')],
        moyGroupe:avecCopie.length?Math.round(avecCopie.reduce((a,r)=>a+r.niveau,0)/avecCopie.length*10)/10:null,
        seuilGroupe:(()=>{const v=[...new Set(res.map(r=>r.seuilGroupe).filter(x=>x!=null))];return v.map(x=>Math.round(x*10)/10);})(),
        defis:res.filter(r=>r.defi&&r.n>0).length,defisN1:res.filter(r=>r.defi&&r.niv===1).length,
        sansCopie:sansCopie.length,sansCopieAC:sansCopie.filter(r=>(r.A!==null&&r.A<palier)||(r.C!==null&&r.C<palier)).length,sansCopieNP:sansCopie.filter(r=>r.nivActuel===3).length};
      return ligne;
    },{cut,gcs:info.gcs}));
  }
  const synth=await page.evaluate(({coupes,gcs,debut,fin})=>{
    const H=window.__H; const q1=a=>{const s=[...a].sort((x,y)=>x-y);const p=(s.length-1)*.25,i=Math.floor(p);return s[i]+(p-i)*((s[i+1]??s[i])-s[i]);};
    const mi=new Date((Date.parse(debut)+Date.parse(fin))/2).toISOString().slice(0,10);
    const finale=H[coupes[coupes.length-1]];
    const avantMi=coupes.filter(c=>c<=mi);
    const ever=(F,lst)=>{const s=new Set();lst.forEach(c=>H[c].filter(F).forEach(r=>s.add(r.da)));return s;};
    const M23=r=>r.niv>=2,M3=r=>r.niv===3,A23=r=>r.nivActuel>=2,A3=r=>r.nivActuel===3;
    const bas=new Set();for(const gc of gcs){const L=finale.filter(r=>r.gc===gc&&r.n>0);if(L.length>=4){const q=q1(L.map(r=>r.niveau));L.filter(r=>r.niveau<=q).forEach(r=>bas.add(r.da));}}
    const palier=window.SEUILS_PAR_DEFAUT.interpretation.acceptable*100;
    const dernier=avantMi[avantMi.length-1];
    const avMi={mi,date:dernier,pop:finale.length,mod23:ever(M23,avantMi).size,mod3:ever(M3,avantMi).size,act23:ever(A23,avantMi).size,act3:ever(A3,avantMi).size,
      auMi:{mod23:H[dernier].filter(M23).length,mod3:H[dernier].filter(M3).length,act23:H[dernier].filter(A23).length,act3:H[dernier].filter(A3).length,attente:H[dernier].filter(r=>r.niv===0).length},
      basTotal:bas.size,basParMod:[...ever(M23,avantMi)].filter(d=>bas.has(d)).length,basParAct3:[...ever(A3,avantMi)].filter(d=>bas.has(d)).length};
    // les élèves du quart bas que la comparaison au groupe ne signale pas
    const limite=coupes.filter(c=>H[c].reduce((a,r)=>a+r.n,0)!==(coupes.indexOf(c)?H[coupes[coupes.indexOf(c)-1]].reduce((a,r)=>a+r.n,0):0)).slice(-3)[0];
    const lst=coupes.filter(c=>c<=limite);
    const NB=new Set(); lst.forEach(c=>{H[c].filter(r=>r.n>0).forEach(r=>{});});
    const signaleGroupe=ever(r=>r.n>0&&r.seuilGroupe!=null&&r.niveau<r.seuilGroupe,lst);
    const manques=[...bas].filter(d=>!signaleGroupe.has(d));
    const trouve=(L,F)=>manques.filter(d=>L.some(c=>{const r=H[c].find(x=>x.da===d);return r&&F(r);})).length;
    const presMoins=(c)=>H[c];
    const parAC={limite,basTotal:bas.size,signales:signaleGroupe.size,basSignales:[...bas].filter(d=>signaleGroupe.has(d)).length,manques:manques.length,
       parA:trouve(lst,r=>r.A!==null&&r.A<palier),parC:trouve(lst,r=>r.C!==null&&r.C<palier),parAouC:trouve(lst,r=>(r.A!==null&&r.A<palier)||(r.C!==null&&r.C<palier)),
       parA_avant:trouve(avantMi,r=>r.A!==null&&r.A<palier),parC_avant:trouve(avantMi,r=>r.C!==null&&r.C<palier),parAouC_avant:trouve(avantMi,r=>(r.A!==null&&r.A<palier)||(r.C!==null&&r.C<palier)),
       parA_fin:manques.filter(d=>{const r=finale.find(x=>x.da===d);return r.A!==null&&r.A<palier;}).length,parC_fin:manques.filter(d=>{const r=finale.find(x=>x.da===d);return r.C!==null&&r.C<palier;}).length,
       parN3Passage:manques.filter(d=>lst.some(c=>{const r=H[c].find(x=>x.da===d);return r&&r.niv===3;})).length,palier};
    const pal65=window.borneBasseAssiduiteCompletion();
    const comptes=(p,L)=>{const tp=(F)=>manques.filter(d=>{const v=L.map(c=>H[c].find(x=>x.da===d)).filter(Boolean);return F(v);}).length;
       return {uneDate:{A:tp(v=>v.some(r=>r.A!==null&&r.A<p)),C:tp(v=>v.some(r=>r.C!==null&&r.C<p&&r.n>0)),AC:tp(v=>v.some(r=>(r.A!==null&&r.A<p)||(r.C!==null&&r.C<p&&r.n>0)))},
               troisDates:{A:tp(v=>v.filter(r=>r.A!==null&&r.A<p).length>=3),C:tp(v=>v.filter(r=>r.C!==null&&r.C<p&&r.n>0).length>=3),AC:tp(v=>v.filter(r=>(r.A!==null&&r.A<p)||(r.C!==null&&r.C<p&&r.n>0)).length>=3)}};};
    parAC.nouveauxDefauts=comptes(palier,lst); parAC.tesReglages=comptes(pal65,lst); parAC.tesReglagesValeur=pal65;
    parAC.enFinNouveaux={A:manques.filter(d=>{const r=finale.find(x=>x.da===d);return r.A!==null&&r.A<palier;}).length,C:manques.filter(d=>{const r=finale.find(x=>x.da===d);return r.C!==null&&r.C<palier;}).length};
    parAC.enFinTes={A:manques.filter(d=>{const r=finale.find(x=>x.da===d);return r.A!==null&&r.A<pal65;}).length,C:manques.filter(d=>{const r=finale.find(x=>x.da===d);return r.C!==null&&r.C<pal65;}).length};
    parAC.nonRepEnFin=manques.filter(d=>{const r=finale.find(x=>x.da===d);return !((r.A!==null&&r.A<palier)||(r.C!==null&&r.C<palier));}).length;
    const FM=(F)=>{const L=coupes.filter((c,i)=>H[c].reduce((a,r)=>a+r.n,0)!==(i?H[coupes[i-1]].reduce((a,r)=>a+r.n,0):0));let av=0,re=0;L.forEach((c,i)=>{if(!i)return;const p=new Set(H[L[i-1]].filter(F).map(r=>r.da));H[c].filter(F).forEach(r=>{if(p.has(r.da))re++;});av+=p.size;});return{av,re,distincts:ever(F,L).size};};
    return{avMi,parAC,stab:{mod23:FM(M23),mod3:FM(M3),act3:FM(A3)}};
  },{coupes:plan.coupes,gcs:info.gcs,debut:plan.debut,fin:plan.fin});
  sortie[plan.t]={info,lignes,synth}; nbErr+=erreurs(); await b.close();
  console.log('==',plan.t,JSON.stringify(info));
  lignes.filter(l=>l.copiesTot===0).forEach(l=>console.log(l.cut,'aucune copie | dues',l.dues,'sans copie',l.sansCopie,'C=0',l.sansCopieC,'C inconnu',l.sansCopieCinc,'AC85',l.sansCopieAC85,'actuel',l.act.join('-')));
  lignes.filter(l=>l.copiesTot>0).forEach(l=>console.log(l.cut,'m05',l.mod05.join('-'),'méd',l.copiesMed,'| actuel',l.act.join('-'),'| modèle',l.mod.join('-'),'| moy',l.moyGroupe,'seuil',l.seuilGroupe.join('/'),'| défis',l.defis,'N1+défi',l.defisN1,'| sans copie',l.sansCopie,'AC',l.sansCopieAC,'NP',l.sansCopieNP));
  console.log(JSON.stringify(synth));
}
ecrireAgregat('comparaison-au-groupe.json', sortie); console.log('erreurs',nbErr);
