import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser, logout, ME_KEYS } from '@/api/me';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ME_KEYS.user,
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(ME_KEYS.user, null);
      queryClient.removeQueries({ queryKey: ME_KEYS.membership });
    },
  });
};
