 /**
 * 从未知错误中安全提取 message，供 catch (err: unknown) 使用。
 * 优先读取 ApiError/Error 的 message，其次是字符串，最后回退到默认值。
 */
export function getErrorMessage(err: unknown, fallback = '操作失败'): string {
  if (err instanceof Error) return err.message || fallback;
  if (typeof err === 'string') return err || fallback;
  if (err && typeof err === 'object' && 'message' in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
}
