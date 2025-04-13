import db from "@/lib/db"; // 既存のデータベース接続設定

export default async function handler(req, res) {
  try {
    // engagement_survey_responses と survey_questions を JOIN して取得
    const results = await db.query(`
      SELECT 
        r.id, 
        r.department_id, 
        r.survey_question_id, 
        q.issue_category, 
        q.question_text, 
        r.actual_value, 
        r.expected_value 
      FROM engagement_survey_responses r
      JOIN survey_questions q ON r.survey_question_id = q.id
    `);

    res.status(200).json(results);
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}