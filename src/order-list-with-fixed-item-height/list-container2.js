import {inject, computedFrom} from 'aurelia-framework';
import {DndService} from 'bcx-aurelia-dnd';
import {EventAggregator} from 'aurelia-event-aggregator';
import _ from 'lodash';

@inject(DndService, EventAggregator)
export class ListContainer2 {
  items = [
    {id: '0', value: 'first'},
    {id: '1', value: 'second'},
    {id: '2', value: 'third'},
    {id: '3', value: 'fourth'}
  ];

  intention;

  constructor(dndService, ea) {
    this.dndService = dndService;
    this.ea = ea;
  }

  attached() {
    this.dndService.addTarget(this);
    this.subscribers = [
      this.ea.subscribe('dnd:willStart', () => this.resetIntention()),
      this.ea.subscribe('dnd:didEnd', () => this.resetIntention())
    ];
  }

  detached() {
    this.dndService.removeTarget(this);
    this.subscribers.forEach(s => s.dispose());
  }

  resetIntention() {
    this.intention = null;
  }

  dndCanDrop(model) {
    return model.type === 'orderItem2';
  }

  dndHover(location) {
    const {y} = location.mouseEndPointOffsetInTargetElement;
    const {id, elementHeight} = this.dnd.model;

    const idx = _.findIndex(this.items, {id});
    if (idx < 0) return;

    // we have zero margin between item elements.
    // otherwise has to do (y / (margin + elementHeight))
    const newIdx = Math.floor(y / elementHeight);
    this.intention = {fromIndex: idx, toIndex: newIdx};
  }

  dndDrop() {
    if (!this.intention) return;
    const {fromIndex, toIndex} = this.intention;
    if (fromIndex === toIndex) return;

    const item = this.items[fromIndex];
    this.items.splice(fromIndex, 1);
    this.items.splice(toIndex, 0, item);
  }

  @computedFrom('items', 'intention')
  get patchedItems() {
    const {items, intention} = this;
    if (!intention) return items;
    const {fromIndex, toIndex} = this.intention;

    let patched = [...items];
    const item = this.items[fromIndex];
    patched.splice(fromIndex, 1);
    patched.splice(toIndex, 0, item);
    return patched;
  }
}