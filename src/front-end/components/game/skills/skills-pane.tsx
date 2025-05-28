import React, { type FC, Suspense, useCallback, useEffect, useMemo } from 'react';
import { SideTabPane, type Tab } from '@/front-end/components/ui/side-tab-pane/side-tab-pane.tsx';
import { ActivitiesGrid } from '@/front-end/components/game/skills/activities-grid.tsx';
import { useAtom, useSetAtom } from 'jotai';
import { activeActivityAtom, profileItemsAtom, profileSkillsAtom } from '@/front-end/state/atoms.tsx';
import { useSocket } from '@/front-end/state/socket-provider.tsx';
import { SkillButton } from './skill-button';
import { skills as skillDefinitions } from '@/shared/definition/definition-skills.ts';
import type { Skill, SkillId } from '@/shared/definition/schema/types/types-skills.ts';
import { mergeItems, mergeSkills } from '@/front-end/lib/utils.ts';
import { activities, type ActivityDef } from '@/shared/definition/definition-activities.ts';
import type { Timeout } from 'react-number-format/types/types';
import type { Item, ItemId } from '@/shared/definition/schema/types/types-items.ts';
import {
  proccessGatheringActivity,
  processProcessingActivity,
  type ProfileInterface,
} from '@/shared/util/util-activities.ts';

class FrontEndProfile implements ProfileInterface {
  public allItems: Item[] = [];
  public allSkills: Skill[] = [];

  private profileSkills?: Map<SkillId, Skill>;
  private profileItems?: Map<ItemId, Item>;

  getItem(itemId: ItemId): Item {
    const item = this.profileItems?.get(itemId) ?? {
      itemId,
      count: 0,
      index: -1,
      profileId: '',
    };

    this.allItems.push(item);

    return item;
  }

  getSkill(skillId: SkillId): Skill {
    const skill = this.profileSkills?.get(skillId) ?? {
      skillId,
      xp: 0,
      level: 0,
      profileId: '',
    };

    this.allSkills.push(skill);

    return skill;
  }

  beginProcessing(profileSkills: Map<SkillId, Skill>, profileItems: Map<ItemId, Item>) {
    this.profileSkills = profileSkills;
    this.profileItems = profileItems;

    this.allItems = [];
    this.allSkills = [];
  }

  endProcessing(setProfileItems: (item: Item) => void, setProfileSkills: (skill: Skill) => void) {
    for (const item of this.allItems) {
      setProfileItems(item);
    }

    for (const skill of this.allSkills) {
      setProfileSkills(skill);
    }
    console.log(this.allSkills, this.allSkills);
  }
}

export const SkillsPane: FC = React.memo(function SkillsPane() {
  const socket = useSocket();
  const setActiveActivity = useSetAtom(activeActivityAtom);
  const [profileItems, setProfileItems] = useAtom(profileItemsAtom);
  const [profileSkills, setProfileSkills] = useAtom(profileSkillsAtom);

  const skillTabs = useMemo(
    () =>
      skillDefinitions
        .entries()
        .map(([id, skillDef], i) => {
          const profileSkill: Skill = profileSkills?.get(id) ?? {
            profileId: '',
            skillId: id,
            xp: 0,
            level: 0,
          };

          return {
            content: <ActivitiesGrid key={i} skill={profileSkill} />,
            buttonContent: <SkillButton key={i} name={skillDef.display} skill={profileSkill} />,
          } as Tab;
        })
        .toArray(),
    [profileSkills],
  );

  // const getSkill = useCallback(
  //   (skillId: SkillId) => {
  //     const skill = profileSkills.get(skillId)!;
  //     tempSkill = skill;
  //     return skill;
  //   },
  //   [profileSkills],
  // );
  // const getItem = useCallback((itemId: ItemId) => profileItems.get(itemId)!, [profileItems]);

  const processActivity = useCallback(
    async (activityDef: ActivityDef, activityStart: Date) => {
      const profile = new FrontEndProfile();
      profile.beginProcessing(profileSkills, profileItems);

      console.log('process yay');

      try {
        switch (activityDef.type) {
          case 'gathering':
            return await proccessGatheringActivity(activityStart, new Date(), activityDef, profile);

          case 'processing':
            return await processProcessingActivity(activityStart, new Date(), activityDef, profile);
        }
      } finally {
        setProfileItems(mergeItems(profile.allItems));
        setProfileSkills(mergeSkills(profile.allSkills));
        profile.allItems = [];
        profile.allSkills = [];
        // profile.endProcessing(
        //   (item) => setProfileItems((profileItems) => profileItems.set(item.itemId, item)),
        //   (skill) => setProfileSkills((profileSkills) => profileSkills.set(skill.skillId, skill)),
        // );
      }
    },
    [profileItems, profileSkills, setProfileItems, setProfileSkills],
  );

  useEffect(() => {
    if (!socket) return;

    let actionTimeoutId: Timeout;
    let actionIntervalId: Timeout;

    socket.send('Skill/GetSkills', {});
    socket.send('Activity/GetActivity', {});

    socket.on('Activity/ActivityStarted', (_, data) => {
      setActiveActivity(data);

      const activityDef = activities.get(data.activityId);
      if (activityDef == null) return;

      const activityActionTime = activityDef.time;
      const msUntilActionDone =
        activityActionTime - ((new Date().getTime() - data.activityStart.getTime()) % activityActionTime);

      actionTimeoutId = setTimeout(() => {
        processActivity(activityDef, data.activityStart);

        actionIntervalId = setInterval(() => {
          processActivity(activityDef, data.activityStart);
          console.log('Interval 🕹️');
        }, activityActionTime);
      }, msUntilActionDone);
    });

    socket.on('Activity/ActivityStopped', (_, data) => {
      setActiveActivity(undefined);

      setProfileSkills(mergeSkills(data.skills));
      setProfileItems(mergeItems(data.items));
    });

    socket.on('Activity/NoActivity', () => setActiveActivity(undefined));

    socket.on('Skill/UpdateSkills', (_, data) => setProfileSkills(mergeSkills(data.skills)));

    return () => {
      clearTimeout(actionTimeoutId);
      clearInterval(actionIntervalId);
    };
  }, [setActiveActivity, setProfileItems, setProfileSkills, socket]);

  if (!skillTabs) return;

  return (
    <Suspense fallback="🔃">
      <SideTabPane title="Skills" tabs={skillTabs} />
    </Suspense>
  );
});
