import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteAccount, getCurrentUser, logout, ME_KEYS } from '@/api/me';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ME_KEYS.user,
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5,
  });
};

const useEndSession = (endSession: () => Promise<void>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: endSession,
    onSuccess: () => {
      queryClient.setQueryData(ME_KEYS.user, null);
      queryClient.removeQueries({ queryKey: ME_KEYS.membership });
    },
  });
};

export const useLogout = () => useEndSession(logout);

export const useDeleteAccount = () => useEndSession(deleteAccount);
