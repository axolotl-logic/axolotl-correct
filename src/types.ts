import { type ConsoleMessageType } from "puppeteer";

export interface Observation {
  multiselectable?: boolean;
  autocomplete?: string;
  valuetext?: string;
  name?: string;
  role?: string;
  value?: string | number;
  modal?: boolean;
  level?: number;
  checked?: boolean | "mixed";
  focused?: boolean;
  disabled?: boolean;
  invalid?: string;
  haspopup?: string;
  readonly?: boolean;
  description?: string;
  roledescription?: string;
  pressed?: boolean | "mixed";
  expanded?: boolean;
  required?: boolean;
}

export interface Model {
  observations: Observation[];
  lastModel: Model | null;
  adds: Observation[];
  removes: Observation[];
  persists: Observation[];
}

export interface RequestEvent {
  url: string;
  method: string;
}

export interface RequestFailedEvent {
  frameUrl?: string;
  url: string;
  method: string;
  errorText?: string;
  createdAt: number;
}

export interface ResponseEvent {
  requestTime?: number;
  url: string;
  method: string;
  frameUrl?: string;
  status: number;
  createdAt: number;
}

export interface PageErrorEvent {
  name: string;
  stack?: string;
  message: string;
}

export interface ErrorEvent {
  name: string;
  stack?: string;
  message: string;
}

export interface ConsoleEvent {
  type: ConsoleMessageType;
  text: string;
}
