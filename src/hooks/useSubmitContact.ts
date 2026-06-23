import { useMutation } from '@tanstack/react-query';
import { submitContact } from '@/api/leads';
import type { ContactSubmissionPayload } from '@/types/api';

export function useSubmitContact() {
  return useMutation({
    mutationFn: (payload: ContactSubmissionPayload) => submitContact(payload),
  });
}
