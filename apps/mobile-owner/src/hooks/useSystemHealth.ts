import { useQuery } from '@tanstack/react-query';
import { systemApi } from '../api/system.api';
import { QUERY_KEYS } from '../config/queryKeys';
import { HEALTH_REFETCH_INTERVAL } from '../config/constants';

export function useSystemHealth() {
  const health = useQuery({
    queryKey: QUERY_KEYS.system.health(),
    queryFn: () => systemApi.getHealth(),
    refetchInterval: HEALTH_REFETCH_INTERVAL,
  });

  const syncStatus = useQuery({
    queryKey: QUERY_KEYS.system.syncStatus(),
    queryFn: () => systemApi.getSyncStatus(),
    refetchInterval: HEALTH_REFETCH_INTERVAL,
  });

  const errors = useQuery({
    queryKey: QUERY_KEYS.system.errors(),
    queryFn: () => systemApi.getErrors({ limit: 20 }),
    refetchInterval: HEALTH_REFETCH_INTERVAL,
  });

  return { health, syncStatus, errors };
}
