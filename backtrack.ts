import { ExploreEndpoint } from "./types";

// Fonction principale de backtracking
function backtrack(
  path: string[],
  visited: Set<unknown>,
  results: string[][],
  endpoints: ExploreEndpoint[]
) {
  if (path.length === endpoints.length) {
    results.push([...path]);
    return;
  }

  for (let endpoint of endpoints) {
    if (
      !visited.has(endpoint.tag) &&
      areConstraintsSatisfied(visited, endpoint.constraints)
    ) {
      path.push(endpoint.tag); // On rajoute dans le path
      visited.add(endpoint.tag); // On rajoute dans la liste des visités

      backtrack(path, visited, results, endpoints); // On continue

      // On fait un pas en arrière
      path.pop();
      visited.delete(endpoint.tag);
    }
  }
}

// Vérifier si les contraintes sont satisfaites
function areConstraintsSatisfied(visited, constraints) {
  if (!constraints) return true;
  for (let constraint of constraints) {
    if (!visited.has(constraint)) return false;
  }
  return true;
}

// Trouver toutes les séquences valides
export function findAllValidSequences(
  endpoints: ExploreEndpoint[]
): string[][] {
  const results = [];
  backtrack([], new Set(), results, endpoints);
  return results;
}
