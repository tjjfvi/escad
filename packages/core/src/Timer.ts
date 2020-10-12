
export class Timer {

  totalTime = 0;
  totalCount = 0;
  activeCount = 0;
  actualTime = 0;
  averageTime = 0;
  averageConcurrency = 0;

  private updateConcerrency(){
  }

  start(){
    if(!this.activeCount)
      this.actualTime -= Date.now();
    this.totalTime -= Date.now();
    this.totalCount++;
    this.activeCount++;
  }

  end(){
    this.updateConcerrency();
    this.activeCount--;
    this.totalTime += Date.now();
    this.averageTime = this.totalTime / this.totalCount;
    if(!this.activeCount)
      this.actualTime += Date.now();
    this.averageConcurrency = this.totalTime / this.actualTime;
  }

}

export const timers = {
  workSha: new Timer(),
  workSerialize: new Timer(),
  workProcess: new Timer(),
  productSha: new Timer(),
  productSerialize: new Timer(),
  sha: new Timer(),
}
