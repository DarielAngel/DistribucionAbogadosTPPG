export function sortByName(list){
  if(!Array.isArray(list)) return [];
  return list.slice().sort((a,b)=> String((a && a.name) || '').localeCompare(String((b && b.name) || '')));
}

export default { sortByName }
