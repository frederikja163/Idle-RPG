import React, {type FC, useMemo} from "react";
import {ProgressBar} from "@/front-end/components/ui/progress-bar.tsx";
import {Column} from "@/front-end/components/layout/column.tsx";
import {Typography} from "@/front-end/components/ui/typography.tsx";
import type {SkillDto} from "@/shared/socket/socket.types.ts";
import {xpToReachNext} from "@/shared/util/util.skills.ts";

interface Props {
  skill: SkillDto;
}

export const SkillButton: FC<Props> = React.memo((props) => {
  const {skill} = props;

  const targetXp = useMemo(() => xpToReachNext(skill.level + 1), [skill.level]);

  return (
    <Column className="mt-2">
      <Typography>
        {skill.level}
      </Typography>
      <ProgressBar value={skill.xp} max={targetXp}/>
      <Typography className="text-xs text-muted-foreground">
        {`${skill.xp} / ${targetXp} XP`}
      </Typography>
    </Column>
  );
});
