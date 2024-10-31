import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, WritableSignal, signal } from '@angular/core'
import { MatIconButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { Store } from '@ngrx/store'
import { combineLatest } from 'rxjs'
import { RootState } from 'src/store/app.store'
import { TransitLinesActions } from 'src/store/transit-lines/transit-lines.actions'
import { fromTransitLines } from 'src/store/transit-lines/transit-lines.selectors'
import { TransitStop } from 'src/types/line'
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconButton, MatIcon, CommonModule],
})
export class DetailComponent {
  readonly selectedStop: WritableSignal<TransitStop> = signal<TransitStop | null>(null);
  private averages: Record<string, number> = {
    peopleOnAverage: 0,
    peopleOffAverage: 0,
    reachablePopulationWalkAverage: 0,
    reachablePopulationBikeAverage: 0,
    count: 0
  }

  constructor(private store: Store<RootState>) {
    const allStops$ = toObservable(this.store.selectSignal(fromTransitLines.allStops));
    const selectedStop$ = toObservable(this.store.selectSignal(fromTransitLines.selectedStop));

  combineLatest([allStops$, selectedStop$])
    .pipe()
    .subscribe(([allStops, selectedStop]) => {

      this.averages = allStops?.reduce((acc, obj) => {
        acc.count += 1
        acc.peopleOnAverage += Math.floor(obj.peopleOn / acc.count)
        acc.peopleOffAverage += Math.floor(obj.peopleOff / acc.count)
        acc.reachablePopulationWalkAverage += Math.floor(obj.reachablePopulationWalk / acc.count)
        acc.reachablePopulationBikeAverage += Math.floor(obj.reachablePopulationBike / acc.count)
        return acc
      }, { peopleOnAverage: 0, peopleOffAverage: 0, reachablePopulationWalkAverage: 0, reachablePopulationBikeAverage: 0, count: 0 })
      
      if (selectedStop) {
        this.selectedStop.set(selectedStop);
      } else {
        const storageStopId = localStorage.getItem('selectedStop');
        
        const storageStop = allStops.find((stop) => stop.id === storageStopId);
        this.selectedStop.set(storageStop || null);
      }
    });
  }

  getColor(value: number, key: string) {
    if (this.averages[key + 'Average'] && value > this.averages[key + 'Average']) {
      return {color: 'green'}
    } 
    return {color: 'red'}
  }

  clearSelection(): void {
    localStorage.setItem('selectedStop', null);
    this.store.dispatch(TransitLinesActions.SelectStop({ selectedStopId: null }))
  }
}
