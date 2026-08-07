import { useQuery } from "@tanstack/react-query";
import { useMe } from "@/hooks/useMe";
import {
  getNotificationPreferences,
  notificationPrefsQueryKey,
} from "../service/settings.service";

export function useNotificationPreferences() {
  const { data: me } = useMe();
  return useQuery({
    queryKey: notificationPrefsQueryKey,
    queryFn: () => getNotificationPreferences(me),
    enabled: Boolean(me),
  });
}
