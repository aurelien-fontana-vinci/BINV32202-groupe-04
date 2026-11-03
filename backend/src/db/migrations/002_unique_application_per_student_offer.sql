CREATE UNIQUE INDEX applications_one_per_student_offer
  ON applications (offer_id, student_id);
