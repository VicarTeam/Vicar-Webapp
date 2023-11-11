<script lang="ts">
import {Vue, Component, Ref} from 'vue-property-decorator';
import Tab from "@/components/tabs/Tab.vue";
import Avatar from "@/components/Avatar.vue";
import Tabs from "@/components/tabs/Tabs.vue";
import IconButton from "@/components/IconButton.vue";
import {ClanResponse, VicarNet} from "@/libs/io/vicar-net";
import StartCreateContentModal from "@/components/homebrew/modals/StartCreateContentModal.vue";
import MyContentTab from "@/components/homebrew/MyContentTab.vue";
import {HomebrewManager} from "@/libs/data/homebrew-manager";
import InstalledContentTab from "@/components/homebrew/InstalledContentTab.vue";

@Component({
  components: {InstalledContentTab, MyContentTab, StartCreateContentModal, IconButton, Tabs, Avatar, Tab}
})
export default class HomebrewView extends Vue {

  @Ref("startCreateContentModal")
  private startCreateContentModal!: StartCreateContentModal;

  private VicarNet = VicarNet;
  private selectedTab: string = "tab-installed";
  private inviteCode: string = "";

  public setTab(tab: string) {
    this.selectedTab = tab;
  }

  private async installInviteContent() {
    if (this.inviteCode.trim().length <= 0) {
      return;
    }

    const data = await VicarNet.getContentFromInvite(this.inviteCode);
    if (data) {
      if (data.type === "clan") {
        await HomebrewManager.installClan((data.content as ClanResponse).clan, (data.content as ClanResponse).neededHomebrewDisciplines);
      } else if (data.type === "discipline") {
        await HomebrewManager.installDiscipline(data.content as any);
      }

      this.inviteCode = "";

      this.$forceUpdate();
    }
  }
}
</script>

<template>
  <div class="d-flex flex-column">
    <div class="d-flex top-bar">
      <div class="actions left" style="display: flex; gap: 0.5rem; justify-content: center; align-items: center">
        <input type="text" class="form-control" v-model="inviteCode" :placeholder="$t('homebrew.invitecode.input')"/>
        <button class="btn btn-primary" :disabled="inviteCode.length <= 0" @click="installInviteContent()">{{$t('homebrew.invitecode.submit')}}</button>
      </div>
      <Tabs class="center" v-model="selectedTab">
<!--        <Tab value="tab-allclans" :text="$t('homebrew.tabs.allclans')"/>
        <Tab value="tab-alldisciplines" :text="$t('homebrew.tabs.alldisciplines')"/>-->
        <Tab value="tab-installed" :text="$t('homebrew.tabs.installed')"/>
        <Tab v-if="VicarNet.isLoggedIn" value="tab-mycontent" :text="$t('homebrew.tabs.mycontent')"/>
      </Tabs>
      <div class="actions">
        <button v-if="VicarNet.isLoggedIn" class="btn btn-primary" @click="startCreateContentModal.show()">{{$t('homebrew.create').toString()}}</button>
      </div>
    </div>
    <div class="flex-grow-1" style="width: 100%; height: calc(100vh - 4.2rem*2 - 3px*2); overflow-x: hidden; overflow-y: auto">
      <MyContentTab v-if="selectedTab === 'tab-mycontent'"/>
      <InstalledContentTab v-else-if="selectedTab === 'tab-installed'"/>
    </div>

    <StartCreateContentModal ref="startCreateContentModal"/>
  </div>
</template>

<style scoped lang="scss">
.top-bar {
  flex-direction: row !important;
  flex-shrink: 0;
  font-size: 1rem;
  .actions {
    width: 25%;
    gap: 0.5rem;
    display: flex;
    padding: 0.5rem 1rem;
    flex-shrink: 0;
    flex-direction: row !important;
    border-bottom: 1px solid var(--primary-color);
    justify-content: flex-end;
    align-items: center;
    &.left {
      justify-content: flex-start;
    }
  }
  .center {
    flex-grow: 1;
    width: 50%;
  }
}
</style>