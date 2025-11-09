<template>
  <div class="profile-view">
    <input type="file" ref="avatarUploader" @change="onAvatarUpload" accept="image/png, image/gif, image/jpeg" hidden/>
    <div class="meta">
      <Avatar :src="editingCharacter.avatar" style="width: 12rem; height: 12rem; cursor: pointer; flex-shrink: 0" :draggable="true"
              @click="changeAvatar($event)"/>
      <div class="info">
        <div class="name" v-if="!isEditName">
          {{ editingCharacter.name }}
          <IconButton style="width: 3rem; height: 3rem; margin-left: 1rem" icon="fa-pen"
                      @click="editName = editingCharacter.name; isEditName = true"/>
        </div>
        <div class="name" v-else style="gap: 1rem;">
          <input class="form-control" style="width: 20rem" type="text" v-model="editName"/>
          <IconButton icon="fa-check" @click="editingCharacter.name = editName; isEditName = false"/>
          <IconButton icon="fa-x" @click="isEditName = false"/>
        </div>
        <span v-if="isVampire" class="side">
          {{ $t('character.sex.' + editingCharacter.sex) }}
          <bullet/>
          <i> Clan:</i> {{ editingCharacter.clan.name }}
          <bullet/>
          {{ editingCharacter.clan.slogan }} <TipButton :content="editingCharacter.clan.curse"/>
        </span>
        <span v-else-if="isWerewolf" class="side">
          {{ $t('character.sex.' + editingCharacter.sex) }}
          <bullet/>
          <i> Stamm:</i> {{ editingCharacter.tribe.name }}
          <bullet/>
          <i> Patrongeist:</i> {{ editingCharacter.tribe.patron.name }}
          <bullet/>
          <i> Gunst <TipButton :content="editingCharacter.tribe.favor"/></i>
          <bullet style="margin-left: 0.25rem"/>
          <i> Bann <TipButton :content="editingCharacter.tribe.ban"/></i>
        </span>
        <span v-else-if="isMage" class="side">
          {{ $t('character.sex.' + editingCharacter.sex) }}
          <bullet/>
          <i style="cursor: pointer; user-select: none" @click="showTip($t('m20.archetype.description'))"> {{$t('m20.archetype.nature')}}:</i> {{ editingCharacter.nature.name }} <TipButton :content="editingCharacter.nature.description" style="margin-right: 0.25rem"/>
          <bullet/>
          <i style="cursor: pointer; user-select: none" @click="showTip($t('m20.archetype.description'))"> {{$t('m20.archetype.demeanor')}}:</i> {{ editingCharacter.demeanor.name }} <TipButton :content="editingCharacter.demeanor.description" style="margin-right: 0.25rem"/>
          <bullet/>
          <i style="cursor: pointer; user-select: none" @click="showTip($t('m20.essence.description'))"> {{$t('m20.essence')}}:</i> {{ $t('m20.essence.' + editingCharacter.essence) }} <TipButton :content="$t('m20.essence.' + editingCharacter.essence + '.description')" style="margin-right: 0.25rem"/>
          <bullet/>
          <i style="cursor: pointer; user-select: none" @click="showTip($t('m20.tradition.description'))"> {{$t('m20.tradition')}}:</i> {{ editingCharacter.tradition.name }}
        </span>
        <span v-else-if="isHunter" class="side">
          {{ $t('character.sex.' + editingCharacter.sex) }}
          <bullet/>
          <i> Credo:</i> {{ editingCharacter.creed.name }}
          <bullet/>
          <i style="cursor: pointer; user-select: none" @click="showTip($t('h5.drive.description'))"> {{$t('h5.drive')}}:</i> {{ editingCharacter.drive.name }} <TipButton :content="editingCharacter.drive.description" style="margin-right: 0.25rem"/>
          <i style="margin-left: 0.5rem"> Erlösung:</i> <TipButton :content="editingCharacter.drive.redemption" style="margin-right: 0.25rem"/>
        </span>

        <span v-if="isVampire && !mocActive" class="side" style="margin-top: 0.2rem">
          <i>Generation:</i> <input v-if="editingCharacter.fullCustomization" class="form-control" v-model.number="editingCharacter.generation"/><span v-else>{{editingCharacter.generation}}</span> ({{ $t('character.generation.' + editingCharacter.generationEra) }})
          <bullet/>
          <i> {{ $t('data.predatortype') }}:</i> {{ editingCharacter.predatorType.name }}
        </span>
        <span v-if="isVampire && mocActive" class="side" style="margin-top: 0.2rem">
          <i>Generation:</i> 1 (<input v-if="editingCharacter.fullCustomization" class="form-control" v-model.number="editingCharacter.generation"/><span v-else>{{editingCharacter.generation}}</span>)
          <bullet/>
          <i> {{ $t('data.predatortype') }}:</i> {{ editingCharacter.predatorType.name }}
        </span>
      </div>

      <div class="middle-meta">
        <MarkOfCain v-if="isVampire" :show-progression="mocActive" :path="mocPath" :level="mocLevel" @updated="$forceUpdate()"/>
      </div>

      <div class="stats">
        <div class="row">
          <div v-if="isVampire" class="stat" style="margin-right: 5rem">
            <b>{{ $t('character.sire') }}:</b>
            <small v-if="!editingCharacter.fullCustomization">{{ editingCharacter.sire }}</small>
            <input v-else class="form-control" type="text" v-model="editingCharacter.sire"/>
          </div>
          <div class="stat" id="hlst-health">
            <b>{{ $t('character.health') }}:</b>
            <Damage prop-key="health"/>
          </div>
          <div class="stat" id="hlst-willpower">
            <b><LevelButton v-if="isMage && editingCharacter.willpower < 10" style="margin-right: 0.25rem" @click="requestLevel('willpower')"/>{{ $t('character.willpower') }}:</b>
            <Damage prop-key="willpower"/>
          </div>
          <div v-if="isHunter" class="stat">
            <b>Verzweiflung:</b>
            <Squares :max="1" :amount="editingCharacter.despair"
                     @click="v => {editingCharacter.despair = v === editingCharacter.despair ? 0 : v; saveChar(true);}"/>
          </div>
        </div>
        <div class="row">
          <div v-if="isVampire" class="stat" style="margin-right: 5rem" id="hlst-blood">
            <b>
              {{ $t('character.bloodpotency') }}:
              <LevelButton v-if="editingCharacter.bloodPotency < 10 && editingCharacter.cainsMarkLevel !== -5" @click="levelBloodPotencyModal.showModal()"/>
              <i class="iconbtnprim fa-solid fa-minus" v-if="editingCharacter.fullCustomization && editingCharacter.bloodPotency > 0" @click="decreaseBloodPotency"/>
            </b>
            <Squares :max="10" :amount="editingCharacter.bloodPotency" :margin-at="6" target-type="bloodpotency"/>
          </div>
          <div v-if="isVampire" class="stat" id="hlst-humanity">
            <b>
              {{ $t('character.humanity') }}: <TipButton v-if="editingCharacter.humanity <= 5" :content="$t('character.humanity.malus', {dices: humanityMalus})" :danger="true"/>
            </b>
            <Humanity/>
          </div>
          <div v-if="isVampire" class="stat" id="hlst-hunger">
            <b>{{ $t('character.hunger') }}:</b>
            <Squares :max="5" :amount="editingCharacter.hunger"
                     @click="v => {editingCharacter.hunger = v === editingCharacter.hunger ? 0 : v; saveChar(true);}"/>
          </div>
          <div v-else-if="isWerewolf" class="stat">
            <b>Rage: <TipButton :content="$t('viewer.w5.rage')"/></b>
            <Squares :max="5" :amount="editingCharacter.rage"
                     @click="v => {editingCharacter.rage = v === editingCharacter.rage ? 0 : v; saveChar(true);}"/>
          </div>
        </div>
      </div>
    </div>
    <Tabs/>

    <div class="simple">
      <div class="column">
        <div class="form-group">
          <label>{{ $t('character.chronicle') }}: <TipButton :content="$t('character.chronicle.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.chronicle" @input="saveChar"/>
        </div>

        <div v-if="isMage" class="form-group">
          <label>Fokus:</label>
          <textarea class="form-control" v-model="editingCharacter.focus" @input="saveChar"/>
        </div>
        <div v-else class="form-group">
          <label>{{$t('character.chronicleprinciples')}}: <TipButton :content="$t('character.chronicleprinciples.tip')"/></label>
          <textarea class="form-control" v-model="editingCharacter.chroniclePrinciples" @input="saveChar"/>
        </div>
      </div>
      <div class="column">
        <div class="form-group">
          <label>{{ $t('character.concept') }}: <TipButton :content="$t('character.concept.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.concept" @input="saveChar"/>
        </div>

        <div v-if="isMage" class="form-group">
          <label>Wunder: <TipButton :content="$t('m20.wonder.description')"/></label>
          <textarea class="form-control" v-model="editingCharacter.wonders" @input="saveChar"/>
        </div>
        <div v-else class="form-group">
          <label>{{$t('character.anchorsandbeliefs')}}: <TipButton :content="$t('character.anchorsandbeliefs.tip')"/></label>
          <textarea class="form-control" v-model="editingCharacter.anchorsAndBeliefs" @input="saveChar"/>
        </div>
      </div>
      <div class="column">
        <div v-if="isVampire" class="form-group">
          <label>{{ $t('character.ambition') }}: <TipButton :content="$t('character.ambition.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.ambition" @input="saveChar"/>
        </div>
        <div v-else-if="isHunter" class="form-group">
          <label>{{ $t('character.ambition') }}: <TipButton :content="$t('character.ambition.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.ambition" @input="saveChar"/>
        </div>
        <div v-else-if="isWerewolf" class="form-group" style="height: 6rem; display: flex; flex-direction: column">
          <label style="text-align: center; font-weight: bold">Verfall</label>
          <div style="display: flex; justify-content: space-between">
            <div style="display: flex; flex-direction: column">
              <label style="text-align: left">Harano <TipButton :content="$t('viewer.w5.harano')"/></label>
              <Squares :max="5" :amount="editingCharacter.harano"
                       @click="v => {editingCharacter.harano = v === editingCharacter.harano ? 0 : v; saveChar(true);}"/>
            </div>
            <div style="display: flex; flex-direction: column">
              <label style="text-align: right"><TipButton :content="$t('viewer.w5.hauglosk')"/> Hauglosk</label>
              <Squares :max="5" :amount="editingCharacter.hauglosk"
                       @click="v => {editingCharacter.hauglosk = v === editingCharacter.hauglosk ? 0 : v; saveChar(true);}"/>
            </div>
          </div>
        </div>
        <div v-else-if="isMage" class="form-group" style="height: 6rem; display: flex; flex-direction: column">
          <label style="text-align: center; font-weight: bold">Quintessenz & Paradoxon <TipButton :content="$t('m20.quintessence_and_paradoxon')"/></label>

          <div style="display: flex; justify-content: space-between">
            <div style="display: flex; flex-direction: column">
              <label style="text-align: left">
                Quintessenz
              </label>
              <Squares :max="10" :amount="editingCharacter.quintessence"
                       @click="v => {editingCharacter.quintessence = v === editingCharacter.quintessence ? 0 : v; saveChar(true);}"/>
            </div>
            <div style="display: flex; flex-direction: column">
              <label style="text-align: right">Paradoxon</label>
              <Squares :max="10" :amount="editingCharacter.paradox"
                       @click="v => {editingCharacter.paradox = v === editingCharacter.paradox ? 0 : v; saveChar(true);}"/>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>{{$t('character.backstory')}}:</label>
          <textarea class="form-control" v-model="editingCharacter.backstory" @input="saveChar"/>
        </div>
      </div>
      <div class="column">
        <div v-if="isVampire" class="form-group">
          <label>{{ $t('character.desire') }}: <TipButton :content="$t('character.desire.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.desire" @input="saveChar"/>
        </div>
        <div v-else-if="isHunter" class="form-group">
          <label>{{ $t('character.desire') }}: <TipButton :content="$t('character.desire.tip')"/></label>
          <input class="form-control" type="text" v-model="editingCharacter.desire" @input="saveChar"/>
        </div>
        <div v-else-if="isWerewolf" class="form-group" style="height: 6rem; display: flex; flex-direction: column">
          <label style="text-align: center; font-weight: bold">Ansehen ({{totalRenown}})</label>
          <div style="display: flex; justify-content: space-between">
            <div style="display: flex; flex-direction: column">
              <label>
                Ruhm
                <LevelButton v-if="gloryRenown < 5" @click="levelRenown(RenownKey.Glory)"/>
              </label>
              <Squares :max="5" :amount="gloryRenown"
                       @click="v => {gloryRenown = v === gloryRenown ? 0 : v; saveChar(true);}"/>
            </div>
            <div style="display: flex; flex-direction: column">
              <label style="text-align: center">
                Ehre
                <LevelButton v-if="honorRenown < 5" @click="levelRenown(RenownKey.Honor)"/>
              </label>
              <Squares :max="5" :amount="honorRenown"
                       @click="v => {honorRenown = v === honorRenown ? 0 : v; saveChar(true);}"/>
            </div>
            <div style="display: flex; flex-direction: column">
              <label style="text-align: right">
                Weisheit
                <LevelButton v-if="wisdomRenown < 5" @click="levelRenown(RenownKey.Wisdom)"/>
              </label>
              <Squares :max="5" :amount="wisdomRenown"
                       @click="v => {wisdomRenown = v === wisdomRenown ? 0 : v; saveChar(true);}"/>
            </div>
          </div>
        </div>
        <div v-else-if="isMage" class="form-group" style="height: 6rem; display: flex; flex-direction: column">
          <label style="text-align: center; font-weight: bold">
            <LevelButton v-if="editingCharacter.arete < 10" @click="requestLevel('arete')"/>
            {{$t('m20.arete')}} <TipButton :content="$t('m20.arete.description')"/>
          </label>
          <div style="display: flex; justify-content: center; align-content: flex-end; flex: 1">
            <Squares :max="10" :amount="editingCharacter.arete"
                     @click="v => {editingCharacter.arete = v === editingCharacter.arete ? 0 : v; saveChar(true);}"/>
          </div>
        </div>

        <div class="form-group">
          <label>{{$t('character.notes')}}:</label>
          <textarea class="form-control" v-model="editingCharacter.notes" @input="saveChar"/>
        </div>
      </div>
    </div>
    <Tabs/>

    <div style="width: 100%; padding: 2rem; flex-direction: column; justify-content: center; align-items: center">
      <Row v-if="isVampire" style="width: 100%">
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <Row><b>{{$t('character.bloodpotency.spurt')}}</b>: <TipButton :content="$t('character.bloodpotency.spurt.desc')"/></Row>
          <Row><small>{{getBloodPotency().bleedingSpurt}} {{$t('character.dice')}}</small></Row>
        </Col>
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <Row><b>{{$t('character.bloodpotency.healing')}}</b>: <TipButton :content="$t('character.bloodpotency.healing.desc')"/></Row>
          <Row><small>{{getBloodPotency().healedDamage}} {{$t('character.simpledmg')}}</small></Row>
        </Col>
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <Row><b>{{$t('character.bloodpotency.bonus')}}</b>: <TipButton :content="$t('character.bloodpotency.bonus.desc')"/></Row>
          <Row><small>{{getBloodPotency().disciplineBonus}} {{$t('character.dice')}}</small></Row>
        </Col>
      </Row>

      <Row v-if="isHunter" style="width: 100%">
        <Col style="width: 100%; text-align: center">
          <div>
            <bullet/><bullet/><bullet/>
            <b>Credo: {{editingCharacter.creed.name}} <TipButton :content="editingCharacter.creed.description"/></b>
            <bullet/><bullet/><bullet/>
          </div>
        </Col>
      </Row>
      <Row v-if="isHunter" style="width: 100%; margin-top: 1rem">
        <Col style="width: calc(100%/3); justify-content: flex-start; align-items: center; margin-right: 3rem">
          <Row><b>Persönlichkeit</b></Row>
          <Row>
            <small>{{editingCharacter.creed.personality}}</small>
          </Row>
        </Col>
        <Col style="width: calc(100%/3); justify-content: flex-start; align-items: center">
          <Row><b>Taktiken</b></Row>
          <Row>
            <small style="text-align: center">{{editingCharacter.creed.tactics}}</small>
          </Row>
        </Col>
        <Col style="width: calc(100%/3); justify-content: flex-start; align-items: center; margin-left: 3rem">
          <Row><b>Gefahren</b></Row>
          <Row>
            <small style="text-align: right">{{editingCharacter.creed.dangers}}</small>
          </Row>
        </Col>
      </Row>

      <Row v-if="isVampire" style="width: 100%; margin-top: 1rem">
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <Row><b>{{$t('character.bloodpotency.rouserepeat')}}</b>: <TipButton :content="$t('character.bloodpotency.rouserepeat.desc')"/></Row>
          <Row><small>{{$t('character.bloodpotency.rouserepeat.val', {x: getBloodPotency().rouseRepeatDisciplineLevel})}}</small></Row>
        </Col>
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <Row><b>{{$t('character.bloodpotency.banelevel')}}</b>:</Row>
          <Row><small>{{getBloodPotency().baneLevel}}</small></Row>
        </Col>
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <Row><b>{{$t('character.bloodpotency.pray')}}</b>:</Row>
          <Row><small>{{getBloodPotency().pray}}</small></Row>
        </Col>
      </Row>

      <Row v-if="isWerewolf" style="width: 100%">
        <Col style="width: 100%; text-align: center">
          <div>
            <bullet/><bullet/><bullet/>
            <b>Formen des Garou</b>
            <bullet/><bullet/><bullet/>
          </div>
        </Col>
      </Row>
      <Row v-if="isWerewolf" style="width: 100%; margin-top: 1rem">
        <Col style="width: calc(100%/5); justify-content: center; align-items: center">
          <Row><b>Homid</b></Row>
          <Row>Kosten: frei</Row>
          <Row>Immun gegen Silber</Row>
        </Col>
        <Col style="width: calc(100%/5); justify-content: center; align-items: center">
          <Row><b>Glabro</b></Row>
          <Row>Kosten: 1 Rage-Test</Row>
          <Row>Körperliche Tests: Bonus von 2 Würfeln</Row>
          <Row>Soziale Tests: Malus von 2 Würfeln</Row>
          <Row>Regenerierung: 1 pro Rage-Test</Row>
        </Col>
        <Col style="width: calc(100%/5); justify-content: center; align-items: center">
          <Row><b>Crinos</b></Row>
          <Row>Kosten: 2 Rage-Test</Row>
          <Row><span style="text-align: center">Pro Runde 1 Willenskraft ausgeben oder in Raserei verfallen</span></Row>
          <Row>+4 Leben</Row>
          <Row>Körperliche Tests: Bonus von 4 Würfeln</Row>
          <Row>Soziale & Heimlichkeit Tests: fehlschlag</Row>
          <Row>Regenerierung: 2 pro Rage-Test</Row>
          <Row>Biss: +1 schwerer Schaden</Row>
          <Row>Verursacht Delirium</Row>
        </Col>
        <Col style="width: calc(100%/5); justify-content: center; align-items: center">
          <Row><b>Hispo</b></Row>
          <Row>Kosten: 1 Rage-Test</Row>
          <Row>Körperliche Tests: Bonus von 2 Würfeln</Row>
          <Row>Soziale Tests: nur mit Wölfen und Garou</Row>
          <Row>Regenerierung: 1 pro Rage-Test</Row>
          <Row>Biss: +1 schwerer Schaden</Row>
        </Col>
        <Col style="width: calc(100%/5); justify-content: center; align-items: center">
          <Row><b>Lupus</b></Row>
          <Row>Kosten: frei</Row>
          <Row>Immun gegen Silber</Row>
          <Row>Soziale Tests: nur mit Wölfen und Garou</Row>
        </Col>
      </Row>

      <Row v-if="isMage" style="width: 100%">
        <Col style="width: 100%; text-align: center">
          <div>
            <bullet/><bullet/><bullet/>
            <b>Sphären <TipButton :content="$t('m20.sphere.description')"/></b>
            <bullet/><bullet/><bullet/>
          </div>
        </Col>
      </Row>
      <Row v-if="isMage" style="width: 100%; margin-top: 1rem">
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Correspondence] < 5" @click="requestLevel('sphere', Sphere.Correspondence)"/>
              {{$t('m20.sphere.correspondence')}} <TipButton :content="$t('m20.sphere.correspondence.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Correspondence]"/>
          </div>
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Entropy] < 5" @click="requestLevel('sphere', Sphere.Entropy)"/>
              {{$t('m20.sphere.entropy')}} <TipButton :content="$t('m20.sphere.entropy.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Entropy]"/>
          </div>
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Forces] < 5" @click="requestLevel('sphere', Sphere.Forces)"/>
              {{$t('m20.sphere.forces')}} <TipButton :content="$t('m20.sphere.forces.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Forces]"/>
          </div>
        </Col>
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Life] < 5" @click="requestLevel('sphere', Sphere.Life)"/>
              {{$t('m20.sphere.life')}} <TipButton :content="$t('m20.sphere.life.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Life]"/>
          </div>
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Matter] < 5" @click="requestLevel('sphere', Sphere.Matter)"/>
              {{$t('m20.sphere.matter')}} <TipButton :content="$t('m20.sphere.matter.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Matter]"/>
          </div>
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Mind] < 5" @click="requestLevel('sphere', Sphere.Mind)"/>
              {{$t('m20.sphere.mind')}} <TipButton :content="$t('m20.sphere.mind.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Mind]"/>
          </div>
        </Col>
        <Col style="width: calc(100%/3); justify-content: center; align-items: center">
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Spirit] < 5" @click="requestLevel('sphere', Sphere.Spirit)"/>
              {{$t('m20.sphere.spirit')}} <TipButton :content="$t('m20.sphere.spirit.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Spirit]"/>
          </div>
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Time] < 5" @click="requestLevel('sphere', Sphere.Time)"/>
              {{$t('m20.sphere.time')}} <TipButton :content="$t('m20.sphere.time.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Time]"/>
          </div>
          <div style="display: flex; justify-content: space-between; align-content: center; width: 30rem; border-bottom: 1px solid var(--primary-color); padding-bottom: 0.5rem; margin-bottom: 0.5rem">
            <span>
              <LevelButton v-if="editingCharacter.spheres[Sphere.Prime] < 5" @click="requestLevel('sphere', Sphere.Prime)"/>
              {{$t('m20.sphere.prime')}} <TipButton :content="$t('m20.sphere.prime.description')"/>
            </span>
            <Squares :max="5" :amount="editingCharacter.spheres[Sphere.Prime]"/>
          </div>
        </Col>
      </Row>
    </div>
    <BloodPotencyModal ref="levelBloodPotencyModal"/>
    <RenownModal ref="levelRenownModal"/>
    <ConfirmDeleteModal ref="confirmDeleteModal"/>
  </div>
