import Channel from "tangle/webviews";
import { SyncPayload } from "../payload";

declare const acquireVsCodeApi: Function;

const EVENTS = "events";
const TRANSIENT = "transient";

window.addEventListener("load", onload);

function onMsg(section: string, replace: boolean = false) {
  return (data: any) => {
    const div = document.createElement("div");
    div.appendChild(
      document.createTextNode(`${new Date().toLocaleTimeString()}: ${JSON.stringify(data)}`)
    );
    const traget = document.getElementById(section);
    if (traget?.firstChild) {
      replace
        ? traget?.replaceChild(div, traget.firstChild)
        : traget?.insertBefore(div, traget.firstChild);
    } else {
      traget?.appendChild(div);
    }
  };
}

let emission = 0;

function onload(event: Event) {
  const vscode = acquireVsCodeApi();

  let eventName: string | null = null;
  let transient = { counter: 0 };
  const eventEmitter = document.getElementById("eventEmitter");
  const oneUpper = document.getElementById("oneUpper");

  if (vscode && eventEmitter && oneUpper) {
    const label = eventEmitter.getAttribute("value");
    const ch = new Channel<SyncPayload>('tangle', transient);
    const client = ch.attach(vscode);
    client.listen("onPanel1", (panel1) => onMsg(EVENTS)(`onPanel1: ${panel1}`));
    client.listen("onPanel2", (panel2) => onMsg(EVENTS)(`onPanel2: ${panel2}`));
    client.listen("onColumn1", (column1) => onMsg(EVENTS)(`onColumn1: ${column1}`));
    client.listen("onCountdown", (countdown) => onMsg(EVENTS)(`onCountdown: ${countdown}`));
    client.listen("onCommand", (command) => onMsg(EVENTS)(`onCommand: ${command}`));
    client.transient.subscribe((payload: SyncPayload) => {
      if (transient.counter !== undefined && payload.counter !== undefined) {
        transient.counter = payload.counter;
      }
      onMsg(TRANSIENT, true)(payload);
    });

    eventEmitter.onclick = () => {
      const msg: any = {};
      if (typeof label === "string") {
        emission++;
        eventName = `on${label.toUpperCase()[0]}${label.substring(1, label.length)}`;
        msg[eventName] = emission;
      }
      client.broadcast(msg);
    };

    oneUpper.onclick = () => {
      transient.counter++;
      client.broadcast(transient);
    };
  }
}
