export interface CommandEvent {
  onCommand: string;
}

export interface PanelEvent {
  onPanel: string;
}

export interface CountdownEvent {
  onCountdown: number;
}

export interface TransientState {
  counter?: number;
}

// figure out if we could use union type
export type SyncState = CommandEvent | PanelEvent | CountdownEvent | TransientState;

// use "schema" interface for now
export interface SyncPayload {
  onCommand?: string;
  onPanel1?: number;
  onPanel2?: number;
  onColumn1?: number;
  onCountdown?: number;
  counter?: number;
  changeMe?: string;
}
