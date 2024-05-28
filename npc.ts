import { findAllValidSequences } from "./backtrack";
import {
  DEFAULT_DELAY_BETWEEN_REQUESTS,
  DEFAULT_STOP_AFTER_DELAY,
  DEFAULT_STOP_AFTER_STATUS,
} from "./const";
import {
  ChaosOptions,
  ExploreOptions,
  RequestResult,
  ScenarioOptions,
} from "./types";
import {
  addToResults,
  buildEndpointBody,
  buildEndpointPath,
  delay,
  endWithResults,
  makeRequest,
  pickBasedOnImportance,
  stopAfterDelay,
} from "./utils";

export class Npc {
  private basePath: string;
  private authToken: string;

  constructor({
    basePath,
    authToken,
  }: {
    basePath: string;
    authToken?: string;
  }) {
    this.basePath = basePath;
    this.authToken = authToken || "";
  }

  async chaos(options: ChaosOptions) {
    const results: RequestResult[] = [];

    stopAfterDelay(options.stopAfterDelay ?? DEFAULT_STOP_AFTER_DELAY)?.then(
      () => {
        console.log(`Stopped after delay: ${options.stopAfterDelay}ms`);
        endWithResults(results, 0);
      }
    );

    while (true) {
      const endpoint = pickBasedOnImportance(options.endpoints);
      const response = await makeRequest({
        options,
        endpoint,
        basePath: this.basePath,
        authToken: this.authToken,
      });

      if (response) {
        if (
          (options.stopAfterStatus ?? DEFAULT_STOP_AFTER_STATUS).includes(
            response.status
          )
        ) {
          console.error(`Status code: ${response.status}`);
          await addToResults(this.basePath, results, response, endpoint);
          endWithResults(results, 1);
        }
        await addToResults(this.basePath, results, response, endpoint);
      } else {
        endWithResults(results, 1);
      }
      await delay(
        options.delayBetweenRequests ?? DEFAULT_DELAY_BETWEEN_REQUESTS
      );
    }
  }

  async scenario(options: ScenarioOptions) {
    const results: RequestResult[] = [];

    stopAfterDelay(options.stopAfterDelay ?? DEFAULT_STOP_AFTER_DELAY)?.then(
      () => {
        console.log(`Stopped after delay: ${options.stopAfterDelay}ms`);
        endWithResults(results, 0);
      }
    );

    for (const endpoint of options.scenario) {
      endpoint.body = buildEndpointBody(endpoint, results);
      endpoint.path = buildEndpointPath(endpoint, results);

      const response = await makeRequest({
        options,
        endpoint,
        basePath: this.basePath,
        authToken: this.authToken,
      });

      if (response) {
        if (
          (options.stopAfterStatus ?? DEFAULT_STOP_AFTER_STATUS).includes(
            response.status
          )
        ) {
          console.error(`Status code: ${response.status}`);
          await addToResults(this.basePath, results, response, endpoint);
          endWithResults(results, 1);
        }
        await addToResults(this.basePath, results, response, endpoint);
      } else {
        endWithResults(results, 1);
      }
      await delay(
        options.delayBetweenRequests ?? DEFAULT_DELAY_BETWEEN_REQUESTS
      );
    }
    endWithResults(results, 0);
  }

  async explore(options: ExploreOptions) {
    const results: RequestResult[] = [];
    const paths = findAllValidSequences(options.endpoints);

    stopAfterDelay(options.stopAfterDelay ?? DEFAULT_STOP_AFTER_DELAY)?.then(
      () => {
        console.log(`Stopped after delay: ${options.stopAfterDelay}ms`);
        endWithResults(results, 0);
      }
    );

    for (const path of paths) {
      for (const tag of path) {
        const endpoint = options.endpoints.find(
          (endpoint) => endpoint.tag === tag
        );
        if (!endpoint) {
          console.error("Endpoint not found");
          return endWithResults(results, 1);
        }
        endpoint.body = buildEndpointBody(endpoint, results);
        endpoint.path = buildEndpointPath(endpoint, results);
        const response = await makeRequest({
          options,
          endpoint,
          basePath: this.basePath,
          authToken: this.authToken,
        });
        if (response) {
          if (
            (options.stopAfterStatus ?? DEFAULT_STOP_AFTER_STATUS).includes(
              response.status
            )
          ) {
            console.error(`Status code: ${response.status}`);
            await addToResults(this.basePath, results, response, endpoint);
            endWithResults(results, 1);
          }
          await addToResults(this.basePath, results, response, endpoint);
        } else {
          endWithResults(results, 1);
        }
        await delay(
          options.delayBetweenRequests ?? DEFAULT_DELAY_BETWEEN_REQUESTS
        );
      }
    }
    endWithResults(results, 0);
  }
}
