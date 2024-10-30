import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core'
import { MatIconButton } from '@angular/material/button'
import { MatIcon } from '@angular/material/icon'
import { Store } from '@ngrx/store'
import { RootState } from 'src/store/app.store'
import { TransitLinesActions } from 'src/store/transit-lines/transit-lines.actions'
import { fromTransitLines } from 'src/store/transit-lines/transit-lines.selectors'
import { TransitStop } from 'src/types/line'

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIconButton, MatIcon, CommonModule],
})
export class DetailComponent {
  readonly stopName: Signal<string>
  readonly selectedStop: Signal<TransitStop>
  private averages: Record<string, number>

  constructor(private store: Store<RootState>) {
    this.selectedStop = this.store.selectSignal(fromTransitLines.selectedStop)
    this.stopName = computed(() => this.selectedStop()?.name || 'No selection')
    const allStops  = this.store.selectSignal(fromTransitLines.allStops)
    this.averages = allStops().reduce((acc, obj) => {
      acc.count += 1
      acc.peopleOnAverage += Math.floor(obj.peopleOn / acc.count)
      acc.peopleOffAverage += Math.floor(obj.peopleOff / acc.count)
      acc.reachablePopulationWalkAverage += Math.floor(obj.reachablePopulationWalk / acc.count)
      acc.reachablePopulationBikeAverage += Math.floor(obj.reachablePopulationBike / acc.count)
      return acc
    }, { peopleOnAverage: 0, peopleOffAverage: 0, reachablePopulationWalkAverage: 0, reachablePopulationBikeAverage: 0, count: 0 })
  }

  getColor(value: number, key: string) {
    if (value > this.averages[key + 'Average']) {
      return {color: 'green'}
    } 
    return {color: 'red'}
  }

  clearSelection(): void {
    this.store.dispatch(TransitLinesActions.SelectStop({ selectedStopId: null }))
  }
}
