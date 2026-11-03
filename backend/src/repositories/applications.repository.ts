import type { Db } from "../db/database.ts";
import type { ApplicationDbo } from "../models/application.ts";

interface FindApplicationParams {
  id: number;
  studentId: number;
}

interface CreateApplicationParams {
  offerId: number;
  studentId: number;
  message: string | null;
}

interface FindStudentOfferParams {
  offerId: number;
  studentId: number;
}

const APPLICATION_SELECT = `
  SELECT a.id, a.offer_id, o.title AS offer_title,
         c.short_name AS company_short_name, ay.label AS academic_year_label,
         p.code AS period_code, a.student_id, a.message, a.status, a.applied_at
  FROM applications a
  JOIN offers o ON o.id = a.offer_id
  JOIN companies c ON c.id = o.company_id
  JOIN academic_years ay ON ay.id = o.academic_year_id
  JOIN periods p ON p.id = o.period_id
`;

export const createApplicationsRepository = (db: Db) => {
  const findAllForStudent = db.prepare<{ studentId: number }, ApplicationDbo>(`
    ${APPLICATION_SELECT}
    WHERE a.student_id = @studentId
    ORDER BY a.applied_at DESC, a.id DESC
  `);
  const findByIdForStudent = db.prepare<FindApplicationParams, ApplicationDbo>(`
    ${APPLICATION_SELECT}
    WHERE a.id = @id AND a.student_id = @studentId
  `);
  const findOfferStatus = db.prepare<{ offerId: number }, { status: string }>(
    "SELECT status FROM offers WHERE id = @offerId",
  );
  const findForStudentOffer = db.prepare<FindStudentOfferParams>(
    "SELECT 1 FROM applications WHERE offer_id = @offerId AND student_id = @studentId",
  );
  const insertApplication = db.prepare<CreateApplicationParams>(`
    INSERT INTO applications (offer_id, student_id, message)
    VALUES (@offerId, @studentId, @message)
  `);
  const markWithdrawn = db.prepare<FindApplicationParams>(`
    UPDATE applications SET status = 'WITHDRAWN'
    WHERE id = @id AND student_id = @studentId AND status = 'IN_PROGRESS'
  `);

  return {
    findAllForStudent: (studentId: number): ApplicationDbo[] =>
      findAllForStudent.all({ studentId }),
    findByIdForStudent: (id: number, studentId: number): ApplicationDbo | undefined =>
      findByIdForStudent.get({ id, studentId }),
    findOfferStatus: (offerId: number): string | undefined =>
      findOfferStatus.get({ offerId })?.status,
    hasApplicationForOffer: (offerId: number, studentId: number): boolean =>
      findForStudentOffer.get({ offerId, studentId }) !== undefined,
    create: (offerId: number, studentId: number, message: string | null): number =>
      Number(insertApplication.run({ offerId, studentId, message }).lastInsertRowid),
    markWithdrawn: (id: number, studentId: number): boolean =>
      markWithdrawn.run({ id, studentId }).changes === 1,
  };
};

export type ApplicationsRepository = ReturnType<typeof createApplicationsRepository>;
