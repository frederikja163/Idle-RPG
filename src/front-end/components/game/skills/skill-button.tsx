import React, {type FC} from "react";
import {ProgressBar} from "@/front-end/components/ui/progress-bar.tsx";
import {Column} from "@/front-end/components/layout/column.tsx";
import {Typography} from "@/front-end/components/ui/typography.tsx";

interface Props {
  skillId: string;
}

export const SkillButton: FC<Props> = React.memo((props) => {
  const {skillId} = props;

  return (
    <Column className="mt-2">
      <ProgressBar value={50}/>
      <Typography className="text-xs text-muted-foreground">
        {"50 / 100 XP"}
      </Typography>
    </Column>
  );
});