</template>

<script lang="ts">
import {Component, Inject, Ref, Vue} from "vue-property-decorator";
import Avatar from "@/components/Avatar.vue";
import {State} from "vuex-class";
import {getHumanInteractionMalus, ICharacter, LevelType} from "@/types/models";
import Bullet from "@/components/Bullet.vue";
import IconButton from "@/components/IconButton.vue";
import Squares from "@/components/progress/Squares.vue";
import Tabs from "@/components/tabs/Tabs.vue";
import Tab from "@/components/tabs/Tab.vue";
import TipButton from "@/components/editor/TipButton.vue";
import LevelButton from "@/components/viewer/LevelButton.vue";
import BloodPotencyModal from "@/components/viewer/modals/leveling/BloodPotencyModal.vue";
import {IBloodPotencyData} from "@/types/data";
import DataManager from "@/libs/data/data-manager";
import Col from "@/components/viewer/pdf/Col.vue";
import Row from "@/components/viewer/pdf/Row.vue";
import Humanity from "@/components/progress/tracker/Humanity.vue";
import Damage from "@/components/progress/tracker/Damage.vue";
import CharacterStorage from "@/libs/io/character-storage";
import ConfirmDeleteModal from "@/components/viewer/modals/ConfirmDeleteModal.vue";
import NewSpecializationModal from "@/components/viewer/modals/leveling/NewSpecializationModal.vue";
import EventBus from "@/libs/event-bus";
import MarkOfCain from "@/components/viewer/MarkOfCain.vue";
import {GameLine} from "@/types/gameline";
import {IW5Renown, IWerewolfW5Sheet, W5RenownKey} from "@/types/w5";
import RenownModal from "@/components/viewer/modals/leveling/RenownModal.vue";
import {M20Sphere, RequestLevelFn} from "@/types/m20";

