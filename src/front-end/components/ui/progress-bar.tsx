import {Progress} from "radix-ui";
import React, {type FC, useMemo} from "react";

interface Props {
  value: number;
  max: number;
  width?: string;
  height?: string;
}

export const ProgressBar: FC<Props> = React.memo((props) => {
  const {value, max, width, height} = props;

  const rootStyle = useMemo(() => {
    return {
      width: width ?? "100%",
      height: height ?? "1rem",
    };
  }, [width, height]);

  const indicatorStyle = useMemo(() => {
    return {
      transition: "transform 660ms cubic-bezier(0.65, 0, 0.35, 1)",
      transform: `translateX(-${max - value}%)`,
    };
  }, [value, max]);

  return (
    <Progress.Root
      value={value}
      max={max}
      className="overflow-hidden rounded-full translate-z-0 bg-white h-6"
      style={rootStyle}
    >
      <Progress.Indicator
        className="bg-primary w-full h-full"
        style={indicatorStyle}
      />
    </Progress.Root>
  );
});
