
import React from "react";
import { fromProm, Readable } from "rhobo";

const ids = new Map<string, Id>();

export class Id {

  nameProm: Promise<string> = fetch(`/ids/${this.sha}`).then(r => r.text());
  name: Readable<string> = fromProm(this.nameProm, `<${this.sha}>`);

  constructor(public sha: string){
    const existing = ids.get(sha);
    if(existing)
      return existing;
    ids.set(this.sha, this);
  }

  static get(sha: string){
    return new Id(sha);
  }

}

export const IdComp = ({ id }: {id: Id}) =>
  <span className="Id">{id.name.use()()}</span>
