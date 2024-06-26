import { findAllValidSequences } from "./backtrack";
import {
  ChaosOptions,
  ExploreOptions,
  RequestResult,
  ScenarioOptions,
} from "./types";
import {
  delay,
  endWithResults,
  hanleRequest,
  pickBasedOnImportance,
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

    if (options.stopAfterDelay) {
      delay(options.stopAfterDelay).then(() => {
        console.log(`Stopped after delay: ${options.stopAfterDelay}ms`);
        endWithResults(results, 0);
      });
    }

    while (true) {
      const endpoint = pickBasedOnImportance(options.endpoints);
      await hanleRequest({
        endpoint,
        options,
        results,
        basePath: this.basePath,
        authToken: this.authToken,
      });
    }
  }

  async scenario(options: ScenarioOptions) {
    const results: RequestResult[] = [];

    if (options.stopAfterDelay) {
      delay(options.stopAfterDelay).then(() => {
        console.log(`Stopped after delay: ${options.stopAfterDelay}ms`);
        endWithResults(results, 0);
      });
    }

    for (const endpoint of options.scenario) {
      await hanleRequest({
        endpoint,
        options,
        results,
        basePath: this.basePath,
        authToken: this.authToken,
      });
    }
    endWithResults(results, 0);
  }

  async explore(options: ExploreOptions) {
    const results: RequestResult[] = [];
    const paths = findAllValidSequences(options.endpoints);

    if (options.stopAfterDelay) {
      delay(options.stopAfterDelay).then(() => {
        console.log(`Stopped after delay: ${options.stopAfterDelay}ms`);
        endWithResults(results, 0);
      });
    }

    for (const path of paths) {
      for (const tag of path) {
        const endpoint = options.endpoints.find(
          (endpoint) => endpoint.tag === tag
        );
        if (!endpoint) {
          console.error("Endpoint not found");
          return endWithResults(results, 1);
        }
        await hanleRequest({
          endpoint,
          options,
          results,
          basePath: this.basePath,
          authToken: this.authToken,
        });
      }
    }
    endWithResults(results, 0);
  }
}
