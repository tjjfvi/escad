
import React from "react";
import { fromProm, Readable } from "rhobo";

const ids = new Map<string, Id>();

const json = fetch("/bundle.json").then(r => r.json());

export class Id {

  declare nameProm: Promise<string>;
  declare name: Readable<string>;

  constructor(public sha: string){
    const existing = ids.get(sha);
    if(existing)
      return existing;
    ids.set(this.sha, this);

    this.nameProm = fetch(`/ids/${this.sha}`).then(r => r.text());
    this.name = fromProm(this.nameProm, `<${this.sha}>`);
  }

  static async get(alias: string){
    const sha = (await json).idMap[alias];
    if(!sha)
      throw new Error(`Could not find alias ${alias}`);
    return new Id(sha);
  }

}

export const IdComp = ({ id }: {id: Id}) =>
  <span className="Id">{id.name.use()()}</span>
