import {Component, Prop, Vue} from "vue-property-decorator";
import {ICharacter} from "@/types/models";
import EventBus from "@/libs/event-bus";

@Component({
  components: {}
})
export default class PTActionBase<T> extends Vue {

  @Prop({required: true})
  protected data!: T;

  constructor() {
    super();
    EventBus.$emit("insert-ptaction", this);
  }

  public applyOutput(char: ICharacter): void {
    throw new Error("Method not implemented.");
  }

  public isReady(): boolean {
    return false;
  }
}

