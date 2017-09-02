export const endpoint = 'https://api.graph.cool/simple/v1/cj6nyow1w221t0143o8gq0f9p';

/**
 * Queries the graphql endpoint.
 * @param {string} query The graphql query.
 * @param {object} variables The variables needed for the query.
 * @returns {Promise} The returned data.
 */
export async function query (query, variables) {
  const body = JSON.stringify({
    query,
    variables: variables || {}
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json"
    },
    body
  });

  const result = await response.json();
  return result.data;
}