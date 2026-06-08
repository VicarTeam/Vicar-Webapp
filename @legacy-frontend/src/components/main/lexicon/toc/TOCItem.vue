<template>
  <div class="toc-item">
    <span class="head">
      <span class="title toc-hoverable" @click="goToParagraph(paragraph)">{{title}}</span>
      <i v-if="icon" class="icon fa-solid" :class="icon" @click="$emit('iconclick')"></i>
    </span>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Prop, Vue} from "vue-property-decorator";

@Component({
  components: {}
})
export default class TOCItem extends Vue {

  @Prop({required: true})
  private title!: string;

  @Prop({required: true})
  private paragraph!: string;

  @Prop({default: ""})
  private icon!: string;

  @Inject("go-to-paragraph")
  private goToParagraph!: (paragraph: string) => void;
}
</script>

<style scoped lang="scss">
.toc-hoverable {
  &:hover {
    color: var(--primary-color-light);
  }
  &:active {
    color: var(--primary-color);
  }
}
.toc-item {
  width: 100%;
  padding: 1rem 0 1rem 1.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  font-weight: bolder;
  .head {
    width: 100%;
    display: flex;
    align-content: center;
    .title {
      flex-grow: 1;
    }
    .icon {
      flex-shrink: 0;
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}
</style>