@Component({
  methods: {},
  components: {
    RenownModal,
    MarkOfCain,
    NewSpecializationModal,
    ConfirmDeleteModal,
    Damage,
    Humanity,
    BloodPotencyModal, LevelButton, TipButton, Tab, Tabs, Squares, IconButton, Bullet, Avatar, Row, Col}
})
export default class ProfileView extends Vue {

  RenownKey = W5RenownKey;
  Sphere = M20Sphere;

  @State("editingCharacter")
  private editingCharacter!: ICharacter;

  @Ref("avatarUploader")
  private avatarUploader!: HTMLInputElement;

  @Ref("levelBloodPotencyModal")
  private levelBloodPotencyModal!: BloodPotencyModal;

  @Ref("levelRenownModal")
  private levelRenownModal!: RenownModal;

  @Ref("confirmDeleteModal")
  private confirmDeleteModal!: ConfirmDeleteModal;

  @Inject("request-m20-level")
  private requestLevel!: RequestLevelFn;

  private isEditName = false;
  private editName = "";

  LevelType = LevelType;

  mounted() {
    EventBus.$on("moc-granted", this.onMocGranted.bind(this));
  }

  destroyed() {
    EventBus.$off("moc-granted", this.onMocGranted.bind(this));
  }

  private onMocGranted() {
    this.$forceUpdate();
  }

