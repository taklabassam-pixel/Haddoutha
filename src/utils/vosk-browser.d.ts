declare module 'vosk-browser' {
  export function createModel(url: string): Promise<any>;
  export class VoskModel {}
  export class Recognizer {
    constructor(model: any, sampleRate: number);
    setWords(words: boolean): void;
    acceptWaveform(buffer: any): boolean;
    result(): any;
    partialResult(): any;
    finalResult(): any;
  }
}