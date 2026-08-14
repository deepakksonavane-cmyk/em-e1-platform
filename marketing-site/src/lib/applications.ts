import { appendRecord, generateId, listRecords, updateCollection } from "@/lib/storage";
import { ApplicationInput } from "@/lib/validations";

const FILE = "applications.json";

export interface ApplicationRecord extends ApplicationInput {
  id: string;
  applicationId: string;
  submittedAt: string;
  status: "submitted" | "payment_pending" | "payment_complete";
  paymentOrderId?: string;
  paymentId?: string;
  paidAt?: string;
  amountPaidInr?: number;
}

export async function saveApplication(
  input: ApplicationInput
): Promise<ApplicationRecord> {
  const id = generateId("APP");
  const record: ApplicationRecord = {
    ...input,
    id,
    applicationId: id,
    submittedAt: new Date().toISOString(),
    status: "payment_pending",
  };
  await appendRecord<ApplicationRecord>(FILE, record);
  return record;
}

export async function findApplication(
  applicationId: string
): Promise<ApplicationRecord | undefined> {
  const records = await listRecords<ApplicationRecord>(FILE);
  return records.find((r) => r.applicationId === applicationId);
}

export async function markApplicationPaid(
  applicationId: string,
  paymentOrderId: string,
  paymentId: string,
  amountPaidInr: number
): Promise<ApplicationRecord | undefined> {
  let updated: ApplicationRecord | undefined;

  await updateCollection<ApplicationRecord>(FILE, (records) =>
    records.map((record) => {
      if (record.applicationId !== applicationId) return record;
      updated = {
        ...record,
        status: "payment_complete",
        paymentOrderId,
        paymentId,
        paidAt: new Date().toISOString(),
        amountPaidInr,
      };
      return updated;
    })
  );

  return updated;
}
