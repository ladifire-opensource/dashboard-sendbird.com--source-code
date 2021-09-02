import { useShallowEqualSelector } from '@hooks';

const useProjectIdAndRegion = () =>
  useShallowEqualSelector((state) => ({
    pid: state.desk.project.pid,
    region: state.applicationState.data?.region ?? '',
  }));

export default useProjectIdAndRegion;
