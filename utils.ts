import {
  DEFAULT_DELAY_BETWEEN_REQUESTS,
  DEFAULT_MAX_RETRY,
  DEFAULT_STOP_AFTER_STATUS,
  DEFAULT_TIMEOUT,
} from "./const";
import {
  ChaosEndpoint,
  ChaosOptions,
  ExploreEndpoint,
  ExploreOptions,
  RequestResult,
  ScenarioEndpoint,
  ScenarioOptions,
} from "./types";

async function getResponseData(response: Response) {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.indexOf("application/json") !== -1) {
    const body = await response.json();

    return body;
  } else {
    return await response.text();
  }
}

function handleErrorMessage(error: any) {
  if (error.name === "TimeoutError") {
    console.error("Request timed out");
  } else {
    console.error(error);
  }
}

export async function endWithResults(results: RequestResult[], status: number) {
  console.log("Results:");
  console.log(results);
  process.exit(status);
}

export async function addToResults(
  basePath: string,
  results: RequestResult[],
  response: Response,
  endpoint: ChaosEndpoint | ScenarioEndpoint | ExploreEndpoint
) {
  const content = await getResponseData(response);
  results.push({
    headers: endpoint.headers,
    method: endpoint.method,
    response: content,
    status: response.status,
    url: basePath + endpoint.path,
    body: endpoint.body,
    tag: endpoint.tag ?? "",
  });
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function stopAfterDelay(delay: number) {
  if (delay < 0) return;

  return new Promise((resolve) => setTimeout(resolve, delay));
}

export function pickBasedOnImportance(endpoints: ChaosEndpoint[]) {
  // https://dev.to/jacktt/understanding-the-weighted-random-algorithm-581p

  const totalImportance = endpoints.reduce(
    (sum, item) => sum + (item.importance ?? 1),
    0
  );

  const randomValue = Math.random() * totalImportance;

  let cumulativeImportance = 0;
  for (let item of endpoints) {
    cumulativeImportance += item.importance ?? 1;
    if (randomValue < cumulativeImportance) {
      return item;
    }
  }

  return endpoints[endpoints.length - 1];
}

export function buildEndpointBody(
  endpoint: ScenarioEndpoint | ExploreEndpoint,
  results: RequestResult[]
) {
  /*
    On check si ya des tags {{}} 
    Si y'en a on récupère les tags (Format Tag.clé)
    Ensuite on check dans Results si ya le body recherché
    Si c'est le cas pour chaque Tag.clé on remplace par foundBody.clé
  */
  if (!endpoint.body) return;

  const newBody = JSON.parse(endpoint.body);

  // Recursive parse body to find primitive values
  function parseBody(body: Record<string, any>) {
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "object") {
        parseBody(value);
      } else {
        if (typeof value !== "string") continue;

        const tags = value.match(/{{(.*?)}}/g);
        if (!tags) continue;

        const tagKey = tags[0].replace("{{", "").replace("}}", "");
        const [tagToFind, keyToFind] = tagKey.split(".");
        const foundBody = results.find((result) => result.tag === tagToFind)
          ?.response as Record<string, any>;

        if (!foundBody) {
          console.error(`Tag not found: ${tagToFind}`);
          continue;
        }

        if (keyToFind) {
          body[key] = foundBody[keyToFind];
        } else {
          body[key] = foundBody;
        }
      }
    }
  }
  parseBody(newBody);

  return JSON.stringify(newBody);
}

export function buildEndpointPath(
  endpoint: ScenarioEndpoint | ExploreEndpoint,
  results: RequestResult[]
) {
  const { path } = endpoint;
  if (!path.includes("{{")) return path;

  const tags = path.match(/{{(.*?)}}/g);
  if (!tags) return path;

  let newPath = path;
  for (const tag of tags) {
    const tagKey = tag.replace("{{", "").replace("}}", "");
    const [tagToFind, keyToFind] = tagKey.split(".");
    const foundBody = results.find((result) => result.tag === tagToFind)
      ?.response as Record<string, any>;

    if (!foundBody) {
      console.error(`Tag not found: ${tagToFind}`);
      continue;
    }

    newPath = newPath.replace(tag, foundBody[keyToFind]);
  }

  return newPath;
}

export async function makeRequest({
  options,
  endpoint,
  basePath,
  authToken,
}: {
  options: Omit<ChaosOptions, "endpoints"> | ExploreOptions | ScenarioOptions;
  endpoint: ChaosEndpoint | ScenarioEndpoint | ExploreEndpoint;
  basePath: string;
  authToken?: string;
}) {
  const fullPath = basePath + endpoint.path;

  if (endpoint.authed && !authToken) {
    return console.error(
      `Auth token is required for this endpoint: ${fullPath}`
    );
  }
  if (endpoint.authed && authToken) {
    endpoint.headers = {
      ...endpoint.headers,
      Authorization: authToken,
    };
  }

  for (
    let retry = 1;
    retry <= (endpoint.maxRetry ?? options.maxRetry ?? DEFAULT_MAX_RETRY);
    retry++
  ) {
    try {
      const response = await fetch(fullPath, {
        method: endpoint.method,
        headers: {
          "Content-Type": "application/json",
          ...endpoint.headers,
        },
        body: endpoint.body,
        signal: AbortSignal.timeout(
          endpoint.timeout ?? options.timeout ?? DEFAULT_TIMEOUT
        ),
      });

      if (!response.ok) {
        if (
          retry + 1 >
          (endpoint.maxRetry ?? options.maxRetry ?? DEFAULT_MAX_RETRY)
        ) {
          // Si c'est la dernière request, on la return
          return response;
        }
        // Sinon on wait avant de retry
        await delay(1000);
        continue;
      }

      return response;
    } catch (error) {
      return handleErrorMessage(error);
    }
  }
}

export async function hanleRequestResponse({
  endpoint,
  results,
  options,
  basePath,
  authToken,
}) {
  endpoint.body = buildEndpointBody(endpoint, results);
  endpoint.path = buildEndpointPath(endpoint, results);
  const response = await makeRequest({
    options,
    endpoint,
    basePath,
    authToken,
  });
  if (response) {
    if (
      (options.stopAfterStatus ?? DEFAULT_STOP_AFTER_STATUS).includes(
        response.status
      )
    ) {
      console.error(`Status code: ${response.status}`);
      await addToResults(basePath, results, response, endpoint);
      endWithResults(results, 1);
    }
    await addToResults(basePath, results, response, endpoint);
  } else {
    endWithResults(results, 1);
  }
  await delay(options.delayBetweenRequests ?? DEFAULT_DELAY_BETWEEN_REQUESTS);
}
