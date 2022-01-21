declare module "worker-loader?*" {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}

declare module "!!raw-loader!*" {
  const content: string;
  export default content;
}
