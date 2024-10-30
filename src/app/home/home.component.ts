import { ChangeDetectionStrategy, Component, Signal } from '@angular/core'
import { MatIcon } from '@angular/material/icon'
import { Store } from '@ngrx/store'
import { RootState } from 'src/store/app.store'
import { TransitLinesActions } from 'src/store/transit-lines/transit-lines.actions'
import { fromTransitLines } from 'src/store/transit-lines/transit-lines.selectors'
import { TransitLine } from 'src/types/line'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [MatIcon],
})
export class HomeComponent {
  readonly lines: Signal<TransitLine[]>
  readonly showLineStops: Record<string, boolean>[] = [];


  constructor(private store: Store<RootState>) {
    this.lines = this.store.selectSignal(fromTransitLines.selectAll)
    for (let line of this.lines()) {
      this.showLineStops.push({ [line.id]: false});
    }
  }

  selectStop(selectedStopId: string): void {
    this.store.dispatch(TransitLinesActions.SelectStop({ selectedStopId }))
  }
}
