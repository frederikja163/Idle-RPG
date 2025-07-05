// import React, { createContext, type FC, useCallback } from 'react';
// import type { ProviderProps } from '@/front-end/types/provider-types.ts';
// import type { Profile } from '@/shared/definition/schema/types/types-profiles.ts';
//
// interface IProgressContext {
//   startProgress: () => void;
// }
//
// const initialState: IProgressContext = {
//   startProgress: () => {},
// };
//
// const ProgressContext = createContext(initialState);
//
// export const ProgressProvider: FC<ProviderProps> = React.memo(function ProgressProvider(props) {
//   const { children } = props;
//
//   const startProgress = useCallback((profile: Profile) => {
//     setTimeout(() => {
//       if (profile && profile.activityId && profile.activityStart) {
//         console.log('👺');
//         startActivity(profile.activityId, profile.activityStart);
//       }
//     }, 100);
//   }, []);
//
//   return <ProgressContext.Provider value={{ startProgress }}>{children}</ProgressContext.Provider>;
// });
