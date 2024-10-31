import { ChangeDetectionStrategy, Component, Renderer2, WritableSignal, signal } from '@angular/core'
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

  readonly lines: WritableSignal<TransitLine[]> = signal<TransitLine[]>([])
  readonly showLineStops: Record<string, boolean> = {}


  constructor(private store: Store<RootState>, private renderer: Renderer2) {
    this.store.select(fromTransitLines.selectAll).subscribe((transitLines: TransitLine[]) => {
      this.lines.set(transitLines);
      for (let line of this.lines()) {
        const storageBool = localStorage.getItem(line.id)
        this.showLineStops[line.id] = storageBool ? storageBool === 'true' : false
      }
    });
  }
  
  OnInit() {
    this.renderer.listen('window', 'beforeunload', () => this.OnDestroy())
  }

  OnDestroy() {
    for (let [key, value] of Object.entries(this.showLineStops)) {
      localStorage.setItem(key, value.toString())
    }
  }
  
  selectStop(selectedStopId: string): void {
    localStorage.setItem('selectedStop', selectedStopId);
    this.store.dispatch(TransitLinesActions.SelectStop({ selectedStopId }))
  }
}
