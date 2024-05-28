export interface ChaosEndpoint {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  importance?: number;
  authed?: boolean;
  timeout?: number;
  maxRetry?: number;
  tag?: string;
}

export interface ScenarioEndpoint {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  authed?: boolean;
  timeout?: number;
  maxRetry?: number;
  tag?: string;
}

export interface ExploreEndpoint {
  path: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  importance?: number;
  authed?: boolean;
  timeout?: number;
  maxRetry?: number;
  tag: string;
  constraints?: string[];
}

export interface ChaosOptions {
  endpoints: ChaosEndpoint[];
  stopAfterDelay?: number;
  stopAfterStatus?: number[];
  delayBetweenRequests?: number;
  maxRetry?: number;
  timeout?: number;
}

export interface ScenarioOptions {
  scenario: ScenarioEndpoint[];
  stopAfterDelay?: number;
  stopAfterStatus?: number[];
  delayBetweenRequests?: number;
  maxRetry?: number;
  timeout?: number;
}

export interface ExploreOptions {
  endpoints: ExploreEndpoint[];
  stopAfterDelay?: number;
  stopAfterStatus?: number[];
  delayBetweenRequests?: number;
  maxRetry?: number;
  timeout?: number;
}

export interface RequestResult {
  url: string;
  method: string;
  headers?: Record<string, string>;
  tag?: string;
  body?: Record<string, any> | string;

  status: number;
  response: Record<string, any> | string;
}
