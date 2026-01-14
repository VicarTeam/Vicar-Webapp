declare module "vue-dndrop" {
    import Vue from 'vue';

    export class Container extends Vue {
        drop: (...params: any) => any;
    }

    export class Draggable extends Vue {

    }
}
