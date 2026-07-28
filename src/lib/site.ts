// 站台公開設定（可安全暴露於前端，不含任何機密）
// 需要時可用環境變數覆寫，不必改程式碼。

// 萌點 官方 LINE
export const LINE_URL = process.env.NEXT_PUBLIC_LINE_URL || "https://line.me/ti/p/_GL-WZNcN_";

// 萌點 Facebook 粉絲頁（萌點3d列印 CutePoint 3D）
export const FACEBOOK_URL =
  process.env.NEXT_PUBLIC_FACEBOOK_URL ||
  "https://www.facebook.com/profile.php?id=61589632650654";
