import assert from 'node:assert/strict';
import { selectRecipes } from '../src/lib/recipe-search.ts';

const catalog = [
    { id:'1', title:'Pizza.', url:'https://www.kotikokki.net/reseptit/nayta/1/Pizza/', ingredients:['2,5 dl vettä','7 dl vehnäjauhoja'] },
    { id:'2', title:'Juustokakku Tarjan tapaan hyvä.', url:'https://www.kotikokki.net/reseptit/nayta/2/Kakku/', ingredients:['3 purkkia rahkaa'] },
    { id:'3', title:'Vadelmarahka', url:'https://www.kotikokki.net/reseptit/nayta/3/Rahka/', ingredients:['1 dl kermaa tai maitoa','3 dl vadelmia'] },
    { id:'4', title:'Salaatti', url:'https://www.kotikokki.net/reseptit/nayta/4/Salaatti/', ingredients:['1 kurkku'] },
];
const user = content => ({role:'user',content});
const history = [user('Pizza reseptiä?'),{role:'assistant',content:'Minulla on Pizza.',recipeIds:['1']}];
assert.deepEqual(selectRecipes(catalog,[...history,user('onko missään reseptissä maitua')]).recipes.map(r=>r.id),['3']);
assert.deepEqual(selectRecipes(catalog,[...history,user('onko pizza reseptiä jossa on kurkkuja')]).recipes,[]);
assert.deepEqual(selectRecipes(catalog,[...history,user('onko kurkku respetiä')]).recipes.map(r=>r.id),['4']);
assert.deepEqual(selectRecipes(catalog,[...history,user('onko tee reseptiä')]).recipes,[]);
assert.deepEqual(selectRecipes(catalog,[...history,user('mut onko esim juustokakku')]).recipes.map(r=>r.id),['2']);
assert.equal(selectRecipes(catalog,[...history,user('kiitos')]).kind,'chat');
assert.equal(selectRecipes(catalog,[...history,user('onko vegaanista pizzaa')]).kind,'no-match');
for (const prompt of ['pistäppä joku toinen satunnainen resepti','onko sulla muita reseptejä','onko mitään reseptiä']) {
    const found = selectRecipes(catalog,[...history,user(prompt)],()=>0);
    assert.equal(found.recipes.length,1);
    assert.notEqual(found.recipes[0].id,'1');
}
const randomHistory=[];
const seen=new Set();
for(let i=0;i<catalog.length;i++) {
    randomHistory.push(user('satunnainen resepti'));
    const result=selectRecipes(catalog,randomHistory,()=>0);
    assert.ok(!seen.has(result.recipes[0].id),'Random requests do not repeat shown recipes while unseen recipes exist');
    seen.add(result.recipes[0].id);
    randomHistory.push({role:'assistant',content:'Minulla on sinulle resepti.',recipeIds:[result.recipes[0].id]});
}
randomHistory.push(user('joku toinen satunnainen resepti'));
assert.notEqual(selectRecipes(catalog,randomHistory,()=>0).recipes[0].id,randomHistory.at(-2).recipeIds[0]);
console.log('PASS: latest-message intent, milk dialect, ingredient filtering, no stale cards, alternative/random rotation, and no immediate repeats.');