  private saveChar(triggerSync: boolean = false) {
    CharacterStorage.saveCharacter(this.editingCharacter, triggerSync);
  }

  private levelRenown(renownKey: W5RenownKey) {
    if (!this.isWerewolf) {
      return;
    }
    this.levelRenownModal.showModal(this.editingCharacter as any as IWerewolfW5Sheet, renownKey);
  }

  private getBloodPotency(): IBloodPotencyData {
    return DataManager.selectedLanguage.bloodPotencyTable.find(x => x.value === this.editingCharacter.bloodPotency)!;
  }

  private onAvatarUpload(e: Event) {
    //@ts-ignore
    const file = (e.target as HTMLInputElement).files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent) => {
        this.editingCharacter.avatar = (e.target as FileReader).result as string;
        this.updateViewer();
        this.$forceUpdate();
      };
      reader.readAsDataURL(file);
    }
  }

  private changeAvatar(e: MouseEvent) {
    if (e.shiftKey) {
      this.avatarUploader.click();
    }
  }

  private decreaseBloodPotency() {
    this.confirmDeleteModal.showModal(this.$t('character.bloodpotency') + ' ' + this.editingCharacter.bloodPotency, () => {
      this.editingCharacter.bloodPotency--;
      CharacterStorage.saveCharacter(this.editingCharacter);
    });
  }

  private get gloryRenown(): number {
    return this.getRenownValue(W5RenownKey.Glory);
  }

  private set gloryRenown(value: number) {
    this.setRenownValue(W5RenownKey.Glory, value);
  }

  private get honorRenown(): number {
    return this.getRenownValue(W5RenownKey.Honor);
  }

  private set honorRenown(value: number) {
    this.setRenownValue(W5RenownKey.Honor, value);
  }

  private get wisdomRenown(): number {
    return this.getRenownValue(W5RenownKey.Wisdom);
  }

  private set wisdomRenown(value: number) {
    this.setRenownValue(W5RenownKey.Wisdom, value);
  }

  private getRenownValue(key: W5RenownKey): number {
    if (!this.editingCharacter || !this.isWerewolf) {
      return 0;
    }
    return (this.editingCharacter as any as IWerewolfW5Sheet).renown.find(x => x.key === key)?.value || 0;
  }

  private setRenownValue(key: W5RenownKey, value: number) {
    if (!this.editingCharacter || !this.isWerewolf) {
      return;
    }
    const renown = (this.editingCharacter as any as IWerewolfW5Sheet).renown.find(x => x.key === key);
    if (renown) {
      renown.value = value;
    } else {
      (this.editingCharacter as any as IWerewolfW5Sheet).renown.push({key, value});
    }
  }

  private get humanityMalus() {
    if (!this.isVampire) {
      return '';
    }

    const dices = getHumanInteractionMalus(this.editingCharacter);
    return dices === Number.MIN_SAFE_INTEGER ? '∞ (Wasail)' : dices;
  }

  private get mocActive() {
    if (!this.isVampire) {
      return false;
    }

    return !!this.editingCharacter?.hasCainsMark;
  }

  private get mocLevel() {
    if (!this.isVampire) {
      return 0;
    }

    if (!this.editingCharacter || !this.editingCharacter.hasCainsMark || !this.editingCharacter.cainsMarkLevel) {
      return 0;
    }

    return this.editingCharacter.cainsMarkLevel;
  }

  private get mocPath(): 'black'|'red'|'none' {
    if (!this.isVampire) {
      return 'none';
    }

    if (!this.editingCharacter || !this.editingCharacter.hasCainsMark || !this.editingCharacter.cainsMarkLevel) {
      return 'none';
    }

    if (this.editingCharacter.cainsMarkLevel < 0) {
      return 'red';
    }

    return 'black';
  }

  private get totalRenown() {
    return (this.editingCharacter as any).renown.reduce((sum: any, r: IW5Renown) => sum + r.value, 0);
  }

  private get isVampire() {
    return this.editingCharacter?.game === GameLine.Vampire || !this.editingCharacter?.game;
  }

  private get isWerewolf() {
    return this.editingCharacter?.game === GameLine.Werewolf;
  }

  private get isMage() {
    return this.editingCharacter?.game === GameLine.Mage;
  }

  private get isHunter() {
    return this.editingCharacter?.game === GameLine.Hunter;
  }

  @Inject("update-viewer")
  private updateViewer!: () => void;

  @Inject("show-tip")
  private showTip!: (content: any, title?: any) => void;
}
</script>

<style scoped lang="scss">
.profile-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .meta {
    padding: 2rem;
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 2rem;

    .info {
      display: flex;
      flex-direction: column;

      .name {
        display: flex;
        align-items: center;
        font-size: 1.8rem;
        font-weight: bold;
      }

      .side {
        font-size: 1.5rem;
        font-weight: normal;
        color: #9f9f9f;
      }
    }

    .middle-meta {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .stats {
      flex-shrink: 0;
      display: flex;
      gap: 1rem;
      flex-direction: column;

      .row {
        display: flex;
        flex-direction: row;
        gap: 2rem;

        .stat {
          display: flex;
          flex-direction: column;
          width: 15rem;
        }
      }
    }
  }

  .simple {
    padding: 2rem;
    display: flex;
    gap: 3rem;
    flex-wrap: wrap;
    .column {
      width: calc((100% - 9rem) / 4);
      display: flex;
      flex-direction: column;
      textarea {
        resize: vertical;
        min-height: 20rem;
      }
    }
  }
}
</style>
