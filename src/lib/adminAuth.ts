// 後台密碼驗證：請在 Vercel 專案設定環境變數 ADMIN_PASSWORD
// 尚未設定密碼時不啟用保護（方便本機開發）
export function isAuthed(request: Request): boolean {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return true;
  return request.headers.get("x-admin-key") === pwd;
}
