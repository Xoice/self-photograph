import { useMutation } from '@tanstack/react-query';
import { submitWorkshopEnrollment } from '@/api/leads';
import type { WorkshopEnrollmentPayload } from '@/types/api';

export function useSubmitEnrollment() {
  return useMutation({
    mutationFn: (payload: WorkshopEnrollmentPayload) => submitWorkshopEnrollment(payload),
  });
}
