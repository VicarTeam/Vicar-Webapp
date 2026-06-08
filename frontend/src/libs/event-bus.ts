const registeredEvents = new Map<string, Set<(...args: any[]) => any>>();

const EventBus = {
  $on(event: string, handler: (...args: any[]) => any) {
    if (!registeredEvents.has(event)) {
      registeredEvents.set(event, new Set());
    }
    registeredEvents.get(event)!.add(handler);
  },
  $once(event: string, handler: (...args: any[]) => any) {
    const onceHandler = (...args: any[]) => {
      handler(...args);
      this.$off(event, onceHandler);
    };
    this.$on(event, onceHandler);
  },
  $off(event: string, handler: (...args: any[]) => any) {
    if (registeredEvents.has(event)) {
      registeredEvents.get(event)!.delete(handler);
    }
  },
  $emit(event: string, ...args: any[]) {
    if (registeredEvents.has(event)) {
      for (const handler of registeredEvents.get(event)!) {
        handler(...args);
      }
    }
  }
};
export default EventBus;
