export interface Texts {
  x: number;
  y: number;
  w: number;
  oc: string;
  sw: number;
  A: string;
  R: TextR[];
}

export interface TextR {
  T: string;
  S: number;
  TS: [number, number, number, number];
}